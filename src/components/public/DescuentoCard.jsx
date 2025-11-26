// src/components/public/DescuentoCard.jsx
import React from 'react';
import { Calendar, CreditCard, Tag, Truck } from 'lucide-react';
import { useIsMobile } from '../shared/hooks';

// Función para obtener colores de bancos
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
  return colores[nombre] || '#374151';
};

const DescuentoCard = ({ descuento }) => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* Header con logo y nombre del banco */}
      <div className="flex items-center justify-between mb-3">
        <div 
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white space-x-2"
          style={{ backgroundColor: getBancoColor(descuento.banco_nombre) }}
        >
          {/* Logo del banco */}
          {descuento.logo_url && (
            <img 
              src={descuento.logo_url} 
              alt={`Logo ${descuento.banco_nombre}`}
              className="h-4 w-4 object-contain bg-white/20 rounded flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <span className="truncate">{descuento.banco_nombre}</span>
        </div>
        
        {/* Badge de descuento */}
        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          {descuento.descuento}
        </div>
      </div>

      {/* Título del establecimiento */}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {descuento.establecimiento}
      </h3>

      {/* Descripción */}
      {descuento.descripcion && (
        <p className="text-gray-600 text-sm mb-3">
          {descuento.descripcion}
        </p>
      )}

      {/* Información adicional */}
      <div className="space-y-2">
        {/* Días válidos */}
        {descuento.dias_validos && descuento.dias_validos.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            <span>
              {descuento.dias_validos.join(', ')}
            </span>
          </div>
        )}

        {/* Tipo de tarjeta */}
        {descuento.tipo_tarjeta && (
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="h-4 w-4 mr-2 text-purple-500" />
            <span className="capitalize">{descuento.tipo_tarjeta}</span>
          </div>
        )}

        {/* Categoría */}
        {descuento.categoria && (
          <div className="flex items-center text-sm text-gray-600">
            <Tag className="h-4 w-4 mr-2 text-orange-500" />
            <span className="capitalize">{descuento.categoria}</span>
          </div>
        )}

        {/* Delivery disponible */}
        {descuento.es_delivery && (
          <div className="flex items-center text-sm text-green-600">
            <Truck className="h-4 w-4 mr-2" />
            <span>Delivery disponible</span>
          </div>
        )}
      </div>

      {/* Términos y condiciones */}
      {descuento.terminos && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <strong>T&C:</strong> {descuento.terminos}
          </p>
        </div>
      )}

      {/* Fecha de vencimiento */}
      {descuento.fecha_vencimiento && (
        <div className="mt-2">
          <p className="text-xs text-red-500">
            Válido hasta: {new Date(descuento.fecha_vencimiento).toLocaleDateString('es-CL')}
          </p>
        </div>
      )}
    </div>
  );
};

export default DescuentoCard;