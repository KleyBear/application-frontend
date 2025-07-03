import React, { useState } from 'react'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormCheck,
} from '@coreui/react'

const ModalPayPayment = ({ visible, onClose, accountReceivableId, onPaymentSaved }) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [amountPaid, setAmountPaid] = useState(0.01)

  const handleSave = async (paymentData) => {
    try {
      // 1. Guardar nuevo pago
      const res = await fetch('http://localhost:8000/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })

      if (!res.ok) throw new Error('Error al guardar el pago')

      // 2. Obtener pagos existentes
      const paymentsRes = await fetch('http://localhost:8000/payment')
      const allPayments = await paymentsRes.json()

      const relatedPayments = allPayments.filter(
        (p) => p.id_accounts_receivable === paymentData.id_accounts_receivable,
      )

      const totalPaid = relatedPayments.reduce((sum, p) => sum + p.amount_paid, 0)

      // 3. Obtener cuenta por cobrar
      const accRes = await fetch(
        `http://localhost:8000/accounts_receivable/${paymentData.id_accounts_receivable}`,
      )
      const account = await accRes.json()

      // 4. Obtener venta asociada
      const saleRes = await fetch(`http://localhost:8000/sale/${account.id_sale}`)
      const sale = await saleRes.json()

      // 5. Si ya está pagado completo → actualizar venta
      if (totalPaid >= sale.total) {
        await fetch(`http://localhost:8000/sale/${sale.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'COMPLETED' }),
        })
      }

      // 6. Notificar al componente padre
      onPaymentSaved()
    } catch (error) {
      alert('Error al procesar el abono: ' + error.message)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" keyboard={false}>
      <CModalHeader>
        <CModalTitle>Registrar Abono</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CForm>
          <CAccordion alwaysOpen>
            <CAccordionItem itemKey={1}>
              <CAccordionHeader>Seleccionar Método de Pago</CAccordionHeader>
              <CAccordionBody>
                <CFormCheck
                  type="radio"
                  name="payment"
                  label="💵 CASH"
                  value="CASH"
                  checked={paymentMethod === 'CASH'}
                  onChange={() => setPaymentMethod('CASH')}
                />
                <CFormCheck
                  type="radio"
                  name="payment"
                  label="🏦 TRANSFER"
                  value="TRANSFER"
                  checked={paymentMethod === 'TRANSFER'}
                  onChange={() => setPaymentMethod('TRANSFER')}
                />
                <CFormCheck
                  type="radio"
                  name="payment"
                  label="💳 CARD"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                />
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
        <CButton
          color="primary"
          onClick={() =>
            handleSave({
              id_accounts_receivable: accountReceivableId,
              amount_paid: parseFloat(amountPaid),
              payment_method: paymentMethod,
              payment_date: new Date().toISOString().split('T')[0], // solo la fecha yyyy-mm-dd
            })
          }
        >
          Guardar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default ModalPayPayment
