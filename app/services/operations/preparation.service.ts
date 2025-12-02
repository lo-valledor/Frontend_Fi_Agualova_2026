import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  PeriodoAbierto,
  ValidarSectoresPendientes,
  ConsultarSectores,
  OpcionesPrepararLecturas,
  ConsultarAsignacionSectores,
  TotalesCorteReposicion,
  ConsultarMantenedorRevisionCorte
} from '~/types/operaciones';
import api from '~/lib/api';

/**
 * Interface para datos de preparación de lecturas
 */
export interface PrepareReadingsData {
  periodoAbierto: PeriodoAbierto[];
  lecturasPendientes: ValidarSectoresPendientes;
  sectores: ConsultarSectores[];
  opcionesPreparar: OpcionesPrepararLecturas[];
}

/**
 * Interface para datos de revisión de precios
 */
export interface ReviewPriceData {
  dataPeriodoAbierto: PeriodoAbierto[];
  dataConsultarPreciosUno: any[];
  dataConsultarPreciosDos: any[];
  ciclosFacturacion: Array<{
    diaFacturacion: string;
    descripcion: string;
  }>;
}

/**
 * Interface para datos de corte y reposición
 */
export interface CutRepositionData {
  totalesData: TotalesCorteReposicion[];
  mantenedorCorteData: ConsultarMantenedorRevisionCorte[];
}

/**
 * Servicio especializado para preparación de datos operacionales
 * Aplica SOLID: Single Responsibility = solo preparación de datos
 */
export class PreparationService extends BaseApiService {
  /**
   * Obtiene todos los datos necesarios para preparar lecturas
   */
  async getPrepareReadingsData(): Promise<
    ServiceResponse<PrepareReadingsData>
  > {
    return this.executeDataOperation(async () => {
      const [periodoAbierto, lecturasPendientes, sectores, opcionesPreparar] =
        await this.executeParallelOperations([
          () => this.httpClient.get('/ConsultarPeriodoAbierto'),
          () => this.httpClient.get('/validar-lecturas-pendientes'),
          () => this.httpClient.get('/consultar-sectores'),
          () =>
            this.httpClient.get('/opciones-preparar-lecturas', {
              params: { control: '1' }
            })
        ]);

      return {
        periodoAbierto:
          this.processResponseArray<PeriodoAbierto>(periodoAbierto),
        lecturasPendientes:
          this.processResponseSingle<ValidarSectoresPendientes>(
            lecturasPendientes
          ) || ({ sectores: [] } as unknown as ValidarSectoresPendientes),
        sectores: this.processResponseArray<ConsultarSectores>(sectores),
        opcionesPreparar:
          this.processResponseArray<OpcionesPrepararLecturas>(opcionesPreparar)
      };
    }, 'Error al obtener datos para preparar lecturas');
  }

  /**
   * Obtiene asignación de sectores para un ciclo y período específicos
   *
   * @param cicloFacturable - ID del ciclo facturable
   * @param periodo - Período en formato específico
   */
  async getSectorAssignment(
    cicloFacturable: string,
    periodo: string
  ): Promise<ServiceResponse<ConsultarAsignacionSectores[]>> {
    if (!cicloFacturable || !periodo) {
      return this.handleError(
        new Error('Parameters missing'),
        'Billing cycle and period are required'
      );
    }

    return this.executeDataOperation(async () => {
      const params = new URLSearchParams();
      params.append('cicloFacturable', cicloFacturable);
      params.append('periodo', periodo);

      const response = await this.httpClient.get(
        '/consultar-asignacion-sectores',
        {
          params
        }
      );

      return this.processResponseArray<ConsultarAsignacionSectores>(response);
    }, `Error al obtener asignación de sectores`);
  }

  /**
   * Obtiene datos de revisión de precios
   *
   * @param dia - Día para la consulta (default: 15)
   */
  async getReviewPriceData(
    dia: string = '15'
  ): Promise<ServiceResponse<ReviewPriceData>> {
    return this.executeDataOperation(async () => {
      // Carga paralela de datos básicos
      const [periodoAbierto, ciclosFacturacion] =
        await this.executeParallelOperations([
          () => this.httpClient.get('/ConsultarPeriodoAbierto'),
          () => this.httpClient.get('/ciclos-facturacion-activos')
        ]);

      const dataPeriodoAbierto =
        this.processResponseArray<PeriodoAbierto>(periodoAbierto);
      const dataCiclosFacturacion = this.processResponseArray<{
        diaFacturacion: string;
        descripcion: string;
      }>(ciclosFacturacion);

      if (!dataPeriodoAbierto || dataPeriodoAbierto.length === 0) {
        return {
          dataPeriodoAbierto: [],
          dataConsultarPreciosUno: [],
          dataConsultarPreciosDos: [],
          ciclosFacturacion: []
        };
      }

      const mes = dataPeriodoAbierto[0].mes;
      const anio = dataPeriodoAbierto[0].anio;

      // Cargar datos de precios
      const [preciosUno, preciosDos] = await this.executeParallelOperations([
        () =>
          this.httpClient.get(`/ConsultarPreciosUno?mes=${mes}&año=${anio}`),
        () =>
          this.httpClient.get(
            `/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${dia}`
          )
      ]);

      return {
        dataPeriodoAbierto,
        dataConsultarPreciosUno: this.processResponseArray(preciosUno),
        dataConsultarPreciosDos: this.processResponseArray(preciosDos),
        ciclosFacturacion: dataCiclosFacturacion
      };
    }, 'Error al obtener datos para revisión de precios');
  }

  /**
   * Obtiene datos de corte y reposición
   */
  async getCutRepositionData(): Promise<ServiceResponse<CutRepositionData>> {
    return this.executeDataOperation(async () => {
      const [totales, mantenedor] = await this.executeParallelOperations([
        () => this.httpClient.get('consulta-registros-revision?acometida=0'),
        () => this.httpClient.get('consulta-mantenedor-revision-corte')
      ]);

      return {
        totalesData: this.processResponseArray<TotalesCorteReposicion>(totales),
        mantenedorCorteData:
          this.processResponseArray<ConsultarMantenedorRevisionCorte>(
            mantenedor
          )
      };
    }, 'Error al obtener datos de corte y reposición');
  }
}

export const preparationService = new PreparationService(api);
