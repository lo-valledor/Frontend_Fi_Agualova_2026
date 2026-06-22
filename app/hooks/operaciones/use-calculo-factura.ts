import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { operacionesService } from '~/services/operacionesService';

import { validarCicloYPeriodo } from './utils/cycle-utilities';
import { es404 } from './utils/error-handler';

interface UseCalculoFacturaProps {
  periodoFormateado: string;
  cicloId: string;
}

/**
 * Forma esperada del item de prefactura. La respuesta del endpoint
 * `/revisar-calculos/buscar-prefacturas` no está completamente tipada
 * en el source-of-truth, así que usamos un shape mínimo.
 */
export interface PrefacturaItem {
  lecturaId?: number;
  contratoId?: number;
  rut?: string;
  nombre?: string;
  sector?: string;
  local?: string;
  totalFacturado?: number;
  consumoPeriodo?: number;
  [key: string]: unknown;
}

export interface UseCalculoFacturaResult {
  data: PrefacturaItem[];
  filteredData: PrefacturaItem[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleRevisarCalculo: () => Promise<void>;
  setData: (data: PrefacturaItem[]) => void;
}

export function useCalculoFactura({
  periodoFormateado,
  cicloId
}: UseCalculoFacturaProps): UseCalculoFacturaResult {
  const [data, setData] = useState<PrefacturaItem[]>([]);
  const [filteredData, setFilteredData] = useState<PrefacturaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleRevisarCalculo = async (): Promise<void> => {
    if (!validarCicloYPeriodo(periodoFormateado, cicloId)) {
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
      const cicloNumero = Number.parseInt(cicloId, 10);
      const result = await operacionesService.getRevisarCalculosBuscarPrefacturas(
        cicloNumero,
        periodoFormateado
      );

      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        setData([]);
        return;
      }

      const prefacturas = Array.isArray(result.data)
        ? (result.data as PrefacturaItem[])
        : [];

      if (prefacturas.length === 0) {
        setData([]);
        toast.info(
          'No se encontraron prefacturas para el ciclo y período elegidos'
        );
        return;
      }

      setData(prefacturas);
      toast.success(`Se encontraron ${prefacturas.length} registros`);
    } catch (err) {
      if (es404(err)) {
        setError('NO_LECTURAS_CERRADAS');
        toast.success('No hay lecturas pendientes de facturar', {
          duration: 6000,
          description:
            'Todas las lecturas cerradas ya están facturadas. Para procesar nuevas facturas, cierra las lecturas pendientes y ejecuta "Preparar Cálculo".'
        });
      } else {
        const { message } = err instanceof Error
          ? { message: err.message }
          : { message: 'Error desconocido' };
        setError(message);
        toast.error(`Error: ${message}`);
      }
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

  const memoFiltered = useMemo(() => filteredData, [filteredData]);

  return {
    data,
    filteredData: memoFiltered,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    handleRevisarCalculo,
    setData
  };
}