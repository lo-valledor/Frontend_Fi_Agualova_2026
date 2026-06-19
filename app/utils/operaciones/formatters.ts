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

export function formatCycle(ciclo: string | null | undefined): string {
  if (!ciclo) return 'Sin ciclo';
  return `Ciclo ${ciclo}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'Sin fecha';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-CL');
  } catch {
    return 'Fecha inválida';
  }
}
