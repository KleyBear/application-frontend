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

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await loadUsers();
        checkSavedAuth();
        setupTheme();
      } catch (err) {
        console.error('Error inicializando app:', err);
        setError('Error al cargar la aplicación');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/db.json');
      if (!response.ok) throw new Error('Error al cargar db.json');

      const data = await response.json();

      // ✅ Se ajusta a clave "user" en tu archivo JSON
      if (!data || !Array.isArray(data.user)) {
        throw new Error('Formato inválido: se esperaba array "user"');
      }

      setUsers(data.user);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setUsers([
        {
          user_name: 'Usuario Demo',
          email: 'demo@example.com',
          password: '123456',
          phone: '0000000000',
          birthdate: '2000-01-01',
          id_role: 2,
          id: 'demo1',
        },
      ]);
      setError('Usando datos locales - El sistema puede estar limitado');
    }
  };

  const checkSavedAuth = () => {
    const savedUser = localStorage.getItem('currentUser');
    const savedCredentials = localStorage.getItem('rememberedCredentials');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error al leer usuario guardado:', e);
        localStorage.removeItem('currentUser');
      }
    }

    if (savedCredentials) {
      try {
        setCredentials(JSON.parse(savedCredentials));
      } catch (e) {
        console.error('Error al leer credenciales guardadas:', e);
        localStorage.removeItem('rememberedCredentials');
      }
    }
  };

  const setupTheme = () => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme')?.match(/^[A-Za-z0-9\s]+/)?.[0];

    if (theme) {
      setColorMode(theme);
    } else if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError(null);

    if (!users.length) {
      setError('No hay usuarios disponibles para autenticar');
      return;
    }

    const user = users.find(
      (u) => u.email === credentials.email && String(u.password) === credentials.password
    );

    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);

      if (credentials.rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify(credentials));
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('rememberedCredentials');
      }
    } else {
      setError('Credenciales incorrectas. Por favor verifica.');
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
