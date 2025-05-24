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
  // Obtener todos los autores
  async obtenerAutores() {
    try {
      console.log('Obteniendo autores desde:', API_URL);
      const response = await api.get('/');
      console.log('Respuesta del servidor (autores):', response.data);
      
      // Asegurarse de que siempre devolvemos un array
      if (response.data && response.data.success) {
        const autores = response.data.data || [];
        console.log('Autores obtenidos:', autores);
        // Verificar que cada autor tenga un _id
        autores.forEach((autor, index) => {
          console.log(`Autor ${index + 1}:`, {
            nombre: autor.nombre,
            _id: autor._id,
            tieneId: !!autor._id
          });
        });
        return autores;
      }
      console.warn('La respuesta no tiene éxito o no contiene datos');
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
  async actualizarAutor(id, datos) {
    try {
      // Asegurarse de que los datos estén en el formato correcto
      const datosParaEnviar = {
        ...datos,
        // Asegurarse de que la fecha esté en el formato correcto si existe
        fecha_nacimiento: datos.fecha_nacimiento || undefined
      };
      
      console.log('Enviando solicitud PUT a:', `${API_URL}/${id}`, 'con datos:', datosParaEnviar);
      
      // Usar axios directamente para más control
      const response = await axios.put(
        `${API_URL}/${id}`, 
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
  async eliminarAutor(id) {
    try {
      const response = await api.delete(`/${id}`);
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
