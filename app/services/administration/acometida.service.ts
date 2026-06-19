import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';

// ============================================================================
// TIPOS
// ============================================================================

export interface Acometida {
  [key: string]: any;
}

export interface CreateAcometidaRequest {
  [key: string]: any;
}

export interface UpdateAcometidaRequest {
  id: string | number;
  [key: string]: any;
}

export interface AcometidaOperationResponse {
  acometida: Acometida;
  message: string;
}

class AcometidaService extends BaseApiService {
  constructor(httpClient = api) {
    super(httpClient);
  }

  async getAll(): Promise<ServiceResponse<Acometida[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('Acometida/buscar');
      return this.processResponseArray<Acometida>(response);
    }, 'Error al obtener acometidas');
  }

  async getById(
    id: string | number
  ): Promise<ServiceResponse<Acometida | null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID de la acometida es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`Acometida/${id}`);
      return this.processResponseSingle<Acometida>(response);
    }, `Error al obtener acometida ${id}`);
  }

  async create(
    data: CreateAcometidaRequest
  ): Promise<ServiceResponse<Acometida | null>> {
    if (!data || Object.keys(data).length === 0) {
      return this.handleError(
        new Error('Datos vacíos'),
        'Se requieren datos válidos para crear la acometida'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('Acometida', data);
      return this.processResponseSingle<Acometida>(response);
    }, 'Error al crear acometida');
  }

  async update(
    data: UpdateAcometidaRequest
  ): Promise<ServiceResponse<Acometida | null>> {
    if (!data?.id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID de la acometida es requerido para actualizar'
      );
    }

    return this.executeDataOperation(async () => {
      const { id, ...updateData } = data;
      const response = await this.httpClient.put(`Acometida/${id}`, updateData);
      return this.processResponseSingle<Acometida>(response);
    }, `Error al actualizar acometida ${data.id}`);
  }

  async delete(id: string | number): Promise<ServiceResponse<null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID de la acometida es requerido para eliminar'
      );
    }

    return this.executeOperation(async () => {
      await this.httpClient.delete(`acometida/${id}`);
    }, `Acometida ${id} eliminada exitosamente`) as Promise<
      ServiceResponse<null>
    >;
  }

  async getByCliente(
    clienteId: string | number
  ): Promise<ServiceResponse<Acometida[]>> {
    if (!clienteId) {
      return this.handleError(
        new Error('ID de cliente inválido'),
        'Se requiere el ID del cliente'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `Acometida/cliente/${clienteId}`
      );
      return this.processResponseArray<Acometida>(response);
    }, `Error al obtener acometidas del cliente ${clienteId}`);
  }

  async getByContrato(
    contratoId: string | number
  ): Promise<ServiceResponse<Acometida[]>> {
    if (!contratoId) {
      return this.handleError(
        new Error('ID de contrato inválido'),
        'Se requiere el ID del contrato'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `Acometida/contrato/${contratoId}`
      );
      return this.processResponseArray<Acometida>(response);
    }, `Error al obtener acometidas del contrato ${contratoId}`);
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const acometidaService = new AcometidaService();
export default acometidaService;
