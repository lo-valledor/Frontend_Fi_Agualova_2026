/**
 * Módulo especializado para operaciones con contratos
 *
 * Maneja todas las operaciones CRUD relacionadas con contratos del sistema.
 * Extiende BaseApiService para reutilizar lógica común.
 */

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

/** Solicitud para crear nuevo contrato */
export type CreateContratoRequest = CrearContratoProps;

/** Solicitud para actualizar contrato */
export type UpdateContratoRequest = ModificarContratoProps;

/** Respuesta de operación con contrato */
export interface ContratoOperationResponse {
  contrato: GetContratos;
  message: string;
}

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * Servicio especializado para operaciones con contratos
 */
class ContratosService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient = api) {
    super(httpClient);
  }

  /**
   * Obtiene todos los contratos del sistema
   *
   * @returns Respuesta con lista de contratos
   */
  async getAll(): Promise<ServiceResponse<GetContratos[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('contrato/buscar');
      return this.processResponseArray<GetContratos>(response);
    }, 'Error al obtener contratos');
  }

  /**
   * Obtiene un contrato específico por código
   *
   * @param codigo - Código del contrato
   * @returns Respuesta con datos del contrato
   */
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

  /**
   * Crea un nuevo contrato
   *
   * @param data - Datos del nuevo contrato
   * @returns Respuesta con contrato creado
   */
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

  /**
   * Actualiza un contrato existente
   *
   * @param data - Datos a actualizar (incluye código)
   * @returns Respuesta con contrato actualizado
   */
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

  /**
   * Elimina un contrato
   *
   * @param codigo - Código del contrato a eliminar
   * @returns Respuesta de éxito/error
   */
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

  /**
   * Obtiene contratos disponibles
   *
   * @returns Respuesta con contratos disponibles
   */
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
