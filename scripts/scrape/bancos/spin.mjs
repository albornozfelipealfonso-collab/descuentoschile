// Tarjeta Spin (Cruz Verde): el sitio lee los beneficios de un CMS público
// (Strapi) que responde JSON directo. Se pide con el navegador porque el
// servidor no envía su certificado intermedio: Chromium lo completa solo y
// Node no (y desactivar la verificación de TLS no es opción).
import { DIAS_SEMANA, normalizar } from '../../../src/utils/descuentos.js';
import { abrirPagina, debug } from '../navegador.mjs';
import { extraerDias, extraerFechaTermino, idEstable, inferirCategoria, limpiarTexto, recortar } from '../lib.mjs';

const URL = 'https://www.tarjetaspin.cl/';
const API = 'https://cms.tarjetaspin.cl/benefits?_limit=-1';

// Los beneficios no traen el comercio como campo: se reconoce en el texto.
// El primero que calce gana; si ninguno calza, es de Cruz Verde.
const COMERCIOS = [
  [/burger king/, 'Burger King', 'Restaurantes'],
  [/rappi/, 'Rappi', 'Delivery'],
  [/oxxo/, 'Oxxo', 'Supermercados'],
  [/netflix|spotify|disney|streaming/, 'Netflix, Disney+, Max y Spotify', 'Cine y entretención'],
  [/\bbip\b|movired/, 'Recarga Bip!', 'Transporte'],
  [/combustible|estaciones de servicio/, 'Estaciones de servicio', 'Combustible'],
  [/supermercado/, 'Supermercados', 'Supermercados'],
  [/mi mascota/, 'Mi Mascota', 'Mascotas'],
  [/maicao/, 'Maicao', 'Salud y belleza'],
  [/cruz ?verde|farmacia|medicamento|dermocosm/, 'Cruz Verde', 'Farmacias']
];

// Beneficios de la tarjeta que no son descuentos en comercios
const NO_ES_DESCUENTO = /mantenci[oó]n|costo \$?0/i;

export const mapearBeneficio = (b) => {
  const d = b.details || {};
  const titulo = limpiarTexto(d.title);
  const descripcion = limpiarTexto(d.description);
  const legal = limpiarTexto(d.legalText);
  const texto = normalizar(`${titulo} ${descripcion} ${legal}`);
  const [, establecimiento, categoria] = COMERCIOS.find(([re]) => re.test(texto)) || [null, 'Cruz Verde', 'Farmacias'];
  const dias = extraerDias(descripcion).length ? extraerDias(descripcion) : extraerDias(`${titulo} ${legal}`);
  return {
    id: idEstable('spin', b.id),
    establecimiento,
    descuento: titulo,
    descripcion,
    terminos: recortar(legal, 400),
    // Spin y Spin Visa son tarjetas de crédito
    tipo_tarjeta: 'credito',
    categoria: categoria || inferirCategoria(establecimiento, texto),
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: extraerFechaTermino(d.validityText) || extraerFechaTermino(legal),
    es_delivery: /rappi|delivery/.test(texto),
    url: URL
  };
};

export default {
  id: 'spin',
  banco_nombre: 'Tarjeta Spin Cruz Verde',
  url: URL,
  async scrape() {
    const page = await abrirPagina();
    let beneficios;
    try {
      const res = await page.goto(API, { timeout: 60000 });
      if (!res?.ok()) throw new Error(`HTTP ${res?.status()} en ${API}`);
      beneficios = await res.json();
    } finally {
      await page.close();
    }
    if (!Array.isArray(beneficios)) throw new Error('la API de Spin no devolvió una lista');
    const validos = beneficios.filter((b) => b.published_at && b.details?.title && !NO_ES_DESCUENTO.test(b.details.title));
    debug('spin: beneficios', beneficios.length, 'válidos', validos.length);
    // El CMS a veces tiene el mismo beneficio publicado dos veces
    const clave = (d) => [d.establecimiento, d.descuento, d.dias_validos.join()].join('|').toLowerCase();
    return [...new Map(validos.map(mapearBeneficio).map((d) => [clave(d), d])).values()];
  }
};
