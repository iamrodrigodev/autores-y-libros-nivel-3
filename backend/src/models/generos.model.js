const mongoose = require('mongoose');
const { Schema } = mongoose;

// Esquema de Genero
const GeneroSchema = new Schema({
    nombre: { 
        type: String, 
        required: true,
        trim: true
    },
    descripcion: { 
        type: String, 
        required: true,
        trim: true
    }
}, { 
    timestamps: false,
    validateBeforeSave: false 
});

// Índice para búsquedas por nombre
GeneroSchema.index({ nombre: 1 }, { unique: true });

// Crear el modelo para Genero
const Genero = mongoose.model('Genero', GeneroSchema, 'Generos');

// Exportar el modelo para usarlo en otros archivos
module.exports = { Genero };
