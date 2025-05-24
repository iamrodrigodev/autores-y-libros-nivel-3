import React, { useState, useEffect, useRef } from 'react';
import { generoService } from '../../services/generoService';
import { getGenreColor } from '../../styles/colors';
// Import removed as we're not using icons anymore
import './ListaGeneros.css';

const ListaGeneros = () => {
  const [generos, setGeneros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [reintentar, setReintentar] = useState(false);
  const generoAEliminarId = useRef(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [generoAEditar, setGeneroAEditar] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: ''
  });
  const [mostrarExito, setMostrarExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [mostrarConfirmarActualizar, setMostrarConfirmarActualizar] = useState(false);

  useEffect(() => {
    const cargarGeneros = async () => {
      try {
        setCargando(true);
        setError(null);
        const datos = await generoService.obtenerGeneros();
        setGeneros(datos);
      } catch (error) {
        setError('No se pudieron cargar los géneros. Por favor, intente nuevamente.');
      } finally {
        setCargando(false);
      }
    };

    cargarGeneros();
  }, [reintentar]);

  const handleEliminarClick = (genero) => {
    // Intentar obtener el ID de diferentes maneras según la estructura del objeto
    let generoId = null;
    
    // Primero verificar si el género es un objeto con _id o id
    if (genero && typeof genero === 'object') {
      generoId = genero._id || genero.id;
    } 
    // Si no, podría ser directamente el ID
    else if (typeof genero === 'string') {
      generoId = genero;
    }
    
    if (!generoId) {
      setError('No se pudo identificar el género a eliminar. Por favor, intente nuevamente.');
      return;
    }
    
    // Asegurarse de que el ID sea un string
    const idString = generoId.toString();
    
    // Asignar el ID a la referencia
    generoAEliminarId.current = idString;
    
    // Mostrar el modal de confirmación
    setMostrarConfirmacion(true);
  };

  const confirmarEliminar = async () => {
    // Obtener el ID actual de la referencia
    const idAEliminar = generoAEliminarId.current;
    
    if (!idAEliminar) {
      setError('No se pudo identificar el género a eliminar. Por favor, intente nuevamente.');
      return;
    }
    
    try {
      const response = await generoService.eliminarGenero(idAEliminar);
      
      if (response && response.success) {
        // Actualizar la lista de géneros eliminando el género eliminado
        setGeneros(prevGeneros => prevGeneros.filter(g => g._id !== idAEliminar));
        
        setMostrarConfirmacion(false);
        
        // Mostrar mensaje de éxito en el modal
        if (response.librosActualizados && typeof response.librosActualizados === 'object') {
          setMensajeExito(`Género eliminado exitosamente. ${response.librosActualizados.mensaje}`);
        } else {
          setMensajeExito('Género eliminado exitosamente.');
        }
        setMostrarExito(true);
        
        // Recargar la lista completa de géneros para asegurar consistencia
        try {
          const datosActualizados = await generoService.obtenerGeneros();
          setGeneros(datosActualizados);
        } catch (error) {
          console.error('Error al actualizar la lista de géneros:', error);
          // No mostramos error al usuario ya que la eliminación fue exitosa
        }
      } else {
        const errorMsg = response?.error || 'Error al eliminar el género';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error al eliminar el género:', {
        message: error.message,
        error: error,
        stack: error.stack
      });
      setError(error.message || 'No se pudo eliminar el género. Por favor, intente nuevamente.');
    }
  };

  const handleEditarClick = (genero) => {
    setGeneroAEditar(genero);
    setFormulario({
      nombre: genero.nombre,
      descripcion: genero.descripcion || ''
    });
    // Limpiar errores al abrir el formulario
    setError(null);
    setErroresValidacion({});
    setMostrarFormulario(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cargarGeneros = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await generoService.obtenerGeneros();
      setGeneros(datos);
    } catch (err) {
      setError('No se pudieron cargar los géneros. Por favor, intente nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  // Función para manejar la confirmación de actualización (mantenida por compatibilidad)
  const confirmarActualizacion = () => {
    // Esta función ya no es necesaria pero se mantiene por compatibilidad
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setError(null);
    setErroresValidacion({});
    
    try {
      // Enviar los datos al backend
      const respuesta = await generoService.actualizarGenero(generoAEditar._id, formulario);
      
      if (respuesta && respuesta.success) {
        // Actualizar la lista de géneros
        await cargarGeneros();
        
        // Cerrar el formulario
        setMostrarFormulario(false);
        
        // Mostrar mensaje de éxito
        setMensajeExito(respuesta.message || 'Género actualizado exitosamente');
        setMostrarExito(true);
      }
    } catch (error) {
      // Si el error es un objeto con mensajes de validación
      if (typeof error === 'object' && error !== null) {
        setErroresValidacion(error);
      } 
      // Si hay un mensaje de error
      else if (error.message) {
        setError(error.message);
      } 
      // Error genérico
      else {
        setError('No se pudo actualizar el género. Por favor, intente nuevamente.');
      }
    }
  };

  if (cargando) {
    return (
      <div className="cargando-container">
        <div className="spinner"></div>
        <p>Cargando géneros...</p>
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
    <div className="lista-generos-container">
      <div className="lista-header">
        <h2>Géneros Literarios</h2>
      </div>
      
      <div className="generos-grid">
        {generos.length > 0 ? (
          generos.map((genero) => {
            return (
              <div key={genero._id} className="genero-card" style={{ '--genre-color': getGenreColor(genero.nombre) }}>
                <div className="genero-cabecera">
                  <h3 className="genero-nombre">{genero.nombre}</h3>
                </div>
                
                <div className="genero-descripcion">
                  <p>{genero.descripcion || 'Sin descripción disponible'}</p>
                </div>
                
                <div className="genero-acciones">
                  <button 
                    className="btn-editar"
                    onClick={() => handleEditarClick(genero)}
                  >
                    Actualizar
                  </button>
                  <button 
                    className="btn-eliminar"
                    onClick={() => handleEliminarClick(genero)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="sin-datos">
            No hay géneros registrados
          </div>
        )}
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

      {/* Modal de confirmación de eliminación */}
      {mostrarConfirmacion && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este género?</p>
            <p className="advertencia">
              <strong>Advertencia:</strong> Esta acción también eliminará este género de todos los libros que lo tengan asociado.
            </p>
            <div className="modal-acciones">
              <button onClick={() => setMostrarConfirmacion(false)} className="btn-cancelar">
                Cancelar
              </button>
              <button onClick={confirmarEliminar} className="btn-confirmar">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Género</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleInputChange}
                  className={erroresValidacion.nombre ? 'input-error' : ''}
                />
                {erroresValidacion.nombre && (
                  <div className="mensaje-error">{erroresValidacion.nombre}</div>
                )}
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={handleInputChange}
                  className={erroresValidacion.descripcion ? 'input-error' : ''}
                  rows="4"
                />
                {erroresValidacion.descripcion && (
                  <div className="mensaje-error">{erroresValidacion.descripcion}</div>
                )}
              </div>
              <div className="modal-acciones">
                <button type="button" onClick={() => setMostrarFormulario(false)} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar Cambios
                </button>
              </div>
              
              {/* Modal de confirmación de actualización */}
              {mostrarConfirmarActualizar && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h3>Confirmar actualización</h3>
                    <p>¿Estás seguro de que deseas actualizar este género?</p>
                    <div className="modal-acciones">
                      <button 
                        onClick={() => setMostrarConfirmarActualizar(false)} 
                        className="btn-cancelar"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={confirmarActualizacion} 
                        className="btn-confirmar"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaGeneros;
