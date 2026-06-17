import { toast } from 'sonner';

import { useState } from 'react';

import api from '~/lib/api';
import {
  convertirCicloParaAPI,
  validarCicloYPeriodo
} from './utils/cycle-utilities';
import { extraerErrorMessage } from './utils/error-handler';


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
  const [selectedContratos, setSelectedContratos] = useState<number[]>([]);

  
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
        cicloFacturacion: Number.parseInt(cicloParaAPI),
        periodoFacturable: periodoFormateado
      };

      await api.post('lanzar-calculo-facturacion', requestBody);

      toast.success('Proceso de cálculo iniciado exitosamente', {
        description:
          'El sistema está procesando los cálculos de facturación. Este proceso puede tardar varios minutos dependiendo de la cantidad de lecturas. Por favor, espere unos minutos y luego haga clic en "Ver Cálculo Facturas" para revisar los resultados.',
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
    // Early return si no hay contratos seleccionados
    if (selectedContratos.length === 0) {
      toast.error('Debe seleccionar al menos un contrato.');
      return;
    }

    setIsAccepting(true);
    let successCount = 0;
    let errorCount = 0;

    // Procesar cada contrato seleccionado
    for (const lecturaId of selectedContratos) {
      try {
        const requestBody = {
          lecturaId,
          periodoId: periodoFormateado
        };

        await api.post('generar-detalle-factura', requestBody);
        successCount++;
      } catch (error) {
        console.error(
          `Error al aceptar cálculo para lectura ${lecturaId}:`,
          error
        );
        errorCount++;
      }
    }

    // Reportar resultados
    if (successCount > 0) {
      toast.success(`${successCount} cálculos aceptados correctamente.`);
      onCalculoAceptado();
    }

    if (errorCount > 0) {
      toast.error(`${errorCount} cálculos fallaron.`);
    }

    // Limpiar selección
    setSelectedContratos([]);
    setIsAccepting(false);
  };

  return {
    isLaunching,
    isAccepting,
    selectedContratos,
    setSelectedContratos,
    handleLanzarCalculo,
    handleAceptarCalculo
  };
}
