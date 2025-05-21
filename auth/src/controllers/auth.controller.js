const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

// @desc    Autenticar usuario
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { telefono, clave } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ telefono });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isMatch = await user.matchPassword(clave);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token si no existe
        let token = user.token;
        if (!token) {
            token = jwt.sign(
                { id: user._id, telefono: user.telefono },
                process.env.JWT_SECRET
                // Sin expiración
            );
            
            // Guardar el token en la base de datos
            user.token = token;
            await user.save();
        }

        // Enviar respuesta
        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                nombre: user.nombre,
                apellido_paterno: user.apellido_paterno,
                apellido_materno: user.apellido_materno,
                telefono: user.telefono,
                direccion: user.direccion,
                fecha_nacimiento: user.fecha_nacimiento
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};

// @desc    Obtener perfil del usuario
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-clave -token');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};
