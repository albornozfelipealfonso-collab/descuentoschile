// src/components/public/DescuentoCard.jsx
import React, { memo, useState } from 'react';
import { Calendar, CreditCard, Tag, Truck } from 'lucide-react';
import { formatDias, formatFecha, getTextColor } from '../../utils/descuentos';

const TIPO_LABEL = { debito: 'Débito', credito: 'Crédito', ambas: 'Débito y crédito' };

const DescuentoCard = ({ descuento }) => {
  const [logoError, setLogoError] = useState(false);
  const bg = descuento.banco_color;

  return (
    <article className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow animate-fade-in flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium min-w-0"
          style={{ backgroundColor: bg, color: getTextColor(bg) }}
        >
          {descuento.logo_url && !logoError && (
            <img
              src={descuento.logo_url}
              alt=""
              loading="lazy"
              className="h-4 w-4 object-contain bg-white rounded flex-shrink-0"
              onError={() => setLogoError(true)}
            />
          )}
          <span className="truncate">{descuento.banco_nombre}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800">{descuento.establecimiento}</h3>
      <p className="text-green-700 font-bold text-sm mb-2">{descuento.descuento}</p>

      {descuento.descripcion && descuento.descripcion !== descuento.descuento && (
        <p className="text-gray-600 text-sm mb-3">{descuento.descripcion}</p>
      )}

      <ul className="space-y-2 text-sm text-gray-600 mt-auto">
        {descuento.dias_validos?.length > 0 && (
          <li className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" aria-hidden="true" />
            <span>{formatDias(descuento.dias_validos)}</span>
          </li>
        )}
        {descuento.tipo_tarjeta && (
          <li className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" aria-hidden="true" />
            <span>{TIPO_LABEL[descuento.tipo_tarjeta] || descuento.tipo_tarjeta}</span>
          </li>
        )}
        {descuento.categoria && (
          <li className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" aria-hidden="true" />
            <span className="capitalize">{descuento.categoria}</span>
          </li>
        )}
        {descuento.es_delivery && (
          <li className="flex items-center text-green-600">
            <Truck className="h-4 w-4 mr-2 flex-shrink-0" aria-hidden="true" />
            <span>Delivery disponible</span>
          </li>
        )}
      </ul>

      {descuento.terminos && (
        <p className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <strong>T&amp;C:</strong> {descuento.terminos}
        </p>
      )}

      {descuento.url && (
        <a
          href={descuento.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-xs text-blue-600 hover:underline"
        >
          Ver condiciones en el sitio del banco ↗
        </a>
      )}

      {descuento.fecha_vencimiento && (
        <p className="mt-2 text-xs text-red-500">Válido hasta: {formatFecha(descuento.fecha_vencimiento)}</p>
      )}
    </article>
  );
};

export default memo(DescuentoCard);
