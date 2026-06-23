import { useEffect, useState } from "react";

import { operacionesService } from "~/services/operacionesService";
import type { RevisionPreciosBuscarRequest } from "~/types/operaciones";
import { extraerErrorMessage } from "./utils/error-handler";
import {
  type PriceValidationResult,
  validarPreciosConfirmados,
} from "./utils/price-validator";

interface UseValidacionPreciosProps {
  periodoFormateado: string;
  cicloId: string;
}

export interface ValidacionPreciosResult extends PriceValidationResult {
  preciosConfirmados: boolean;
  preciosConfirmadosCount: number;
  preciosPendientesCount: number;
  totalPrecios: number;
  isLoading: boolean;
  error: string | null;
  verificarPrecios: () => Promise<void>;
}

export function useValidacionPrecios({
  periodoFormateado,
  cicloId,
}: UseValidacionPreciosProps): ValidacionPreciosResult {
  const [preciosConfirmados, setPreciosConfirmados] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalValidos, setTotalValidos] = useState(0);
  const [totalConfirmados, setTotalConfirmados] = useState(0);
  const [totalPendientes, setTotalPendientes] = useState(0);

  const verificarPrecios = async (): Promise<void> => {
    if (!periodoFormateado || !cicloId) {
      setPreciosConfirmados(false);
      setTotalValidos(0);
      setTotalConfirmados(0);
      setTotalPendientes(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { mes, anio } = extraerMesYAnio(periodoFormateado);
      const result = await operacionesService.getRevisarPreciosData(mes, anio);

      if (result.error || !result.data) {
        setError(result.error || "Error al consultar precios");
        setPreciosConfirmados(false);
        return;
      }

      const precios = (result.data as RevisionPreciosBuscarRequest[]) || [];
      const resultado = validarPreciosConfirmados(precios);

      setTotalValidos(resultado.totalValidos);
      setTotalConfirmados(resultado.totalConfirmados);
      setTotalPendientes(resultado.totalPendientes);
      setPreciosConfirmados(resultado.todosConfirmados);
    } catch (err) {
      const { message } = extraerErrorMessage(err);
      setError(message);
      setPreciosConfirmados(false);
    } finally {
      setIsLoading(false);
    }
  };

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
    verificarPrecios,
  };
}

function extraerMesYAnio(periodoFormateado: string): {
  mes: string;
  anio: string;
} {
  return {
    mes: periodoFormateado.substring(0, 2),
    anio: periodoFormateado.substring(2),
  };
}
