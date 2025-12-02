import api from '~/lib/api';
import type { Clave, Periodo, Sector } from '~/types/monitor';

/**
 * Generic response wrapper for all MonitorService API calls
 * Follows the Result type pattern for error handling
 *
 * @typedef {Object} MonitorServiceResponse<T>
 * @property {T | null} data - Response data or null if error occurred
 * @property {string | null} error - Error message or null if successful
 *
 * @template T - The data type being wrapped
 *
 * @example
 * // Successful response
 * { data: { periodos: [...], ... }, error: null }
 *
 * @example
 * // Error response
 * { data: null, error: 'No authentication token found' }
 */
export interface MonitorServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Basic monitoring data required for initial page load
 * Contains all configuration data needed for filter and display
 *
 * @typedef {Object} MonitorBasicData
 * @property {Periodo[]} periodos - Array of all available billing periods
 * @property {Sector[]} sectores - Array of all available monitoring sectors
 * @property {Clave[]} claves - Array of all available reading codes/keys
 * @property {number | null} activePeriodoId - ID of the currently active period
 */
export interface MonitorBasicData {
  periodos: Periodo[];
  sectores: Sector[];
  claves: Clave[];
  activePeriodoId: number | null;
}

/**
 * MonitorService - Service layer for meter reading monitoring
 * Handles all API communication for periods, sectors, and reading codes
 * Manages authentication token validation and error handling
 *
 * @class
 * @example
 * // Use the singleton instance
 * import { monitorService } from '~/services/monitorService';
 * const result = await monitorService.getBasicData();
 */
class MonitorService {
  /**
   * Fetches all basic data needed for monitoring interface
   * Loads periods, sectors, and reading codes in parallel
   * Automatically identifies the active period
   *
   * @async
   * @returns {Promise<MonitorServiceResponse<MonitorBasicData>>} All basic monitoring data
   *
   * @throws {MonitorServiceResponse} Returns error in response (never throws)
   *
   * @example
   * // Basic usage
   * const result = await monitorService.getBasicData();
   * if (result.error) {
   *   console.error('Failed to load data:', result.error);
   * } else {
   *   console.log('Periods:', result.data.periodos);
   * }
   *
   * @example
   * // In a route loader
   * export async function clientLoader() {
   *   const result = await monitorService.getBasicData();
   *   return {
   *     ...result.data,
   *     error: result.error ? new Error(result.error) : null
   *   };
   * }
   */
  async getBasicData(): Promise<MonitorServiceResponse<MonitorBasicData>> {
    try {
      // Verificar si hay token antes de hacer peticiones
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Carga paralela de datos básicos
      const [periodosRes, sectoresRes, clavesRes] = await Promise.all([
        api.get<Periodo[]>('/Periodos'),
        api.get<Sector[]>('/Sectores'),
        api.get<Clave[]>('/Claves')
      ]);

      const periodosData = Array.isArray(periodosRes.data)
        ? periodosRes.data
        : [];
      const sectoresData = Array.isArray(sectoresRes.data)
        ? sectoresRes.data
        : [];
      const clavesData = Array.isArray(clavesRes.data) ? clavesRes.data : [];

      // Encontrar el período activo
      let activePeriodoId: number | null = null;
      if (periodosData && periodosData.length > 0) {
        const activePeriodo = periodosData.find(
          (periodo: Periodo) => periodo.EstadoPeriodo === 2
        );
        if (activePeriodo) {
          activePeriodoId = Number(activePeriodo.IdPeriodo);
        }
      }

      return {
        data: {
          periodos: periodosData,
          sectores: sectoresData,
          claves: clavesData,
          activePeriodoId
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Fetches periods and sectors data (without claves)
   * More lightweight than getBasicData for specific use cases
   *
   * @async
   * @returns {Promise<MonitorServiceResponse<{periodos: Periodo[], sectores: Sector[], activePeriodoId: number | null}>>}
   *   Periods and sectors with active period ID
   *
   * @example
   * // When you don't need reading codes
   * const result = await monitorService.getPeriodosAndSectores();
   * if (!result.error) {
   *   setPeriodsAndSectors(result.data);
   * }
   */
  async getPeriodosAndSectores(): Promise<
    MonitorServiceResponse<{
      periodos: Periodo[];
      sectores: Sector[];
      activePeriodoId: number | null;
    }>
  > {
    try {
      // Verificar si hay token antes de hacer peticiones
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Carga paralela de datos necesarios
      const [periodosRes, sectoresRes] = await Promise.all([
        api.get<Periodo[]>('/Periodos'),
        api.get<Sector[]>('/Sectores')
      ]);

      const periodosData = Array.isArray(periodosRes.data)
        ? periodosRes.data
        : [];
      const sectoresData = Array.isArray(sectoresRes.data)
        ? sectoresRes.data
        : [];

      // Encontrar el período activo
      let activePeriodoId: number | null = null;
      if (periodosData && periodosData.length > 0) {
        const activePeriodo = periodosData.find(
          (periodo: Periodo) => periodo.EstadoPeriodo === 2
        );
        if (activePeriodo) {
          activePeriodoId = Number(activePeriodo.IdPeriodo);
        }
      }

      return {
        data: {
          periodos: periodosData,
          sectores: sectoresData,
          activePeriodoId
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Fetches all available billing periods
   * Periods determine the range and configuration for meter readings
   *
   * @async
   * @returns {Promise<MonitorServiceResponse<Periodo[]>>} Array of periods
   *
   * @example
   * // Fetch periods for a dropdown selector
   * const result = await monitorService.getPeriodos();
   * if (!result.error && result.data) {
   *   setPeriods(result.data);
   * }
   */
  async getPeriodos(): Promise<MonitorServiceResponse<Periodo[]>> {
    try {
      const response = await api.get<Periodo[]>('/Periodos');
      const periodosData = Array.isArray(response.data) ? response.data : [];

      return {
        data: periodosData,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Fetches all available monitoring sectors
   * Sectors define the geographical or organizational areas to monitor
   *
   * @async
   * @returns {Promise<MonitorServiceResponse<Sector[]>>} Array of sectors
   *
   * @example
   * // Load sectors for sector selector buttons
   * const result = await monitorService.getSectores();
   * if (!result.error && result.data) {
   *   setSectors(result.data);
   * }
   */
  async getSectores(): Promise<MonitorServiceResponse<Sector[]>> {
    try {
      const response = await api.get<Sector[]>('/Sectores');
      const sectoresData = Array.isArray(response.data) ? response.data : [];

      return {
        data: sectoresData,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Fetches all available reading codes/keys
   * Codes are status indicators for meter readings (e.g., Normal, Informative Key, Critical Key)
   *
   * @async
   * @returns {Promise<MonitorServiceResponse<Clave[]>>} Array of reading codes
   *
   * @example
   * // Load reading codes for status filter dropdown
   * const result = await monitorService.getClaves();
   * if (!result.error && result.data) {
   *   setReadingCodes(result.data);
   * }
   */
  async getClaves(): Promise<MonitorServiceResponse<Clave[]>> {
    try {
      const response = await api.get<Clave[]>('/Claves');
      const clavesData = Array.isArray(response.data) ? response.data : [];

      return {
        data: clavesData,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Finds the active (current) period in a periods array
   * Periods with EstadoPeriodo === 2 are considered active
   *
   * @param {Periodo[]} periodos - Array of periods to search
   * @returns {number | null} ID of the active period or null if not found
   *
   * @example
   * // Find active period for default selection
   * const activeId = monitorService.findActivePeriodo(periods);
   * if (activeId) {
   *   setSelectedPeriod(periods.find(p => p.IdPeriodo === activeId));
   * }
   */
  findActivePeriodo(periodos: Periodo[]): number | null {
    if (!periodos || periodos.length === 0) return null;

    const activePeriodo = periodos.find(
      (periodo: Periodo) => periodo.EstadoPeriodo === 2
    );

    return activePeriodo ? Number(activePeriodo.IdPeriodo) : null;
  }
}

export const monitorService = new MonitorService();
