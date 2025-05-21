const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 1000,
            minPoolSize: 500,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000
        });
        console.log('Conexión exitosa a MongoDB');
        return mongoose.connection;
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

mongoose.connection.on('error', (err) => {
    console.error('Error de conexión a MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Desconectado de MongoDB');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = connectDB;