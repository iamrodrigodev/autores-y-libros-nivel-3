import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles/App.css';
import AppRouter from './routes/AppRouter';
import LoginModal from './components/auth/LoginModal';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Mostrar el modal de login al cargar la aplicación
    setIsLoginModalOpen(true);
  }, []);

  const handleLogin = (credentials) => {
    console.log('Iniciando sesión con:', credentials);
    // Aquí iría la lógica de autenticación
    setIsLoginModalOpen(false);
  };

  return (
    <Router>
      <AppRouter />
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />
    </Router>
  );
}

export default App;
