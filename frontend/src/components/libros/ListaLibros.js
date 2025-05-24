import React, { useEffect, useState } from 'react';
import { libroService } from '../../services/libroService';
import { getGenreColor } from '../../styles/colors';
import { FaSpinner } from 'react-icons/fa';
import './ListaLibros.css';

const ListaLibros = () => {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [reintentar, setReintentar] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [libroAEliminar, setLibroAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [mostrarExito, setMostrarExito] = useState(false);

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

  // Función para manejar la confirmación de eliminación
  const confirmarEliminar = (libro) => {
    setLibroAEliminar(libro);
    setMostrarConfirmacion(true);
  };

  // Función para cancelar la eliminación
  const cancelarEliminar = () => {
    setMostrarConfirmacion(false);
    setLibroAEliminar(null);
  };

  // Función para eliminar un libro
  const eliminarLibro = async () => {
    if (!libroAEliminar) return;
    
    try {
      setEliminando(true);
      const response = await libroService.eliminarLibro(libroAEliminar._id);
      
      // Actualizar la lista de libros eliminando el libro eliminado
      setLibros(prevLibros => prevLibros.filter(libro => libro._id !== libroAEliminar._id));
      
      setMostrarConfirmacion(false);
      
      // Mostrar el mensaje de éxito del backend o uno por defecto
      setMensajeExito(response?.message || 'Libro eliminado exitosamente');
      setMostrarExito(true);
      
    } catch (error) {
      console.error('Error al eliminar el libro:', error);
      setError(error.message || 'No se pudo eliminar el libro. Intente nuevamente.');
    } finally {
      setEliminando(false);
      setLibroAEliminar(null);
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
      {/* Modal de éxito */}
      {mostrarExito && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>¡Operación Exitosa!</h3>
            <p>{mensajeExito}</p>
            <div className="modal-acciones">
              <button 
                className="btn-aceptar"
                onClick={() => setMostrarExito(false)}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {mostrarConfirmacion && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar el libro "{libroAEliminar?.titulo}"?</p>
            <p className="advertencia">
              <strong>Advertencia:</strong> Esta acción eliminará permanentemente el libro y no se podrá deshacer.
            </p>
            <div className="modal-acciones">
              <button 
                onClick={cancelarEliminar} 
                className="btn-cancelar"
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button 
                onClick={eliminarLibro} 
                className="btn-confirmar"
                disabled={eliminando}
              >
                {eliminando ? (
                  <>
                    <FaSpinner className="spinner" /> Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
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
              
              <div className="libro-acciones">
                <button 
                  onClick={() => confirmarEliminar(libro)}
                  className="btn-eliminar"
                  title="Eliminar libro"
                >
                  Eliminar
                </button>
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
