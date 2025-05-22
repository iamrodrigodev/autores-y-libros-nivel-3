
// Servidor Express solo para autenticación
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const usuariosRoutes = require('./src/routes/usuarios.route');

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB para AUTH');
    // Ruta de login
    app.use('/api/usuarios', usuariosRoutes);
    const PORT = 4000;
    app.listen(PORT, () => {
      console.log(`Servidor de autenticación escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('Error de conexión MongoDB AUTH:', err));
