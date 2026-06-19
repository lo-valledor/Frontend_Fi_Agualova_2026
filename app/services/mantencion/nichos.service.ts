import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  Nicho,
  CreateNichoRequest,
  UpdateNichoRequest
} from '~/types/mantencion';
import api from '~/lib/api';


export class NichosService extends BaseApiService {
  
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  
  async getNichos(): Promise<ServiceResponse<Nicho[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarNichoM');
      return this.processResponseArray<Nicho>(response);
    }, 'Error getting nichos');
  }

  
  async createNicho(
    nicho: CreateNichoRequest
  ): Promise<ServiceResponse<Nicho>> {
    if (!nicho) {
      return this.handleError(
        new Error('Nicho data is required'),
        'Nicho data is required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('/CrearNichoM', nicho);
      return this.processResponseSingle<Nicho>(response);
    }, 'Error creating nicho') as Promise<ServiceResponse<Nicho>>;
  }

  
  async updateNicho(
    id: number,
    nicho: UpdateNichoRequest
  ): Promise<ServiceResponse<Nicho>> {
    if (!id || !nicho) {
      return this.handleError(
        new Error('Nicho ID and data are required'),
        'Nicho ID and data are required'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.patch(`/nichos/${id}`, nicho);
      return this.processResponseSingle<Nicho>(response);
    }, 'Error updating nicho') as Promise<ServiceResponse<Nicho>>;
  }
}

export const nichosService = new NichosService(api);
