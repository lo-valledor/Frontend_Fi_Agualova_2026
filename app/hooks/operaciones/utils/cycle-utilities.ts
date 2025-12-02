/**
 * Utilidades para manejo de ciclos de facturación
 * Centraliza la lógica de transformación de ciclos del frontend al API
 */

/**
 * Convierte el formato de ciclo del frontend al formato esperado por el API
 * Frontend: '1', '2', '15', '30' o similar
 * API: '1' o '2'
 *
 * @param ciclo - ID del ciclo en formato frontend
 * @returns ID del ciclo en formato API
 *
 * @example
 * convertirCicloParaAPI('1') // '1'
 * convertirCicloParaAPI('15') // '1'
 * convertirCicloParaAPI('30') // '30'
 */
export function convertirCicloParaAPI(ciclo: string): string {
  if (ciclo === '1' || ciclo === '2') return ciclo;
  if (ciclo.includes('15')) return '1';
  return ciclo;
}

/**
 * Valida que el ciclo y período sean válidos antes de hacer llamadas API
 *
 * @param periodoFormateado - Período en formato MMYYYY
 * @param cicloId - ID del ciclo
 * @returns true si son válidos, false si no
 */
export function validarCicloYPeriodo(
  periodoFormateado: string,
  cicloId: string
): boolean {
  return !!(periodoFormateado && cicloId);
}

/**
 * Extrae mes y año del período formateado
 *
 * @param periodoFormateado - Período en formato MMYYYY
 * @returns Objeto con mes (2 dígitos) y año (4 dígitos)
 *
 * @example
 * extraerMesYAnio('012024') // { mes: '01', anio: '2024' }
 */
export function extraerMesYAnio(periodoFormateado: string): {
  mes: string;
  anio: string;
} {
  return {
    mes: periodoFormateado.substring(0, 2),
    anio: periodoFormateado.substring(2)
  };
}

/**
 * Obtiene el día del mes basado en el ciclo
 *
 * @param cicloParaAPI - Ciclo en formato API
 * @returns '15' si es ciclo 1, '30' si es ciclo 2
 */
export function obtenerDiaDelCiclo(cicloParaAPI: string): string {
  return cicloParaAPI === '1' ? '15' : '30';
}
