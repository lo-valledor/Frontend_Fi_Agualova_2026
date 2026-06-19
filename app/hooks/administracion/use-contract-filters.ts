import { useMemo } from 'react';

import type { ContractFilters } from '~/components/administracion/contratos/contract-filters';
import type { GetContratos } from '~/types/administracion';
import {
  extractUniqueOptions,
  filterByBoolean,
  filterByDateRange,
  filterByString
} from './utils/filter-utilities';
import { calculateFilterStats } from './utils/stats-calculator';

export interface ContractFilterOptions {
  tiposContrato: string[];
  ciclosFacturacion: string[];
  tarifas: string[];
  comunas: string[];
}

export type FilterOptions = ContractFilterOptions;

export function useContractFilters(
  contracts: GetContratos[],
  filters: ContractFilters
) {
  const filterOptions = useMemo((): ContractFilterOptions => {
    return {
      tiposContrato: extractUniqueOptions(contracts, c => c.tipoContrato),
      ciclosFacturacion: extractUniqueOptions(
        contracts,
        c => c.cicloFacturacion
      ),
      tarifas: extractUniqueOptions(contracts, c => c.tarifa),
      comunas: extractUniqueOptions(contracts, c => c.comunaEnvio)
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      // Filtros de string simples
      if (!filterByString(contract.tipoContrato, filters.tipoContrato)) {
        return false;
      }

      if (
        !filterByString(contract.cicloFacturacion, filters.cicloFacturacion)
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

      if (!filterByBoolean(contract.liberadoCorte, filters.liberadoCorte)) {
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
