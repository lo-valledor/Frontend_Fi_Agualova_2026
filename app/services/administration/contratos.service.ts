import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';
import type {
  GetContratos,
  CrearContratoProps,
  ModificarContratoProps
} from '~/types/administracion';

// ============================================================================
// TIPOS
// ============================================================================


export type CreateContratoRequest = CrearContratoProps;


export type UpdateContratoRequest = ModificarContratoProps;


export interface ContratoOperationResponse {
  contrato: GetContratos;
  message: string;
}

// ============================================================================
// SERVICIO
// ============================================================================


class ContratosService extends BaseApiService {
  
  constructor(httpClient = api) {
    super(httpClient);
  }

  
  async getAll(): Promise<ServiceResponse<GetContratos[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('contrato/buscar');
      return this.processResponseArray<GetContratos>(response);
    }, 'Error al obtener contratos');
  }

  
  async getByCodigo(
    codigo: string
  ): Promise<ServiceResponse<GetContratos | null>> {
    if (!codigo) {
      return this.handleError(
        new Error('Código inválido'),
        'El código del contrato es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`contrato/${codigo}`);
      return this.processResponseSingle<GetContratos>(response);
    }, `Error al obtener contrato ${codigo}`);
  }

  
  async create(
    data: CreateContratoRequest
  ): Promise<ServiceResponse<GetContratos | null>> {
    if (!data || Object.keys(data).length === 0) {
      return this.handleError(
        new Error('Datos vacíos'),
        'Se requieren datos válidos para crear el contrato'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('contrato', data);
      return this.processResponseSingle<GetContratos>(response);
    }, 'Error al crear contrato');
  }

  
  async update(
    data: UpdateContratoRequest
  ): Promise<ServiceResponse<GetContratos | null>> {
    if (!data?.codigo) {
      return this.handleError(
        new Error('Código inválido'),
        'El código del contrato es requerido para actualizar'
      );
    }

    return this.executeDataOperation(async () => {
      const { codigo, ...updateData } = data;
      const response = await this.httpClient.put(
        `contrato/${codigo}`,
        updateData
      );
      return this.processResponseSingle<GetContratos>(response);
    }, `Error al actualizar contrato ${data.codigo}`);
  }

  
  async delete(codigo: string): Promise<ServiceResponse<null>> {
    if (!codigo) {
      return this.handleError(
        new Error('Código inválido'),
        'El código del contrato es requerido para eliminar'
      );
    }

    return this.executeOperation(async () => {
      await this.httpClient.delete(`contrato/${codigo}`);
    }, `Contrato ${codigo} eliminado exitosamente`) as Promise<
      ServiceResponse<null>
    >;
  }

  
  async getAvailable(): Promise<ServiceResponse<GetContratos[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('contrato/disponibles');
      return this.processResponseArray<GetContratos>(response);
    }, 'Error al obtener contratos disponibles');
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const contratosService = new ContratosService();
export default contratosService;
