// Banco de Chile: la página de beneficios (Modyo) carga todo desde
// /api/content/spaces/personas/types/beneficios/entries (de a 100 por página).
// Su protección (Incapsula) bloquea el navegador oculto y los servidores de
// GitHub, así que se abre un navegador con ventana y solo corre en un
// computador local (`soloLocal`): `npm run scrape bancochile`.
import { DIAS_SEMANA, normalizar } from '../../../src/utils/descuentos.js';
import { abrirPaginaVisible, debug } from '../navegador.mjs';
import { extraerDias, extraerFecha, extraerFechaTermino, idEstable, limpiarTexto, recortar } from '../lib.mjs';

const BASE = 'https://sitiospublicos.bancochile.cl/personas/beneficios';
const API = /\/types\/beneficios\/entries\?per_page=100&page=(\d+)$/;

// Categorías del sitio -> app. Las de campaña ("40-de-descuento-visa") o
// genéricas no se mapean y la app deduce el rubro del texto.
const CATEGORIAS = {
  'restaurantes-y-bares': 'Restaurantes',
  'sabores-gourmet': 'Restaurantes',
  cafeterias: 'Restaurantes',
  'comida-rapida': 'Restaurantes',
  salud: 'Salud y belleza',
  belleza: 'Salud y belleza',
  delivery: 'Delivery',
  entretencion: 'Cine y entretención',
  musica: 'Cine y entretención',
  cine: 'Cine y entretención',
  panoramas: 'Cine y entretención',
  deportes: 'Deportes',
  viajes: 'Viajes',
  mascotas: 'Mascotas'
};

// Canje de puntos, no descuentos
const EXCLUIDAS = new Set(['dolares-premio']);

// Etiquetas sin guion que no son lugares
const ETIQUETAS_INTERNAS = new Set(['segmentado', 'planes', 'presencial', 'online', 'destacado', 'nuevo', 'nuevos']);

const capitalizar = (t) => t.replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase());

/** "20%; dto." -> "20% de descuento"; "Hasta; 25% dto." -> "Hasta 25% de descuento". */
export const textoDescuento = (tipo) =>
  limpiarTexto(String(tipo ?? '').replace(/;/g, ' '))
    .replace(/\b(de )?dto\b\.?/gi, 'de descuento')
    .replace(/[.\s]+$/, '');

const tipoTarjeta = (tarjetas) => {
  const t = normalizar((tarjetas || []).join(' '));
  const debito = /debito|cuenta/.test(t);
  const credito = /credito/.test(t);
  if (debito && !credito) return 'debito';
  if (credito && !debito) return 'credito';
  return 'ambas';
};

export const mapearBeneficio = ({ meta = {}, fields: f = {} }) => {
  const extracto = limpiarTexto(f.Extracto); // "lunes y martes presencial"
  const tags = (meta.tags || []).map(String);
  const dias = extraerDias(extracto).length ? extraerDias(extracto) : extraerDias(tags.join(' '));
  // Las etiquetas mezclan días, lugares ("los ríos", "valdivia") y etiquetas
  // internas de campaña ("destacado-del-mes", "invierno-2026", "segmentado")
  const lugar = tags
    .map((t) => (normalizar(t) === 'todo-chile' ? 'todo chile' : t))
    .filter((t) => !extraerDias(t).length && !/[-\d]/.test(t) && !ETIQUETAS_INTERNAS.has(normalizar(t)))
    .map(capitalizar)
    .join(', ');
  const descripcion = [
    extracto && capitalizar(extracto.charAt(0)) + extracto.slice(1),
    lugar && `Dónde: ${lugar}`,
    limpiarTexto(f.Descripcion)
  ]
    .filter(Boolean)
    .join('. ');
  const vigencia = limpiarTexto(f.Vigencia);
  return {
    id: idEstable('bancochile', meta.uuid || meta.slug),
    establecimiento: limpiarTexto(f.Titulo) || limpiarTexto(meta.name),
    descuento: textoDescuento(f['Tipo Beneficio']),
    descripcion: recortar(descripcion, 700),
    terminos: recortar(limpiarTexto(f['Condiciones Comerciales']) || vigencia, 500),
    tipo_tarjeta: tipoTarjeta(f['Tarjetas Permitidas']),
    // Sin equivalente (campañas, "Beneficios y Descuentos") queda vacía y la app deduce el rubro
    categoria: CATEGORIAS[normalizar(meta.category_name).replace(/\s+/g, '-')] || '',
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: extraerFechaTermino(vigencia) || (meta.unpublish_at ? extraerFecha(meta.unpublish_at) : ''),
    es_delivery: /delivery/i.test(`${meta.category_name} ${extracto}`),
    url: limpiarTexto(f['Url Beneficio Externa']) || (meta.slug ? `${BASE}/detalle/${meta.slug}` : BASE),
    logo: f.Logo?.url || ''
  };
};

export default {
  id: 'bancochile',
  banco_nombre: 'Banco de Chile',
  url: BASE,
  soloLocal: true,
  async scrape() {
    const page = await abrirPaginaVisible();
    const paginas = new Map();
    page.on('response', async (res) => {
      const m = res.url().match(API);
      if (!m || !res.ok()) return;
      try {
        paginas.set(Number(m[1]), (await res.json()).entries || []);
      } catch {
        // respuesta ilegible: se ignora
      }
    });
    try {
      await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 });
      await page.waitForTimeout(2000);
    } finally {
      await page.close();
    }
    const entradas = [...paginas.entries()].sort((a, b) => a[0] - b[0]).flatMap(([, e]) => e);
    if (entradas.length === 0) throw new Error('no llegaron beneficios (¿bloqueo del sitio?)');
    debug('bancochile: páginas', paginas.size, 'beneficios', entradas.length);
    return entradas
      .filter((e) => !EXCLUIDAS.has(normalizar(e.meta?.category_name)) && e.fields?.['Tipo Beneficio'])
      .map(mapearBeneficio);
  }
};
