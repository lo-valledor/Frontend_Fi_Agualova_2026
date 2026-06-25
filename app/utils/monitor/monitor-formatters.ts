export { formatSafeDate } from '~/utils/date-formatter';

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

export function formatConsumption(
  consumption: number | null | undefined,
  unit = 'm³',
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

export function formatPowerDemand(
  demand: number | string | null | undefined,
  unit = 'm³',
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
