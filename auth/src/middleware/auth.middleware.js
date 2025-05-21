const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
    let token;

    // Verificar si el token está en el encabezado
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener el token del encabezado
            token = req.headers.authorization.split(' ')[1];

            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Obtener el usuario del token
            req.user = await User.findById(decoded.id).select('-clave');

            next();
        } catch (error) {
            console.error('Error en la autenticación:', error);
            res.status(401).json({
                success: false,
                message: 'No autorizado, token fallido'
            });
        }
    }

    if (!token) {
        res.status(401).json({
            success: false,
            message: 'No autorizado, no se proporcionó token'
        });
    }
};

// Middleware para verificar roles de usuario
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `El usuario con rol ${req.user.role} no está autorizado para acceder a esta ruta`
            });
        }
        next();
    };
};
