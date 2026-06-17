import { useEffect, useState } from 'react';

import {
  type MonitorBasicData,
  monitorService
} from '~/services/monitorService';
import type { Periodo, Sector } from '~/types/monitor';
import { handleDataLoad } from './utils/data-loader';


export function useMonitorData() {
  const [data, setData] = useState<MonitorBasicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => monitorService.getBasicData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  const refreshData = async (): Promise<void> => {
    await handleDataLoad(
      () => monitorService.getBasicData(),
      setData,
      setError,
      setLoading
    );
  };

  return {
    data,
    loading,
    error,
    refreshData
  };
}


interface PeriodosAndSectoresData {
  periodos: Periodo[];
  sectores: Sector[];
  activePeriodoId: number | null;
}


export function useMonitorPeriodosAndSectores() {
  const [data, setData] = useState<PeriodosAndSectoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
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

  // Detect format: YYYY-MM-DD or DD-MM-YYYY
  if (parts[0].length === 4) {
    // Format: YYYY-MM-DD
    [year, month, day] = parts;
  } else {
    // Format: DD-MM-YYYY
    [day, month, year] = parts;
  }

  return `${year}${month}${day}`;
};


export const findActivePeriod = (periodos: Periodo[]): Periodo | null => {
  if (!periodos || periodos.length === 0) {
    return null;
  }

  const activePeriodo = periodos.find(periodo => periodo.EstadoPeriodo === 2);
  return activePeriodo || periodos[0];
};


interface ValidationResult {
  isValid: boolean;
  error?: string;
}


export const validateSearchParams = (
  sector: Sector | null,
  periodo: Periodo | null
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
  fechaInicio: string;
  fechaFin: string;
}


export const getDefaultDates = (periodo: Periodo | null): DefaultDates => {
  const today = new Date().toISOString().split('T')[0];

  return {
    fechaInicio: periodo?.FechaInicio || '',
    fechaFin: today
  };
};
