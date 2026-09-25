// Tarjeta Cencosud Scotiabank: las páginas de beneficios (Next.js) traen la
// lista completa como JSON dentro del HTML (`"benefits":[...]`). No hace falta navegador.
import { DIAS_SEMANA, destacarDescuento, normalizar } from '../../../src/utils/descuentos.js';
import { debug } from '../navegador.mjs';
import {
  extraerArreglos,
  extraerDias,
  extraerFechaTermino,
  extraerPayload,
  fetchTexto,
  idEstable,
  inferirCategoria,
  limpiarTexto,
  recortar
} from '../lib.mjs';

const URL = 'https://www.tarjetacencosud.cl/publico/beneficios/landing/descuentos-comida';

// Donaciones, seguros y programas de puntos no son descuentos en comercios
const CATEGORIAS_EXCLUIDAS = new Set(['donaciones', 'seguros', 'cencosud']);
const NO_ES_DESCUENTO = /seguro|puntos cencosud|gana .*puntos|puntos extra|salones? vip|accesos? gratuitos|billetera digital/i;

// Páginas que agrupan varios beneficios: su nombre no es un comercio
const PAGINAS_GENERICAS = new Set(['momento-black', 'cuotas-sin-interes', 'viajes-black', 'escapadas-en-chile', 'ticketera']);

const CATEGORIAS = {
  comida: 'Restaurantes',
  salud: 'Salud y belleza',
  viajes: 'Viajes',
  educacion: 'Educación'
};

// "en todo Pandora", "En tiendas Paris", "en la App de Justo" -> Pandora, Paris, Justo
const NOMBRE_EN_TEXTO =
  /\b[Ee]n (?:todo |todas las |tiendas |locales |sucursales y distribuidores |la [Aa]pp de |[Aa]pp )?(\p{Lu}[\p{L}\p{N}'&.]*(?: \p{Lu}[\p{L}\p{N}'&.]*)*)/u;

// Páginas genéricas con nombre propio
const NOMBRES_PAGINA = { ticketera: 'Ticketeras' };

const capitalizar = (slug) =>
  slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

/** El comercio sale de la dirección del beneficio: ".../landing/papa-johns" -> "Papa Johns". */
const comercioDe = (b, titulo, descripcion) => {
  const url = String(b.url || '');
  const landing = url.match(/\/landing\/([a-z0-9-]+)/)?.[1];
  if (landing && !PAGINAS_GENERICAS.has(landing)) return capitalizar(landing);
  if (!landing && /^https?:/.test(url)) {
    // Enlace externo: el dominio ("despegar.cl" -> "Despegar")
    const dominio = new globalThis.URL(url).hostname.replace(/^www\d?\./, '').split('.')[0];
    if (!/tarjetacencosud|sii/.test(dominio)) return capitalizar(dominio);
  }
  // Sin comercio reconocible devuelve '' y el beneficio se descarta
  return descripcion.match(NOMBRE_EN_TEXTO)?.[1] || titulo.match(NOMBRE_EN_TEXTO)?.[1] || NOMBRES_PAGINA[landing] || '';
};

export const mapearBeneficio = (b) => {
  const titulo = limpiarTexto(b.title).replace(/^\$\$/, '$');
  const corta = limpiarTexto(b.short_description);
  // A veces la cifra está en la descripción y no en el título ("Spoiler alert…")
  const cifraEnCorta = !destacarDescuento(titulo).cifra && destacarDescuento(corta).cifra;
  const [descuento, descripcion] = cifraEnCorta ? [corta, titulo] : [titulo, corta];
  // Los textos repetidos vienen como referencias de Next.js ("$16"): se descartan
  const legal = typeof b.legal_text === 'string' && !/^\$\w+$/.test(b.legal_text) ? limpiarTexto(b.legal_text) : '';
  const texto = `${titulo} ${corta} ${legal}`;
  const establecimiento = comercioDe(b, titulo, corta);
  const dias = extraerDias(`${titulo} ${corta}`).length ? extraerDias(`${titulo} ${corta}`) : extraerDias(legal);
  // Primero por el comercio (Cineplanet viene marcado como "comida"); si no, la del sitio
  const porComercio = inferirCategoria(establecimiento, descuento);
  const categoria = porComercio !== 'Otros' ? porComercio : (b.categories || []).map((c) => CATEGORIAS[c]).find(Boolean);
  return {
    id: idEstable('cencosud', b.id),
    establecimiento,
    descuento,
    descripcion,
    terminos: recortar(legal, 400),
    // La Tarjeta Cencosud Scotiabank es de crédito
    tipo_tarjeta: 'credito',
    categoria: categoria || 'Otros',
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: extraerFechaTermino(legal),
    es_delivery: /delivery|rappi|pedidos ?ya|uber ?eats|justo/i.test(texto),
    url: /^https:/.test(b.url || '') ? b.url : URL,
    logo: b.logo_card || ''
  };
};

/** Solo beneficios activos con una cifra de descuento (%, $, 2x1, cuotas). */
export const esDescuento = (b) =>
  b.is_active !== false &&
  !(b.categories || []).some((c) => CATEGORIAS_EXCLUIDAS.has(normalizar(c))) &&
  !NO_ES_DESCUENTO.test(`${b.title} ${b.short_description}`) &&
  Boolean(destacarDescuento(`${b.title} ${b.short_description}`).cifra);

export default {
  id: 'cencosud',
  banco_nombre: 'Cencosud',
  url: URL,
  async scrape() {
    const html = await fetchTexto(URL);
    const beneficios = [...new Map(extraerArreglos(extraerPayload(html), 'benefits').map((b) => [b.id, b])).values()];
    const validos = beneficios.filter(esDescuento);
    debug('cencosud: beneficios', beneficios.length, 'descuentos', validos.length);
    return validos.map(mapearBeneficio).filter((d) => d.establecimiento);
  }
};
