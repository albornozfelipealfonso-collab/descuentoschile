// scripts/scrape/lib.mjs - utilidades compartidas por los scrapers
import { createHash } from 'node:crypto';
import { DIAS_SEMANA, normalizar } from '../../src/utils/descuentos.js';

// La inferencia de categoría vive en la app, que también la aplica al cargar datos.
export { inferirCategoria } from '../../src/utils/descuentos.js';

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

/** Recorta un texto largo en el último espacio antes de `max` y agrega "…". */
export const recortar = (texto, max) => {
  const t = String(texto ?? '');
  if (t.length <= max) return t;
  const corte = t.lastIndexOf(' ', max - 1);
  return `${t.slice(0, corte > max * 0.6 ? corte : max - 1).replace(/[\s.,;:]+$/, '')}…`;
};

const RANGO = /(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)s?\s+(?:a|al)\s+(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)/i;

/** Detecta días de la semana en un texto libre ("martes y jueves", "lunes a viernes", "todos los días"). */
export const extraerDias = (texto) => {
  const t = normalizar(texto);
  if (!t) return [];
  // "todos los días martes" es solo martes, no todos los días
  if (/todos los dias(?!\s+(lunes|martes|miercoles|jueves|viernes|sabado|domingo))|todo el ano|todos los meses|diariamente/.test(t)) {
    return [...DIAS_SEMANA];
  }
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
  // Fecha-hora ISO (UTC) → fecha en Chile: "2027-01-01T02:59:59Z" es el 31/12/2026 allá
  const iso = String(texto ?? '').match(/\d{4}-\d{2}-\d{2}T[\d:.]+(Z|[+-]\d{2}:?\d{2})/);
  if (iso) return new Date(iso[0]).toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
  const t = normalizar(texto);
  let m = t.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  // "31/12/2026" o "31/12/26"
  m = t.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})\b/);
  if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = t.match(/(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?: de[l]? (\d{4}))?/);
  if (m && m[3]) return `${m[3]}-${String(MESES.indexOf(m[2]) + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return '';
};

/**
 * Fecha de término de un texto de vigencia: "Válido entre el 01/01/2026 hasta el
 * 30/09/2026" -> 2026-09-30. Si viene sin año ("Hasta el 30 de septiembre") se
 * asume el próximo 30 de septiembre (este año, o el siguiente si ya pasó hace más de un mes).
 */
export const extraerFechaTermino = (texto, hoy = new Date()) => {
  const t = normalizar(texto);
  const corte = Math.max(t.lastIndexOf('hasta'), t.lastIndexOf(' al '));
  if (corte === -1) return '';
  const tramo = t.slice(corte);
  const fecha = extraerFecha(tramo);
  if (fecha) return fecha;
  const m = tramo.match(/(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/);
  if (!m) return '';
  const mes = MESES.indexOf(m[2]);
  let anio = hoy.getFullYear();
  if (new Date(anio, mes, Number(m[1])) < new Date(anio, hoy.getMonth() - 1, hoy.getDate())) anio++;
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
};

/** Une los fragmentos `self.__next_f.push([1,"..."])` de un HTML de Next.js en un solo texto. */
export const extraerPayload = (html) =>
  [...html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)]
    .map((m) => {
      try {
        return JSON.parse(m[1]);
      } catch {
        return '';
      }
    })
    .join('');

/**
 * Extrae y une todos los arreglos `"<clave>":[...]` que aparezcan en el payload.
 * Con `marca` se busca otro prefijo, p. ej. `const entries = ` en un JavaScript.
 */
export const extraerArreglos = (payload, clave, marca = `"${clave}":`) => {
  const resultado = [];
  let desde = 0;
  while ((desde = payload.indexOf(marca, desde)) !== -1) {
    const inicio = desde + marca.length;
    let nivel = 0;
    let enTexto = false;
    let fin = inicio;
    for (; fin < payload.length; fin++) {
      const c = payload[fin];
      if (enTexto) {
        if (c === '\\') fin++;
        else if (c === '"') enTexto = false;
      } else if (c === '"') enTexto = true;
      else if (c === '[' || c === '{') nivel++;
      else if (c === ']' || c === '}') {
        nivel--;
        if (nivel === 0) break;
      }
    }
    try {
      const valor = JSON.parse(payload.slice(inicio, fin + 1));
      if (Array.isArray(valor)) resultado.push(...valor);
    } catch {
      // bloque incompleto: se ignora
    }
    desde = fin;
  }
  return resultado;
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
