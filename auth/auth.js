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
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        service: 'auth-service',
        timestamp: new Date().toISOString()
    });
});

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        console.log('\nIniciando servidor de autenticación...');
        
        // Conectar a la base de datos
        await connectDB();
        
        // Iniciar el servidor
        const server = app.listen(PORT, () => {
            console.log(`📚 Base de datos: ${process.env.MONGO_URI}`);
            console.log(`✅ Servidor de autenticación en http://localhost:${PORT}`);
        });

        // Manejo de errores del servidor
        server.on('error', (error) => {
            if (error.syscall !== 'listen') throw error;
            
            const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
            
            // Manejar errores específicos
            switch (error.code) {
                case 'EACCES':
                    console.error(`${bind} requiere privilegios elevados`);
                    process.exit(1);
                case 'EADDRINUSE':
                    console.error(`${bind} ya está en uso`);
                    process.exit(1);
                default:
                    throw error;
            }
        });
    } catch (error) {
        console.error('Error al iniciar:', error);
        process.exit(1);
    }
};

startServer();