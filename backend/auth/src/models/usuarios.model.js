
const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido_paterno: { type: String, required: true },
  apellido_materno: { type: String, required: true },
  telefono: { type: String, required: true },
  direccion: { type: String, required: true },
  clave: { type: String, required: true },
  fecha_nacimiento: { type: Date, required: true },
  token: { type: String }
});

module.exports = mongoose.model('Usuario', UsuarioSchema, 'Usuarios');
