import React, { useState, useEffect } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CFormInput,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPhone, cilPlus, cilTrash, cilPencil } from '@coreui/icons'
import useFetch from '../../hooks/useFetch'

const Suppliers = () => {
  const { data: suppliers, loading, error } = useFetch('http://localhost:8000/supplier')
  const [localSuppliers, setLocalSuppliers] = useState([])
  const [products, setProducts] = useState([])

  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [showProductsModal, setShowProductsModal] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false)
  const [newSupplierName, setNewSupplierName] = useState('')
  const [newSupplierNumber, setNewSupplierNumber] = useState('')
  const [newSupplierProducts, setNewSupplierProducts] = useState([])

  const [showDeleteSupplierModal, setShowDeleteSupplierModal] = useState(false)
  // Cambié para que guarde ambos ids
  const [supplierToDelete, setSupplierToDelete] = useState(null)

  const [newProductsInModal, setNewProductsInModal] = useState([])

  useEffect(() => {
    if (suppliers) {
      setLocalSuppliers(suppliers)
    }
  }, [suppliers])

  useEffect(() => {
    fetch('http://localhost:8000/product')
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error('Error cargando productos', err))
  }, [])

  const supplierProducts = selectedSupplier
    ? products.filter((p) => p.id_supplier === selectedSupplier.id_suppliers)
    : []

  const handleShowProducts = (supplier) => {
    setSelectedSupplier(supplier)
    setShowProductsModal(true)
    setEditMode(false)
    setNewProductsInModal([])
  }

  const handleCostPriceChange = async (productId, newPrice) => {
    if (newPrice < 1) return
    try {
      await fetch(`http://localhost:8000/product/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cost_price: newPrice }),
      })
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, cost_price: newPrice } : p))
      )
    } catch (err) {
      console.error('Error actualizando precio costo', err)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return
    try {
      await fetch(`http://localhost:8000/product/${productId}`, { method: 'DELETE' })
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err) {
      console.error('Error eliminando producto', err)
    }
  }

  const handleAddNewProductRow = () => {
    if (!selectedSupplier) return
    setNewProductsInModal((prev) => [
      ...prev,
      { description: '', cost_price: 1, stock: 0, id_category: '', id_supplier: selectedSupplier.id_suppliers },
    ])
  }

  const handleChangeNewProductInModal = (index, field, value) => {
    setNewProductsInModal((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleDeleteNewProductInModal = (index) => {
    setNewProductsInModal((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveNewProductsInModal = async () => {
    try {
      for (const prod of newProductsInModal) {
        if (!prod.description.trim() || prod.cost_price < 1 || prod.stock < 0) {
          alert('Por favor, complete todos los campos correctamente antes de guardar.')
          return
        }
      }
      for (const prod of newProductsInModal) {
        const response = await fetch('http://localhost:8000/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prod),
        })
        const savedProduct = await response.json()
        setProducts((prev) => [...prev, savedProduct])
      }
      setNewProductsInModal([])
    } catch (error) {
      console.error('Error guardando nuevos productos:', error)
    }
  }

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim() || !newSupplierNumber.trim()) return

    try {
      const newIdSupplier = Date.now()

      const resSupplier = await fetch('http://localhost:8000/supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_suppliers: newIdSupplier,
          name: newSupplierName.trim(),
          number: newSupplierNumber.trim(),
        }),
      })
      const createdSupplier = await resSupplier.json()

      for (const prod of newSupplierProducts) {
        const productToSave = {
          ...prod,
          id_supplier: newIdSupplier,
        }
        await fetch('http://localhost:8000/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productToSave),
        })
      }

      // Recargar productos para que aparezcan en el modal al abrir
      await fetch('http://localhost:8000/product')
        .then((res) => res.json())
        .then(setProducts)

      setLocalSuppliers((prev) => [...prev, createdSupplier])

      setNewSupplierName('')
      setNewSupplierNumber('')
      setNewSupplierProducts([])
      setShowAddSupplierModal(false)
    } catch (err) {
      console.error('Error al añadir proveedor:', err)
    }
  }

  const handleAddNewProductToSupplier = () => {
    setNewSupplierProducts((prev) => [
      ...prev,
      { description: '', cost_price: 1, price_sale: 0, stock: 0, id_category: '' },
    ])
  }

  const handleChangeNewProduct = (index, field, value) => {
    setNewSupplierProducts((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleDeleteNewProduct = (index) => {
    setNewSupplierProducts((prev) => prev.filter((_, i) => i !== index))
  }

  // Ahora recibe el objeto completo y guarda ambos ids para manejar ambos casos
  const handleDeleteSupplier = (supplier) => {
    setSupplierToDelete({
      id_suppliers: supplier.id_suppliers,
      id: supplier.id,
    })
    setShowDeleteSupplierModal(true)
  }

  const confirmDeleteSupplier = async () => {
    try {
      // Prioriza eliminar por id (que es el que json-server maneja), si no existe, usa id_suppliers
      const idToDelete = supplierToDelete.id ?? supplierToDelete.id_suppliers

      await fetch(`http://localhost:8000/supplier/${idToDelete}`, {
        method: 'DELETE',
      })

      // Actualiza el estado local eliminando el proveedor con cualquiera de los dos ids
      setLocalSuppliers((prev) =>
        prev.filter(
          (s) => s.id !== idToDelete && s.id_suppliers !== idToDelete
        ),
      )
    } catch (err) {
      console.error('Error eliminando proveedor', err)
    } finally {
      setShowDeleteSupplierModal(false)
      setSupplierToDelete(null)
    }
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Proveedores</strong>
              <CButton color="success" size="sm" onClick={() => setShowAddSupplierModal(true)}
                style={{
                background: 'linear-gradient(90deg, #D13FFF 0%, #FF4D8D 100%)',
                border: 'none',
                color: 'white',
              }}>
                <CIcon icon={cilPlus} className="me-2" />
                Añadir proveedor
              </CButton>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div>Cargando proveedores...</div>
              ) : error ? (
                <div>Error al cargar proveedores.</div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Nombre del Proveedor</CTableHeaderCell>
                      <CTableHeaderCell>Teléfono</CTableHeaderCell>
                      <CTableHeaderCell>Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {localSuppliers.map((supplier) => (
                      <CTableRow key={supplier.id_suppliers || supplier.id}>
                        <CTableDataCell>{supplier.name}</CTableDataCell>
                        <CTableDataCell>
                          {supplier.number}{' '}
                          <CButton color="primary" size="sm" title="Llamar"
                           style={{
                            background: 'linear-gradient(90deg, #D13FFF 0%, rgb(80, 77, 255) 100%)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '25px',
                            padding: '6px 12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem',
                            marginRight: '10px',
                          }}>
                            <CIcon icon={cilPhone} />
                          </CButton>
                        </CTableDataCell>
                        <CTableDataCell className="d-flex gap-2">
                          <CButton
                            color="info"
                            size="sm"
                            onClick={() => handleShowProducts(supplier)}
                            style={{
                background: 'linear-gradient(90deg, #D13FFF 0%, #FF4D8D 100%)',
                border: 'none',
                color: 'white',
              }}
                          >
                            Products
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal Productos */}
      <CModal visible={showProductsModal} onClose={() => setShowProductsModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Products - {selectedSupplier?.name}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {supplierProducts.length === 0 && newProductsInModal.length === 0 && (
            <p>No hay productos relacionados para este proveedor.</p>
          )}

          {(supplierProducts.length > 0 || newProductsInModal.length > 0) && (
            <CTable responsive hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Producto</CTableHeaderCell>
                  <CTableHeaderCell>Precio Costo</CTableHeaderCell>
                  <CTableHeaderCell>Stock</CTableHeaderCell>
                  {editMode && <CTableHeaderCell>Acciones</CTableHeaderCell>}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {supplierProducts.map((product) => (
                  <CTableRow key={product.id}>
                    <CTableDataCell>{product.description}</CTableDataCell>
                    <CTableDataCell>
                      {editMode ? (
                        <CFormInput
                          type="number"
                          min="1"
                          value={product.cost_price}
                          onChange={(e) =>
                            handleCostPriceChange(product.id, Number(e.target.value))
                          }
                        />
                      ) : (
                        product.cost_price
                      )}
                    </CTableDataCell>
                    <CTableDataCell>{product.stock}</CTableDataCell>
                    {editMode && (
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="danger"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    )}
                  </CTableRow>
                ))}

                {/* Filas nuevas para añadir productos */}
                {editMode &&
                  newProductsInModal.map((prod, i) => (
                    <CTableRow key={'new-' + i}>
                      <CTableDataCell>
                        <CFormInput
                          placeholder="Descripción"
                          value={prod.description}
                          onChange={(e) => handleChangeNewProductInModal(i, 'description', e.target.value)}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          min="1"
                          value={prod.cost_price}
                          onChange={(e) =>
                            handleChangeNewProductInModal(i, 'cost_price', Number(e.target.value))
                          }
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="number"
                          min="0"
                          value={prod.stock}
                          onChange={(e) => handleChangeNewProductInModal(i, 'stock', Number(e.target.value))}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="danger"
                          onClick={() => handleDeleteNewProductInModal(i)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
              </CTableBody>
            </CTable>
          )}

          {editMode && (
            <div className="d-flex gap-2 mt-3">
              <CButton color="success" onClick={handleAddNewProductRow}
              style={{
                background: 'linear-gradient(90deg, #D13FFF 0%, #FF4D8D 100%)',
                border: 'none',
                color: 'white',
              }}>
                <CIcon icon={cilPlus} className="me-2" />
                Añadir producto
              </CButton>
              {newProductsInModal.length > 0 && (
                <CButton color="primary" onClick={handleSaveNewProductsInModal}>
                  Guardar nuevos productos
                </CButton>
              )}
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color={editMode ? 'secondary' : 'warning'}
            onClick={() => {
              setEditMode(!editMode)
              if (editMode) setNewProductsInModal([]) // Limpiar al cancelar edición
            }}
             style={{
                            background: 'linear-gradient(90deg, #D13FFF 0%, rgb(80, 77, 255) 100%)',
                            border: 'none',
                            color: 'white',
                            borderRadius: '25px',
                            padding: '6px 12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem',
                            marginRight: '10px',
                          }}
          >
            {editMode ? 'Cancelar edición' : 'Editar'}
            <CIcon icon={cilPencil} className="ms-1" />
          </CButton>
          <CButton color="secondary" onClick={() => setShowProductsModal(false)}>
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Añadir Proveedor */}
      <CModal visible={showAddSupplierModal} onClose={() => setShowAddSupplierModal(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Añadir Proveedor</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel>Nombre:</CFormLabel>
          <CFormInput
            value={newSupplierName}
            onChange={(e) => setNewSupplierName(e.target.value)}
            placeholder="Nombre del proveedor"
          />
          <CFormLabel className="mt-3">Teléfono:</CFormLabel>
          <CFormInput
            value={newSupplierNumber}
            onChange={(e) => setNewSupplierNumber(e.target.value)}
            placeholder="Teléfono"
          />

          <hr />

          <strong>Productos:</strong>
          {newSupplierProducts.length === 0 && <p>No hay productos añadidos.</p>}
          {newSupplierProducts.map((prod, i) => (
            <div key={i} className="d-flex gap-2 align-items-center mb-2">
              <CFormInput
                placeholder="Descripción"
                value={prod.description}
                onChange={(e) => handleChangeNewProduct(i, 'description', e.target.value)}
              />
              <CFormInput
                type="number"
                min="1"
                placeholder="Precio costo"
                value={prod.cost_price}
                onChange={(e) => handleChangeNewProduct(i, 'cost_price', Number(e.target.value))}
                style={{ maxWidth: '120px' }}
              />
              <CFormInput
                type="number"
                min="0"
                placeholder="Stock"
                value={prod.stock}
                onChange={(e) => handleChangeNewProduct(i, 'stock', Number(e.target.value))}
                style={{ maxWidth: '100px' }}
              />
              <CButton
                color="danger"
                size="sm"
                onClick={() => handleDeleteNewProduct(i)}
                title="Eliminar producto"
              >
                <CIcon icon={cilTrash} />
              </CButton>
            </div>
          ))}
          <CButton color="success" size="sm" onClick={handleAddNewProductToSupplier}>
            <CIcon icon={cilPlus} className="me-2" />
            Añadir producto
          </CButton>
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleAddSupplier}>
            Guardar proveedor
          </CButton>
          <CButton color="secondary" onClick={() => setShowAddSupplierModal(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal Confirmación Eliminar Proveedor */}
      <CModal
        visible={showDeleteSupplierModal}
        onClose={() => setShowDeleteSupplierModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <CModalHeader>
          <CModalTitle>Confirmar eliminación</CModalTitle>
        </CModalHeader>
        <CModalBody>¿Estás seguro de eliminar este proveedor?</CModalBody>
        <CModalFooter>
          <CButton color="danger" onClick={confirmDeleteSupplier}>
            Eliminar
          </CButton>
          <CButton color="secondary" onClick={() => setShowDeleteSupplierModal(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Suppliers
