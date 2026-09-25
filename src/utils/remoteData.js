// src/utils/remoteData.js
// Descarga los datos publicados más recientes (generados por GitHub Actions)
// para que la web y la APK se actualicen sin publicar una versión nueva.
import { validarDatos } from './descuentos';

export const DATA_URL =
  import.meta.env.VITE_DATA_URL ||
  'https://raw.githubusercontent.com/albornozfelipealfonso-collab/descuentoschile/master/src/data/descuentos.json';

const CACHE_KEY = 'cardDiscount_datos_remotos';

const conFecha = (datos, generado) => ({ generado: generado || '', ...datos });

/** El más reciente según `generado` (ISO); ante empate gana `a`, y si falta uno, el otro. */
export const masReciente = (a, b) => (b && (!a || (b.generado || '') > (a.generado || '')) ? b : a);

export const leerCache = () => {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY));
    const { datos } = validarDatos(cache);
    return datos ? conFecha(datos, cache.generado) : null;
  } catch {
    return null;
  }
};

const guardarCache = (datos) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(datos));
  } catch {
    // almacenamiento lleno o no disponible: se usará la versión incluida
  }
};

/** Devuelve los datos remotos validados, o null si no hay conexión o vienen mal. */
export const descargarDatos = async (url = DATA_URL) => {
  try {
    const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const json = await res.json();
    const { datos } = validarDatos(json);
    if (!datos) return null;
    const resultado = conFecha(datos, json.generado);
    guardarCache(resultado);
    return resultado;
  } catch {
    return null;
  }
};
