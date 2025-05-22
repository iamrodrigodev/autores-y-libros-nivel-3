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
        const errores = [];
        const now = new Date();

        // 1. Validar campos requeridos
        if (!nombre || nombre.trim() === '') errores.push('El nombre es obligatorio');
        if (!fecha_nacimiento) errores.push('La fecha de nacimiento es obligatoria');
        if (!nacionalidad || nacionalidad.trim() === '') errores.push('La nacionalidad es obligatoria');

        // Si hay errores de campos requeridos, retornar de inmediato
        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errores
            });
        }

        // 2. Validar formatos y valores
        // Validar fecha
        const fechaNac = new Date(fecha_nacimiento);
        if (isNaN(fechaNac.getTime())) {
            errores.push('La fecha de nacimiento no es válida');
        } else if (fechaNac > now) {
            errores.push('La fecha de nacimiento no puede ser futura');
        }

        // Validar nacionalidad (solo una palabra)
        if (nacionalidad.trim().includes(',')) {
            errores.push('Debe contener solo una nacionalidad');
        }

        // Validar nombre único (insensible a mayúsculas/minúsculas)
        const nombreExistente = await mongoose.connection.collection('Autores').findOne({ 
            nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') } 
        });
        
        if (nombreExistente) {
            errores.push('Ya existe un autor con este nombre');
        }

        // Si hay errores de validación, retornarlos
        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errores
            });
        }

        // Crear el nuevo autor
        const nuevoAutor = new Autor({
            nombre: nombre.trim(),
            fecha_nacimiento: fechaNac,
            nacionalidad: nacionalidad.trim()
        });

        const autorGuardado = await nuevoAutor.save();

        res.status(201).json({
            success: true,
            message: 'Autor creado exitosamente',
            data: autorGuardado
        });
    } catch (error) {
        console.error('Error al crear autor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [formatError(error)]
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
            count: autores.length,
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
                count: 0,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            message: 'Libros del autor encontrados',
            count: libros.length,
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
        const { id } = req.params;
        const { nombre, fecha_nacimiento, nacionalidad } = req.body;
        const errores = [];
        const now = new Date();

        // Verificar si el ID es válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: ['ID de autor no válido']
            });
        }

        // Obtener el autor actual primero
        const autor = await Autor.findById(id);
        if (!autor) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró el autor',
                errors: ['No existe un autor con el ID proporcionado']
            });
        }

        // 1. Validar campos opcionales si se proporcionan
        if (nombre !== undefined) {
            if (nombre.trim() === '') {
                errores.push('El nombre no puede estar vacío');
            } else if (nombre !== autor.nombre) {
                // Solo validar unicidad si el nombre cambió
                const nombreExistente = await mongoose.connection.collection('Autores').findOne({ 
                    _id: { $ne: new mongoose.Types.ObjectId(id) },
                    nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') } 
                });
                
                if (nombreExistente) {
                    errores.push('Ya existe otro autor con este nombre');
                }
            }
        }

        if (fecha_nacimiento !== undefined) {
            const fechaNac = new Date(fecha_nacimiento);
            if (isNaN(fechaNac.getTime())) {
                errores.push('La fecha de nacimiento no es válida');
            } else if (fechaNac > now) {
                errores.push('La fecha de nacimiento no puede ser futura');
            }
        }

        if (nacionalidad !== undefined) {
            if (nacionalidad.trim() === '') {
                errores.push('La nacionalidad no puede estar vacía');
            } else if (nacionalidad.trim().includes(',')) {
                errores.push('Debe contener solo una nacionalidad');
            }
        }

        // Si no hay campos para actualizar
        if (Object.keys(req.body).length === 0) {
            errores.push('No se proporcionaron datos para actualizar');
        }

        // Si hay errores de validación, retornarlos
        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errores
            });
        }

        // Preparar actualizaciones
        const actualizaciones = {};
        if (nombre !== undefined) actualizaciones.nombre = nombre.trim();
        if (fecha_nacimiento !== undefined) actualizaciones.fecha_nacimiento = new Date(fecha_nacimiento);
        if (nacionalidad !== undefined) actualizaciones.nacionalidad = nacionalidad.trim();

        // Actualizar el autor
        const autorActualizado = await Autor.findByIdAndUpdate(
            id,
            actualizaciones,
            { new: true, runValidators: false } // Las validaciones ya las hicimos manualmente
        );

        // Si se cambió el nombre, actualizar los libros que lo referencian
        let librosActualizados = false;
        if (nombre && nombre !== autor.nombre) {
            try {
                await mongoose.connection.collection('Libros').updateMany(
                    { autores: autor.nombre },
                    { $set: { 'autores.$': nombre.trim() } }
                );
                librosActualizados = true;
            } catch (error) {
                console.error('Error al actualizar libros del autor:', error);
                // No fallar la operación si no se pueden actualizar los libros
            }
        }

        const respuesta = {
            success: true,
            message: 'Autor actualizado exitosamente',
            data: autorActualizado,
            librosActualizados: librosActualizados ? 'Se actualizaron los libros del autor' : 'No se actualizaron libros'
        };

        res.status(200).json(respuesta);
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