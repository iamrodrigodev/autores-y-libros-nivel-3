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
            count: generos.length,
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
        const { id } = req.params;
        
        // Verificar longitud del ID
        if (id.length !== 24) {
            return res.status(400).json({
                success: false,
                error: `El ID proporcionado no es válido`
            });
        }

        // Verificar si el ID es un ObjectId de MongoDB válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: `El ID proporcionado no es válido`
            });
        }

        const { nombre, descripcion } = req.body;
        
        // Obtener el género actual primero
        const genero = await Genero.findById(id);
        if (!genero) {
            return res.status(404).json({
                success: false,
                error: `No existe un género con ese ID`
            });
        }

        // Guardar el nombre antiguo para actualizar los libros
        const nombreAnterior = genero.nombre;
        let librosActualizados = false;

        // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
        if (nombre && nombre !== nombreAnterior) {
            const generoExistente = await Genero.findOne({ 
                nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') },
                _id: { $ne: id }
            });
            
            if (generoExistente) {
                return res.status(400).json({
                    success: false,
                    error: 'Ya existe un género con ese nombre'
                });
            }
        }

        // Actualizar solo los campos proporcionados
        if (nombre) genero.nombre = nombre.trim();
        if (descripcion !== undefined) genero.descripcion = descripcion.trim();

        // Guardar el género actualizado
        const generoActualizado = await genero.save();

        if (!generoActualizado) {
            return res.status(500).json({
                success: false,
                error: 'No se pudo actualizar el género'
            });
        }

        // Si se cambió el nombre del género, actualizar los libros relacionados
        if (nombre && nombre !== nombreAnterior) {
            // Obtener todos los libros que tienen el género antiguo
            const libros = await mongoose.connection.collection('Libros')
                .find({ generos: nombreAnterior })
                .toArray();

            // Actualizar cada libro individualmente
            for (const libro of libros) {
                const nuevosGeneros = libro.generos.map(gen => 
                    gen === nombreAnterior ? nombre : gen
                );
                
                await mongoose.connection.collection('Libros').updateOne(
                    { _id: libro._id },
                    { $set: { generos: nuevosGeneros } }
                );
            }
            
            librosActualizados = libros.length > 0;
        }

        res.status(200).json({
            success: true,
            message: librosActualizados 
                ? 'Género actualizado exitosamente y libros relacionados actualizados'
                : 'Género actualizado exitosamente',
            data: generoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar género:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al actualizar el género'
        });
    }
};

// Controlador para eliminar un género
const eliminarGenero = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar longitud del ID
        if (id.length !== 24) {
            return res.status(400).json({
                success: false,
                error: `El ID proporcionado no es válido`
            });
        }

        // Verificar si el ID es un ObjectId de MongoDB válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: `El ID proporcionado no es válido`
            });
        }

        const genero = await Genero.findById(id);
        
        if (!genero) {
            return res.status(404).json({
                success: false,
                error: `No existe un género con ese ID`
            });
        }

        // Obtener el nombre del género para actualizar los libros
        const nombreGenero = genero.nombre;

        // Eliminar el género
        await Genero.findByIdAndDelete(id);

        // Actualizar los libros que tenían este género
        const libros = await mongoose.connection.collection('Libros')
            .find({ generos: nombreGenero })
            .toArray();

        // Si hay libros con este género, actualizarlos
        if (libros.length > 0) {
            for (const libro of libros) {
                const nuevosGeneros = libro.generos.filter(gen => gen !== nombreGenero);
                
                await mongoose.connection.collection('Libros').updateOne(
                    { _id: libro._id },
                    { $set: { generos: nuevosGeneros } }
                );
            }

            return res.status(200).json({
                success: true,
                message: `Género eliminado exitosamente y actualizados ${libros.length} libro(s)`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Género eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar género:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al eliminar el género'
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