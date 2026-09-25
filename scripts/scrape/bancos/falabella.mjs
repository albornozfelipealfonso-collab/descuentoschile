// Banco Falabella: la página /descuentos/todos (Next.js) trae todos los
// beneficios como JSON dentro del HTML (`benefitCardsData`). No hace falta navegador.
import { DIAS_SEMANA, normalizar } from '../../../src/utils/descuentos.js';
import { debug } from '../navegador.mjs';
import {
  extraerArreglos,
  extraerDias,
  extraerFecha,
  extraerPayload,
  fetchTexto,
  idEstable,
  inferirCategoria,
  limpiarTexto
} from '../lib.mjs';

const BASE = 'https://www.bancofalabella.cl';
const URL = `${BASE}/descuentos/todos`;

// Páginas de categoría del sitio → categoría en la app
const CATEGORIAS = {
  restaurantes: 'Restaurantes',
  antojos: 'Restaurantes',
  mercado: 'Supermercados',
  viajes: 'Viajes',
  transporte: 'Transporte',
  entretencion: 'Cine y entretención',
  salud: 'Salud y belleza',
  belleza: 'Salud y belleza',
  servicios: 'Servicios',
  hogar: 'Hogar',
  mascotas: 'Mascotas',
  educacion: 'Educación',
  'cuotas-sin-interes': 'Cuotas sin interés'
};

export { extraerPayload };

/** Extrae todos los arreglos `"benefitCardsData":[...]` del payload. */
export const extraerTarjetas = (payload) => extraerArreglos(payload, 'benefitCardsData');

/** Next.js reemplaza valores repetidos por referencias ("$28:props:..."); se ignoran. */
const valor = (v) => (typeof v === 'string' && v.startsWith('$') ? undefined : v);
const lista = (v) => (Array.isArray(v) ? v : []);

/** Logo del comercio desde Contentful, pedido en tamaño pequeño (el original pesa cientos de KB). */
const urlLogo = (logo) => {
  if (typeof logo !== 'string' || !logo.includes('ctfassets.net')) return '';
  return `${logo.startsWith('//') ? 'https:' : ''}${logo}?w=160&h=160&fit=pad&fm=webp&q=80`;
};

const tipoDeTarjetas = (tarjetas) => {
  if (!lista(tarjetas).length) return 'credito';
  const t = normalizar(lista(tarjetas).join(' '));
  const debito = /debito/.test(t);
  const credito = /cmr|credito|mastercard/.test(t.replace(/tarjeta debito[^,]*/g, ''));
  if (debito && credito) return 'ambas';
  if (debito) return 'debito';
  return 'credito';
};

export const mapearTarjeta = (item, categoriaDelSitio) => {
  const card = item.benefitCard || {};
  const titulo = limpiarTexto(valor(card.title));
  // El título de la tarjeta ("Dcto en Doggis") es más fiable que benefitTitle, que a veces es un
  // eslogan; pero si el título es genérico ("Dcto en Restaurante") se usa benefitTitle.
  const delTitulo = titulo.replace(/^(dcto\.?|descuento|beneficios?)\s+((en|de|del)\s+)?/i, '').trim();
  const generico = !delTitulo || /^(restaurantes?|tiendas?|comercios?|locales?)$/i.test(delTitulo);
  const establecimiento = (generico && limpiarTexto(valor(item.benefitTitle))) || delTitulo;
  const descuento = [card.topDiscountText, card.centerDiscountText, card.bottomDiscountText]
    .map((v) => limpiarTexto(valor(v)))
    .filter(Boolean)
    .join(' ')
    .replace(/\b(DESCUENTO|DCTO|SIN TOPE)\b/g, (m) => m.toLowerCase());
  const diasTexto = lista(card.discountDays).join(' ');
  const dias = extraerDias(diasTexto);
  const link = valor(card.linkUrl);
  const url = link ? new globalThis.URL(link, BASE).href : URL;
  return {
    id: idEstable('falabella', link || `${establecimiento}|${descuento}`),
    establecimiento,
    descuento: descuento || titulo,
    descripcion: normalizar(valor(card.description)) === normalizar(descuento) ? '' : limpiarTexto(valor(card.description)),
    tipo_tarjeta: tipoDeTarjetas(item.creditCards),
    categoria: categoriaDelSitio || inferirCategoria(establecimiento, titulo, valor(card.description)),
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: extraerFecha(valor(item.limitDate) || valor(card.endDate) || ''),
    es_delivery: /delivery|rappi|pedidos ?ya|uber ?eats/i.test(`${titulo} ${valor(card.description) || ''}`),
    url,
    logo: urlLogo(valor(card.logoCard))
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

    // Categoría de cada beneficio según la página de categoría en que aparece
    // (si una página falla, se usa la categoría inferida por palabras clave)
    const categoriaPorLink = new Map();
    for (const [slug, categoria] of Object.entries(CATEGORIAS)) {
      try {
        const html = await fetchTexto(`${BASE}/descuentos/${slug}`);
        for (const t of extraerTarjetas(extraerPayload(html))) {
          const link = t.benefitCard?.linkUrl;
          if (link && !categoriaPorLink.has(link)) categoriaPorLink.set(link, categoria);
        }
      } catch (error) {
        debug(`falabella: categoría ${slug} no disponible (${error.message})`);
      }
    }
    debug('falabella: beneficios con categoría del sitio', categoriaPorLink.size);

    const mapeadas = unicas.map((t) => mapearTarjeta(t, categoriaPorLink.get(t.benefitCard?.linkUrl)));
    mapeadas.slice(0, 3).forEach((d) => debug('falabella:', JSON.stringify(d)));
    return mapeadas;
  }
};
