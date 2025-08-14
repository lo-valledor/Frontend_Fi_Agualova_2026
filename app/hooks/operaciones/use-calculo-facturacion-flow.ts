import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';

import { operacionesService } from '~/services/operacionesService';
import type {
  CalculoPrefacturaCompleto,
  CalculoPrefacturaDetalle
} from '~/types/operaciones';

export interface FlowStep {
  id: number;
  name: string;
  description: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  data?: any;
  error?: string;
  timestamp?: string;
}

interface UseCalculoFacturacionFlowProps {
  periodoFormateado: string;
  cicloId: string;
  onFlowCompleted?: () => void;
}

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
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([
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
  ]);

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
    [debugMode]
  );

  const obtenerCicloParaAPI = (ciclo: string): string => {
    if (ciclo === '1' || ciclo === '2') return ciclo;
    if (ciclo.includes('15')) return '1';
    return ciclo;
  };

  // Paso 1: Lanzar cálculo de facturación
  const ejecutarPaso1 = async (): Promise<boolean> => {
    logStep(1, 'loading');

    try {
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const response = await operacionesService.lanzarCalculoFacturacion(
        parseInt(cicloParaAPI),
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
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido';
      logStep(1, 'error', null, errorMsg);
      toast.error(`Error en Paso 1: ${errorMsg}`);
      return false;
    }
  };

  // Paso 2: Obtener identificador del proceso
  const ejecutarPaso2 = async (): Promise<boolean> => {
    logStep(2, 'loading');

    try {
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const response = await operacionesService.obtenerIdentificadorProceso(
        cicloParaAPI,
        periodoFormateado,
        1
      );

      if (response.error || !response.data || response.data.length === 0) {
        logStep(
          2,
          'error',
          response.data,
          response.error || 'No se encontró identificador del proceso'
        );
        toast.error(
          `Error en Paso 2: ${response.error || 'No se encontró identificador'}`
        );
        return false;
      }

      const identificador = response.data[0];

      // Verificar que el identificador tenga la estructura esperada
      if (!identificador?.procesoId) {
        logStep(
          2,
          'error',
          response.data,
          `La respuesta no contiene un procesoId válido. Estructura recibida: ${JSON.stringify(identificador)}`
        );
        toast.error('Error en Paso 2: Respuesta inválida del servidor');
        return false;
      }

      setProcesoId(identificador.procesoId.toString());
      logStep(2, 'completed', response.data);
      toast.success(`Paso 2: Proceso ID obtenido: ${identificador.procesoId}`);
      return true;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido';
      logStep(2, 'error', null, errorMsg);
      toast.error(`Error en Paso 2: ${errorMsg}`);
      return false;
    }
  };

  // Paso 3: Verificar estado del proceso
  const ejecutarPaso3 = async (): Promise<boolean> => {
    if (!procesoId) {
      logStep(3, 'error', null, 'No hay proceso ID disponible');
      return false;
    }

    logStep(3, 'loading');

    try {
      const response =
        await operacionesService.verificarEstadoProceso(procesoId);

      if (response.error || !response.data) {
        logStep(
          3,
          'error',
          null,
          response.error || 'No se pudo verificar el estado'
        );
        toast.error(
          `Error en Paso 3: ${response.error || 'Error al verificar estado'}`
        );
        return false;
      }

      const estado = response.data[0];
      logStep(3, 'completed', response.data);

      if (estado.codigoEstado === 1) {
        toast.success(`Paso 3: ${estado.mensaje}`);
        return true;
      } else {
        toast.warning(
          `Paso 3: ${estado.mensaje} (Código: ${estado.codigoEstado})`
        );
        return true; // Continuamos aunque el código no sea 1
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido';
      logStep(3, 'error', null, errorMsg);
      toast.error(`Error en Paso 3: ${errorMsg}`);
      return false;
    }
  };

  // Paso 4: Consultar encabezado de prefactura
  const ejecutarPaso4 = async (): Promise<boolean> => {
    logStep(4, 'loading');

    try {
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const response = await operacionesService.consultarEncabezadoPrefactura(
        cicloParaAPI,
        periodoFormateado
      );

      if (response.error || !response.data) {
        logStep(
          4,
          'error',
          null,
          response.error || 'No se encontraron datos de encabezado'
        );
        toast.error(`Error en Paso 4: ${response.error || 'No hay datos'}`);
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
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido';
      logStep(4, 'error', null, errorMsg);
      toast.error(`Error en Paso 4: ${errorMsg}`);
      return false;
    }
  };

  // Paso 5: Consultar cargos de prefactura y combinar datos
  const ejecutarPaso5 = async (): Promise<boolean> => {
    logStep(5, 'loading');

    try {
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const response = await operacionesService.consultarCargosPrefactura(
        cicloParaAPI,
        periodoFormateado
      );

      if (response.error || !response.data) {
        logStep(5, 'error', null, response.error || 'No se encontraron cargos');
        toast.error(`Error en Paso 5: ${response.error || 'No hay cargos'}`);
        return false;
      }

      // Combinar encabezados con cargos
      const datosCombinados: CalculoPrefacturaCompleto[] = encabezadoData.map(
        encabezado => {
          const cargosContrato = response.data?.find(
            c => c.contratoId === encabezado.contratoId
          );
          const totalFacturado =
            cargosContrato?.cargos.reduce(
              (sum, cargo) => sum + cargo.subtotal,
              0
            ) || 0;

          return {
            ...encabezado,
            cargos: cargosContrato?.cargos || [],
            totalFacturado
          };
        }
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
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido';
      logStep(5, 'error', null, errorMsg);
      toast.error(`Error en Paso 5: ${errorMsg}`);
      return false;
    }
  };

  // Ejecutar flujo paso a paso
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

  // Ejecutar flujo completo
  const ejecutarFlujoCompleto = async () => {
    if (!periodoFormateado || !cicloId) {
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
      toast.error('Error inesperado en el flujo');
      console.error('Error en flujo:', error);
    } finally {
      setIsRunning(false);
    }
  };

  // Limpiar estado del flujo
  const limpiarFlujo = () => {
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

  // Reset cuando cambia el ciclo
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
