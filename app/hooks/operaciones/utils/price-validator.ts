/**
 * Utilidades para validación de precios
 * Centraliza la lógica de validación y conteo de precios
 */

import type { RevisarPrecioDos, RevisarPrecioUno } from '~/types/operaciones';

/**
 * Interface para el resultado de validación de precios
 */
export interface PriceValidationResult {
  totalValidos: number;
  totalConfirmados: number;
  totalPendientes: number;
  todosConfirmados: boolean;
}

/**
 * Filtra precios válidos (aquellos con índice válido)
 * Un precio es válido si tiene un índice no vacío y diferente de '0'
 *
 * @param precios - Array de precios a filtrar
 * @returns Array filtrado de precios válidos
 *
 * @example
 * const validos = filtrarPreciosValidos(precios);
 */
export function filtrarPreciosValidos<T extends { indice?: string }>(
  precios: T[]
): T[] {
  return precios.filter(p => p.indice && p.indice !== '' && p.indice !== '0');
}

/**
 * Cuenta precios confirmados en un array
 *
 * @param precios - Array de precios a contar
 * @param confirmacionField - Campo a verificar para confirmación (default: 'confirmacion')
 * @returns Número de precios confirmados
 *
 * @example
 * const confirmados = contarConfirmados(precios); // 5
 */
export function contarConfirmados<T extends { confirmacion?: string }>(
  precios: T[],
  confirmacionField: keyof T = 'confirmacion' as keyof T
): number {
  return precios.filter(
    p => (p as any)[confirmacionField] === 'Confirmado'
  ).length;
}

/**
 * Valida el estado de confirmación de precios
 *
 * @param preciosUno - Array de precios tabla uno
 * @param preciosDos - Array de precios tabla dos
 * @returns Objeto con estadísticas de validación
 *
 * @example
 * const resultado = validarPreciosConfirmados(
 *   [{ indice: '1', confirmacion: 'Confirmado' }],
 *   [{ indice: '2', confirmacion: 'Pendiente' }]
 * );
 * // { totalValidos: 2, totalConfirmados: 1, totalPendientes: 1, todosConfirmados: false }
 */
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
