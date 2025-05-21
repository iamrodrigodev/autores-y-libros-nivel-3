const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/auth.controller');

// Ruta de login
router.post('/login', loginUser);

module.exports = router;