// src/utils/storage.js
// Borrador del panel admin en localStorage, ligado a la versión de initialData.js.
// Si initialData.js cambia (p. ej. tras pegar el código generado), el borrador
// antiguo se descarta y se parte desde los datos nuevos.

const DRAFT_KEY = 'cardDiscount_draft_v2';
const LEGACY_KEYS = ['cardDiscount_bancos', 'cardDiscount_descuentos', 'cardDiscount_session'];

/** Hash corto (djb2) para detectar cambios en los datos base. */
export const hashDatos = (datos) => {
  const str = JSON.stringify(datos);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
};

const safe = (fn, fallback = null) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const limpiarClavesAntiguas = () =>
  safe(() => LEGACY_KEYS.forEach((k) => localStorage.removeItem(k)));

export const cargarBorrador = (baseVersion) =>
  safe(() => {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (draft?.baseVersion === baseVersion && Array.isArray(draft.bancos) && Array.isArray(draft.descuentos)) {
      return draft;
    }
    return null;
  });

export const guardarBorrador = (baseVersion, bancos, descuentos) =>
  safe(() => localStorage.setItem(DRAFT_KEY, JSON.stringify({ baseVersion, bancos, descuentos })));

export const descartarBorrador = () => safe(() => localStorage.removeItem(DRAFT_KEY));
