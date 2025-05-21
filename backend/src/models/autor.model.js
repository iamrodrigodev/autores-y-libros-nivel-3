const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Esquema de Autor
const AutorSchema = new Schema({
    nombre: { 
        type: String, 
        required: [true, 'El nombre del autor es obligatorio'],
        trim: true,
        validate: {
            validator: async function(v) {
                try {
                    const autorExistente = await mongoose.model('Autor').findOne({ 
                        nombre: v,
                        _id: { $ne: this._id } // Excluir el documento actual en actualizaciones
                    });
                    return !autorExistente; // Retorna false si ya existe un autor con el mismo nombre
                } catch (error) {
                    throw new Error(`Error al validar nombre: ${error.message}`);
                }
            },
            message: 'Ya existe un autor con este nombre'
        }
    },
    fecha_nacimiento: { 
        type: Date, 
        required: [true, 'La fecha de nacimiento es obligatoria'],
        validate: {
            validator: function(v) {
                return v <= new Date();  // Verificar que la fecha de nacimiento no sea futura
            },
            message: 'La fecha de nacimiento no puede ser futura'
        }
    },
    nacionalidad: { 
        type: String, 
        required: [true, 'La nacionalidad es obligatoria'],
        trim: true,
        validate: {
            validator: function(v) {
                // Verificar que solo haya una nacionalidad
                return typeof v === 'string' && v.trim().split(',').length === 1;
            },
            message: 'Debe contener solo una nacionalidad'
        }
    },
    biografia: {
        type: String,
        trim: true
    },
    fecha_fallecimiento: {
        type: Date,
        validate: {
            validator: function(v) {
                if (!v) return true; // Opcional
                return v <= new Date() && v > this.fecha_nacimiento;
            },
            message: 'La fecha de fallecimiento debe ser posterior a la de nacimiento y no puede ser futura'
        }
    }
}, {
    timestamps: true,
    versionKey: false
});

// Middleware para limpiar espacios en blanco
AutorSchema.pre('save', function(next) {
    if (this.nombre) this.nombre = this.nombre.trim();
    if (this.nacionalidad) this.nacionalidad = this.nacionalidad.trim();
    next();
});

// Crear el modelo para Autor
const Autor = mongoose.model('Autor', AutorSchema, 'Autores');

// Exportar el modelo
module.exports = Autor;