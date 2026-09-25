// Banco Ripley: los beneficios de restaurantes ("Restofans") vienen de
// /api/call-sp-api, que exige cabeceras que agrega la propia página; por eso se
// abre con el navegador y se lee la respuesta JSON.
import { DIAS_SEMANA, normalizar } from '../../../src/utils/descuentos.js';
import { abrirPagina, debug } from '../navegador.mjs';
import { extraerDias, extraerFechaTermino, idEstable, limpiarTexto, recortar } from '../lib.mjs';

const URL = 'https://www.bancoripley.cl/beneficios-y-promociones';
const API = /\/api\/call-sp-api/;

const valor = (obj, campo) => limpiarTexto(obj?.[campo]?.value);

const tipoTarjeta = (tarjetas) => {
  const t = normalizar(tarjetas);
  const debito = /debit/.test(t);
  const credito = /credit/.test(t);
  if (debito && credito) return 'ambas';
  return debito ? 'debito' : 'credito';
};

export const mapearBeneficio = (item) => {
  const p = item.params || {};
  const restricciones = p.boxRestricciones || {};
  const establecimiento = valor(p, 'txtNameComercio');
  const legal = valor(p.details, 'txtLegal');
  const dias = extraerDias(valor(p, 'txtValidezBeneficio'));
  // "Italiana · R.M. (Vitacura)"
  const descripcion = [valor(p, 'txtSubtitulo'), valor(p, 'txtDetalleCard')].filter(Boolean).join(' · ');
  return {
    id: idEstable('ripley', item.config?.id || establecimiento),
    establecimiento,
    descuento: valor(p, 'txtDescuento').replace(/\bdcto\b\.?/i, 'de descuento'),
    descripcion,
    terminos: recortar(legal, 400),
    tipo_tarjeta: tipoTarjeta(restricciones.boxTarjetas?.valueBox),
    categoria: 'Restaurantes',
    dias_validos: dias.length ? dias : [...DIAS_SEMANA],
    fecha_vencimiento: extraerFechaTermino(legal) || extraerFechaTermino(valor(p, 'txtVigenciaDetalle')),
    es_delivery: /delivery/.test(restricciones.boxConsumo?.valueBox || ''),
    url: URL,
    logo: valor(p, 'imgLogo')
  };
};

/** Las respuestas de la API son "cajas" de beneficios; cada una trae sus `items`. */
const itemsDe = (json) =>
  (Array.isArray(json?.data) ? json.data : [])
    .filter((caja) => caja?.config?.active !== false && Array.isArray(caja.items))
    .flatMap((caja) => caja.items);

export default {
  id: 'ripley',
  banco_nombre: 'Banco Ripley',
  url: URL,
  async scrape() {
    const page = await abrirPagina();
    const items = new Map();
    page.on('response', async (res) => {
      if (!API.test(res.url()) || !res.ok()) return;
      try {
        itemsDe(await res.json()).forEach((it) => items.set(it.config?.id, it));
      } catch {
        // respuesta no JSON: se ignora
      }
    });
    try {
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 });
    } finally {
      await page.close();
    }
    const activos = [...items.values()].filter((it) => it.config?.active !== false && it.params?.txtNameComercio?.value);
    debug('ripley: beneficios', items.size, 'activos', activos.length);
    return activos.map(mapearBeneficio);
  }
};
