import { useEffect, useState } from 'react'
import {
  CAvatar,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CContainer,
  CForm,
  CFormLabel,
  CButton,
  CFormSelect,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilPencil, cilTrash, cilCloudDownload, cilPlus } from '@coreui/icons'
import useFetch from '../../hooks/useFetch'

const Users = () => {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [visibleEdit, setVisibleEdit] = useState(false)
  const [visibleAdd, setVisibleAdd] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    id_rol: '',
  })

  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    id_rol: '',
    password: '',
  })

  const [errorMsg, setErrorMsg] = useState('')

  // Formatear fecha YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
  }

  // Traer usuarios (sin roles aparte)
  const { data, loading, error } = useFetch('http://localhost:4000/api/users')

  useEffect(() => {
    if (Array.isArray(data?.data)) {
      setUsers(data.data)
    }
  }, [data])

  useEffect(() => {
    if (Array.isArray(users)) {
      const filtered = users.filter((user) => {
        const name = user.name?.toLowerCase() || ''
        const email = user.email?.toLowerCase() || ''
        const phone = user.phone || ''
        return (
          name.includes(searchTerm) ||
          email.includes(searchTerm) ||
          phone.includes(searchTerm)
        )
      })
      setFilteredUsers(filtered)
    }
  }, [searchTerm, users])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase())
  }

  const getToken = () => localStorage.getItem('token')

  const handleDelete = async (userId) => {
    setErrorMsg('')
    try {
      const token = getToken()
      if (!token) {
        setErrorMsg('No autorizado para eliminar usuarios.')
        return
      }

      const response = await fetch(`http://localhost:4000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Error al eliminar usuario')
      setUsers(users.filter((user) => user.id !== userId))
    } catch (error) {
      console.error(error)
      setErrorMsg('Error eliminando el usuario')
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthdate: formatDate(user.birthdate),
      id_rol: user.id_rol ? String(user.id_rol) : '',
    })
    setErrorMsg('')
    setVisibleEdit(true)
  }

  const handleEditFormChange = (event) => {
    setEditFormData({ ...editFormData, [event.target.name]: event.target.value })
  }

  const handleUpdate = async () => {
    setErrorMsg('')
    // Validaciones básicas
    if (!editFormData.name || !editFormData.email) {
      setErrorMsg('Nombre y correo son obligatorios para actualizar.')
      return
    }
    try {
      const token = getToken()
      if (!token) {
        setErrorMsg('No autorizado para actualizar usuarios.')
        return
      }
      const response = await fetch(`http://localhost:4000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editFormData,
          id_rol: Number(editFormData.id_rol),
        }),
      })
      if (!response.ok) throw new Error('Error al actualizar el usuario')
      const result = await response.json()
      const updatedUser = result.data
      setUsers(users.map((user) => (user.id === selectedUser.id ? updatedUser : user)))
      setVisibleEdit(false)
      setSelectedUser(null)
    } catch (error) {
      console.error(error)
      setErrorMsg('Error actualizando el usuario')
    }
  }

  const handleAddFormChange = (event) => {
    setAddFormData({ ...addFormData, [event.target.name]: event.target.value })
  }

  const handleAdd = async () => {
    setErrorMsg('')
    // Validaciones básicas
    if (!addFormData.name || !addFormData.email || !addFormData.password) {
      setErrorMsg('Nombre, correo y contraseña son obligatorios.')
      return
    }
    try {
      const token = getToken()
      if (!token) {
        setErrorMsg('No autorizado para agregar usuarios.')
        return
      }
      const bodyToSend = {
        ...addFormData,
        id_rol: Number(addFormData.id_rol),
      }

      const response = await fetch('http://localhost:4000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyToSend),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Error del backend:', errorData)
        setErrorMsg('Error agregando el usuario')
        return
      }
      const result = await response.json()
      setUsers([...users, result.data])
      setVisibleAdd(false)
      setAddFormData({
        name: '',
        email: '',
        phone: '',
        birthdate: '',
        id_rol: '',
        password: '',
      })
    } catch (error) {
      console.error(error)
      setErrorMsg('Error agregando el usuario')
    }
  }

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CButton color="success" className="float-end" onClick={() => setVisibleAdd(true)}>
          <CIcon icon={cilPlus} /> <CIcon icon={cilPeople} className="ms-1 me-2" />
          Añadir usuario
        </CButton>
        <CButton color="primary" className="float-end me-2">
          <CIcon icon={cilCloudDownload} />
        </CButton>

        <CContainer fluid>
          <CForm className="d-flex" style={{ maxWidth: '300px' }} onSubmit={(e) => e.preventDefault()}>
            <CFormInput
              type="search"
              className="me-2"
              placeholder="Buscar"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <CButton type="submit" color="success" variant="outline">
              Buscar
            </CButton>
          </CForm>
        </CContainer>
      </CCardHeader>

      <CCardBody>
        {errorMsg && <CAlert color="danger">{errorMsg}</CAlert>}
        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead color="black">
            <CTableRow>
              <CTableHeaderCell className="text-center">
                <CIcon icon={cilPeople} />
              </CTableHeaderCell>
              <CTableHeaderCell>Usuario</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Teléfono</CTableHeaderCell>
              <CTableHeaderCell>Fecha Nac.</CTableHeaderCell>
              <CTableHeaderCell>Rol</CTableHeaderCell>
              <CTableHeaderCell>Acciones</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredUsers.map((user) => (
              <CTableRow key={user.id}>
                <CTableDataCell className="text-center">
                  <CAvatar size="md" src={`avatars/${user.id}.jpg`} />
                </CTableDataCell>
                <CTableDataCell>{user.name}</CTableDataCell>
                <CTableDataCell>{user.email}</CTableDataCell>
                <CTableDataCell>{user.phone}</CTableDataCell>
                <CTableDataCell>{formatDate(user.birthdate)}</CTableDataCell>
                <CTableDataCell>{user.rol?.name || 'Unknown Role'}</CTableDataCell>
                <CTableDataCell>
                  <CButton color="primary" size="sm" className="me-2" onClick={() => handleEdit(user)}>
                    <CIcon icon={cilPencil} />
                  </CButton>
                  <CButton color="danger" size="sm" onClick={() => handleDelete(user.id)}>
                    <CIcon icon={cilTrash} />
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>

      {/* Modal de edición */}
      <CModal visible={visibleEdit} onClose={() => setVisibleEdit(false)}>
        <CModalHeader>
          <CModalTitle>Editar Usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              name="name"
              value={editFormData.name}
              onChange={handleEditFormChange}
              required
            />
            <CFormLabel className="mt-2">Email</CFormLabel>
            <CFormInput
              type="email"
              name="email"
              value={editFormData.email}
              onChange={handleEditFormChange}
              required
            />
            <CFormLabel className="mt-2">Teléfono</CFormLabel>
            <CFormInput
              name="phone"
              value={editFormData.phone}
              onChange={handleEditFormChange}
            />
            <CFormLabel className="mt-2">Fecha de nacimiento</CFormLabel>
            <CFormInput
              type="date"
              name="birthdate"
              value={editFormData.birthdate}
              onChange={handleEditFormChange}
            />
            <CFormLabel className="mt-2">Rol</CFormLabel>
            <CFormSelect
              name="id_rol"
              value={editFormData.id_rol}
              onChange={handleEditFormChange}
            >
              <option value="">Seleccione un rol</option>
              <option value="1">Admin</option>
              <option value="2">Usuario</option>
              {/* Ajusta roles según los que manejes */}
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleEdit(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdate}>
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal de añadir */}
      <CModal visible={visibleAdd} onClose={() => setVisibleAdd(false)}>
        <CModalHeader>
          <CModalTitle>Añadir Usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              name="name"
              value={addFormData.name}
              onChange={handleAddFormChange}
              required
            />
            <CFormLabel className="mt-2">Email</CFormLabel>
            <CFormInput
              type="email"
              name="email"
              value={addFormData.email}
              onChange={handleAddFormChange}
              required
            />
            <CFormLabel className="mt-2">Contraseña</CFormLabel>
            <CFormInput
              type="password"
              name="password"
              value={addFormData.password}
              onChange={handleAddFormChange}
              required
            />
            <CFormLabel className="mt-2">Teléfono</CFormLabel>
            <CFormInput
              name="phone"
              value={addFormData.phone}
              onChange={handleAddFormChange}
            />
            <CFormLabel className="mt-2">Fecha de nacimiento</CFormLabel>
            <CFormInput
              type="date"
              name="birthdate"
              value={addFormData.birthdate}
              onChange={handleAddFormChange}
            />
            <CFormLabel className="mt-2">Rol</CFormLabel>
            <CFormSelect
              name="id_rol"
              value={addFormData.id_rol}
              onChange={handleAddFormChange}
            >
              <option value="">Seleccione un rol</option>
              <option value="1">Admin</option>
              <option value="2">Usuario</option>
              {/* Ajusta roles según los que manejes */}
            </CFormSelect>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleAdd(false)}>
            Cancelar
          </CButton>
          <CButton color="success" onClick={handleAdd}>
            Añadir
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default Users
