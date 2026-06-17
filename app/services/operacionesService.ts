import api from '~/lib/api';
import type {
  Anio,
  CalculoPrefacturaCargoResponse,
  CalculoPrefacturaDetalle,
  Ciclo,
  ConsultarAsignacionSectores,
  ConsultarMantenedorRevisionCorte,
  ConsultarSectores,
  EstadoProceso,
  IdentificadorProceso,
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

export interface OperacionesServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class OperacionesService {
  async getPeriodoAbierto(): Promise<
    OperacionesServiceResponse<PeriodoAbierto[]>
  > {
    try {
      const response = await api.get('/ConsultarPeriodoAbierto');
      return {
        data: response.data as PeriodoAbierto[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getCiclosFacturacion(): Promise<OperacionesServiceResponse<Ciclo[]>> {
    try {
      const response = await api.get('/ciclos-facturacion-activos');
      return {
        data: response.data as Ciclo[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPrepararLecturasData(): Promise<
    OperacionesServiceResponse<{
      periodoAbierto: PeriodoAbierto[];
      lecturasPendientes: ValidarSectoresPendientes;
      sectores: ConsultarSectores[];
      opcionesPreparar: OpcionesPrepararLecturas[];
    }>
  > {
    try {
      const [periodoAbierto, lecturasPendientes, sectores, opcionesPreparar] =
        await Promise.all([
          api.get('/ConsultarPeriodoAbierto'),
          api.get('/validar-lecturas-pendientes'),
          api.get('/consultar-sectores'),
          api.get('/opciones-preparar-lecturas', { params: { control: '1' } })
        ]);

      return {
        data: {
          periodoAbierto: periodoAbierto.data as PeriodoAbierto[],
          lecturasPendientes:
            lecturasPendientes.data as ValidarSectoresPendientes,
          sectores: sectores.data as ConsultarSectores[],
          opcionesPreparar: opcionesPreparar.data as OpcionesPrepararLecturas[]
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getAsignacionSectores(
    cicloFacturable: string,
    periodo: string
  ): Promise<OperacionesServiceResponse<ConsultarAsignacionSectores[]>> {
    try {
      const params = new URLSearchParams();
      params.append('cicloFacturable', cicloFacturable);
      params.append('periodo', periodo);

      const response = await api.get('/consultar-asignacion-sectores', {
        params
      });

      return {
        data: response.data as ConsultarAsignacionSectores[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPreciosCargoData(
    mes: string,
    anio: string
  ): Promise<
    OperacionesServiceResponse<{
      tablaEnel: PreciosCargoEnel[];
      tablaAgualova: PreciosCargoAgualova[];
    }>
  > {
    try {
      const [resTablaEnel, resTablaAgualova] = await Promise.all([
        api.get(`/consulta-precio-pago?mes=${mes}&año=${anio}`),
        api.get(`/consulta-precio-pago-tabla`)
      ]);

      return {
        data: {
          tablaEnel: resTablaEnel.data as PreciosCargoEnel[],
          tablaAgualova: resTablaAgualova.data as PreciosCargoAgualova[]
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getRevisarPrecioData(dia: string = '15'): Promise<
    OperacionesServiceResponse<{
      dataPeriodoAbierto: PeriodoAbierto[];
      dataConsultarPreciosUno: RevisarPrecioUno[];
      dataConsultarPreciosDos: RevisarPrecioDos[];
      ciclosFacturacion: Array<{
        diaFacturacion: string;
        descripcion: string;
      }>;
    }>
  > {
    try {
      // Carga paralela de datos básicos
      const [periodoAbierto, ciclosFacturacion] = await Promise.all([
        api.get('/ConsultarPeriodoAbierto'),
        api.get('/ciclos-facturacion-activos')
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
            ciclosFacturacion: []
          },
          error: 'No hay periodo abierto'
        };
      }

      // Validar si el ciclo es válido para el mes actual
      const mes = dataPeriodoAbierto[0].mes;
      const anio = dataPeriodoAbierto[0].anio;

      // Cargar datos de precios
      const [resConsultarPreciosUno, resConsultarPreciosDos] =
        await Promise.all([
          api.get(`/ConsultarPreciosUno?mes=${mes}&año=${anio}`),
          api.get(`/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${dia}`)
        ]);

      return {
        data: {
          dataPeriodoAbierto,
          dataConsultarPreciosUno:
            resConsultarPreciosUno.data as RevisarPrecioUno[],
          dataConsultarPreciosDos:
            resConsultarPreciosDos.data as RevisarPrecioDos[],
          ciclosFacturacion: dataCiclosFacturacion
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getCorteReposicionData(): Promise<
    OperacionesServiceResponse<{
      totalesData: TotalesCorteReposicion[];
      mantenedorCorteData: ConsultarMantenedorRevisionCorte[];
    }>
  > {
    try {
      const [res, resCorte] = await Promise.all([
        api.get('consulta-registros-revision?acometida=0'),
        api.get('consulta-mantenedor-revision-corte')
      ]);

      return {
        data: {
          totalesData: res.data as TotalesCorteReposicion[],
          mantenedorCorteData:
            resCorte.data as ConsultarMantenedorRevisionCorte[]
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getCerrarLecturasData(): Promise<
    OperacionesServiceResponse<{
      periodoAbierto: PeriodoAbierto[];
      ciclosFacturacion: Ciclo[];
    }>
  > {
    try {
      const [periodoAbierto, ciclosFacturacion] = await Promise.all([
        api.get('/ConsultarPeriodoAbierto'),
        api.get('/ciclos-facturacion-activos')
      ]);

      return {
        data: {
          periodoAbierto: periodoAbierto.data as PeriodoAbierto[],
          ciclosFacturacion: ciclosFacturacion.data as Ciclo[]
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPeriodoFacturacionData(): Promise<
    OperacionesServiceResponse<{
      years: Anio[];
      periodos: Periodos[];
    }>
  > {
    try {
      const [resYears, resPeriodos] = await Promise.all([
        api.get('/consulta-año'),
        api.get('/consulta-periodo')
      ]);

      return {
        data: {
          years: resYears.data as Anio[],
          periodos: resPeriodos.data as Periodos[]
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPreciosPorCiclo(
    mes: number,
    anio: number,
    dia: string
  ): Promise<
    OperacionesServiceResponse<{
      preciosUno: RevisarPrecioUno[];
      preciosDos: RevisarPrecioDos[];
    }>
  > {
    try {
      const [resConsultarPreciosUno, resConsultarPreciosDos] =
        await Promise.all([
          api.get(`/ConsultarPreciosUno?mes=${mes}&año=${anio}`),
          api.get(`/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${dia}`)
        ]);

      return {
        data: {
          preciosUno: resConsultarPreciosUno.data as RevisarPrecioUno[],
          preciosDos: resConsultarPreciosDos.data as RevisarPrecioDos[]
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // ============ MÉTODOS PARA FLUJO DE CÁLCULO DE FACTURACIÓN ============

  async lanzarCalculoFacturacion(
    cicloFacturacion: number,
    periodoFacturable: string
  ): Promise<OperacionesServiceResponse<any>> {
    try {
      const response = await api.post('/lanzar-calculo-facturacion', {
        cicloFacturacion,
        periodoFacturable
      });
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async obtenerIdentificadorProceso(
    cicloId: string,
    periodoId: string,
    modo: number = 1
  ): Promise<OperacionesServiceResponse<IdentificadorProceso[]>> {
    try {
      const response = await api.get('/identificador-proceso', {
        params: { cicloId, periodoId, modo }
      });
      return {
        data: response.data as IdentificadorProceso[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async verificarEstadoProceso(
    procesoId: string
  ): Promise<OperacionesServiceResponse<EstadoProceso[]>> {
    try {
      const response = await api.get('/estado-proceso', {
        params: { procesoId }
      });
      return {
        data: response.data as EstadoProceso[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async consultarEncabezadoPrefactura(
    cicloId: string,
    periodo: string
  ): Promise<OperacionesServiceResponse<CalculoPrefacturaDetalle[]>> {
    try {
      const response = await api.get('/calculo-prefactura-encabezado', {
        params: { cicloId, periodo }
      });
      return {
        data: response.data as CalculoPrefacturaDetalle[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async consultarCargosPrefactura(
    cicloId: string,
    periodo: string
  ): Promise<OperacionesServiceResponse<CalculoPrefacturaCargoResponse[]>> {
    try {
      const response = await api.get('/calculo-prefactura-cargos', {
        params: { cicloId, periodo }
      });
      return {
        data: response.data as CalculoPrefacturaCargoResponse[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async generarDetalleFactura(
    lecturaId: number,
    periodoId: string
  ): Promise<OperacionesServiceResponse<any>> {
    try {
      const response = await api.post('/generar-detalle-factura', {
        lecturaId,
        periodoId
      });
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async verificarEstadoCierreLecturas(
    cicloFacturable: string,
    periodo: string
  ): Promise<OperacionesServiceResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      params.append('cicloFacturable', cicloFacturable);
      params.append('periodo', periodo);

      const response = await api.get('/estado-cierre-lecturas', {
        params
      });

      return {
        data: response.data as any[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async obtenerIdentificadorProcesoActual(
    cicloId: string,
    periodoId: string,
    modo: number = 1
  ): Promise<OperacionesServiceResponse<IdentificadorProceso>> {
    try {
      const response = await api.get('/identificador-proceso', {
        params: { cicloId, periodoId, modo }
      });

      return {
        data: response.data as IdentificadorProceso,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const operacionesService = new OperacionesService();
