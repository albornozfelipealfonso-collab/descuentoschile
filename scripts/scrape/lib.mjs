// scripts/scrape/lib.mjs - utilidades compartidas por los scrapers
import { createHash } from 'node:crypto';
import { DIAS_SEMANA, normalizar } from '../../src/utils/descuentos.js';

export const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

/** Id estable a partir de la fuente y un identificador del banco. */
export const idEstable = (fuente, ...partes) =>
  `${fuente}-${createHash('sha1').update(partes.map(String).join('|')).digest('hex').slice(0, 10)}`;

/** Quita etiquetas HTML y espacios de sobra. */
export const limpiarTexto = (texto) =>
  String(texto ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const RANGO = /(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)s?\s+(?:a|al)\s+(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)/i;

/** Detecta días de la semana en un texto libre ("martes y jueves", "lunes a viernes", "todos los días"). */
export const extraerDias = (texto) => {
  const t = normalizar(texto);
  if (!t) return [];
  if (/todos los dias|todo el ano|todos los meses|diariamente/.test(t)) return [...DIAS_SEMANA];
  const nombres = DIAS_SEMANA.map(normalizar);
  const rango = t.match(RANGO);
  if (rango) {
    const a = nombres.indexOf(normalizar(rango[1]));
    const b = nombres.indexOf(normalizar(rango[2]));
    if (a !== -1 && b !== -1 && a <= b) return DIAS_SEMANA.slice(a, b + 1);
  }
  if (/fin(es)? de semana/.test(t)) return ['sábado', 'domingo'];
  return DIAS_SEMANA.filter((_, i) => new RegExp(`\\b${nombres[i]}s?\\b`).test(t));
};

/** Detecta débito/crédito en un texto. */
export const extraerTipoTarjeta = (texto) => {
  const t = normalizar(texto);
  const debito = /debito|cuenta vista|cuenta rut|prepago/.test(t);
  const credito = /credito/.test(t);
  if (debito && credito) return 'ambas';
  if (debito) return 'debito';
  if (credito) return 'credito';
  return 'ambas';
};

/** Convierte "31/12/2025", "2025-12-31" o "31 de diciembre de 2025" a YYYY-MM-DD. */
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const extraerFecha = (texto) => {
  const t = normalizar(texto);
  let m = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = t.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = t.match(/(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?: de[l]? (\d{4}))?/);
  if (m && m[3]) return `${m[3]}-${String(MESES.indexOf(m[2]) + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
};

/** Categoría a partir de palabras clave (se usa si el banco no la entrega). */
const CATEGORIAS = [
  ['Delivery', /rappi|pedidos ?ya|uber ?eats|delivery|justo|cornershop/],
  ['Restaurantes', /restauran|sushi|pizza|burger|cafe|bar\b|gastronom|comida/],
  ['Supermercados', /supermercad|lider|jumbo|unimarc|tottus|santa isabel|acuenta/],
  ['Combustible', /copec|shell|petrobras|aramco|bencina|combustible/],
  ['Farmacias', /farmacia|cruz verde|salcobrand|ahumada/],
  ['Cine y entretención', /cine|cinemark|cinepolis|hoyts|teatro|concierto|entretenci/],
  ['Viajes', /viaje|hotel|aerolinea|latam|sky airline|jetsmart|turismo/],
  ['Salud y belleza', /salud|clinica|dental|optica|belleza|spa|peluquer/],
  ['Vestuario', /vestuario|ropa|zapat|moda|calzado/],
  ['Tecnología', /tecnolog|electro|celular|computador/],
  ['Educación', /educaci|curso|libreria|libro/],
  ['Hogar', /hogar|mueble|decoraci|sodimac|easy|construc/]
];
export const inferirCategoria = (...textos) => {
  const t = normalizar(textos.join(' '));
  return CATEGORIAS.find(([, re]) => re.test(t))?.[0] || 'Otros';
};

export const fetchJson = async (url, opciones = {}) => {
  const res = await fetch(url, {
    ...opciones,
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...(opciones.headers || {}) },
    signal: AbortSignal.timeout(30000)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
};

export const fetchTexto = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
};
