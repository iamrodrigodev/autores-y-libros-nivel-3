// Paleta de colores principal
export const colors = {
  // Colores primarios
  primary: {
    main: '#2c3e50',
    light: '#34495e',
    dark: '#1a252f',
    contrastText: '#ffffff',
  },
  
  // Colores secundarios
  secondary: {
    main: '#3498db',
    light: '#5dade2',
    dark: '#2980b9',
    contrastText: '#ffffff',
  },
  
  // Colores de estado
  success: {
    main: '#2ecc71',
    light: '#58d68d',
    dark: '#27ae60',
  },
  warning: {
    main: '#f39c12',
    light: '#f5b041',
    dark: '#d68910',
  },
  error: {
    main: '#e74c3c',
    light: '#ec7063',
    dark: '#c0392b',
  },
  
  // Escala de grises
  gray: {
    100: '#f8f9fa',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
  
  // Fondo y texto
  background: {
    default: '#f5f6fa',
    paper: '#ffffff',
  },
  
  text: {
    primary: '#2c3e50',
    secondary: '#6c757d',
    disabled: '#adb5bd',
    hint: '#6c757d',
  },
  
  // Bordes
  border: '#dee2e6',
  
  // Sombra
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Paleta de colores para géneros (asegura que sean únicos y con buen contraste)
// Paleta de colores con una amplia variedad de tonos distintos
const genreColorPalette = [
  // Rojos y rosas
  '#FF3A3A', // Rojo brillante
  '#FF1493', // Rosa intenso
  '#FF69B4', // Rosa caliente
  
  // Naranjas y amarillos
  '#FF8C00', // Naranja oscuro
  '#FFA500', // Naranja
  '#FFD700', // Dorado
  
  // Verdes
  '#2E8B57', // Verde mar
  '#006400', // Verde oscuro
  
  // Azules y púrpuras
  '#1E90FF', // Azul espejo
  '#4169E1', // Azul real
  '#9370DB', // Púrpura medio
  '#8A2BE2', // Azul violeta
  
  // Morados y rosas
  '#9932CC', // Orquídea oscura
  '#DA70D6', // Orquídea
  '#FF00FF', // Magenta
  '#C71585'  // Violeta rojizo
];

// Cache para almacenar las asignaciones de colores a géneros
const genreColorCache = new Map();
// Conjunto para llevar registro de colores ya asignados
const usedColors = new Set();

// Función para generar un hash numérico a partir de un string
const stringToHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Función para obtener un color único para cada género
export const getGenreColor = (genreName) => {
  if (!genreName) return '#2c3e50'; // Color por defecto si no hay nombre
  
  // Si ya tenemos un color asignado para este género, lo devolvemos
  if (genreColorCache.has(genreName)) {
    return genreColorCache.get(genreName);
  }
  
  // Generamos un índice inicial basado en el hash del nombre del género
  const hash = stringToHash(genreName);
  let index = hash % genreColorPalette.length;
  let attempts = 0;
  let color;
  
  // Buscamos un color que no se haya usado aún
  while (attempts < genreColorPalette.length) {
    color = genreColorPalette[index];
    
    // Si el color no está en uso, lo asignamos
    if (!usedColors.has(color)) {
      usedColors.add(color);
      genreColorCache.set(genreName, color);
      return color;
    }
    
    // Si el color ya está en uso, probamos con el siguiente
    index = (index + 1) % genreColorPalette.length;
    attempts++;
  }
  
  // Si ya se usaron todos los colores, generamos uno aleatorio
  const randomColor = `#${Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0')}`;
  genreColorCache.set(genreName, randomColor);
  return randomColor;
};

// Exportar por defecto para facilitar la importación
export default colors;