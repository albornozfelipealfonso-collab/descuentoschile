// src/components/public/PublicApp.jsx
import React, { useState, useMemo } from 'react';
import { Filter, Search, Users } from 'lucide-react';
import { useIsMobile, useFilteredDescuentos } from '../shared/hooks';
import DescuentoCard from './DescuentoCard';
import FilterModal from './FilterModal';

const PublicApp = ({ bancos, descuentos, onLoginClick, showLoginButton }) => {
  const [filtros, setFiltros] = useState({
    banco: 'todos',
    tipo: 'todos',
    dia: new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase(),
    categoria: 'todas'
  });
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const isMobile = useIsMobile();

  // Asegurar que los datos sean arrays válidos
  const bancosSeguro = Array.isArray(bancos) ? bancos : [];
  const descuentosSeguro = Array.isArray(descuentos) ? descuentos : [];

  // COMBINAR descuentos con información del banco (incluyendo logo)
  const descuentosConLogos = useMemo(() => {
    return descuentosSeguro.map(descuento => {
      const banco = bancosSeguro.find(b => 
        b?.nombre && descuento?.banco_nombre && 
        b.nombre.toLowerCase() === descuento.banco_nombre.toLowerCase()
      );
      return {
        ...descuento,
        banco_color: banco?.color || '#6B7280',
        logo_url: banco?.logo_url || null // ← AQUÍ se agrega el logo
      };
    });
  }, [descuentosSeguro, bancosSeguro]);

  // Usar hook personalizado para filtrar (ahora con logos)
  const descuentosFiltrados = useFilteredDescuentos(descuentosConLogos, filtros, busqueda);
  const categorias = [...new Set(descuentosSeguro.map(d => d.categoria).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800">
      {/* Header */}
      <header className={`bg-white/10 backdrop-blur-lg border-b border-white/20 ${
        isMobile ? 'px-4 py-3' : 'px-4 py-4'
      }`}>
        <div className={`max-w-7xl mx-auto flex items-center justify-between ${
          isMobile ? 'flex-col space-y-2' : 'flex-row'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎯</div>
            <div>
              <h1 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                CardDiscount
              </h1>
              <p className={`text-white/70 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Descuentos de tarjetas chilenas
              </p>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 ${isMobile ? 'w-full justify-between' : ''}`}>
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg text-white hover:bg-white/20 transition-all ${
                isMobile ? 'flex-1 justify-center' : ''
              }`}
            >
              <Filter size={20} />
              <span>Filtros</span>
            </button>
            
            {showLoginButton && (
              <button
                onClick={onLoginClick}
                className={`flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg text-white hover:bg-white/20 transition-all ${
                  isMobile ? 'flex-1 justify-center' : ''
                }`}
              >
                <Users size={20} />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modal de filtros para móvil */}
      <FilterModal
        mostrar={mostrarFiltros}
        onClose={() => setMostrarFiltros(false)}
        filtros={filtros}
        setFiltros={setFiltros}
        bancos={bancosSeguro}
        categorias={categorias}
      />

      {/* Buscador */}
      <div className={`max-w-7xl mx-auto px-4 ${isMobile ? 'py-3' : 'py-6'}`}>
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
          <input
            type="text"
            placeholder={isMobile ? "Buscar descuentos..." : "Buscar por comercio, banco, categoría..."}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={`w-full bg-white/10 border border-white/20 rounded-lg pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-white/40 backdrop-blur-lg ${
              isMobile ? 'py-2 text-sm' : 'py-3'
            }`}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <main className={`max-w-7xl mx-auto px-4 ${isMobile ? 'pb-4' : 'pb-8'}`}>
        {descuentosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron descuentos</h3>
            <p className="text-white/70">Intenta ajustar los filtros o la búsqueda</p>
          </div>
        ) : (
          <>
            {/* Estadísticas - solo desktop */}
            {!isMobile && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">{descuentosFiltrados.length}</div>
                  <div className="text-white/70 text-sm">Descuentos disponibles</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    {new Set(descuentosFiltrados.map(d => d.banco_nombre).filter(Boolean)).size}
                  </div>
                  <div className="text-white/70 text-sm">Bancos participantes</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    {descuentosFiltrados.filter(d => d.es_delivery).length}
                  </div>
                  <div className="text-white/70 text-sm">Apps delivery</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold text-white">
                    {new Set(descuentosFiltrados.map(d => d.categoria).filter(Boolean)).size}
                  </div>
                  <div className="text-white/70 text-sm">Categorías</div>
                </div>
              </div>
            )}

            {/* Grid de descuentos */}
            <div className={`grid gap-4 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {descuentosFiltrados.map((descuento) => (
                <DescuentoCard key={descuento.id} descuento={descuento} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PublicApp;