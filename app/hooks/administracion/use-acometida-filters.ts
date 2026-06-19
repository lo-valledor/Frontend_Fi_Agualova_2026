import { useMemo } from 'react';

import type { AcometidaFilters } from '~/components/administracion/acometida/acometida-filters';
import type { AcometidaRow } from '~/types/administracion';
import {
  extractUniqueOptions,
  filterByNumberRange,
  filterByPresence,
  filterByString
} from './utils/filter-utilities';
import { calculateFilterStats } from './utils/stats-calculator';

export interface FilterOptions {
  empalmes: string[];
  nichos: string[];
  sectores: string[];
}

export function useAcometidaFilters(
  acometidas: AcometidaRow[],
  filters: AcometidaFilters
) {
  const filterOptions = useMemo((): FilterOptions => {
    return {
      empalmes: extractUniqueOptions(acometidas, a => a.empalme),
      nichos: extractUniqueOptions(acometidas, a => a.nicho),
      sectores: extractUniqueOptions(acometidas, a => a.sector)
    };
  }, [acometidas]);

  const filteredAcometidas = useMemo(() => {
    return acometidas.filter(acometida => {
      // Filtros de string: empalme, nicho, sector
      if (!filterByString(acometida.empalme, filters.empalmeDescripcion)) {
        return false;
      }

      if (!filterByString(acometida.nicho, filters.nichoDescripcion)) {
        return false;
      }

      if (!filterByString(acometida.sector, filters.sectorDescripcion)) {
        return false;
      }

      // Filtro de rango numérico para límite de potencia
      if (
        !filterByNumberRange(
          Number(acometida.limitePotencia || 0),
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
          Boolean(acometida.medidor?.trim()),
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
              Number(acometida.limitePotencia) > 0
          ),
          filters.tieneLimitePotencia
        )
      ) {
        return false;
      }

      return true;
    });
  }, [acometidas, filters]);

  const filterStats = useMemo(
    () => calculateFilterStats(acometidas, filteredAcometidas, filters),
    [acometidas.length, filteredAcometidas.length, filters]
  );

  return {
    filteredAcometidas,
    filterStats,
    filterOptions
  };
}
