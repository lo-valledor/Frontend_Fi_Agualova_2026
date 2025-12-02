import { useMemo } from 'react';

import type { ContractFilters } from '~/components/administracion/contratos/contract-filters';
import type { GetContratos } from '~/types/administracion';
import {
  extractUniqueOptions,
  filterByString,
  filterByBoolean,
  filterByDateRange
} from './utils/filter-utilities';
import { calculateFilterStats } from './utils/stats-calculator';

/**
 * Opciones disponibles para filtros de contratos
 */
export interface ContractFilterOptions {
  tiposContrato: string[];
  ciclosFacturacion: string[];
  tarifas: string[];
  comunas: string[];
}

/**
 * Alias para mantener compatibilidad con componentes existentes
 */
export type FilterOptions = ContractFilterOptions;

/**
 * Hook para filtrar contratos
 * Aplica SOLID: SRP (cada tipo de filtro es independiente)
 *
 * @param contracts - Array de contratos a filtrar
 * @param filters - Filtros a aplicar
 * @returns Contratos filtrados, estadísticas y opciones
 *
 * @example
 * const { filteredContracts, filterStats } = useContractFilters(
 *   contracts,
 *   { tipoContrato: 'Residencial', activo: 'true' }
 * );
 */
export function useContractFilters(
  contracts: GetContratos[],
  filters: ContractFilters
) {
  /**
   * Extrae opciones únicas de los contratos
   * Usa selector específico para cada propiedad
   */
  const filterOptions = useMemo((): ContractFilterOptions => {
    return {
      tiposContrato: extractUniqueOptions(contracts, (c) => c.tipoContrato),
      ciclosFacturacion: extractUniqueOptions(
        contracts,
        (c) => c.cicloFacturacion
      ),
      tarifas: extractUniqueOptions(contracts, (c) => c.tarifa),
      comunas: extractUniqueOptions(contracts, (c) => c.comunaEnvio)
    };
  }, [contracts]);

  /**
   * Aplica filtros con early returns
   * Combina filtros string, booleano y rango de fechas
   */
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      // Filtros de string simples
      if (!filterByString(contract.tipoContrato, filters.tipoContrato)) {
        return false;
      }

      if (
        !filterByString(
          contract.cicloFacturacion,
          filters.cicloFacturacion
        )
      ) {
        return false;
      }

      if (!filterByString(contract.tarifa, filters.tarifa)) {
        return false;
      }

      if (!filterByString(contract.comunaEnvio, filters.comuna)) {
        return false;
      }

      // Filtros booleanos
      if (!filterByBoolean(contract.activo, filters.activo)) {
        return false;
      }

      if (
        !filterByBoolean(
          contract.liberadoCorte,
          filters.liberadoCorte
        )
      ) {
        return false;
      }

      // Filtro de rango de fechas
      if (
        !filterByDateRange(
          contract.fechaTermino,
          filters.fechaTerminoDesde,
          filters.fechaTerminoHasta
        )
      ) {
        return false;
      }

      return true;
    });
  }, [contracts, filters]);

  /**
   * Calcula estadísticas de filtros
   */
  const filterStats = useMemo(
    () => calculateFilterStats(contracts, filteredContracts, filters),
    [contracts.length, filteredContracts.length, filters]
  );

  return {
    filteredContracts,
    filterStats,
    filterOptions
  };
}
