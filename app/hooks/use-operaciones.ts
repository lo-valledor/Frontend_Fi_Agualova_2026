import { useCallback, useEffect, useState } from 'react';

import { operacionesService } from '~/services/operacionesService';
import type {
  Anio,
  Ciclo,
  ConsultarAsignacionSectores,
  ConsultarMantenedorRevisionCorte,
  ConsultarSectores,
  OpcionesPrepararLecturas,
  PeriodoAbierto,
  Periodos,
  PreciosCargoEnel,
  PreciosCargoAgualova,
  RevisarPrecioDos,
  RevisarPrecioUno,
  TotalesCorteReposicion,
  ValidarSectoresPendientes
} from '~/types/operaciones';
import { handleDataLoad } from './utils/data-loader';


export function usePrepararLecturasData() {
  const [data, setData] = useState<{
    periodoAbierto: PeriodoAbierto[];
    lecturasPendientes: ValidarSectoresPendientes | null;
    sectores: ConsultarSectores[];
    opcionesPreparar: OpcionesPrepararLecturas[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getPrepararLecturasData(),
      setData,
      setError,
      setLoading
    );
  }, []);

  const refreshData = async (): Promise<void> => {
    await handleDataLoad(
      () => operacionesService.getPrepararLecturasData(),
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


export function useAsignacionSectores() {
  const [data, setData] = useState<ConsultarAsignacionSectores[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAsignacionSectores = useCallback(
    async (cicloFacturable: string, periodo: string): Promise<void> => {
      // Early return if parameters are missing
      if (!cicloFacturable || !periodo) {
        return;
      }

      await handleDataLoad(
        () =>
          operacionesService.getAsignacionSectores(cicloFacturable, periodo),
        result => setData(result || []),
        setError,
        setLoading
      );
    },
    []
  );

  return {
    data,
    loading,
    error,
    loadAsignacionSectores
  };
}


export function usePreciosCargo(mes: string, anio: string) {
  const [data, setData] = useState<{
    tablaEnel: PreciosCargoEnel[];
    tablaAgualova: PreciosCargoAgualova[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getPreciosCargoData(mes, anio),
      setData,
      setError,
      setLoading
    );
  }, [mes, anio]);

  return {
    data,
    loading,
    error
  };
}


export function useRevisarPrecio(dia: string = '15') {
  const [data, setData] = useState<{
    dataPeriodoAbierto: PeriodoAbierto[];
    dataConsultarPreciosUno: RevisarPrecioUno[];
    dataConsultarPreciosDos: RevisarPrecioDos[];
    ciclosFacturacion: Array<{
      diaFacturacion: string;
      descripcion: string;
    }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getRevisarPrecioData(dia),
      setData,
      setError,
      setLoading
    );
  }, [dia]);

  const refreshPrecios = useCallback(
    async (nuevoCiclo?: string): Promise<void> => {
      // Early return if no data loaded yet
      if (!data?.dataPeriodoAbierto || data.dataPeriodoAbierto.length === 0) {
        return;
      }

      setLoading(true);
      try {
        const mes = data.dataPeriodoAbierto[0].mes;
        const anio = data.dataPeriodoAbierto[0].anio;
        const ciclo = nuevoCiclo || dia;

        const result = await operacionesService.getPreciosPorCiclo(
          mes,
          anio,
          ciclo
        );

        if (result.error || !result.data) {
          setError(result.error || 'Error al cargar precios');
        } else {
          setData(prev =>
            prev
              ? {
                  ...prev,
                  dataConsultarPreciosUno: result.data?.preciosUno || [],
                  dataConsultarPreciosDos: result.data?.preciosDos || []
                }
              : null
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    },
    [data, dia]
  );

  return {
    data,
    loading,
    error,
    refreshPrecios
  };
}


export function useCorteReposicion() {
  const [data, setData] = useState<{
    totalesData: TotalesCorteReposicion[];
    mantenedorCorteData: ConsultarMantenedorRevisionCorte[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getCorteReposicionData(),
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


export function useCerrarLecturas() {
  const [data, setData] = useState<{
    periodoAbierto: PeriodoAbierto[];
    ciclosFacturacion: Ciclo[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getCerrarLecturasData(),
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


export function usePeriodoFacturacion() {
  const [data, setData] = useState<{
    years: Anio[];
    periodos: Periodos[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleDataLoad(
      () => operacionesService.getPeriodoFacturacionData(),
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
      () => operacionesService.getPeriodoAbierto(),
      result => setPeriodoAbierto(result || []),
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
