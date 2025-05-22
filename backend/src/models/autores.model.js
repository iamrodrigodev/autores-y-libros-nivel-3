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
    // Deshabilitar la validación automática de Mongoose y los timestamps
    timestamps: false,
    validateBeforeSave: false
});

// Crear el modelo para Autor
const Autor = mongoose.model('Autor', AutorSchema, 'Autores');

// Exportar el modelo para usarlo en otros archivos
module.exports = { Autor };