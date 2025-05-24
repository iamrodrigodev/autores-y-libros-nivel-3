import React, { useState } from 'react';
import '../../styles/LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errores, setErrores] = useState({
    username: '',
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
    
    if (!formData.username.trim()) {
      nuevosErrores.username = 'El nombre de usuario es requerido';
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
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              className={errores.username ? 'input-error' : ''}
            />
            {errores.username && (
              <div className="mensaje-error">{errores.username}</div>
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
