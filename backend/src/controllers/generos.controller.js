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
const validarDatosGenero = (nombre, descripcion, esActualizacion = false) => {
    const errores = [];

    if (!esActualizacion || (esActualizacion && nombre !== undefined)) {
        if (!nombre || nombre.trim() === '') {
            errores.push('El nombre es obligatorio');
        } else if (nombre.trim().length < 3) {
            errores.push('El nombre debe tener al menos 3 caracteres');
        }
    }

    if (!esActualizacion || (esActualizacion && descripcion !== undefined)) {
        if (descripcion !== undefined) {
            if (descripcion.trim() === '') {
                errores.push('La descripción no puede estar vacía');
            } else if (descripcion.trim().length < 10 || descripcion.trim().length > 500) {
                errores.push('La descripción debe tener entre 10 y 500 caracteres');
            }
        }
    }

    return errores;
};

// Controlador para crear un nuevo género
const crearGenero = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        // Validar datos
        const erroresValidacion = validarDatosGenero(nombre, descripcion);
        if (erroresValidacion.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: erroresValidacion
            });
        }

        const erroresDuplicados = {};
        
        // Verificar si ya existe un género con el mismo nombre (insensible a mayúsculas/minúsculas)
        const generoPorNombre = await Genero.findOne({ 
            nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') } 
        });
        
        if (generoPorNombre) {
            erroresDuplicados.nombre = 'Ya existe un género con este nombre';
        }
        
        // Verificar si ya existe un género con la misma descripción
        const generoPorDescripcion = await Genero.findOne({
            descripcion: { $regex: new RegExp(`^${descripcion.trim()}$`, 'i') }
        });
        
        if (generoPorDescripcion) {
            erroresDuplicados.descripcion = 'Ya existe un género con esta descripción';
        }
        
        // Si hay errores, devolverlos todos juntos
        if (Object.keys(erroresDuplicados).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: erroresDuplicados
            });
        }

        // Crear el nuevo género
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
        const { nombre, descripcion } = req.body;

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de género no válido'
            });
        }

        // Buscar el género por ID
        const genero = await Genero.findById(id);
        if (!genero) {
            return res.status(404).json({
                success: false,
                message: 'Género no encontrado'
            });
        }
        
        // Validar datos (solo los campos que se están actualizando)
        const erroresValidacion = validarDatosGenero(
            nombre !== undefined ? nombre : genero.nombre, 
            descripcion !== undefined ? descripcion : genero.descripcion,
            true
        );
        
        if (erroresValidacion.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: erroresValidacion
            });
        }
        
        // Guardar el nombre anterior para actualizar los libros
        const nombreAnterior = genero.nombre;
        let librosActualizados = false;

        const erroresDuplicados = {};
        
        // Verificar si ya existe otro género con el mismo nombre (insensible a mayúsculas/minúsculas)
        if (nombre && nombre.toLowerCase() !== genero.nombre.toLowerCase()) {
            const generoPorNombre = await Genero.findOne({
                _id: { $ne: id },
                nombre: { $regex: new RegExp(`^${nombre.trim()}$`, 'i') }
            });
            
            if (generoPorNombre) {
                erroresDuplicados.nombre = 'Ya existe un género con este nombre';
            }
        }
        
        // Verificar si ya existe otro género con la misma descripción
        if (descripcion && descripcion.toLowerCase() !== genero.descripcion.toLowerCase()) {
            const generoPorDescripcion = await Genero.findOne({
                _id: { $ne: id },
                descripcion: { $regex: new RegExp(`^${descripcion.trim()}$`, 'i') }
            });
            
            if (generoPorDescripcion) {
                erroresDuplicados.descripcion = 'Ya existe un género con esta descripción';
            }
        }
        
        // Si hay errores de validación o duplicados, devolverlos todos juntos
        if (erroresValidacion.length > 0 || Object.keys(erroresDuplicados).length > 0) {
            const errors = {};
            
            // Agregar errores de validación
            if (erroresValidacion.length > 0) {
                errors.validacion = erroresValidacion;
            }
            
            // Agregar errores de duplicados
            if (Object.keys(erroresDuplicados).length > 0) {
                Object.assign(errors, erroresDuplicados);
            }
            
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errors
            });
        }

        // Actualizar solo los campos proporcionados
        const actualizacion = {};
        if (nombre) {
            actualizacion.nombre = nombre.trim();
        }
        if (descripcion !== undefined) {
            actualizacion.descripcion = descripcion.trim();
        }
        
        // Aplicar actualización
        Object.assign(genero, actualizacion);

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
        
        // Verificar si el ID es válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'El ID proporcionado no es válido'
            });
        }

        const genero = await Genero.findById(id);
        
        if (!genero) {
            return res.status(404).json({
                success: false,
                error: 'No existe un género con ese ID'
            });
        }

        const nombreGenero = genero.nombre;
        
        // Obtener los libros que tienen este género
        const libros = await mongoose.connection.collection('Libros')
            .find({ generos: nombreGenero })
            .toArray();
        
        // Eliminar el género
        await Genero.findByIdAndDelete(id);

        // Preparar la respuesta base
        const respuesta = {
            success: true,
            message: 'Género eliminado exitosamente'
        };

        // Actualizar los libros que tenían este género
        if (libros.length > 0) {
            // Usar updateMany con $pull para eliminar el género de todos los libros de una vez
            await mongoose.connection.collection('Libros').updateMany(
                { generos: nombreGenero },
                { $pull: { generos: nombreGenero } }
            );

            const cantidad = libros.length;
            const mensajeLibros = cantidad === 1 ? 'libro' : 'libros';
            
            respuesta.librosActualizados = {
                mensaje: `Se eliminó el género de ${cantidad} ${mensajeLibros}`,
                cantidad: cantidad,
                libros: libros.map(libro => libro.titulo)
            };
        } else {
            respuesta.librosActualizados = 'No se actualizaron libros';
        }

        res.status(200).json(respuesta);
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