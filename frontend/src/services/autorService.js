import axios from 'axios';

const API_URL = 'http://localhost:3001/api/autores';

// Crear una instancia de axios con configuración personalizada
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicio para manejar las operaciones de autores
export const autorService = {
  // Obtener libros por ID de autor
  async obtenerLibrosPorAutor(id) {
    // Validar que el ID no sea undefined, null o vacío
    if (!id) {
      const errorMsg = 'Error: No se proporcionó un ID de autor válido';
      console.error(errorMsg, id);
      throw new Error(errorMsg);
    }

    try {
      console.log('=== Iniciando petición para obtener libros del autor ===');
      console.log('ID del autor:', id);
      console.log('URL de la petición:', `${API_URL}/${id}/libros`);
      
      const response = await api.get(`/${id}/libros`);
      
      console.log('=== Respuesta del servidor ===');
      console.log('Estado:', response.status, response.statusText);
      console.log('Datos:', response.data);
      
      if (response.data && response.data.success) {
        console.log('Libros obtenidos exitosamente');
        return response.data;
      }
      
      const errorMsg = response.data?.error || 'Error al obtener los libros del autor';
      console.error('Error en la respuesta del servidor:', errorMsg);
      throw new Error(errorMsg);
      
    } catch (error) {
      console.error('=== Error al obtener los libros del autor ===');
      
      if (error.response) {
        // El servidor respondió con un estado de error
        console.error('Detalles del error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        const serverError = error.response.data?.error || 
                          `Error del servidor: ${error.response.status} ${error.response.statusText}`;
        console.error('Mensaje de error:', serverError);
        throw new Error(serverError);
        
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor. Detalles:', error.request);
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        
      } else {
        // Algo ocurrió en la configuración de la petición
        console.error('Error en la configuración de la petición:', error.message);
        console.error('Configuración de la petición fallida:', error.config);
        throw new Error('Error en la configuración de la petición: ' + error.message);
      }
    } finally {
      console.log('=== Fin de la petición de libros del autor ===\n');
    }
  },
  
  // Obtener un autor por ID
  async obtenerAutorPorId(id) {
    // Validar que el ID no sea undefined, null o vacío
    if (!id) {
      const errorMsg = 'Error: No se proporcionó un ID de autor válido';
      console.error(errorMsg, id);
      throw new Error(errorMsg);
    }

    try {
      console.log('=== Iniciando petición para obtener autor por ID ===');
      console.log('ID del autor:', id);
      console.log('URL de la petición:', `${API_URL}/${id}`);
      
      const response = await api.get(`/${id}`);
      
      console.log('=== Respuesta del servidor ===');
      console.log('Estado:', response.status, response.statusText);
      console.log('Datos:', response.data);
      
      if (response.data && response.data.success) {
        console.log('Autor obtenido exitosamente');
        return response.data;
      }
      
      const errorMsg = response.data?.error || 'Error al obtener el autor';
      console.error('Error en la respuesta del servidor:', errorMsg);
      throw new Error(errorMsg);
      
    } catch (error) {
      console.error('=== Error al obtener el autor por ID ===');
      
      if (error.response) {
        // El servidor respondió con un estado de error
        console.error('Detalles del error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        const serverError = error.response.data?.error || 
                          `Error del servidor: ${error.response.status} ${error.response.statusText}`;
        console.error('Mensaje de error:', serverError);
        throw new Error(serverError);
        
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor. Detalles:', error.request);
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
        
      } else {
        // Algo ocurrió en la configuración de la petición
        console.error('Error en la configuración de la petición:', error.message);
        console.error('Configuración de la petición fallida:', error.config);
        throw new Error('Error en la configuración de la petición: ' + error.message);
      }
    } finally {
      console.log('=== Fin de la petición de autor por ID ===\n');
    }
  },
  
  // Crear un nuevo autor
  async crearAutor(datosAutor) {
    try {
      console.log('Enviando datos para crear autor:', datosAutor);
      const response = await api.post('/', datosAutor);
      console.log('Respuesta del servidor (crear autor):', response.data);
      
      if (response.data && response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data?.error || 'Error al crear el autor');
    } catch (error) {
      console.error('Error al crear el autor:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Si el error contiene mensajes de validación del servidor, devolverlos
      if (error.response?.data?.errors) {
        throw error.response.data.errors;
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('Error al conectar con el servidor. Por favor, intente nuevamente.');
    }
  },
  
  // Obtener todos los autores
  async obtenerAutores() {
    try {
      console.log('Solicitando autores a:', API_URL);
      const response = await api.get('/');
      console.log('Respuesta completa de autores:', response);
      
      // Verificar si la respuesta tiene datos
      if (response.data) {
        // Si la respuesta tiene success y data
        if (response.data.success && response.data.data) {
          const autores = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
          
          console.log('Autores procesados:', autores);
          return autores.map(autor => ({
            ...autor,
            _id: autor._id || autor.id || ''
          }));
        } 
        // Si la respuesta es directamente un array
        else if (Array.isArray(response.data)) {
          console.log('Autores (array directo):', response.data);
          return response.data.map(autor => ({
            ...autor,
            _id: autor._id || autor.id || ''
          }));
        }
      }
      
      console.warn('No se encontraron autores en la respuesta');
      return [];
    } catch (error) {
      console.error('Error al obtener los autores:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener los autores');
      }
      
      if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      throw new Error('Error en la configuración de la petición');
    }
  },

  // Actualizar un autor
  async actualizarAutor(_id, datos) {
    try {
      // Asegurarse de que los datos estén en el formato correcto
      const datosParaEnviar = {
        ...datos,
        // Asegurarse de que la fecha esté en el formato correcto si existe
        fecha_nacimiento: datos.fecha_nacimiento || undefined
      };
      
      console.log('Enviando solicitud PUT a:', `${API_URL}/${_id}`, 'con datos:', datosParaEnviar);
      
      // Usar axios directamente para más control
      const response = await axios.put(
        `${API_URL}/${_id}`, 
        datosParaEnviar,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          validateStatus: function (status) {
            // Aceptar códigos de estado en el rango 200-500
            return status >= 200 && status < 500;
          }
        }
      );
      
      console.log('Respuesta del servidor (actualizar autor):', response.data);
      
      // Si hay un error en la respuesta, manejarlo
      if (response.status >= 400 || !response.data.success) {
        console.log('Error en la respuesta del servidor:', response.data);
        
        // Si hay errores de validación, lanzarlos directamente
        if (response.data.errors) {
          console.log('Enviando errores de validación al componente:', response.data.errors);
          throw response.data.errors;
        } 
        // Si hay un mensaje de error, lanzarlo
        else if (response.data.message) {
          console.log('Enviando mensaje de error al componente:', response.data.message);
          throw new Error(response.data.message);
        } 
        // Error genérico
        else {
          console.log('Error genérico al actualizar el autor');
          throw new Error('Error al actualizar el autor');
        }
      }
      
      return response.data;
      
    } catch (error) {
      console.error('Error en actualizarAutor:', error);
      
      // Si el error ya es un objeto de errores de validación, lanzarlo directamente
      if (error && typeof error === 'object' && !(error instanceof Error) && !error.response) {
        throw error;
      }
      
      // Si hay una respuesta del servidor con errores de validación
      if (error.response?.data?.success === false) {
        console.log('Error de validación del servidor:', error.response.data);
        // Si hay errores específicos, los lanzamos
        if (error.response.data.errors) {
          throw error.response.data.errors;
        }
        // Si hay un mensaje general, lo lanzamos como error
        if (error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      // Si hay un mensaje de error en la respuesta
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Si hay un error de red o el servidor no responde
      if (error.message === 'Network Error') {
        throw new Error('No se pudo conectar con el servidor. Verifique su conexión a Internet.');
      }
      
      // Si el error ya es una instancia de Error, lanzarlo directamente
      if (error instanceof Error) {
        throw error;
      }
      
      // Error genérico
      throw new Error('No se pudo actualizar el autor. Intente nuevamente.');
    }
  },

  // Eliminar un autor
  async eliminarAutor(_id) {
    try {
      const response = await api.delete(`/${_id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar el autor:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('No se pudo eliminar el autor. Intente nuevamente.');
    }
  }
};
