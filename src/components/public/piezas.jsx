// src/components/public/piezas.jsx - piezas visuales compartidas por la tarjeta y el detalle
import React, { useState } from 'react';
import { DIAS_SEMANA, iniciales } from '../../utils/descuentos';

const INICIAL_DIA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Los 7 días de la semana como celdas; se encienden los días válidos. */
export const Dias = ({ dias = [], grande = false }) => {
  const validos = new Set(dias);
  const todos = validos.size === DIAS_SEMANA.length;
  const tam = grande ? 'w-8 h-8 text-xs' : 'w-[18px] h-[18px] text-[10px]';
  return (
    <div className="flex gap-0.5" aria-label={todos ? 'Todos los días' : `Válido: ${dias.join(', ')}`} role="img">
      {DIAS_SEMANA.map((dia, i) => (
        <span
          key={dia}
          title={dia}
          className={`${tam} grid place-items-center font-mono ${
            validos.has(dia) ? 'bg-volt text-ink-950 font-semibold' : 'bg-ink-800 text-fg-dim'
          }`}
        >
          {INICIAL_DIA[i]}
        </span>
      ))}
    </div>
  );
};

/** Imagen que, si falla (sin internet o enlace roto), muestra `fallback`. */
export const Logo = ({ src, fallback, className, imgClassName }) => {
  const [error, setError] = useState(false);
  if (!src || error) return fallback;
  return (
    <span className={className}>
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={imgClassName}
        onError={() => setError(true)}
      />
    </span>
  );
};

/** Logo del banco (o un cuadrado con su color si no hay). */
export const LogoBanco = ({ descuento, tam = 'w-5 h-5' }) => (
  <Logo
    src={descuento.logo_url}
    className={`${tam} flex-shrink-0 bg-white grid place-items-center`}
    imgClassName="w-full h-full object-contain"
    fallback={<span className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: descuento.banco_color }} aria-hidden="true" />}
  />
);

/** Logo del comercio (o sus iniciales si no hay). */
export const LogoComercio = ({ descuento, tam = 'w-14 h-14', texto = 'text-base' }) => (
  <Logo
    src={descuento.logo}
    className={`${tam} flex-shrink-0 bg-white overflow-hidden p-1`}
    imgClassName="w-full h-full object-contain"
    fallback={
      <span
        className={`${tam} flex-shrink-0 grid place-items-center border border-line-strong bg-ink-800 font-mono ${texto} text-fg-muted`}
        aria-hidden="true"
      >
        {iniciales(descuento.establecimiento)}
      </span>
    }
  />
);
