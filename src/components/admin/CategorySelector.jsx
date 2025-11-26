// src/components/admin/CategorySelector.jsx
import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

const CategorySelector = ({ value, onChange, descuentos = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Obtener categorías únicas de descuentos existentes
  const categoriasExistentes = React.useMemo(() => {
    const categorias = descuentos
      .map(d => d.categoria)
      .filter(Boolean)
      .filter(cat => cat.trim() !== '');
    
    // Eliminar duplicados y ordenar
    return [...new Set(categorias)].sort();
  }, [descuentos]);

  // Verificar si el valor actual es una categoría personalizada
  useEffect(() => {
    if (value && !categoriasExistentes.includes(value)) {
      setShowCustomInput(true);
      setCustomInput(value);
    } else {
      setShowCustomInput(false);
      setCustomInput('');
    }
  }, [value, categoriasExistentes]);

  const handleSelectCategoria = (categoria) => {
    if (categoria === 'custom') {
      setShowCustomInput(true);
      setCustomInput('');
      setIsOpen(false);
      // Focus en el input personalizado
      setTimeout(() => {
        document.getElementById('custom-category-input')?.focus();
      }, 100);
    } else {
      onChange(categoria);
      setShowCustomInput(false);
      setCustomInput('');
      setIsOpen(false);
    }
  };

  const handleCustomInputChange = (e) => {
    const newValue = e.target.value;
    setCustomInput(newValue);
    onChange(newValue);
  };

  const handleCustomInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (customInput.trim()) {
        onChange(customInput.trim());
        setShowCustomInput(false);
        setCustomInput('');
      }
    }
    if (e.key === 'Escape') {
      setShowCustomInput(false);
      setCustomInput('');
      onChange('');
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Categoría
      </label>
      
      {showCustomInput ? (
        <div className="space-y-2">
          <input
            id="custom-category-input"
            type="text"
            value={customInput}
            onChange={handleCustomInputChange}
            onKeyDown={handleCustomInputKeyDown}
            onBlur={() => {
              if (!customInput.trim()) {
                setShowCustomInput(false);
                onChange('');
              }
            }}
            placeholder="Escribe una nueva categoría..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoComplete="off"
          />
          <div className="text-xs text-gray-500">
            Presiona Enter para confirmar o Escape para cancelar
          </div>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
          >
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {value || 'Seleccionar categoría...'}
            </span>
            <ChevronDown 
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {isOpen && (
            <>
              {/* Overlay para cerrar el dropdown */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown menu */}
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                {categoriasExistentes.length > 0 && (
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200 bg-gray-50">
                      Categorías existentes ({categoriasExistentes.length})
                    </div>
                    {categoriasExistentes.map((categoria) => (
                      <button
                        key={categoria}
                        type="button"
                        onClick={() => handleSelectCategoria(categoria)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                          value === categoria 
                            ? 'bg-blue-100 text-blue-800 font-semibold' 
                            : 'text-gray-800 hover:text-blue-700'
                        }`}
                      >
                        <span className="capitalize">{categoria}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Opción para nueva categoría */}
                <div className="border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => handleSelectCategoria('custom')}
                    className="w-full text-left px-4 py-3 text-sm text-green-700 hover:bg-green-50 hover:text-green-800 transition-colors flex items-center font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva categoría...
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Mostrar categorías existentes como chips */}
      {categoriasExistentes.length > 0 && !showCustomInput && (
        <div className="mt-2">
          <div className="text-xs text-gray-500 mb-1">
            Categorías disponibles:
          </div>
          <div className="flex flex-wrap gap-1">
            {categoriasExistentes.slice(0, 6).map((categoria) => (
              <button
                key={categoria}
                type="button"
                onClick={() => handleSelectCategoria(categoria)}
                className="inline-flex items-center px-3 py-1 text-xs bg-gray-200 text-gray-800 rounded-full hover:bg-blue-200 hover:text-blue-800 transition-colors font-medium"
              >
                {categoria}
              </button>
            ))}
            {categoriasExistentes.length > 6 && (
              <span className="inline-flex items-center px-2 py-1 text-xs text-gray-500">
                +{categoriasExistentes.length - 6} más...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;