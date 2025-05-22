// Middleware para formatear los datos antes de guardar o actualizar
const formatearDatos = function(next) {
    const doc = this.op === 'findOneAndUpdate' ? this.getUpdate().$set : this;
    
    // Formatear título (primera letra en mayúscula, resto en minúscula)
    if (doc.titulo) {
        doc.titulo = doc.titulo.trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    // Formatear sinopsis (primera letra en mayúscula y punto al final)
    if (doc.sinopsis) {
        doc.sinopsis = doc.sinopsis.trim();
        if (doc.sinopsis.length > 0) {
            doc.sinopsis = doc.sinopsis.charAt(0).toUpperCase() + doc.sinopsis.slice(1);
            if (!doc.sinopsis.endsWith('.')) {
                doc.sinopsis += '.';
            }
        }
    }
    
    next();
};

module.exports = {
    formatearDatos
};