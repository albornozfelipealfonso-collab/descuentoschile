// src/components/public/DescuentoDetalle.jsx - ficha completa de un descuento
import React, { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ArrowUpRight, Check, Copy, Share2, Truck, X } from 'lucide-react';
import {
  TIPO_TARJETA_LARGO,
  describirVencimiento,
  destacarDescuento,
  extraerCodigo,
  formatDias,
  formatFecha
} from '../../utils/descuentos';
import { Dias, LogoBanco, LogoComercio } from './piezas';

const copiar = async (texto) => {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    return false;
  }
};

/** Enlace para compartir: en la web abre esta misma ficha; en la app, la página del banco. */
const enlaceDe = (descuento) =>
  Capacitor.isNativePlatform()
    ? descuento.url || ''
    : `${window.location.origin}${window.location.pathname}#${encodeURIComponent(descuento.id)}`;

const Seccion = ({ titulo, children }) => (
  <section className="px-5 py-4 border-t border-line">
    <h3 className="rotulo text-fg-dim mb-2.5">{titulo}</h3>
    {children}
  </section>
);

const Dato = ({ etiqueta, children }) => (
  <div>
    <dt className="rotulo text-fg-dim mb-1">{etiqueta}</dt>
    <dd className="text-sm text-fg">{children}</dd>
  </div>
);

const DescuentoDetalle = ({ descuento, onCerrar }) => {
  const [aviso, setAviso] = useState('');
  const cerrar = useRef(null);

  useEffect(() => {
    if (!descuento) return undefined;
    const onKey = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', onKey);
    // Sin scroll de fondo mientras la ficha está abierta
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    cerrar.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [descuento, onCerrar]);

  useEffect(() => setAviso(''), [descuento]);

  if (!descuento) return null;

  const { cifra, resto } = destacarDescuento(descuento.descuento);
  const codigo = extraerCodigo(descuento);
  const vence = descuento.fecha_vencimiento ? describirVencimiento(descuento.fecha_vencimiento) : null;
  const terminosRecortados = descuento.terminos?.endsWith('…');
  const avisar = (texto) => {
    setAviso(texto);
    setTimeout(() => setAviso(''), 2000);
  };

  const copiarCodigo = async () => avisar((await copiar(codigo)) ? 'Código copiado' : 'No se pudo copiar');

  const compartir = async () => {
    const texto = [
      `${descuento.establecimiento}: ${descuento.descuento}`,
      `${descuento.banco_nombre} · ${formatDias(descuento.dias_validos)}`,
      codigo && `Código: ${codigo}`
    ]
      .filter(Boolean)
      .join('\n');
    const url = enlaceDe(descuento);
    if (navigator.share) {
      try {
        await navigator.share({ title: `${descuento.establecimiento} · CardDiscount`, text: texto, url: url || undefined });
        return;
      } catch (e) {
        if (e?.name === 'AbortError') return; // el usuario canceló
      }
    }
    avisar((await copiar([texto, url].filter(Boolean).join('\n'))) ? 'Copiado para compartir' : 'No se pudo copiar');
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-titulo"
        className="relative bg-ink-900 border border-line-strong w-full md:max-w-lg max-h-[92vh] overflow-y-auto animate-slide-up pb-[env(safe-area-inset-bottom)]"
      >
        {/* Encabezado fijo con el banco */}
        <div className="sticky top-0 z-10 bg-ink-900/95 backdrop-blur flex items-center justify-between gap-3 px-5 h-14 border-b border-line">
          <div className="flex items-center gap-2 min-w-0">
            <LogoBanco descuento={descuento} />
            <span className="rotulo text-fg-muted truncate">{descuento.banco_nombre}</span>
          </div>
          <button
            ref={cerrar}
            onClick={onCerrar}
            aria-label="Cerrar detalle"
            className="text-fg-dim hover:text-fg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cifra y comercio */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              {cifra ? (
                <>
                  <p className="text-6xl leading-none font-semibold tracking-tight text-volt tabular">{cifra}</p>
                  {resto && <p className="mt-2 text-fg-muted">{resto}</p>}
                </>
              ) : (
                <p className="text-2xl leading-snug font-medium text-volt">{resto}</p>
              )}
            </div>
            <LogoComercio descuento={descuento} tam="w-20 h-20" texto="text-xl" />
          </div>
          <h2 id="detalle-titulo" className="mt-4 text-2xl font-semibold tracking-tight">
            {descuento.establecimiento}
          </h2>
          {descuento.descripcion && descuento.descripcion !== descuento.descuento && (
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{descuento.descripcion}</p>
          )}
        </div>

        {codigo && (
          <Seccion titulo="Código de descuento">
            <div className="flex items-stretch border border-volt/60">
              <span className="flex-1 min-w-0 px-4 py-3 font-mono text-xl tracking-[0.12em] text-volt select-all break-all">
                {codigo}
              </span>
              <button
                onClick={copiarCodigo}
                className="rotulo px-4 bg-volt text-ink-950 font-semibold inline-flex items-center gap-1.5 hover:brightness-110 transition"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copiar
              </button>
            </div>
          </Seccion>
        )}

        <Seccion titulo="Cuándo y con qué tarjeta">
          <div className="mb-4">
            <Dias dias={descuento.dias_validos} grande />
            <p className="mt-2 text-sm text-fg">{formatDias(descuento.dias_validos)}</p>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            <Dato etiqueta="Tarjeta">{TIPO_TARJETA_LARGO[descuento.tipo_tarjeta] || descuento.tipo_tarjeta}</Dato>
            <Dato etiqueta="Vigencia">
              {vence ? (
                <span className={vence.urgente ? 'text-alerta font-medium' : ''}>
                  {vence.urgente ? `${vence.texto} (${formatFecha(descuento.fecha_vencimiento)})` : vence.texto}
                </span>
              ) : (
                'Sin fecha de término'
              )}
            </Dato>
            {descuento.categoria && <Dato etiqueta="Categoría">{descuento.categoria}</Dato>}
            {descuento.es_delivery && (
              <Dato etiqueta="Delivery">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-fg-muted" aria-hidden="true" /> Disponible
                </span>
              </Dato>
            )}
          </dl>
        </Seccion>

        {descuento.terminos && (
          <Seccion titulo="Términos y condiciones">
            <p className="text-sm leading-relaxed text-fg-muted whitespace-pre-line">{descuento.terminos}</p>
            {terminosRecortados && descuento.url && (
              <p className="mt-2 text-xs text-fg-dim">Texto resumido. Las condiciones completas están en el sitio del banco.</p>
            )}
          </Seccion>
        )}

        {/* Acciones */}
        <div className="sticky bottom-0 bg-ink-900/95 backdrop-blur flex gap-2 p-5 border-t border-line">
          <button
            onClick={compartir}
            className="flex-1 h-12 rotulo border border-line text-fg-muted hover:text-fg hover:border-line-strong inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Compartir
          </button>
          {descuento.url && (
            <a
              href={descuento.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-[2] h-12 rotulo bg-volt text-ink-950 font-semibold inline-flex items-center justify-center gap-1.5 hover:brightness-110 transition"
            >
              Ver en el sitio del banco <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>

        {aviso && (
          <div
            role="status"
            className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[60] rotulo bg-fg text-ink-950 px-4 py-2.5 inline-flex items-center gap-2 animate-fade-in"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            {aviso}
          </div>
        )}
      </div>
    </div>
  );
};

export default DescuentoDetalle;
