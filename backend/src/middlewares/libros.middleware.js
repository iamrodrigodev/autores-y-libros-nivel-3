// Middleware para actualizar la fecha de actualización antes de guardar un libro
const actualizarFechaActualizacion = function(next) {
    this.updatedAt = new Date();
    next();
};

// Middleware para formatear los datos antes de guardar
const formatearDatos = function(next) {
    // Asegurarse de que el título tenga la primera letra en mayúscula
    if (this.titulo) {
        this.titulo = this.titulo.trim();
        this.titulo = this.titulo.charAt(0).toUpperCase() + this.titulo.slice(1).toLowerCase();
    }
    
    // Asegurarse de que la sinopsis esté formateada correctamente
    if (this.sinopsis) {
        this.sinopsis = this.sinopsis.trim();
        this.sinopsis = this.sinopsis.charAt(0).toUpperCase() + this.sinopsis.slice(1);
        if (!this.sinopsis.endsWith('.')) {
            this.sinopsis += '.';
        }
    }
    
    next();
};

module.exports = {
    actualizarFechaActualizacion,
    formatearDatos
};