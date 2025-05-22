const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const database_mongo = require('./src/config/database');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/ping', (_req, res) => {
  res.json({ mensaje: 'pong' });
});

database_mongo.then(() => {
  const { name, host, port } = mongoose.connection;
  
  console.log('Conexion a MongoDB exitosa');
  console.log(`Base de datos: ${name}`);
  console.log(`Host: ${host}`);
  console.log(`Puerto: ${port}`);
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Error al conectar a MongoDB:', err);
});