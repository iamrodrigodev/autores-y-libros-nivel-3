const mongoose = require('mongoose');
const { Schema } = mongoose;

// Importar la conexión a la base de datos
require('../config/database');

// Importar middlewares
const { formatearDatos } = require('../middlewares/autores.middleware');

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
    // Deshabilitar la validación automática de Mongoose
    validateBeforeSave: false
});

// Aplicar middleware para formatear datos
AutorSchema.pre('save', formatearDatos);
AutorSchema.pre('findOneAndUpdate', formatearDatos);

// Crear el modelo para Autor
const Autor = mongoose.model('Autor', AutorSchema, 'Autores');

// Exportar el modelo para usarlo en otros archivos
module.exports = { Autor };