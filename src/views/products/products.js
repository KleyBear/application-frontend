import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CCardImage,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormLabel,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import useFetch from '../../hooks/useFetch'
import CIcon from '@coreui/icons-react'
import { cilOptions } from '@coreui/icons'

const Products = () => {
  const [categories, setCategories] = useState([])
  const navigate = useNavigate()
  const { data } = useFetch('http://localhost:4000/api/category')

  const [visibleCategoryAdd, setVisibleCategoryAdd] = useState(false)
  const [addCategoryFormData, setAddCategoryFormData] = useState({
    name: '',
    image: '',
  })

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [editFormData, setEditFormData] = useState({ name: '', image: '' })
  const [visibleEditModal, setVisibleEditModal] = useState(false)

  useEffect(() => {
  console.log('Datos recibidos:', data)
  if (data) {
    if (Array.isArray(data)) {
      setCategories(data)
    } else if (data.data && Array.isArray(data.data)) {
      setCategories(data.data)
    } else {
      console.error('La estructura de data no es válida:', data)
      setCategories([])
    }
  }
}, [data])


  const handleAddCategoryFormChange = (e) => {
    setAddCategoryFormData({
      ...addCategoryFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddCategory = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/category', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addCategoryFormData),
      })
      if (!response.ok) throw new Error('Error al agregar la categoría')
      const newCategory = await response.json()
      setCategories((prev) => [...prev, newCategory])
      alert('Categoría agregada correctamente')
      setVisibleCategoryAdd(false)
    } catch (error) {
      console.error(error)
      alert('Error agregando la categoría')
    }
  }

  const handleEditCategory = (category) => {
    setSelectedCategory(category)
    setEditFormData({ name: category.name, image: category.image })
    setVisibleEditModal(true)
  }

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/category/${selectedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })
      if (!response.ok) throw new Error('Error al actualizar la categoría')
      const updatedCategory = await response.json()
      const updatedCategories = categories.map((cat) =>
        cat.id === selectedCategory.id ? updatedCategory : cat,
      )
      setCategories(updatedCategories)
      setVisibleEditModal(false)
    } catch (error) {
      console.error(error)
      alert('Error actualizando la categoría')
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/category/${categoryId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Error al eliminar usuario')
      setCategories(categories.filter((cat) => cat.id !== categoryId))
    } catch (error) {
      console.error(error)
      alert('Error eliminando el usuario')
    }
  }

  return (
    <div>
      <CCard className="mb-4">
        <div>
          <CModal visible={visibleCategoryAdd} onClose={() => setVisibleCategoryAdd(false)}>
            <CModalHeader>
              <CModalTitle>Nueva Categoría</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm>
                <CFormLabel>Nombre de la Categoría</CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={addCategoryFormData.name}
                  onChange={handleAddCategoryFormChange}
                />
                <CFormLabel>Imagen</CFormLabel>
                <CFormInput
                  type="text"
                  name="image"
                  value={addCategoryFormData.image}
                  onChange={handleAddCategoryFormChange}
                />
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setVisibleCategoryAdd(false)}>
                Cerrar
              </CButton>
              <CButton color="primary" onClick={handleAddCategory}>
                Guardar Categoría
              </CButton>
            </CModalFooter>
          </CModal>

          <CModal visible={visibleEditModal} onClose={() => setVisibleEditModal(false)}>
            <CModalHeader>
              <CModalTitle>Editar Categoría</CModalTitle>
            </CModalHeader>
            <CModalBody>
              <CForm>
                <CFormLabel>Nombre de la Categoría</CFormLabel>
                <CFormInput
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
                <CFormLabel>Imagen</CFormLabel>
                <CFormInput
                  type="text"
                  name="image"
                  value={editFormData.image}
                  onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                />
              </CForm>
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" onClick={() => setVisibleEditModal(false)}>
                Cancelar
              </CButton>
              <CButton color="primary" onClick={handleUpdate}>
                Guardar cambios
              </CButton>
            </CModalFooter>
          </CModal>
        </div>

        <CCardHeader>
          <CButton
            color="success"
            className="float-end p-2 ms-2"
            onClick={() => setVisibleCategoryAdd(true)}
          >
            Add Category
          </CButton>
        </CCardHeader>

        <CCardBody>
          <CRow>
            {Array.isArray(categories) &&
              categories.map((category) => (
                <CCol sm="6" md="4" lg="3" key={category.id} className="mb-4">
                  <CCard>
                    <div style={{ position: 'relative' }}>
                      <CCardImage
                        orientation="top"
                        src={category.image || 'https://via.placeholder.com/150'}
                        alt={category.name}
                      />
                      <div style={{ position: 'absolute', top: '5px', right: '5px', zIndex: 10 }}>
                        <CDropdown>
                          <CDropdownToggle color="link" size="sm" caret={false}>
                            <CIcon icon={cilOptions} />
                          </CDropdownToggle>
                          <CDropdownMenu>
                            <CDropdownItem onClick={() => handleEditCategory(category)}>Editar</CDropdownItem>
                            <CDropdownItem onClick={() => handleDeleteCategory(category.id)}>Eliminar</CDropdownItem>
                          </CDropdownMenu>
                        </CDropdown>
                      </div>
                    </div>
                    <CCardHeader>{category.name}</CCardHeader>
                    <CCardBody>
                      <CButton
                        color="primary"
                        onClick={() =>
                          navigate(`/products/api/category/${category.id}/${category.name}`)
                        }
                      >
                        Ver detalles
                      </CButton>
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
          </CRow>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default Products
