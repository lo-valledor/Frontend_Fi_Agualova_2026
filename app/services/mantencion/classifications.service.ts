import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type { TiposContrato, Parametro, Sectores } from '~/types/mantencion';
import api from '~/lib/api';


export class ClassificationsService extends BaseApiService {
  
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  
  async getTiposContratos(): Promise<ServiceResponse<TiposContrato[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarTipoContrato');
      return this.processResponseArray<TiposContrato>(response);
    }, 'Error getting contract types');
  }

  
  async getParametros(): Promise<ServiceResponse<Parametro[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarParametro');
      return this.processResponseArray<Parametro>(response);
    }, 'Error getting parameters');
  }

  
  async getSectores(): Promise<ServiceResponse<Sectores[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarSector');
      return this.processResponseArray<Sectores>(response);
    }, 'Error getting sectors');
  }
}

export const classificationsService = new ClassificationsService(api);
