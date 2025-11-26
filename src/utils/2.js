// src/utils/colorUtils.js - Utilidades para manejar colores
export const getBankColors = (bankName) => {
  const colorMap = {
    // Bancos principales con colores más oscuros
    'banco estado': { bg: '#1e40af', text: '#ffffff' }, // Azul oscuro
    'banco de chile': { bg: '#dc2626', text: '#ffffff' }, // Rojo
    'santander': { bg: '#dc2626', text: '#ffffff' }, // Rojo Santander
    'bci': { bg: '#f59e0b', text: '#ffffff' }, // Naranja oscuro
    'scotiabank': { bg: '#7c2d12', text: '#ffffff' }, // Marrón
    'itau': { bg: '#ea580c', text: '#ffffff' }, // Naranja Itau
    'security': { bg: '#166534', text: '#ffffff' }, // Verde oscuro
    'falabella': { bg: '#be185d', text: '#ffffff' }, // Rosa Falabella
    'ripley': { bg: '#7c3aed', text: '#ffffff' }, // Púrpura
    'tenpo': { bg: '#1f2937', text: '#ffffff' }, // Gris oscuro
    'cuenta rut': { bg: '#059669', text: '#ffffff' }, // Verde
    'coopeuch': { bg: '#0891b2', text: '#ffffff' }, // Cyan
    'mach': { bg: '#dc2626', text: '#ffffff' }, // Rojo
    'prepago los heroes': { bg: '#0f766e', text: '#ffffff' }, // Teal
    'lider mastercard': { bg: '#1e40af', text: '#ffffff' } // Azul
  };

  const normalizedName = bankName.toLowerCase().trim();
  return colorMap[normalizedName] || { bg: '#374151', text: '#ffffff' }; // Gris por defecto
};

export const getContrastingTextColor = (hexColor) => {
  // Convertir hex a RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retornar blanco o negro según luminancia
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const darkenColor = (hexColor, amount = 0.3) => {
  // Remover el # si está presente
  const color = hexColor.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  
  // Oscurecer cada componente
  const newR = Math.round(r * (1 - amount));
  const newG = Math.round(g * (1 - amount));
  const newB = Math.round(b * (1 - amount));
  
  // Convertir de vuelta a hex
  const toHex = (num) => num.toString(16).padStart(2, '0');
  
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
};

export const getSafeContrastColor = (banco) => {
  // Usar colores predefinidos si está disponible
  const colors = getBankColors(banco.nombre);
  if (colors) {
    return colors;
  }
  
  // Si no, usar el color del banco pero asegurarse de que tenga buen contraste
  const darkened = darkenColor(banco.color || '#374151', 0.2);
  return {
    bg: darkened,
    text: '#ffffff'
  };
};