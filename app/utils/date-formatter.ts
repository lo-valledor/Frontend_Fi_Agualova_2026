import { format } from 'date-fns';


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
