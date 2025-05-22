const mongoose = require('mongoose');
const { Schema } = mongoose;

// Importar la conexión a la base de datos
require('../config/database');

// Esquema de Autor
const AutorSchema = new Schema({
    nombre: { 
        type: String, 
        required: true,
        validate: {
            validator: async function(v) {
                try {
                    const autorExistente = await mongoose.connection.collection('Autores').findOne({ nombre: v });
                    if (autorExistente && (!this._id || !autorExistente._id.equals(this._id))) {
                        throw new Error('Ya existe un autor con este nombre');
                    }
                    return true;
                } catch (error) {
                    throw error;
                }
            }
        }
    },
    fecha_nacimiento: { 
        type: Date, 
        required: true,
        validate: {
            validator: function(v) {
                return v <= Date.now();  // Verificar que la fecha de nacimiento no sea futura
            },
            message: props => `${props.value} no es una fecha válida.`
        }
    },
    nacionalidad: { 
        type: String, 
        required: true, 
        validate: {
            validator: function(v) {
                // Verificar que solo haya una nacionalidad
                return typeof v === 'string' && v.trim().split(',').length === 1;
            },
            message: 'Debe contener solo una nacionalidad.'
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
}, { versionKey: false });

// Importar middlewares
const { actualizarFechaActualizacion } = require('../middlewares/autores.middleware');

// Aplicar middleware de actualización de fecha
AutorSchema.pre('save', actualizarFechaActualizacion);

// Crear el modelo para Autor
const Autor = mongoose.model("Autor", AutorSchema, "Autores");

// Exportar el modelo para usarlo en otros archivos
module.exports = { Autor };