// Copec Pay: el sitio (WordPress) publica todos los beneficios en una API JSON
// (`/wp-json/custom/v1/beneficios/`) con comercio, días, fechas y categoría.
// No hace falta navegador.
import { DIAS_SEMANA, normalizar, toISODate } from '../../../src/utils/descuentos.js';
import { debug } from '../navegador.mjs';
import { extraerDias, extraerFecha, fetchJson, idEstable, inferirCategoria, limpiarTexto, recortar } from '../lib.mjs';

const URL = 'https://copecpay.cl/beneficios/';
const API = 'https://copecpay.cl/wp-json/custom/v1/beneficios/';

const nombres = (lista) => (Array.isArray(lista) ? lista.map((t) => t?.name).filter(Boolean) : []);

export const mapearBeneficio = (b) => {
  const acf = b.acf || {};
  const tax = b.taxonomies || {};
  const comercio = tax.comercio?.[0];
  const principal = limpiarTexto(acf.descripcion_beneficio_principal || b.descripcion_beneficio_principal);
  const corta = limpiarTexto(acf.descripcion_corta_int_bene || b.descripcion_corta_int_bene);
  const pasos = (acf.lista_personalizada || []).map((p) => limpiarTexto(p?.pasos)).filter(Boolean);
  const legal = limpiarTexto(acf.condiciones_legales_int);
  // Las etiquetas de días del sitio a veces contradicen el texto ("viernes,
  // sábados y domingos" etiquetado como todos los días): manda el texto
  const dias = extraerDias(principal).length ? extraerDias(principal) : extraerDias(nombres(tax.dias).join(' '));
  const texto = `${principal} ${corta}`;
  const establecimiento = limpiarTexto(comercio?.name) || limpiarTexto(b.title);
  // Copec agrupa comercios de su tienda bajo "Combustible": solo vale si habla de bencina
  const delSitio = nombres(tax['categorias-beneficios'])[0] || '';
  const categoria =
    normalizar(delSitio) === 'combustible' && !/combustible|bencina|litro|diesel/i.test(texto)
      ? inferirCategoria(establecimiento, texto.replace(/copec ?pay/gi, '')) // "Copec" haría creer que es bencina
      : delSitio;
  return {
    id: idEstable('copecpay', b.id),
    establecimiento,
    // "30% descuento todos los días pagando con Copec Pay" -> "30% descuento todos los días"
    descuento: principal.replace(/\s*pagando con (tu )?copec pay\.?$/i, '') || nombres(tax.descuento)[0] || '',
    descripcion: corta,
    // Cómo usarlo + condiciones legales
    terminos: recortar([pasos.length ? `Cómo usarlo: ${pasos.map((p, i) => `${i + 1}) ${p}`).join(' ')}` : '', legal].filter(Boolean).join(' '), 600),
    // Copec Pay es una cuenta con tarjeta prepago/débito
    tipo_tarjeta: 'debito',
    categoria,
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: extraerFecha(acf.fecha_de_termino || ''),
    es_delivery: /delivery|rappi|pedidos ?ya|uber ?eats|justo/i.test(texto),
    url: b.link || URL,
    logo: comercio?.image || b.featured_image || ''
  };
};

export default {
  id: 'copecpay',
  banco_nombre: 'Copec Pay',
  url: URL,
  async scrape() {
    const beneficios = await fetchJson(API);
    if (!Array.isArray(beneficios)) throw new Error('la API de Copec Pay no devolvió una lista');
    debug('copecpay: beneficios', beneficios.length);
    // La API trae también campañas pasadas: solo se guardan las vigentes
    const hoy = toISODate();
    return beneficios
      .filter((b) => b.title && b.acf?.descripcion_beneficio_principal)
      .map(mapearBeneficio)
      .filter((d) => !d.fecha_vencimiento || d.fecha_vencimiento >= hoy);
  }
};
