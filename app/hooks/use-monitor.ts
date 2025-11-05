import { useEffect, useState } from 'react';

import {
  type MonitorBasicData,
  monitorService
} from '~/services/monitorService';
import type { Periodo, Sector } from '~/types/monitor';

// ✅ REFACTOR: Helper genérico para eliminar duplicación de lógica de carga
async function handleMonitorLoad<T>(
  fetchFn: () => Promise<{ data?: T | null; error?: string | null }>,
  setData: (d: T | null) => void,
  setError: (e: string | null) => void,
  setLoading: (v: boolean) => void
): Promise<void> {
  try {
    setLoading(true);
    setError(null);
    const result = await fetchFn();
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setData(result.data);
    } else {
      setError('No se pudieron cargar los datos');
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error desconocido');
  } finally {
    setLoading(false);
  }
}

export function useMonitorData() {
  const [data, setData] = useState<MonitorBasicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleMonitorLoad(
      () => monitorService.getBasicData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  const refreshData = () =>
    handleMonitorLoad(
      () => monitorService.getBasicData(),
      setData,
      setError,
      setLoading
    );

  return {
    data,
    loading,
    error,
    refreshData
  };
}

export function useMonitorPeriodosAndSectores() {
  const [data, setData] = useState<{
    periodos: any[];
    sectores: any[];
    activePeriodoId: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleMonitorLoad(
      () => monitorService.getPeriodosAndSectores(),
      setData,
      setError,
      setLoading
    );
  }, []);

  return {
    data,
    loading,
    error
  };
}

// Funciones utilitarias para formateo de fechas (sin dependencias de estado)
export const formatDateToYYYYMMDD = (dateString: string): string => {
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
};

// Función utilitaria para encontrar el período activo
export const findActivePeriod = (periodos: Periodo[]): Periodo | null => {
  if (!periodos || periodos.length === 0) return null;

  const activePeriodo = periodos.find(periodo => periodo.EstadoPeriodo === 2);

  return activePeriodo || periodos[0]; // Fallback al primero si no hay activo
};

// Función utilitaria para validar parámetros de búsqueda
export const validateSearchParams = (
  sector: Sector | null,
  periodo: Periodo | null
): { isValid: boolean; error?: string } => {
  if (!sector) {
    return { isValid: false, error: 'Por favor, seleccione un sector.' };
  }

  if (!periodo) {
    return { isValid: false, error: 'Por favor, seleccione un periodo.' };
  }

  return { isValid: true };
};

// Función utilitaria para obtener fechas por defecto basadas en el período
export const getDefaultDates = (
  periodo: Periodo | null
): {
  fechaInicio: string;
  fechaFin: string;
} => {
  const today = new Date().toISOString().split('T')[0];

  return {
    fechaInicio: periodo?.FechaInicio || '',
    fechaFin: today
  };
};
