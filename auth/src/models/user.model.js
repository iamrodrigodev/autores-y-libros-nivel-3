const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido_paterno: {
        type: String,
        required: true,
        trim: true
    },
    apellido_materno: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    direccion: {
        type: String,
        required: true
    },
    clave: {
        type: String,
        required: true,
        minlength: 6
    },
    fecha_nacimiento: {
        type: Date,
        required: true
    },
    token: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
    versionKey: false
});

// Método para comparar contraseñas
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.clave);
};

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('clave')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.clave = await bcrypt.hash(this.clave, salt);
});

// Middleware para actualizar el token si está vacío
userSchema.pre('save', async function(next) {
    if (this.token === '') {
        const jwt = require('jsonwebtoken');
        this.token = jwt.sign(
            { id: this._id, telefono: this.telefono },
            process.env.JWT_SECRET
            // Sin expiración
        );
    }
    next();
});

const User = mongoose.model('Usuarios', userSchema);
module.exports = User;
