import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  PreciosCargoEnel,
  PreciosCargoAgualova,
  RevisarPrecioUno,
  RevisarPrecioDos
} from '~/types/operaciones';


export interface PricingData {
  tablaEnel: PreciosCargoEnel[];
  tablaAgualova: PreciosCargoAgualova[];
}


export interface CyclePrices {
  preciosUno: RevisarPrecioUno[];
  preciosDos: RevisarPrecioDos[];
}


export class PricingService extends BaseApiService {
  
  constructor(httpClient?: any) {
    super(httpClient);
  }

  
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
      const [enel, agualova] = await this.executeParallelOperations([
        () =>
          this.httpClient.get(`/consulta-precio-pago?mes=${mes}&año=${anio}`),
        () => this.httpClient.get(`/consulta-precio-pago-tabla`)
      ]);

      return {
        tablaEnel: this.processResponseArray<PreciosCargoEnel>(enel),
        tablaAgualova: this.processResponseArray<PreciosCargoAgualova>(agualova)
      };
    }, `Error al obtener precios para ${mes}/${anio}`);
  }

  
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
