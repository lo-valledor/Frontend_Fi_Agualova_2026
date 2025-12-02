import { useMemo } from 'react';

import type { MedidorFilters } from '~/components/administracion/medidores/medidor-filters';
import type { GetMedidores } from '~/types/administracion';
import {
  extractUniqueOptions,
  filterByString,
  filterByPresence,
  filterByNumberRange,
  filterByDateRange
} from './utils/filter-utilities';
import { calculateFilterStats } from './utils/stats-calculator';

/**
 * Opciones disponibles para filtros de medidores
 */
export interface MedidorFilterOptions {
  marcas: string[];
  tipos: string[];
  modelos: string[];
  estados: string[];
}

/**
 * Alias para mantener compatibilidad con componentes existentes
 */
export type FilterOptions = MedidorFilterOptions;

/**
 * Hook para filtrar medidores
 * Aplica SOLID: SRP (cada tipo de filtro es independiente)
 * Maneja múltiples tipos de filtros: string, presencia, rango numérico y rango de fechas
 *
 * @param medidores - Array de medidores a filtrar
 * @param filters - Filtros a aplicar
 * @returns Medidores filtrados, estadísticas y opciones
 *
 * @example
 * const { filteredMedidores, filterStats } = useMedidorFilters(
 *   medidores,
 *   {
 *     marca: 'Siemens',
 *     digitosMin: '5',
 *     digitosMax: '7',
 *     tieneUbicacion: 'true'
 *   }
 * );
 */
export function useMedidorFilters(
  medidores: GetMedidores[],
  filters: MedidorFilters
) {
  /**
   * Extrae opciones únicas de los medidores
   * Usa selector específico para cada propiedad
   */
  const filterOptions = useMemo((): MedidorFilterOptions => {
    return {
      marcas: extractUniqueOptions(medidores, (m) => m.marca),
      tipos: extractUniqueOptions(medidores, (m) => m.tipo),
      modelos: extractUniqueOptions(medidores, (m) => m.modelo),
      estados: extractUniqueOptions(medidores, (m) => m.estado)
    };
  }, [medidores]);

  /**
   * Aplica filtros con early returns
   * Combina múltiples tipos de filtros: string, rango numérico, presencia y fechas
   */
  const filteredMedidores = useMemo(() => {
    return medidores.filter((medidor) => {
      // Filtros de string simple
      if (!filterByString(medidor.marca, filters.marca)) {
        return false;
      }

      if (!filterByString(medidor.tipo, filters.tipo)) {
        return false;
      }

      if (!filterByString(medidor.modelo, filters.modelo)) {
        return false;
      }

      if (!filterByString(medidor.estado, filters.estado)) {
        return false;
      }

      // Filtros de rango numérico
      if (
        !filterByNumberRange(
          medidor.digitos,
          filters.digitosMin,
          filters.digitosMax
        )
      ) {
        return false;
      }

      if (
        !filterByNumberRange(
          medidor.multiplicar,
          filters.multiplicarMin,
          filters.multiplicarMax
        )
      ) {
        return false;
      }

      // Filtros de presencia
      if (
        !filterByPresence(
          Boolean(medidor.ubicacion?.trim()),
          filters.tieneUbicacion
        )
      ) {
        return false;
      }

      if (
        !filterByPresence(
          Boolean(medidor.codigoAcometida?.trim()),
          filters.tieneAcometida
        )
      ) {
        return false;
      }

      // Filtro de rango de fechas
      if (
        !filterByDateRange(
          medidor.fechaInicio,
          filters.fechaInicioDesde,
          filters.fechaInicioHasta
        )
      ) {
        return false;
      }

      return true;
    });
  }, [medidores, filters]);

  /**
   * Calcula estadísticas de filtros
   */
  const filterStats = useMemo(
    () => calculateFilterStats(medidores, filteredMedidores, filters),
    [medidores.length, filteredMedidores.length, filters]
  );

  return {
    filteredMedidores,
    filterStats,
    filterOptions
  };
}
