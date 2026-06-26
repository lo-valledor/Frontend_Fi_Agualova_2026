import type { MonitorPeriodos, MonitorSectores } from '~/types/monitor';

/**
 * Convierte una fecha a formato DD-MM-YYYY.
 * - Date → 'DD-MM-YYYY'.
 * - 'YYYY-MM-DD' → 'DD-MM-YYYY'.
 * - 'DD-MM-YYYY' u otro string → retorna tal cual.
 * - null/undefined/'' → ''.
 */
export function formatDateDDMMYYYY(
  date: string | Date | null | undefined
): string {
  if (!date) return '';

  if (date instanceof Date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-');
    return `${d}-${m}-${y}`;
  }

  return date;
}

/**
 * Deriva la fecha de inicio del período (primer día del mes) en formato DD-MM-YYYY
 * a partir del `value` del período (formato MMYYYY).
 * Ej: '092025' → '01-09-2025', '122025' → '01-12-2025'.
 */
export function getFirstDayOfPeriod(periodo: MonitorPeriodos | null): string {
  if (!periodo?.value) return '';

  const value = periodo.value;
  let month: string;
  let year: string;

  if (value.length >= 6) {
    month = value.slice(0, 2);
    year = value.slice(2, 6);
  } else if (value.length === 5) {
    month = `0${value.slice(0, 1)}`;
    year = value.slice(1, 5);
  } else {
    return '';
  }

  return `01-${month}-${year}`;
}

/**
 * Devuelve los últimos N períodos ordenados por `value` descendente.
 * Si el período activo (primero del array original) no está dentro de los últimos N,
 * lo antepone al resultado.
 */
export function getLastNPeriods(
  periodos: MonitorPeriodos[] | null | undefined,
  count: number
): MonitorPeriodos[] {
  if (!periodos || periodos.length === 0) return [];

  if (periodos.length <= count) return periodos;

  const lastN = [...periodos]
    .sort((a, b) => b.value.localeCompare(a.value))
    .slice(0, count);

  const active = periodos[0];
  if (active && !lastN.some(p => p.value === active.value)) {
    return [active, ...lastN];
  }

  return lastN;
}

export const formatDateToYYYYMMDD = (dateString: string): string => {
  if (!dateString) {
    return '';
  }

  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return '';
  }

  let year: string;
  let month: string;
  let day: string;

  if (parts[0].length === 4) {
    [year, month, day] = parts;
  } else {
    [day, month, year] = parts;
  }

  return `${year}${month}${day}`;
};

export const findActivePeriod = (
  periodos: MonitorPeriodos[]
): MonitorPeriodos | null => {
  if (!periodos || periodos.length === 0) {
    return null;
  }
  return periodos[0];
};

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateSearchParams = (
  sector: MonitorSectores | null,
  periodo: MonitorPeriodos | null
): ValidationResult => {
  if (!sector) {
    return {
      isValid: false,
      error: 'Por favor, seleccione un sector.'
    };
  }

  if (!periodo) {
    return {
      isValid: false,
      error: 'Por favor, seleccione un periodo.'
    };
  }

  return { isValid: true };
};

interface DefaultDates {
  /**
   * Fecha de inicio en formato DD-MM-YYYY (lo que espera la grilla del backend).
   */
  fechaInicio: string;
  /**
   * Fecha de fin en formato YYYY-MM-DD (lo que requiere <input type="date">).
   * Convertir a DD-MM-YYYY al enviar con `formatDateDDMMYYYY`.
   */
  fechaFin: string;
}

export const getDefaultDates = (
  periodo: MonitorPeriodos | null
): DefaultDates => {
  let fechaInicio = '';
  if (periodo?.fechaInicio) {
    fechaInicio = formatDateDDMMYYYY(periodo.fechaInicio);
  } else if (periodo) {
    fechaInicio = getFirstDayOfPeriod(periodo);
  }

  const today = new Date();
  const fechaFin = today.toISOString().split('T')[0];

  return {
    fechaInicio,
    fechaFin
  };
};
