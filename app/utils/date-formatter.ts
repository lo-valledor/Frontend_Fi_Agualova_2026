/**
 * Date/Time Formatting Utilities
 *
 * Unified date and time formatting functions with locale support (es-CL).
 * Handles various date formats and provides safe formatting with fallbacks.
 */

import { format } from 'date-fns';

/**
 * Formats date string to dd-MM-yyyy format
 *
 * @param dateString - Date string to format (ISO or other formats)
 * @param fallback - Fallback value for null/invalid dates (default: '-')
 * @returns Formatted date string or fallback
 *
 * @example
 * ```typescript
 * formatToDate('2024-01-15')    // "15-01-2024"
 * formatToDate(null)            // "-"
 * formatToDate('invalid', 'N/A') // "N/A"
 * ```
 */
export function formatToDate(dateString: string | null | undefined, fallback = '-'): string {
  if (!dateString) return fallback;

  try {
    return format(new Date(dateString), 'dd-MM-yyyy');
  } catch (error) {
    // Try to extract date if it's an ISO string
    console.error('Error formatting date:', error);
    return String(dateString).split('T')[0] || fallback;
  }
}

/**
 * Formats time string to HH:mm:ss format
 *
 * @param dateString - Date/time string to extract time from
 * @param fallback - Fallback value for null/invalid times (default: '-')
 * @returns Formatted time string or fallback
 *
 * @example
 * ```typescript
 * formatToTime('2024-01-15T14:30:45')  // "14:30:45"
 * formatToTime(null)                   // "-"
 * ```
 */
export function formatToTime(dateString: string | null | undefined, fallback = '-'): string {
  if (!dateString) return fallback;

  try {
    return format(new Date(dateString), 'HH:mm:ss');
  } catch (_error) {
    // Try to extract time if it's an ISO string
    console.error('Error formatting time:', _error);
    return String(dateString).split('T')[1]?.split('.')[0] || fallback;
  }
}

/**
 * Formats date string to YYYYMMDD format (no separators)
 *
 * @param dateString - Date string in dd-MM-yyyy or YYYY-MM-DD format
 * @param fallback - Fallback value for invalid dates (default: '')
 * @returns Formatted date string (YYYYMMDD) or fallback
 *
 * @example
 * ```typescript
 * formatToYYYYMMDD('2024-01-15')   // "20240115"
 * formatToYYYYMMDD('15-01-2024')   // "20240115"
 * formatToYYYYMMDD('invalid')      // ""
 * ```
 */
export function formatToYYYYMMDD(dateString: string | null | undefined, fallback = ''): string {
  if (!dateString) return fallback;

  // Split date into parts
  const parts = dateString.split('-');
  if (parts.length !== 3) return fallback;

  let year, month, day;

  // Detect date format
  if (parts[0].length === 4) {
    // Format YYYY-MM-DD
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    // Format DD-MM-YYYY
    day = parts[0];
    month = parts[1];
    year = parts[2];
  }

  return `${year}${month}${day}`;
}

/**
 * Safely formats date with locale awareness (es-CL)
 *
 * Formats date to "dd/M/yyyy, HH:mm" format with graceful fallback handling.
 *
 * @param date - Date string or null/undefined
 * @param fallback - Fallback text for null/invalid dates (default: 'Sin registro')
 * @returns Formatted date string or fallback
 *
 * @example
 * ```typescript
 * formatSafeDate('2024-01-15T14:30:00')  // "15/1/2024, 14:30"
 * formatSafeDate(null)                   // "Sin registro"
 * formatSafeDate('invalid', 'N/A')       // "N/A"
 * ```
 */
export function formatSafeDate(
  date: string | null | undefined,
  fallback = 'Sin registro'
): string {
  if (!date || date.trim() === '') {
    return fallback;
  }

  try {
    const dateObj = new Date(date);

    if (Number.isNaN(dateObj.getTime())) {
      return fallback;
    }

    // Use locale-aware formatting (es-CL)
    return dateObj.toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false
    });
  } catch {
    return fallback;
  }
}

/**
 * Formats date for export operations in es-CL locale
 *
 * Formats to "dd/M/yyyy" format, safe for export to CSV/Excel.
 *
 * @param date - Date string or null/undefined
 * @param fallback - Fallback value for null/invalid dates (default: '')
 * @returns Formatted date string or fallback
 *
 * @example
 * ```typescript
 * formatDateForExport('2024-01-15')  // "15/1/2024"
 * formatDateForExport(null)          // ""
 * ```
 */
export function formatDateForExport(date: string | null | undefined, fallback = ''): string {
  if (!date) return fallback;

  try {
    const dateObj = new Date(date);
    // Verify date is valid
    if (Number.isNaN(dateObj.getTime())) {
      return fallback;
    }
    return dateObj.toLocaleDateString('es-CL');
  } catch {
    return fallback;
  }
}
