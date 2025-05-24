import axios from 'axios';

const API_URL = 'http://localhost:3001/api/libros';

// Crear una instancia de axios con configuración personalizada
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Servicio para manejar las operaciones de libros
export const libroService = {
  // Obtener todos los libros con información de autores y géneros
  async obtenerLibros() {
    try {
      console.log('Obteniendo libros desde:', API_URL);
      const response = await api.get('/');
      console.log('Respuesta del servidor (libros):', response.data);
      
      // Asegurarse de que siempre devolvemos un array
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error al obtener los libros:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Error al obtener los libros');
      }
      
      if (error.request) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      
      throw new Error('Error en la configuración de la petición');
    }
  },
  
  // Obtener un libro por ID
  async obtenerLibroPorId(id) {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener el libro con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Actualizar un libro existente
  async actualizarLibro(id, datosLibro) {
    try {
      const response = await api.put(`/${id}`, datosLibro);
      if (response.data && response.data.success) {
        return response.data;
      }
      throw new Error('No se pudo actualizar el libro');
    } catch (error) {
      console.error(`Error al actualizar el libro con ID ${id}:`, error);
      if (error.response) {
        // Si el servidor devuelve un diccionario de errores de validación
        if (error.response.data && typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
          // Si es un objeto con un campo 'errors', usamos ese como el diccionario de errores
          if (error.response.data.errors) {
            throw error.response.data.errors;
          }
          // Si no, usamos el objeto directamente como diccionario de errores
          throw error.response.data;
        }
        // Si hay un mensaje de error simple
        const errorMessage = error.response.data.message || error.response.data.error || 'Error al actualizar el libro';
        throw new Error(errorMessage);
      }
      throw new Error('Error al conectar con el servidor');
    }
  },
  
  // Crear un nuevo libro
  async crearLibro(datosLibro) {
    try {
      const response = await api.post('/', datosLibro);
      if (response.data && response.data.success) {
        return response.data;
      }
      throw new Error('No se pudo crear el libro');
    } catch (error) {
      console.error('Error al crear el libro:', error);
      if (error.response) {
        // Si el servidor devuelve un diccionario de errores de validación
        if (error.response.data && typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
          // Si es un objeto con un campo 'errors', usamos ese como el diccionario de errores
          if (error.response.data.errors) {
            throw error.response.data.errors;
          }
          // Si no, usamos el objeto directamente como diccionario de errores
          throw error.response.data;
        }
        // Si hay un mensaje de error simple
        const errorMessage = error.response.data.message || error.response.data.error || 'Error al crear el libro';
        throw new Error(errorMessage);
      }
      throw new Error('Error al conectar con el servidor');
    }
  },
  
  // Obtener todos los géneros
  async obtenerGeneros() {
    try {
      const response = await axios.get('http://localhost:3001/api/generos');
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener los géneros:', error);
      return [];
    }
  },
  
  // Obtener todos los autores
  async obtenerAutores() {
    try {
      const response = await axios.get('http://localhost:3001/api/autores');
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener los autores:', error);
      return [];
    }
  },
  
  // Eliminar un libro por ID
  async eliminarLibro(id) {
    try {
      const response = await api.delete(`/${id}`);
      if (response.data && response.data.success) {
        return response.data; // Devuelve el mensaje del backend
      }
      throw new Error('No se pudo eliminar el libro');
    } catch (error) {
      console.error(`Error al eliminar el libro con ID ${id}:`, error);
      if (error.response) {
        const errorMessage = error.response.data.message || error.response.data.error || 'Error al eliminar el libro';
        throw new Error(errorMessage);
      }
      throw new Error('Error al conectar con el servidor');
    }
  }
};
