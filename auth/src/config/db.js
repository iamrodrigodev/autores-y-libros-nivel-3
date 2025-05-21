const mongoose = require('mongoose');
require('dotenv').config({ path: '../../../.env' });

// Configuración de opciones de conexión
const options = {
    serverSelectionTimeoutMS: 10000,  // Tiempo de espera para seleccionar un servidor
    socketTimeoutMS: 45000,          // Tiempo de espera de las operaciones
    maxPoolSize: 10,                 // Tamaño máximo del pool de conexiones
    minPoolSize: 1,                  // Tamaño mínimo del pool de conexiones
    retryWrites: true,               // Reintentar escrituras fallidas
    w: 'majority'                    // Nivel de escritura
};

// Variable para evitar múltiples conexiones
let isConnected = false;

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        // Si ya hay una conexión, devolver la conexión existente
        if (isConnected) {
            console.log('Usando conexión existente a MongoDB');
            return mongoose.connection;
        }

        console.log('Conectando a MongoDB...');
        console.log('URI:', process.env.MONGO_URI);
        
        // Conectar a MongoDB con las opciones actualizadas
        await mongoose.connect(process.env.MONGO_URI, options);
        
        // Establecer bandera de conexión
        isConnected = true;
        
        console.log('✅ Conexión a MongoDB establecida correctamente');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        
        // Reintentar la conexión después de 5 segundos
        console.log('Reintentando conexión en 5 segundos...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return connectDB();
    }
};

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
    console.log('Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    isConnected = false;
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose desconectado de MongoDB');
    isConnected = false;
});

// Manejar cierre de la aplicación
const gracefulShutdown = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ Conexión a MongoDB cerrada correctamente');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error al cerrar la conexión a MongoDB:', err);
        process.exit(1);
    }
};

// Capturar eventos de terminación de la aplicación
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = connectDB;