// src/components/admin/BancosManager.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import FormModal from './FormModal';

const BancosManager = ({ bancos, setBancos }) => {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar bancos
  const bancosFiltrados = bancos.filter(banco => 
    banco.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (formData) => {
    if (editItem) {
      // Editar banco existente
      setBancos(prev => prev.map(b => 
        b.id === editItem.id ? { ...formData, id: editItem.id } : b
      ));
    } else {
      // Agregar nuevo banco
      const newId = Math.max(...bancos.map(b => b.id), 0) + 1;
      const nuevoBanco = {
        ...formData,
        id: newId,
        // Asegurar campos requeridos
        nombre: formData.nombre || '',
        color: formData.color || '#374151',
        logo_url: formData.logo_url || '',
        activo: formData.activo !== undefined ? formData.activo : true
      };
      setBancos(prev => [...prev, nuevoBanco]);
    }
    setShowModal(false);
    setEditItem(null);
  };

  const handleEdit = (banco) => {
    setEditItem(banco);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este banco?')) {
      setBancos(prev => prev.filter(b => b.id !== id));
    }
  };

  const toggleActivo = (id) => {
    setBancos(prev => prev.map(b => 
      b.id === id ? { ...b, activo: !b.activo } : b
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestionar Bancos</h2>
          <p className="text-white/70 mt-1">
            {bancosFiltrados.length} de {bancos.length} bancos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Banco</span>
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar bancos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          />
        </div>
      </div>

      {/* Lista de bancos */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden">
        {bancosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-white/40 text-4xl mb-4">🏦</div>
            <h3 className="text-lg font-medium text-white mb-2">
              {searchTerm ? 'No se encontraron bancos' : 'No hay bancos'}
            </h3>
            <p className="text-white/70">
              {searchTerm 
                ? 'Prueba ajustando el término de búsqueda'
                : 'Agrega tu primer banco haciendo clic en el botón de arriba'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Banco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Color
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bancosFiltrados.map((banco) => (
                  <tr key={banco.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: banco.color }}
                        />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {banco.nombre}
                          </div>
                          <div className="text-sm text-white/60">
                            ID: {banco.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-6 h-6 rounded border border-white/20"
                          style={{ backgroundColor: banco.color }}
                        />
                        <span className="text-sm text-white font-mono">
                          {banco.color}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {banco.logo_url ? (
                        <div className="flex items-center space-x-2">
                          <img 
                            src={banco.logo_url} 
                            alt={`Logo ${banco.nombre}`}
                            className="h-8 w-8 object-contain bg-white/10 rounded p-1"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                          <span 
                            className="text-xs text-red-400 hidden"
                          >
                            Error
                          </span>
                          <span className="text-xs text-white/60 truncate max-w-xs">
                            {banco.logo_url}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-white/40">Sin logo</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActivo(banco.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          banco.activo
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {banco.activo ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(banco)}
                          className="text-blue-400 hover:text-blue-300 p-1 rounded-lg hover:bg-blue-500/20 transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(banco.id)}
                          className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      <FormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditItem(null);
        }}
        onSave={handleSave}
        editItem={editItem}
        type="banco"
        bancos={[]} // No necesita bancos para crear bancos
        descuentos={[]} // No necesita descuentos para crear bancos
      />
    </div>
  );
};

export default BancosManager;