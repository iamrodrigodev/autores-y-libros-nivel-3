const Autor = require('../models/autores.model');
const mongoose = require('mongoose');

// Crear un nuevo autor
exports.crearAutor = async (req, res) => {
    try {
        const { nombre, fecha_nacimiento, nacionalidad } = req.body;

        const nuevoAutor = new Autor({
            nombre,
            fecha_nacimiento,
            nacionalidad
        });

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
};

// Obtener todos los autores
exports.obtenerAutores = async (req, res) => {
    try {
        const autores = await Autor.find();
        
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
};

// Obtener un autor por ID
exports.obtenerAutorPorId = async (req, res) => {
    try {
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
};

// Obtener libros de un autor
exports.obtenerLibrosDeAutor = async (req, res) => {
    try {
        const autor = await Autor.findById(req.params.id);
        
        if (!autor) {
            return res.status(404).json({
                success: false,
                message: 'Autor no encontrado'
            });
        }

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
};

// Actualizar autor
exports.actualizarAutor = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const autorActualizado = await Autor.findByIdAndUpdate(
            req.params.id,
            { nombre, descripcion },
            { new: true, runValidators: true }
        );

        if (!autorActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Autor no encontrado'
            });
        }

        await mongoose.connection.collection('Libros').updateMany(
            { autores: autorActualizado.nombre },
            { $set: { 'autores.$': autorActualizado.nombre } }
        );

        res.status(200).json({
            success: true,
            message: 'Nombre y descripción del autor actualizados exitosamente y libros relacionados actualizados',
            data: autorActualizado
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el autor o los libros relacionados',
            error: error.message
        });
    }
};

// Eliminar autor
exports.eliminarAutor = async (req, res) => {
    try {
        const autor = await Autor.findById(req.params.id);
        
        if (!autor) {
            return res.status(404).json({
                success: false,
                message: 'Autor no encontrado'
            });
        }

        const nombreAutor = autor.nombre;
        await Autor.findByIdAndDelete(req.params.id);

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
};