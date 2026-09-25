// Banco BICE: la página de beneficios (Modyo, detrás de Cloudflare) carga un
// widget JavaScript que trae todos los beneficios como `const entries = [...]`.
// Se abre con el navegador y se lee ese JSON del código del widget.
import { DIAS_SEMANA, normalizar } from '../../../src/utils/descuentos.js';
import { abrirPagina, debug } from '../navegador.mjs';
import { extraerArreglos, extraerDias, extraerFecha, idEstable, limpiarTexto, recortar } from '../lib.mjs';

const URL = 'https://banco.bice.cl/personas/beneficios';
const MARCA = 'const entries = ';

const CATEGORIAS = {
  restaurante: 'Restaurantes',
  gourmet: 'Restaurantes',
  delivery: 'Delivery',
  'viajes y transporte': 'Viajes',
  mascotas: 'Mascotas',
  'bienestar y entretencion': 'Bienestar'
};

const tipoTarjeta = (tipos) => {
  const t = normalizar((tipos || []).join(' '));
  const debito = /debito/.test(t);
  const credito = /credito/.test(t);
  if (debito && credito) return 'ambas';
  return debito ? 'debito' : 'credito';
};

// El texto chico completa la cifra ("$50.000" + "de dcto.") o dice dónde vale ("Online")
const COMPLEMENTO = /dcto|descuento|cuotas|inter[eé]s|adicional|por litro|%|\$/i;

/** "Hasta" + "7,5%" -> "Hasta 7,5%"; "40%" + "Presencial" -> "40%"; "$100" + "dcto. por litro" -> "$100 de descuento por litro". */
export const textoDescuento = (f) => {
  const grande = limpiarTexto(f['Texto-promo-big']) || limpiarTexto(f['Promo-index']);
  const chico = limpiarTexto(f['Texto-promo-small']);
  let texto = grande;
  if (COMPLEMENTO.test(chico)) texto = chico.length > 25 ? chico : `${grande} ${chico}`;
  return texto.replace(/\b(de )?dcto\b\.?/gi, 'de descuento').replace(/\s+/g, ' ').trim();
};

// Beneficios agrupados bajo "Cuotas": el comercio va en el título ("Despegar");
// si el título es solo la condición ("12 cuotas con tasa…") no hay comercio.
const comercioDe = (f, meta) => {
  const marca = limpiarTexto(f.Marca) || limpiarTexto(meta.name);
  if (normalizar(marca) !== 'cuotas') return marca;
  const titulo = limpiarTexto(f['Titulo-sitio-publico']);
  return titulo && !/^\d/.test(titulo) ? titulo : '';
};

export const mapearBeneficio = ({ meta = {}, fields: f = {} }) => {
  const establecimiento = comercioDe(f, meta);
  const descripcion = limpiarTexto(f['Bajada-sitio-publico'] || f.Bajada);
  const titulo = limpiarTexto(f['Titulo-sitio-publico']);
  const dias = extraerDias(`${titulo} ${descripcion}`);
  const categoria = normalizar(meta.category_name);
  return {
    id: idEstable('bice', meta.uuid || meta.slug || establecimiento),
    establecimiento,
    descuento: textoDescuento(f),
    descripcion,
    terminos: recortar(limpiarTexto(f.Condiciones_beneficio), 400),
    tipo_tarjeta: tipoTarjeta(f['Tipo Tarjeta']),
    // "Shopping" y "Cuotas" no dicen el rubro: la app lo deduce del texto
    categoria: CATEGORIAS[categoria] || meta.category_name || '',
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: extraerFecha(f['Fecha-hasta'] || ''),
    es_delivery: categoria === 'delivery' || /delivery/i.test(descripcion),
    url: meta.slug ? `${URL}/${meta.slug}` : URL,
    logo: f.Logo?.url || f.Logo?.thumb || ''
  };
};

export default {
  id: 'bice',
  banco_nombre: 'Banco Bice',
  url: URL,
  async scrape() {
    const page = await abrirPagina();
    let entradas = [];
    page.on('response', async (res) => {
      if (!/widget_manager\/.+\.js/.test(res.url()) || !res.ok()) return;
      try {
        const js = await res.text();
        if (js.includes(MARCA)) entradas = extraerArreglos(js, null, MARCA);
      } catch {
        // respuesta ilegible: se ignora
      }
    });
    try {
      await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
      // El widget llega después de la verificación de Cloudflare
      for (let i = 0; i < 30 && entradas.length === 0; i++) await page.waitForTimeout(1000);
    } finally {
      await page.close();
    }
    if (entradas.length === 0) throw new Error('no llegó el widget con los beneficios');
    // Las fichas de marca "Visa" son seguros y coberturas de la tarjeta, no descuentos
    const validos = entradas.filter(
      ({ fields: f }) => f?.Marca && (f['Texto-promo-big'] || f['Promo-index']) && normalizar(f.Marca) !== 'visa'
    );
    debug('bice: beneficios', entradas.length, 'válidos', validos.length);
    return validos.map(mapearBeneficio).filter((d) => d.establecimiento && d.descuento);
  }
};
