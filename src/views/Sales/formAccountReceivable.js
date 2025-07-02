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

const FormAccountReceivable = ({ visible, onClose, onSave }) => {
  const [expirationDays, setExpirationDays] = useState(7)
  const [amountPaid, setAmountPaid] = useState(0.01)

  const handleSave = () => {
    const today = new Date()
    const expirationDate = new Date()
    expirationDate.setDate(today.getDate() + expirationDays)

    const data = {
      expiration_date: expirationDate.toISOString().split('T')[0],
      amount_paid: parseFloat(amountPaid),
      payment_date: today.toISOString().split('T')[0],
    }

    onSave(data)
    onClose()
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
                <CFormCheck
                  type="radio"
                  name="expiration"
                  label="7 días"
                  value={7}
                  checked={expirationDays === 7}
                  onChange={() => setExpirationDays(7)}
                />
                <CFormCheck
                  type="radio"
                  name="expiration"
                  label="15 días"
                  value={15}
                  checked={expirationDays === 15}
                  onChange={() => setExpirationDays(15)}
                />
                <CFormCheck
                  type="radio"
                  name="expiration"
                  label="30 días"
                  value={30}
                  checked={expirationDays === 30}
                  onChange={() => setExpirationDays(30)}
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
        <CButton color="primary" onClick={handleSave}>
          Guardar
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default FormAccountReceivable
