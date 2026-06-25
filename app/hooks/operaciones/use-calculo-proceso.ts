import { useState } from 'react';
import { toast } from 'sonner';

import { operacionesService } from '~/services/operacionesService';
import {
  convertirCicloParaAPI,
  validarCicloYPeriodo
} from './utils/cycle-utilities';

interface UseCalculoProcesoProps {
  periodoFormateado: string;
  cicloId: string;
  onCalculoAceptado: () => void;
}

export function useCalculoProceso({
  periodoFormateado,
  cicloId,
  onCalculoAceptado
}: UseCalculoProcesoProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [estadoProceso, setEstadoProceso] = useState<{
    estado: string;
    procesoId: number;
  } | null>(null);
  const [selectedContratos, setSelectedContratos] = useState<number[]>([]);

  const handleConsultarEstadoProceso = async (): Promise<void> => {
    if (!validarCicloYPeriodo(periodoFormateado, cicloId)) {
      toast.error('Periodo y ciclo son requeridos.');
      return;
    }

    setIsCheckingStatus(true);
    try {
      const cicloParaAPI = convertirCicloParaAPI(cicloId);
      const result = await operacionesService.getRevisarCalculosEstadoProceso(
        Number.parseInt(cicloParaAPI, 10),
        periodoFormateado
      );

      if (result.error || !result.data) {
        toast.error(
          `Error: ${result.error ?? 'No se pudo consultar el estado'}`
        );
        setEstadoProceso(null);
        return;
      }

      const estado = result.data;
      setEstadoProceso(estado);
      toast.info(`Estado del proceso: ${estado.estado}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error: ${message}`);
      setEstadoProceso(null);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleLanzarCalculo = async (): Promise<void> => {
    // Early return si faltan parámetros
    if (!validarCicloYPeriodo(periodoFormateado, cicloId)) {
      toast.error('Periodo y ciclo son requeridos.');
      return;
    }

    setIsLaunching(true);

    try {
      const cicloParaAPI = convertirCicloParaAPI(cicloId);
      const requestBody = {
        cicloId: Number.parseInt(cicloParaAPI, 10),
        periodoId: periodoFormateado,
        rut: '',
        nombre: '',
        sector: '',
        local: '',
        modo: 1,
        procesoId: 0
      };

      const result =
        await operacionesService.postRevisarCalculosLanzarCalculo(requestBody);

      if (result.error) {
        toast.error(`Error: ${result.error}`);
        return;
      }

      toast.success('Proceso de cálculo iniciado exitosamente', {
        description:
          'El sistema está procesando los cálculos de facturación. Este proceso puede tardar varios minutos dependiendo de la cantidad de lecturas. Por favor, espere unos minutos y luego haga clic en "Ver Cálculo Facturas" para revisar los resultados.',
        duration: 8000
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error: ${message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleAceptarCalculo = async (): Promise<void> => {
    // Early return si no hay contratos seleccionados
    if (selectedContratos.length === 0) {
      toast.error('Debe seleccionar al menos un contrato.');
      return;
    }

    setIsAccepting(true);
    try {
      const result = await operacionesService.postRevisarCalculosAceptar(
        periodoFormateado,
        selectedContratos
      );

      if (result.error) {
        toast.error(`Error: ${result.error}`);
        return;
      }

      toast.success(
        `${selectedContratos.length} cálculos aceptados correctamente.`
      );
      onCalculoAceptado();
      setSelectedContratos([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      toast.error(`Error: ${message}`);
    } finally {
      setIsAccepting(false);
    }
  };

  return {
    isLaunching,
    isAccepting,
    isCheckingStatus,
    estadoProceso,
    selectedContratos,
    setSelectedContratos,
    handleConsultarEstadoProceso,
    handleLanzarCalculo,
    handleAceptarCalculo
  };
}
