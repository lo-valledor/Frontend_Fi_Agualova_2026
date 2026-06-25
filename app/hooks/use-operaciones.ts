import { useEffect, useState } from 'react';
import { operacionesService } from '~/services/operacionesService';
import type { Anio, Periodos } from '~/types/operaciones';
import { handleDataLoad } from './utils/data-loader';

type PeriodoAbierto = {
  id: string;
  descripcion: string;
  mes: number;
  anio: number;
};

export function usePeriodoFacturacion() {
  const [data, setData] = useState<{
    years: Anio[];
    periodos: Periodos[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getPeriodoFacturacionPageData(),
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

export function usePeriodoAbierto() {
  const [periodoAbierto, setPeriodoAbierto] = useState<PeriodoAbierto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      async () => {
        const result = await operacionesService.getPeriodoAbierto();

        if (result.error || !result.data) {
          return result;
        }

        return {
          data: result.data.map(periodo => {
            const digits = periodo.id.replace(/\D/g, '');
            const mes = Number(digits.slice(0, 2)) || 0;
            const anio = Number(digits.slice(-4)) || 0;

            return {
              ...periodo,
              mes,
              anio
            };
          }),
          error: null
        };
      },
      result => setPeriodoAbierto((result as PeriodoAbierto[]) || []),
      setError,
      setLoading
    );
  }, []);

  return {
    periodoAbierto,
    loading,
    error
  };
}
