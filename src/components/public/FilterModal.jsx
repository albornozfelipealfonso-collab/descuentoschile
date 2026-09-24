// src/components/public/FilterModal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { DIAS_SEMANA, FILTROS_INICIALES, TIPOS_TARJETA } from '../../utils/descuentos';

const TIPO_LABEL = { debito: 'Débito', credito: 'Crédito', ambas: 'Débito y crédito' };
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const selectClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900';

const Campo = ({ id, label, value, onChange, children }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
      {children}
    </select>
  </div>
);

const FilterModal = ({ mostrar, onClose, filtros, setFiltros, bancos, categorias }) => {
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filtros-titulo"
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="filtros-titulo" className="text-lg font-semibold text-gray-800">
            Filtros
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <Campo id="filtro-banco" label="Banco" value={filtros.banco} onChange={set('banco')}>
            <option value="todos">Todos los bancos</option>
            {bancos.map((banco) => (
              <option key={banco.id} value={banco.nombre}>
                {banco.nombre}
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
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
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

        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={() => setFiltros(FILTROS_INICIALES)}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Limpiar filtros
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
