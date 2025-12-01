/**
 * Formatting utilities for Monitor module
 * Consistent data formatting with null safety
 */

/**
 * Safely format a date with fallback for invalid dates
 * @param date - Date string or null
 * @param formatString - Date format (not used currently, for future enhancement)
 * @param fallback - Fallback text for null/invalid dates
 * @returns Formatted date string or fallback
 */
export function formatSafeDate(
  date: string | null | undefined,
  formatString?: string,
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

    // Use locale-aware formatting
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
 * Format meter reading value with appropriate decimals
 * @param value - Reading value
 * @param decimals - Number of decimal places (default: 0)
 * @param fallback - Fallback for null values
 * @returns Formatted reading string
 */
export function formatMeterReading(
  value: number | string | null | undefined,
  decimals = 0,
  fallback = '-'
): string {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return fallback;
  }

  return numValue.toFixed(decimals);
}

/**
 * Format consumption value with units
 * @param consumption - Consumption value
 * @param unit - Unit to append (default: 'kWh')
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback for null values
 * @returns Formatted consumption string
 */
export function formatConsumption(
  consumption: number | null | undefined,
  unit = 'kWh',
  decimals = 2,
  fallback = '0'
): string {
  if (consumption === null || consumption === undefined) {
    return `${fallback} ${unit}`;
  }

  if (!Number.isFinite(consumption)) {
    return `${fallback} ${unit}`;
  }

  return `${consumption.toFixed(decimals)} ${unit}`;
}

/**
 * Format energy value (active or reactive)
 * @param value - Energy value
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback for null values
 * @returns Formatted energy string
 */
export function formatEnergyValue(
  value: number | string | null | undefined,
  decimals = 2,
  fallback = '0.00'
): string {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(numValue) || !Number.isFinite(numValue)) {
    return fallback;
  }

  return numValue.toFixed(decimals);
}

/**
 * Format power demand value
 * @param demand - Demand value
 * @param unit - Unit to append (default: 'kW')
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback for null values
 * @returns Formatted demand string
 */
export function formatPowerDemand(
  demand: number | string | null | undefined,
  unit = 'kW',
  decimals = 2,
  fallback = '-'
): string {
  if (demand === null || demand === undefined || demand === '') {
    return fallback;
  }

  const numDemand =
    typeof demand === 'string' ? Number.parseFloat(demand) : demand;

  if (Number.isNaN(numDemand) || !Number.isFinite(numDemand)) {
    return fallback;
  }

  return `${numDemand.toFixed(decimals)} ${unit}`;
}

/**
 * Format percentage value
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @param includeSymbol - Whether to include % symbol (default: true)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals = 1,
  includeSymbol = true
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return includeSymbol ? '0.0%' : '0.0';
  }

  const formatted = value.toFixed(decimals);
  return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Format serial number with consistent casing
 * @param serialNumber - Serial number
 * @param uppercase - Whether to convert to uppercase (default: true)
 * @param fallback - Fallback for null values
 * @returns Formatted serial number
 */
export function formatSerialNumber(
  serialNumber: string | null | undefined,
  uppercase = true,
  fallback = 'N/A'
): string {
  if (!serialNumber || serialNumber.trim() === '') {
    return fallback;
  }

  const trimmed = serialNumber.trim();
  return uppercase ? trimmed.toUpperCase() : trimmed;
}

/**
 * Format time value (HH:MM)
 * @param time - Time string
 * @param fallback - Fallback for null values
 * @returns Formatted time string
 */
export function formatTime(
  time: string | null | undefined,
  fallback = '--:--'
): string {
  if (!time || time.trim() === '') {
    return fallback;
  }

  // Basic validation for HH:MM format
  const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  if (!timePattern.test(time.trim())) {
    return fallback;
  }

  return time.trim();
}
