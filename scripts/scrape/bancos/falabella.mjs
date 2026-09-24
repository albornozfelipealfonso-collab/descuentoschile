// Banco Falabella: /descuentos/todos muestra todas las tarjetas de beneficios.
import { abrirPagina, debug } from '../navegador.mjs';
import { extraerDias, extraerTipoTarjeta, idEstable, inferirCategoria, limpiarTexto } from '../lib.mjs';
import { DIAS_SEMANA, normalizar } from '../../../src/utils/descuentos.js';

const URL = 'https://www.bancofalabella.cl/descuentos/todos';
const ETIQUETAS = /^(nuevo|exclusivo|destacado|online|presencial|elite|cmr elite|app copec)$/i;
const VALOR = /(\d+\s*%|\$\s?[\d.]+|\d+\s*x\s*\d+|\ba\s+\$?[\d.]{3,}|cashback|cuotas)/i;

/** Día de la semana en Chile, desplazado `offset` días (0 = hoy). */
const diaChile = (offset = 0) => {
  const nombre = new Date(Date.now() + offset * 86400000).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Santiago' });
  const i = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(nombre);
  return DIAS_SEMANA[i];
};

export const parsearDias = (texto) => {
  const t = normalizar(texto);
  if (t === 'hoy') return [diaChile(0)];
  if (t === 'manana') return [diaChile(1)];
  return extraerDias(texto);
};

/** Convierte las líneas de texto de una tarjeta en un descuento. */
export const parsearTarjeta = ({ titulo, lineas, href }) => {
  const establecimiento = limpiarTexto(titulo).replace(/^(dcto\.?|descuento|beneficio)\s+(en|de|del)\s+/i, '');
  const resto = lineas.map(limpiarTexto).filter((l) => l && l !== titulo);
  const idxDia = resto.findIndex((l) => parsearDias(l).length > 0);
  const idxValor = resto.findIndex((l, i) => i !== idxDia && VALOR.test(l));
  let descuento = idxValor >= 0 ? resto[idxValor] : '';
  const siguiente = resto[idxValor + 1];
  if (descuento && siguiente && /^(sin tope|descuento|dcto|de descuento|cashback|app copec)$/i.test(siguiente)) {
    descuento = `${descuento} ${siguiente.toLowerCase()}`;
  }
  const descripcion = resto.find((l, i) => i !== idxDia && i !== idxValor && !ETIQUETAS.test(l) && !VALOR.test(l) && l.length > 3) || '';
  const texto = [titulo, ...resto].join(' ');
  return {
    id: idEstable('falabella', href || `${establecimiento}|${descripcion}`),
    establecimiento,
    descuento: descuento || limpiarTexto(titulo),
    descripcion,
    tipo_tarjeta: /d[eé]bito/i.test(texto) ? extraerTipoTarjeta(texto) : 'credito', // la mayoría son con CMR
    categoria: inferirCategoria(establecimiento, texto),
    dias_validos: idxDia >= 0 ? parsearDias(resto[idxDia]) : [],
    fecha_vencimiento: '',
    es_delivery: /delivery|rappi|pedidos ?ya|uber ?eats/i.test(texto),
    url: href || URL
  };
};

export default {
  id: 'falabella',
  banco_nombre: 'Banco Falabella',
  url: URL,
  async scrape() {
    const page = await abrirPagina();
    let tarjetas = [];
    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
      // Desplazarse hasta que no aparezcan más tarjetas
      let antes = -1;
      for (let i = 0; i < 40; i++) {
        const n = await page.locator('[class*="NewCardBenefits_container"]').count();
        if (n === antes) break;
        antes = n;
        await page.mouse.wheel(0, 5000);
        await page.waitForTimeout(800);
        const verMas = page.getByRole('button', { name: /ver m[aá]s|cargar m[aá]s/i });
        if (await verMas.count()) await verMas.first().click().catch(() => {});
      }
      tarjetas = await page.$$eval('[class*="NewCardBenefits_container"]', (els) =>
        els.map((el) => ({
          titulo: el.querySelector('h2, h3')?.innerText?.trim() || '',
          lineas: el.innerText.split('\n').map((l) => l.trim()).filter(Boolean),
          href: el.closest('a')?.href || el.querySelector('a')?.href || ''
        }))
      );
    } finally {
      await page.close();
    }
    debug('falabella: tarjetas', tarjetas.length);
    tarjetas.slice(0, 4).forEach((t) => debug('falabella: tarjeta', JSON.stringify(t)));
    const unicas = [...new Map(tarjetas.filter((t) => t.titulo).map((t) => [JSON.stringify([t.titulo, t.lineas]), t])).values()];
    const mapeadas = unicas.map(parsearTarjeta);
    mapeadas.slice(0, 4).forEach((d) => debug('falabella: mapeada', JSON.stringify(d)));
    return mapeadas;
  }
};
