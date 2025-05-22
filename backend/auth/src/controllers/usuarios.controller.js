// Controlador de usuarios para login
const Usuario = require('../models/usuarios.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
  const { nombre, clave } = req.body;
  try {
    const usuario = await Usuario.findOne({ nombre, clave });
    if (!usuario) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    const payload = {
      id: usuario._id,
      nombre: usuario.nombre
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    usuario.token = token;
    await usuario.save();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el login', error });
  }
};

module.exports = { login };
