import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  PreciosCargoEnel,
  PreciosCargoEnerlova,
  RevisarPrecioUno,
  RevisarPrecioDos
} from '~/types/operaciones';

/**
 * Interface para datos de precios consolidados
 */
export interface PricingData {
  tablaEnel: PreciosCargoEnel[];
  tablaEnerlova: PreciosCargoEnerlova[];
}

/**
 * Interface para precios por ciclo
 */
export interface CyclePrices {
  preciosUno: RevisarPrecioUno[];
  preciosDos: RevisarPrecioDos[];
}

/**
 * Servicio especializado para gestión de precios y cargos
 * Aplica SOLID: Single Responsibility = solo gestión de precios
 */
export class PricingService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient?: any) {
    super(httpClient);
  }

  /**
   * Obtiene los precios de cargo para un mes y año específicos
   *
   * @param mes - Mes (1-12 o nombre)
   * @param anio - Año
   * @returns Respuesta con datos de precios consolidados
   */
  async getPricingData(
    mes: string,
    anio: string
  ): Promise<ServiceResponse<PricingData>> {
    if (!mes || !anio) {
      return this.handleError(
        new Error('Parameters missing'),
        'Month and year are required'
      );
    }

    return this.executeDataOperation(async () => {
      const [enel, enerlova] = await this.executeParallelOperations([
        () =>
          this.httpClient.get(`/consulta-precio-pago?mes=${mes}&año=${anio}`),
        () => this.httpClient.get(`/consulta-precio-pago-tabla`)
      ]);

      return {
        tablaEnel: this.processResponseArray<PreciosCargoEnel>(enel),
        tablaEnerlova: this.processResponseArray<PreciosCargoEnerlova>(enerlova)
      };
    }, `Error al obtener precios para ${mes}/${anio}`);
  }

  /**
   * Obtiene precios tipo uno (consulta básica)
   *
   * @param mes - Mes
   * @param anio - Año
   * @returns Respuesta con precios tipo uno
   */
  async getPreciosUno(
    mes: number,
    anio: number
  ): Promise<ServiceResponse<RevisarPrecioUno[]>> {
    if (!mes || !anio) {
      return this.handleError(
        new Error('Parameters missing'),
        'Month and year are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `/ConsultarPreciosUno?mes=${mes}&año=${anio}`
      );
      return this.processResponseArray<RevisarPrecioUno>(response);
    }, `Error al obtener precios tipo uno`);
  }

  /**
   * Obtiene precios tipo dos (consulta con día)
   *
   * @param mes - Mes
   * @param anio - Año
   * @param dia - Día (default: 15)
   * @returns Respuesta con precios tipo dos
   */
  async getPreciosDos(
    mes: number,
    anio: number,
    dia: string = '15'
  ): Promise<ServiceResponse<RevisarPrecioDos[]>> {
    if (!mes || !anio) {
      return this.handleError(
        new Error('Parameters missing'),
        'Month and year are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${dia}`
      );
      return this.processResponseArray<RevisarPrecioDos>(response);
    }, `Error al obtener precios tipo dos`);
  }

  /**
   * Obtiene ambos tipos de precios por ciclo (carga paralela)
   *
   * @param mes - Mes
   * @param anio - Año
   * @param dia - Día para precios dos (default: 15)
   * @returns Respuesta con precios de ambos tipos
   */
  async getCyclePrices(
    mes: number,
    anio: number,
    dia: string = '15'
  ): Promise<ServiceResponse<CyclePrices>> {
    if (!mes || !anio) {
      return this.handleError(
        new Error('Parameters missing'),
        'Month and year are required'
      );
    }

    return this.executeDataOperation(async () => {
      const [preciosUnoRes, preciosDosRes] =
        await this.executeParallelOperations([
          () =>
            this.httpClient.get(`/ConsultarPreciosUno?mes=${mes}&año=${anio}`),
          () =>
            this.httpClient.get(
              `/ConsultarPreciosDos?mes=${mes}&año=${anio}&dia=${dia}`
            )
        ]);

      return {
        preciosUno: this.processResponseArray<RevisarPrecioUno>(preciosUnoRes),
        preciosDos: this.processResponseArray<RevisarPrecioDos>(preciosDosRes)
      };
    }, `Error al obtener precios para el ciclo`);
  }
}

export const pricingService = new PricingService();
