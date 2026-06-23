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

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

export function useContractFilters(
  contracts: ContratosRow[],
  filters: ContractFilters,
) {
  const filterOptions = useMemo((): ContractFilterOptions => {
    return {
      tiposContrato: uniqueSorted(contracts.map(c => c.tipoContrato)),
      ciclosFacturacion: uniqueSorted(contracts.map(c => c.ciclo)),
      tarifas: uniqueSorted(contracts.map(c => c.tarifa)),
      comunas: uniqueSorted(contracts.map(c => c.comunaEnvio)),
    };
  }, [contracts]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      if (
        filters.tipoContrato &&
        filters.tipoContrato !== "all" &&
        contract.tipoContrato !== filters.tipoContrato
      ) {
        return false;
      }

      if (
        filters.cicloFacturacion &&
        filters.cicloFacturacion !== "all" &&
        contract.ciclo !== filters.cicloFacturacion
      ) {
        return false;
      }

      if (
        filters.tarifa &&
        filters.tarifa !== "all" &&
        contract.tarifa !== filters.tarifa
      ) {
        return false;
      }

      if (
        filters.comuna &&
        filters.comuna !== "all" &&
        contract.comunaEnvio !== filters.comuna
      ) {
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
