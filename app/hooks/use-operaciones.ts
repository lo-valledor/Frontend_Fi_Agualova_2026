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
  PreciosCargoEnerlova,
  RevisarPrecioDos,
  RevisarPrecioUno,
  TotalesCorteReposicion,
  ValidarSectoresPendientes
} from '~/types/operaciones';

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
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await operacionesService.getPrepararLecturasData();

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
    };

    loadData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await operacionesService.getPrepararLecturasData();

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
    async (cicloFacturable: string, periodo: string) => {
      if (!cicloFacturable || !periodo) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await operacionesService.getAsignacionSectores(
          cicloFacturable,
          periodo
        );

        if (result.error) {
          setError(result.error);
          setData([]);
        } else if (result.data) {
          setData(result.data);
        } else {
          setData([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setData([]);
      } finally {
        setLoading(false);
      }
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
    tablaEnerlova: PreciosCargoEnerlova[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await operacionesService.getPreciosCargoData(mes, anio);

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
    };

    loadData();
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
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await operacionesService.getRevisarPrecioData(dia);

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
    };

    loadData();
  }, [dia]);

  const refreshPrecios = useCallback(
    async (nuevoCiclo?: string) => {
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
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await operacionesService.getCorteReposicionData();

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
    };

    loadData();
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
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await operacionesService.getCerrarLecturasData();

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
    };

    loadData();
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
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await operacionesService.getPeriodoFacturacionData();

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
    };

    loadData();
  }, []);

  return {
    data,
    loading,
    error
  };
}
