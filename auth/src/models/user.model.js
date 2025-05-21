const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    nombre: String,
    apellido_paterno: String,
    apellido_materno: String,
    telefono: { 
        type: String, 
        required: true, 
        unique: true 
    },
    direccion: String,
    clave: { 
        type: String, 
        required: true 
    },
    fecha_nacimiento: Date,
    token: { 
        type: String, 
        default: '' 
    }
}, { 
    collection: 'Usuarios',
    timestamps: true
});

// Método para verificar la contraseña
userSchema.methods.matchPassword = async function(enteredPassword) {
    return this.clave === enteredPassword;
};

// Método para generar token
userSchema.methods.generateToken = function() {
    const token = jwt.sign(
        { id: this._id, telefono: this.telefono },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '30d' }
    );
    this.token = token;
    return token;
};

// Crear el modelo
const User = mongoose.model('User', userSchema);

// Exportar el modelo
module.exports = User;