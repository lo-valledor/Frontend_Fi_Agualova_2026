/**
 * Monitor Module Hooks
 *
 * Provides hooks for managing monitor data and utilities including:
 * - Basic monitor data (lecturas, claves, sectores, periodos)
 * - Periodos and sectores combined data
 * - Date formatting utilities
 * - Active period detection
 * - Search parameter validation
 * - Default dates calculation
 *
 * All data-loading hooks use the generic handleDataLoad utility from utils
 * to avoid code duplication and ensure consistent error handling.
 */

import { useEffect, useState } from 'react';

import {
  type MonitorBasicData,
  monitorService
} from '~/services/monitorService';
import type { Periodo, Sector } from '~/types/monitor';
import { handleDataLoad } from './utils/data-loader';

/**
 * Hook for loading basic monitor data
 *
 * Provides complete data for monitor operations including:
 * - Lecturas (readings)
 * - Claves (reading keys)
 * - Sectores (sectors)
 * - Periodos (periods)
 *
 * @returns {Object} Hook state and actions
 * @returns {MonitorBasicData|null} data - Monitor data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 * @returns {Function} refreshData - Function to refresh data
 *
 * @example
 * ```tsx
 * const { data, loading, error, refreshData } = useMonitorData();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 * if (!data) return null;
 *
 * return <MonitorTable data={data} onRefresh={refreshData} />;
 * ```
 */
export function useMonitorData() {
  const [data, setData] = useState<MonitorBasicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => monitorService.getBasicData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  const refreshData = async (): Promise<void> => {
    await handleDataLoad(
      () => monitorService.getBasicData(),
      setData,
      setError,
      setLoading
    );
  };

  return {
    data,
    loading,
    error,
    refreshData
  };
}

/**
 * Combined periodos and sectores data structure
 */
interface PeriodosAndSectoresData {
  periodos: Periodo[];
  sectores: Sector[];
  activePeriodoId: number | null;
}

/**
 * Hook for loading periodos and sectores combined data
 *
 * Provides periodos and sectores data together with the active periodo ID.
 * Useful for components that need both datasets simultaneously.
 *
 * @returns {Object} Hook state
 * @returns {PeriodosAndSectoresData|null} data - Combined data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useMonitorPeriodosAndSectores();
 *
 * if (loading) return <Loading />;
 *
 * return (
 *   <FilterForm
 *     periodos={data?.periodos}
 *     sectores={data?.sectores}
 *     defaultPeriodoId={data?.activePeriodoId}
 *   />
 * );
 * ```
 */
export function useMonitorPeriodosAndSectores() {
  const [data, setData] = useState<PeriodosAndSectoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => monitorService.getPeriodosAndSectores(),
      setData,
      setError,
      setLoading
    );
  }, []);

  return {
    data,
    loading,
    error
  };
}

/**
 * Formats date string to YYYYMMDD format
 *
 * Handles both YYYY-MM-DD and DD-MM-YYYY input formats.
 * Returns empty string if input is invalid.
 *
 * @param dateString - Date string to format
 * @returns Formatted date as YYYYMMDD or empty string
 *
 * @example
 * ```tsx
 * formatDateToYYYYMMDD('2024-01-15') // '20240115'
 * formatDateToYYYYMMDD('15-01-2024') // '20240115'
 * formatDateToYYYYMMDD('invalid')     // ''
 * ```
 */
export const formatDateToYYYYMMDD = (dateString: string): string => {
  if (!dateString) {
    return '';
  }

  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return '';
  }

  let year: string;
  let month: string;
  let day: string;

  // Detect format: YYYY-MM-DD or DD-MM-YYYY
  if (parts[0].length === 4) {
    // Format: YYYY-MM-DD
    [year, month, day] = parts;
  } else {
    // Format: DD-MM-YYYY
    [day, month, year] = parts;
  }

  return `${year}${month}${day}`;
};

/**
 * Finds the active period from a list of periods
 *
 * Active period is identified by EstadoPeriodo === 2.
 * Falls back to the first period if no active period is found.
 *
 * @param periodos - Array of periods to search
 * @returns Active period or first period, or null if array is empty
 *
 * @example
 * ```tsx
 * const activePeriod = findActivePeriod(periodos);
 * if (activePeriod) {
 *   console.log('Active period:', activePeriod.Descripcion);
 * }
 * ```
 */
export const findActivePeriod = (periodos: Periodo[]): Periodo | null => {
  if (!periodos || periodos.length === 0) {
    return null;
  }

  const activePeriodo = periodos.find(periodo => periodo.EstadoPeriodo === 2);
  return activePeriodo || periodos[0];
};

/**
 * Validation result for search parameters
 */
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates search parameters (sector and periodo)
 *
 * Ensures both sector and periodo are selected before allowing search.
 * Returns validation result with error message if invalid.
 *
 * @param sector - Selected sector or null
 * @param periodo - Selected periodo or null
 * @returns Validation result with isValid flag and optional error message
 *
 * @example
 * ```tsx
 * const validation = validateSearchParams(selectedSector, selectedPeriodo);
 * if (!validation.isValid) {
 *   toast.error(validation.error);
 *   return;
 * }
 * // Proceed with search
 * ```
 */
export const validateSearchParams = (
  sector: Sector | null,
  periodo: Periodo | null
): ValidationResult => {
  if (!sector) {
    return {
      isValid: false,
      error: 'Por favor, seleccione un sector.'
    };
  }

  if (!periodo) {
    return {
      isValid: false,
      error: 'Por favor, seleccione un periodo.'
    };
  }

  return { isValid: true };
};

/**
 * Default dates structure
 */
interface DefaultDates {
  fechaInicio: string;
  fechaFin: string;
}

/**
 * Gets default dates based on the selected period
 *
 * Returns the period's start date as fechaInicio and today's date as fechaFin.
 * Returns empty strings if no period is provided.
 *
 * @param periodo - Selected periodo or null
 * @returns Object with fechaInicio and fechaFin strings
 *
 * @example
 * ```tsx
 * const dates = getDefaultDates(selectedPeriodo);
 * setFechaInicio(dates.fechaInicio);
 * setFechaFin(dates.fechaFin);
 * ```
 */
export const getDefaultDates = (periodo: Periodo | null): DefaultDates => {
  const today = new Date().toISOString().split('T')[0];

  return {
    fechaInicio: periodo?.FechaInicio || '',
    fechaFin: today
  };
};
