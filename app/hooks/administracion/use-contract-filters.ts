import { useMemo } from "react";

import type { ContractFilters } from "~/components/administracion/contratos/contract-filters";
import type { ContratosRow } from "~/types/administracion";
import { calculateFilterStats } from "./utils/stats-calculator";

export interface ContractFilterOptions {
  tiposContrato: string[];
  ciclosFacturacion: string[];
  tarifas: string[];
  comunas: string[];
}

export type FilterOptions = ContractFilterOptions;

export function useContractFilters(
  contracts: ContratosRow[],
  filters: ContractFilters,
) {
  const filterOptions = useMemo((): ContractFilterOptions => {
    return {
      tiposContrato: [],
      ciclosFacturacion: [],
      tarifas: [],
      comunas: [],
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((_contract) => {
      if (filters.cicloFacturacion && filters.cicloFacturacion !== "all") {
        return false;
      }

      if (filters.tipoContrato && filters.tipoContrato !== "all") {
        return false;
      }

      if (filters.tarifa && filters.tarifa !== "all") {
        return false;
      }

      if (filters.comuna && filters.comuna !== "all") {
        return false;
      }

      return true;
    });
  }, [contracts, filters]);

  const filterStats = useMemo(
    () => calculateFilterStats(contracts, filteredContracts, filters),
    [contracts.length, filteredContracts.length, filters],
  );

  return {
    filteredContracts,
    filterStats,
    filterOptions,
  };
}
