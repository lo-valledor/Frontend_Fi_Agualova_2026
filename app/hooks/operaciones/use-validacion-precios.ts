import { useEffect, useState } from 'react';

import api from '~/lib/api';
import type { RevisarPrecioDos, RevisarPrecioUno } from '~/types/operaciones';

interface UseValidacionPreciosProps {
  periodoFormateado: string;
  cicloId: string;
}

interface ValidacionPreciosResult {
  preciosConfirmados: boolean;
  isLoading: boolean;
  error: string | null;
  totalPrecios: number;
  preciosConfirmadosCount: number;
  preciosPendientesCount: number;
  verificarPrecios: () => Promise<void>;
}

/**
 * Hook para validar si los precios están confirmados antes de permitir
 * el cálculo de facturación.
 * 
 * Verifica tanto los precios ENEL (tabla uno) como los precios Enerlova (tabla dos).
 * Solo retorna true si TODOS los precios con índice válido están confirmados.
 */
export function useValidacionPrecios({
  periodoFormateado,
  cicloId
}: UseValidacionPreciosProps): ValidacionPreciosResult {
  const [preciosConfirmados, setPreciosConfirmados] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPrecios, setTotalPrecios] = useState(0);
  const [preciosConfirmadosCount, setPreciosConfirmadosCount] = useState(0);
  const [preciosPendientesCount, setPreciosPendientesCount] = useState(0);

  const obtenerCicloParaAPI = (ciclo: string): string => {
    if (ciclo === '1' || ciclo === '2') return ciclo;
    if (ciclo.includes('15')) return '1';
    return ciclo;
  };

  const verificarPrecios = async () => {
    if (!periodoFormateado || !cicloId) {
      setPreciosConfirmados(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const mes = periodoFormateado.substring(0, 2);
      const anio = periodoFormateado.substring(2);

      // Obtener precios ENEL (tabla uno)
      const [responsePreciosUno, responsePreciosDos] = await Promise.all([
        api.get<RevisarPrecioUno[]>(`/ConsultarPreciosUno?mes=${mes}&año=${anio}`),
        api.get<RevisarPrecioDos[]>(
          `/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${cicloParaAPI === '1' ? '15' : '30'}`
        )
      ]);

      const preciosUno = responsePreciosUno.data || [];
      const preciosDos = responsePreciosDos.data || [];

      // Filtrar solo precios con índice válido (los que deben ser confirmados)
      const preciosUnoValidos = preciosUno.filter(
        p => p.indice && p.indice !== '' && p.indice !== '0'
      );
      const preciosDosValidos = preciosDos.filter(
        p => p.indice && p.indice !== '' && p.indice !== '0'
      );

      // Contar confirmados
      const preciosUnoConfirmados = preciosUnoValidos.filter(
        p => p.confirmacion === 'Confirmado'
      ).length;
      const preciosDosConfirmados = preciosDosValidos.filter(
        p => p.confirmacion === 'Confirmado'
      ).length;

      const totalValidos = preciosUnoValidos.length + preciosDosValidos.length;
      const totalConfirmados = preciosUnoConfirmados + preciosDosConfirmados;
      const totalPendientes = totalValidos - totalConfirmados;

      setTotalPrecios(totalValidos);
      setPreciosConfirmadosCount(totalConfirmados);
      setPreciosPendientesCount(totalPendientes);

      // Solo si TODOS los precios válidos están confirmados
      const todosConfirmados = totalValidos > 0 && totalPendientes === 0;
      setPreciosConfirmados(todosConfirmados);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.mensaje ||
        err.message ||
        'Error al verificar precios';
      setError(errorMessage);
      setPreciosConfirmados(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar automáticamente cuando cambian los parámetros
  useEffect(() => {
    verificarPrecios();
  }, [periodoFormateado, cicloId]);

  return {
    preciosConfirmados,
    isLoading,
    error,
    totalPrecios,
    preciosConfirmadosCount,
    preciosPendientesCount,
    verificarPrecios
  };
}

