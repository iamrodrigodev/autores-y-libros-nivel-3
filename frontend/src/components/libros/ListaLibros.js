import React, { useEffect, useState } from 'react';
import { libroService } from '../../services/libroService';
import { getGenreColor } from '../../styles/colors';
import './ListaLibros.css';

const ListaLibros = () => {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [reintentar, setReintentar] = useState(false);

  useEffect(() => {
    const cargarLibros = async () => {
      try {
        setCargando(true);
        setError(null);
        const datos = await libroService.obtenerLibros();
        setLibros(datos);
      } catch (err) {
        console.error('Error al cargar los libros:', err);
        setError(err.message || 'No se pudieron cargar los libros. Por favor, intente nuevamente.');
      } finally {
        setCargando(false);
      }
    };

    cargarLibros();
  }, [reintentar]);

  // Función para formatear la fecha
  const formatearFecha = (fechaString) => {
    if (!fechaString) return 'Fecha desconocida';
    
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return 'Fecha inválida';
      
      return fecha.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return 'Fecha inválida';
    }
  };

  if (cargando) {
    return (
      <div className="cargando-container">
        <div className="spinner"></div>
        <p>Cargando libros...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-mensaje">{error}</p>
        <button 
          onClick={() => setReintentar(!reintentar)} 
          className="btn-reintentar"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="lista-libros-container">
      <div className="lista-header">
        <h2>Libros</h2>
      </div>
      
      <div className="libros-grid">
        {libros.length > 0 ? (
          libros.map((libro) => (
            <div key={libro._id} className="libro-card">
              <div className="libro-cabecera">
                <h3 className="libro-titulo">{libro.titulo}</h3>
                <div className="libro-meta">
                  <span className="fecha">{formatearFecha(libro.fecha_publicacion)}</span>
                  <span className="paginas">{libro.paginas} págs.</span>
                </div>
              </div>
              
              <div className="libro-autores">
                <h4>Autores</h4>
                <div className="autores-lista">
                  {libro.autores && libro.autores.length > 0 ? (
                    libro.autores.map((autor, idx) => (
                      <span key={`autor-${idx}`} className="autor">
                        {autor}
                      </span>
                    ))
                  ) : (
                    <span className="sin-autor">Sin autores</span>
                  )}
                </div>
              </div>
              
              {libro.generos && libro.generos.length > 0 && (
                <div className="libro-generos">
                  <h4>Géneros</h4>
                  <div className="generos-lista">
                    {libro.generos.map((genero, idx) => (
                      <span 
                        key={`genero-${idx}`} 
                        className="genero"
                        style={{
                          '--genre-color': getGenreColor(genero),
                          '--genre-color-light': `${getGenreColor(genero)}33`
                        }}
                      >
                        {genero}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="libro-sinopsis">
                <h4>Sinopsis</h4>
                <p>{libro.sinopsis}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="sin-datos">
            No hay libros registrados
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaLibros;
