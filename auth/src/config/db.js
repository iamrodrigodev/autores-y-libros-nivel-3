const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.example' });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000
        });
        console.log('Conexión a MongoDB establecida');
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
