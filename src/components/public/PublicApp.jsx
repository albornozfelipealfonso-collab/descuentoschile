// src/components/public/PublicApp.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { Filter, Search, Users, X } from 'lucide-react';
import { useIsMobile, useFilteredDescuentos, useDebouncedValue } from '../shared/hooks';
import { enriquecerConBanco, getCategorias, getDiaActual, FILTROS_INICIALES } from '../../utils/descuentos';
import DescuentoCard from './DescuentoCard';
import FilterModal from './FilterModal';

const FILTRO_LABEL = { banco: 'Banco', tipo: 'Tarjeta', dia: 'Día', categoria: 'Categoría' };

const PublicApp = ({ bancos = [], descuentos = [], actualizado, onLoginClick, showLoginButton }) => {
  const [filtros, setFiltros] = useState(() => ({ ...FILTROS_INICIALES, dia: getDiaActual() }));
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const isMobile = useIsMobile();
  // Al escribir se espera un poco antes de filtrar; al borrar se aplica al instante.
  const busquedaDebounced = useDebouncedValue(busqueda);
  const busquedaEfectiva = busqueda === '' ? '' : busquedaDebounced;

  const bancosActivos = useMemo(() => bancos.filter((b) => b.activo !== false), [bancos]);
  const descuentosConBanco = useMemo(() => enriquecerConBanco(descuentos, bancos), [descuentos, bancos]);
  const categorias = useMemo(() => getCategorias(descuentosConBanco), [descuentosConBanco]);
  const descuentosFiltrados = useFilteredDescuentos(descuentosConBanco, filtros, busquedaEfectiva);

  const filtrosActivos = Object.entries(filtros).filter(([key, value]) => value !== FILTROS_INICIALES[key]);
  const cerrarFiltros = useCallback(() => setMostrarFiltros(false), []);
  const limpiarTodo = () => {
    setFiltros(FILTROS_INICIALES);
    setBusqueda('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800">
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-4 py-3 md:py-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="text-3xl" aria-hidden="true">🎯</div>
            <div>
              <h1 className="font-bold text-white text-xl md:text-2xl">CardDiscount</h1>
              <p className="text-white/70 text-xs md:text-sm">Descuentos de tarjetas chilenas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setMostrarFiltros(true)}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 bg-white/10 px-3 py-2 rounded-lg text-white hover:bg-white/20 transition-all"
            >
              <Filter size={20} aria-hidden="true" />
              <span>Filtros</span>
              {filtrosActivos.length > 0 && (
                <span className="bg-pink-500 text-white text-xs font-bold rounded-full px-2">{filtrosActivos.length}</span>
              )}
            </button>

            {showLoginButton && (
              <button
                onClick={onLoginClick}
                className="flex flex-1 md:flex-none items-center justify-center gap-2 bg-white/10 px-3 py-2 rounded-lg text-white hover:bg-white/20 transition-all"
              >
                <Users size={20} aria-hidden="true" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <FilterModal
        mostrar={mostrarFiltros}
        onClose={cerrarFiltros}
        filtros={filtros}
        setFiltros={setFiltros}
        bancos={bancosActivos}
        categorias={categorias}
      />

      <div className="max-w-7xl mx-auto px-4 py-3 md:py-6 space-y-3">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" aria-hidden="true" />
          <input
            type="search"
            aria-label="Buscar descuentos"
            placeholder={isMobile ? 'Buscar descuentos...' : 'Buscar por comercio, banco, categoría...'}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 py-2 md:py-3 text-sm md:text-base text-white placeholder-white/50 focus:outline-none focus:border-white/40 backdrop-blur-lg"
          />
        </div>

        {filtrosActivos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filtrosActivos.map(([key, value]) => (
              <button
                key={key}
                onClick={() => setFiltros((prev) => ({ ...prev, [key]: FILTROS_INICIALES[key] }))}
                className="inline-flex items-center gap-1 bg-white/15 text-white text-xs px-3 py-1 rounded-full hover:bg-white/25 transition-colors"
                aria-label={`Quitar filtro ${FILTRO_LABEL[key]}: ${value}`}
              >
                <span className="text-white/70">{FILTRO_LABEL[key]}:</span>
                <span className="capitalize">{value}</span>
                <X size={12} aria-hidden="true" />
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-4 md:pb-8">
        {descuentosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
            <h2 className="text-xl font-semibold text-white mb-2">No se encontraron descuentos</h2>
            <p className="text-white/70 mb-4">Intenta ajustar los filtros o la búsqueda</p>
            {(filtrosActivos.length > 0 || busqueda) && (
              <button
                onClick={limpiarTodo}
                className="bg-white/15 text-white px-4 py-2 rounded-lg hover:bg-white/25 transition-colors"
              >
                Ver todos los descuentos
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-4 gap-4 mb-8">
              {[
                [descuentosFiltrados.length, 'Descuentos disponibles'],
                [new Set(descuentosFiltrados.map((d) => d.banco_nombre)).size, 'Bancos participantes'],
                [descuentosFiltrados.filter((d) => d.es_delivery).length, 'Apps delivery'],
                [new Set(descuentosFiltrados.map((d) => d.categoria).filter(Boolean)).size, 'Categorías']
              ].map(([valor, label]) => (
                <div key={label} className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">{valor}</div>
                  <div className="text-white/70 text-sm">{label}</div>
                </div>
              ))}
            </div>

            <p className="md:hidden text-white/70 text-sm mb-3" aria-live="polite">
              {descuentosFiltrados.length} descuentos
            </p>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {descuentosFiltrados.map((descuento) => (
                <DescuentoCard key={descuento.id} descuento={descuento} />
              ))}
            </div>
          </>
        )}
      </main>

      {actualizado && (
        <footer className="text-center text-white/50 text-xs pb-6">
          Datos actualizados el {new Date(actualizado).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}
        </footer>
      )}
    </div>
  );
};

export default PublicApp;
