const { Genero } = require('../models/generos.model');
const mongoose = require('mongoose');

// Función para formatear mensajes de error
const formatError = (error) => {
    if (error.name === 'CastError') {
        return 'El ID proporcionado no es válido';
    }
    if (error.name === 'ValidationError') {
        return error.message.split(':').pop().trim();
    }
    if (error.name === 'MongoError' && error.code === 11000) {
        return 'Ya existe un género con este nombre';
    }
    return error.message;
};

// Función para validar los datos del género
const validarDatosGenero = (nombre, descripcion) => {
    const errores = [];

    if (!nombre || nombre.trim().length < 3) {
        errores.push('El nombre es obligatorio y debe tener al menos 3 caracteres');
    }

    if (!descripcion || descripcion.trim().length < 10) {
        errores.push('La descripción es obligatoria y debe tener al menos 10 caracteres');
    }

    return errores;
};

// Controlador para crear un nuevo género
const crearGenero = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        // Validar datos
        const errores = validarDatosGenero(nombre, descripcion);
        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errores
            });
        }

        // Verificar si ya existe un género con el mismo nombre
        const generoExistente = await Genero.findOne({ 
            nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') } 
        });
        
        if (generoExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un género con este nombre'
            });
        }

        const nuevoGenero = new Genero({
            nombre: nombre.trim(),
            descripcion: descripcion.trim()
        });

        const generoGuardado = await nuevoGenero.save();

        res.status(201).json({
            success: true,
            message: 'Género creado exitosamente',
            data: generoGuardado
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: formatError(error)
        });
    }
};

// Controlador para obtener todos los géneros
const obtenerGeneros = async (_req, res) => {
    try {
        const generos = await Genero.find().sort({ nombre: 1 });
        
        if (generos.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay géneros registrados',
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: 'Géneros encontrados',
            data: generos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: formatError(error)
        });
    }
};

// Controlador para obtener un género por ID
const obtenerGeneroPorId = async (req, res) => {
    try {
        const genero = await Genero.findById(req.params.id);
        
        if (!genero) {
            return res.status(404).json({
                success: false,
                message: 'Género no encontrado'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Género encontrado',
            data: genero
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: formatError(error)
        });
    }
};

// Controlador para obtener libros por género
const obtenerLibrosPorGenero = async (req, res) => {
    try {
        const genero = await Genero.findById(req.params.id);
        
        if (!genero) {
            return res.status(404).json({
                success: false,
                message: 'Género no encontrado'
            });
        }

        const libros = await mongoose.connection.collection('Libros')
            .find({ generos: genero.nombre })
            .toArray();

        if (libros.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay libros registrados para este género',
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: 'Libros del género encontrados',
            data: libros
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: formatError(error)
        });
    }
};

// Controlador para actualizar un género
const actualizarGenero = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const generoId = req.params.id;
        
        // Validar datos
        const errores = validarDatosGenero(nombre, descripcion);
        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errores
            });
        }

        // Verificar si el género existe
        const generoExistente = await Genero.findById(generoId);
        if (!generoExistente) {
            return res.status(404).json({
                success: false,
                message: 'Género no encontrado'
            });
        }

        // Verificar si ya existe otro género con el mismo nombre
        if (nombre && nombre.trim().toLowerCase() !== generoExistente.nombre.toLowerCase()) {
            const generoConMismoNombre = await Genero.findOne({ 
                _id: { $ne: generoId },
                nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') } 
            });
            
            if (generoConMismoNombre) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe otro género con este nombre'
                });
            }
        }

        const updateData = {};
        if (nombre) updateData.nombre = nombre.trim();
        if (descripcion) updateData.descripcion = descripcion.trim();

        // Guardar el nombre anterior para actualizar en los libros
        const nombreAnterior = generoExistente.nombre;
        const actualizarNombre = nombre && nombre.trim() !== nombreAnterior;

        const generoActualizado = await Genero.findByIdAndUpdate(
            generoId,
            updateData,
            { new: true, runValidators: true }
        );

        // Si se actualizó el nombre, actualizar también en la colección de libros
        if (actualizarNombre) {
            await mongoose.connection.collection('Libros').updateMany(
                { generos: nombreAnterior },
                { $set: { 'generos.$': nombre.trim() } }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Género actualizado exitosamente',
            data: generoActualizado
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: formatError(error)
        });
    }
};

// Controlador para eliminar un género
const eliminarGenero = async (req, res) => {
    try {
        const genero = await Genero.findById(req.params.id);
        
        if (!genero) {
            return res.status(404).json({
                success: false,
                message: 'Género no encontrado'
            });
        }

        // Verificar si hay libros con este género
        const librosConGenero = await mongoose.connection.collection('Libros')
            .countDocuments({ generos: genero.nombre });

        if (librosConGenero > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar el género porque tiene libros asociados',
                librosAsociados: librosConGenero
            });
        }

        await Genero.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Género eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: formatError(error)
        });
    }
};

// Exportar controladores
module.exports = {
    crearGenero,
    obtenerGeneros,
    obtenerGeneroPorId,
    obtenerLibrosPorGenero,
    actualizarGenero,
    eliminarGenero
};