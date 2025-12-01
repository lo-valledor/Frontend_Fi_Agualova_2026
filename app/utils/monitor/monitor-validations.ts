/**
 * Validation utilities for Monitor module
 * Centralized validation functions with edge case handling
 */

import type { Periodo, Sector } from '~/types/monitor';

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates search parameters for monitor lecturas
 * @param sector - Selected sector (can be null)
 * @param periodo - Selected periodo (can be null)
 * @returns Validation result with error message if invalid
 */
export function validateSearchParams(
  sector: Sector | null,
  periodo: Periodo | null
): ValidationResult {
  if (!sector) {
    return {
      isValid: false,
      error: 'Debe seleccionar un sector para realizar la búsqueda'
    };
  }

  if (!periodo) {
    return {
      isValid: false,
      error: 'Debe seleccionar un período para realizar la búsqueda'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a date range
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Validation result
 */
export function validateDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): ValidationResult {
  if (!startDate || startDate.trim() === '') {
    return {
      isValid: false,
      error: 'La fecha de inicio es requerida'
    };
  }

  if (!endDate || endDate.trim() === '') {
    return {
      isValid: false,
      error: 'La fecha de fin es requerida'
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime())) {
    return {
      isValid: false,
      error: 'La fecha de inicio no es válida'
    };
  }

  if (Number.isNaN(end.getTime())) {
    return {
      isValid: false,
      error: 'La fecha de fin no es válida'
    };
  }

  if (end < start) {
    return {
      isValid: false,
      error: 'La fecha de fin debe ser posterior a la fecha de inicio'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a meter reading value
 * @param value - Reading value to validate
 * @param allowNegative - Whether to allow negative values (default: false)
 * @returns Validation result
 */
export function validateReadingValue(
  value: number | string | null | undefined,
  allowNegative = false
): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      error: 'El valor de lectura es requerido'
    };
  }

  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return {
      isValid: false,
      error: 'El valor de lectura debe ser un número válido'
    };
  }

  if (!allowNegative && numValue < 0) {
    return {
      isValid: false,
      error: 'El valor de lectura no puede ser negativo'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates a meter serial number
 * @param serialNumber - Serial number to validate
 * @returns Validation result
 */
export function validateMeterSerialNumber(
  serialNumber: string | null | undefined
): ValidationResult {
  if (!serialNumber || serialNumber.trim() === '') {
    return {
      isValid: false,
      error: 'El número de serie es requerido'
    };
  }

  // Basic validation - you can enhance with specific format rules
  if (serialNumber.trim().length < 3) {
    return {
      isValid: false,
      error: 'El número de serie debe tener al menos 3 caracteres'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates energy value (active or reactive)
 * @param value - Energy value to validate
 * @param fieldName - Name of the field for error messages
 * @returns Validation result
 */
export function isValidEnergyValue(
  value: number | string | null | undefined,
  fieldName = 'Energía'
): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { isValid: true, error: null }; // Optional field
  }

  const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;

  if (Number.isNaN(numValue)) {
    return {
      isValid: false,
      error: `${fieldName} debe ser un número válido`
    };
  }

  if (numValue < 0) {
    return {
      isValid: false,
      error: `${fieldName} no puede ser negativo`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Validates power demand data including date and time
 * @param demand - Demand value
 * @param date - Demand date
 * @param time - Demand time
 * @param demandType - Type of demand for error messages
 * @returns Validation result
 */
export function validatePowerDemandData(
  demand: number | string | null | undefined,
  date: string | null | undefined,
  time: string | null | undefined,
  demandType = 'Demanda'
): ValidationResult {
  // If demand is provided, date and time are required
  if (demand !== null && demand !== undefined && demand !== '') {
    const numDemand =
      typeof demand === 'string' ? Number.parseFloat(demand) : demand;

    if (Number.isNaN(numDemand)) {
      return {
        isValid: false,
        error: `${demandType} debe ser un número válido`
      };
    }

    if (numDemand < 0) {
      return {
        isValid: false,
        error: `${demandType} no puede ser negativo`
      };
    }

    if (!date || date.trim() === '') {
      return {
        isValid: false,
        error: `La fecha de ${demandType.toLowerCase()} es requerida cuando se ingresa un valor`
      };
    }

    if (!time || time.trim() === '') {
      return {
        isValid: false,
        error: `La hora de ${demandType.toLowerCase()} es requerida cuando se ingresa un valor`
      };
    }

    // Validate date format
    const demandDate = new Date(date);
    if (Number.isNaN(demandDate.getTime())) {
      return {
        isValid: false,
        error: `La fecha de ${demandType.toLowerCase()} no es válida`
      };
    }
  }

  return { isValid: true, error: null };
}

/**
 * Validates consumption value
 * @param consumption - Consumption value
 * @param previousReading - Previous reading for comparison
 * @param currentReading - Current reading for comparison
 * @returns Validation result
 */
export function validateConsumption(
  consumption: number | null | undefined,
  previousReading?: number | null,
  currentReading?: number | null
): ValidationResult {
  if (consumption === null || consumption === undefined) {
    return { isValid: true, error: null }; // Can be calculated automatically
  }

  if (consumption < 0) {
    return {
      isValid: false,
      error: 'El consumo no puede ser negativo'
    };
  }

  // If we have readings, verify consumption makes sense
  if (
    previousReading !== null &&
    previousReading !== undefined &&
    currentReading !== null &&
    currentReading !== undefined
  ) {
    const calculatedConsumption = currentReading - previousReading;

    // Allow some margin for rounding differences
    if (Math.abs(consumption - calculatedConsumption) > 1) {
      return {
        isValid: false,
        error: `El consumo ingresado (${consumption}) no coincide con el calculado (${calculatedConsumption})`
      };
    }
  }

  return { isValid: true, error: null };
}
