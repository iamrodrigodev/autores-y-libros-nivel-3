import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { supabase } from './config/supabase';
import './styles/App.css';
import AppRouter from './routes/AppRouter';
import LoginModal from './components/auth/LoginModal';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setShowLoginModal(false);
        } else {
          setShowLoginModal(true);
        }
      } catch (error) {
        console.error('Error al verificar sesión:', error.message);
        setShowLoginModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Manejar inicio de sesión exitoso
  const handleLoginSuccess = async (userData) => {
    setUser(userData);
    setShowLoginModal(false);
  };

  // Manejar cierre de sesión
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setShowLoginModal(true);
    } catch (error) {
      console.error('Error al cerrar sesión:', error.message);
    }
  };

  // Mostrar carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Router>
        <AppRouter user={user} onLogout={handleLogout} />
        <LoginModal 
          isOpen={showLoginModal}
          onClose={() => {}}
          onLogin={handleLoginSuccess}
        />
      </Router>
    </div>
  );
}

export default App;