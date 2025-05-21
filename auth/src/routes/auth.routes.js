const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/auth.controller');
const { body } = require('express-validator');
const { validarCampos } = require('../middleware/validar-campos');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - telefono
 *               - clave
 *             properties:
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono del usuario (9 dígitos, debe comenzar con 9)
 *                 example: "987654321"
 *               clave:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "miclave123"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Inicio de sesión exitoso"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 */
router.post('/login', [
    // Validar campos de entrada
    body('telefono', 'El teléfono es requerido')
        .notEmpty()
        .isLength({ min: 9, max: 9 })
        .withMessage('El teléfono debe tener 9 dígitos')
        .matches(/^9\d{8}$/)
        .withMessage('El teléfono debe comenzar con 9 y contener solo números'),
    body('clave', 'La contraseña es requerida').notEmpty(),
    validarCampos
], loginUser);

module.exports = router;