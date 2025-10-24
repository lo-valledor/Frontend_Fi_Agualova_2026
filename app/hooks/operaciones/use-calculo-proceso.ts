import { toast } from 'sonner';

import { useState } from 'react';

import api from '~/lib/api';

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

  const obtenerCicloParaAPI = (ciclo: string): string => {
    if (ciclo === '1' || ciclo === '2') return ciclo;
    if (ciclo.includes('15')) return '1';
    return ciclo;
  };

  const handleLanzarCalculo = async () => {
    if (!periodoFormateado || !cicloId) {
      toast.error('Periodo y ciclo son requeridos.');
      return;
    }
    setIsLaunching(true);
    try {
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const requestBody = {
        cicloFacturacion: parseInt(cicloParaAPI),
        periodoFacturable: periodoFormateado
      };

      await api.post('lanzar-calculo-facturacion', requestBody);
      
      toast.success('Proceso de cálculo iniciado exitosamente', {
        description: 'El sistema está procesando los cálculos de facturación. Este proceso puede tardar varios minutos dependiendo de la cantidad de lecturas. Por favor, espere unos minutos y luego haga clic en "Ver Cálculo Facturas" para revisar los resultados.',
        duration: 8000
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.mensaje ||
        err.message ||
        'Error al lanzar el cálculo';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleAceptarCalculo = async () => {
    if (selectedContratos.length === 0) {
      toast.error('Debe seleccionar al menos un contrato.');
      return;
    }
    setIsAccepting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const lecturaId of selectedContratos) {
      try {
        const requestBody = {
          lecturaId,
          periodoId: periodoFormateado
        };

        await api.post('generar-detalle-factura', requestBody);
        successCount++;
      } catch (error: any) {
        console.error(`Error al generar detalle de factura para lectura ${lecturaId}:`, error);
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} cálculos aceptados correctamente.`);
      onCalculoAceptado();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} cálculos fallaron.`);
    }

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
