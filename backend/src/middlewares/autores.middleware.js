// Middleware para formatear el nombre y la nacionalidad
const formatearDatos = function(next) {
    const doc = this.op === 'findOneAndUpdate' ? this.getUpdate().$set : this;
    
    if (doc.nombre) {
        doc.nombre = doc.nombre.trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    if (doc.nacionalidad) {
        doc.nacionalidad = doc.nacionalidad.trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    next();
};

module.exports = {
    formatearDatos
};