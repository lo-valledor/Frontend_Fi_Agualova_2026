import type { RevisarPrecioDos, RevisarPrecioUno } from '~/types/operaciones';

export interface PriceValidationResult {
  totalValidos: number;
  totalConfirmados: number;
  totalPendientes: number;
  todosConfirmados: boolean;
}

export function filtrarPreciosValidos<T extends { indice?: string }>(
  precios: T[]
): T[] {
  return precios.filter(p => p.indice && p.indice !== '' && p.indice !== '0');
}

export function contarConfirmados<T extends { confirmacion?: string }>(
  precios: T[],
  confirmacionField: keyof T = 'confirmacion' as keyof T
): number {
  return precios.filter(p => (p as any)[confirmacionField] === 'Confirmado')
    .length;
}

export function validarPreciosConfirmados(
  preciosUno: RevisarPrecioUno[],
  preciosDos: RevisarPrecioDos[]
): PriceValidationResult {
  // Filtrar solo precios con índice válido
  const preciosUnoValidos = filtrarPreciosValidos(preciosUno);
  const preciosDosValidos = filtrarPreciosValidos(preciosDos);

  // Contar confirmados
  const preciosUnoConfirmados = contarConfirmados(preciosUnoValidos);
  const preciosDosConfirmados = contarConfirmados(preciosDosValidos);

  const totalValidos = preciosUnoValidos.length + preciosDosValidos.length;
  const totalConfirmados = preciosUnoConfirmados + preciosDosConfirmados;
  const totalPendientes = totalValidos - totalConfirmados;

  // Solo si TODOS los precios válidos están confirmados
  const todosConfirmados = totalValidos > 0 && totalPendientes === 0;

  return {
    totalValidos,
    totalConfirmados,
    totalPendientes,
    todosConfirmados
  };
}
