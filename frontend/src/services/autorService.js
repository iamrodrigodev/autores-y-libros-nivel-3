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
        return response.data.data || [];
      }
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
  }
};
