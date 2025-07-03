import React from 'react';

const Login = ({ credentials, onInputChange, onLogin }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      {/* Recuadro del login en negro */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#000', // Fondo negro para el recuadro
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        color: '#fff' // Texto blanco para contraste
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '10px',
          textAlign: 'center',
          color: '#fff' // Texto blanco
        }}>Iniciar sesión</h1>
        
        <form onSubmit={onLogin} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              color: '#ccc' // Texto gris claro
            }}>Correo electrónico</label>
            <input 
              type="email" 
              name="email"
              value={credentials.email}
              onChange={onInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: '#111', // Fondo oscuro para inputs
                color: '#fff', // Texto blanco
                outline: 'none'
              }}
              required
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '14px',
              color: '#ccc' // Texto gris claro
            }}>Contraseña</label>
            <input 
              type="password" 
              name="password"
              value={credentials.password}
              onChange={onInputChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #333',
                borderRadius: '6px',
                fontSize: '16px',
                backgroundColor: '#111', // Fondo oscuro para inputs
                color: '#fff', // Texto blanco
                outline: 'none'
              }}
              required
            />
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '5px'
          }}>
            
          </div>
        
          <hr style={{
            width: '100%',
            border: 'none',
            borderTop: '1px solid #333', // Línea divisoria oscura
            margin: '15px 0'
          }} />
          
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Botón gris oscuro
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              ':hover': {
                backgroundColor: '#444' // Efecto hover
              }
            }}
          >
            INICIAR SESIÓN
          </button>
        </form>
        
        <a href="#" style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#888', // Texto gris
          textDecoration: 'none',
          marginTop: '5px',
          transition: 'color 0.3s ease',
          ':hover': {
            color: '#ccc' // Efecto hover
          }
        }}>
          ¿Has olvidado la contraseña?
        </a>
      </div>
    </div>
  );
};

export default Login;