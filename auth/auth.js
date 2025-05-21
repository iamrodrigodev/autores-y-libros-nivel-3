// Cargar variables de entorno primero
require('dotenv').config({ path: '.env' });

// Verificar variables de entorno requeridas
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Error: Faltan variables de entorno requeridas:', missingEnvVars.join(', '));
    process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Middleware para verificar conexión a la base de datos
app.use(async (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        console.log('🔃 Reconectando a la base de datos...');
        try {
            await connectDB();
            next();
        } catch (error) {
            console.error('❌ Error al reconectar a la base de datos:', error.message);
            return res.status(503).json({
                success: false,
                message: 'Servicio no disponible. Error de conexión a la base de datos.'
            });
        }
    } else {
        next();
    }
});

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        console.log('\n🚀 Iniciando servidor de autenticación...');
        
        // Conectar a la base de datos
        console.log('🔌 Conectando a la base de datos...');
        await connectDB();
        
        // Iniciar el servidor
        const server = app.listen(PORT, () => {
            console.log('\n✅ Servicio de autenticación iniciado correctamente');
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`📚 Ruta de autenticación: http://localhost:${PORT}/api/auth`);
            console.log(`💾 Base de datos: ${process.env.MONGO_URI}`);
            console.log('\n🔍 Estado de la base de datos:', 
                mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado');
            console.log('\n🛑 Presiona Ctrl+C para detener el servidor\n');
        });

        // Manejo de errores del servidor
        server.on('error', (error) => {
            if (error.syscall !== 'listen') throw error;
            
            const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
            
            switch (error.code) {
                case 'EACCES':
                    console.error(`❌ ${bind} requiere privilegios elevados`);
                    process.exit(1);
                case 'EADDRINUSE':
                    console.error(`❌ ${bind} ya está en uso`);
                    process.exit(1);
                default:
                    console.error('❌ Error desconocido:', error);
                    throw error;
            }
        });
        
        // Manejar cierre del servidor
        process.on('SIGINT', () => {
            console.log('\n\n🛑 Recibida señal de terminación. Cerrando servidor...');
            server.close(() => {
                console.log('✅ Servidor detenido correctamente');
                mongoose.connection.close(() => {
                    console.log('✅ Conexión a la base de datos cerrada');
                    process.exit(0);
                });
            });
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Iniciar la aplicación
startServer();