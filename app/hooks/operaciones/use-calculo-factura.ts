import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { operacionesService } from '~/services/operacionesService';
import type { RevisarCalculosPrefactura } from '~/types/operaciones';
import { convertirCicloParaAPI } from './utils/cycle-utilities';

interface UseCalculoFacturaProps {
  periodoFormateado: string;
  cicloId: string;
}

export interface UseCalculoFacturaResult {
  data: RevisarCalculosPrefactura[];
  filteredData: RevisarCalculosPrefactura[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleRevisarCalculo: () => Promise<void>;
  setData: (data: RevisarCalculosPrefactura[]) => void;
}

export function useCalculoFactura({
  periodoFormateado,
  cicloId
}: UseCalculoFacturaProps): UseCalculoFacturaResult {
  const [data, setData] = useState<RevisarCalculosPrefactura[]>([]);
  const [filteredData, setFilteredData] = useState<RevisarCalculosPrefactura[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleRevisarCalculo = async (): Promise<void> => {
    // Early return si faltan parámetros
    if (!periodoFormateado || !cicloId) {
      toast.error(
        !periodoFormateado
          ? 'No hay un periodo abierto disponible'
          : 'Debe seleccionar un ciclo de facturación'
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cicloParaAPI = convertirCicloParaAPI(cicloId);
      const requestParams = {
        cicloId: Number.parseInt(cicloParaAPI, 10),
        periodo: periodoFormateado
      };

      const result =
        await operacionesService.getRevisarCalculosBuscarPrefacturas(
          requestParams.cicloId,
          requestParams.periodo
        );

      if (result.error) {
        setError(result.error);
        setData([]);
        toast.error(`Error: ${result.error}`);
        return;
      }

      const datosCombinados = Array.isArray(result.data) ? result.data : [];

      if (datosCombinados.length === 0) {
        setData([]);
        toast.info(
          'No se encontraron prefacturas para el ciclo y periodo elegidos'
        );
        return;
      }

      setData(datosCombinados);
      toast.success(`Se encontraron ${datosCombinados.length} registros`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast.error(`Error: ${message}`);
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
    setData
  };
}
