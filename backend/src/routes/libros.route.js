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

module.exports = router;