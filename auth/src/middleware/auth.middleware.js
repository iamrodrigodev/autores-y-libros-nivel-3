const jwt = require('jsonwebtoken');
const Usuario = require('../models/user.model');

const verificarToken = async (req, res, next) => {
    try {
        console.log('Headers recibidos:', JSON.stringify(req.headers, null, 2));
        
        // Obtener el token del header
        const authHeader = req.headers.authorization || req.headers.Authorization;
        console.log('Header de autorización:', authHeader);
        
        // Verificar si existe el token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('Token no proporcionado o formato incorrecto');
            return res.status(401).json({
                success: false,
                message: 'Acceso denegado. Token no proporcionado o formato incorrecto.'
            });
        }

        // Extraer el token
        const token = authHeader.split(' ')[1];
        console.log('Token extraído:', token ? '*****' + token.slice(-5) : 'No hay token');
        
        if (!token) {
            console.log('Token vacío después de extraer');
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado.'
            });
        }

        // Verificar el token
        console.log('Verificando token...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decodificado:', decoded);
        
        // Buscar al usuario
        const usuario = await Usuario.findById(decoded.id).select('-clave');
        
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