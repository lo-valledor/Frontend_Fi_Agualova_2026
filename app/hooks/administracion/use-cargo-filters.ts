import { useMemo } from 'react';

import type { CargoFilters } from '~/components/administracion/cargo-facturable/cargo-filters';
import type { BuscarCargoFacturable } from '~/types/administracion';

interface UseCargoFiltersReturn {
  filteredCargos: BuscarCargoFacturable[];
  filterStats: {
    totalCargos: number;
    filteredCargos: number;
    activeFilters: number;
    isFiltered: boolean;
  };
}

export function useCargoFilters(
  cargos: BuscarCargoFacturable[],
  filters: CargoFilters
): UseCargoFiltersReturn {
  const filteredCargos = useMemo(() => {
    return cargos.filter(cargo => {
      // Filtro por tipo
      if (filters.tipo && filters.tipo !== 'all') {
        const cargoTipo = cargo.tipo || '';
        if (cargoTipo !== filters.tipo) return false;
      }

      // Filtro por fijo/variable
      if (filters.fijoVariable && filters.fijoVariable !== 'all') {
        const cargoFijoVariable = cargo.fijoVariable || '';
        let cargoFijoVariableNormalized = cargoFijoVariable;

        // Normalizar valores del backend
        if (cargoFijoVariable === 'F') cargoFijoVariableNormalized = 'Fijo';
        if (cargoFijoVariable === 'V') cargoFijoVariableNormalized = 'Variable';

        if (cargoFijoVariableNormalized !== filters.fijoVariable) return false;
      }

      // Filtro por periódico/eventual
      if (filters.periodicoEventual && filters.periodicoEventual !== 'all') {
        const cargoPeriodicoEventual = cargo.periodicoEventual || '';
        let cargoPeriodicoEventualNormalized = cargoPeriodicoEventual;

        // Normalizar valores del backend
        if (cargoPeriodicoEventual === 'P')
          cargoPeriodicoEventualNormalized = 'Periódico';
        if (cargoPeriodicoEventual === 'E')
          cargoPeriodicoEventualNormalized = 'Eventual';

        if (cargoPeriodicoEventualNormalized !== filters.periodicoEventual)
          return false;
      }

      // Filtro por concepto
      if (filters.concepto && filters.concepto !== 'all') {
        const cargoConcepto = cargo.concepto || '';
        if (cargoConcepto !== filters.concepto) return false;
      }

      // Filtro por tarifa
      if (filters.tarifa && filters.tarifa !== 'all') {
        const cargoTarifa = cargo.tarifa || '';
        if (cargoTarifa !== filters.tarifa) return false;
      }

      // Filtro por tipo medidor
      if (filters.tipoMedidor && filters.tipoMedidor !== 'all') {
        const cargoTipoMedidor = cargo.tipoMedidor || '';
        if (cargoTipoMedidor !== filters.tipoMedidor) return false;
      }

      return true;
    });
  }, [cargos, filters]);

  const activeFilters = useMemo(() => {
    return Object.values(filters).filter(
      value => value !== '' && value !== 'all'
    ).length;
  }, [filters]);

  const filterStats = useMemo(
    () => ({
      totalCargos: cargos.length,
      filteredCargos: filteredCargos.length,
      activeFilters,
      isFiltered: activeFilters > 0
    }),
    [cargos.length, filteredCargos.length, activeFilters]
  );

  return {
    filteredCargos,
    filterStats
  };
}
