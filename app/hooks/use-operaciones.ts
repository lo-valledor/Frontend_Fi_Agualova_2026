/**
 * Operaciones (Operations) Module Hooks
 *
 * Provides hooks for managing operations data including:
 * - Preparar lecturas (prepare readings)
 * - Asignacion sectores (sector assignment)
 * - Precios cargo (charge prices)
 * - Revisar precio (review prices)
 * - Corte reposicion (cut and reconnection)
 * - Cerrar lecturas (close readings)
 * - Periodo facturacion (billing period)
 * - Periodo abierto (open period)
 *
 * All data-loading hooks use the generic handleDataLoad utility from utils
 * to avoid code duplication and ensure consistent error handling.
 */

import { useCallback, useEffect, useState } from 'react';

import { operacionesService } from '~/services/operacionesService';
import type {
  Anio,
  Ciclo,
  ConsultarAsignacionSectores,
  ConsultarMantenedorRevisionCorte,
  ConsultarSectores,
  OpcionesPrepararLecturas,
  PeriodoAbierto,
  Periodos,
  PreciosCargoEnel,
  PreciosCargoEnerlova,
  RevisarPrecioDos,
  RevisarPrecioUno,
  TotalesCorteReposicion,
  ValidarSectoresPendientes
} from '~/types/operaciones';
import { handleDataLoad } from './utils/data-loader';

/**
 * Hook for loading preparar lecturas data
 *
 * Provides complete data for preparing readings including:
 * - Periodo abierto (open period)
 * - Lecturas pendientes (pending readings)
 * - Sectores disponibles (available sectors)
 * - Opciones de preparacion (preparation options)
 *
 * @returns {Object} Hook state and actions
 * @returns {Object|null} data - Preparar lecturas data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 * @returns {Function} refreshData - Function to refresh data
 *
 * @example
 * ```tsx
 * const { data, loading, error, refreshData } = usePrepararLecturasData();
 *
 * if (loading) return <Loading />;
 * if (error) return <Error message={error} />;
 *
 * return (
 *   <PrepararLecturasForm
 *     periodoAbierto={data?.periodoAbierto}
 *     sectores={data?.sectores}
 *     onRefresh={refreshData}
 *   />
 * );
 * ```
 */
export function usePrepararLecturasData() {
  const [data, setData] = useState<{
    periodoAbierto: PeriodoAbierto[];
    lecturasPendientes: ValidarSectoresPendientes | null;
    sectores: ConsultarSectores[];
    opcionesPreparar: OpcionesPrepararLecturas[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getPrepararLecturasData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  const refreshData = async (): Promise<void> => {
    await handleDataLoad(
      () => operacionesService.getPrepararLecturasData(),
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
 * Hook for loading asignacion sectores (sector assignment)
 *
 * Provides a function to load sector assignments for a specific cycle and period.
 * Does not load data automatically - must call loadAsignacionSectores explicitly.
 *
 * @returns {Object} Hook state and actions
 * @returns {ConsultarAsignacionSectores[]} data - Array of sector assignments
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 * @returns {Function} loadAsignacionSectores - Function to load sector assignments
 *
 * @example
 * ```tsx
 * const { data, loading, loadAsignacionSectores } = useAsignacionSectores();
 *
 * useEffect(() => {
 *   if (ciclo && periodo) {
 *     loadAsignacionSectores(ciclo, periodo);
 *   }
 * }, [ciclo, periodo]);
 *
 * return <AsignacionTable data={data} loading={loading} />;
 * ```
 */
export function useAsignacionSectores() {
  const [data, setData] = useState<ConsultarAsignacionSectores[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAsignacionSectores = useCallback(
    async (cicloFacturable: string, periodo: string): Promise<void> => {
      // Early return if parameters are missing
      if (!cicloFacturable || !periodo) {
        return;
      }

      await handleDataLoad(
        () => operacionesService.getAsignacionSectores(cicloFacturable, periodo),
        (result) => setData(result || []),
        setError,
        setLoading
      );
    },
    []
  );

  return {
    data,
    loading,
    error,
    loadAsignacionSectores
  };
}

/**
 * Hook for loading precios cargo (charge prices)
 *
 * Loads price data for both ENEL and Enerlova for a specific month and year.
 * Automatically loads when mes and anio change.
 *
 * @param mes - Month to load prices for
 * @param anio - Year to load prices for
 * @returns {Object} Hook state
 * @returns {Object|null} data - Prices data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = usePreciosCargo('01', '2024');
 *
 * if (loading) return <Loading />;
 *
 * return (
 *   <PreciosTable
 *     enelPrices={data?.tablaEnel}
 *     enerlovaPrices={data?.tablaEnerlova}
 *   />
 * );
 * ```
 */
export function usePreciosCargo(mes: string, anio: string) {
  const [data, setData] = useState<{
    tablaEnel: PreciosCargoEnel[];
    tablaEnerlova: PreciosCargoEnerlova[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getPreciosCargoData(mes, anio),
      setData,
      setError,
      setLoading
    );
  }, [mes, anio]);

  return {
    data,
    loading,
    error
  };
}

/**
 * Hook for loading revisar precio (review prices) data
 *
 * Loads comprehensive price review data including open period,
 * prices for two different tables, and billing cycle options.
 * Also provides a function to refresh prices for a specific cycle.
 *
 * @param dia - Day for billing cycle (default: '15')
 * @returns {Object} Hook state and actions
 * @returns {Object|null} data - Review price data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 * @returns {Function} refreshPrecios - Function to refresh prices for a cycle
 *
 * @example
 * ```tsx
 * const { data, loading, error, refreshPrecios } = useRevisarPrecio('15');
 *
 * const handleCycleChange = (newCycle) => {
 *   refreshPrecios(newCycle);
 * };
 *
 * return (
 *   <RevisarPrecioForm
 *     data={data}
 *     onCycleChange={handleCycleChange}
 *   />
 * );
 * ```
 */
export function useRevisarPrecio(dia: string = '15') {
  const [data, setData] = useState<{
    dataPeriodoAbierto: PeriodoAbierto[];
    dataConsultarPreciosUno: RevisarPrecioUno[];
    dataConsultarPreciosDos: RevisarPrecioDos[];
    ciclosFacturacion: Array<{
      diaFacturacion: string;
      descripcion: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getRevisarPrecioData(dia),
      setData,
      setError,
      setLoading
    );
  }, [dia]);

  const refreshPrecios = useCallback(
    async (nuevoCiclo?: string): Promise<void> => {
      // Early return if no data loaded yet
      if (!data?.dataPeriodoAbierto || data.dataPeriodoAbierto.length === 0) {
        return;
      }

      setLoading(true);
      try {
        const mes = data.dataPeriodoAbierto[0].mes;
        const anio = data.dataPeriodoAbierto[0].anio;
        const ciclo = nuevoCiclo || dia;

        const result = await operacionesService.getPreciosPorCiclo(
          mes,
          anio,
          ciclo
        );

        if (result.error || !result.data) {
          setError(result.error || 'Error al cargar precios');
        } else {
          setData(prev =>
            prev
              ? {
                  ...prev,
                  dataConsultarPreciosUno: result.data?.preciosUno || [],
                  dataConsultarPreciosDos: result.data?.preciosDos || []
                }
              : null
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [data, dia]
  );

  return {
    data,
    loading,
    error,
    refreshPrecios
  };
}

/**
 * Hook for loading corte reposicion (cut and reconnection) data
 *
 * Provides totals and mantenedor (maintenance) data for cut and reconnection operations.
 *
 * @returns {Object} Hook state
 * @returns {Object|null} data - Corte reposicion data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useCorteReposicion();
 *
 * if (loading) return <Loading />;
 *
 * return (
 *   <CorteReposicionPanel
 *     totales={data?.totalesData}
 *     mantenedor={data?.mantenedorCorteData}
 *   />
 * );
 * ```
 */
export function useCorteReposicion() {
  const [data, setData] = useState<{
    totalesData: TotalesCorteReposicion[];
    mantenedorCorteData: ConsultarMantenedorRevisionCorte[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getCorteReposicionData(),
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
 * Hook for loading cerrar lecturas (close readings) data
 *
 * Provides open period data and billing cycles for closing readings.
 *
 * @returns {Object} Hook state
 * @returns {Object|null} data - Cerrar lecturas data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useCerrarLecturas();
 *
 * return (
 *   <CerrarLecturasForm
 *     periodoAbierto={data?.periodoAbierto}
 *     ciclos={data?.ciclosFacturacion}
 *   />
 * );
 * ```
 */
export function useCerrarLecturas() {
  const [data, setData] = useState<{
    periodoAbierto: PeriodoAbierto[];
    ciclosFacturacion: Ciclo[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getCerrarLecturasData(),
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
 * Hook for loading periodo facturacion (billing period) data
 *
 * Provides available years and periods for billing period selection.
 *
 * @returns {Object} Hook state
 * @returns {Object|null} data - Periodo facturacion data object or null
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { data, loading, error } = usePeriodoFacturacion();
 *
 * return (
 *   <PeriodoFacturacionForm
 *     years={data?.years}
 *     periodos={data?.periodos}
 *   />
 * );
 * ```
 */
export function usePeriodoFacturacion() {
  const [data, setData] = useState<{
    years: Anio[];
    periodos: Periodos[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getPeriodoFacturacionData(),
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
 * Hook for loading periodo abierto (open period) data
 *
 * Provides the currently open billing period.
 *
 * @returns {Object} Hook state
 * @returns {PeriodoAbierto[]} periodoAbierto - Array of open periods
 * @returns {boolean} loading - Loading state
 * @returns {string|null} error - Error message or null
 *
 * @example
 * ```tsx
 * const { periodoAbierto, loading, error } = usePeriodoAbierto();
 *
 * if (periodoAbierto.length > 0) {
 *   console.log('Open period:', periodoAbierto[0]);
 * }
 * ```
 */
export function usePeriodoAbierto() {
  const [periodoAbierto, setPeriodoAbierto] = useState<PeriodoAbierto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getPeriodoAbierto(),
      (result) => setPeriodoAbierto(result || []),
      setError,
      setLoading
    );
  }, []);

  return {
    periodoAbierto,
    loading,
    error
  };
}
