import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormCheck,
  CFormInput,
} from '@coreui/react'

const FormAccountReceivable = ({ visible, onClose, sale }) => {
  const [expirationDays, setExpirationDays] = useState(7)
  const [amountPaid, setAmountPaid] = useState(0.01)

  const handleSave = async () => {
    const today = new Date()
    const expirationDate = new Date()
    expirationDate.setDate(today.getDate() + expirationDays)

    const expiration_date = expirationDate.toISOString().split('T')[0]
    const payment_date = today.toISOString().split('T')[0]
    const payment_method = sale.payment_method || 'Cash'

    try {
      // Paso 1: Guardar en accounts_receivable
      const resAccount = await fetch('http://localhost:8000/accounts_receivable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_sale: sale.id,
          expiration_date,
        }),
      })

      if (!resAccount.ok) throw new Error('Error al guardar cuenta por cobrar')

      const newAccount = await resAccount.json() // contiene { id, id_sale, expiration_date }

      // Paso 2: Guardar en payment usando el ID generado en accounts_receivable
      const resPayment = await fetch('http://localhost:8000/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_accounts_receivable: newAccount.id, // <-- este ID es clave
          amount_paid: parseFloat(amountPaid),
          payment_date,
          payment_method,
        }),
      })

      if (!resPayment.ok) throw new Error('Error al registrar el abono inicial')

      // Cierre del modal si todo va bien
      onClose()
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" keyboard={false}>
      <CModalHeader>
        <CModalTitle>Configurar Cuenta por Cobrar</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CAccordion alwaysOpen>
            <CAccordionItem itemKey={1}>
              <CAccordionHeader>Seleccionar Fecha de Expiración</CAccordionHeader>
              <CAccordionBody>
                {[7, 15, 30].map((days) => (
                  <CFormCheck
                    key={days}
                    type="radio"
                    name="expiration"
                    label={`${days} días`}
                    value={days}
                    checked={expirationDays === days}
                    onChange={() => setExpirationDays(days)}
                  />
                ))}
              </CAccordionBody>
            </CAccordionItem>
          </CAccordion>

          <CFormInput
            type="number"
            label="Monto Abonado"
            min={0.01}
            step={0.01}
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            className="mt-3"
          />
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton color="primary" onClick={handleSave}>
          Guardar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default FormAccountReceivable
