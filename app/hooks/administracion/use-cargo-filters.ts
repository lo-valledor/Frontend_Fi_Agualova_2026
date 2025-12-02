import { useMemo } from 'react';

import type { CargoFilters } from '~/components/administracion/cargo-facturable/cargo-filters';
import type { BuscarCargoFacturable } from '~/types/administracion';
import {
  extractUniqueOptions,
  filterByString,
  filterByNormalizedString
} from './utils/filter-utilities';
import { calculateFilterStats, type FilterStats } from './utils/stats-calculator';

/**
 * Normalizaciones de valores del backend a valores de UI
 * Mapea caracteres cortos a descripciones legibles
 */
const FIJO_VARIABLE_NORMALIZATIONS = {
  F: 'Fijo',
  V: 'Variable'
};

const PERIODICO_EVENTUAL_NORMALIZATIONS = {
  P: 'Periódico',
  E: 'Eventual'
};

/**
 * Opciones disponibles para filtros de cargos
 */
export interface CargoFilterOptions {
  tipos: string[];
  fijoVariable: string[];
  periodicoEventual: string[];
  conceptos: string[];
  tarifas: string[];
  tiposMedidor: string[];
}

/**
 * Retorno del hook de filtros de cargos
 */
export interface UseCargoFiltersReturn {
  filteredCargos: BuscarCargoFacturable[];
  filterStats: FilterStats;
  filterOptions: CargoFilterOptions;
}

/**
 * Hook para filtrar cargos facturables
 * Aplica SOLID: SRP (cada filtro normalizado es independiente)
 *
 * @param cargos - Array de cargos a filtrar
 * @param filters - Filtros a aplicar
 * @returns Cargos filtrados, estadísticas y opciones
 *
 * @example
 * const { filteredCargos, filterStats } = useCargoFilters(
 *   cargos,
 *   { tipo: 'Energía', fijoVariable: 'Fijo' }
 * );
 */
export function useCargoFilters(
  cargos: BuscarCargoFacturable[],
  filters: CargoFilters
): UseCargoFiltersReturn {
  /**
   * Extrae opciones únicas incluyendo normalizaciones
   */
  const filterOptions = useMemo((): CargoFilterOptions => {
    return {
      tipos: extractUniqueOptions(cargos, (c) => c.tipo),
      fijoVariable: [
        ...new Set(
          cargos
            .map((c) => c.fijoVariable)
            .filter((v): v is string => Boolean(v))
            .map((v) => FIJO_VARIABLE_NORMALIZATIONS[v as keyof typeof FIJO_VARIABLE_NORMALIZATIONS] || v)
        )
      ].sort(),
      periodicoEventual: [
        ...new Set(
          cargos
            .map((c) => c.periodicoEventual)
            .filter((v): v is string => Boolean(v))
            .map(
              (v) =>
                PERIODICO_EVENTUAL_NORMALIZATIONS[v as keyof typeof PERIODICO_EVENTUAL_NORMALIZATIONS] || v
            )
        )
      ].sort(),
      conceptos: extractUniqueOptions(cargos, (c) => c.concepto),
      tarifas: extractUniqueOptions(cargos, (c) => c.tarifa),
      tiposMedidor: extractUniqueOptions(cargos, (c) => c.tipoMedidor)
    };
  }, [cargos]);

  /**
   * Aplica filtros con early returns
   * Usa funciones normalizadas para valores del backend
   */
  const filteredCargos = useMemo(() => {
    return cargos.filter((cargo) => {
      // Filtros simples de string
      if (!filterByString(cargo.tipo, filters.tipo)) {
        return false;
      }

      if (!filterByString(cargo.concepto, filters.concepto)) {
        return false;
      }

      if (!filterByString(cargo.tarifa, filters.tarifa)) {
        return false;
      }

      if (!filterByString(cargo.tipoMedidor, filters.tipoMedidor)) {
        return false;
      }

      // Filtros normalizados (backend usa abreviaturas)
      if (
        !filterByNormalizedString(
          cargo.fijoVariable,
          filters.fijoVariable,
          FIJO_VARIABLE_NORMALIZATIONS
        )
      ) {
        return false;
      }

      if (
        !filterByNormalizedString(
          cargo.periodicoEventual,
          filters.periodicoEventual,
          PERIODICO_EVENTUAL_NORMALIZATIONS
        )
      ) {
        return false;
      }

      return true;
    });
  }, [cargos, filters]);

  /**
   * Calcula estadísticas con nombres más descriptivos
   */
  const filterStats = useMemo(
    () => calculateFilterStats(cargos, filteredCargos, filters),
    [cargos.length, filteredCargos.length, filters]
  );

  return {
    filteredCargos,
    filterStats,
    filterOptions
  };
}
