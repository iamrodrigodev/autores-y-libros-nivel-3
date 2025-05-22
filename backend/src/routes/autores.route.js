
const express = require('express');
const router = express.Router();
const autoresController = require('../controllers/autores.controller');
const { authMiddleware } = require('../../auth/auth');

// Ruta para crear un nuevo autor
router.post('/crear_autor', authMiddleware, autoresController.crearAutor);

// Ruta para listar todos los autores
router.get('/', authMiddleware, autoresController.obtenerAutores);

// Ruta para obtener un autor específico por ID
router.get('/:id', authMiddleware, autoresController.obtenerAutorPorId);

// Ruta para obtener los libros de un autor específico
router.get('/:id/libros', authMiddleware, autoresController.obtenerLibrosDeAutor);

// Ruta para actualizar un autor
router.put('/actualizar/:id', authMiddleware, autoresController.actualizarAutor);

// Ruta para eliminar un autor
router.delete('/:id', authMiddleware, autoresController.eliminarAutor);

module.exports = router;