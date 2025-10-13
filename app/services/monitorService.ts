import api from '~/lib/api';
import type { Clave, Periodo, Sector } from '~/types/monitor';

/**
 * Interfaz estándar para respuestas del servicio de monitor
 * Encapsula el resultado exitoso o error de operaciones
 *
 * @template T - Tipo de datos que retorna la operación exitosa
 */
export interface MonitorServiceResponse<T> {
  /** Datos devueltos en caso de éxito, null si hay error */
  data: T | null;
  /** Mensaje de error si falla la operación, null si es exitosa */
  error: string | null;
}

/**
 * Interfaz para datos básicos del monitor
 * Contiene la información principal necesaria para el módulo de monitoreo
 */
export interface MonitorBasicData {
  /** Lista de períodos de facturación disponibles */
  periodos: Periodo[];
  /** Lista de sectores de lectura configurados */
  sectores: Sector[];
  /** Lista de claves de lectura del sistema */
  claves: Clave[];
  /** ID del período actualmente activo (EstadoPeriodo = 2), null si no hay periodo activo */
  activePeriodoId: number | null;
}

/**
 * Servicio para operaciones de monitoreo del sistema
 *
 * Maneja las operaciones de consulta para el módulo de monitoreo:
 * - Períodos de facturación y su estado
 * - Sectores de lectura configurados
 * - Claves de lectura del sistema
 * - Identificación de períodos activos
 *
 * Todas las operaciones retornan un objeto MonitorServiceResponse
 * que encapsula el resultado o error.
 *
 * @example
 * ```typescript
 * import { monitorService } from '~/services/monitorService';
 *
 * const { data, error } = await monitorService.getBasicData();
 * if (error) {
 *   console.error('Error:', error);
 * } else {
 *   console.log('Período activo:', data?.activePeriodoId);
 * }
 * ```
 */
class MonitorService {
  /**
   * Obtiene los datos básicos del monitor en una sola operación
   *
   * Realiza tres peticiones en paralelo para optimizar el tiempo de carga:
   * - Períodos de facturación
   * - Sectores de lectura
   * - Claves del sistema
   *
   * Además identifica automáticamente el período activo (EstadoPeriodo = 2).
   *
   * @returns Promise con objeto conteniendo periodos, sectores, claves y periodo activo, o error
   *
   * @throws {Error} Si no hay token de autenticación
   *
   * @example
   * ```typescript
   * const { data, error } = await monitorService.getBasicData();
   * if (data) {
   *   const { periodos, sectores, claves, activePeriodoId } = data;
   *   console.log(`Períodos: ${periodos.length}, Sectores: ${sectores.length}`);
   * }
   * ```
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
   * Obtiene períodos y sectores para exportación de lecturas
   *
   * Versión optimizada que solo carga períodos y sectores sin las claves,
   * reduciendo el tiempo de carga cuando no se necesita información completa.
   * Útil para pantallas de exportación y reportes.
   *
   * @returns Promise con objeto conteniendo periodos, sectores y periodo activo, o error
   *
   * @throws {Error} Si no hay token de autenticación
   *
   * @example
   * ```typescript
   * const { data, error } = await monitorService.getPeriodosAndSectores();
   * if (data) {
   *   // Usar para filtros de exportación
   *   console.log(`Sectores disponibles: ${data.sectores.length}`);
   * }
   * ```
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
   * Obtiene la lista de períodos de facturación
   *
   * @returns Promise con array de períodos o error
   *
   * @example
   * ```typescript
   * const { data, error } = await monitorService.getPeriodos();
   * if (data) {
   *   data.forEach(periodo => {
   *     console.log(`Período ${periodo.IdPeriodo}: ${periodo.EstadoPeriodo}`);
   *   });
   * }
   * ```
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
   * Obtiene la lista de sectores de lectura
   *
   * @returns Promise con array de sectores o error
   *
   * @example
   * ```typescript
   * const { data, error } = await monitorService.getSectores();
   * if (data) {
   *   console.log(`Total sectores: ${data.length}`);
   * }
   * ```
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
   * Obtiene la lista de claves del sistema
   *
   * @returns Promise con array de claves o error
   *
   * @example
   * ```typescript
   * const { data, error } = await monitorService.getClaves();
   * if (data) {
   *   console.log(`Claves disponibles: ${data.length}`);
   * }
   * ```
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
   * Encuentra el período activo de una lista de períodos
   *
   * Busca el período con EstadoPeriodo = 2 (activo) en la lista proporcionada.
   * Útil para procesar listas de períodos obtenidas previamente.
   *
   * @param periodos - Array de períodos donde buscar el activo
   * @returns ID del período activo o null si no hay ninguno activo
   *
   * @example
   * ```typescript
   * const { data } = await monitorService.getPeriodos();
   * if (data) {
   *   const activoId = monitorService.findActivePeriodo(data);
   *   console.log(`Período activo: ${activoId}`);
   * }
   * ```
   */
  findActivePeriodo(periodos: Periodo[]): number | null {
    if (!periodos || periodos.length === 0) return null;

    const activePeriodo = periodos.find(
      (periodo: Periodo) => periodo.EstadoPeriodo === 2
    );

    return activePeriodo ? Number(activePeriodo.IdPeriodo) : null;
  }
}

/**
 * Instancia singleton del servicio de monitor
 *
 * @example
 * ```typescript
 * import { monitorService } from '~/services/monitorService';
 *
 * const { data, error } = await monitorService.getBasicData();
 * ```
 */
export const monitorService = new MonitorService();
