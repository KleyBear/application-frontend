import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { CRow, CCol, CWidgetStatsA } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWallet, cilCart } from '@coreui/icons'
import useFetch from '../../hooks/useFetch'

const WidgetsDropdown = ({ className }) => {
  const { data: salesData } = useFetch('http://localhost:8000/sales')

  const [totalSales, setTotalSales] = useState(0)
  // Eliminamos gastos y balance basado en gastos
  // Balance = totalSales (porque no hay gastos)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    if (salesData && Array.isArray(salesData)) {
      const total = salesData.reduce((sum, sale) => sum + sale.total, 0)
      setTotalSales(total)
      setBalance(total) // balance = ventas totales
    }
  }, [salesData])

  return (
    <CRow className={className}>
      <CCol xs={12} md={6}>
        <CWidgetStatsA
          color="secondary"
          value={
            <>
              <CIcon icon={cilWallet} className="me-2" />
              <span style={{ color: '#7CFC00', fontWeight: 'bold' }}>${balance.toFixed(2)}</span>
            </>
          }
          title="Balance"
        />
      </CCol>
      <CCol xs={12} md={6}>
        <CWidgetStatsA
          color="secondary"
          value={
            <>
              <CIcon icon={cilCart} className="me-2" />
              <span style={{ color: '#7CFC00', fontWeight: 'bold' }}>
                ${totalSales.toFixed(2)}
              </span>{' '}
            </>
          }
          title="Ventas totales"
        />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
}

export default WidgetsDropdown
