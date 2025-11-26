// src/components/admin/DescuentosManager.jsx - Con categorías inteligentes
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter } from 'lucide-react';
import FormModal from './FormModal';

// Función simple para colores de bancos
const getBancoColor = (bancoNombre) => {
  const colores = {
    'banco estado': '#1e40af',
    'banco de chile': '#dc2626', 
    'santander': '#dc2626',
    'bci': '#f59e0b',
    'scotiabank': '#7c2d12',
    'itau': '#ea580c',
    'security': '#166534',
    'falabella': '#be185d',
    'tenpo': '#1f2937',
    'lider bci mastercard': '#1e40af'
  };
  
  const nombre = bancoNombre?.toLowerCase().trim() || '';
  return colores[nombre] || '#374151'; // Gris por defecto
};

const DescuentosManager = ({ descuentos, setDescuentos, bancos }) => {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBanco, setFilterBanco] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');

  // Obtener categorías únicas para el filtro
  const categoriasUnicas = React.useMemo(() => {
    const categorias = descuentos
      .map(d => d.categoria)
      .filter(Boolean)
      .filter(cat => cat.trim() !== '');
    return [...new Set(categorias)].sort();
  }, [descuentos]);

  // Filtrar descuentos
  const descuentosFiltrados = React.useMemo(() => {
    return descuentos.filter(descuento => {
      const matchSearch = !searchTerm || 
        descuento.establecimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        descuento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        descuento.banco_nombre.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchBanco = !filterBanco || descuento.banco_nombre === filterBanco;
      const matchCategoria = !filterCategoria || descuento.categoria === filterCategoria;
      
      return matchSearch && matchBanco && matchCategoria;
    });
  }, [descuentos, searchTerm, filterBanco, filterCategoria]);

  const handleSave = (formData) => {
    try {
      console.log('💾 Intentando guardar descuento:', formData);
      
      // Detectar automáticamente si es delivery basado en la categoría
      const esDelivery = formData.categoria?.toLowerCase().includes('delivery') || false;
      
      if (editItem) {
        // Editar descuento existente
        console.log('✏️ Editando descuento existente');
        setDescuentos(prev => prev.map(d => 
          d.id === editItem.id ? { 
            ...formData, 
            id: editItem.id,
            es_delivery: esDelivery
          } : d
        ));
      } else {
        // Agregar nuevo descuento
        console.log('➕ Agregando nuevo descuento');
        const newId = Math.max(...descuentos.map(d => d.id), 0) + 1;
        const nuevoDescuento = {
          ...formData,
          id: newId,
          // Asegurar campos requeridos
          establecimiento: formData.establecimiento || '',
          descripcion: formData.descripcion || '',
          descuento: formData.descuento || '',
          banco_nombre: formData.banco_nombre || '',
          tipo_tarjeta: formData.tipo_tarjeta || 'debito',
          categoria: formData.categoria || '',
          dias_validos: formData.dias_validos || [],
          es_delivery: esDelivery, // ← Auto-detectado
          terminos: formData.terminos || '',
          fecha_vencimiento: formData.fecha_vencimiento || '',
          activo: formData.activo !== undefined ? formData.activo : true
        };
        
        console.log('🎯 Descuento completo a agregar:', nuevoDescuento);
        setDescuentos(prev => [...prev, nuevoDescuento]);
      }
      
      console.log('✅ Descuento guardado correctamente');
    } catch (error) {
      console.error('❌ Error guardando descuento:', error);
      alert('Error al guardar el descuento: ' + error.message);
    }
  };

  const handleEdit = (descuento) => {
    setEditItem(descuento);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este descuento?')) {
      setDescuentos(prev => prev.filter(d => d.id !== id));
    }
  };

  const toggleActivo = (id) => {
    setDescuentos(prev => prev.map(d => 
      d.id === id ? { ...d, activo: !d.activo } : d
    ));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBanco('');
    setFilterCategoria('');
  };

  const hasActiveFilters = searchTerm || filterBanco || filterCategoria;

  return (
    <div className="space-y-6">
      {/* Header con botón agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestionar Descuentos</h2>
          <p className="text-gray-600 mt-1">
            {descuentosFiltrados.length} de {descuentos.length} descuentos
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Descuento</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar descuentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por banco */}
          <select
            value={filterBanco}
            onChange={(e) => setFilterBanco(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los bancos</option>
            {bancos.map(banco => (
              <option key={banco.id} value={banco.nombre}>
                {banco.nombre}
              </option>
            ))}
          </select>

          {/* Filtro por categoría */}
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categoriasUnicas.map(categoria => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {descuentos.filter(d => d.activo).length}
            </div>
            <div className="text-sm text-gray-600">Activos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {descuentos.filter(d => d.es_delivery).length}
            </div>
            <div className="text-sm text-gray-600">Delivery</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {categoriasUnicas.length}
            </div>
            <div className="text-sm text-gray-600">Categorías</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {new Set(descuentos.map(d => d.banco_nombre)).size}
            </div>
            <div className="text-sm text-gray-600">Bancos</div>
          </div>
        </div>
      </div>

      {/* Lista de descuentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {descuentosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasActiveFilters ? 'No se encontraron descuentos' : 'No hay descuentos'}
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters 
                ? 'Prueba ajustando los filtros de búsqueda'
                : 'Agrega tu primer descuento haciendo clic en el botón de arriba'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Establecimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descuento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {descuentosFiltrados.map((descuento) => {
                  const banco = bancos.find(b => b.nombre === descuento.banco_nombre);
                  return (
                    <tr key={descuento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {descuento.establecimiento}
                            </div>
                            {descuento.descripcion && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {descuento.descripcion}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {descuento.descuento}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {banco?.logo_url && (
                            <img 
                              src={banco.logo_url} 
                              alt={`Logo ${banco.nombre}`}
                              className="h-6 w-6 object-contain"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getBancoColor(descuento.banco_nombre) }}
                          >
                            {descuento.banco_nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">
                          {descuento.categoria || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900 capitalize">
                            {descuento.tipo_tarjeta}
                          </span>
                          {descuento.es_delivery && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Delivery
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActivo(descuento.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            descuento.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {descuento.activo ? (
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
                            onClick={() => handleEdit(descuento)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(descuento.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      <FormModal
        isOpen={showModal}
        onClose={() => {
          console.log('🚪 Cerrando modal');
          setShowModal(false);
          setEditItem(null);
        }}
        onSave={(data) => {
          console.log('💾 Modal enviando datos:', data);
          handleSave(data);
          setShowModal(false);
          setEditItem(null);
        }}
        editItem={editItem}
        type="descuento"
        bancos={bancos}
        descuentos={descuentos} // ← Pasar descuentos para obtener categorías
      />
    </div>
  );
};

export default DescuentosManager;