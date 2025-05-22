const express = require('express');
const router = express.Router();
const librosController = require('../controllers/libros.controller');
//const { authMiddleware } = require('../../auth/auth');

// Ruta para crear un nuevo libro
router.post('/', librosController.crearLibro);

// Ruta para listar todos los libros
router.get('/', librosController.obtenerLibros);

// Ruta para obtener un libro específico por ID
router.get('/:id', librosController.obtenerLibroPorId);

// Ruta para actualizar un libro
router.put('/:id', librosController.actualizarLibro);

// Ruta para agregar autores a un libro
router.post('/:id/autores', librosController.agregarAutores);

// Ruta para agregar géneros a un libro
router.post('/:id/generos', librosController.agregarGeneros);

module.exports = router;