/**
 * Módulo especializado para operaciones con acometidas
 *
 * Maneja todas las operaciones CRUD relacionadas con acometidas del sistema.
 * Extiende BaseApiService para reutilizar lógica común.
 */

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

/**
 * Servicio especializado para operaciones con acometidas
 */
class AcometidaService extends BaseApiService {
  /**
   * Constructor
   */
  constructor(httpClient = api) {
    super(httpClient);
  }

  /**
   * Obtiene todas las acometidas del sistema
   *
   * @returns Respuesta con lista de acometidas
   */
  async getAll(): Promise<ServiceResponse<Acometida[]>> {
    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get('Acometida/buscar');
        return this.processResponseArray<Acometida>(response);
      },
      'Error al obtener acometidas'
    );
  }

  /**
   * Obtiene una acometida específica por ID
   *
   * @param id - ID de la acometida
   * @returns Respuesta con datos de la acometida
   */
  async getById(id: string | number): Promise<ServiceResponse<Acometida | null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID de la acometida es requerido'
      );
    }

    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get(`Acometida/${id}`);
        return this.processResponseSingle<Acometida>(response);
      },
      `Error al obtener acometida ${id}`
    );
  }

  /**
   * Crea una nueva acometida
   *
   * @param data - Datos de la nueva acometida
   * @returns Respuesta con acometida creada
   */
  async create(data: CreateAcometidaRequest): Promise<ServiceResponse<Acometida | null>> {
    if (!data || Object.keys(data).length === 0) {
      return this.handleError(
        new Error('Datos vacíos'),
        'Se requieren datos válidos para crear la acometida'
      );
    }

    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.post('Acometida', data);
        return this.processResponseSingle<Acometida>(response);
      },
      'Error al crear acometida'
    );
  }

  /**
   * Actualiza una acometida existente
   *
   * @param data - Datos a actualizar (incluye ID)
   * @returns Respuesta con acometida actualizada
   */
  async update(data: UpdateAcometidaRequest): Promise<ServiceResponse<Acometida | null>> {
    if (!data?.id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID de la acometida es requerido para actualizar'
      );
    }

    return this.executeDataOperation(
      async () => {
        const { id, ...updateData } = data;
        const response = await this.httpClient.put(`Acometida/${id}`, updateData);
        return this.processResponseSingle<Acometida>(response);
      },
      `Error al actualizar acometida ${data.id}`
    );
  }

  /**
   * Elimina una acometida
   *
   * @param id - ID de la acometida a eliminar
   * @returns Respuesta de éxito/error
   */
  async delete(id: string | number): Promise<ServiceResponse<null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID de la acometida es requerido para eliminar'
      );
    }

    return this.executeOperation(
      async () => {
        await this.httpClient.delete(`Acometida/${id}`);
      },
      `Error al eliminar acometida ${id}`
    );
  }

  /**
   * Obtiene acometidas por cliente
   *
   * @param clienteId - ID del cliente
   * @returns Respuesta con acometidas del cliente
   */
  async getByCliente(clienteId: string | number): Promise<ServiceResponse<Acometida[]>> {
    if (!clienteId) {
      return this.handleError(
        new Error('ID de cliente inválido'),
        'Se requiere el ID del cliente'
      );
    }

    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get(`Acometida/cliente/${clienteId}`);
        return this.processResponseArray<Acometida>(response);
      },
      `Error al obtener acometidas del cliente ${clienteId}`
    );
  }

  /**
   * Obtiene acometidas por contrato
   *
   * @param contratoId - ID del contrato
   * @returns Respuesta con acometidas del contrato
   */
  async getByContrato(contratoId: string | number): Promise<ServiceResponse<Acometida[]>> {
    if (!contratoId) {
      return this.handleError(
        new Error('ID de contrato inválido'),
        'Se requiere el ID del contrato'
      );
    }

    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get(`Acometida/contrato/${contratoId}`);
        return this.processResponseArray<Acometida>(response);
      },
      `Error al obtener acometidas del contrato ${contratoId}`
    );
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const acometidaService = new AcometidaService();
export default acometidaService;
