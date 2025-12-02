import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type { TiposContrato, Parametro, Sectores } from '~/types/mantencion';
import api from '~/lib/api';

/**
 * ClassificationsService (Mantencion Module)
 * Manages contract types, parameters, and sectors
 * - Contract types/Tipos de contrato
 * - Parameters/Parámetros
 * - Sectors/Sectores
 */
export class ClassificationsService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  /**
   * Get contract types
   */
  async getTiposContratos(): Promise<ServiceResponse<TiposContrato[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarTipoContrato');
      return this.processResponseArray<TiposContrato>(response);
    }, 'Error getting contract types');
  }

  /**
   * Get parameters
   */
  async getParametros(): Promise<ServiceResponse<Parametro[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarParametro');
      return this.processResponseArray<Parametro>(response);
    }, 'Error getting parameters');
  }

  /**
   * Get sectors
   */
  async getSectores(): Promise<ServiceResponse<Sectores[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarSector');
      return this.processResponseArray<Sectores>(response);
    }, 'Error getting sectors');
  }
}

export const classificationsService = new ClassificationsService(api);
