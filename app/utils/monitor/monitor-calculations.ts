/**
 * Calculation utilities for Monitor module
 * Statistical calculations and aggregations with edge case handling
 */

import type { Fila, Medidor, NichoBusqueda } from '~/types/monitor';
import { getMeterStatus } from './monitor-status';

export interface StatsData {
  total: number;
  critical: number;
  warning: number;
  info: number;
  normal: number;
  sinlec: number;
  imported: number;
}

/**
 * Calculate statistics for a single nicho
 * @param nicho - Nicho object with filas and medidores
 * @returns Statistics object
 */
export function calculateNichoStats(
  nicho: NichoBusqueda | null | undefined
): StatsData {
  const defaultStats: StatsData = {
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    normal: 0,
    sinlec: 0,
    imported: 0
  };

  // Handle null/undefined nicho
  if (!nicho || !Array.isArray(nicho.filas)) {
    return defaultStats;
  }

  // Use reduce to calculate all stats in one pass
  return nicho.filas.reduce((nichoAcc, fila) => {
    if (!fila || !Array.isArray(fila.medidores)) {
      return nichoAcc;
    }

    return fila.medidores.reduce((acc, medidor) => {
      if (!medidor) return acc;

      acc.total++;

      const status = getMeterStatus(medidor.claveHtml);

      // Check if it's an imported reading
      const hasConsumo =
        medidor.consumo !== null &&
        medidor.consumo !== undefined &&
        medidor.consumo > 0;
      const hasFechaLectura =
        medidor.fechaLectura !== null && medidor.fechaLectura !== undefined;
      const hasClave = medidor.clave !== null && medidor.clave !== undefined;

      if (hasConsumo && (!hasFechaLectura || !hasClave)) {
        acc.imported++;
      }

      // Count by severity
      switch (status.severity) {
        case 4:
          acc.critical++;
          break;
        case 3:
          acc.warning++;
          break;
        case 2:
          acc.info++;
          break;
        case 1:
          acc.sinlec++;
          break;
        default:
          acc.normal++;
      }

      return acc;
    }, nichoAcc);
  }, defaultStats);
}

/**
 * Calculate total statistics across all nichos
 * @param nichos - Array of nichos
 * @returns Aggregated statistics
 */
export function calculateTotalStats(
  nichos: NichoBusqueda[] | null | undefined
): StatsData {
  const defaultStats: StatsData = {
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    normal: 0,
    sinlec: 0,
    imported: 0
  };

  // Handle null/undefined/empty array
  if (!nichos || !Array.isArray(nichos) || nichos.length === 0) {
    return defaultStats;
  }

  // Use reduce to aggregate stats from all nichos
  return nichos.reduce((acc, nicho) => {
    const stats = calculateNichoStats(nicho);

    return {
      total: acc.total + stats.total,
      critical: acc.critical + stats.critical,
      warning: acc.warning + stats.warning,
      info: acc.info + stats.info,
      normal: acc.normal + stats.normal,
      sinlec: acc.sinlec + stats.sinlec,
      imported: acc.imported + stats.imported
    };
  }, defaultStats);
}

/**
 * Calculate percentage with safe division
 * @param value - Numerator
 * @param total - Denominator
 * @param decimals - Number of decimal places (default: 1)
 * @returns Percentage string or "0.0" for division by zero
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals = 1
): string {
  if (total === 0 || !Number.isFinite(value) || !Number.isFinite(total)) {
    return '0.0';
  }

  const percentage = (value / total) * 100;
  return percentage.toFixed(decimals);
}

/**
 * Calculate consumption from current and previous readings
 * @param currentReading - Current meter reading
 * @param previousReading - Previous meter reading
 * @param multiplier - Meter constant multiplier (default: 1)
 * @returns Calculated consumption or 0 for invalid inputs
 */
export function calculateConsumption(
  currentReading: number | null | undefined,
  previousReading: number | null | undefined,
  multiplier = 1
): number {
  // Handle null/undefined values
  if (
    currentReading === null ||
    currentReading === undefined ||
    previousReading === null ||
    previousReading === undefined
  ) {
    return 0;
  }

  // Validate multiplier
  const safeMultiplier =
    Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;

  // Calculate consumption
  const consumption = (currentReading - previousReading) * safeMultiplier;

  // Return 0 for negative consumption (possible meter replacement)
  return consumption >= 0 ? consumption : 0;
}

/**
 * Group meters by status
 * @param medidores - Array of meters
 * @returns Object mapping status to array of meters
 */
export function aggregateMetersByStatus(
  medidores: Medidor[] | null | undefined
): Record<string, Medidor[]> {
  const defaultGrouping: Record<string, Medidor[]> = {};

  // Handle null/undefined/empty array
  if (!medidores || !Array.isArray(medidores) || medidores.length === 0) {
    return defaultGrouping;
  }

  // Use reduce to group meters by status
  return medidores.reduce((acc, medidor) => {
    if (!medidor) return acc;

    const status = getMeterStatus(medidor.claveHtml);
    const statusKey = status.label;

    if (!acc[statusKey]) {
      acc[statusKey] = [];
    }

    acc[statusKey].push(medidor);
    return acc;
  }, defaultGrouping);
}

/**
 * Get all meters from a nicho flattened into a single array
 * @param nicho - Nicho object
 * @returns Flat array of all meters
 */
export function getAllMetersFromNicho(
  nicho: NichoBusqueda | null | undefined
): Medidor[] {
  // Handle null/undefined nicho
  if (!nicho || !Array.isArray(nicho.filas)) {
    return [];
  }

  // Use flatMap to flatten the structure
  return nicho.filas.flatMap(fila => {
    if (!fila || !Array.isArray(fila.medidores)) {
      return [];
    }
    return fila.medidores.filter(m => m !== null && m !== undefined);
  });
}

/**
 * Get problem meters (severity > 2) from a nicho
 * @param nicho - Nicho object
 * @returns Array of meters with problems
 */
export function getProblemMeters(
  nicho: NichoBusqueda | null | undefined
): Medidor[] {
  const allMeters = getAllMetersFromNicho(nicho);

  return allMeters.filter(medidor => {
    const status = getMeterStatus(medidor.claveHtml);
    return status.severity > 2;
  });
}

/**
 * Count meters by severity level in a fila
 * @param fila - Fila object
 * @returns Count of meters at each severity level
 */
export function countMetersBySeverity(
  fila: Fila | null | undefined
): Record<number, number> {
  const defaultCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

  if (!fila || !Array.isArray(fila.medidores)) {
    return defaultCounts;
  }

  return fila.medidores.reduce((acc, medidor) => {
    if (!medidor) return acc;

    const status = getMeterStatus(medidor.claveHtml);
    acc[status.severity]++;

    return acc;
  }, defaultCounts);
}
