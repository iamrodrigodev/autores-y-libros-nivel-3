const User = require('../models/user.model');
const mongoose = require('mongoose');

// Función para formatear la fecha actual
const getFormattedTime = () => {
    return new Date().toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false 
    });
};

// Función para verificar la conexión a la base de datos
const checkDatabaseConnection = async () => {
    try {
        if (mongoose.connection.readyState !== 1) {
            console.log('🔃 Intentando reconectar a la base de datos...');
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 30000
            });
            console.log('✅ Conexión a la base de datos establecida');
        }
        return true;
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        return false;
    }
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

        // Limpiar el número de teléfono
        const telefonoLimpio = telefono.toString().trim();
        const errores = [];
        
        // Validar formato del teléfono
        if (!/^9\d{8}$/.test(telefonoLimpio)) {
            errores.push('El teléfono debe comenzar con 9 y tener 9 dígitos numéricos');
        }
        
        // Si hay errores, retornarlos todos juntos
        if (errores.length > 0) {
            log(`Error de validación: ${errores.join('; ')} - Teléfono: ${telefono}`);
            return res.status(400).json({
                success: false,
                message: 'Error de validación del teléfono',
                errors: errores
            });
        }

        log(`Autenticando usuario: ${telefonoLimpio}`);
        
        // Verificar conexión a la base de datos
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
            log('Error: No se pudo conectar a la base de datos');
            return res.status(503).json({
                success: false,
                message: 'Error de conexión con el servidor. Por favor, intente nuevamente.'
            });
        }
        
        // Buscar usuario en la base de datos con un timeout
        const user = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Tiempo de espera agotado al buscar el usuario'));
            }, 8000); // 8 segundos de timeout
            
            User.findOne({ telefono: telefonoLimpio })
                .then(result => {
                    clearTimeout(timeout);
                    resolve(result);
                })
                .catch(err => {
                    clearTimeout(timeout);
                    reject(err);
                });
        });
        
        if (!user) {
            log('Error: Usuario no encontrado');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
        
        // Verificar si el usuario está activo
        if (user.activo === false) {
            log('Error: Cuenta desactivada');
            return res.status(403).json({
                success: false,
                message: 'Esta cuenta ha sido desactivada. Contacte al administrador.'
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
        
        // Generar token
        log('Generando nuevo token');
        const token = user.generateToken();
        
        // Actualizar el token en la base de datos
        user.token = token;
        user.ultimo_acceso = new Date();
        
        try {
            await user.save();
            log('Token generado y guardado correctamente');
            
            // Obtener datos del usuario para la respuesta (sin la contraseña)
            const userData = user.toObject();
            delete userData.clave;
            
            return res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso',
                token,
                user: userData
            });
            
        } catch (saveError) {
            console.error('Error al guardar el token:', saveError);
            return res.status(500).json({
                success: false,
                message: 'Error al iniciar sesión',
                error: 'No se pudo guardar el token de autenticación'
            });
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