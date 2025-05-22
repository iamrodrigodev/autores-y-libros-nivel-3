const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { actualizarFechaActualizacion, formatearDatos } = require('../middlewares/libros.middleware');

// Esquema del libro
const LibroSchema = new Schema({
    titulo: { 
        type: String, 
        required: true,
        validate: {
            validator: async function(v) {
                try {
                    const libroExistente = await mongoose.connection.collection('Libros').findOne({ titulo: v });
                    if (libroExistente && (!this._id || libroExistente._id.toString() !== this._id.toString())) {
                        throw new Error('Ya existe un libro con este título');
                    }
                    return true;
                } catch (error) {
                    throw new Error(`Error al validar título: ${error.message}`);
                }
            }
        }
    },
    fecha_publicacion: {
        type: Date, 
        required: true,
        validate: {
            validator: function(v) {
                return v <= new Date();  // No permitir fecha futura
            },
            message: props => `${props.value} no es una fecha válida.`
        }
    },
    sinopsis: { 
        type: String, 
        required: true,
        validate: {
            validator: async function(v) {
                try {
                    const libroExistente = await mongoose.connection.collection('Libros').findOne({ sinopsis: v });
                    if (libroExistente && (!this._id || libroExistente._id.toString() !== this._id.toString())) {
                        throw new Error('Ya existe un libro con esta sinopsis');
                    }
                    return true;
                } catch (error) {
                    throw new Error(`Error al validar sinopsis: ${error.message}`);
                }
            }
        }
    },
    disponibilidad: { 
        type: Boolean, 
        default: true 
    },
    paginas: {
        type: Number, 
        required: true, 
        min: [1, 'El número de páginas debe ser mayor a 0.']
    },
    generos: {
        type: [String],
        required: true,
        validate: [
            {
                validator: function(v) {
                    // Verificar que no haya géneros duplicados
                    const generosUnicos = new Set(v);
                    return generosUnicos.size === v.length;
                },
                message: 'No se permiten géneros duplicados'
            },
            {
                validator: async function(v) {
                    try {
                        const generosNoExistentes = [];
                        for (const genero of v) {
                            const generoExistente = await mongoose.connection.collection('Generos').findOne({ nombre: genero });
                            if (!generoExistente) {
                                generosNoExistentes.push(genero);
                            }
                        }
                        if (generosNoExistentes.length > 0) {
                            throw new Error(`Los siguientes géneros no existen: ${generosNoExistentes.join(', ')}`);
                        }
                        return true;
                    } catch (error) {
                        throw new Error(`Error al validar géneros: ${error.message}`);
                    }
                }
            }
        ]
    },
    autores: {
        type: [String],
        required: true,
        validate: [
            {
                validator: function(v) {
                    // Verificar que no haya autores duplicados
                    const autoresUnicos = new Set(v);
                    return autoresUnicos.size === v.length;
                },
                message: 'No se permiten autores duplicados'
            },
            {
                validator: async function(v) {
                    try {
                        const autoresNoExistentes = [];
                        for (const autor of v) {
                            const autorExistente = await mongoose.connection.collection('Autores').findOne({ nombre: autor });
                            if (!autorExistente) {
                                autoresNoExistentes.push(autor);
                            }
                        }
                        if (autoresNoExistentes.length > 0) {
                            throw new Error(`Los siguientes autores no existen: ${autoresNoExistentes.join(', ')}`);
                        }
                        return true;
                    } catch (error) {
                        throw new Error(`Error al validar autores: ${error.message}`);
                    }
                }
            }
        ]
    }
}, { timestamps: true });

// Usar los middlewares
LibroSchema.pre('save', actualizarFechaActualizacion);
LibroSchema.pre('save', formatearDatos);

// Crear el modelo para Libro
const Libro = mongoose.model("Libro", LibroSchema, "Libros");

// Exportar el modelo para usarlo en otros archivos
module.exports = { Libro };