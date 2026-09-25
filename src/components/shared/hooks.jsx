// src/components/shared/hooks.jsx
import { useState, useEffect, useMemo } from 'react';
import { filtrarDescuentos, ordenarPorDia } from '../../utils/descuentos';

const MOBILE_QUERY = '(max-width: 767px)';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
};

export const useFilteredDescuentos = (descuentos, filtros, busqueda) =>
  useMemo(
    () => ordenarPorDia(filtrarDescuentos(descuentos || [], filtros, busqueda), filtros.dia),
    [descuentos, filtros, busqueda]
  );

/** Devuelve `value` con retraso, para no filtrar en cada tecla. */
export const useDebouncedValue = (value, delay = 200) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};
