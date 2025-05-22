// Middleware para proteger rutas (JWT)
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(403).json({ mensaje: 'Token inválido' });
  }
};

module.exports = authMiddleware;
