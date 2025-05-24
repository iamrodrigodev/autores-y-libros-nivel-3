
// Servidor Express solo para autenticación
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// Al principio del archivo, reemplaza:
require('dotenv').config();

// Con:
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const usuariosRoutes = require('./src/routes/usuarios.route');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
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
