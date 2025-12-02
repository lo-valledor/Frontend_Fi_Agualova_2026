/**
 * Hook para obtener y gestionar datos de cálculos de prefactura
 * Obtiene encabezados y cargos de prefactura, luego los combina
 *
 * @module operaciones/use-calculo-factura
 */

import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import api from '~/lib/api';
import type {
  CalculoPrefacturaCargoResponse,
  CalculoPrefacturaCompleto,
  CalculoPrefacturaDetalle
} from '~/types/operaciones';
import { convertirCicloParaAPI } from './utils/cycle-utilities';
import { combinarPrefactura } from './utils/data-combiner';
import { extraerErrorMessage, es404 } from './utils/error-handler';

/**
 * Props del hook de cálculo de factura
 */
interface UseCalculoFacturaProps {
  periodoFormateado: string;
  cicloId: string;
}

/**
 * Resultado del hook de cálculo de factura
 */
export interface UseCalculoFacturaResult {
  data: CalculoPrefacturaCompleto[];
  filteredData: CalculoPrefacturaCompleto[];
  isLoading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleRevisarCalculo: () => Promise<void>;
  setData: (data: CalculoPrefacturaCompleto[]) => void;
}

/**
 * Hook para obtener y filtrar datos de cálculos de factura
 *
 * Aplica SOLID: SRP (solo obtiene datos), DRY (usa utilities para combinación y ciclo)
 *
 * @param periodoFormateado - Período en formato MMYYYY
 * @param periodoFormateado.periodoFormateado
 * @param cicloId - ID del ciclo de facturación
 * @param periodoFormateado.cicloId
 * @returns Datos de prefacturas, estado de carga y funciones de filtrado
 *
 * @example
 * const {
 *   data,
 *   filteredData,
 *   isLoading,
 *   searchTerm,
 *   setSearchTerm,
 *   handleRevisarCalculo
 * } = useCalculoFactura({
 *   periodoFormateado: '012024',
 *   cicloId: '1'
 * });
 */
export function useCalculoFactura({
  periodoFormateado,
  cicloId
}: UseCalculoFacturaProps): UseCalculoFacturaResult {
  const [data, setData] = useState<CalculoPrefacturaCompleto[]>([]);
  const [filteredData, setFilteredData] = useState<CalculoPrefacturaCompleto[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  /**
   * Obtiene y procesa los datos de prefactura
   * Realiza dos llamadas API y combina los resultados
   */
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
        cicloId: cicloParaAPI,
        periodo: periodoFormateado
      };

      // Obtener encabezados
      const encabezadoResponse = await api.get(
        '/calculo-prefactura-encabezado',
        { params: requestParams }
      );

      const encabezados = encabezadoResponse.data as CalculoPrefacturaDetalle[];

      // Early return si no hay encabezados
      if (!Array.isArray(encabezados) || encabezados.length === 0) {
        setData([]);
        toast.info(
          'No se encontraron prefacturas para el ciclo y periodo elegidos'
        );
        return;
      }

      // Obtener cargos
      const cargosResponse = await api.get('/calculo-prefactura-cargos', {
        params: requestParams
      });

      const cargosData =
        cargosResponse.data as CalculoPrefacturaCargoResponse[];

      // Combinar datos
      const datosCombinados = combinarPrefactura(encabezados, cargosData);

      setData(datosCombinados);
      toast.success(`Se encontraron ${datosCombinados.length} registros`);
    } catch (err) {
      // Caso especial: 404 significa que no hay lecturas cerradas
      if (es404(err)) {
        setError('NO_LECTURAS_CERRADAS');
        toast.success(
          '✓ No hay lecturas pendientes de facturar',
          {
            duration: 6000,
            description:
              'Todas las lecturas cerradas ya están facturadas. Para procesar nuevas facturas, cierra las lecturas pendientes y ejecuta "Preparar Cálculo".',
            icon: '✓'
          }
        );
      } else {
        const { message } = extraerErrorMessage(err);
        setError(message);
        toast.error(`Error: ${message}`);
      }

      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtra datos según el término de búsqueda
   * Busca en todos los campos del objeto
   */
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
