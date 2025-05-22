const mongoose = require('mongoose');
const { Schema } = mongoose;

// Esquema del libro
const LibroSchema = new Schema({
    titulo: { 
        type: String, 
        required: true,
        trim: true
    },
    fecha_publicacion: {
        type: Date, 
        required: true
    },
    sinopsis: { 
        type: String, 
        required: true,
        trim: true
    },
    disponibilidad: { 
        type: Boolean, 
        default: true 
    },
    paginas: {
        type: Number, 
        required: true
    },
    generos: {
        type: [String],
        required: true
    },
    autores: {
        type: [String],
        required: true
    }
}, { 
    // Deshabilitar la validación automática de Mongoose
    validateBeforeSave: false,
    versionKey: false // Deshabilitar __v
});

// Crear el modelo con el nombre de colección explícito
const Libro = mongoose.model('Libro', LibroSchema, 'Libros');

// Exportar el modelo para usarlo en otros archivos
module.exports = { Libro };