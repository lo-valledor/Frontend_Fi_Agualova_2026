import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  CicloFacturacion,
  Empalme,
  Marca,
  Tarifa,
  Zona
} from '~/types/mantencion';
import api from '~/lib/api';


export class ReferenceDataMantencionService extends BaseApiService {
  
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  async getCiclosFacturacion(): Promise<ServiceResponse<CicloFacturacion[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/ciclos-facturacion/buscar');
      return this.processResponseArray<CicloFacturacion>(response);
    }, 'Error getting billing cycles');
  }

  async getEmpalmes(): Promise<ServiceResponse<Empalme[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/empalmes/buscar');
      return this.processResponseArray<Empalme>(response);
    }, 'Error getting empalmes');
  }

  async getMarcas(): Promise<ServiceResponse<Marca[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/marcas/buscar');
      return this.processResponseArray<Marca>(response);
    }, 'Error getting brands');
  }

  async getTarifas(): Promise<ServiceResponse<Tarifa[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/tarifas/buscar');
      return this.processResponseArray<Tarifa>(response);
    }, 'Error getting tariffs');
  }

  async getZonas(): Promise<ServiceResponse<Zona[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/zonas/buscar');
      return this.processResponseArray<Zona>(response);
    }, 'Error getting zones');
  }
}

export const referenceDataMantencionService =
  new ReferenceDataMantencionService(api);
