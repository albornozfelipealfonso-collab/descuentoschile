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

/** Último día del mes de `fecha` en formato YYYY-MM-DD. */
export const finDeMes = (fecha = new Date()) => toISODate(new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0));

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

// Cifras destacables, de la más a la menos informativa. `formato` deja la cifra lista para mostrar.
const CIFRAS = [
  { re: /\d{1,3}\s?%/, formato: (m) => m.replace(/\s+/g, '') }, // 40%
  { re: /\b\d\s?x\s?\d\b/i, formato: (m) => m.replace(/\s+/g, '').toLowerCase() }, // 2x1
  { re: /\$?\s?\d{1,3}(?:\.\d{3})+(?:\s?CLP\b)?/, formato: (m) => `$${m.replace(/[$\s]|CLP/g, '')}` }, // $5.000 · 100.000 CLP
  { re: /(?:^|\s)x\s?\d{1,2}\b/i, formato: (m) => m.trim().replace(/\s+/g, '').toLowerCase() }, // x5 (cashback)
  { re: /\b\d{1,2}x(?=\s|$)/i, formato: (m) => `x${m.slice(0, -1)}` }, // 10X cashback
  // "3 ó 6 cuotas", "13 a 36 cuotas", "12 cuotas": la palabra "cuotas" queda en el resto
  { re: /\b\d{1,2}(?:\s?(?:ó|o|a|y|-)\s?\d{1,2})?(?=\s?cuotas)/i, formato: (m) => m.replace(/\s?(?:ó|o|a|y|-)\s?/i, '–') }
];

/**
 * Separa la cifra principal de un descuento para destacarla:
 * "40% de descuento" -> { cifra: '40%', resto: 'de descuento' }.
 * Si no hay cifra reconocible, `cifra` es null y `resto` es el texto completo.
 */
export const destacarDescuento = (texto) => {
  const t = String(texto ?? '').trim();
  for (const { re, formato } of CIFRAS) {
    const m = t.match(re);
    if (m) {
      const resto = (t.slice(0, m.index) + ' ' + t.slice(m.index + m[0].length))
        .replace(/\s+/g, ' ')
        .replace(/^[\s,:;-]+|[\s,:;-]+$/g, '');
      return { cifra: formato(m[0]), resto };
    }
  }
  return { cifra: null, resto: t };
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

// ---------------------------------------------------------------------------
// Logos de comercios
// ---------------------------------------------------------------------------

/** "Uber Eats", "UberEats" y "Rappi." dan la misma clave. */
const claveComercio = (nombre) => normalizar(nombre).replace(/[^a-z0-9]/g, '');

// Marcas frecuentes con logo incluido en la app (funcionan sin internet).
// `salvo`: si el texto del descuento calza, se respeta el logo del banco
// (un descuento de "PedidosYa Market" lleva el logo de Market).
const LOGOS_INCLUIDOS = [
  { marca: /^rappi/, logo: '/logos/comercios/rappi.png' },
  { marca: /^ubereats/, logo: '/logos/comercios/ubereats.svg' },
  { marca: /^pedidosya/, logo: '/logos/comercios/pedidosya.webp', salvo: /market/ }
];

const logoIncluido = (d) => {
  const clave = claveComercio(d.establecimiento);
  const texto = normalizar(`${d.descuento} ${d.descripcion}`);
  return LOGOS_INCLUIDOS.find(({ marca, salvo }) => marca.test(clave) && !(salvo?.test(texto) && d.logo))?.logo;
};

/**
 * Asigna `logo` a cada descuento: primero un logo incluido de la marca, luego
 * el que entregó el banco y, si no hay, el de otro descuento del mismo comercio
 * (así un descuento manual de Cinepolis usa el logo que trae BCI).
 */
export const asignarLogos = (descuentos) => {
  const porComercio = new Map();
  descuentos.forEach((d) => {
    const clave = claveComercio(d.establecimiento);
    if (d.logo && clave && !porComercio.has(clave)) porComercio.set(clave, d.logo);
  });
  return descuentos.map((d) => {
    const clave = claveComercio(d.establecimiento);
    const logo = logoIncluido(d) || d.logo || porComercio.get(clave) || null;
    return logo === d.logo ? d : { ...d, logo };
  });
};

// "código: SBPAYJUL25", "cupón MACHBANK30", "con el código de descuento BCIPIZZA07"
const CODIGO = /(?:c[oó]digo|cup[oó]n)(?: de descuento| promocional)?(?: es)?[:\s]+["“'«]?([A-Z0-9][A-Z0-9-]{3,19})\b/g;

/**
 * Código de descuento mencionado en el texto (en mayúsculas, con una letra y
 * un número o 5+ letras), o null. Si hay varios ("cupón FULL … cupón CPFULL"),
 * el primero que cumpla.
 */
export const extraerCodigo = (d) => {
  const texto = [d?.descuento, d?.descripcion, d?.terminos].filter(Boolean).join(' ');
  for (const [, codigo] of texto.matchAll(CODIGO)) {
    if (/[A-Z]/.test(codigo) && /\d|[A-Z]{5,}/.test(codigo)) return codigo;
  }
  return null;
};

/** Iniciales para cuando no hay logo: "Uber Eats" -> "UE", "Sushi" -> "SU". */
export const iniciales = (nombre) => {
  const palabras = String(nombre ?? '').replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return '?';
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
};

// ---------------------------------------------------------------------------
// Mis tarjetas: { "bci": { debito: true, credito: false }, ... } (clave = banco normalizado)
// ---------------------------------------------------------------------------

/** ¿El usuario puede usar este descuento con las tarjetas que marcó? */
export const coincideConTarjetas = (descuento, tarjetas) => {
  const t = tarjetas?.[normalizar(descuento.banco_nombre)];
  if (!t) return false;
  if (descuento.tipo_tarjeta === 'debito') return Boolean(t.debito);
  if (descuento.tipo_tarjeta === 'credito') return Boolean(t.credito);
  return Boolean(t.debito || t.credito); // "ambas"
};

/** Cantidad de tarjetas marcadas (débito y crédito del mismo banco cuentan como 2). */
export const contarTarjetas = (tarjetas) =>
  Object.values(tarjetas || {}).reduce((n, t) => n + (t.debito ? 1 : 0) + (t.credito ? 1 : 0), 0);

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

/**
 * Con un día elegido, primero los descuentos exclusivos de ese día y después
 * los que valen todos los días (el orden original se mantiene dentro de cada grupo).
 */
export const ordenarPorDia = (descuentos, dia) => {
  if (!dia || dia === 'todos') return descuentos;
  const todosLosDias = (d) => (d.dias_validos?.length === DIAS_SEMANA.length ? 1 : 0);
  return [...descuentos].sort((a, b) => todosLosDias(a) - todosLosDias(b));
};

/**
 * Cuántos descuentos quedarían por cada valor de `campo` ('banco_nombre' o
 * 'categoria') si se eligiera ese valor, respetando el resto de los filtros.
 * Devuelve un Map { valor normalizado -> cantidad }.
 */
export const contarOpciones = (descuentos, filtros, busqueda, campo, hoy = toISODate()) => {
  const filtro = campo === 'banco_nombre' ? { banco: 'todos' } : { categoria: 'todas' };
  const conteo = new Map();
  filtrarDescuentos(descuentos, { ...filtros, ...filtro }, busqueda, hoy).forEach((d) => {
    const clave = normalizar(d[campo]);
    conteo.set(clave, (conteo.get(clave) || 0) + 1);
  });
  return conteo;
};

/** Días que faltan para que venza (0 = vence hoy), o null si no tiene fecha. */
export const diasParaVencer = (fechaVencimiento, hoy = toISODate()) => {
  if (!fechaVencimiento) return null;
  const aFecha = (iso) => {
    const [y, m, d] = String(iso).split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  const dias = Math.round((aFecha(fechaVencimiento) - aFecha(hoy)) / 86400000);
  return Number.isFinite(dias) ? dias : null;
};

export const TIPO_TARJETA_CORTO = { debito: 'Débito', credito: 'Crédito', ambas: 'Déb + Créd' };
export const TIPO_TARJETA_LARGO = { debito: 'Tarjeta de débito', credito: 'Tarjeta de crédito', ambas: 'Débito y crédito' };

const AVISO_VENCE = 7; // días

/** "Vence hoy" / "Vence en 3 días" (urgente) o "Hasta 31-12-2026". */
export const describirVencimiento = (fecha, hoy = toISODate()) => {
  const dias = diasParaVencer(fecha, hoy);
  if (dias === 0) return { texto: 'Vence hoy', urgente: true };
  if (dias === 1) return { texto: 'Vence mañana', urgente: true };
  if (dias !== null && dias <= AVISO_VENCE) return { texto: `Vence en ${dias} días`, urgente: true };
  return { texto: `Hasta ${formatFecha(fecha)}`, urgente: false };
};

export const getCategorias = (descuentos) =>
  [...new Set(descuentos.map((d) => d.categoria?.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));

// ---------------------------------------------------------------------------
// Categorías: cada banco usa sus propios nombres; se unifican para que el
// filtro no muestre "Cine" y "Cine y entretención" como cosas distintas.
// ---------------------------------------------------------------------------

/** Categoría a partir de palabras clave (si el banco no entrega una útil). */
const CATEGORIAS_POR_TEXTO = [
  ['Delivery', /rappi|pedidos ?ya|uber ?eats|delivery|justo|cornershop/],
  ['Restaurantes', /restauran|sushi|pizza|papa john|domino|burger|mcdonald|kfc|starbucks|cafe|bar\b|gastronom|comida/],
  ['Supermercados', /supermercad|lider|jumbo|unimarc|tottus|santa isabel|acuenta|botiller|liquidos/],
  ['Combustible', /copec|shell|petrobras|aramco|bencina|combustible/],
  ['Farmacias', /farmacia|cruz verde|salcobrand|ahumada/],
  ['Cine y entretención', /cine|cinemark|cinepolis|cineplanet|hoyts|teatro|concierto|entretenci/],
  ['Viajes', /viaje|hotel|aerolinea|latam|sky airline|jetsmart|turismo/],
  ['Salud y belleza', /salud|clinica|dental|optica|belleza|spa|peluquer/],
  ['Moda y vestuario', /vestuario|ropa|zapat|moda|calzado/],
  ['Tecnología', /tecnolog|electro|celular|computador/],
  ['Educación', /educaci|curso|libreria|libro/],
  ['Hogar', /hogar|mueble|decoraci|sodimac|easy|construc/],
  ['Tiendas online', /amazon|aliexpress|mercado ?libre|shein|temu/]
];

export const inferirCategoria = (...textos) => {
  const t = normalizar(textos.join(' '));
  return CATEGORIAS_POR_TEXTO.find(([, re]) => re.test(t))?.[0] || 'Otros';
};

// Nombre normalizado → nombre unificado
const SINONIMOS_CATEGORIA = {
  cine: 'Cine y entretención',
  entretencion: 'Cine y entretención',
  'moda y vestuario': 'Moda y vestuario',
  vestuario: 'Moda y vestuario',
  'tecnologia y marketplace': 'Tecnología',
  ninos: 'Infantil',
  wellness: 'Bienestar',
  'mall sport': 'Deportes',
  'educacion y librerias': 'Educación',
  salud: 'Salud y belleza',
  restaurante: 'Restaurantes',
  'moda y accesorios': 'Moda y vestuario',
  movilidad: 'Transporte',
  'mascota y hogar': 'Hogar'
};

// Categorías de campaña que no dicen de qué rubro es el descuento
const CATEGORIAS_SIN_RUBRO = new Set([
  '', 'otros', 'paga en cuotas', 'mas beneficios', 'activalo y usalo', 'dia de la madre', 'market', 'compras online',
  'shopping', 'cuotas'
]);

/**
 * Unifica el nombre de una categoría. Si no describe un rubro, la deduce del
 * texto del descuento (`contexto`).
 */
export const unificarCategoria = (categoria, ...contexto) => {
  const clave = normalizar(categoria);
  if (CATEGORIAS_SIN_RUBRO.has(clave)) return inferirCategoria(...contexto);
  return SINONIMOS_CATEGORIA[clave] || String(categoria).trim();
};

export const nextId =(items) => Math.max(0, ...items.map((i) => Number(i.id) || 0)) + 1;

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
  // Logo del comercio (solo https, para no cargar contenido inseguro)
  if (/^https:\/\//.test(descuento.logo || '')) extra.logo = descuento.logo;
  const establecimiento = String(descuento.establecimiento ?? descuento.comercio ?? '').trim();
  const descripcion = String(descuento.descripcion ?? '').trim();
  const categoria = descuento.categoria ?? '';
  return {
    id: normalizarId(descuento.id),
    establecimiento,
    descripcion,
    descuento: String(descuento.descuento ?? '').trim(),
    banco_nombre: String(descuento.banco_nombre ?? '').trim(),
    tipo_tarjeta: TIPOS_TARJETA.includes(descuento.tipo_tarjeta) ? descuento.tipo_tarjeta : 'debito',
    categoria: unificarCategoria(categoria, establecimiento, descripcion),
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
 * Si un descuento scrapeado repite uno manual (mismo banco, comercio, cifra y
 * días, aunque el texto esté escrito distinto) se conserva solo el manual, pero
 * completado con lo que traiga el banco y le falte (logo, enlace, vencimiento).
 *
 * Los manuales sin fecha de vencimiento no se publican: nadie los actualiza
 * y quedarían para siempre (los de los bancos se renuevan cada día). Se
 * devuelven aparte en `sinFecha` para avisar.
 */
export const combinarDatos = (manual, scrapeados) => {
  const clave = (d) => {
    const { cifra, resto } = destacarDescuento(d.descuento);
    const dias = (d.dias_validos || []).map(normalizar).sort().join(',');
    return [normalizar(d.banco_nombre), claveComercio(d.establecimiento), cifra ?? normalizar(resto), dias].join('|');
  };
  const delBanco = new Map(scrapeados.map((d) => [clave(d), d]));
  const manuales = manual.descuentos.map((m) => {
    const s = delBanco.get(clave(m));
    if (!s) return m;
    const completo = { ...m, fecha_vencimiento: m.fecha_vencimiento || s.fecha_vencimiento || '' };
    if (!m.logo && s.logo) completo.logo = s.logo;
    if (!m.url && s.url) completo.url = s.url;
    return completo;
  });
  const publicados = manuales.filter((d) => d.fecha_vencimiento);
  // Solo un manual que se publica tapa al del banco; si no, se pierden los dos
  const clavesManuales = new Set(publicados.map(clave));
  return {
    bancos: manual.bancos,
    descuentos: [...publicados, ...scrapeados.filter((d) => !clavesManuales.has(clave(d)))],
    sinFecha: manuales.filter((d) => !d.fecha_vencimiento)
  };
};
