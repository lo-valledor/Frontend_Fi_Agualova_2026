/**
 * Utilidades para combinar datos de prefactura
 * Centraliza la lógica de combinación de encabezados con cargos
 */

import type {
  CalculoPrefacturaCargoResponse,
  CalculoPrefacturaCompleto,
  CalculoPrefacturaDetalle
} from '~/types/operaciones';

/**
 * Combina encabezados de prefactura con sus cargos detallados
 *
 * @param encabezados - Array de encabezados de prefactura
 * @param cargosData - Array de respuestas de cargos con contrato ID
 * @returns Array de datos combinados (encabezado + cargos + total)
 *
 * @example
 * const datos = combinarPrefactura(encabezados, cargos);
 * // Retorna:
 * // [
 * //   {
 * //     ...encabezado,
 * //     cargos: [...],
 * //     totalFacturado: 1500.50
 * //   }
 * // ]
 */
export function combinarPrefactura(
  encabezados: CalculoPrefacturaDetalle[],
  cargosData: CalculoPrefacturaCargoResponse[]
): CalculoPrefacturaCompleto[] {
  return encabezados.map(encabezado => {
    const cargosContrato = cargosData.find(
      c => c.contratoId === encabezado.contratoId
    );

    const totalFacturado =
      cargosContrato?.cargos.reduce((sum, cargo) => sum + cargo.subtotal, 0) ||
      0;

    return {
      ...encabezado,
      cargos: cargosContrato?.cargos || [],
      totalFacturado
    };
  });
}

/**
 * Calcula el total facturado de un array de datos combinados
 *
 * @param datosCompletos - Array de datos combinados
 * @returns Total facturado sumado de todos los registros
 */
export function calcularTotalFacturado(
  datosCompletos: CalculoPrefacturaCompleto[]
): number {
  return datosCompletos.reduce((sum, item) => sum + item.totalFacturado, 0);
}

/**
 * Valida que los datos combinados sean válidos
 *
 * @param encabezados - Encabezados obtenidos
 * @param cargos - Cargos obtenidos
 * @returns true si ambos arrays están presentes y válidos
 */
export function validarDatosCombinados(
  encabezados: CalculoPrefacturaDetalle[] | undefined,
  cargos: CalculoPrefacturaCargoResponse[] | undefined
): boolean {
  return Array.isArray(encabezados) && Array.isArray(cargos);
}
