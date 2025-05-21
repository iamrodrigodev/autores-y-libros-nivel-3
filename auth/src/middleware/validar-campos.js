const { validationResult } = require('express-validator');

/**
 * Middleware para validar los campos de las peticiones
 * @param {Object} req - Objeto de petición de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función para continuar con el siguiente middleware
 * @returns {Object} Respuesta con errores de validación o continúa al siguiente middleware
 */
const validarCampos = (req, res, next) => {
    // Obtener los errores de validación
    const errors = validationResult(req);
    
    // Si hay errores, devolverlos
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: errors.mapped()
        });
    }
    
    // Si no hay errores, continuar con el siguiente middleware
    next();
};

module.exports = {
    validarCampos
};
