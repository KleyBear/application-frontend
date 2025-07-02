import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormInput,
  CRow,
  CCol,
} from '@coreui/react'

const AccountReceivable = () => {
  const [salesWithDetails, setSalesWithDetails] = useState([])
  const [filteredSales, setFilteredSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeKey, setActiveKey] = useState(null)

  // Filtros
  const [filterStatus, setFilterStatus] = useState('PENDING')
  const [filterUserRole, setFilterUserRole] = useState(null)
  const [filterUserName, setFilterUserName] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [roles, setRoles] = useState([])

  const PaymentMethodEnum = {
    CASH: 'CASH',
    TRANSFER: 'TRANSFER',
    CARD: 'CARD',
  }

  const paymentMethodLabels = {
    [PaymentMethodEnum.CASH]: { label: 'Efectivo 💵', color: 'text-success' },
    [PaymentMethodEnum.TRANSFER]: { label: 'Transferencia 🏦', color: 'text-primary' },
    [PaymentMethodEnum.CARD]: { label: 'Tarjeta 🧾', color: 'text-danger' },
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [saleRes, userRes, roleRes, accountRes, paymentRes] = await Promise.all([
          fetch('http://localhost:8000/sale'),
          fetch('http://localhost:8000/user'),
          fetch('http://localhost:8000/role'),
          fetch('http://localhost:8000/accounts_receivable'),
          fetch('http://localhost:8000/payment'),
        ])

        const [sales, users, rolesData, accounts, payments] = await Promise.all([
          saleRes.json(),
          userRes.json(),
          roleRes.json(),
          accountRes.json(),
          paymentRes.json(),
        ])

        const combined = sales.map((sale) => {
          const accountReceivable = accounts.find((acc) => acc.id_sale === sale.id)

          const relatedPayments = accountReceivable
            ? payments.filter(
                (p) => p.id_accounts_receivable === accountReceivable.id_accounts_receivable,
              )
            : []

          const paidAmount = relatedPayments.reduce((sum, p) => sum + p.amount_paid, 0)
          const pendingAmount = sale.total - paidAmount

          const updatedStatus = pendingAmount <= 0 ? 'COMPLETED' : sale.status

          const user = users.find((u) => u.id === sale.id_user)
          const role = user ? rolesData.find((r) => r.id_role === user.id_role) : null

          return {
            ...sale,
            status: updatedStatus,
            user,
            userRole: role,
            accountReceivable,
            relatedPayments,
            pendingAmount,
          }
        })

        setSalesWithDetails(combined)
        setFilteredSales(combined)
        setRoles(rolesData)
        setLoading(false)
      } catch (error) {
        console.error('Error cargando datos', error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    let filtered = [...salesWithDetails]

    if (filterStatus) {
      filtered = filtered.filter((sale) => sale.status === filterStatus)
    }

    if (filterUserName && filterUserName.trim() !== '') {
      const searchLower = filterUserName.toLowerCase()
      filtered = filtered.filter(
        (sale) =>
          sale.userRole?.name_role === filterUserRole &&
          sale.user?.user_name.toLowerCase().includes(searchLower),
      )
    } else if (filterUserRole) {
      filtered = filtered.filter((sale) => sale.userRole?.name_role === filterUserRole)
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filtered = filtered.filter((sale) => new Date(sale.date) >= fromDate)
    }

    if (dateTo) {
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((sale) => new Date(sale.date) <= toDate)
    }

    setFilteredSales(filtered)
  }, [filterStatus, filterUserRole, filterUserName, dateFrom, dateTo, salesWithDetails])

  const handleToggle = (key) => {
    setActiveKey(activeKey === key ? null : key)
  }

  const dropdownStyle = {
    background: 'linear-gradient(90deg, #D13FFF 0%, rgb(255, 77, 110) 100%)',
    border: 'none',
    color: 'white',
    borderRadius: '25px',
    padding: '6px 12px',
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CRow className="align-items-center g-2">
          {/* Estado */}
          <CCol xs="6" sm="3" md="2" lg="2" className="d-flex gap-2">
            <CDropdown style={{ flex: 1 }}>
              <CDropdownToggle style={dropdownStyle}>{filterStatus || 'Estado'}</CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => setFilterStatus(null)}>Todos</CDropdownItem>
                <CDropdownItem onClick={() => setFilterStatus('COMPLETED')}>
                  COMPLETED
                </CDropdownItem>
                <CDropdownItem onClick={() => setFilterStatus('PENDING')}>PENDING</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CCol>

          {/* Tipo de usuario + búsqueda nombre */}
          <CCol xs="12" sm="6" md="5" lg="4" className="d-flex align-items-center gap-2">
            <CDropdown style={{ width: '150px' }}>
              <CDropdownToggle style={dropdownStyle}>
                {filterUserRole || 'Realizada por'}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => setFilterUserRole(null)}>Todos</CDropdownItem>
                {roles.map((role) => (
                  <CDropdownItem
                    key={role.id_role}
                    onClick={() => setFilterUserRole(role.name_role)}
                  >
                    {role.name_role.toUpperCase()}
                  </CDropdownItem>
                ))}
              </CDropdownMenu>
            </CDropdown>
            <CFormInput
              type="text"
              placeholder="Buscar usuario"
              value={filterUserName}
              onChange={(e) => setFilterUserName(e.target.value)}
              style={{ flex: 1, borderRadius: '25px' }}
              disabled={!filterUserRole}
            />
          </CCol>

          {/* Fechas desde - hasta */}
          <CCol xs="6" sm="3" md="2" lg="2">
            <CFormInput
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Desde"
              max={dateTo || ''}
              style={{ textAlign: 'center' }}
            />
          </CCol>
          <CCol xs="6" sm="3" md="2" lg="2">
            <CFormInput
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Hasta"
              min={dateFrom || ''}
              style={{ textAlign: 'center' }}
            />
          </CCol>
        </CRow>
      </CCardHeader>

      <CCardBody>
        {loading ? (
          <CSpinner color="primary" />
        ) : (
          <CAccordion activeKey={activeKey}>
            {filteredSales.length === 0 && (
              <p className="text-center">No se encontraron ventas con esos filtros.</p>
            )}
            {filteredSales.map((sale) => {
              const isActive = activeKey === sale.id
              return (
                <CAccordionItem
                  key={sale.id}
                  itemKey={sale.id}
                  // No pasar onClick aquí para evitar que se pase a DOM nativo
                  style={{
                    borderRadius: '12px',
                    marginBottom: '10px',
                    boxShadow: isActive ? '0 0 15px rgba(141, 101, 252, 0.4)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CAccordionHeader
                    onClick={() => handleToggle(sale.id)}
                    style={{
                      borderRadius: '12px 12px 0 0',
                      padding: '1rem',
                    }}
                  >
                    <div className="d-flex flex-column">
                      <small className={isActive ? 'text-dark' : 'text-white'}>
                        Total: ${sale.total.toFixed(2)} — Vence:{' '}
                        {sale.accountReceivable?.expiration_date || 'N/A'}
                      </small>
                    </div>
                  </CAccordionHeader>
                  <CAccordionBody
                    style={{
                      borderTop: 'none',
                      borderRadius: '0 0 12px 12px',
                      padding: '1rem',
                    }}
                  >
                    <h6>Abonos realizados:</h6>
                    <ul className="list-group mb-3">
                      {sale.relatedPayments.length > 0 ? (
                        sale.relatedPayments.map((payment) => (
                          <li
                            key={payment.id_payment}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <span className={paymentMethodLabels[payment.payment_method]?.color}>
                              {paymentMethodLabels[payment.payment_method]?.label ||
                                payment.payment_method}
                            </span>
                            <span>
                              ${payment.amount_paid.toFixed(2)} — {payment.payment_date}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item text-muted">No se han realizado abonos.</li>
                      )}
                    </ul>

                    <p>
                      <strong>Monto pendiente:</strong>{' '}
                      <span className="text-danger">${sale.pendingAmount.toFixed(2)}</span>
                    </p>

                    <hr />

                    <p>
                      <strong>Total:</strong> ${sale.total.toFixed(2)}
                    </p>
                  </CAccordionBody>
                </CAccordionItem>
              )
            })}
          </CAccordion>
        )}
      </CCardBody>
    </CCard>
  )
}

export default AccountReceivable
