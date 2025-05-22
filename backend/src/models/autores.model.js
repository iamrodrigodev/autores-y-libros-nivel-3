const mongoose = require('mongoose');
const { Schema } = mongoose;

// Esquema de Autor
const AutorSchema = new Schema({
    nombre: { 
        type: String, 
        required: true,
        trim: true
    },
    fecha_nacimiento: { 
        type: Date, 
        required: true
    },
    nacionalidad: { 
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
        transform: function(doc, ret) {
            delete ret._id; // Opcional: eliminar _id si no lo quieres en la respuesta
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret._id; // Opcional: eliminar _id si no lo quieres en la respuesta
            delete ret.__v;
            return ret;
        }
    }
});

// Crear el modelo para Autor
const Autor = mongoose.model('Autor', AutorSchema, 'Autores');

// Exportar el modelo para usarlo en otros archivos
module.exports = { Autor };