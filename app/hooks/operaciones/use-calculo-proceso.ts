import { useState } from 'react';
import { toast } from 'sonner';

import { operacionesService } from '~/services/operacionesService';
import type { RevisarCalculosLanzarCalculoRequest } from '~/types/operaciones';

import { validarCicloYPeriodo } from './utils/cycle-utilities';
import { extraerErrorMessage } from './utils/error-handler';

interface UseCalculoProcesoProps {
  periodoFormateado: string;
  cicloId: string;
  onCalculoAceptado?: () => void;
}

export function useCalculoProceso({
  periodoFormateado,
  cicloId,
  onCalculoAceptado
}: UseCalculoProcesoProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [selectedContratos, setSelectedContratos] = useState<number[]>([]);
  const [procesoId, setProcesoId] = useState<number | null>(null);

  const handleLanzarCalculo = async (): Promise<void> => {
    if (!validarCicloYPeriodo(periodoFormateado, cicloId)) {
      toast.error('Periodo y ciclo son requeridos.');
      return;
    }

    setIsLaunching(true);

    try {
      const cicloNumero = Number.parseInt(cicloId, 10);
      const request: RevisarCalculosLanzarCalculoRequest = {
        cicloId: cicloNumero,
        periodoId: periodoFormateado,
        rut: '',
        nombre: '',
        sector: '',
        local: '',
        modo: 0,
        procesoId: procesoId ?? 0
      };

      const result =
        await operacionesService.postRevisarCalculosLanzarCalculo(request);

      if (result.error) {
        toast.error(`Error: ${result.error}`);
        return;
      }

      toast.success('Proceso de cálculo iniciado exitosamente', {
        description:
          'El sistema está procesando los cálculos de facturación. Este proceso puede tardar varios minutos.',
        duration: 8000
      });
    } catch (err) {
      const { message } = extraerErrorMessage(err);
      toast.error(`Error: ${message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleAceptarCalculo = async (): Promise<void> => {
    if (selectedContratos.length === 0) {
      toast.error('Debe seleccionar al menos un contrato.');
      return;
    }

    if (!periodoFormateado) {
      toast.error('Período es requerido.');
      return;
    }

    setIsAccepting(true);
    try {
      const result =
        await operacionesService.postRevisarCalculosAceptar(periodoFormateado);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Cálculos aceptados correctamente.');
      setSelectedContratos([]);
      onCalculoAceptado?.();
    } catch (err) {
      const { message } = extraerErrorMessage(err);
      toast.error(`Error al aceptar cálculos: ${message}`);
    } finally {
      setIsAccepting(false);
    }
  };

  const setProcesoIdActual = (id: number | null): void => {
    setProcesoId(id);
  };

  return {
    isLaunching,
    isAccepting,
    selectedContratos,
    setSelectedContratos,
    procesoId,
    setProcesoId: setProcesoIdActual,
    handleLanzarCalculo,
    handleAceptarCalculo
  };
}