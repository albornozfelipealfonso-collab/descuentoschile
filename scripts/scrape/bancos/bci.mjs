// BCI: la página de beneficios consulta api.bciplus.cl (requiere credenciales
// que agrega la propia página), así que se abre con un navegador y se leen
// las respuestas de la API.
import { abrirPagina, debug } from '../navegador.mjs';
import { extraerDias, extraerFecha, extraerTipoTarjeta, idEstable, inferirCategoria, limpiarTexto } from '../lib.mjs';

const URL = 'https://www.bci.cl/beneficios/beneficios-bci';
const API = /bff-loyalty-beneficios\/v1\/offers\?/;

// Busca el primer valor de texto no vacío entre varias rutas posibles
const primero = (obj, ...rutas) => {
  for (const ruta of rutas) {
    const v = ruta.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
};

export const mapearOferta = (o) => {
  const texto = [o.titulo, o.subtitulo, o.descripcion, o.legal].map(limpiarTexto).join(' ');
  const comercio = primero(o, 'comercio.nombre', 'nombreComercio', 'comercio', 'marca.nombre', 'marca', 'nombre', 'tituloComercio', 'partner.nombre');
  const categoria = primero(o, 'categoria.nombre', 'categoria', 'categorias.0.nombre', 'categorias.0', 'rubro.nombre', 'rubro');
  const slug = primero(o, 'slug', 'url', 'friendlyUrl');
  const diasTexto = [primero(o, 'dias', 'diasVigencia', 'vigencia.dias'), texto].join(' ');
  return {
    id: idEstable('bci', o.id ?? slug ?? o.titulo),
    establecimiento: limpiarTexto(comercio || o.titulo),
    descuento: limpiarTexto(o.titulo),
    descripcion: limpiarTexto(o.descripcion || o.subtitulo).slice(0, 400),
    terminos: limpiarTexto(o.legal).slice(0, 600),
    tipo_tarjeta: extraerTipoTarjeta(`${o.subtitulo} ${o.descripcion}`),
    categoria: categoria || inferirCategoria(comercio, texto),
    dias_validos: extraerDias(diasTexto),
    fecha_vencimiento: extraerFecha(primero(o, 'fechaTermino', 'fechaFin', 'fechaVencimiento', 'vigencia.hasta', 'hasta') || o.legal),
    es_delivery: /delivery|rappi|pedidos ?ya|uber ?eats/i.test(texto),
    url: slug && !slug.startsWith('http') ? `https://www.bci.cl/beneficios/beneficios-bci/detalle/${slug}` : slug || URL
  };
};

export default {
  id: 'bci',
  banco_nombre: 'BCI',
  url: URL,
  async scrape() {
    const page = await abrirPagina();
    const paginas = new Map();
    let total = Infinity;
    page.on('response', async (res) => {
      if (!API.test(res.url()) || !res.ok()) return;
      try {
        const json = await res.json();
        total = json.paginado?.totalPaginas ?? total;
        paginas.set(json.paginado?.paginaActual ?? paginas.size + 1, json.ofertas || []);
      } catch {
        // respuesta no JSON: se ignora
      }
    });
    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
      for (let i = 0; i < 30 && paginas.size < total; i++) {
        await page.mouse.wheel(0, 4000);
        await page.waitForTimeout(1000);
      }
    } finally {
      await page.close();
    }
    const ofertas = [...paginas.values()].flat();
    debug('bci: páginas', paginas.size, 'de', total, '| ofertas', ofertas.length);
    if (ofertas[0]) debug('bci: claves', Object.keys(ofertas[0]).join(', '));
    ofertas.slice(0, 2).forEach((o) => debug('bci: oferta', JSON.stringify(o).slice(0, 2500)));
    const mapeadas = ofertas.map(mapearOferta);
    mapeadas.slice(0, 3).forEach((d) => debug('bci: mapeada', JSON.stringify(d)));
    return mapeadas;
  }
};
