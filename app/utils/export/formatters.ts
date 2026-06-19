export function formatDateForExport(date: string | null | undefined): string {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    // Verify date is valid
    if (Number.isNaN(dateObj.getTime())) {
      return '';
    }
    return dateObj.toLocaleDateString('es-CL');
  } catch {
    return '';
  }
}

export function formatCurrency(
  value: number,
  decimals: number = 2,
  currency: string = 'CLP'
): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 0): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  return (value * 100).toFixed(decimals).replace('.', ',') + '%';
}

export function formatBoolean(
  value: boolean,
  trueText: string = 'Sí',
  falseText: string = 'No'
): string {
  return value ? trueText : falseText;
}

export function formatValue(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean') {
    return formatBoolean(value);
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return String(value);
}

export function truncateString(
  value: string,
  maxLength: number = 50,
  ellipsis: string = '...'
): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const maxContentLength = maxLength - ellipsis.length;

  if (value.length <= maxLength) {
    return value;
  }

  return value.substring(0, maxContentLength) + ellipsis;
}

export function generateFilename(
  baseName: string,
  format: string = 'csv',
  includeTimestamp: boolean = true
): string {
  const timestamp = includeTimestamp
    ? `_${new Date().toISOString().split('T')[0]}`
    : '';
  return `${baseName}${timestamp}.${format}`;
}
