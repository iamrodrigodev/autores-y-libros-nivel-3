import axios from 'axios';

const API_URL = 'http://localhost:3001/api/generos';

// Crear una instancia de axios con configuración personalizada
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar respuestas exitosas
export const generoService = {
  // Obtener todos los géneros
  async obtenerGeneros() {
    try {
      const response = await api.get('/');
      
      // Asegurarse de que siempre devolvemos un array
      if (response.data && response.data.success) {
        // Asegurarse de que cada género tenga _id
        return Array.isArray(response.data.data) 
          ? response.data.data.map(genero => ({
              ...genero,
              _id: genero._id || genero.id || ''
            }))
          : [];
      }
      return [];
    } catch (error) {
      // Si hay una respuesta del servidor pero con error
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener los géneros');
      }
      
      // Si no hay respuesta del servidor
      if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      // Error en la configuración de la petición
      throw new Error('Error en la configuración de la petición');
    }
  },
  
  // Obtener un género por ID
  async obtenerGeneroPorId(id) {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Actualizar un género
  async actualizarGenero(id, datosActualizados) {
    try {
      const response = await api.put(`/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      // Si hay una respuesta del servidor con errores
      if (error.response && error.response.data) {
        // Si hay errores de validación
        if (error.response.data.errors) {
          // Lanzar el objeto de errores directamente
          throw error.response.data.errors;
        }
        // Si hay un mensaje de error general
        if (error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      // Si no hay respuesta del servidor
      if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      // Error en la configuración de la petición
      throw new Error('Error en la configuración de la petición');
    }
  },
  
  // Crear un nuevo género
  async crearGenero(datosGenero) {
    try {
      const response = await api.post('/', datosGenero);
      return response.data;
    } catch (error) {
      // Si hay una respuesta del servidor con errores
      if (error.response && error.response.data) {
        // Si hay errores de validación
        if (error.response.data.errors) {
          // Lanzar el objeto de errores directamente
          throw error.response.data.errors;
        }
        // Si hay un mensaje de error general
        if (error.response.data.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      // Si no hay respuesta del servidor
      if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      // Error en la configuración de la petición
      throw new Error('Error en la configuración de la petición');
    }
  },
  
  // Obtener libros por ID de género
  async obtenerLibrosPorGenero(id) {
    try {
      const response = await api.get(`/${id}/libros`);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error al obtener los libros del género:', error);
      return { 
        data: null, 
        error: error.response?.data?.message || 'Error al cargar los libros del género' 
      };
    }
  },

  // Eliminar un género
  async eliminarGenero(id) {
    try {
      // Asegurarse de que el ID sea un string y esté presente
      const generoId = id?.toString().trim();
      
      if (!generoId) {
        throw new Error('No se proporcionó un ID de género válido');
      }
      
      // Construir la URL completa sin el slash inicial
      const url = `${generoId}`;
      
      // Hacer la petición DELETE directamente con la URL completa
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar el género con ID ${id}:`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al eliminar el género');
      }
      
      if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      throw new Error('Error en la configuración de la petición');
    }
  }
};
