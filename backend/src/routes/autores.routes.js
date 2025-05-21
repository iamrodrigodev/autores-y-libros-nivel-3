const express = require('express');
const router = express.Router();
const Autor = require('../models/autor.model');
const mongoose = require('mongoose');
const { verificarToken } = require('../../../auth/src/middleware/auth.middleware');

// Ruta para crear un nuevo autor
router.post('/crear_autor', verificarToken, async (req, res) => {
    try {
        const { nombre, fecha_nacimiento, nacionalidad, biografia, fecha_fallecimiento } = req.body;

        // Crear una nueva instancia del autor
        const nuevoAutor = new Autor({
            nombre,
            fecha_nacimiento,
            nacionalidad,
            biografia,
            fecha_fallecimiento
        });

        // Guardar el autor en la base de datos
        const autorGuardado = await nuevoAutor.save();

        res.status(201).json({
            success: true,
            message: 'Autor creado exitosamente',
            data: autorGuardado
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el autor',
            error: error.message
        });
    }
});

// Ruta para listar todos los autores
router.get('/', verificarToken, async (req, res) => {
    try {
        const { nombre, nacionalidad } = req.query;
        const filtro = {};
        
        // Aplicar filtros si existen
        if (nombre) filtro.nombre = { $regex: nombre, $options: 'i' };
        if (nacionalidad) filtro.nacionalidad = { $regex: nacionalidad, $options: 'i' };
        
        const autores = await Autor.find(filtro).sort({ nombre: 1 });
        
        if (autores.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay autores registrados',
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: 'Autores encontrados',
            data: autores
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar autores',
            error: error.message
        });
    }
});

// Ruta para obtener un autor específico por ID
router.get('/:id', verificarToken, async (req, res) => {
    try {
        // Validar que el ID tenga un formato válido
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de autor no válido'
            });
        }

        const autor = await Autor.findById(req.params.id);
        
        if (!autor) {
            return res.status(404).json({
                success: false,
                message: 'Autor no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Autor encontrado',
            data: autor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el autor',
            error: error.message
        });
    }
});

// Ruta para obtener los libros de un autor específico
router.get('/:id/libros', verificarToken, async (req, res) => {
    try {
        // Validar que el ID tenga un formato válido
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de autor no válido'
            });
        }

        const autor = await Autor.findById(req.params.id);
        
        if (!autor) {
            return res.status(404).json({
                success: false,
                message: 'Autor no encontrado'
            });
        }

        // Buscar los libros del autor en la colección de Libros
        const libros = await mongoose.connection.collection('Libros')
            .find({ autores: autor.nombre })
            .toArray();

        if (libros.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay libros registrados para este autor',
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: 'Libros del autor encontrados',
            data: libros
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar los libros del autor',
            error: error.message
        });
    }
});

// Ruta para actualizar un autor
router.put('/:id', verificarToken, async (req, res) => {
    try {
        // Validar que el ID tenga un formato válido
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de autor no válido'
            });
        }

        const { nombre, nacionalidad, biografia, fecha_nacimiento, fecha_fallecimiento } = req.body;
        const datosActualizados = {};

        // Solo incluir los campos que se van a actualizar
        if (nombre) datosActualizados.nombre = nombre;
        if (nacionalidad) datosActualizados.nacionalidad = nacionalidad;
        if (biografia !== undefined) datosActualizados.biografia = biografia;
        if (fecha_nacimiento) datosActualizados.fecha_nacimiento = fecha_nacimiento;
        if (fecha_fallecimiento !== undefined) {
            datosActualizados.fecha_fallecimiento = fecha_fallecimiento;
        }

        // Actualizar el autor en la base de datos
        const autorActualizado = await Autor.findByIdAndUpdate(
            req.params.id,
            datosActualizados,
            { new: true, runValidators: true }
        );

        // Verificar si el autor fue encontrado
        if (!autorActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Autor no encontrado'
            });
        }

        // Si se actualizó el nombre, actualizar también en los libros
        if (nombre) {
            await mongoose.connection.collection('Libros').updateMany(
                { 'autores': autorActualizado.nombre },
                { $set: { 'autores.$': nombre } }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Autor actualizado exitosamente',
            data: autorActualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el autor',
            error: error.message
        });
    }
});

// Ruta para eliminar un autor
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        // Validar que el ID tenga un formato válido
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de autor no válido'
            });
        }

        const autor = await Autor.findById(req.params.id);
        
        if (!autor) {
            return res.status(404).json({
                success: false,
                message: 'Autor no encontrado'
            });
        }

        // Obtener el nombre del autor antes de eliminarlo
        const nombreAutor = autor.nombre;

        // Eliminar el autor
        await Autor.findByIdAndDelete(req.params.id);

        // Actualizar todos los libros que contienen este autor
        await mongoose.connection.collection('Libros').updateMany(
            { autores: nombreAutor },
            { $pull: { autores: nombreAutor } }
        );

        res.status(200).json({
            success: true,
            message: 'Autor eliminado exitosamente y actualizados los libros relacionados'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el autor',
            error: error.message
        });
    }
});

module.exports = router;
