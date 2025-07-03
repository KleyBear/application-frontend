import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import './scss/examples.scss';
import Login from 'src/views/pages/login/Login.js';

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setupTheme();
    checkSavedAuth();
  }, []);

  const setupTheme = () => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)?.[0];

    if (theme) {
      setColorMode(theme);
    } else if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  };

  const checkSavedAuth = () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');

    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error al leer usuario guardado:', e);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log('Enviando login:', {
        email: credentials.email,
        password: credentials.password,
      });

      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Error backend:', errorData);
        setError(errorData.message || 'Error en autenticación');
        setLoading(false);
        return;
      }

      const data = await res.json();

      // Accede al token según respuesta del backend
console.log('Respuesta backend:', data); // 🔍 Verifica qué estructura tiene
const token = data.data.token;

      if (!token) {
        setError('No se recibió token de autenticación');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);

      // Guardamos usuario simplificado con email y token (puedes expandir info si quieres)
      const user = { email: credentials.email, token };
      setCurrentUser(user);
      setIsAuthenticated(true);

      if (credentials.rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('rememberedCredentials', JSON.stringify(credentials));
      } else {
        localStorage.removeItem('rememberedCredentials');
      }
    } catch (error) {
      setError('Error al conectar con el servidor');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <CSpinner color="primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <Login
          credentials={credentials}
          onInputChange={handleInputChange}
          onLogin={handleLogin}
          error={error}
        />
      ) : (
        <Suspense fallback={<div className="pt-3 text-center"><CSpinner color="primary" variant="grow" /></div>}>
          <Routes>
            <Route path="*" element={<DefaultLayout user={currentUser} />} />
          </Routes>
        </Suspense>
      )}
    </BrowserRouter>
  );
};

export default App;
