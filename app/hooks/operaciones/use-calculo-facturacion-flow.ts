/**
 * Hook para ejecutar un flujo multi-paso de cálculo de facturación
 * Orquesta 5 pasos secuenciales: lanzar, obtener ID, verificar, consultar datos
 *
 * @module operaciones/use-calculo-facturacion-flow
 */

import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';

import { operacionesService } from '~/services/operacionesService';
import type {
  CalculoPrefacturaCargoResponse,
  CalculoPrefacturaCompleto,
  CalculoPrefacturaDetalle
} from '~/types/operaciones';
import {
  convertirCicloParaAPI,
  validarCicloYPeriodo
} from './utils/cycle-utilities';
import { combinarPrefactura } from './utils/data-combiner';
import { extraerErrorMessage } from './utils/error-handler';

/**
 * Estado de un paso en el flujo
 */
export interface FlowStep {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  data?: any;
  error?: string;
  timestamp?: string;
}

/**
 * Props del hook de flujo de facturación
 */
interface UseCalculoFacturacionFlowProps {
  periodoFormateado: string;
  cicloId: string;
  onFlowCompleted?: () => void;
}

/**
 * Inicializa el array de pasos del flujo
 */
function inicializarFlowSteps(): FlowStep[] {
  return [
    {
      id: 1,
      name: 'Lanzar Cálculo',
      description: 'Iniciar el proceso de cálculo de facturación',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Obtener Identificador',
      description: 'Obtener el ID del proceso de cálculo',
      status: 'pending'
    },
    {
      id: 3,
      name: 'Verificar Estado',
      description: 'Verificar que el proceso se completó correctamente',
      status: 'pending'
    },
    {
      id: 4,
      name: 'Consultar Encabezado',
      description: 'Obtener los datos de encabezado de prefactura',
      status: 'pending'
    },
    {
      id: 5,
      name: 'Consultar Cargos',
      description: 'Obtener los cargos detallados de prefactura',
      status: 'pending'
    }
  ];
}

/**
 * Hook para ejecutar flujo de cálculo de facturación
 *
 * Aplica SOLID: SRP (solo orquesta el flujo), DRY (usa utilities compartidas)
 *
 * @param periodoFormateado - Período en formato MMYYYY
 * @param periodoFormateado.periodoFormateado
 * @param cicloId - ID del ciclo de facturación
 * @param periodoFormateado.cicloId
 * @param onFlowCompleted - Callback cuando se completa el flujo
 * @param periodoFormateado.onFlowCompleted
 * @returns Estados, datos y funciones para ejecutar el flujo
 *
 * @example
 * const {
 *   currentStep,
 *   isRunning,
 *   datosCompletos,
 *   ejecutarFlujoCompleto
 * } = useCalculoFacturacionFlow({
 *   periodoFormateado: '012024',
 *   cicloId: '1',
 *   onFlowCompleted: () => refetch()
 * });
 */
export function useCalculoFacturacionFlow({
  periodoFormateado,
  cicloId,
  onFlowCompleted
}: UseCalculoFacturacionFlowProps) {
  // Estados del flujo
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [procesoId, setProcesoId] = useState<string | null>(null);

  // Datos del flujo
  const [encabezadoData, setEncabezadoData] = useState<
    CalculoPrefacturaDetalle[]
  >([]);
  const [datosCompletos, setDatosCompletos] = useState<
    CalculoPrefacturaCompleto[]
  >([]);

  // Debug y logging
  const [debugMode, setDebugMode] = useState(false);
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>(
    inicializarFlowSteps()
  );

  /**
   * Actualiza el estado de un paso en el flujo
   */
  const logStep = useCallback(
    (
      stepId: number,
      status: FlowStep['status'],
      data?: any,
      error?: string
    ) => {
      setFlowSteps(prev =>
        prev.map(step =>
          step.id === stepId
            ? {
                ...step,
                status,
                data: data ? JSON.stringify(data, null, 2) : step.data,
                error,
                timestamp: new Date().toLocaleTimeString()
              }
            : step
        )
      );
    },
    []
  );

  /**
   * Paso 1: Lanza el cálculo de facturación en el backend
   */
  const ejecutarPaso1 = async (): Promise<boolean> => {
    logStep(1, 'loading');

    try {
      const cicloParaAPI = convertirCicloParaAPI(cicloId);
      const response = await operacionesService.lanzarCalculoFacturacion(
        Number.parseInt(cicloParaAPI),
        periodoFormateado
      );

      if (response.error) {
        logStep(1, 'error', null, response.error);
        toast.error(`Error en Paso 1: ${response.error}`);
        return false;
      }

      logStep(1, 'completed', response.data);
      toast.success('Paso 1: Cálculo lanzado exitosamente');
      return true;
    } catch (error) {
      const { message } = extraerErrorMessage(error);
      logStep(1, 'error', null, message);
      toast.error(`Error en Paso 1: ${message}`);
      return false;
    }
  };

  /**
   * Paso 2: Obtiene el identificador del proceso
   */
  const ejecutarPaso2 = async (): Promise<boolean> => {
    logStep(2, 'loading');

    try {
      const cicloParaAPI = convertirCicloParaAPI(cicloId);
      const response = await operacionesService.obtenerIdentificadorProceso(
        cicloParaAPI,
        periodoFormateado,
        1
      );

      // Early return si hay error o no hay datos
      if (response.error || !response.data || response.data.length === 0) {
        const errorMsg =
          response.error || 'No se encontró identificador del proceso';
        logStep(2, 'error', response.data, errorMsg);
        toast.error(`Error en Paso 2: ${errorMsg}`);
        return false;
      }

      const identificador = response.data[0];

      // Validar estructura de respuesta
      if (!identificador?.procesoId) {
        const errorMsg = `La respuesta no contiene un procesoId válido. Estructura recibida: ${JSON.stringify(identificador)}`;
        logStep(2, 'error', response.data, errorMsg);
        toast.error('Error en Paso 2: Respuesta inválida del servidor');
        return false;
      }

      setProcesoId(identificador.procesoId.toString());
      logStep(2, 'completed', response.data);
      toast.success(`Paso 2: Proceso ID obtenido: ${identificador.procesoId}`);
      return true;
    } catch (error) {
      const { message } = extraerErrorMessage(error);
      logStep(2, 'error', null, message);
      toast.error(`Error en Paso 2: ${message}`);
      return false;
    }
  };

  /**
   * Paso 3: Verifica el estado del proceso
   */
  const ejecutarPaso3 = async (): Promise<boolean> => {
    // Early return si no hay procesoId
    if (!procesoId) {
      logStep(3, 'error', null, 'No hay proceso ID disponible');
      return false;
    }

    logStep(3, 'loading');

    try {
      const response =
        await operacionesService.verificarEstadoProceso(procesoId);

      if (response.error || !response.data) {
        const errorMsg =
          response.error || 'No se pudo verificar el estado';
        logStep(3, 'error', null, errorMsg);
        toast.error(`Error en Paso 3: ${errorMsg}`);
        return false;
      }

      const estado = response.data[0];
      logStep(3, 'completed', response.data);

      if (estado.codigoEstado === 1) {
        toast.success(`Paso 3: ${estado.mensaje}`);
      } else {
        toast.warning(
          `Paso 3: ${estado.mensaje} (Código: ${estado.codigoEstado})`
        );
      }

      return true;
    } catch (error) {
      const { message } = extraerErrorMessage(error);
      logStep(3, 'error', null, message);
      toast.error(`Error en Paso 3: ${message}`);
      return false;
    }
  };

  /**
   * Paso 4: Consulta los encabezados de prefactura
   */
  const ejecutarPaso4 = async (): Promise<boolean> => {
    logStep(4, 'loading');

    try {
      const cicloParaAPI = convertirCicloParaAPI(cicloId);
      const response =
        await operacionesService.consultarEncabezadoPrefactura(
          cicloParaAPI,
          periodoFormateado
        );

      if (response.error || !response.data) {
        const errorMsg = response.error || 'No se encontraron datos de encabezado';
        logStep(4, 'error', null, errorMsg);
        toast.error(`Error en Paso 4: ${errorMsg}`);
        return false;
      }

      setEncabezadoData(response.data);
      logStep(4, 'completed', {
        count: response.data.length,
        sample: response.data[0]
      });
      toast.success(`Paso 4: ${response.data.length} encabezados obtenidos`);
      return true;
    } catch (error) {
      const { message } = extraerErrorMessage(error);
      logStep(4, 'error', null, message);
      toast.error(`Error en Paso 4: ${message}`);
      return false;
    }
  };

  /**
   * Paso 5: Consulta los cargos y combina con encabezados
   */
  const ejecutarPaso5 = async (): Promise<boolean> => {
    logStep(5, 'loading');

    try {
      const cicloParaAPI = convertirCicloParaAPI(cicloId);
      const response =
        await operacionesService.consultarCargosPrefactura(
          cicloParaAPI,
          periodoFormateado
        );

      if (response.error || !response.data) {
        const errorMsg = response.error || 'No se encontraron cargos';
        logStep(5, 'error', null, errorMsg);
        toast.error(`Error en Paso 5: ${errorMsg}`);
        return false;
      }

      // Combinar datos
      const datosCombinados = combinarPrefactura(
        encabezadoData,
        response.data as CalculoPrefacturaCargoResponse[]
      );

      setDatosCompletos(datosCombinados);
      logStep(5, 'completed', {
        cargosCount: response.data.length,
        combinedCount: datosCombinados.length,
        totalFacturado: datosCombinados.reduce(
          (sum, item) => sum + item.totalFacturado,
          0
        )
      });
      toast.success(
        `Paso 5: Datos combinados exitosamente (${datosCombinados.length} registros)`
      );
      return true;
    } catch (error) {
      const { message } = extraerErrorMessage(error);
      logStep(5, 'error', null, message);
      toast.error(`Error en Paso 5: ${message}`);
      return false;
    }
  };

  /**
   * Ejecuta los pasos del flujo secuencialmente
   * @param paso
   */
  const ejecutarPasosSiguientes = async (paso: number): Promise<boolean> => {
    switch (paso) {
      case 2:
        if (await ejecutarPaso2()) {
          setCurrentStep(3);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return ejecutarPasosSiguientes(3);
        }
        return false;

      case 3:
        if (await ejecutarPaso3()) {
          setCurrentStep(4);
          await new Promise(resolve => setTimeout(resolve, 500));
          return ejecutarPasosSiguientes(4);
        }
        return false;

      case 4:
        if (await ejecutarPaso4()) {
          setCurrentStep(5);
          await new Promise(resolve => setTimeout(resolve, 500));
          return ejecutarPasosSiguientes(5);
        }
        return false;

      case 5:
        if (await ejecutarPaso5()) {
          setCurrentStep(6);
          toast.success('¡Flujo completado exitosamente!');
          onFlowCompleted?.();
          return true;
        }
        return false;

      default:
        return false;
    }
  };

  /**
   * Ejecuta el flujo completo desde el principio
   */
  const ejecutarFlujoCompleto = async (): Promise<void> => {
    // Early return si faltan parámetros
    if (!validarCicloYPeriodo(periodoFormateado, cicloId)) {
      toast.error('Periodo y ciclo son requeridos');
      return;
    }

    setIsRunning(true);
    setCurrentStep(1);

    try {
      if (await ejecutarPaso1()) {
        setCurrentStep(2);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await ejecutarPasosSiguientes(2);
      }
    } catch (error) {
      toast.error(`Error inesperado en el flujo: ${extraerErrorMessage(error).message}`);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Limpia el estado del flujo
   */
  const limpiarFlujo = (): void => {
    setCurrentStep(0);
    setProcesoId(null);
    setEncabezadoData([]);
    setDatosCompletos([]);
    setFlowSteps(prev =>
      prev.map(step => ({
        ...step,
        status: 'pending' as const,
        data: undefined,
        error: undefined,
        timestamp: undefined
      }))
    );
  };

  // Limpiar flujo cuando cambia el ciclo
  useEffect(() => {
    limpiarFlujo();
  }, [cicloId]);

  return {
    // Estados del flujo
    currentStep,
    isRunning,
    procesoId,
    flowSteps,
    debugMode,
    setDebugMode,

    // Datos
    encabezadoData,
    datosCompletos,

    // Acciones
    ejecutarFlujoCompleto,
    limpiarFlujo,

    // Pasos individuales (para debugging)
    ejecutarPaso1,
    ejecutarPaso2,
    ejecutarPaso3,
    ejecutarPaso4,
    ejecutarPaso5
  };
}
