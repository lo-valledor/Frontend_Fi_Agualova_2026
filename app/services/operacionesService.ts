import api from '~/lib/api';
import type {
  PeriodoAbierto,
  ValidarSectoresPendientes,
  ConsultarSectores,
  OpcionesPrepararLecturas,
  ConsultarAsignacionSectores,
  PreciosCargoEnel,
  PreciosCargoEnerlova,
  RevisarPrecioUno,
  RevisarPrecioDos,
  Ciclo,
  Anio,
  Periodos,
  ConsultarMantenedorRevisionCorte,
  TotalesCorteReposicion,
} from '~/types/operaciones';

export interface OperacionesServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class OperacionesService {
  /**
   * Obtiene datos básicos de período abierto
   */
  async getPeriodoAbierto(): Promise<OperacionesServiceResponse<PeriodoAbierto[]>> {
    try {
      const response = await api.get('/ConsultarPeriodoAbierto');
      return {
        data: response.data as PeriodoAbierto[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene ciclos de facturación activos
   */
  async getCiclosFacturacion(): Promise<OperacionesServiceResponse<Ciclo[]>> {
    try {
      const response = await api.get('/ciclos-facturacion-activos');
      return {
        data: response.data as Ciclo[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene datos para preparar lecturas
   */
  async getPrepararLecturasData(): Promise<OperacionesServiceResponse<{
    periodoAbierto: PeriodoAbierto[];
    lecturasPendientes: ValidarSectoresPendientes;
    sectores: ConsultarSectores[];
    opcionesPreparar: OpcionesPrepararLecturas[];
  }>> {
    try {
      const [periodoAbierto, lecturasPendientes, sectores, opcionesPreparar] =
        await Promise.all([
          api.get('/ConsultarPeriodoAbierto'),
          api.get('/validar-lecturas-pendientes'),
          api.get('/consultar-sectores'),
          api.get('/opciones-preparar-lecturas', { params: { control: '1' } }),
        ]);

      return {
        data: {
          periodoAbierto: periodoAbierto.data as PeriodoAbierto[],
          lecturasPendientes: lecturasPendientes.data as ValidarSectoresPendientes,
          sectores: sectores.data as ConsultarSectores[],
          opcionesPreparar: opcionesPreparar.data as OpcionesPrepararLecturas[],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene asignación de sectores
   */
  async getAsignacionSectores(
    cicloFacturable: string,
    periodo: string,
  ): Promise<OperacionesServiceResponse<ConsultarAsignacionSectores[]>> {
    try {
      const params = new URLSearchParams();
      params.append('cicloFacturable', cicloFacturable);
      params.append('periodo', periodo);

      const response = await api.get('/consultar-asignacion-sectores', {
        params,
      });

      return {
        data: response.data as ConsultarAsignacionSectores[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene datos de precios de cargo
   */
  async getPreciosCargoData(
    mes: string,
    anio: string,
  ): Promise<OperacionesServiceResponse<{
    tablaEnel: PreciosCargoEnel[];
    tablaEnerlova: PreciosCargoEnerlova[];
  }>> {
    try {
      const [resTablaEnel, resTablaEnerlova] = await Promise.all([
        api.get(`/consulta-precio-pago?mes=${mes}&año=${anio}`),
        api.get(`/consulta-precio-pago-tabla`),
      ]);

      return {
        data: {
          tablaEnel: resTablaEnel.data as PreciosCargoEnel[],
          tablaEnerlova: resTablaEnerlova.data as PreciosCargoEnerlova[],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene datos para revisar precio
   */
  async getRevisarPrecioData(
    dia: string = '15',
  ): Promise<OperacionesServiceResponse<{
    dataPeriodoAbierto: PeriodoAbierto[];
    dataConsultarPreciosUno: RevisarPrecioUno[];
    dataConsultarPreciosDos: RevisarPrecioDos[];
    ciclosFacturacion: Array<{
      diaFacturacion: string;
      descripcion: string;
    }>;
  }>> {
    try {
      // Carga paralela de datos básicos
      const [periodoAbierto, ciclosFacturacion] = await Promise.all([
        api.get('/ConsultarPeriodoAbierto'),
        api.get('/ciclos-facturacion-activos'),
      ]);

      const dataPeriodoAbierto = periodoAbierto.data as PeriodoAbierto[];
      const dataCiclosFacturacion = ciclosFacturacion.data as Array<{
        diaFacturacion: string;
        descripcion: string;
      }>;

      if (!dataPeriodoAbierto || dataPeriodoAbierto.length === 0) {
        return {
          data: {
            dataPeriodoAbierto: [],
            dataConsultarPreciosUno: [],
            dataConsultarPreciosDos: [],
            ciclosFacturacion: [],
          },
          error: 'No hay periodo abierto',
        };
      }

      // Validar si el ciclo es válido para el mes actual
      const mes = dataPeriodoAbierto[0].mes;
      const anio = dataPeriodoAbierto[0].anio;

      // Cargar datos de precios
      const [resConsultarPreciosUno, resConsultarPreciosDos] = await Promise.all([
        api.get(`/ConsultarPreciosUno?mes=${mes}&año=${anio}`),
        api.get(`/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${dia}`),
      ]);

      return {
        data: {
          dataPeriodoAbierto,
          dataConsultarPreciosUno: resConsultarPreciosUno.data as RevisarPrecioUno[],
          dataConsultarPreciosDos: resConsultarPreciosDos.data as RevisarPrecioDos[],
          ciclosFacturacion: dataCiclosFacturacion,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene datos de corte y reposición
   */
  async getCorteReposicionData(): Promise<OperacionesServiceResponse<{
    totalesData: TotalesCorteReposicion[];
    mantenedorCorteData: ConsultarMantenedorRevisionCorte[];
  }>> {
    try {
      const [res, resCorte] = await Promise.all([
        api.get('consulta-registros-revision?acometida=0'),
        api.get('consulta-mantenedor-revision-corte'),
      ]);

      return {
        data: {
          totalesData: res.data as TotalesCorteReposicion[],
          mantenedorCorteData: resCorte.data as ConsultarMantenedorRevisionCorte[],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene datos para cerrar lecturas
   */
  async getCerrarLecturasData(): Promise<OperacionesServiceResponse<{
    periodoAbierto: PeriodoAbierto[];
    ciclosFacturacion: Ciclo[];
  }>> {
    try {
      const [periodoAbierto, ciclosFacturacion] = await Promise.all([
        api.get('/ConsultarPeriodoAbierto'),
        api.get('/ciclos-facturacion-activos'),
      ]);

      return {
        data: {
          periodoAbierto: periodoAbierto.data as PeriodoAbierto[],
          ciclosFacturacion: ciclosFacturacion.data as Ciclo[],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene datos para período de facturación
   */
  async getPeriodoFacturacionData(): Promise<OperacionesServiceResponse<{
    years: Anio[];
    periodos: Periodos[];
  }>> {
    try {
      const [resYears, resPeriodos] = await Promise.all([
        api.get('/consulta-año'),
        api.get('/consulta-periodo'),
      ]);

      return {
        data: {
          years: resYears.data as Anio[],
          periodos: resPeriodos.data as Periodos[],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene precios específicos para un ciclo
   */
  async getPreciosPorCiclo(
    mes: number,
    anio: number,
    dia: string,
  ): Promise<OperacionesServiceResponse<{
    preciosUno: RevisarPrecioUno[];
    preciosDos: RevisarPrecioDos[];
  }>> {
    try {
      const [resConsultarPreciosUno, resConsultarPreciosDos] = await Promise.all([
        api.get(`/ConsultarPreciosUno?mes=${mes}&año=${anio}`),
        api.get(`/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${dia}`),
      ]);

      return {
        data: {
          preciosUno: resConsultarPreciosUno.data as RevisarPrecioUno[],
          preciosDos: resConsultarPreciosDos.data as RevisarPrecioDos[],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}

export const operacionesService = new OperacionesService();
