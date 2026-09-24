// BCI: la página de beneficios consulta api.bciplus.cl (requiere credenciales
// que agrega la propia página), así que se abre con un navegador y se leen
// las respuestas JSON de la API.
import { DIAS_SEMANA, normalizar } from '../../../src/utils/descuentos.js';
import { abrirPagina, debug } from '../navegador.mjs';
import { extraerDias, extraerFecha, extraerTipoTarjeta, idEstable, inferirCategoria, limpiarTexto } from '../lib.mjs';

const URL = 'https://www.bci.cl/beneficios/beneficios-bci';
const API = /bff-loyalty-beneficios\/v1\/offers\?/;
// Categorías de BCI que no describen el rubro
const CATEGORIAS_GENERICAS = new Set(['descuentos', 'preferencial', 'presencial', 'online', 'cashback', 'black-signature-infinite']);

const textoDescuento = (o) => {
  const pct = o.deal?.discount?.percentage ?? o.beneficio?.discount?.porcentajeDescuento;
  if (pct > 0) return `${pct}% de descuento`;
  const cb = o.deal?.cashback?.percentage ?? o.beneficio?.cashback?.porcentajeCashback;
  if (cb > 0) {
    const tope = o.deal?.cashback?.tope;
    return `${Math.round(cb * 100)}% de cashback${tope ? ` (tope $${tope.toLocaleString('es-CL')})` : ''}`;
  }
  return limpiarTexto(o.titulo);
};

export const mapearOferta = (o) => {
  const texto = [o.titulo, o.subtitulo, o.descripcion].map(limpiarTexto).join(' ');
  const comercio = limpiarTexto(o.comercio?.nombre) || limpiarTexto(o.titulo);
  const categoria = (o.categorias || []).map((c) => c.titulo).find((c) => c && !CATEGORIAS_GENERICAS.has(normalizar(c)));
  const recurrencia = (o.scheduling?.dayRecurrence || []).join(' ');
  const dias = extraerDias(recurrencia || o.scheduling?.recurrenceLabel || texto);
  const tarjetas = (o.deal?.total?.tarjetas || []).map((t) => t.tipo).join(' ');
  const descuento = textoDescuento(o);
  const titulo = limpiarTexto(o.titulo);
  return {
    id: idEstable('bci', o.id ?? o.slug ?? o.titulo),
    establecimiento: comercio,
    descuento,
    // El título de BCI suele ser un gancho ("Viernes - Vitacura"); se muestra como descripción
    descripcion: normalizar(titulo) !== normalizar(descuento) && normalizar(titulo) !== normalizar(comercio) ? titulo : limpiarTexto(o.subtitulo),
    terminos: limpiarTexto(o.legal || o.descripcion).slice(0, 600),
    tipo_tarjeta: extraerTipoTarjeta(`${tarjetas} ${o.subtitulo}`),
    categoria: categoria || inferirCategoria(comercio, texto),
    // Si el beneficio no indica días, vale todos los días
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: o.tieneFechaTermino === false ? '' : extraerFecha(o.fechaTermino || ''),
    es_delivery: /delivery|rappi|pedidos ?ya|uber ?eats/i.test(texto),
    url: o.slug ? `https://www.bci.cl/beneficios/beneficios-bci/detalle/${o.slug}` : URL
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
    if (paginas.size < total) throw new Error(`solo llegaron ${paginas.size} de ${total} páginas de la API`);
    const ofertas = [...paginas.values()].flat();
    debug('bci: ofertas', ofertas.length);
    const mapeadas = ofertas.map(mapearOferta);
    mapeadas.slice(0, 3).forEach((d) => debug('bci:', JSON.stringify(d).slice(0, 600)));
    return mapeadas;
  }
};
