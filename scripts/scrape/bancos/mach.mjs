// MACHBANK: la página de beneficios carga todo desde el CMS de BCI
// (bci.cl/api/content/spaces/mach/...). La API rechaza llamadas directas, así
// que se abre la página con el navegador y se lee su respuesta JSON.
import { DIAS_SEMANA, normalizar } from '../../../src/utils/descuentos.js';
import { abrirPagina, debug } from '../navegador.mjs';
import { extraerDias, extraerFecha, extraerTipoTarjeta, idEstable, limpiarTexto, recortar } from '../lib.mjs';

const URL = 'https://www.machbank.cl/beneficios';
const API = /\/api\/content\/spaces\/mach\/types\/beneficios\/entries/;

// Concursos y beneficios de membresía que no son descuentos en un comercio
const NO_ES_DESCUENTO = /juega|participa|premios|mach premium/i;

const tipoTarjeta = (medios, texto) => {
  const m = normalizar((medios || []).join(' '));
  const debito = /debito|qr|boton/.test(m);
  const credito = /credito/.test(m);
  if (debito && credito) return 'ambas';
  if (credito) return 'credito';
  if (debito) return 'debito';
  return extraerTipoTarjeta(texto);
};

export const mapearBeneficio = ({ meta = {}, fields: f = {} }) => {
  const titulo = limpiarTexto(f.titulo);
  const descripcion = limpiarTexto(f.descripcion);
  const nombre = limpiarTexto(f.nombre_de_empresa);
  // A veces el "comercio" es un día ("Miércoles"): se usa el título en su lugar
  const establecimiento = !nombre || extraerDias(nombre).length ? titulo : nombre;
  const dias = extraerDias((f.dia_de_promo || []).join(' '));
  return {
    id: idEstable('mach', meta.uuid || meta.slug || titulo),
    establecimiento,
    descuento: titulo,
    descripcion,
    terminos: recortar(descripcion, 400),
    tipo_tarjeta: tipoTarjeta(f.medio_de_pago, `${titulo} ${descripcion}`),
    // Categoría genérica de MACH ("Market"): la app la deduce del texto si no sirve
    categoria: limpiarTexto(meta.category_name),
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: meta.unpublish_at ? extraerFecha(meta.unpublish_at) : '',
    es_delivery: /delivery|rappi|pedidos ?ya|uber ?eats/i.test(`${nombre} ${titulo} ${descripcion}`),
    url: URL,
    logo: f.logo_de_empresa?.url || f.logo_de_empresa?.thumb || ''
  };
};

export default {
  id: 'mach',
  banco_nombre: 'MACH',
  url: URL,
  async scrape() {
    const page = await abrirPagina();
    let entradas;
    page.on('response', async (res) => {
      if (entradas || !API.test(res.url()) || !res.ok()) return;
      try {
        entradas = (await res.json()).entries;
      } catch {
        // respuesta no JSON: se ignora
      }
    });
    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
    } finally {
      await page.close();
    }
    if (!Array.isArray(entradas)) throw new Error('no llegó la lista de beneficios de la API');
    const validos = entradas.filter(
      ({ fields: f }) => f?.titulo && !NO_ES_DESCUENTO.test(`${f.titulo} ${f.nombre_de_empresa} ${f.descripcion}`)
    );
    debug('mach: beneficios', entradas.length, 'válidos', validos.length);
    return validos.map(mapearBeneficio);
  }
};
