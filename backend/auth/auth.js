
// Exporta el middleware y el controlador desde sus nuevas ubicaciones
const authMiddleware = require('./src/middlewares/auth.middleware');
const { login } = require('./src/controllers/usuarios.controller');

module.exports = { authMiddleware, login };
