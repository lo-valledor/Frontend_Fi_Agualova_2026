import { operacionesService } from '~/services/operacionesService';
import type { RevisionPreciosBuscarRequest } from '~/types/operaciones';

export interface ProcessConfirmacionesResult {
  exitosas: number;
  fallidas: number;
  shouldStop: boolean;
}

/**
 * Filtra precios pendientes (no confirmados y con índice válido) a partir de
 * los códigos seleccionados.
 */
export function filterPendingConfirmations(
  data: RevisionPreciosBuscarRequest[],
  selectedCodigosCargo: number[]
): RevisionPreciosBuscarRequest[] {
  return data.filter(
    item =>
      selectedCodigosCargo.includes(item.codigoCargo) &&
      item.indice > 0 &&
      !item.estaConfirmado
  );
}

/**
 * Confirma los precios seleccionados con un único llamado al servicio.
 * Si todos están confirmados, retorna exitosas=N; si ninguno, fallidas=N.
 */
export async function processConfirmations(
  preciosPendientes: RevisionPreciosBuscarRequest[],
  passwordConfirmacion: string
): Promise<ProcessConfirmacionesResult> {
  if (preciosPendientes.length === 0) {
    return { exitosas: 0, fallidas: 0, shouldStop: false };
  }

  const codigosCargos = preciosPendientes.map(p => p.codigoCargo);

  const result = await operacionesService.postConfirmarRevisionPrecios({
    codigosCargos,
    passwordConfirmacion
  });

  if (result.error) {
    return { exitosas: 0, fallidas: codigosCargos.length, shouldStop: false };
  }

  return {
    exitosas: codigosCargos.length,
    fallidas: 0,
    shouldStop: false
  };
}
