const { Libro } = require('../models/libros.model');
const mongoose = require('mongoose');

// Función para formatear mensajes de error
const formatError = (error) => {
    if (error.name === 'CastError') {
        return 'El ID proporcionado no es válido';
    }
    if (error.name === 'ValidationError') {
        // Extraer solo el mensaje de error sin la ruta completa
        const messages = Object.values(error.errors).map(val => val.message);
        return messages.length ? messages[0] : error.message;
    }
    if (error.name === 'MongoError' && error.code === 11000) {
        return 'Ya existe un libro con ese título o sinopsis';
    }
    return error.message || 'Error al procesar la solicitud';
};

// Crear un nuevo libro
exports.crearLibro = async (req, res) => {
    try {
        const { 
            titulo, 
            fecha_publicacion, 
            sinopsis, 
            paginas, 
            generos, 
            autores,
            disponibilidad = true // Valor por defecto
        } = req.body;

        const errores = [];
        const now = new Date();

        // 1. Validar campos requeridos
        if (!titulo || titulo.trim() === '') errores.push('El título es obligatorio');
        if (!fecha_publicacion) errores.push('La fecha de publicación es obligatoria');
        if (!sinopsis || sinopsis.trim() === '') errores.push('La sinopsis es obligatoria');
        if (paginas === undefined || paginas === null || paginas === '') {
            errores.push('El número de páginas es obligatorio');
        }
        if (!generos || generos.length === 0) errores.push('Debe proporcionar al menos un género');
        if (!autores || autores.length === 0) errores.push('Debe proporcionar al menos un autor');

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
        const fechaPub = new Date(fecha_publicacion);
        if (isNaN(fechaPub.getTime())) {
            errores.push('La fecha de publicación no es válida');
        } else if (fechaPub > now) {
            errores.push('No se puede introducir una fecha futura');
        }

        // Validar páginas
        const numPaginas = parseInt(paginas, 10);
        if (isNaN(numPaginas) || numPaginas < 1) {
            errores.push('El número de páginas debe ser mayor a 0');
        }

        // Validar géneros
        if (!Array.isArray(generos)) {
            errores.push('Los géneros deben ser un array');
        } else {
            const generosUnicos = [...new Set(generos.map(g => g?.trim()))];
            
            // Verificar si hay géneros vacíos
            if (generos.some(g => !g || g.trim() === '')) {
                errores.push('Los géneros no pueden estar vacíos');
            }
            
            // Verificar duplicados
            if (generosUnicos.length !== generos.length) {
                errores.push('No se permiten géneros duplicados');
            }
            
            // Verificar existencia de géneros en la base de datos
            const generosExistentes = await mongoose.connection.collection('Generos').find({
                nombre: { $in: generos.map(g => g.trim()) }
            }).toArray();
            
            if (generosExistentes.length !== generos.length) {
                const generosInvalidos = generos.filter(g => 
                    !generosExistentes.some(ge => ge.nombre === g.trim())
                );
                errores.push(`Los siguientes géneros no existen: ${generosInvalidos.join(', ')}`);
            }
        }

        // Validar autores
        if (!Array.isArray(autores)) {
            errores.push('Los autores deben ser un array');
        } else {
            const autoresUnicos = [...new Set(autores.map(a => a?.trim()))];
            
            // Verificar si hay autores vacíos
            if (autores.some(a => !a || a.trim() === '')) {
                errores.push('Los nombres de los autores no pueden estar vacíos');
            }
            
            // Verificar duplicados
            if (autoresUnicos.length !== autores.length) {
                errores.push('No se permiten autores duplicados');
            }
            
            // Verificar existencia de autores en la base de datos
            const autoresExistentes = await mongoose.connection.collection('Autores').find({
                nombre: { $in: autores.map(a => a.trim()) }
            }).toArray();
            
            if (autoresExistentes.length !== autores.length) {
                const autoresInvalidos = autores.filter(a => 
                    !autoresExistentes.some(ae => ae.nombre === a.trim())
                );
                errores.push(`Los siguientes autores no existen: ${autoresInvalidos.join(', ')}`);
            }
        }

        // Validar título único
        const tituloExistente = await mongoose.connection.collection('Libros').findOne({ 
            titulo: { $regex: new RegExp(`^${titulo.trim()}$`, 'i') } 
        });
        
        if (tituloExistente) {
            errores.push('Ya existe un libro con este título');
        }
        
        // Validar sinopsis única
        const sinopsisExistente = await mongoose.connection.collection('Libros').findOne({ 
            sinopsis: { $regex: new RegExp(`^${sinopsis.trim()}$`, 'i') } 
        });
        
        if (sinopsisExistente) {
            errores.push('Ya existe un libro con esta sinopsis');
        }

        // Si hay errores de validación, retornarlos todos juntos
        if (errores.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errores
            });
        }

        // Crear el nuevo libro
        const nuevoLibro = new Libro({
            titulo: titulo.trim(),
            fecha_publicacion: new Date(fecha_publicacion),
            sinopsis: sinopsis.trim(),
            paginas: parseInt(paginas, 10),
            generos: generos.map(g => g.trim()),
            autores: autores.map(a => a.trim()),
            disponibilidad
        });

        // Validar duplicados de título y sinopsis
        try {
            // Verificar título duplicado
            const tituloExistente = await Libro.findOne({ 
                titulo: { $regex: new RegExp(`^${titulo.trim()}$`, 'i') } 
            });
            
            if (tituloExistente) {
                errores.push('Ya existe un libro con este título');
            }
            
            // Verificar sinopsis duplicada
            const sinopsisExistente = await Libro.findOne({ 
                sinopsis: { $regex: new RegExp(`^${sinopsis.trim()}$`, 'i') } 
            });
            
            if (sinopsisExistente) {
                errores.push('Ya existe un libro con esta sinopsis');
            }
            
            if (errores.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Error de validación',
                    errors: errores
                });
            }
            
            // Guardar el libro en la base de datos
            const libroGuardado = await nuevoLibro.save();

            // Respuesta exitosa
            res.status(201).json({
                success: true,
                message: 'Libro creado exitosamente',
                data: libroGuardado
            });
            
        } catch (error) {
            console.error('Error al guardar el libro:', error);
            throw error;
        }

    } catch (error) {
        console.error('Error al crear libro:', error);
        
        // Si es un error de validación de Mongoose que no se capturó antes
        if (error.name === 'ValidationError') {
            const errores = [];
            
            if (error.errors) {
                Object.values(error.errors).forEach(({ message }) => {
                    if (!errores.includes(message)) {
                        errores.push(message);
                    }
                });
            }
            
            if (errores.length === 0 && error.message) {
                errores.push(error.message);
            }
            
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errores
            });
        }
        
        // Si es un error de duplicado
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: ['Ya existe un libro con el mismo título o sinopsis']
            });
        }
        
        // Para otros errores
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            errors: [formatError(error)]
        });
    }
};

// Obtener todos los libros
exports.obtenerLibros = async (_req, res) => {
    try {
        const libros = await Libro.find().sort({ titulo: 1 });
        
        if (libros.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay libros registrados',
                data: []
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Libros encontrados',
            count: libros.length,
            data: libros
        });
    } catch (error) {
        console.error('Error al obtener libros:', error);
        res.status(500).json({
            success: false,
            error: formatError(error)
        });
    }
};

// Obtener un libro por ID
exports.obtenerLibroPorId = async (req, res) => {
    try {
        const libro = await Libro.findById(req.params.id);
        
        if (!libro) {
            return res.status(404).json({
                success: false,
                error: 'Libro no encontrado con el ID proporcionado'
            });
        }
        
        res.status(200).json({
            success: true,
            data: libro
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: formatError(error)
        });
    }
};