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

const PaymentMethodEnum = {
  CASH: 'cash',
  TRANSFER: 'transfer',
  CARD: 'card',
}

const paymentMethodLabels = {
  [PaymentMethodEnum.CASH]: { label: 'Efectivo 💵', color: 'text-success' },
  [PaymentMethodEnum.TRANSFER]: { label: 'Transferencia 🏦', color: 'text-primary' },
  [PaymentMethodEnum.CARD]: { label: 'Tarjeta 🧾', color: 'text-danger' },
}

const SalesHistory = () => {
  const [salesWithDetails, setSalesWithDetails] = useState([])
  const [filteredSales, setFilteredSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeKey, setActiveKey] = useState(null)

  const [filterStatus, setFilterStatus] = useState(null)
  const [filterUserRole, setFilterUserRole] = useState(null)
  const [filterUserName, setFilterUserName] = useState('')
  const [filterCategory, setFilterCategory] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const [categories, setCategories] = useState([])
  const [roles, setRoles] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [saleRes, detailRes, productRes, userRes, categoryRes, roleRes] = await Promise.all([
          fetch('http://localhost:8000/sale'),
          fetch('http://localhost:8000/sale_detail'),
          fetch('http://localhost:8000/product'),
          fetch('http://localhost:8000/user'),
          fetch('http://localhost:8000/category'),
          fetch('http://localhost:8000/role'),
        ])

        const [sales, details, products, users, categoriesData, rolesData] = await Promise.all([
          saleRes.json(),
          detailRes.json(),
          productRes.json(),
          userRes.json(),
          categoryRes.json(),
          roleRes.json(),
        ])

        const combined = sales.map((sale) => {
          const relatedDetails = details
            .filter((d) => d.id_sale === sale.id_sale)
            .map((d) => {
              const product = products.find((p) => p.id === d.id_product)
              return {
                ...d,
                product,
              }
            })

          const user = users.find((u) => u.id === sale.id_user)
          const role = user ? rolesData.find((r) => r.id_role === user.id_role) : null

          return {
            ...sale,
            details: relatedDetails,
            user,
            userRole: role,
          }
        })

        setSalesWithDetails(combined)
        setFilteredSales(combined)
        setCategories(categoriesData)
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

    if (filterCategory) {
      filtered = filtered.filter((sale) =>
        sale.details.some((detail) => detail.product?.id_category === filterCategory),
      )
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
  }, [
    filterStatus,
    filterUserRole,
    filterUserName,
    filterCategory,
    dateFrom,
    dateTo,
    salesWithDetails,
  ])

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
        <CRow className="align-items-center g-2">{/* ... filtros ... */}</CRow>
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
              const isActive = activeKey === sale.id_sale
              const payment = paymentMethodLabels[sale.payment_method?.toLowerCase()] || null
              return (
                <CAccordionItem
                  key={sale.id_sale}
                  itemKey={sale.id_sale}
                  onClick={() => handleToggle(sale.id_sale)}
                  style={{
                    borderRadius: '12px',
                    marginBottom: '10px',
                    boxShadow: isActive ? '0 0 15px rgba(141, 101, 252, 0.4)' : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <CAccordionHeader
                    style={{
                      borderRadius: '12px 12px 0 0',
                      padding: '1rem',
                    }}
                  >
                    <div className="d-flex flex-column">
                      <small className={isActive ? 'text-dark' : 'text-white'}>
                        Fecha:{' '}
                        <span className={isActive ? 'text-dark' : 'text-white'}>
                          {new Date(sale.date).toLocaleString()}
                        </span>{' '}
                        — Estado:{' '}
                        <span
                          className={`badge ${
                            sale.status === 'COMPLETED'
                              ? 'bg-success-subtle text-success-emphasis'
                              : sale.status === 'PENDING'
                                ? 'bg-warning-subtle text-warning-emphasis'
                                : 'bg-secondary-subtle text-secondary-emphasis'
                          } ms-2`}
                          style={{ borderRadius: '8px', padding: '4px 8px', fontWeight: '500' }}
                        >
                          {sale.status}
                        </span>
                      </small>
                      <small className={isActive ? 'text-dark' : 'text-white'}>
                        Usuario: {sale.user?.user_name || 'Desconocido'} (
                        {sale.userRole?.name_role.toUpperCase() || 'N/A'})
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
                    <p>
                      <strong>Descripción:</strong> {sale.description || '-'}
                    </p>
                    <p>
                      <strong>Total:</strong> ${sale.total.toFixed(2)}{' '}
                      {sale.status === 'COMPLETED' && payment && (
                        <span
                          className={`ms-3 ${payment.color}`}
                          style={{ fontSize: '0.9rem', fontWeight: 'bold' }}
                        >
                          {payment.label}
                        </span>
                      )}
                    </p>
                    <hr />
                    <ul className="list-group">
                      {sale.details.map((detail) => (
                        <li
                          key={detail.id_sale_detail}
                          className="list-group-item d-flex justify-content-between"
                        >
                          <span>
                            {detail.amount} {detail.product?.description || 'Producto desconocido'}
                          </span>
                          <strong>${detail.subtotal.toFixed(2)}</strong>
                        </li>
                      ))}
                    </ul>
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

export default SalesHistory
