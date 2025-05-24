import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { autorService } from '../../services/autorService';
import { getGenreColor } from '../../styles/colors';
import '../libros/ListaLibros.css'; // Reusing the same styles as ListaLibros

const LibrosPorAutor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [libros, setLibros] = useState([]);
  const [autor, setAutor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  console.log('ID del autor desde la URL:', id);

  useEffect(() => {
    const cargarLibrosPorAutor = async () => {
      try {
        if (!id) {
          throw new Error('No se proporcionó un ID de autor válido');
        }
        
        console.log('Cargando libros para el autor ID:', id);
        setCargando(true);
        setError(null);
        
        // Obtener información del autor primero para verificar que existe
        const autorInfo = await autorService.obtenerAutorPorId(id);
        if (autorInfo && !autorInfo.error) {
          setAutor(autorInfo.data);
          
          // Luego obtener los libros del autor
          const response = await autorService.obtenerLibrosPorAutor(id);
          
          if (response.error) {
            throw new Error(response.error);
          }
          
          // La respuesta exitosa viene en response.data
          const librosData = response.data || [];
          console.log('Libros recibidos:', librosData);
          setLibros(Array.isArray(librosData) ? librosData : []);
        } else {
          throw new Error('No se pudo cargar la información del autor');
        }
      } catch (err) {
        console.error('Error al cargar los libros del autor:', err);
        setError(err.message || 'No se pudieron cargar los libros de este autor. Por favor, intente nuevamente.');
      } finally {
        setCargando(false);
      }
    };

    cargarLibrosPorAutor();
  }, [id]);

  // Función para formatear la fecha
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
        <p>Cargando libros del autor...</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="error-container">
        <p className="error-mensaje">{error}</p>
        <button 
          className="btn-reintentar"
          onClick={() => window.location.reload()}
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
          Libros del autor: {autor?.nombre || 'Autor desconocido'}
        </h2>
      </div>
      
      {libros.length === 0 ? (
        <div className="sin-datos" style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#666',
          fontSize: '1.1rem'
        }}>
          No hay libros registrados para este autor.
        </div>
      ) : (
        <div className="libros-grid">
          {libros.map((libro) => (
            <div key={libro._id} className="libro-card" style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              ':hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
              }
            }}>
              <div className="libro-cabecera" style={{
                padding: '1.25rem',
                borderBottom: '1px solid #eee',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 className="libro-titulo" style={{
                  margin: '0 0 0.5rem',
                  fontSize: '1.25rem',
                  color: '#333',
                  fontWeight: '600'
                }}>
                  {libro.titulo}
                </h3>
                <div className="libro-meta" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  color: '#666'
                }}>
                  <span className="fecha">{formatearFecha(libro.fecha_publicacion)}</span>
                  <span className="paginas">{libro.paginas} págs.</span>
                </div>
              </div>
              <div className="libro-detalles" style={{
                padding: '1.25rem',
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div className="detalle-item" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  <span className="detalle-etiqueta" style={{
                    fontWeight: '600',
                    color: '#555',
                    fontSize: '0.9rem'
                  }}>Sinopsis:</span>
                  <p style={{
                    margin: 0,
                    color: '#333',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                  }}>
                    {libro.sinopsis || 'Sin sinopsis disponible'}
                  </p>
                </div>
                <div className="libro-generos">
                  <h4 style={{
                    margin: '0 0 0.5rem',
                    fontSize: '0.9rem',
                    color: '#555',
                    fontWeight: '600'
                  }}>Géneros</h4>
                  {libro.generos && libro.generos.length > 0 ? (
                    <div className="generos-lista">
                      {libro.generos.map((genero, idx) => {
                        const generoNombre = typeof genero === 'object' ? genero.nombre : genero;
                        return (
                          <span 
                            key={`genero-${idx}`}
                            className="genero"
                            style={{
                              '--genre-color': getGenreColor(generoNombre),
                              '--genre-color-light': `${getGenreColor(generoNombre)}33`
                            }}
                          >
                            {generoNombre}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="sin-generos" style={{
                      color: '#6c757d',
                      fontStyle: 'italic',
                      fontSize: '0.9rem'
                    }}>
                      No tiene géneros
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibrosPorAutor;
