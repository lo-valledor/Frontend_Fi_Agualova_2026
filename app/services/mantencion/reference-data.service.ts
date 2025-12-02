import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  CiclosFacturacion,
  Empalme,
  Marca,
  Tarifas,
  Zonas
} from '~/types/mantencion';
import api from '~/lib/api';

/**
 * ReferenceDataService (Mantencion Module)
 * Manages basic reference data and lookups
 * - Billing cycles
 * - Empalmes
 * - Brands/Marcas
 * - Tariffs
 * - Zones
 */
export class ReferenceDataMantencionService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  /**
   * Get billing cycles
   */
  async getCiclosFacturacion(): Promise<ServiceResponse<CiclosFacturacion[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarCiclo');
      return this.processResponseArray<CiclosFacturacion>(response);
    }, 'Error getting billing cycles');
  }

  /**
   * Get empalmes (connection points)
   */
  async getEmpalmes(): Promise<ServiceResponse<Empalme[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarEmpalmes');
      return this.processResponseArray<Empalme>(response);
    }, 'Error getting empalmes');
  }

  /**
   * Get brands/marcas
   */
  async getMarcas(): Promise<ServiceResponse<Marca[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarMarca');
      return this.processResponseArray<Marca>(response);
    }, 'Error getting brands');
  }

  /**
   * Get tariffs
   */
  async getTarifas(): Promise<ServiceResponse<Tarifas[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarTarifa');
      return this.processResponseArray<Tarifas>(response);
    }, 'Error getting tariffs');
  }

  /**
   * Get zones
   */
  async getZonas(): Promise<ServiceResponse<Zonas[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarZona');
      return this.processResponseArray<Zonas>(response);
    }, 'Error getting zones');
  }
}

export const referenceDataMantencionService =
  new ReferenceDataMantencionService(api);
