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
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CContainer,
  CForm,
  CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilPencil, cilTrash, cilCloudDownload, cilPlus } from '@coreui/icons'
import useFetch from '../../hooks/useFetch'

const Users = () => {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('') // Estado para el término de búsqueda
  const [filteredUsers, setFilteredUsers] = useState([]) // Estado para los usuarios filtrados
  const [visible, setVisible] = useState(false) // Estado para el modal de edición
  const [visibleAdd, setVisibleAdd] = useState(false) // Estado para el modal de agregar
  const [selectedUser, setSelectedUser] = useState(null)
  const [editFormData, setEditFormData] = useState({
    user_name: '',
    email: '',
    phone: '',
    birthdate: '',
    id_role: '',
  })
  const [addFormData, setAddFormData] = useState({
    user_name: '',
    email: '',
    phone: '',
    birthdate: '',
    id_role: '',
    password: '',
  })

  const { data, loading: loading, error: error } = useFetch('http://localhost:8000/user')
  const { data: roles } = useFetch('http://localhost:8000/role')

  useEffect(() => {
    if (data) {
      setUsers(data) // Actualiza los usuarios con los datos obtenidos de la API
    }
  }, [data])

  // Filtrado de usuarios basado en el término de búsqueda
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm),
    )
    setFilteredUsers(filtered)
  }, [searchTerm, users])

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase()
    setSearchTerm(value)

    // Filtrar usuarios según el término de búsqueda
    const filtered = users.filter(
      (user) =>
        user.user_name.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.phone.includes(value),
    )
    setFilteredUsers(filtered)
  }

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/user/${userId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Error al eliminar usuario')
      }
      const updatedUsers = users.filter((user) => user.id !== userId)
      setUsers(updatedUsers)
    } catch (error) {
      console.error(error)
      alert('Error eliminando el usuario')
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setEditFormData({
      user_name: user.user_name,
      email: user.email,
      phone: user.phone,
      birthdate: user.birthdate,
      id_role: user.id_role || '',
    })
    setVisible(true)
  }

  const handleEditFormChange = (event) => {
    setEditFormData({ ...editFormData, [event.target.name]: event.target.value })
  }

  // Función la actualización de un usuario
  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:8000/user/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })
      if (!response.ok) {
        throw new Error('Error al actualizar el usuario')
      }
      const updatedUser = await response.json()
      const updatedUsers = users.map((user) => (user.id === selectedUser.id ? updatedUser : user))
      setUsers(updatedUsers)
      setVisible(false)
    } catch (error) {
      console.error(error)
      alert('Error actualizando el usuario')
    }
  }

  // Funciones para el modal de agregar
  const handleAddFormChange = (event) => {
    setAddFormData({ ...addFormData, [event.target.name]: event.target.value })
  }

  const handleAdd = async () => {
    const newUser = { ...addFormData }
    try {
      const response = await fetch('http://localhost:8000/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })
      if (!response.ok) throw new Error('Error al agregar usuario')
      const createdUser = await response.json()
      setUsers([...users, createdUser])
      setVisibleAdd(false)
    } catch (error) {
      console.error(error)
      alert('Hubo un problema al agregar el usuario.')
    }
  }

  // Función para obtener el nombre del rol según el ID
  const getRoleName = (roleId) => {
    const role = roles.find((role) => role.id_role === parseInt(roleId))
    return role ? role.name_role : 'Unknown Role' // Ajusta para usar name_role
  }

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CButton color="success" className="float-end" onClick={() => setVisibleAdd(true)}>
          <CIcon icon={cilPlus} /> <CIcon icon={cilPeople} className="ms-1 me-2" />
        </CButton>
        <CButton color="primary" className="float-end me-2">
          <CIcon icon={cilCloudDownload} />
        </CButton>

        <CContainer fluid>
          <CForm className="d-flex" style={{ maxWidth: '300px' }}>
            <CFormInput
              type="search"
              className="me-2"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearchChange} // Manejar cambios en el cuadro de búsqueda
            />
            <CButton type="submit" color="success" variant="outline">
              Search
            </CButton>
          </CForm>
        </CContainer>
      </CCardHeader>
      <CCardBody>
        <CTable align="middle" className="mb-0 border" hover responsive>
          <CTableHead color="black">
            <CTableRow key={users.id}>
              <CTableHeaderCell className="text-center">
                <CIcon icon={cilPeople} />
              </CTableHeaderCell>
              <CTableHeaderCell>User</CTableHeaderCell>
              <CTableHeaderCell>Email</CTableHeaderCell>
              <CTableHeaderCell>Phone</CTableHeaderCell>
              <CTableHeaderCell>birthdate</CTableHeaderCell>
              <CTableHeaderCell>Rol</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredUsers.map((user) => (
              <CTableRow key={user.id}>
                <CTableDataCell className="text-center">
                  <CAvatar size="md" src={`avatars/${user.id}.jpg`} />
                </CTableDataCell>
                <CTableDataCell>
                  <div>{user.user_name}</div>
                </CTableDataCell>
                <CTableDataCell>
                  <div>{user.email}</div>
                </CTableDataCell>
                <CTableDataCell>
                  <div>{user.phone}</div>
                </CTableDataCell>
                <CTableDataCell>
                  <div>{user.birthdate}</div>
                </CTableDataCell>
                <CTableDataCell>
                  <div>{getRoleName(user.id_role)}</div>
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(user)}
                  >
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

      {/* Modal de Editar Usuario */}
      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader>
          <CModalTitle>Edit User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel>User Name</CFormLabel> {/* Agregué etiquetas */}
          <CFormInput
            type="text"
            name="user_name"
            value={editFormData.user_name}
            onChange={handleEditFormChange}
          />
          <CFormLabel>Email</CFormLabel>
          <CFormInput
            type="email"
            name="email"
            label="Email"
            value={editFormData.email}
            onChange={handleEditFormChange}
          />
          <CFormLabel>Phone</CFormLabel>
          <CFormInput
            type="text"
            name="phone"
            label="Phone"
            value={editFormData.phone}
            onChange={handleEditFormChange}
          />
          <CFormLabel>Birthdate</CFormLabel>
          <CFormInput
            type="text"
            name="birthdate"
            label="Birthdate"
            value={editFormData.birthdate}
            onChange={handleEditFormChange}
          />
          <CFormLabel>Rol</CFormLabel>
          <CFormInput
            type="number"
            name="id_role"
            label="Rol"
            value={editFormData.id_role}
            onChange={handleEditFormChange}
          />
          <CFormLabel>Password</CFormLabel>
          <CFormInput
            type="password"
            name="password"
            value={addFormData.password}
            onChange={handleAddFormChange}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleUpdate}>
            Save changes
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal de Agregar Usuario */}
      <CModal visible={visibleAdd} onClose={() => setVisibleAdd(false)}>
        <CModalHeader>
          <CModalTitle>Add User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormLabel>User Name</CFormLabel>
          <CFormInput
            type="text"
            name="user_name"
            value={addFormData.user_name}
            onChange={handleAddFormChange}
          />
          <CFormLabel>Email</CFormLabel>
          <CFormInput
            type="email"
            name="email"
            value={addFormData.email}
            onChange={handleAddFormChange}
          />
          <CFormLabel>Phone</CFormLabel>
          <CFormInput
            type="text"
            name="phone"
            value={addFormData.phone}
            onChange={handleAddFormChange}
          />
          <CFormLabel>Birthdate</CFormLabel>
          <CFormInput
            type="text"
            name="birthdate"
            value={addFormData.birthdate}
            onChange={handleAddFormChange}
          />
          <CFormLabel>Rol</CFormLabel>
          <CFormInput
            type="number"
            name="id_role"
            value={addFormData.id_role}
            onChange={handleAddFormChange}
          />
          <CFormLabel>Password</CFormLabel>
          <CFormInput
            type="password"
            name="password"
            value={addFormData.password}
            onChange={handleAddFormChange}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisibleAdd(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleAdd}>
            Add User
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default Users
