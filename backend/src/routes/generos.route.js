const express = require('express');
const router = express.Router();
const generosController = require('../controllers/generos.controller');
const { authMiddleware } = require('../../auth/auth');

// Ruta para crear un nuevo género
router.post('/crear_genero', generosController.crearGenero);

// Ruta para listar todos los géneros
router.get('/', generosController.obtenerGeneros);

// Ruta para obtener un género específico por ID
router.get('/:id', generosController.obtenerGeneroPorId);

// Ruta para obtener los libros de un género específico
router.get('/:id/libros', generosController.obtenerLibrosPorGenero);

// Ruta para actualizar un género
router.put('/actualizar/:id', generosController.actualizarGenero);

// Ruta para eliminar un género
router.delete('/:id', generosController.eliminarGenero);

module.exports = router;