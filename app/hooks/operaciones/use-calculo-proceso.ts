import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';

import api from '~/lib/api';

interface UseCalculoProcesoProps {
  periodoFormateado: string;
  cicloId: string;
  onCalculoAceptado: () => void;
}

export function useCalculoProceso({
  periodoFormateado,
  cicloId,
  onCalculoAceptado,
}: UseCalculoProcesoProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [selectedContratos, setSelectedContratos] = useState<number[]>([]);
  const [isCalculoPreparado, setIsCalculoPreparado] = useState(false);

  const obtenerCicloParaAPI = (ciclo: string): string => {
    if (ciclo === '1' || ciclo === '2') return ciclo;
    if (ciclo.includes('15')) return '1';
    return ciclo;
  };

  const marcarCalculoPreparado = useCallback(() => {
    setIsCalculoPreparado(true);
    toast.success('¡Cálculo preparado exitosamente!', {
      description: 'Ahora puedes hacer clic en "Ver Cálculo Facturas"',
      duration: 4000,
    });
  }, []);

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
        periodoFacturable: periodoFormateado,
      };
      await api.post('lanzar-calculo-facturacion', requestBody);
      marcarCalculoPreparado();
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
        await api.post('generar-detalle-factura', {
          lecturaId,
          periodoId: periodoFormateado,
        });
        successCount++;
      } catch (_error) {
        errorCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} cálculos aceptados correctamente.`);
      onCalculoAceptado(); // Refresh data in parent
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} cálculos fallaron.`);
    }

    setSelectedContratos([]);
    setIsAccepting(false);
  };

  // Reset state when cicloId changes
  useEffect(() => {
    setIsCalculoPreparado(false);
  }, [cicloId]);

  return {
    isLaunching,
    isAccepting,
    selectedContratos,
    setSelectedContratos,
    isCalculoPreparado,
    handleLanzarCalculo,
    handleAceptarCalculo,
    setIsCalculoPreparado, // Allow parent to reset
  };
}
