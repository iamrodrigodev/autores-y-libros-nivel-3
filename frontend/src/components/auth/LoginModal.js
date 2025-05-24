import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import '../../styles/LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errores, setErrores] = useState({
    email: '',
    password: ''
  });

  // Limpiar el formulario cuando se muestre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: ''
      });
      setErrores({
        email: '',
        password: ''
      });
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    const nuevosErrores = {};
    
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = 'El correo electrónico no es válido';
    }
    
    if (!formData.password) {
      nuevosErrores.password = 'La contraseña es requerida';
    }
    
    setErrores(nuevosErrores);
    
    // Si no hay errores, proceder con el login
    if (Object.keys(nuevosErrores).length === 0) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        // Si el login es exitoso, llamamos a onLogin con los datos del usuario
        if (data?.user) {
          onLogin({
            email: data.user.email,
            id: data.user.id,
            // Agrega más campos del usuario si es necesario
          });
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        setErrores({
          ...errores,
          submit: 'Error al iniciar sesión. Verifica tus credenciales.'
        });
      }
    }
  };

  // Estilos de depuración
  const debugStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    modal: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      position: 'relative',
    },
  };

  if (!isOpen) {
    console.log('Modal cerrado: isOpen es false');
    return null;
  } else {
    console.log('Modal abierto: isOpen es true');
  }

  return (
    <div className="modal-overlay" style={debugStyles.overlay}>
      <div className="login-modal" style={debugStyles.modal}>
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Ingresa tu correo electrónico"
              autoComplete="email"
              className={errores.email ? 'input-error' : ''}
            />
            {errores.email && (
              <div className="mensaje-error">{errores.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              className={errores.password ? 'input-error' : ''}
            />
            {errores.password && (
              <div className="mensaje-error">{errores.password}</div>
            )}
          </div>

          <div className="form-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <button 
              type="submit" 
              className="btn-login" 
              style={{ 
                width: '100%',
                marginBottom: '15px'
              }}
            >
              Iniciar Sesión
            </button>
            {errores.submit && (
              <div 
                className="mensaje-error" 
                style={{ 
                  color: '#d32f2f',
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  width: '100%',
                  marginTop: '5px'
                }}
              >
                {errores.submit}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
