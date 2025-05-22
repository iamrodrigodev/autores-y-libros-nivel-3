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
    // Configuración del esquema
    timestamps: false,
    validateBeforeSave: false,
    versionKey: false, // Deshabilita el campo __v
    toJSON: { 
        virtuals: true,
        transform: function(_doc, ret) {
            delete ret._id; // Opcional: eliminar _id si no lo quieres en la respuesta
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function(_doc, ret) {
            delete ret._id; // Opcional: eliminar _id si no lo quieres en la respuesta
            delete ret.__v;
            return ret;
        }
    }
});

// Índice para búsquedas por nombre
GeneroSchema.index({ nombre: 1 }, { unique: true });

// Crear el modelo para Genero
const Genero = mongoose.model('Genero', GeneroSchema, 'Generos');

// Exportar el modelo para usarlo en otros archivos
module.exports = { Genero };
