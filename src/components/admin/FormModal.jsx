// src/components/admin/FormModal.jsx - Con selector de categorías
import React, { useState, useEffect } from 'react';
import { X, Upload, Link, Trash2 } from 'lucide-react';
import CategorySelector from './CategorySelector';

const FormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editItem, 
  type, 
  bancos = [],
  descuentos = [] // ← Agregar para obtener categorías existentes
}) => {
  const [formData, setFormData] = useState({});
  const [logoMethod, setLogoMethod] = useState('url'); // 'url' o 'upload'

  useEffect(() => {
    if (editItem) {
      setFormData(editItem);
      // Detectar método de logo existente
      if (editItem.logo_url && editItem.logo_url.startsWith('data:')) {
        setLogoMethod('upload');
      } else {
        setLogoMethod('url');
      }
    } else {
      setFormData(getDefaultData());
      setLogoMethod('url');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getDefaultData solo depende de `type`
  }, [editItem, type]);

  const getDefaultData = () => {
    if (type === 'banco') {
      return {
        nombre: '',
        color: '#6B7280',
        logo_url: '',
        activo: true
      };
    } else {
      return {
        establecimiento: '',
        descripcion: '',
        descuento: '',
        banco_nombre: '',
        tipo_tarjeta: 'debito',
        categoria: '',
        dias_validos: [],
        terminos: '',
        fecha_vencimiento: '',
        activo: true
      };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (type === 'banco' && !formData.nombre?.trim()) {
      alert('El nombre del banco es requerido');
      return;
    }
    
    if (type === 'descuento') {
      if (!formData.establecimiento?.trim()) {
        alert('El establecimiento es requerido');
        return;
      }
      if (!formData.descuento?.trim()) {
        alert('El descuento es requerido');
        return;
      }
      if (!formData.banco_nombre?.trim()) {
        alert('El banco es requerido');
        return;
      }
    }


    // Asegurar estructura correcta para bancos
    if (type === 'banco') {
      const bancoData = {
        ...formData,
        nombre: formData.nombre?.trim(),
        color: formData.color || '#374151',
        logo_url: formData.logo_url || '',
        activo: formData.activo !== undefined ? formData.activo : true
      };
      if (onSave(bancoData) === false) return;
    } else {
      if (onSave(formData) === false) return;
    }

    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDiasChange = (dia) => {
    if (dia === 'todos') {
      // Si selecciona "todos los días"
      const currentDias = formData.dias_validos || [];
      if (currentDias.length === dias.length) {
        // Si ya están todos seleccionados, deseleccionar todos
        handleChange('dias_validos', []);
      } else {
        // Si no están todos, seleccionar todos
        handleChange('dias_validos', [...dias]);
      }
    } else {
      // Comportamiento normal para días individuales
      const currentDias = formData.dias_validos || [];
      const newDias = currentDias.includes(dia)
        ? currentDias.filter(d => d !== dia)
        : [...currentDias, dia];
      
      handleChange('dias_validos', newDias);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('El archivo debe ser menor a 2MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange('logo_url', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  const tiposTarjeta = ['debito', 'credito', 'ambas'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {editItem ? 'Editar' : 'Agregar'} {type === 'banco' ? 'Banco' : 'Descuento'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {type === 'banco' ? (
            <div className="space-y-4">
              {/* Nombre del banco */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del banco *
                </label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Ej: Banco Estado"
                  required
                />
              </div>

              {/* Color del banco */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color del banco
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color || '#6B7280'}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color || '#6B7280'}
                    onChange={(e) => handleChange('color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    placeholder="#6B7280"
                  />
                </div>
              </div>

              {/* Logo del banco */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo del banco
                </label>
                
                {/* Selector de método */}
                <div className="flex space-x-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="url"
                      checked={logoMethod === 'url'}
                      onChange={(e) => setLogoMethod(e.target.value)}
                      className="mr-2"
                    />
                    <Link className="h-4 w-4 mr-1" />
                    URL
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="upload"
                      checked={logoMethod === 'upload'}
                      onChange={(e) => setLogoMethod(e.target.value)}
                      className="mr-2"
                    />
                    <Upload className="h-4 w-4 mr-1" />
                    Subir imagen
                  </label>
                </div>

                {logoMethod === 'url' ? (
                  <input
                    type="url"
                    value={formData.logo_url || ''}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    placeholder="https://ejemplo.com/logo.png o /logos/banco.png"
                  />
                ) : (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    />
                    <div className="text-xs text-gray-500">
                      Formatos: JPG, PNG, SVG. Máximo 2MB.
                    </div>
                  </div>
                )}

                {/* Preview del logo */}
                {formData.logo_url && (
                  <div className="mt-3 flex items-center space-x-3">
                    <img
                      src={formData.logo_url}
                      alt="Preview"
                      className="h-12 w-auto object-contain border border-gray-200 rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('logo_url', '')}
                      className="text-red-600 hover:text-red-800 flex items-center text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Estado activo */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="banco-activo"
                  checked={formData.activo || false}
                  onChange={(e) => handleChange('activo', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="banco-activo" className="text-sm text-gray-700">
                  Banco activo
                </label>
              </div>
            </div>
          ) : (
            /* Formulario para descuentos */
            <div className="space-y-4">
              {/* Establecimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Establecimiento *
                </label>
                <input
                  type="text"
                  value={formData.establecimiento || ''}
                  onChange={(e) => handleChange('establecimiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Ej: McDonald's"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion || ''}
                  onChange={(e) => handleChange('descripcion', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Descripción del descuento..."
                />
              </div>

              {/* Descuento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descuento *
                </label>
                <input
                  type="text"
                  value={formData.descuento || ''}
                  onChange={(e) => handleChange('descuento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Ej: 25%, 2x1, $5.000 off"
                  required
                />
              </div>

              {/* Banco */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banco *
                </label>
                <select
                  value={formData.banco_nombre || ''}
                  onChange={(e) => handleChange('banco_nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                  required
                >
                  <option value="">Seleccionar banco</option>
                  {bancos.filter(b => b.activo).map(banco => (
                    <option key={banco.id} value={banco.nombre}>
                      {banco.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de tarjeta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de tarjeta
                </label>
                <select
                  value={formData.tipo_tarjeta || 'debito'}
                  onChange={(e) => handleChange('tipo_tarjeta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                >
                  {tiposTarjeta.map(tipo => (
                    <option key={tipo} value={tipo}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selector de categorías */}
              <CategorySelector
                value={formData.categoria || ''}
                onChange={(categoria) => handleChange('categoria', categoria)}
                descuentos={descuentos}
              />

              {/* Días válidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días válidos
                </label>
                
                {/* Opción "Todos los días" */}
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.dias_validos || []).length === dias.length}
                      onChange={() => handleDiasChange('todos')}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-semibold text-blue-800 select-none">
                      📅 Todos los días de la semana
                    </span>
                  </label>
                </div>

                {/* Días individuales */}
                <div className="grid grid-cols-2 gap-2">
                  {dias.map(dia => (
                    <label key={dia} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(formData.dias_validos || []).includes(dia)}
                        onChange={() => handleDiasChange(dia)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 capitalize select-none">{dia}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Términos y condiciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Términos y condiciones
                </label>
                <textarea
                  value={formData.terminos || ''}
                  onChange={(e) => handleChange('terminos', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Términos y condiciones del descuento..."
                />
              </div>

              {/* Fecha de vencimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de vencimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_vencimiento || ''}
                  onChange={(e) => handleChange('fecha_vencimiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>

              {/* Estado activo */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="descuento-activo"
                  checked={formData.activo || false}
                  onChange={(e) => handleChange('activo', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="descuento-activo" className="text-sm text-gray-700">
                  Descuento activo
                </label>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editItem ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;