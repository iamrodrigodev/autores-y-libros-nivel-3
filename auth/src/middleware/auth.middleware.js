const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Usuario = require('../models/user.model');

// Importar la configuración de la base de datos
require('dotenv').config({ path: '../../../.env' });

// Configuración de opciones de conexión
const options = {
    serverSelectionTimeoutMS: 5000,  // Tiempo de espera para seleccionar un servidor
    socketTimeoutMS: 30000          // Tiempo de espera de las operaciones
};

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection;
        }
        
        console.log('Conectando a MongoDB desde auth middleware...');
        await mongoose.connect(process.env.MONGO_URI, options);
        console.log('✅ Conexión a MongoDB establecida desde auth middleware');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB desde auth middleware:', error.message);
        throw error;
    }
};

const verificarToken = async (req, res, next) => {
    try {
        // Obtener el token del header
        const authHeader = req.headers.authorization || req.headers.Authorization;
        
        // Verificar si existe el token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. Token no proporcionado o formato incorrecto.'
            });
        }

        // Extraer el token
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado.'
            });
        }

        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verificar conexión a la base de datos
        if (mongoose.connection.readyState !== 1) {
            console.log('Reconectando a la base de datos...');
            await connectDB();
        }
        
        // Buscar al usuario usando el modelo correcto
        const usuario = await Usuario.findById(decoded.id).select('-clave').exec();
        
        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado.'
            });
        }

        // Agregar el usuario al request
        req.usuario = usuario;
        next();
        
    } catch (error) {
        console.error('Error en verificarToken:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error en la autenticación',
            error: error.message
        });
    }
};

// Middleware para roles
const autorizarRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.usuario.rol)) {
            return res.status(403).json({
                success: false,
                message: `Rol no autorizado`
            });
        }
        next();
    };
};

module.exports = { verificarToken, autorizarRoles };