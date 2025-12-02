/**
 * Export Formatters Utility
 *
 * Common formatting functions for exporting data to various formats.
 * Handles date formatting, null/undefined values, and type conversions.
 */

/**
 * Formats a date string to localized date format (es-CL)
 *
 * Handles null, undefined, and invalid dates gracefully by returning empty string.
 * This is useful when exporting dates that may have various formats or be missing.
 *
 * @param date - Date string, null, or undefined
 * @returns Formatted date string (e.g., "15/1/2024") or empty string if invalid
 *
 * @example
 * ```typescript
 * formatDateForExport('2024-01-15') // "15/1/2024"
 * formatDateForExport(null)          // ""
 * formatDateForExport(undefined)     // ""
 * formatDateForExport('invalid')     // ""
 * ```
 */
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

/**
 * Formats a number to currency format
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param currency - Currency code (default: 'CLP')
 * @returns Formatted currency string
 *
 * @example
 * ```typescript
 * formatCurrency(1500.5)      // "$1.500,50"
 * formatCurrency(100)         // "$100,00"
 * formatCurrency(100, 0)      // "$100"
 * ```
 */
export function formatCurrency(value: number, decimals: number = 2, currency: string = 'CLP'): string {
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

/**
 * Formats a number with thousands separator
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1500.5)    // "1.500,5"
 * formatNumber(100000, 2) // "100.000,00"
 * ```
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Formats percentage value
 *
 * @param value - Decimal number (0-1 range)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string with % symbol
 *
 * @example
 * ```typescript
 * formatPercentage(0.5)    // "50,00%"
 * formatPercentage(0.1234) // "12,34%"
 * formatPercentage(1)      // "100,00%"
 * ```
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  return (value * 100).toFixed(decimals).replace('.', ',') + '%';
}

/**
 * Formats boolean value to Spanish text
 *
 * @param value - Boolean to format
 * @param trueText - Custom text for true (default: 'Sí')
 * @param falseText - Custom text for false (default: 'No')
 * @returns Formatted text
 *
 * @example
 * ```typescript
 * formatBoolean(true)              // "Sí"
 * formatBoolean(false)             // "No"
 * formatBoolean(true, 'Activo', 'Inactivo')  // "Activo"
 * ```
 */
export function formatBoolean(
  value: boolean,
  trueText: string = 'Sí',
  falseText: string = 'No'
): string {
  return value ? trueText : falseText;
}

/**
 * Safely formats any value, handling null/undefined
 *
 * @param value - Value to format
 * @param fallback - Default value if input is null/undefined (default: '')
 * @returns String representation of value
 *
 * @example
 * ```typescript
 * formatValue(null)      // ""
 * formatValue(undefined) // ""
 * formatValue(123)       // "123"
 * formatValue(true)      // "true"
 * ```
 */
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

/**
 * Truncates long strings to specified length with ellipsis
 *
 * @param value - String to truncate
 * @param maxLength - Maximum length including ellipsis (default: 50)
 * @param ellipsis - Suffix for truncated text (default: '...')
 * @returns Truncated string
 *
 * @example
 * ```typescript
 * truncateString('This is a very long string', 10)  // "This is..."
 * truncateString('Short', 20)                       // "Short"
 * ```
 */
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

/**
 * Generates export filename with optional timestamp
 *
 * @param baseName - Base filename without extension
 * @param format - File format/extension (default: 'csv')
 * @param includeTimestamp - Add ISO date to filename (default: true)
 * @returns Complete filename with extension
 *
 * @example
 * ```typescript
 * generateFilename('usuarios')              // "usuarios_2024-01-15.csv"
 * generateFilename('ventas', 'xlsx')        // "ventas_2024-01-15.xlsx"
 * generateFilename('reporte', 'pdf', false) // "reporte.pdf"
 * ```
 */
export function generateFilename(
  baseName: string,
  format: string = 'csv',
  includeTimestamp: boolean = true
): string {
  const timestamp = includeTimestamp ? `_${new Date().toISOString().split('T')[0]}` : '';
  return `${baseName}${timestamp}.${format}`;
}
