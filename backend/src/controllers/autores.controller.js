const { Autor } = require('../models/autores.model');
const mongoose = require('mongoose');

// Función para formatear mensajes de error
const formatError = (error) => {
    if (error.name === 'CastError') {
        return 'El ID proporcionado no es válido';
    }
    if (error.name === 'ValidationError') {
        return error.message.split(':').pop().trim();
    }
    return error.message;
};

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
            error: formatError(error)
        });
    }
};

// Obtener todos los autores
exports.obtenerAutores = async (_req, res) => {
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
            error: formatError(error)
        });
    }
};

// Obtener un autor por ID
exports.obtenerAutorPorId = async (req, res) => {
    try {
        // Verificar si el ID es válido antes de hacer la consulta
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'El ID proporcionado no es válido'
            });
        }

        const autor = await Autor.findById(req.params.id);
        
        if (!autor) {
            return res.status(404).json({
                success: false,
                error: 'No existe un autor con ese ID'
            });
        }

        res.status(200).json({
            success: true,
            data: autor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: formatError(error)
        });
    }
};

// Obtener libros de un autor
exports.obtenerLibrosDeAutor = async (req, res) => {
    try {
        // Verificar si el ID es válido antes de hacer la consulta
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'El ID proporcionado no es válido'
            });
        }

        const autor = await Autor.findById(req.params.id);
        
        if (!autor) {
            return res.status(404).json({
                success: false,
                error: 'No existe un autor con ese ID'
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
            error: formatError(error)
        });
    }
};

// Actualizar autor
exports.actualizarAutor = async (req, res) => {
    try {
        // Verificar si el ID es válido antes de hacer la consulta
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'El ID proporcionado no es válido'
            });
        }

        const { nombre, fecha_nacimiento, nacionalidad } = req.body;
        
        // Obtener el autor actual primero
        const autor = await Autor.findById(req.params.id);
        if (!autor) {
            return res.status(404).json({
                success: false,
                error: 'No existe un autor con ese ID'
            });
        }

        // Guardar el nombre antiguo para actualizar los libros
        const nombreAnterior = autor.nombre;
        let librosActualizados = false;

        // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
        if (nombre && nombre !== nombreAnterior) {
            const autorExistente = await Autor.findOne({ nombre });
            if (autorExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'Ya existe un autor con ese nombre'
                });
            }
        }

        // Actualizar solo los campos proporcionados
        if (nombre) autor.nombre = nombre;
        if (fecha_nacimiento) autor.fecha_nacimiento = fecha_nacimiento;
        if (nacionalidad) autor.nacionalidad = nacionalidad;

        // Guardar el autor actualizado
        const autorActualizado = await autor.save();

        if (!autorActualizado) {
            return res.status(500).json({
                success: false,
                error: 'No se pudo actualizar el autor'
            });
        }

        // Si se cambió el nombre del autor, actualizar los libros relacionados
        if (nombre && nombre !== nombreAnterior) {
            // Obtener todos los libros que tienen el nombre antiguo del autor
            const libros = await mongoose.connection.collection('Libros')
                .find({ autores: nombreAnterior })
                .toArray();

            // Actualizar cada libro individualmente
            for (const libro of libros) {
                const nuevosAutores = libro.autores.map(autor => 
                    autor === nombreAnterior ? nombre : autor
                );
                
                await mongoose.connection.collection('Libros').updateOne(
                    { _id: libro._id },
                    { $set: { autores: nuevosAutores } }
                );
            }
            
            librosActualizados = libros.length > 0;
        }

        res.status(200).json({
            success: true,
            message: librosActualizados 
                ? 'Autor actualizado exitosamente y libros relacionados actualizados'
                : 'Autor actualizado exitosamente',
            data: autorActualizado
        });
    } catch (error) {
        console.error('Error al actualizar autor:', error);
        res.status(500).json({
            success: false,
            error: formatError(error)
        });
    }
};

// Eliminar autor
exports.eliminarAutor = async (req, res) => {
    try {
        // Verificar si el ID es válido antes de hacer la consulta
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                error: 'El ID proporcionado no es válido'
            });
        }

        const autor = await Autor.findById(req.params.id);
        
        if (!autor) {
            return res.status(404).json({
                success: false,
                error: 'No existe un autor con ese ID'
            });
        }

        const nombreAutor = autor.nombre;
        
        // Obtener la cantidad de libros que serán actualizados
        const libros = await mongoose.connection.collection('Libros')
            .find({ autores: nombreAutor })
            .toArray();
        
        // Eliminar el autor
        await Autor.findByIdAndDelete(req.params.id);

        // Actualizar los libros que tenían este autor
        if (libros.length > 0) {
            await mongoose.connection.collection('Libros').updateMany(
                { autores: nombreAutor },
                { $pull: { autores: nombreAutor } }
            );

            return res.status(200).json({
                success: true,
                message: `Autor eliminado exitosamente y actualizados ${libros.length} libro(s)`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Autor eliminado exitosamente (no había libros para actualizar)'
        });
    } catch (error) {
        console.error('Error al eliminar autor:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al eliminar el autor'
        });
    }
};