// src/components/public/DescuentoCard.jsx
import React, { memo } from 'react';
import { ChevronRight, Ticket, Truck } from 'lucide-react';
import { TIPO_TARJETA_CORTO, describirVencimiento, destacarDescuento, extraerCodigo } from '../../utils/descuentos';
import { Dias, LogoBanco, LogoComercio } from './piezas';

/** Tarjeta resumida; al tocarla se abre el detalle completo (`onAbrir`). */
const DescuentoCard = ({ descuento, onAbrir }) => {
  const { cifra, resto } = destacarDescuento(descuento.descuento);
  const vence = descuento.fecha_vencimiento ? describirVencimiento(descuento.fecha_vencimiento) : null;
  const tieneCodigo = Boolean(extraerCodigo(descuento));

  return (
    <button
      type="button"
      onClick={() => onAbrir(descuento)}
      aria-label={`${descuento.establecimiento}: ${descuento.descuento}. Ver detalle`}
      className="visor group text-left bg-ink-900 border border-line hover:border-line-strong hover:bg-ink-850 transition-colors p-4 md:p-5 flex flex-col animate-fade-in"
    >
      <div className="w-full flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <LogoBanco descuento={descuento} />
          <span className="rotulo text-fg-muted truncate">{descuento.banco_nombre}</span>
        </div>
        <span className="rotulo text-fg-dim flex-shrink-0">{TIPO_TARJETA_CORTO[descuento.tipo_tarjeta] || descuento.tipo_tarjeta}</span>
      </div>

      <div className="w-full flex items-start justify-between gap-4 mb-3">
        {cifra ? (
          <div className="min-w-0">
            <p className="text-[2.75rem] leading-none font-semibold tracking-tight text-volt tabular">{cifra}</p>
            {resto && <p className="mt-1.5 text-sm text-fg-muted line-clamp-2">{resto}</p>}
          </div>
        ) : (
          <p className="min-w-0 text-xl leading-snug font-medium text-volt line-clamp-3">{resto}</p>
        )}
        <LogoComercio descuento={descuento} />
      </div>

      <h3 className="text-lg font-medium text-fg leading-snug">{descuento.establecimiento}</h3>

      {descuento.descripcion && descuento.descripcion !== descuento.descuento && (
        <p className="mt-1 text-sm text-fg-dim line-clamp-2">{descuento.descripcion}</p>
      )}

      <div className="w-full mt-auto pt-4">
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-line">
          <Dias dias={descuento.dias_validos} />
          <div className="flex items-center gap-2 min-w-0">
            {descuento.es_delivery && (
              <Truck className="h-3.5 w-3.5 text-fg-muted flex-shrink-0" aria-label="Delivery disponible" />
            )}
            {descuento.categoria && <span className="rotulo text-fg-dim truncate">{descuento.categoria}</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-3 min-w-0">
            {tieneCodigo && (
              <span className="rotulo inline-flex items-center gap-1 border border-volt/50 text-volt px-1.5 py-0.5">
                <Ticket className="h-3 w-3" aria-hidden="true" />
                Código
              </span>
            )}
            {vence && (
              <span className={`rotulo truncate ${vence.urgente ? 'text-alerta' : 'text-fg-dim'}`}>
                {vence.urgente && <span className="inline-block w-1.5 h-1.5 bg-alerta mr-1.5 align-middle animate-parpadeo" />}
                {vence.texto}
              </span>
            )}
          </div>
          <span className="rotulo text-fg-muted group-hover:text-volt inline-flex items-center flex-shrink-0 transition-colors">
            Detalle <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </span>
        </div>
      </div>
    </button>
  );
};

export default memo(DescuentoCard);
