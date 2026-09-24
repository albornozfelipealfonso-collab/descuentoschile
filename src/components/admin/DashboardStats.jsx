// src/components/admin/DashboardStats.jsx
import React from 'react';
import { useIsMobile } from '../shared/hooks';

const DashboardStats = ({ stats }) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Estadísticas Generales
        </h2>
        <div className="text-sm text-white/60">
          Datos almacenados localmente
        </div>
      </div>
      
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <div className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {stats.totalDescuentos}
          </div>
          <div className={`text-blue-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Total Descuentos
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white">
          <div className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {stats.totalBancos}
          </div>
          <div className={`text-green-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Bancos Activos
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <div className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {stats.descuentosDelivery}
          </div>
          <div className={`text-purple-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Apps Delivery
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-xl p-6 text-white">
          <div className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {stats.totalCategorias}
          </div>
          <div className={`text-orange-100 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Categorías
          </div>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/70">Datos publicados:</span>
            <span className="text-white ml-2">src/data/initialData.js</span>
          </div>
          <div>
            <span className="text-white/70">Borrador:</span>
            <span className="text-white ml-2">localStorage de este navegador</span>
          </div>
          <div>
            <span className="text-white/70">Respaldo:</span>
            <span className="text-white ml-2">Manual (botón Exportar)</span>
          </div>
          <div>
            <span className="text-white/70">Modo:</span>
            <span className="text-white ml-2">Datos estáticos locales</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;