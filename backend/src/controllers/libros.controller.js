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

        const errores = {};
        const now = new Date();

        // 1. Validar campos requeridos
        if (!titulo || titulo.trim() === '') errores.titulo = 'El título es obligatorio';
        if (!fecha_publicacion) errores.fecha_publicacion = 'La fecha de publicación es obligatoria';
        if (!sinopsis || sinopsis.trim() === '') errores.sinopsis = 'La sinopsis es obligatoria';
        if (paginas === undefined || paginas === null || paginas === '') {
            errores.paginas = 'El número de páginas es obligatorio';
        }
        if (!generos || generos.length === 0) errores.generos = 'Debe proporcionar al menos un género';
        if (!autores || autores.length === 0) errores.autores = 'Debe proporcionar al menos un autor';

        // 2. Validar formatos y valores solo si los campos requeridos están presentes
        if (fecha_publicacion) {
            const fechaPub = new Date(fecha_publicacion);
            if (isNaN(fechaPub.getTime())) {
                errores.fecha_publicacion = 'La fecha de publicación no es válida';
            } else if (fechaPub > now) {
                errores.fecha_publicacion = 'No se puede introducir una fecha futura';
            }
        }

        // Validar páginas si está presente
        if (paginas !== undefined && paginas !== null && paginas !== '') {
            const numPaginas = parseInt(paginas, 10);
            if (isNaN(numPaginas) || numPaginas < 1) {
                errores.paginas = 'El número de páginas debe ser mayor a 0';
            }
        }

        // Validar géneros si están presentes
        if (generos && generos.length > 0) {
            errores.generos = [];
            
            if (!Array.isArray(generos)) {
                errores.generos.push('Los géneros deben ser un array');
            } else {
                // Verificar si hay géneros vacíos
                const generosVacios = generos.some(g => !g || g.trim() === '');
                if (generosVacios) {
                    errores.generos.push('Los géneros no pueden estar vacíos');
                }
                
                // Convertir a minúsculas para comparación insensible a mayúsculas
                const generosLower = generos.map(g => g.trim().toLowerCase());
                const generosUnicos = [...new Set(generosLower)];
                
                // Verificar duplicados (insensible a mayúsculas/minúsculas)
                if (generosUnicos.length !== generos.length) {
                    // Encontrar los duplicados (insensible a mayúsculas/minúsculas) pero mantener el formato original
                    const duplicados = [];
                    const vistos = new Set();
                    
                    for (const genero of generos) {
                        const generoLower = genero.trim().toLowerCase();
                        if (vistos.has(generoLower)) {
                            // Si ya vimos este género (en minúsculas) pero con diferente formato
                            const yaAgregado = duplicados.some(d => d.toLowerCase() === generoLower);
                            if (!yaAgregado) {
                                duplicados.push(genero);
                            }
                        } else {
                            vistos.add(generoLower);
                        }
                    }
                    
                    errores.generos.push(`Géneros duplicados: ${duplicados.join(', ')}`);
                }
                
                // Verificar existencia de géneros en la base de datos
                if (generos.length > 0 && !generosVacios) {
                    const generosExistentes = await mongoose.connection.collection('Generos').find({
                        nombre: { $in: generos.map(g => g.trim()) }
                    }).toArray();
                    
                    // Mantener el formato original de los géneros no encontrados
                    const generosInvalidos = [];
                    const vistos = new Set();
                    
                    for (const genero of generos) {
                        const generoLower = genero.trim().toLowerCase();
                        if (!vistos.has(generoLower) && 
                            !generosExistentes.some(ge => ge.nombre.toLowerCase() === generoLower)) {
                            generosInvalidos.push(genero);
                            vistos.add(generoLower);
                        }
                    }
                    
                    if (generosInvalidos.length > 0) {
                        errores.generos.push(`Géneros no encontrados: ${generosInvalidos.join(', ')}`);
                    }
                }
                
                // Si no hay errores, eliminar el array
                if (errores.generos.length === 0) {
                    delete errores.generos;
                }
            }
        }

        // Validar autores
        if (autores && autores.length > 0) {
            errores.autores = [];
            
            if (!Array.isArray(autores)) {
                errores.autores.push('Los autores deben ser un array');
            } else {
                // Verificar si hay autores vacíos
                const autoresVacios = autores.some(a => !a || a.trim() === '');
                if (autoresVacios) {
                    errores.autores.push('Los nombres de autores no pueden estar vacíos');
                }
                
                // Convertir a minúsculas para comparación insensible a mayúsculas
                const autoresLower = autores.map(a => a.trim().toLowerCase());
                const autoresUnicos = [...new Set(autoresLower)];
                
                // Verificar duplicados (insensible a mayúsculas/minúsculas)
                if (autoresUnicos.length !== autores.length) {
                    // Encontrar los duplicados (insensible a mayúsculas/minúsculas) pero mantener el formato original
                    const duplicados = [];
                    const vistos = new Set();
                    
                    for (const autor of autores) {
                        const autorLower = autor.trim().toLowerCase();
                        if (vistos.has(autorLower)) {
                            // Si ya vimos este autor (en minúsculas) pero con diferente formato
                            const yaAgregado = duplicados.some(d => d.toLowerCase() === autorLower);
                            if (!yaAgregado) {
                                duplicados.push(autor);
                            }
                        } else {
                            vistos.add(autorLower);
                        }
                    }
                    
                    errores.autores.push(`Autores duplicados: ${duplicados.join(', ')}`);
                }
                
                // Verificar existencia de autores en la base de datos
                if (autores.length > 0 && !autoresVacios) {
                    const autoresExistentes = await mongoose.connection.collection('Autores').find({
                        nombre: { $in: autores.map(a => a.trim()) }
                    }).toArray();
                    
                    // Mantener el formato original de los autores no encontrados
                    const autoresInvalidos = [];
                    const vistos = new Set();
                    
                    for (const autor of autores) {
                        const autorLower = autor.trim().toLowerCase();
                        if (!vistos.has(autorLower) && 
                            !autoresExistentes.some(ae => ae.nombre.toLowerCase() === autorLower)) {
                            autoresInvalidos.push(autor);
                            vistos.add(autorLower);
                        }
                    }
                    
                    if (autoresInvalidos.length > 0) {
                        errores.autores.push(`Autores no encontrados: ${autoresInvalidos.join(', ')}`);
                    }
                }
                
                // Si no hay errores, eliminar el array
                if (errores.autores.length === 0) {
                    delete errores.autores;
                }
            }
        }

        // Validar título único (insensible a mayúsculas/minúsculas) solo si no hay errores previos
        if (titulo && titulo.trim() !== '' && !errores.titulo) {
            const tituloExistente = await mongoose.connection.collection('Libros').findOne({
                titulo: { $regex: new RegExp(`^${titulo.trim()}$`, 'i') }
            });
            
            if (tituloExistente) {
                errores.titulo = 'Ya existe un libro con este título';
            }
        }
        
        // Validar sinopsis única solo si no hay errores previos
        if (sinopsis && sinopsis.trim() !== '' && !errores.sinopsis) {
            const sinopsisExistente = await mongoose.connection.collection('Libros').findOne({
                sinopsis: { $regex: new RegExp(`^${sinopsis.trim()}$`, 'i') }
            });
            
            if (sinopsisExistente) {
                errores.sinopsis = 'Ya existe un libro con esta sinopsis';
            }
        }

        // Si hay errores de validación, retornarlos todos juntos
        if (Object.keys(errores).length > 0) {
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

// Actualizar un libro existente
exports.actualizarLibro = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            titulo, 
            fecha_publicacion, 
            sinopsis, 
            paginas, 
            generos, 
            autores,
            disponibilidad
        } = req.body;

        const errores = {};
        const now = new Date();

        // Obtener el libro actual primero
        const libroActual = await Libro.findById(id);
        if (!libroActual) {
            return res.status(404).json({
                success: false,
                error: 'Libro no encontrado con el ID proporcionado'
            });
        }

        // Validar campos si se están actualizando
        if (titulo !== undefined) {
            if (titulo.trim() === '') {
                errores.titulo = 'El título no puede estar vacío';
            } else {
                // Verificar si ya existe otro libro con el mismo título (ignorando mayúsculas/minúsculas)
                const libroExistente = await Libro.findOne({
                    _id: { $ne: id }, // Excluir el libro actual
                    titulo: { $regex: new RegExp(`^${titulo.trim()}$`, 'i') }
                });
                
                if (libroExistente) {
                    errores.titulo = 'Ya existe un libro con este título';
                }
            }
        }

        if (fecha_publicacion !== undefined) {
            const fechaPub = new Date(fecha_publicacion);
            if (isNaN(fechaPub.getTime())) {
                errores.fecha_publicacion = 'La fecha de publicación no es válida';
            } else if (fechaPub > now) {
                errores.fecha_publicacion = 'No se puede introducir una fecha futura';
            }
        }

        if (sinopsis !== undefined) {
            if (sinopsis.trim() === '') {
                errores.sinopsis = 'La sinopsis no puede estar vacía';
            } else {
                // Verificar si ya existe otro libro con la misma sinopsis (ignorando espacios en blanco al inicio/fin)
                const libroConMismaSinopsis = await Libro.findOne({
                    _id: { $ne: id }, // Excluir el libro actual
                    sinopsis: { $regex: new RegExp(`^\\s*${sinopsis.trim()}\\s*$`, 'i') }
                });
                
                if (libroConMismaSinopsis) {
                    errores.sinopsis = 'Ya existe un libro con esta sinopsis';
                }
            }
        }

        if (paginas !== undefined) {
            const numPaginas = parseInt(paginas, 10);
            if (isNaN(numPaginas) || numPaginas < 1) {
                errores.paginas = 'El número de páginas debe ser mayor a 0';
            }
        }


        // Validar géneros si se están actualizando
        if (generos !== undefined) {
            errores.generos = [];
            
            if (!Array.isArray(generos) || generos.length === 0) {
                errores.generos.push('Debe proporcionar al menos un género');
            } else {
                // Verificar si hay géneros vacíos
                const generosVacios = generos.some(g => !g || g.trim() === '');
                if (generosVacios) {
                    errores.generos.push('Los géneros no pueden estar vacíos');
                }
                
                // Convertir a minúsculas para comparación insensible a mayúsculas
                const generosLower = generos.map(g => g.trim().toLowerCase());
                const generosUnicos = [...new Set(generosLower)];
                
                // Verificar duplicados (insensible a mayúsculas/minúsculas)
                if (generosUnicos.length !== generos.length) {
                    // Encontrar los duplicados (insensible a mayúsculas/minúsculas) pero mantener el formato original
                    const duplicados = [];
                    const vistos = new Set();
                    
                    for (const genero of generos) {
                        const generoLower = genero.trim().toLowerCase();
                        if (vistos.has(generoLower)) {
                            // Si ya vimos este género (en minúsculas) pero con diferente formato
                            const yaAgregado = duplicados.some(d => d.toLowerCase() === generoLower);
                            if (!yaAgregado) {
                                duplicados.push(genero);
                            }
                        } else {
                            vistos.add(generoLower);
                        }
                    }
                    
                    errores.generos.push(`Géneros duplicados: ${duplicados.join(', ')}`);
                }
                
                // Verificar existencia de géneros en la base de datos
                if (generos.length > 0 && !generosVacios) {
                    const generosExistentes = await mongoose.connection.collection('Generos').find({
                        nombre: { $in: generos.map(g => g.trim()) }
                    }).toArray();
                    
                    // Mantener el formato original de los géneros no encontrados
                    const generosInvalidos = [];
                    const vistos = new Set();
                    
                    for (const genero of generos) {
                        const generoLower = genero.trim().toLowerCase();
                        if (!vistos.has(generoLower) && 
                            !generosExistentes.some(ge => ge.nombre.toLowerCase() === generoLower)) {
                            generosInvalidos.push(genero);
                            vistos.add(generoLower);
                        }
                    }
                    
                    if (generosInvalidos.length > 0) {
                        errores.generos.push(`Géneros no encontrados: ${generosInvalidos.join(', ')}`);
                    }
                }
                
                // Si no hay errores, eliminar el array
                if (errores.generos.length === 0) {
                    delete errores.generos;
                }
            }
        }

        // Validar autores si se están actualizando
        if (autores !== undefined) {
            errores.autores = [];
            
            if (!Array.isArray(autores) || autores.length === 0) {
                errores.autores.push('Debe proporcionar al menos un autor');
            } else {
                // Verificar si hay autores vacíos
                const autoresVacios = autores.some(a => !a || a.trim() === '');
                if (autoresVacios) {
                    errores.autores.push('Los nombres de autores no pueden estar vacíos');
                }
                
                // Convertir a minúsculas para comparación insensible a mayúsculas
                const autoresLower = autores.map(a => a.trim().toLowerCase());
                const autoresUnicos = [...new Set(autoresLower)];
                
                // Verificar duplicados (insensible a mayúsculas/minúsculas)
                if (autoresUnicos.length !== autores.length) {
                    // Encontrar los duplicados (insensible a mayúsculas/minúsculas) pero mantener el formato original
                    const duplicados = [];
                    const vistos = new Set();
                    
                    for (const autor of autores) {
                        const autorLower = autor.trim().toLowerCase();
                        if (vistos.has(autorLower)) {
                            // Si ya vimos este autor (en minúsculas) pero con diferente formato
                            const yaAgregado = duplicados.some(d => d.toLowerCase() === autorLower);
                            if (!yaAgregado) {
                                duplicados.push(autor);
                            }
                        } else {
                            vistos.add(autorLower);
                        }
                    }
                    
                    errores.autores.push(`Autores duplicados: ${duplicados.join(', ')}`);
                }
                
                // Verificar existencia de autores en la base de datos
                if (autores.length > 0 && !autoresVacios) {
                    const autoresExistentes = await mongoose.connection.collection('Autores').find({
                        nombre: { $in: autores.map(a => a.trim()) }
                    }).toArray();
                    
                    // Mantener el formato original de los autores no encontrados
                    const autoresInvalidos = [];
                    const vistos = new Set();
                    
                    for (const autor of autores) {
                        const autorLower = autor.trim().toLowerCase();
                        if (!vistos.has(autorLower) && 
                            !autoresExistentes.some(ae => ae.nombre.toLowerCase() === autorLower)) {
                            autoresInvalidos.push(autor);
                            vistos.add(autorLower);
                        }
                    }
                    
                    if (autoresInvalidos.length > 0) {
                        errores.autores.push(`Autores no encontrados: ${autoresInvalidos.join(', ')}`);
                    }
                }
                
                // Si no hay errores, eliminar el array
                if (errores.autores.length === 0) {
                    delete errores.autores;
                }
            }
        }

        // Si hay errores de validación, devolverlos
        if (Object.keys(errores).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errores
            });
        }

        // Preparar los datos para actualizar
        const actualizacion = {};
        if (titulo !== undefined) actualizacion.titulo = titulo.trim();
        if (fecha_publicacion !== undefined) actualizacion.fecha_publicacion = new Date(fecha_publicacion);
        if (sinopsis !== undefined) actualizacion.sinopsis = sinopsis.trim();
        if (paginas !== undefined) actualizacion.paginas = parseInt(paginas, 10);
        if (generos !== undefined) actualizacion.generos = generos.map(g => g.trim());
        if (autores !== undefined) actualizacion.autores = autores;
        if (disponibilidad !== undefined) actualizacion.disponibilidad = disponibilidad;

        // Actualizar el libro
        const libroActualizado = await Libro.findByIdAndUpdate(
            id, 
            actualizacion,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Libro actualizado exitosamente',
            data: libroActualizado
        });
    } catch (error) {
        console.error('Error al actualizar libro:', error);
        res.status(500).json({
            success: false,
            error: formatError(error)
        });
    }
};