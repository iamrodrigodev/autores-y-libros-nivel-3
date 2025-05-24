import React, { useState } from 'react';
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
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
      onLogin(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="login-modal">
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

          <div className="form-actions">
            <button type="submit" className="btn-login">
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
