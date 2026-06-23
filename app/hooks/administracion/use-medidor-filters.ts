import { useMemo } from "react";

import type { MedidorFilters } from "~/components/administracion/medidores/medidor-filters";
import type { MedidorListItem } from "~/components/administracion/medidores/medidores-types";
import {
  extractUniqueOptions,
  filterByDateRange,
  filterByNumberRange,
  filterByPresence,
  filterByString,
} from "./utils/filter-utilities";
import { calculateFilterStats } from "./utils/stats-calculator";

export interface MedidorFilterOptions {
  marcas: string[];
  tipos: string[];
  modelos: string[];
  estados: string[];
}

export type FilterOptions = MedidorFilterOptions;

export function useMedidorFilters(
  medidores: MedidorListItem[],
  filters: MedidorFilters,
) {
  const filterOptions = useMemo((): MedidorFilterOptions => {
    return {
      marcas: extractUniqueOptions(medidores, (m) => m.marca),
      tipos: extractUniqueOptions(medidores, (m) => m.tipo),
      modelos: extractUniqueOptions(medidores, (m) => m.modelo),
      estados: extractUniqueOptions(medidores, (m) => m.estado),
    };
  }, [medidores]);

  const filteredMedidores = useMemo(() => {
    return medidores.filter((medidor) => {
      if (!filterByString(medidor.marca, filters.marca)) return false;
      if (!filterByString(medidor.tipo, filters.tipo)) return false;
      if (!filterByString(medidor.modelo, filters.modelo)) return false;
      if (!filterByString(medidor.estado, filters.estado)) return false;

      if (
        !filterByNumberRange(
          medidor.digitos,
          filters.digitosMin,
          filters.digitosMax,
        )
      ) {
        return false;
      }

      if (
        !filterByNumberRange(
          medidor.multiplicador,
          filters.multiplicarMin,
          filters.multiplicarMax,
        )
      ) {
        return false;
      }

      if (
        !filterByPresence(
          Boolean(medidor.ubicacion?.trim()),
          filters.tieneUbicacion,
        )
      ) {
        return false;
      }

      if (
        !filterByPresence(
          Boolean(medidor.codigoAcometida?.trim()),
          filters.tieneAcometida,
        )
      ) {
        return false;
      }

      if (
        !filterByDateRange(
          medidor.fechaInicio,
          filters.fechaInicioDesde,
          filters.fechaInicioHasta,
        )
      ) {
        return false;
      }

      return true;
    });
  }, [medidores, filters]);

  const filterStats = useMemo(
    () => calculateFilterStats(medidores, filteredMedidores, filters),
    [medidores.length, filteredMedidores.length, filters],
  );

  return {
    filteredMedidores,
    filterStats,
    filterOptions,
  };
}
