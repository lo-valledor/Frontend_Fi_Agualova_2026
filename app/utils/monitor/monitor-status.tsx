/**
 * Status mapping and utilities for Monitor module
 * Centralized status configuration and helper functions
 */

import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  FileUp,
  Grid3X3,
  History,
  MapPin
} from 'lucide-react';

export type MeterStatus =
  | 'SINLEC' // Sin Lectura
  | 'SINCLA' // Sin Clave (Lectura Normal)
  | 'CLAINF' // Clave Informativa
  | 'CLAREL' // Clave Relevante
  | 'CLACRI' // Clave Crítica
  | 'LECCER' // Lectura Cerrada
  | 'LECIMP' // En Facturación
  | 'IMPORT'; // Lecturas Importadas

export interface MeterStatusInfo {
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  label: string;
  icon: React.ReactElement;
  severity: 0 | 1 | 2 | 3 | 4;
}

/**
 * Status configuration map
 */
const STATUS_MAP: Record<MeterStatus, MeterStatusInfo> = {
  SINLEC: {
    color: 'gray',
    bgColor: 'bg-gray-500',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-500',
    label: 'Sin Lectura',
    icon: <History className='h-3.5 w-3.5' />,
    severity: 1
  },
  SINCLA: {
    color: 'emerald',
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-500',
    label: 'Lectura Normal',
    icon: <Grid3X3 className='h-3.5 w-3.5' />,
    severity: 0
  },
  CLAINF: {
    color: 'yellow',
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-500',
    label: 'Clave Informativa',
    icon: <AlertCircle className='h-3.5 w-3.5' />,
    severity: 2
  },
  CLAREL: {
    color: 'orange',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-500',
    label: 'Clave Relevante',
    icon: <AlertTriangle className='h-3.5 w-3.5' />,
    severity: 3
  },
  CLACRI: {
    color: 'red',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    textColor: 'text-red-500',
    label: 'Clave Crítica',
    icon: <AlertCircle className='h-3.5 w-3.5' />,
    severity: 4
  },
  LECCER: {
    color: 'blue',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-500',
    label: 'Lectura Cerrada',
    icon: <MapPin className='h-3.5 w-3.5' />,
    severity: 0
  },
  LECIMP: {
    color: 'purple',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-500',
    label: 'En Facturación',
    icon: <BarChart3 className='h-3.5 w-3.5' />,
    severity: 0
  },
  IMPORT: {
    color: 'pink',
    bgColor: 'bg-pink-500',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-500',
    label: 'Lecturas Importadas',
    icon: <FileUp className='h-3.5 w-3.5' />,
    severity: 0
  }
};

/**
 * Get meter status information
 * @param claveHtml - Status code from the API
 * @returns Status information object
 */
export function getMeterStatus(
  claveHtml: string | null | undefined
): MeterStatusInfo {
  // Handle null/undefined/empty
  if (!claveHtml || claveHtml.trim() === '') {
    return STATUS_MAP.SINLEC;
  }

  const statusKey = claveHtml.toUpperCase() as MeterStatus;

  // Return status or default to SINLEC for unknown values
  return STATUS_MAP[statusKey] ?? STATUS_MAP.SINLEC;
}

/**
 * Check if a reading is imported but not validated
 * @param medidor - Meter object with reading data
 * @returns True if the reading appears to be imported
 */
export function isImportedReading(medidor: {
  consumo: number | null | undefined;
  fechaLectura: string | null | undefined;
  clave: string | null | undefined;
}): boolean {
  // Handle null/undefined values
  const hasConsumo =
    medidor.consumo !== null &&
    medidor.consumo !== undefined &&
    medidor.consumo > 0;
  const hasFechaLectura =
    medidor.fechaLectura !== null &&
    medidor.fechaLectura !== undefined &&
    medidor.fechaLectura.trim() !== '';
  const hasClave =
    medidor.clave !== null &&
    medidor.clave !== undefined &&
    medidor.clave.trim() !== '';

  // A reading is "imported" if it has consumption but missing date or key
  return hasConsumo && (!hasFechaLectura || !hasClave);
}

/**
 * Get numeric severity level for a status
 * @param claveHtml - Status code
 * @returns Severity level (0-4)
 */
export function getStatusSeverity(
  claveHtml: string | null | undefined
): 0 | 1 | 2 | 3 | 4 {
  return getMeterStatus(claveHtml).severity;
}

/**
 * Get all available status types
 * @returns Array of all status keys
 */
export function getAllStatusTypes(): MeterStatus[] {
  return Object.keys(STATUS_MAP) as MeterStatus[];
}

/**
 * Check if a status code is valid
 * @param claveHtml - Status code to check
 * @returns True if the status is recognized
 */
export function isValidStatus(claveHtml: string | null | undefined): boolean {
  if (!claveHtml) return false;
  const statusKey = claveHtml.toUpperCase() as MeterStatus;
  return statusKey in STATUS_MAP;
}

/**
 * Get status label
 * @param claveHtml - Status code
 * @returns Human-readable label
 */
export function getStatusLabel(claveHtml: string | null | undefined): string {
  return getMeterStatus(claveHtml).label;
}
