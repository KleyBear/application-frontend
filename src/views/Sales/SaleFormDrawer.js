import React, { useState } from 'react'
import {
  COffcanvas,
  COffcanvasHeader,
  COffcanvasBody,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CListGroup,
  CListGroupItem,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CFormCheck,
} from '@coreui/react'
import FormAccountReceivable from 'src/views/Sales/formAccountReceivable.js'

const SaleFormDrawer = ({ visible, onClose, selectedProducts, setSelectedProducts }) => {
  const [status, setStatus] = useState('PENDING')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [showAccountReceivableModal, setShowAccountReceivableModal] = useState(false)
  const [savedSaleData, setSavedSaleData] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const handleQuantityChange = (index, newQty) => {
    const updated = [...selectedProducts]
    updated[index].amount = Math.max(1, parseInt(newQty) || 1)
    updated[index].subtotal = updated[index].amount * updated[index].price_sale
    setSelectedProducts(updated)
  }

  const total = selectedProducts.reduce((acc, p) => acc + p.subtotal, 0)

  const handleSave = async () => {
    setErrorMessage('')

    if (selectedProducts.length === 0) {
      setErrorMessage('No hay productos en el carrito.')
      return
    }

    const sale = {
      date: new Date().toISOString(),
      total,
      description,
      status,
      payment_method: paymentMethod,
      id_user: '5c35',
    }

    try {
      const saleResponse = await fetch('http://localhost:8000/sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      })

      if (!saleResponse.ok) throw new Error('Error al guardar la venta')

      const newSale = await saleResponse.json()

      for (const product of selectedProducts) {
        await fetch('http://localhost:8000/sale_detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: product.amount,
            subtotal: product.subtotal,
            id_product: product.id,
            id_sale: newSale.id,
          }),
        })
      }

      setSavedSaleData(newSale)
      if (status === 'PENDING') {
        setShowAccountReceivableModal(true)
      } else {
        resetForm()
        onClose()
      }
    } catch (error) {
      console.error('Error al guardar la venta:', error)
      setErrorMessage('Ocurrió un error al guardar la venta. Intente nuevamente.')
    }
  }

  const resetForm = () => {
    setSelectedProducts([])
    setDescription('')
    setStatus('PENDING')
    setPaymentMethod('Cash')
    setErrorMessage('')
  }

  const handleAccountReceivableSave = async (data) => {
    try {
      const res = await fetch('http://localhost:8000/accounts_receivable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_sale: savedSaleData.id,
          expiration_date: data.expiration_date,
        }),
      })

      if (!res.ok) throw new Error('Error al guardar la cuenta por cobrar')

      resetForm()
      setShowAccountReceivableModal(false)
      onClose()
    } catch (error) {
      console.error('Error al guardar la cuenta por cobrar:', error)
      setErrorMessage('No se pudo guardar la cuenta por cobrar.')
    }
  }

  return (
    <>
      <COffcanvas visible={visible} onHide={onClose} placement="end" backdrop scroll>
        <COffcanvasHeader closeButton>
          <h2 className="m-0">Crear Venta🛒</h2>
        </COffcanvasHeader>
        <COffcanvasBody>
          <CForm>
            {errorMessage && (
              <div className="text-danger fw-semibold mb-3">{errorMessage}</div>
            )}

            <CFormInput
              type="text"
              label="Descripción"
              placeholder="Detalles de la venta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mb-3"
            />

            <CAccordion alwaysOpen className="mb-3">
              <CAccordionItem itemKey={1}>
                <CAccordionHeader>Seleccionar Método de Pago</CAccordionHeader>
                <CAccordionBody>
                  <CFormCheck
                    type="radio"
                    name="payment"
                    label="💵CASH"
                    value="CASH"
                    checked={paymentMethod === 'CASH'}
                    onChange={() => setPaymentMethod('CASH')}
                  />
                  <CFormCheck
                    type="radio"
                    name="payment"
                    label="🏦TRANSFER"
                    value="TRANSFER"
                    checked={paymentMethod === 'TRANSFER'}
                    onChange={() => setPaymentMethod('TRANSFER')}
                  />
                  <CFormCheck
                    type="radio"
                    name="payment"
                    label="💳CARD"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                  />
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>

            <CFormSelect
              label="Estado"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mb-3"
              options={['PENDING', 'COMPLETED']}
            />

            <h6 className="mb-2">Productos Seleccionados</h6>
            <CListGroup className="mb-3">
              {selectedProducts.length === 0 && (
                <p className="text-muted">No hay productos seleccionados.</p>
              )}
              {selectedProducts.map((p, i) => (
                <CListGroupItem key={p.id}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {p.description} <br />
                      <small>${p.price_sale} x</small>
                    </div>
                    <div className="d-flex align-items-center">
                      <CFormInput
                        type="number"
                        value={p.amount}
                        onChange={(e) => handleQuantityChange(i, e.target.value)}
                        min={1}
                        style={{ width: '60px', marginRight: '10px' }}
                      />
                      <strong>${p.subtotal.toFixed(2)}</strong>
                    </div>
                  </div>
                </CListGroupItem>
              ))}
            </CListGroup>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <strong>Total:</strong>
              <span className="text-white fw-bold">${total.toFixed(2)}</span>
            </div>

            <CButton
              className="w-100"
              onClick={handleSave}
              disabled={selectedProducts.length === 0}
              style={{
                background: 'linear-gradient(90deg, #D13FFF 0%, #FF4D8D 100%)',
                border: 'none',
                color: 'white',
              }}
            >
              Guardar Venta
            </CButton>
          </CForm>
        </COffcanvasBody>
      </COffcanvas>

      <FormAccountReceivable
        visible={showAccountReceivableModal}
        onClose={() => setShowAccountReceivableModal(false)}
        onSave={handleAccountReceivableSave}
        sale={savedSaleData}
      />
    </>
  )
}

export default SaleFormDrawer
