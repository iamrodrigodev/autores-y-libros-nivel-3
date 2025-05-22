const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importar rutas
const autoresRoutes = require('./src/routes/autores.route');
const generosRoutes = require('./src/routes/generos.route');

// Importar configuración de la base de datos
const database_mongo = require('./src/config/database');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/autores', autoresRoutes);
app.use('/api/generos', generosRoutes);

// Iniciar servidor una vez que la conexión a la base de datos esté lista
database_mongo.then(() => {
  const { name, host, port } = mongoose.connection;
  
  console.log('Conexión a MongoDB exitosa');
  console.log(`Base de datos: ${name}`);
  console.log(`Host: ${host}`);
  console.log(`Puerto: ${port}`);
  
  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Error al conectar a MongoDB:', err);
  process.exit(1);
});