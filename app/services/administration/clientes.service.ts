import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';
import type { GetClienteContrato, GetComunas } from '~/types/administracion';

// ============================================================================
// TIPOS
// ============================================================================


export interface GetClientesDataResponse {
  clientes: GetClienteContrato[];
  comunas: GetComunas[];
}

// ============================================================================
// SERVICIO
// ============================================================================


class ClientesService extends BaseApiService {
  
  constructor(httpClient = api) {
    super(httpClient);
  }

  
  async getAll(): Promise<ServiceResponse<GetClienteContrato[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('ClienteBuscar');
      return this.processResponseArray<GetClienteContrato>(response);
    }, 'Error al obtener clientes');
  }

  
  async getDataWithCombos(): Promise<ServiceResponse<GetClientesDataResponse>> {
    return this.executeDataOperation(async () => {
      const results = (await this.executeParallelOperations([
        () => this.httpClient.get('ClienteBuscar'),
        () => this.httpClient.get('comuna/por-region')
      ])) as [any, any];

      return {
        clientes: this.processResponseArray<GetClienteContrato>(results[0]),
        comunas: this.processResponseArray<GetComunas>(results[1])
      };
    }, 'Error al obtener datos de clientes');
  }

  
  async searchByRut(
    rut: string
  ): Promise<ServiceResponse<GetClienteContrato | null>> {
    if (!rut || typeof rut !== 'string' || rut.trim().length === 0) {
      return this.handleError(
        new Error('RUT inválido'),
        'El RUT debe ser proporcionado'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`cliente/rut/${rut}`);
      return this.processResponseSingle<GetClienteContrato>(response);
    }, `Error al buscar cliente con RUT ${rut}`);
  }

  
  async search(): Promise<ServiceResponse<GetClienteContrato[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('cliente/buscar');
      return this.processResponseArray<GetClienteContrato>(response);
    }, 'Error al buscar clientes');
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const clientesService = new ClientesService();
export default clientesService;
