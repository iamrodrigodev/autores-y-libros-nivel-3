import React, { useEffect, useState } from 'react';
import { autorService } from '../../services/autorService';
import './ListaAutores.css';

const ListaAutores = () => {
  const [autores, setAutores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarAutores = async () => {
      try {
        setCargando(true);
        setError(null);
        const datos = await autorService.obtenerAutores();
        setAutores(datos);
      } catch (err) {
        console.error('Error al cargar los autores:', err);
        setError('No se pudieron cargar los autores. Por favor, intente nuevamente.');
      } finally {
        setCargando(false);
      }
    };

    cargarAutores();
  }, []);

  // Función para formatear la fecha de nacimiento
  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'Fecha desconocida';
    
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      
      const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
      return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  };

  if (cargando) {
    return (
      <div className="cargando-container">
        <div className="spinner"></div>
        <p>Cargando autores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-mensaje">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-reintentar"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="lista-autores-container">
      <div className="lista-header">
        <h2>Autores</h2>
      </div>
      
      <div className="autores-grid">
        {autores.length > 0 ? (
          autores.map((autor) => (
            <div key={autor._id} className="autor-card">
              <div className="autor-avatar">
                {autor.nombre ? autor.nombre.charAt(0).toUpperCase() : 'A'}
              </div>
              
              <div className="autor-info">
                <h3 className="autor-nombre">{autor.nombre || 'Nombre no disponible'}</h3>
                
                <div className="autor-detalle">
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Nacionalidad:</span>
                    <span className="detalle-valor">{autor.nacionalidad || 'No especificada'}</span>
                  </div>
                  
                  <div className="detalle-item">
                    <span className="detalle-etiqueta">Nacimiento:</span>
                    <span className="detalle-valor">{formatearFecha(autor.fecha_nacimiento)}</span>
                  </div>
                </div>
                
                {autor.biografia && (
                  <div className="autor-biografia">
                    <p>{autor.biografia}</p>
                  </div>
                )}
                

              </div>
            </div>
          ))
        ) : (
          <div className="sin-datos">
            No hay autores registrados
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaAutores;
