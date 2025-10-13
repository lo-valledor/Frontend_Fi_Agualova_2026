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
  PreciosCargoEnerlova,
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
  /**
   * Obtiene el período de facturación actualmente abierto
   *
   * Consulta el sistema para determinar qué período está disponible
   * para registro de lecturas y operaciones de facturación.
   *
   * @returns Promise con array de períodos abiertos o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getPeriodoAbierto();
   * if (data && data.length > 0) {
   *   console.log(`Período activo: ${data[0].mes}/${data[0].anio}`);
   * }
   * ```
   */
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

  /**
   * Obtiene lista de ciclos de facturación activos
   *
   * Retorna todos los ciclos configurados y habilitados para
   * procesamiento de facturación en el sistema.
   *
   * @returns Promise con array de ciclos activos o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getCiclosFacturacion();
   * // data: [{ cicloId: 1, descripcion: 'Ciclo 01', diaFacturacion: '15' }, ...]
   * ```
   */
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

  /**
   * Obtiene datos consolidados para preparar lecturas de medidores
   *
   * Carga en paralelo: período abierto, validación de lecturas pendientes,
   * sectores disponibles y opciones de preparación. Usado en la pantalla
   * de preparación inicial de lecturas.
   *
   * @returns Promise con objeto conteniendo periodo, sectores, opciones y validaciones, o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getPrepararLecturasData();
   * if (data) {
   *   console.log(`Sectores disponibles: ${data.sectores.length}`);
   *   console.log(`Lecturas pendientes: ${data.lecturasPendientes.cantidad}`);
   * }
   * ```
   */
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

  /**
   * Obtiene la asignación de sectores para un ciclo y período específicos
   *
   * Consulta qué sectores están asignados para lectura en un ciclo
   * de facturación y período determinado.
   *
   * @param cicloFacturable - ID del ciclo de facturación
   * @param periodo - Período de facturación (formato: YYYYMM)
   * @returns Promise con array de asignaciones de sectores o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getAsignacionSectores('1', '202401');
   * ```
   */
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

  /**
   * Obtiene tablas de precios de cargo ENEL y Enerlova
   *
   * Carga en paralelo las dos tablas de precios necesarias para
   * la gestión de cargos: precios ENEL y precios Enerlova.
   *
   * @param mes - Mes numérico (1-12)
   * @param anio - Año (formato: YYYY)
   * @returns Promise con objeto conteniendo ambas tablas de precios o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getPreciosCargoData('01', '2024');
   * if (data) {
   *   console.log(`Precios ENEL: ${data.tablaEnel.length}`);
   *   console.log(`Precios Enerlova: ${data.tablaEnerlova.length}`);
   * }
   * ```
   */
  async getPreciosCargoData(
    mes: string,
    anio: string
  ): Promise<
    OperacionesServiceResponse<{
      tablaEnel: PreciosCargoEnel[];
      tablaEnerlova: PreciosCargoEnerlova[];
    }>
  > {
    try {
      const [resTablaEnel, resTablaEnerlova] = await Promise.all([
        api.get(`/consulta-precio-pago?mes=${mes}&año=${anio}`),
        api.get(`/consulta-precio-pago-tabla`)
      ]);

      return {
        data: {
          tablaEnel: resTablaEnel.data as PreciosCargoEnel[],
          tablaEnerlova: resTablaEnerlova.data as PreciosCargoEnerlova[]
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

  /**
   * Obtiene datos consolidados para revisión de precios de facturación
   *
   * Carga período abierto, ciclos de facturación y dos conjuntos de
   * precios (tabla 1 y tabla 2) para revisión y validación antes de facturar.
   * Valida existencia de período abierto y ciclo válido para el mes.
   *
   * @param dia - Día de facturación para consulta de precios (por defecto '15')
   * @returns Promise con objeto conteniendo período, precios y ciclos, o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getRevisarPrecioData('15');
   * if (data) {
   *   console.log(`Precios tipo 1: ${data.dataConsultarPreciosUno.length}`);
   *   console.log(`Precios tipo 2: ${data.dataConsultarPreciosDos.length}`);
   * }
   * ```
   */
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

  /**
   * Obtiene datos de corte y reposición de suministros
   *
   * Carga totales de cortes/reposiciones y el mantenedor de revisión
   * de cortes para gestión operativa.
   *
   * @returns Promise con objeto conteniendo totales y mantenedor de cortes, o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getCorteReposicionData();
   * if (data) {
   *   console.log(`Cortes pendientes: ${data.totalesData.length}`);
   *   console.log(`Registros mantenedor: ${data.mantenedorCorteData.length}`);
   * }
   * ```
   */
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

  /**
   * Obtiene datos necesarios para cerrar período de lecturas
   *
   * Carga período abierto y ciclos de facturación activos, utilizados
   * para validar y ejecutar el cierre de lecturas del período.
   *
   * @returns Promise con objeto conteniendo período abierto y ciclos, o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getCerrarLecturasData();
   * if (data) {
   *   console.log(`Período: ${data.periodoAbierto[0].mes}/${data.periodoAbierto[0].anio}`);
   *   console.log(`Ciclos disponibles: ${data.ciclosFacturacion.length}`);
   * }
   * ```
   */
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

  /**
   * Obtiene catálogos de años y períodos disponibles para facturación
   *
   * Carga listas de años y períodos configurados en el sistema,
   * utilizados en selectores de pantallas de facturación.
   *
   * @returns Promise con objeto conteniendo arrays de años y períodos, o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getPeriodoFacturacionData();
   * if (data) {
   *   console.log(`Años disponibles: ${data.years.map(y => y.año).join(', ')}`);
   *   console.log(`Períodos: ${data.periodos.length}`);
   * }
   * ```
   */
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

  /**
   * Obtiene precios específicos para un ciclo de facturación
   *
   * Consulta los dos conjuntos de precios (tipo 1 y tipo 2) configurados
   * para un mes, año y día de facturación específicos.
   *
   * @param mes - Mes numérico (1-12)
   * @param anio - Año (formato: YYYY)
   * @param dia - Día de facturación del ciclo
   * @returns Promise con objeto conteniendo precios tipo 1 y tipo 2, o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.getPreciosPorCiclo(1, 2024, '15');
   * if (data) {
   *   console.log(`Precios 1: ${data.preciosUno.length}`);
   *   console.log(`Precios 2: ${data.preciosDos.length}`);
   * }
   * ```
   */
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

  /**
   * Lanza el proceso de cálculo de facturación (Paso 1 del flujo)
   *
   * Inicia el proceso asíncrono de cálculo de facturas para un ciclo
   * y período específicos. Este es el paso inicial del flujo de facturación.
   *
   * @param cicloFacturacion - ID numérico del ciclo de facturación
   * @param periodoFacturable - Período en formato YYYYMM (ej: '202401')
   * @returns Promise con respuesta del servidor o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.lanzarCalculoFacturacion(1, '202401');
   * ```
   */
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

  /**
   * Obtiene el identificador del proceso de facturación (Paso 2 del flujo)
   *
   * Consulta el ID del proceso asíncrono lanzado en el paso 1. Este ID
   * se utiliza para hacer seguimiento del estado del cálculo.
   *
   * @param cicloId - ID del ciclo de facturación
   * @param periodoId - ID del período de facturación
   * @param modo - Modo de consulta (por defecto 1)
   * @returns Promise con array de identificadores de proceso o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.obtenerIdentificadorProceso('1', '202401', 1);
   * if (data && data.length > 0) {
   *   const procesoId = data[0].procesoId;
   * }
   * ```
   */
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

  /**
   * Verifica el estado del proceso de facturación (Paso 3 del flujo)
   *
   * Consulta si el proceso de cálculo ha finalizado. Debe polling hasta
   * que el proceso complete (estado 'COMPLETADO' o 'ERROR').
   *
   * @param procesoId - ID del proceso obtenido en paso 2
   * @returns Promise con array de estados del proceso o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.verificarEstadoProceso('12345');
   * if (data && data[0].estado === 'COMPLETADO') {
   *   // Proceder al paso 4
   * }
   * ```
   */
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

  /**
   * Consulta encabezado de prefactura (Paso 4 del flujo)
   *
   * Una vez completado el proceso de cálculo, obtiene los encabezados
   * de las prefacturas generadas para revisión antes de aprobar.
   *
   * @param cicloId - ID del ciclo de facturación
   * @param periodo - Período en formato YYYYMM
   * @returns Promise con array de detalles de prefactura o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.consultarEncabezadoPrefactura('1', '202401');
   * if (data) {
   *   console.log(`Prefacturas generadas: ${data.length}`);
   * }
   * ```
   */
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

  /**
   * Consulta cargos de prefactura (Paso 5 del flujo)
   *
   * Obtiene el detalle de cargos calculados para las prefacturas,
   * incluyendo consumos, servicios y otros ítems facturables.
   *
   * @param cicloId - ID del ciclo de facturación
   * @param periodo - Período en formato YYYYMM
   * @returns Promise con array de cargos de prefactura o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.consultarCargosPrefactura('1', '202401');
   * if (data) {
   *   console.log(`Total cargos: ${data.length}`);
   * }
   * ```
   */
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

  /**
   * Genera detalle de factura final (Paso 6 del flujo)
   *
   * Convierte una prefactura aprobada en factura definitiva, generando
   * el documento final con todos los detalles y cálculos confirmados.
   * Este es el paso final del flujo de facturación.
   *
   * @param lecturaId - ID de la lectura asociada a la factura
   * @param periodoId - ID del período de facturación
   * @returns Promise con respuesta del servidor o error
   *
   * @example
   * ```typescript
   * const { data, error } = await operacionesService.generarDetalleFactura(12345, '202401');
   * if (data) {
   *   console.log('Factura generada exitosamente');
   * }
   * ```
   */
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
}

export const operacionesService = new OperacionesService();
