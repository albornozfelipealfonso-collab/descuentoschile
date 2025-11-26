// src/components/shared/hooks.jsx
import { useState, useEffect, useMemo } from 'react';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

export const useFilteredDescuentos = (descuentos, filtros, busqueda) => {
  return useMemo(() => {
    if (!descuentos || !Array.isArray(descuentos)) {
      return [];
    }

    return descuentos.filter(descuento => {
      // Verificar que el descuento tenga las propiedades necesarias
      if (!descuento) return false;

      // Filtro de búsqueda
      if (busqueda && busqueda.trim()) {
        const searchTerm = busqueda.toLowerCase().trim();
        const establecimiento = descuento.establecimiento?.toLowerCase() || '';
        const descripcion = descuento.descripcion?.toLowerCase() || '';
        const bancoNombre = descuento.banco_nombre?.toLowerCase() || '';
        const categoria = descuento.categoria?.toLowerCase() || '';
        
        const matchSearch = establecimiento.includes(searchTerm) ||
                          descripcion.includes(searchTerm) ||
                          bancoNombre.includes(searchTerm) ||
                          categoria.includes(searchTerm);
        
        if (!matchSearch) return false;
      }

      // Filtro por banco
      if (filtros.banco && filtros.banco !== 'todos') {
        const bancoNombre = descuento.banco_nombre?.toLowerCase() || '';
        if (bancoNombre !== filtros.banco.toLowerCase()) return false;
      }

      // Filtro por día
      if (filtros.dia && filtros.dia !== 'todos') {
        const diasValidos = descuento.dias_validos || descuento.dias_semana || [];
        if (!Array.isArray(diasValidos)) return false;
        
        const diaLower = filtros.dia.toLowerCase();
        const tieneElDia = diasValidos.some(dia => 
          dia && dia.toLowerCase().includes(diaLower)
        );
        
        if (!tieneElDia) return false;
      }

      // Filtro por tipo de tarjeta
      if (filtros.tipo && filtros.tipo !== 'todos') {
        const tipoTarjeta = descuento.tipo_tarjeta?.toLowerCase() || '';
        if (tipoTarjeta !== filtros.tipo.toLowerCase()) return false;
      }

      // Filtro por categoría
      if (filtros.categoria && filtros.categoria !== 'todas') {
        const categoria = descuento.categoria?.toLowerCase() || '';
        if (categoria !== filtros.categoria.toLowerCase()) return false;
      }

      // Filtro por activo (solo mostrar descuentos activos)
      if (descuento.activo === false) return false;

      return true;
    });
  }, [descuentos, filtros, busqueda]);
};