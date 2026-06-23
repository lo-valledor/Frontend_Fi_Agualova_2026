import api from "~/lib/api";
import type { ServiceResponse } from "~/services/core/api-response";
import { BaseApiService } from "~/services/core/base-service";
import type { Parametro, Sector, TipoContrato } from "~/types/mantencion";

export class ClassificationsService extends BaseApiService {
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  async getTiposContratos(): Promise<ServiceResponse<TipoContrato[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get("/buscarTipoContrato");
      return this.processResponseArray<TipoContrato>(response);
    }, "Error getting contract types");
  }

  async getParametros(): Promise<ServiceResponse<Parametro[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get("/buscarParametro");
      return this.processResponseArray<Parametro>(response);
    }, "Error getting parameters");
  }

  async getSectores(): Promise<ServiceResponse<Sector[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get("/buscarSector");
      return this.processResponseArray<Sector>(response);
    }, "Error getting sectors");
  }
}

export const classificationsService = new ClassificationsService(api);
