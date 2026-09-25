// Tenpo: la página de beneficios (Webflow) trae las tarjetas en el HTML,
// paginadas con ?<id>_page=N. Cada tarjeta marca sus campos con atributos
// `fs-cmsfilter-field` (Tipo, Name…) y clases fijas (título, texto, días).
import { DIAS_SEMANA, destacarDescuento } from '../../../src/utils/descuentos.js';
import { debug } from '../navegador.mjs';
import { extraerDias, extraerTipoTarjeta, fetchTexto, idEstable, inferirCategoria, limpiarTexto } from '../lib.mjs';

const BASE = 'https://www.tenpo.cl';
const URL = `${BASE}/beneficios`;
const MAX_PAGINAS = 15;
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Texto del primer elemento cuya etiqueta de apertura calce con `patron`. */
const campo = (html, patron) => {
  const m = html.match(new RegExp(`<div[^>]*${patron}[^>]*>([\\s\\S]*?)</div>`));
  return limpiarTexto(m?.[1]);
};

/** "/beneficios/comunidad-feliz-septiembre-2026" -> "2026-09-30" (fin de ese mes). */
export const vencimientoDelEnlace = (enlace) => {
  const m = String(enlace).match(new RegExp(`(${MESES.join('|')})-(\\d{4})`));
  if (!m) return '';
  const ultimo = new Date(Number(m[2]), MESES.indexOf(m[1]) + 1, 0);
  return `${m[2]}-${String(ultimo.getMonth() + 1).padStart(2, '0')}-${String(ultimo.getDate()).padStart(2, '0')}`;
};

/** Convierte el HTML de una tarjeta (`beneficio-collection-item`) en un descuento. */
export const mapearTarjeta = (html) => {
  const establecimiento = campo(html, 'fs-cmsfilter-field="Name"');
  const titulo = campo(html, 'class="titulo-beneficio-all"');
  const texto = campo(html, 'class="p-text-beneficio-copy"');
  const tipo = [...html.matchAll(/fs-cmsfilter-field="Tipo"[^>]*>([^<]*)</g)].map((m) => m[1]).join(' ');
  // Los días van en su propia lista dentro de "cat-dias"
  const bloqueDias = html.match(/class="cat-dias"([\s\S]*?)class="titulo-beneficio/)?.[1] || '';
  const dias = extraerDias(limpiarTexto(bloqueDias));
  const enlace = html.match(/href="(\/beneficios\/[^"]+)"/)?.[1] || '';
  return {
    id: idEstable('tenpo', enlace || `${establecimiento}|${titulo}`),
    establecimiento,
    descuento: titulo,
    descripcion: texto,
    terminos: '',
    tipo_tarjeta: extraerTipoTarjeta(tipo),
    categoria: inferirCategoria(establecimiento, titulo, texto),
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: vencimientoDelEnlace(enlace),
    es_delivery: /delivery|rappi|pedidos ?ya|uber ?eats/i.test(`${establecimiento} ${titulo} ${texto}`),
    url: enlace ? `${BASE}${enlace}` : URL,
    logo: html.match(/<img[^>]*src="([^"]+)"[^>]*class="brand-partner"/)?.[1] || ''
  };
};

export default {
  id: 'tenpo',
  banco_nombre: 'Tenpo',
  url: URL,
  async scrape() {
    const tarjetas = new Map();
    let pagina = URL;
    for (let n = 1; n <= MAX_PAGINAS && pagina; n++) {
      const html = await fetchTexto(pagina);
      // Se corta por la clase de la tarjeta: los días también son un role="listitem"
      const items = html.split('class="beneficio-collection-item').slice(1);
      const antes = tarjetas.size;
      // Sin cifra ("Preventas exclusivas", "Beneficios exclusivos…") no es un descuento concreto
      items
        .map(mapearTarjeta)
        .filter((d) => d.establecimiento && destacarDescuento(d.descuento).cifra)
        .forEach((d) => tarjetas.set(d.id, d));
      debug(`tenpo: página ${n}, ${items.length} tarjetas`);
      // Siguiente página: el enlace "?xxxx_page=N+1"; se corta si no trae nada nuevo
      const siguiente = html.match(new RegExp(`href="(\\?[a-z0-9]+_page=${n + 1})"`))?.[1];
      pagina = siguiente && tarjetas.size > antes ? `${URL}${siguiente}` : null;
    }
    return [...tarjetas.values()];
  }
};
