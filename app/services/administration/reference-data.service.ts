import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';
import type { GetGiros, GetComunas } from '~/types/administracion';

// ============================================================================
// TIPOS
// ============================================================================


export interface ReferenceDataBundle {
  giros: GetGiros[];
  comunas: GetComunas[];
  marcas: Array<{ [key: string]: any }>;
  condiciones: Array<{ [key: string]: any }>;
  cargosTipo: Array<{ [key: string]: any }>;
  cargosFacturables: Array<{ [key: string]: any }>;
}

// ============================================================================
// SERVICIO
// ============================================================================


class ReferenceDataService extends BaseApiService {
  
  constructor(httpClient = api) {
    super(httpClient);
  }

  
  async getGiros(): Promise<ServiceResponse<GetGiros[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('giro/buscar');
      return this.processResponseArray<GetGiros>(response);
    }, 'Error al obtener giros');
  }

  
  async getComunas(): Promise<ServiceResponse<GetComunas[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('comuna/por-region');
      return this.processResponseArray<GetComunas>(response);
    }, 'Error al obtener comunas');
  }

  
  async getMarcas(): Promise<ServiceResponse<Array<{ [key: string]: any }>>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('marca/buscar');
      return this.processResponseArray<{ [key: string]: any }>(response);
    }, 'Error al obtener marcas');
  }

  
  async getCondiciones(): Promise<
    ServiceResponse<Array<{ [key: string]: any }>>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('CondicionesContrato/buscar');
      return this.processResponseArray<{ [key: string]: any }>(response);
    }, 'Error al obtener condiciones de contrato');
  }

  
  async getCargosTipo(): Promise<
    ServiceResponse<Array<{ [key: string]: any }>>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('CargoTipoContrato/buscar');
      return this.processResponseArray<{ [key: string]: any }>(response);
    }, 'Error al obtener tipos de cargo');
  }

  
  async getCargosFacturables(): Promise<
    ServiceResponse<Array<{ [key: string]: any }>>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('CargoFacturable/buscar');
      return this.processResponseArray<{ [key: string]: any }>(response);
    }, 'Error al obtener cargos facturables');
  }

  
  async getAll(): Promise<ServiceResponse<ReferenceDataBundle>> {
    return this.executeDataOperation(async () => {
      const results = (await this.executeParallelOperations([
        () => this.httpClient.get('giro/buscar'),
        () => this.httpClient.get('comuna/por-region'),
        () => this.httpClient.get('marca/buscar'),
        () => this.httpClient.get('CondicionesContrato/buscar'),
        () => this.httpClient.get('CargoTipoContrato/buscar'),
        () => this.httpClient.get('CargoFacturable/buscar')
      ])) as [any, any, any, any, any, any];

      return {
        giros: this.processResponseArray<GetGiros>(results[0]),
        comunas: this.processResponseArray<GetComunas>(results[1]),
        marcas: this.processResponseArray<{ [key: string]: any }>(results[2]),
        condiciones: this.processResponseArray<{ [key: string]: any }>(
          results[3]
        ),
        cargosTipo: this.processResponseArray<{ [key: string]: any }>(
          results[4]
        ),
        cargosFacturables: this.processResponseArray<{ [key: string]: any }>(
          results[5]
        )
      };
    }, 'Error al obtener datos de referencia');
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const referenceDataService = new ReferenceDataService();
export default referenceDataService;
