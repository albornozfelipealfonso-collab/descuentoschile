// src/components/public/MisTarjetas.jsx - elegir qué tarjetas tiene el usuario
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { contarTarjetas, normalizar } from '../../utils/descuentos';
import { LogoBanco } from './piezas';

const TIPOS = [
  ['debito', 'Débito'],
  ['credito', 'Crédito']
];

/**
 * `bancos`: [{ nombre, logo_url, banco_color, cantidad }] (solo los que tienen descuentos).
 * `tarjetas`: { banco normalizado: { debito, credito } }. Se aplica al tocar "Guardar".
 */
const MisTarjetas = ({ mostrar, onClose, bancos, tarjetas, onGuardar }) => {
  const [borrador, setBorrador] = useState(tarjetas);

  useEffect(() => {
    if (!mostrar) return undefined;
    setBorrador(tarjetas);
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mostrar, tarjetas, onClose]);

  if (!mostrar) return null;

  const alternar = (banco, tipo) =>
    setBorrador((prev) => {
      const clave = normalizar(banco);
      const actual = { debito: false, credito: false, ...prev[clave] };
      const siguiente = { ...actual, [tipo]: !actual[tipo] };
      const copia = { ...prev };
      if (siguiente.debito || siguiente.credito) copia[clave] = siguiente;
      else delete copia[clave];
      return copia;
    });

  const cantidad = contarTarjetas(borrador);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tarjetas-titulo"
        className="bg-ink-900 border border-line-strong w-full md:max-w-md max-h-[90vh] flex flex-col animate-slide-up pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-line flex-shrink-0">
          <h2 id="tarjetas-titulo" className="rotulo text-fg">
            <span className="text-volt">//</span> Mis tarjetas
          </h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-fg-dim hover:text-fg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="px-5 pt-4 pb-3 text-sm text-fg-muted flex-shrink-0">
          Marca las tarjetas que tienes y te mostramos solo los descuentos que puedes usar. Se guarda en este dispositivo.
        </p>

        <ul className="overflow-y-auto px-5 pb-2">
          {bancos.map((banco) => {
            const elegido = borrador[normalizar(banco.nombre)] || {};
            return (
              <li key={banco.nombre} className="flex items-center gap-3 py-3 border-b border-line last:border-b-0">
                <LogoBanco descuento={banco} tam="w-7 h-7" />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-fg truncate">{banco.nombre}</p>
                  <p className="rotulo text-fg-dim">{banco.cantidad} descuentos</p>
                </div>
                <div className="flex gap-1 flex-shrink-0" role="group" aria-label={`Tarjetas ${banco.nombre}`}>
                  {TIPOS.map(([tipo, label]) => (
                    <button
                      key={tipo}
                      onClick={() => alternar(banco.nombre, tipo)}
                      aria-pressed={Boolean(elegido[tipo])}
                      className={`rotulo px-2.5 h-8 border transition-colors ${
                        elegido[tipo]
                          ? 'bg-volt border-volt text-ink-950 font-semibold'
                          : 'border-line text-fg-muted hover:text-fg hover:border-line-strong'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-2 p-5 border-t border-line flex-shrink-0">
          <button
            onClick={() => setBorrador({})}
            className="flex-1 h-12 rotulo border border-line text-fg-muted hover:text-fg hover:border-line-strong transition-colors"
          >
            Borrar todo
          </button>
          <button
            onClick={() => onGuardar(borrador)}
            className="flex-[2] h-12 rotulo bg-volt text-ink-950 font-semibold hover:brightness-110 transition whitespace-nowrap"
          >
            {cantidad ? `Guardar (${cantidad} ${cantidad === 1 ? 'tarjeta' : 'tarjetas'})` : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MisTarjetas;
