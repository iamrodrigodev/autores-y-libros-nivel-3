// Middleware para actualizar la fecha de actualización antes de guardar
const actualizarFechaActualizacion = function(next) {
    this.fecha_actualizacion = Date.now();
    next();
};

module.exports = {
    actualizarFechaActualizacion
};
