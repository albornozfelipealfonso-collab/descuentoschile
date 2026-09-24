// src/components/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import { BarChart3, CreditCard, Building2, LogOut, Eye, RotateCcw } from 'lucide-react';
import { useIsMobile } from '../shared/hooks';
import DashboardStats from './DashboardStats';
import DescuentosManager from './DescuentosManager';
import BancosManager from './BancosManager';
import { normalizarBanco, normalizarDescuento, validarDatos } from '../../utils/descuentos';
import { descargarArchivo, leerArchivoJson } from '../../utils/download';

const fechaArchivo = () => new Date().toISOString().split('T')[0];

const AdminDashboard = ({
  bancos,
  setBancos,
  descuentos,
  setDescuentos,
  hayCambios,
  onDescartarCambios,
  onVerApp,
  onLogout,
  showLogout
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const isMobile = useIsMobile();

  const descuentosActivos = descuentos.filter((d) => d.activo);
  const stats = {
    totalDescuentos: descuentosActivos.length,
    totalBancos: bancos.filter((b) => b.activo).length,
    descuentosDelivery: descuentosActivos.filter((d) => d.es_delivery).length,
    totalCategorias: new Set(descuentosActivos.map((d) => d.categoria).filter(Boolean)).size
  };

  // Genera el contenido completo de src/data/initialData.js
  const generarCodigoFuente = () => {
    const { datos, errores } = validarDatos({ bancos, descuentos });
    if (!datos) {
      alert(`❌ Hay datos inválidos, corrígelos antes de generar el código:\n\n${errores.slice(0, 10).join('\n')}`);
      return;
    }

    const codigo = `// src/data/initialData.js - Generado desde el panel admin el ${new Date().toLocaleString('es-CL')}
export const initialData = {
  bancos: ${JSON.stringify(datos.bancos, null, 2)},
  descuentos: ${JSON.stringify(datos.descuentos, null, 2)}
};
`;
    descargarArchivo(codigo, 'initialData.js', 'text/javascript');
    alert('✅ Archivo initialData.js descargado.\n\n1. Reemplaza src/data/initialData.js con el archivo descargado\n2. Ejecuta: npm run build && npx cap sync android');
  };

  const exportarDatos = () => {
    const datos = {
      bancos: bancos.map(normalizarBanco),
      descuentos: descuentos.map(normalizarDescuento),
      fecha_exportacion: new Date().toISOString(),
      version: '2.0'
    };
    descargarArchivo(JSON.stringify(datos, null, 2), `cardDiscount_backup_${fechaArchivo()}.json`);
  };

  const importarDatos = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;

    try {
      const { datos, errores } = validarDatos(await leerArchivoJson(file));
      if (!datos) {
        const extra = errores.length > 10 ? `\n… y ${errores.length - 10} errores más` : '';
        alert(`❌ No se importó nada. Errores encontrados:\n\n${errores.slice(0, 10).join('\n')}${extra}`);
        return;
      }
      if (!window.confirm(`Se reemplazarán los datos actuales por ${datos.bancos.length} bancos y ${datos.descuentos.length} descuentos. ¿Continuar?`)) {
        return;
      }
      setBancos(datos.bancos);
      setDescuentos(datos.descuentos);
      alert('✅ Datos importados correctamente');
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
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
              onClick={onVerApp}
              className="flex items-center space-x-2 bg-white/10 text-white px-3 py-2 rounded-lg hover:bg-white/20 transition-all text-sm"
              title="Previsualizar la app con los cambios del borrador"
            >
              <Eye size={16} />
              <span>Ver app</span>
            </button>

            {showLogout && (
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-500/20 text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm"
              >
                <LogOut size={16} />
                <span>Salir</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {hayCambios && (
        <div className="bg-amber-500/15 border-b border-amber-500/30">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-sm text-amber-100">
            <span>
              ⚠️ Tienes cambios guardados solo en este navegador. Usa <strong>💾 Generar Código</strong> para publicarlos.
            </span>
            <button
              onClick={() => window.confirm('¿Descartar todos los cambios y volver a los datos publicados?') && onDescartarCambios()}
              className="inline-flex items-center gap-1 text-amber-200 hover:text-white"
            >
              <RotateCcw size={14} /> Descartar cambios
            </button>
          </div>
        </div>
      )}

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
                    <div className="text-sm text-yellow-200">Se descarga el archivo initialData.js validado</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm font-mono">3</span>
                  <div>
                    <div className="font-medium">Actualizar src/data/initialData.js</div>
                    <div className="text-sm text-yellow-200">Reemplaza el archivo con el descargado (el borrador local se descarta solo)</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-sm font-mono">4</span>
                  <div>
                    <div className="font-medium">Compilar nueva APK</div>
                    <div className="text-sm text-yellow-200 font-mono">npm run android:sync, luego npx cap build android</div>
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
            descuentos={descuentos}
            setDescuentos={setDescuentos}
          />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;