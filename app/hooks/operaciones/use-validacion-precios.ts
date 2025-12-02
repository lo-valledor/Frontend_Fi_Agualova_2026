/**
 * Hook para validar que todos los precios estén confirmados antes de facturar
 * Obtiene precios de dos tablas y verifica su estado de confirmación
 *
 * @module operaciones/use-validacion-precios
 */

import { useEffect, useState } from 'react';

import api from '~/lib/api';
import type { RevisarPrecioDos, RevisarPrecioUno } from '~/types/operaciones';
import {
  convertirCicloParaAPI,
  extraerMesYAnio,
  obtenerDiaDelCiclo,
  validarCicloYPeriodo
} from './utils/cycle-utilities';
import { extraerErrorMessage } from './utils/error-handler';
import {
  validarPreciosConfirmados,
  type PriceValidationResult
} from './utils/price-validator';

/**
 * Props del hook de validación de precios
 */
interface UseValidacionPreciosProps {
  periodoFormateado: string;
  cicloId: string;
}

/**
 * Resultado del hook de validación de precios
 */
export interface ValidacionPreciosResult extends PriceValidationResult {
  preciosConfirmados: boolean;
  preciosConfirmadosCount: number;
  preciosPendientesCount: number;
  totalPrecios: number;
  isLoading: boolean;
  error: string | null;
  verificarPrecios: () => Promise<void>;
}

/**
 * Hook para validar precios de facturación
 * Obtiene precios de dos tablas ENEL y verifica si están confirmados
 *
 * Aplica SOLID: SRP (solo valida precios), DRY (usa utilities compartidas)
 *
 * @param periodoFormateado - Período en formato MMYYYY
 * @param periodoFormateado.periodoFormateado
 * @param cicloId - ID del ciclo de facturación
 * @param periodoFormateado.cicloId
 * @returns Estado de validación y función para verificar precios
 *
 * @example
 * const { preciosConfirmados, isLoading, verificarPrecios } = useValidacionPrecios({
 *   periodoFormateado: '012024',
 *   cicloId: '1'
 * });
 *
 * // Verificar precios manualmente
 * await verificarPrecios();
 */
export function useValidacionPrecios({
  periodoFormateado,
  cicloId
}: UseValidacionPreciosProps): ValidacionPreciosResult {
  const [preciosConfirmados, setPreciosConfirmados] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalValidos, setTotalValidos] = useState(0);
  const [totalConfirmados, setTotalConfirmados] = useState(0);
  const [totalPendientes, setTotalPendientes] = useState(0);

  /**
   * Verifica precios consultando dos endpoints
   * Filtra solo precios con índice válido y cuenta confirmados
   */
  const verificarPrecios = async (): Promise<void> => {
    // Early return si faltan parámetros
    if (!validarCicloYPeriodo(periodoFormateado, cicloId)) {
      setPreciosConfirmados(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cicloParaAPI = convertirCicloParaAPI(cicloId);
      const { mes, anio } = extraerMesYAnio(periodoFormateado);
      const dia = obtenerDiaDelCiclo(cicloParaAPI);

      // Obtener precios de ambas tablas en paralelo
      const [responsePreciosUno, responsePreciosDos] = await Promise.all([
        api.get<RevisarPrecioUno[]>(
          `/ConsultarPreciosUno?mes=${mes}&año=${anio}`
        ),
        api.get<RevisarPrecioDos[]>(
          `/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${dia}`
        )
      ]);

      const preciosUno = (responsePreciosUno.data as RevisarPrecioUno[]) || [];
      const preciosDos = (responsePreciosDos.data as RevisarPrecioDos[]) || [];

      // Validar precios
      const resultado = validarPreciosConfirmados(preciosUno, preciosDos);
      actualizarEstadoPrecios(resultado);
    } catch (err) {
      const { message } = extraerErrorMessage(err);
      setError(message);
      setPreciosConfirmados(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualiza el estado con los resultados de validación
   * @param resultado
   */
  const actualizarEstadoPrecios = (resultado: PriceValidationResult): void => {
    setTotalValidos(resultado.totalValidos);
    setTotalConfirmados(resultado.totalConfirmados);
    setTotalPendientes(resultado.totalPendientes);
    setPreciosConfirmados(resultado.todosConfirmados);
  };

  // Verificar automáticamente cuando cambian los parámetros
  useEffect(() => {
    verificarPrecios();
  }, [periodoFormateado, cicloId]);

  return {
    preciosConfirmados,
    preciosConfirmadosCount: totalConfirmados,
    preciosPendientesCount: totalPendientes,
    totalPrecios: totalValidos,
    isLoading,
    error,
    totalValidos,
    totalConfirmados,
    totalPendientes,
    todosConfirmados: preciosConfirmados,
    verificarPrecios
  };
}
