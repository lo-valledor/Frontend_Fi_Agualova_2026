import { format } from 'date-fns';

/**
 * Formatea una fecha a formato DD-MM-YYYY
 */
export function formatToDate(dateString: string | null): string {
  if (!dateString) return '-';

  try {
    return format(new Date(dateString), 'dd-MM-yyyy');
  } catch (error) {
    // Intentar extraer la fecha si es un string en formato ISO
    // eslint-disable-next-line no-console
    console.error('Error al formatear la fecha:', error);
    return String(dateString).split('T')[0] || '-';
  }
}

/**
 * Formatea una fecha a formato HH:mm:ss
 */
export function formatToTime(dateString: string | null): string {
  if (!dateString) return '-';

  try {
    return format(new Date(dateString), 'HH:mm:ss');
  } catch (error) {
    // Intentar extraer la hora si es un string en formato ISO
    // eslint-disable-next-line no-console
    console.error('Error al formatear la hora:', error);
    return String(dateString).split('T')[1]?.split('.')[0] || '-';
  }
}

/**
 * Formatea una fecha al formato YYYYMMDD (usado en las consultas a la API)
 */
export function formatToYYYYMMDD(dateString: string): string {
  if (!dateString) return '';

  // Dividir la fecha en partes
  const parts = dateString.split('-');
  if (parts.length !== 3) return '';

  let year, month, day;

  // Detectar el formato de la fecha
  if (parts[0].length === 4) {
    // Formato YYYY-MM-DD
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    // Formato DD-MM-YYYY
    day = parts[0];
    month = parts[1];
    year = parts[2];
  }

  return `${year}${month}${day}`;
}
