// src/utils/helpers.js

/**
 * Formatea una fecha a string localizado
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Obtiene el día actual en español
 */
export const getCurrentDay = () => {
  return new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
};

/**
 * Lista de días de la semana
 */
export const DIAS_SEMANA = [
  'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'
];

/**
 * Valida si un color hex es válido
 */
export const isValidHexColor = (color) => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

/**
 * Genera un ID único simple
 */
export const generateId = (existingIds = []) => {
  return Math.max(...existingIds, 0) + 1;
};

/**
 * Exporta datos a JSON
 */
export const exportToJson = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Importa datos desde archivo JSON
 */
export const importFromJson = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Error al leer el archivo JSON'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
};

/**
 * Filtra descuentos según criterios
 */
export const filterDescuentos = (descuentos, filtros, busqueda = '') => {
  return descuentos.filter(descuento => {
    // Solo mostrar activos
    if (!descuento.activo) return false;

    // Filtro por banco
    if (filtros.banco !== 'todos' && descuento.banco_nombre !== filtros.banco) {
      return false;
    }

    // Filtro por tipo de tarjeta
    if (filtros.tipo !== 'todos' && descuento.tipo_tarjeta !== filtros.tipo) {
      return false;
    }

    // Filtro por categoría
    if (filtros.categoria !== 'todas' && descuento.categoria !== filtros.categoria) {
      return false;
    }

    // Filtro por delivery
    if (filtros.delivery && !descuento.es_delivery) {
      return false;
    }

    // Filtro por día
    if (filtros.dia && !descuento.dias_semana.includes(filtros.dia)) {
      return false;
    }

    // Filtro por búsqueda
    if (busqueda !== '') {
      const searchText = busqueda.toLowerCase();
      return (
        descuento.comercio.toLowerCase().includes(searchText) ||
        descuento.descripcion?.toLowerCase().includes(searchText) ||
        descuento.categoria.toLowerCase().includes(searchText) ||
        descuento.banco_nombre.toLowerCase().includes(searchText)
      );
    }

    return true;
  });
};

/**
 * Calcula estadísticas de descuentos
 */
export const calculateStats = (descuentos, bancos) => {
  const descuentosActivos = descuentos.filter(d => d.activo);
  const bancosActivos = bancos.filter(b => b.activo);
  
  return {
    totalDescuentos: descuentosActivos.length,
    totalBancos: bancosActivos.length,
    descuentosDelivery: descuentosActivos.filter(d => d.es_delivery).length,
    totalCategorias: new Set(descuentosActivos.map(d => d.categoria)).size,
    descuentosPorBanco: bancosActivos.map(banco => ({
      nombre: banco.nombre,
      color: banco.color,
      count: descuentosActivos.filter(d => d.banco_id === banco.id).length
    })).sort((a, b) => b.count - a.count)
  };
};

/**
 * Valida datos de descuento
 */
export const validateDescuento = (descuento, bancos) => {
  const errors = [];

  if (!descuento.comercio?.trim()) {
    errors.push('El nombre del comercio es obligatorio');
  }

  if (!descuento.categoria?.trim()) {
    errors.push('La categoría es obligatoria');
  }

  if (!descuento.descuento?.trim()) {
    errors.push('El descuento es obligatorio');
  }

  if (!descuento.banco_id) {
    errors.push('Debe seleccionar un banco');
  }

  if (descuento.banco_id && !bancos.find(b => b.id == descuento.banco_id)) {
    errors.push('El banco seleccionado no existe');
  }

  if (!['debito', 'credito'].includes(descuento.tipo_tarjeta)) {
    errors.push('Tipo de tarjeta inválido');
  }

  return errors;
};

/**
 * Valida datos de banco
 */
export const validateBanco = (banco) => {
  const errors = [];

  if (!banco.nombre?.trim()) {
    errors.push('El nombre del banco es obligatorio');
  }

  if (!banco.color || !isValidHexColor(banco.color)) {
    errors.push('Debe proporcionar un color válido en formato hex');
  }

  if (banco.logo_url && !isValidUrl(banco.logo_url)) {
    errors.push('La URL del logo no es válida');
  }

  return errors;
};

/**
 * Valida si una URL es válida
 */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Capitaliza la primera letra de una string
 */
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Trunca texto si es muy largo
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Formatea número de días
 */
export const formatDays = (dias) => {
  if (!dias || dias.length === 0) return 'Sin días especificados';
  if (dias.length === 7) return 'Todos los días';
  if (dias.length > 3) return 'Varios días';
  return dias.map(capitalize).join(', ');
};