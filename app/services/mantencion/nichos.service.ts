import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  Nicho,
  CreateNichoRequest,
  UpdateNichoRequest
} from '~/types/mantencion';
import api from '~/lib/api';

/**
 * NichosService (Mantencion Module)
 * Manages niche data and operations
 * - Get nichos
 * - Create nicho
 * - Update nicho
 */
export class NichosService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  /**
   * Get all nichos
   */
  async getNichos(): Promise<ServiceResponse<Nicho[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarNichoM');
      return this.processResponseArray<Nicho>(response);
    }, 'Error getting nichos');
  }

  /**
   * Create a new nicho
   * @param nicho Nicho creation data
   */
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

  /**
   * Update an existing nicho
   * @param id Nicho ID
   * @param nicho Nicho update data
   */
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
