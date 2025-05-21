const User = require('../models/user.model');

// Función para formatear la fecha actual
const getFormattedTime = () => {
    return new Date().toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
    });
};

/**
 * @desc    Autenticar usuario y obtener token
 * @route   POST /api/auth/login
 * @access  Público
 */
exports.loginUser = async (req, res) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substr(2, 9);
    
    const log = (message, data) => {
        const timestamp = getFormattedTime();
        console.log(`[${timestamp}] [${requestId}] ${message}`, data || '');
    };

    try {
        const { telefono, clave } = req.body;
        
        // Validar datos de entrada
        if (!telefono || !clave) {
            log('Error: Faltan credenciales');
            return res.status(400).json({
                success: false,
                message: 'Por favor ingrese teléfono y contraseña'
            });
        }

        log(`Autenticando usuario: ${telefono}`);
        
        // Buscar usuario en la base de datos
        const user = await User.findOne({ telefono: telefono.trim() });
        
        if (!user) {
            log('Error: Usuario no encontrado');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        
        // Verificar contraseña
        const isMatch = await user.matchPassword(clave);
        if (!isMatch) {
            log('Error: Contraseña incorrecta');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        
        // Generar token si no existe o está vacío
        if (!user.token) {
            log('Generando nuevo token');
            user.token = user.generateToken();
            await user.save();
            log('Token generado y guardado');
        } else {
            log('Usando token existente');
        }

        // Crear objeto de respuesta sin información sensible
        const userResponse = {
            id: user._id,
            nombre: user.nombre,
            telefono: user.telefono,
            apellido_paterno: user.apellido_paterno,
            apellido_materno: user.apellido_materno,
            direccion: user.direccion
        };

        const response = {
            success: true,
            token: user.token,
            user: userResponse
        };

        const responseTime = Date.now() - startTime;
        log(`Autenticación exitosa - Tiempo: ${responseTime}ms`);
        
        res.status(200).json(response);

    } catch (error) {
        const errorTime = Date.now() - startTime;
        log(`Error en autenticación (${errorTime}ms): ${error.message}`);
        
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};