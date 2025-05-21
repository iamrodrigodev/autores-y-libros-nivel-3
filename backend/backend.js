require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const autoresRoutes = require('./src/routes/autores.routes');

// Importar la conexión a la base de datos
require('./src/config/db');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/autores', autoresRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API de Autores y Libros' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Iniciar el servidor
const startServer = () => {
    // Usamos el evento 'open' de la conexión de Mongoose
    mongoose.connection.once('open', () => {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
            console.log(`Ruta de Autores: http://localhost:${PORT}/api/autores`);
        });
    });

    // Manejar errores de conexión
    mongoose.connection.on('error', (err) => {
        console.error('❌ Error de conexión a MongoDB:', err);
        process.exit(1);
    });
};

// Manejo de cierre de la aplicación
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('\nConexión a MongoDB cerrada');
        process.exit(0);
    } catch (error) {
        console.error('Error al cerrar la conexión a MongoDB:', error);
        process.exit(1);
    }
});

// Iniciar la aplicación
startServer();