const User = require('../models/user.model');

/**
 * @desc    Autenticar usuario y obtener token
 * @route   POST /api/auth/login
 * @access  Público
 */
exports.loginUser = async (req, res) => {
    try {
        const { telefono, clave } = req.body;
        
        // Validar datos de entrada
        if (!telefono || !clave) {
            return res.status(400).json({
                success: false,
                message: 'Por favor ingrese teléfono y contraseña'
            });
        }

        console.log('Buscando usuario con teléfono:', telefono);
        
        // Buscar usuario en la base de datos
        const user = await User.findOne({ telefono: telefono.trim() });
        
        if (!user) {
            console.log('Usuario no encontrado');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        console.log('Usuario encontrado:', user);
        
        // Verificar contraseña
        const isMatch = await user.matchPassword(clave);
        if (!isMatch) {
            console.log('Contraseña incorrecta');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        console.log('Contraseña válida');
        
        // Generar token si no existe o está vacío
        if (!user.token) {
            console.log('Generando nuevo token');
            user.token = user.generateToken();
            await user.save();
            console.log('Token generado y guardado');
        } else {
            console.log('Usando token existente');
        }

        // Crear objeto de respuesta
        const response = {
            success: true,
            token: user.token,
            user: {
                id: user._id,
                nombre: user.nombre,
                telefono: user.telefono,
                apellido_paterno: user.apellido_paterno,
                apellido_materno: user.apellido_materno,
                direccion: user.direccion
            }
        };

        console.log('Enviando respuesta exitosa');
        res.status(200).json(response);

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : {}
        });
    }
};