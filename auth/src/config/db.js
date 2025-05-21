const mongoose = require('mongoose');

// Configuración de opciones de conexión
const options = {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000
};

// Función para conectar a la base de datos
const connectDB = async () => {
    try {
        console.log('URI:', process.env.MONGO_URI);
        
        await mongoose.connect(process.env.MONGO_URI, options);
        
        console.log('✅ Conexión a MongoDB establecida correctamente');
        return mongoose.connection;
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        // No salir del proceso para permitir reintentos
        throw error;
    }
};

mongoose.connection.on('error', (err) => {
    console.error('❌ Error de conexión a MongoDB:', err.message);
})

process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Conexión a MongoDB cerrada por terminación de la aplicación');
        process.exit(0);
    } catch (err) {
        console.error('Error al cerrar la conexión a MongoDB:', err);
        process.exit(1);
    }
});

module.exports = connectDB;