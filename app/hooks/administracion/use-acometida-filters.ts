import { useMemo } from 'react';

import type { AcometidaFilters } from '~/components/administracion/acometida/acometida-filters';
import type { Acometida } from '~/types/administracion';

export interface FilterOptions {
  empalmes: string[];
  nichos: string[];
  sectores: string[];
}

export function useAcometidaFilters(
  acometidas: Acometida[],
  filters: AcometidaFilters
) {
  // Extraer opciones únicas de las acometidas
  const filterOptions = useMemo((): FilterOptions => {
    const empalmes = [
      ...new Set(acometidas.map(a => a.empalmeDescripcion).filter(Boolean))
    ].sort();
    const nichos = [
      ...new Set(acometidas.map(a => a.nichoDescripcion).filter(Boolean))
    ].sort();
    const sectores = [
      ...new Set(acometidas.map(a => a.sectorDescripcion).filter(Boolean))
    ].sort();

    return {
      empalmes,
      nichos,
      sectores
    };
  }, [acometidas]);

  const filteredAcometidas = useMemo(() => {
    return acometidas.filter(acometida => {
      // Filtro por empalme
      if (
        filters.empalmeDescripcion &&
        filters.empalmeDescripcion !== 'all' &&
        acometida.empalmeDescripcion !== filters.empalmeDescripcion
      ) {
        return false;
      }

      // Filtro por nicho
      if (
        filters.nichoDescripcion &&
        filters.nichoDescripcion !== 'all' &&
        acometida.nichoDescripcion !== filters.nichoDescripcion
      ) {
        return false;
      }

      // Filtro por sector
      if (
        filters.sectorDescripcion &&
        filters.sectorDescripcion !== 'all' &&
        acometida.sectorDescripcion !== filters.sectorDescripcion
      ) {
        return false;
      }

      // Filtro por rango de límite de potencia
      if (filters.limitePotenciaMin || filters.limitePotenciaMax) {
        const limitePotencia = acometida.limitePotencia;

        // Si no tiene límite de potencia y se está filtrando por potencia, excluir
        if (limitePotencia === null || limitePotencia === undefined) {
          return false;
        }

        if (
          filters.limitePotenciaMin &&
          limitePotencia < parseFloat(filters.limitePotenciaMin)
        ) {
          return false;
        }

        if (
          filters.limitePotenciaMax &&
          limitePotencia > parseFloat(filters.limitePotenciaMax)
        ) {
          return false;
        }
      }

      // Filtro por tiene ubicación
      if (filters.tieneUbicacion && filters.tieneUbicacion !== 'all') {
        const tieneUbicacion = Boolean(
          acometida.ubicacion && acometida.ubicacion.trim() !== ''
        );
        if (filters.tieneUbicacion === 'true' && !tieneUbicacion) {
          return false;
        }
        if (filters.tieneUbicacion === 'false' && tieneUbicacion) {
          return false;
        }
      }

      // Filtro por tiene medidor
      if (filters.tieneMedidor && filters.tieneMedidor !== 'all') {
        const tieneMedidor = Boolean(
          acometida.numeroMedidor && acometida.numeroMedidor.trim() !== ''
        );
        if (filters.tieneMedidor === 'true' && !tieneMedidor) {
          return false;
        }
        if (filters.tieneMedidor === 'false' && tieneMedidor) {
          return false;
        }
      }

      // Filtro por tiene límite de potencia
      if (
        filters.tieneLimitePotencia &&
        filters.tieneLimitePotencia !== 'all'
      ) {
        const tieneLimitePotencia = Boolean(
          acometida.limitePotencia !== null &&
            acometida.limitePotencia !== undefined &&
            acometida.limitePotencia > 0
        );
        if (filters.tieneLimitePotencia === 'true' && !tieneLimitePotencia) {
          return false;
        }
        if (filters.tieneLimitePotencia === 'false' && tieneLimitePotencia) {
          return false;
        }
      }

      return true;
    });
  }, [acometidas, filters]);

  const filterStats = useMemo(() => {
    const total = acometidas.length;
    const filtered = filteredAcometidas.length;
    const activeFilters = Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;

    return {
      total,
      filtered,
      activeFilters,
      isFiltered: activeFilters > 0
    };
  }, [acometidas.length, filteredAcometidas.length, filters]);

  return {
    filteredAcometidas,
    filterStats,
    filterOptions
  };
}
