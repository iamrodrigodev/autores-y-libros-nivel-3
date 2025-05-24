import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generoService } from '../../services/generoService';
import '../libros/ListaLibros.css'; // Reusing the same styles as ListaLibros

const LibrosPorGenero = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [libros, setLibros] = useState([]);
  const [genero, setGenero] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarLibrosPorGenero = async () => {
      try {
        setCargando(true);
        setError(null);
        
        // Obtener los libros del género específico
        const response = await generoService.obtenerLibrosPorGenero(id);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        // La respuesta exitosa viene en response.data.data
        const librosData = response.data?.data || [];
        setLibros(Array.isArray(librosData) ? librosData : []);
        
        // Obtener información del género para mostrar el nombre
        const generoInfo = await generoService.obtenerGeneroPorId(id);
        if (generoInfo && !generoInfo.error) {
          setGenero(generoInfo.data);
        }
      } catch (err) {
        console.error('Error al cargar los libros del género:', err);
        setError(err.message || 'No se pudieron cargar los libros de este género. Por favor, intente nuevamente.');
      } finally {
        setCargando(false);
      }
    };

    cargarLibrosPorGenero();
  }, [id]);

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
        <p>Cargando libros del género...</p>
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
    <div className="lista-libros-container">
      <div className="lista-header" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        marginBottom: '1.5rem',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn-volver"
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#4285F4',
              color: '#FFFFFF',
              border: '1px solid #3367D6',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#3367D6';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#4285F4';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          >
            Volver
          </button>
        </div>
        <h2 style={{ 
          textAlign: 'center',
          margin: 0,
          gridColumn: '1 / -1',
          justifySelf: 'center'
        }}>
          Libros del género: {genero?.nombre || 'Género'}
        </h2>
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
              
              <div className="libro-sinopsis">
                <h4>Sinopsis</h4>
                <p>{libro.sinopsis || 'Sin sinopsis disponible'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="sin-datos">
            No hay libros registrados para este género
          </div>
        )}
      </div>
    </div>
  );
};

export default LibrosPorGenero;
