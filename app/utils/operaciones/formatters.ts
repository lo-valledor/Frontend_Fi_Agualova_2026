/**
 * Formateadores para datos de operaciones
 */

/**
 * Formatea un período (mes/año) en texto legible
 * @param mes
 * @param anio
 * @example formatPeriodLabel('01', '2025') => 'Enero 2025'
 */
export function formatPeriodLabel(mes: string, anio: string): string {
  const months: Record<string, string> = {
    '01': 'Enero',
    '02': 'Febrero',
    '03': 'Marzo',
    '04': 'Abril',
    '05': 'Mayo',
    '06': 'Junio',
    '07': 'Julio',
    '08': 'Agosto',
    '09': 'Septiembre',
    '10': 'Octubre',
    '11': 'Noviembre',
    '12': 'Diciembre'
  };

  const monthName = months[mes] ?? mes;
  return `${monthName} ${anio}`;
}

/**
 * Formatea un precio con separadores de miles y decimales
 * @param price
 * @example formatPrice(1234.56) => '$ 1.234,56'
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) {
    return '$ 0,00';
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
    .format(price)
    .replace('CLP', '$');
}

/**
 * Formatea un número con separadores de miles
 * @param value
 * @param decimals
 * @example formatNumber(1234.56) => '1.234,56'
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formatea un ciclo de facturación
 * @param ciclo
 * @example formatCycle('01') => 'Ciclo 01'
 */
export function formatCycle(ciclo: string | null | undefined): string {
  if (!ciclo) return 'Sin ciclo';
  return `Ciclo ${ciclo}`;
}

/**
 * Formatea una fecha en formato legible
 * @param date
 * @example formatDate('2025-01-15') => '15/01/2025'
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'Sin fecha';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CL');
  } catch {
    return 'Fecha inválida';
  }
}
