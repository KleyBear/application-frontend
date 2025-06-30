import React, { Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  CSpinner,
  useColorModes,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormInput,
  CButton,
} from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import routes from './routes'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  // Estado para el login
  const [isAuthenticated, setIsAuthenticated] = useState(false) // Controla si el usuario está autenticado
  const [username, setUsername] = useState('') // Almacena el nombre de usuario
  const [password, setPassword] = useState('') // Almacena la contraseña

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]

    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Función para manejar el login
  const handleLogin = () => {
    // Simulación de validación de login
    if (username && password) {
      setIsAuthenticated(true) // Autenticar al usuario
    } else {
      alert('Por favor ingresa un usuario y contraseña válidos.')
    }
  }

  return (
    <BrowserRouter>
      <CModal visible={!isAuthenticated} backdrop="static" keyboard={false} onClose={() => {}}>
        <CModalHeader>
          <CModalTitle>Login</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-3"
          />
          <CFormInput
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleLogin}>
            Login
          </CButton>
        </CModalFooter>
      </CModal>

      {isAuthenticated && (
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
          <Routes>
            <Route path="*" name="Home" element={<DefaultLayout />} />
          </Routes>
        </Suspense>
      )}
    </BrowserRouter>
  )
}

export default App
