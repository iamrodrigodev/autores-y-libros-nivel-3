const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Configuración del esquema
const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        trim: true
    },
    apellido_paterno: {
        type: String,
        trim: true
    },
    apellido_materno: {
        type: String,
        trim: true
    },
    telefono: { 
        type: String, 
        required: [true, 'El teléfono es requerido'],
        unique: true,
        trim: true,
        match: [/^[0-9]{9}$/, 'El teléfono debe tener 9 dígitos']
    },
    direccion: {
        type: String,
        trim: true
    },
    clave: { 
        type: String, 
        required: [true, 'La contraseña es requerida']
    },
    fecha_nacimiento: {
        type: Date
    },
    token: { 
        type: String, 
        default: '' 
    },
    rol: {
        type: String,
        enum: ['usuario', 'admin'],
        default: 'usuario'
    },
    activo: {
        type: Boolean,
        default: true
    }
}, { 
    collection: 'Usuarios',
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.clave;
            delete ret.__v;
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.clave;
            delete ret.__v;
            return ret;
        }
    }
});

// Índices para mejorar el rendimiento de búsquedas comunes
// Nota: El índice de teléfono ya está definido en el campo con 'unique: true'
userSchema.index({ token: 1 });

/**
 * Verifica si la contraseña proporcionada coincide con la del usuario
 * @param {string} enteredPassword - Contraseña a verificar
 * @returns {Promise<boolean>} - True si la contraseña es correcta
 */
userSchema.methods.matchPassword = async function(enteredPassword) {
    try {
        return this.clave === enteredPassword;
    } catch (error) {
        console.error('Error al verificar la contraseña:', error);
        return false;
    }
};

/**
 * Genera un token JWT para el usuario
 * @returns {string} - Token JWT generado
 */
userSchema.methods.generateToken = function() {
    try {
        const token = jwt.sign(
            { 
                id: this._id, 
                telefono: this.telefono,
                rol: this.rol 
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        this.token = token;
        return token;
    } catch (error) {
        console.error('Error al generar el token:', error);
        throw error;
    }
};

// Middleware para limpiar datos antes de guardar
userSchema.pre('save', function(next) {
    if (this.telefono) {
        this.telefono = this.telefono.trim();
    }
    next();
});

// Crear y exportar el modelo
const User = mongoose.model('User', userSchema);
module.exports = User;