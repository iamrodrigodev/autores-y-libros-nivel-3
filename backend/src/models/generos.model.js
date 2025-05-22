const mongoose = require('mongoose');
const { Schema } = mongoose;

// Importar la conexión a la base de datos
require('../config/database');

// Esquema de Genero
const GeneroSchema = new Schema({
    nombre: { 
        type: String, 
        required: true,
        validate: {
            validator: async function(v) {
                try {
                    const generoExistente = await mongoose.connection.collection('Generos').findOne({ 
                        nombre: { $regex: new RegExp(`^${v}$`, 'i') },
                        _id: { $ne: this._id }
                    });
                    if (generoExistente) {
                        throw new Error('Ya existe un género con este nombre');
                    }
                    return true;
                } catch (error) {
                    throw error;
                }
            }
        }
    },
    descripcion: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return v.length >= 10 && v.length <= 500;
            },
            message: 'La descripción debe tener entre 10 y 500 caracteres.'
        }
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    },
    fecha_actualizacion: {
        type: Date,
        default: Date.now
    }
});

// Índice para búsquedas por nombre
GeneroSchema.index({ nombre: 1 }, { unique: true });

// Middleware para manejar errores de validación
GeneroSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('Ya existe un género con este nombre'));
    } else if (error.name === 'ValidationError') {
        next(new Error(error.message));
    } else {
        next(error);
    }
});

// Crear el modelo para Genero
const Genero = mongoose.model('Genero', GeneroSchema, 'Generos');

// Exportar el modelo para usarlo en otros archivos
module.exports = { Genero };
