import type { RevisionPreciosBuscarRequest } from '~/types/operaciones';

export interface PriceValidationResult {
  totalValidos: number;
  totalConfirmados: number;
  totalPendientes: number;
  todosConfirmados: boolean;
}

/**
 * Filtra precios con índice válido (mayor a cero).
 * Un índice de 0 indica que el cargo no tiene valor asignado.
 */
export function filtrarPreciosValidos(
  precios: RevisionPreciosBuscarRequest[]
): RevisionPreciosBuscarRequest[] {
  return precios.filter(p => p.indice > 0);
}

/**
 * Cuenta precios confirmados utilizando el campo booleano estaConfirmado.
 */
export function contarConfirmados(
  precios: RevisionPreciosBuscarRequest[]
): number {
  return precios.filter(p => p.estaConfirmado).length;
}

/**
 * Valida el estado global de confirmación de precios.
 * Considera confirmado únicamente si existen precios válidos y todos están confirmados.
 */
export function validarPreciosConfirmados(
  precios: RevisionPreciosBuscarRequest[]
): PriceValidationResult {
  const preciosValidos = filtrarPreciosValidos(precios);
  const totalValidos = preciosValidos.length;
  const totalConfirmados = contarConfirmados(preciosValidos);
  const totalPendientes = totalValidos - totalConfirmados;
  const todosConfirmados = totalValidos > 0 && totalPendientes === 0;

  return {
    totalValidos,
    totalConfirmados,
    totalPendientes,
    todosConfirmados
  };
}
