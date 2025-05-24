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
      throw new Error(error.message || 'Error al conectar con el servidor');
    }
  }
};
