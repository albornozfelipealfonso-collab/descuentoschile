// src/utils/descuentos.js
// Lógica pura (sin React) para filtrar, enriquecer y validar descuentos.

export const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
export const TIPOS_TARJETA = ['debito', 'credito', 'ambas'];
export const DEFAULT_BANCO_COLOR = '#374151';

export const FILTROS_INICIALES = {
  banco: 'todos',
  tipo: 'todos',
  dia: 'todos',
  categoria: 'todas'
};

/** Minúsculas, sin tildes y sin espacios extremos: "Miércoles " -> "miercoles" */
export const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Día actual en español, sin depender de la configuración regional del dispositivo. */
export const getDiaActual = (fecha = new Date()) => DIAS_SEMANA[(fecha.getDay() + 6) % 7];

/** Fecha local en formato YYYY-MM-DD. */
export const toISODate = (fecha = new Date()) => {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/** Un descuento sin fecha de vencimiento siempre está vigente. */
export const estaVigente = (descuento, hoy = toISODate()) =>
  !descuento?.fecha_vencimiento || descuento.fecha_vencimiento >= hoy;

/** Formatea "2025-12-31" como fecha chilena sin desfase por zona horaria. */
export const formatFecha = (isoDate) => {
  const [y, m, d] = String(isoDate).split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  return new Date(y, m - 1, d).toLocaleDateString('es-CL');
};

export const formatDias = (dias) => {
  if (!Array.isArray(dias) || dias.length === 0) return '';
  if (dias.length === 7) return 'Todos los días';
  return [...dias]
    .sort((a, b) => DIAS_SEMANA.indexOf(a) - DIAS_SEMANA.indexOf(b))
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
    .join(', ');
};

/** Texto blanco o negro según la luminancia del fondo. */
export const getTextColor = (hex) => {
  if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return '#ffffff';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#111827' : '#ffffff';
};

/** Busca el banco de un descuento (comparación tolerante a tildes y mayúsculas). */
export const findBanco = (bancos, bancoNombre) => {
  const nombre = normalizar(bancoNombre);
  return bancos.find((b) => normalizar(b?.nombre) === nombre);
};

/**
 * Agrega color y logo del banco a cada descuento y descarta los descuentos
 * cuyo banco está desactivado.
 */
export const enriquecerConBanco = (descuentos, bancos) =>
  descuentos.flatMap((descuento) => {
    const banco = findBanco(bancos, descuento.banco_nombre);
    if (banco && banco.activo === false) return [];
    return [{
      ...descuento,
      banco_color: banco?.color || DEFAULT_BANCO_COLOR,
      logo_url: banco?.logo_url || null
    }];
  });

/** Filtro principal de la vista pública. */
export const filtrarDescuentos = (descuentos, filtros = FILTROS_INICIALES, busqueda = '', hoy = toISODate()) => {
  const termino = normalizar(busqueda);
  const f = { ...FILTROS_INICIALES, ...filtros };

  return descuentos.filter((d) => {
    if (!d || d.activo === false || !estaVigente(d, hoy)) return false;

    if (termino) {
      const texto = normalizar([d.establecimiento, d.descripcion, d.descuento, d.banco_nombre, d.categoria].join(' '));
      if (!texto.includes(termino)) return false;
    }

    if (f.banco !== 'todos' && normalizar(d.banco_nombre) !== normalizar(f.banco)) return false;

    // Un descuento "ambas" aplica tanto a débito como a crédito.
    if (f.tipo !== 'todos' && d.tipo_tarjeta !== f.tipo && d.tipo_tarjeta !== 'ambas') return false;

    if (f.categoria !== 'todas' && normalizar(d.categoria) !== normalizar(f.categoria)) return false;

    if (f.dia !== 'todos') {
      const dias = (d.dias_validos || []).map(normalizar);
      if (!dias.includes(normalizar(f.dia))) return false;
    }

    return true;
  });
};

export const getCategorias = (descuentos) =>
  [...new Set(descuentos.map((d) => d.categoria?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));

export const nextId = (items) => Math.max(0, ...items.map((i) => Number(i.id) || 0)) + 1;

/** Ids numéricos para datos manuales; ids de texto ("bci-3f9a1c") para datos scrapeados. */
const normalizarId = (id) => (typeof id === 'string' && !/^\d+$/.test(id) ? id.trim() : Number(id));
const idValido = (id) => (typeof id === 'string' ? id !== '' : Number.isFinite(id));

// ---------------------------------------------------------------------------
// Normalización y validación (usada por el import JSON y el generador de código)
// ---------------------------------------------------------------------------

export const normalizarBanco = (banco) => ({
  id: normalizarId(banco.id),
  nombre: String(banco.nombre ?? '').trim(),
  color: /^#[0-9a-f]{6}$/i.test(banco.color || '') ? banco.color : DEFAULT_BANCO_COLOR,
  logo_url: banco.logo_url || '',
  activo: banco.activo !== false
});

export const normalizarDescuento = (descuento) => {
  const dias = descuento.dias_validos || descuento.dias_semana || [];
  const extra = {};
  // Campos opcionales de los descuentos scrapeados
  if (descuento.fuente) extra.fuente = String(descuento.fuente);
  if (descuento.url) extra.url = String(descuento.url);
  return {
    id: normalizarId(descuento.id),
    establecimiento: String(descuento.establecimiento ?? descuento.comercio ?? '').trim(),
    descripcion: String(descuento.descripcion ?? '').trim(),
    descuento: String(descuento.descuento ?? '').trim(),
    banco_nombre: String(descuento.banco_nombre ?? '').trim(),
    tipo_tarjeta: TIPOS_TARJETA.includes(descuento.tipo_tarjeta) ? descuento.tipo_tarjeta : 'debito',
    categoria: String(descuento.categoria ?? '').trim(),
    dias_validos: DIAS_SEMANA.filter((dia) => dias.map(normalizar).includes(normalizar(dia))),
    es_delivery: Boolean(descuento.es_delivery),
    terminos: String(descuento.terminos ?? '').trim(),
    fecha_vencimiento: descuento.fecha_vencimiento || descuento.fecha_fin || '',
    activo: descuento.activo !== false,
    ...extra
  };
};

/**
 * Valida y normaliza datos importados. Devuelve { datos, errores }.
 * Si hay errores, `datos` es null y no se debe importar nada.
 */
export const validarDatos = (entrada) => {
  const errores = [];
  if (!entrada || !Array.isArray(entrada.bancos) || !Array.isArray(entrada.descuentos)) {
    return { datos: null, errores: ['El archivo debe tener las listas "bancos" y "descuentos".'] };
  }

  const bancos = entrada.bancos.map(normalizarBanco);
  const descuentos = entrada.descuentos.map(normalizarDescuento);

  const revisarIds = (items, tipo) => {
    const vistos = new Set();
    items.forEach((item, i) => {
      if (!idValido(item.id)) errores.push(`${tipo} #${i + 1}: id inválido.`);
      else if (vistos.has(item.id)) errores.push(`${tipo} #${i + 1}: id ${item.id} duplicado.`);
      vistos.add(item.id);
    });
  };
  revisarIds(bancos, 'Banco');
  revisarIds(descuentos, 'Descuento');

  bancos.forEach((b, i) => {
    if (!b.nombre) errores.push(`Banco #${i + 1}: falta el nombre.`);
  });
  descuentos.forEach((d, i) => {
    if (!d.establecimiento) errores.push(`Descuento #${i + 1}: falta el establecimiento.`);
    if (!d.descuento) errores.push(`Descuento #${i + 1}: falta el texto del descuento.`);
    if (!findBanco(bancos, d.banco_nombre)) {
      errores.push(`Descuento #${i + 1} (${d.establecimiento}): el banco "${d.banco_nombre}" no existe.`);
    }
  });

  return errores.length ? { datos: null, errores } : { datos: { bancos, descuentos }, errores };
};

/**
 * Combina los datos manuales (initialData.js) con los descuentos scrapeados.
 * Si un descuento scrapeado repite banco + comercio + texto de uno manual, se
 * conserva solo el manual.
 */
export const combinarDatos = (manual, scrapeados) => {
  const clave = (d) => [d.banco_nombre, d.establecimiento, d.descuento].map(normalizar).join('|');
  const manuales = new Set(manual.descuentos.map(clave));
  return {
    bancos: manual.bancos,
    descuentos: [...manual.descuentos, ...scrapeados.filter((d) => !manuales.has(clave(d)))]
  };
};
