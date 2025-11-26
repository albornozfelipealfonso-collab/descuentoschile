// src/components/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { BarChart3, CreditCard, Building2, LogOut } from 'lucide-react';
import { useIsMobile } from '../shared/hooks';
import DashboardStats from './DashboardStats';
import DescuentosManager from './DescuentosManager';
import BancosManager from './BancosManager';
import FormModal from './FormModal';

const AdminDashboard = ({ bancos, setBancos, descuentos, setDescuentos, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const isMobile = useIsMobile();

  // Calcular estadísticas
  const stats = {
    totalDescuentos: descuentos.filter(d => d.activo).length,
    totalBancos: bancos.filter(b => b.activo).length,
    descuentosDelivery: descuentos.filter(d => d.es_delivery && d.activo).length,
    totalCategorias: new Set(descuentos.map(d => d.categoria)).size
  };

  // FUNCIÓN CORREGIDA: Generar código para initialData.js
  const generarCodigoFuente = () => {
    try {
      // Limpiar y normalizar los datos antes de generar el código
      const cleanBancos = bancos.map(banco => ({
        id: Number(banco.id),
        nombre: banco.nombre,
        color: banco.color,
        logo_url: banco.logo_url || '',
        activo: Boolean(banco.activo)
      }));

      const cleanDescuentos = descuentos.map(descuento => ({
        id: Number(descuento.id),
        establecimiento: descuento.establecimiento || descuento.comercio || '',
        descripcion: descuento.descripcion || '',
        descuento: descuento.descuento || '',
        banco_nombre: descuento.banco_nombre || '',
        tipo_tarjeta: descuento.tipo_tarjeta || 'debito',
        categoria: descuento.categoria || '',
        dias_validos: descuento.dias_validos || descuento.dias_semana || [],
        es_delivery: Boolean(descuento.es_delivery),
        terminos: descuento.terminos || '',
        fecha_vencimiento: descuento.fecha_vencimiento || descuento.fecha_fin || '',
        activo: Boolean(descuento.activo)
      }));

      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString('es-CL');
      const timeStr = currentDate.toLocaleTimeString('es-CL');

      // FORMATO CORRECTO: usar initialData en lugar de INITIAL_BANCOS
      const codigoCompleto = `// src/data/initialData.js - Generado automáticamente el ${dateStr}, ${timeStr}
export const initialData = {
  bancos: ${JSON.stringify(cleanBancos, null, 2)},
  descuentos: ${JSON.stringify(cleanDescuentos, null, 2)}
};`;

      // Crear archivo temporal para descargar
      const blob = new Blob([codigoCompleto], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `initialData_actualizado_${currentDate.toISOString().split('T')[0]}.js`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // También mostrar en consola para copiar fácil
      console.log('🔥 CÓDIGO PARA src/data/initialData.js:');
      console.log(codigoCompleto);
      
      alert('✅ Código generado correctamente!\n\n1. Archivo descargado\n2. Código en consola (F12)\n3. Reemplaza src/data/initialData.js\n4. Ejecuta: npm run build');
    } catch (error) {
      console.error('Error generando código:', error);
      alert('❌ Error al generar código: ' + error.message);
    }
  };

  // Funciones de import/export
  const exportarDatos = () => {
    const datos = {
      bancos,
      descuentos,
      fecha_exportacion: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardDiscount_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importarDatos = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const datos = JSON.parse(e.target.result);
        if (datos.bancos && datos.descuentos) {
          setBancos(datos.bancos);
          setDescuentos(datos.descuentos);
          alert('Datos importados correctamente');
        } else {
          alert('Archivo no válido');
        }
      } catch (error) {
        alert('Error al leer el archivo');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header del Admin */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className={`max-w-7xl mx-auto px-4 py-4 flex items-center justify-between ${
          isMobile ? 'flex-col space-y-2' : 'flex-row'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🎯</div>
            <div>
              <h1 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                CardDiscount Admin
              </h1>
              <p className="text-white/70 text-sm">Panel de administración local</p>
            </div>
          </div>
          
          <div className={`flex items-center space-x-2 ${isMobile ? 'flex-wrap gap-2' : ''}`}>
            {/* BOTÓN CORREGIDO: Generar código */}
            <button
              onClick={generarCodigoFuente}
              className="flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-all text-sm"
              title="Genera código actualizado para src/data/initialData.js"
            >
              💾 Generar Código
            </button>
            
            <button
              onClick={exportarDatos}
              className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-3 py-2 rounded-lg hover:bg-green-500/30 transition-all text-sm"
              title="Exportar datos como backup JSON"
            >
              📥 Exportar
            </button>
            
            <label className="flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all cursor-pointer text-sm">
              📤 Importar
              <input
                type="file"
                accept=".json"
                onChange={importarDatos}
                className="hidden"
                title="Importar datos desde backup JSON"
              />
            </label>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className={`flex ${isMobile ? 'flex-col space-y-1 py-2' : 'space-x-8'}`}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'descuentos', label: isMobile ? 'Descuentos' : 'Gestionar Descuentos', icon: CreditCard },
              { id: 'bancos', label: isMobile ? 'Bancos' : 'Gestionar Bancos', icon: Building2 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 transition-all ${
                  isMobile 
                    ? `rounded-lg ${activeTab === tab.id 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'}`
                    : `border-b-2 ${activeTab === tab.id 
                        ? 'border-white text-white' 
                        : 'border-transparent text-white/70 hover:text-white'}`
                }`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <DashboardStats stats={stats} />
            
            {/* Instrucciones para actualizar APK */}
            <div className="bg-yellow-500/10 backdrop-blur-lg rounded-xl p-6 border border-yellow-500/20">
              <h3 className="text-xl font-bold text-yellow-300 mb-4">📱 Cómo actualizar la APK</h3>
              <div className="space-y-3 text-yellow-100">
                <div className="flex items-start space-x-3">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm font-mono">1</span>
                  <div>
                    <div className="font-medium">Haz cambios en bancos/descuentos</div>
                    <div className="text-sm text-yellow-200">Agrega, edita o elimina usando este panel admin</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm font-mono">2</span>
                  <div>
                    <div className="font-medium">Clic "💾 Generar Código"</div>
                    <div className="text-sm text-yellow-200">Se descarga el archivo actualizado y aparece en consola</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm font-mono">3</span>
                  <div>
                    <div className="font-medium">Actualizar src/data/initialData.js</div>
                    <div className="text-sm text-yellow-200">Reemplaza TODO el contenido del archivo con el código generado</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm font-mono">4</span>
                  <div>
                    <div className="font-medium">Compilar nueva APK</div>
                    <div className="text-sm text-yellow-200 font-mono">npm run build && npx cap sync && npx cap build android</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'descuentos' && (
          <DescuentosManager
            descuentos={descuentos}
            setDescuentos={setDescuentos}
            bancos={bancos}
          />
        )}

        {activeTab === 'bancos' && (
          <BancosManager
            bancos={bancos}
            setBancos={setBancos}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;