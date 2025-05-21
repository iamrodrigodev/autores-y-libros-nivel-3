const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("\nMongoDB conectado a la base de datos AutoresLibros"))
.catch(err => console.error("Error al conectar a la base de datos:", err));

module.exports = { mongoose };