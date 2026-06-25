import type { MonitorPeriodos, MonitorSectores } from '~/types/monitor';

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function validateSearchParams(
  sector: MonitorSectores | null,
  periodo: MonitorPeriodos | null
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

export type ReadingAnomalyKind = 'zero-consumption' | 'wraparound' | null;

export interface ReadingAnomaly {
  /**
   * Tipo de anomalía detectada, o `null` si no hay anomalía.
   * - `'zero-consumption'`: la lectura actual es igual a la anterior (consumo = 0).
   * - `'wraparound'`: la lectura actual es menor que la anterior, lo que sugiere
   *   que el medidor dio la vuelta (superó el límite de dígitos).
   */
  kind: ReadingAnomalyKind;
  /**
   * Diferencia calculada entre lectura actual y anterior.
   * Negativa cuando hay wraparound.
   */
  delta: number;
}

/**
 * Detecta anomalías al comparar la lectura actual contra la anterior.
 *
 * Casos cubiertos:
 * - Si la lectura actual es **menor** que la anterior, el medidor probablemente
 *   dio la vuelta (superó su capacidad de dígitos). El delta se devuelve
 *   negativo para señalar el wraparound.
 * - Si la lectura actual es **igual** a la anterior, el consumo del período
 *   es 0 (sin consumo). Puede ser legítimo (ej. medidor sin uso) pero merece
 *   aviso.
 *
 * Retorna `{ kind: null, delta: 0 }` cuando no hay anomalía o los valores
 * no son numéricos.
 */
export function detectReadingAnomaly(
  previousReading: string | number | null | undefined,
  currentReading: string | number | null | undefined
): ReadingAnomaly {
  const prev =
    previousReading === null || previousReading === undefined
      ? Number.NaN
      : Number.parseFloat(String(previousReading));
  const curr =
    currentReading === null || currentReading === undefined
      ? Number.NaN
      : Number.parseFloat(String(currentReading));

  if (Number.isNaN(prev) || Number.isNaN(curr)) {
    return { kind: null, delta: 0 };
  }

  const delta = curr - prev;

  if (delta < 0) {
    return { kind: 'wraparound', delta };
  }

  if (delta === 0) {
    return { kind: 'zero-consumption', delta: 0 };
  }

  return { kind: null, delta };
}
