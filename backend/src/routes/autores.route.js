const express = require('express');
const router = express.Router();
const autoresController = require('../controllers/autores.controller');

// Ruta para crear un nuevo autor
router.post('/', autoresController.crearAutor);

// Ruta para listar todos los autores
router.get('/', autoresController.obtenerAutores);

// Ruta para obtener un autor específico por ID
router.get('/:id', autoresController.obtenerAutorPorId);

// Ruta para obtener los libros de un autor específico
router.get('/:id/libros', autoresController.obtenerLibrosDeAutor);

// Ruta para actualizar un autor
router.put('/:id', autoresController.actualizarAutor);

// Ruta para eliminar un autor
router.delete('/:id', autoresController.eliminarAutor);

module.exports = router;