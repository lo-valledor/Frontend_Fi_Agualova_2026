import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import api from '~/lib/api';
import type {
  CalculoPrefacturaCargoResponse,
  CalculoPrefacturaCompleto,
  CalculoPrefacturaDetalle,
} from '~/types/operaciones';

interface UseCalculoFacturaProps {
  periodoFormateado: string;
  cicloId: string;
  isCalculoPreparado: boolean;
}

export function useCalculoFactura({
  periodoFormateado,
  cicloId,
  isCalculoPreparado,
}: UseCalculoFacturaProps) {
  const [data, setData] = useState<CalculoPrefacturaCompleto[]>([]);
  const [filteredData, setFilteredData] = useState<CalculoPrefacturaCompleto[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const obtenerCicloParaAPI = (ciclo: string): string => {
    if (ciclo === '1' || ciclo === '2') return ciclo;
    if (ciclo.includes('15')) return '1';
    return ciclo;
  };

  const handleRevisarCalculo = async () => {
    if (!periodoFormateado) {
      toast.error('No hay un periodo abierto disponible');
      return;
    }
    if (!cicloId) {
      toast.error('Debe seleccionar un ciclo de facturación');
      return;
    }
    if (!isCalculoPreparado) {
      toast.error('Haga clic en "Preparar Cálculo" primero');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const requestParams = {
        cicloId: cicloParaAPI,
        periodo: periodoFormateado,
      };

      const encabezadoResponse = await api.get(
        '/calculo-prefactura-encabezado',
        { params: requestParams }
      );
      const encabezados = encabezadoResponse.data as CalculoPrefacturaDetalle[];

      if (!Array.isArray(encabezados) || encabezados.length === 0) {
        setData([]);
        toast.info(
          'No se encontraron prefacturas para el ciclo y periodo elegidos'
        );
        return;
      }

      const cargosResponse = await api.get('/calculo-prefactura-cargos', {
        params: requestParams,
      });
      const cargosData =
        cargosResponse.data as CalculoPrefacturaCargoResponse[];

      const datosCombinados: CalculoPrefacturaCompleto[] = encabezados.map(
        encabezado => {
          const cargosContrato = cargosData.find(
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
            totalFacturado,
          };
        }
      );

      setData(datosCombinados);
      toast.success(`Se encontraron ${datosCombinados.length} registros`);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.mensaje || err.message || 'Error desconocido';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = data.filter(item => {
      return Object.values(item).some(value =>
        String(value).toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredData(filtered);
  }, [searchTerm, data]);

  return {
    data,
    filteredData,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    handleRevisarCalculo,
    setData, // Export to allow clearing data
  };
}
