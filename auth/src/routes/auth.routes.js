const express = require('express');
const router = express.Router();
const { loginUser, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/login', loginUser);

// Rutas protegidas
router.get('/me', protect, getMe);

module.exports = router;