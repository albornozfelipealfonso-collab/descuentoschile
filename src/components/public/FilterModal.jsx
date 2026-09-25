// src/components/public/FilterModal.jsx
import React, { useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { DIAS_SEMANA, FILTROS_INICIALES, TIPOS_TARJETA } from '../../utils/descuentos';

const TIPO_LABEL = { debito: 'Débito', credito: 'Crédito', ambas: 'Débito y crédito' };
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const Campo = ({ id, label, value, onChange, children }) => (
  <div>
    <label htmlFor={id} className="rotulo block text-fg-dim mb-2">
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 appearance-none bg-ink-950 border border-line focus:border-volt/60 px-3 pr-9 text-[15px] text-fg outline-none transition-colors"
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-dim pointer-events-none"
        aria-hidden="true"
      />
    </div>
  </div>
);

const FilterModal = ({ mostrar, onClose, filtros, setFiltros, bancos, categorias, total }) => {
  useEffect(() => {
    if (!mostrar) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mostrar, onClose]);

  if (!mostrar) return null;

  const set = (key) => (value) => setFiltros((prev) => ({ ...prev, [key]: value }));

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filtros-titulo"
        className="bg-ink-900 border border-line-strong w-full md:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up pb-[env(safe-area-inset-bottom)]"
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-line">
          <h2 id="filtros-titulo" className="rotulo text-fg">
            <span className="text-volt">//</span> Filtros
          </h2>
          <button onClick={onClose} aria-label="Cerrar filtros" className="text-fg-dim hover:text-fg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <Campo id="filtro-banco" label="Banco" value={filtros.banco} onChange={set('banco')}>
            <option value="todos">Todos los bancos</option>
            {bancos.map(({ valor, cantidad }) => (
              <option key={valor} value={valor}>
                {valor} ({cantidad})
              </option>
            ))}
          </Campo>

          <Campo id="filtro-tipo" label="Tipo de tarjeta" value={filtros.tipo} onChange={set('tipo')}>
            <option value="todos">Todos los tipos</option>
            {TIPOS_TARJETA.filter((t) => t !== 'ambas').map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_LABEL[tipo]}
              </option>
            ))}
          </Campo>

          <Campo id="filtro-categoria" label="Categoría" value={filtros.categoria} onChange={set('categoria')}>
            <option value="todas">Todas las categorías</option>
            {categorias.map(({ valor, cantidad }) => (
              <option key={valor} value={valor}>
                {valor} ({cantidad})
              </option>
            ))}
          </Campo>

          <Campo id="filtro-dia" label="Día válido" value={filtros.dia} onChange={set('dia')}>
            <option value="todos">Todos los días</option>
            {DIAS_SEMANA.map((dia) => (
              <option key={dia} value={dia}>
                {capitalize(dia)}
              </option>
            ))}
          </Campo>
        </div>

        <div className="flex gap-2 p-5 border-t border-line">
          <button
            onClick={() => setFiltros(FILTROS_INICIALES)}
            className="flex-1 h-12 rotulo border border-line text-fg-muted hover:text-fg hover:border-line-strong transition-colors"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="flex-[2] h-12 rotulo bg-volt text-ink-950 font-semibold hover:brightness-110 transition whitespace-nowrap"
          >
            Ver {total} {total === 1 ? 'descuento' : 'descuentos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
