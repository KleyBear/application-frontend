import { COffcanvas, COffcanvasHeader, COffcanvasBody, CButton } from '@coreui/react'

const SaleFormDrawer = ({ visible, onClose }) => {
  return (
    <COffcanvas
      visible={visible}
      onHide={onClose}
      placement="end"
      backdrop={true} // opcional: oscurece el fondo
      scroll={true} // permite scroll si el contenido es largo
    >
      <COffcanvasHeader closeButton>
        <h5 className="m-0">Formulario de Venta</h5>
      </COffcanvasHeader>
      <COffcanvasBody>
        {/* Aquí va tu formulario o inputs */}
        <p>Contenido del formulario...</p>
      </COffcanvasBody>
    </COffcanvas>
  )
}

export default SaleFormDrawer
