import { useMemo } from 'react';

import type { AcometidaFilters } from '~/components/administracion/acometida/acometida-filters';
import type { Acometida } from '~/types/administracion';
import {
  extractUniqueOptions,
  filterByString,
  filterByPresence,
  filterByNumberRange
} from './utils/filter-utilities';
import { calculateFilterStats } from './utils/stats-calculator';

/**
 * Opciones disponibles para filtros de acometidas
 * Extraídas dinámicamente de los datos
 */
export interface FilterOptions {
  empalmes: string[];
  nichos: string[];
  sectores: string[];
}

/**
 * Hook para filtrar acometidas con múltiples criterios
 * Aplica SOLID: SRP (cada filtro es responsable de su lógica)
 *
 * @param acometidas - Array de acometidas a filtrar
 * @param filters - Objeto con los filtros a aplicar
 * @returns Acometidas filtradas, estadísticas y opciones
 *
 * @example
 * const { filteredAcometidas, filterStats, filterOptions } = useAcometidaFilters(
 *   acometidas,
 *   { empalmeDescripcion: 'SEC1', limitePotenciaMin: '10' }
 * );
 */
export function useAcometidaFilters(
  acometidas: Acometida[],
  filters: AcometidaFilters
) {
  /**
   * Extrae opciones únicas para cada categoría
   * Memoizado para evitar recálculos innecesarios
   */
  const filterOptions = useMemo((): FilterOptions => {
    return {
      empalmes: extractUniqueOptions(acometidas, (a) => a.empalmeDescripcion),
      nichos: extractUniqueOptions(acometidas, (a) => a.nichoDescripcion),
      sectores: extractUniqueOptions(acometidas, (a) => a.sectorDescripcion)
    };
  }, [acometidas]);

  /**
   * Aplica todos los filtros con early returns para eficiencia
   * Cada filtro es una responsabilidad separada
   */
  const filteredAcometidas = useMemo(() => {
    return acometidas.filter((acometida) => {
      // Filtros de string: empalme, nicho, sector
      if (
        !filterByString(
          acometida.empalmeDescripcion,
          filters.empalmeDescripcion
        )
      ) {
        return false;
      }

      if (!filterByString(acometida.nichoDescripcion, filters.nichoDescripcion)) {
        return false;
      }

      if (
        !filterByString(
          acometida.sectorDescripcion,
          filters.sectorDescripcion
        )
      ) {
        return false;
      }

      // Filtro de rango numérico para límite de potencia
      if (
        !filterByNumberRange(
          acometida.limitePotencia,
          filters.limitePotenciaMin,
          filters.limitePotenciaMax
        )
      ) {
        return false;
      }

      // Filtros de presencia: ubicación, medidor, límite de potencia
      if (
        !filterByPresence(
          Boolean(acometida.ubicacion?.trim()),
          filters.tieneUbicacion
        )
      ) {
        return false;
      }

      if (
        !filterByPresence(
          Boolean(acometida.numeroMedidor?.trim()),
          filters.tieneMedidor
        )
      ) {
        return false;
      }

      if (
        !filterByPresence(
          Boolean(
            acometida.limitePotencia !== null &&
              acometida.limitePotencia !== undefined &&
              acometida.limitePotencia > 0
          ),
          filters.tieneLimitePotencia
        )
      ) {
        return false;
      }

      return true;
    });
  }, [acometidas, filters]);

  /**
   * Calcula estadísticas de los filtros aplicados
   * Extraído a función separada para responsabilidad única
   */
  const filterStats = useMemo(
    () =>
      calculateFilterStats(acometidas, filteredAcometidas, filters),
    [acometidas.length, filteredAcometidas.length, filters]
  );

  return {
    filteredAcometidas,
    filterStats,
    filterOptions
  };
}
