// Banco Falabella: la página /descuentos/todos (Next.js) trae todos los
// beneficios como JSON dentro del HTML (`benefitCardsData`). No hace falta navegador.
import { DIAS_SEMANA, normalizar } from '../../../src/utils/descuentos.js';
import { debug } from '../navegador.mjs';
import { extraerDias, extraerFecha, fetchTexto, idEstable, inferirCategoria, limpiarTexto } from '../lib.mjs';

const BASE = 'https://www.bancofalabella.cl';
const URL = `${BASE}/descuentos/todos`;

/** Une los fragmentos `self.__next_f.push([1,"..."])` del HTML en un solo texto. */
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

/** Extrae todos los arreglos `"benefitCardsData":[...]` del payload. */
export const extraerTarjetas = (payload) => {
  const tarjetas = [];
  const clave = '"benefitCardsData":';
  let desde = 0;
  while ((desde = payload.indexOf(clave, desde)) !== -1) {
    const inicio = desde + clave.length;
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
      tarjetas.push(...JSON.parse(payload.slice(inicio, fin + 1)));
    } catch {
      // bloque incompleto: se ignora
    }
    desde = fin;
  }
  return tarjetas;
};

const tipoDeTarjetas = (tarjetas = []) => {
  const t = normalizar(tarjetas.join(' '));
  const debito = /debito/.test(t);
  const credito = /cmr|credito|mastercard/.test(t.replace(/tarjeta debito[^,]*/g, ''));
  if (debito && credito) return 'ambas';
  if (debito) return 'debito';
  return 'credito';
};

export const mapearTarjeta = (item) => {
  const card = item.benefitCard || {};
  const titulo = limpiarTexto(card.title);
  const establecimiento =
    limpiarTexto(item.benefitTitle) || titulo.replace(/^(dcto\.?|descuento|beneficio)\s+((en|de|del)\s+)?/i, '');
  const descuento = [card.topDiscountText, card.centerDiscountText, card.bottomDiscountText]
    .map(limpiarTexto)
    .filter(Boolean)
    .join(' ')
    .replace(/\b(DESCUENTO|DCTO|SIN TOPE)\b/g, (m) => m.toLowerCase());
  const diasTexto = Array.isArray(card.discountDays) ? card.discountDays.join(' ') : '';
  const dias = extraerDias(diasTexto);
  const url = card.linkUrl ? new globalThis.URL(card.linkUrl, BASE).href : URL;
  return {
    id: idEstable('falabella', card.linkUrl || `${establecimiento}|${descuento}`),
    establecimiento,
    descuento: descuento || titulo,
    descripcion: limpiarTexto(card.description),
    tipo_tarjeta: tipoDeTarjetas(item.creditCards),
    categoria: inferirCategoria(establecimiento, titulo, card.description),
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: extraerFecha(item.limitDate || card.endDate || ''),
    es_delivery: /delivery|rappi|pedidos ?ya|uber ?eats/i.test(`${titulo} ${card.description}`),
    url
  };
};

export default {
  id: 'falabella',
  banco_nombre: 'Banco Falabella',
  url: URL,
  async scrape() {
    const html = await fetchTexto(URL);
    const tarjetas = extraerTarjetas(extraerPayload(html));
    debug('falabella: tarjetas en el HTML', tarjetas.length);
    // La misma tarjeta aparece en varias secciones de la página
    const unicas = [...new Map(tarjetas.map((t) => [t.benefitCard?.linkUrl || JSON.stringify(t.benefitCard), t])).values()];
    const mapeadas = unicas.map(mapearTarjeta);
    mapeadas.slice(0, 3).forEach((d) => debug('falabella:', JSON.stringify(d)));
    return mapeadas;
  }
};
