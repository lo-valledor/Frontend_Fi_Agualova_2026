/**
 * Módulo especializado para operaciones con medidores
 *
 * Maneja todas las operaciones CRUD relacionadas con medidores del sistema.
 * Extiende BaseApiService para reutilizar lógica común.
 */

import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';

// ============================================================================
// TIPOS
// ============================================================================

/** Solicitud para crear nuevo medidor */
export interface CreateMedidorRequest {
  [key: string]: any;
}

/** Solicitud para actualizar medidor */
export interface UpdateMedidorRequest {
  id: string | number;
  [key: string]: any;
}

/** Tipo genérico para medidores */
export interface Medidor {
  [key: string]: any;
}

/** Respuesta de operación con medidor */
export interface MedidorOperationResponse {
  medidor: Medidor;
  message: string;
}

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * Servicio especializado para operaciones con medidores
 */
class MedidoresService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient = api) {
    super(httpClient);
  }

  /**
   * Obtiene todos los medidores del sistema
   *
   * @returns Respuesta con lista de medidores
   */
  async getAll(): Promise<ServiceResponse<Medidor[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('medidor/buscar');
      return this.processResponseArray<Medidor>(response);
    }, 'Error al obtener medidores');
  }

  /**
   * Obtiene un medidor específico por ID
   *
   * @param id - ID del medidor
   * @returns Respuesta con datos del medidor
   */
  async getById(id: string | number): Promise<ServiceResponse<Medidor | null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del medidor es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`medidor/${id}`);
      return this.processResponseSingle<Medidor>(response);
    }, `Error al obtener medidor ${id}`);
  }

  /**
   * Crea un nuevo medidor
   *
   * @param data - Datos del nuevo medidor
   * @returns Respuesta con medidor creado
   */
  async create(
    data: CreateMedidorRequest
  ): Promise<ServiceResponse<Medidor | null>> {
    if (!data || Object.keys(data).length === 0) {
      return this.handleError(
        new Error('Datos vacíos'),
        'Se requieren datos válidos para crear el medidor'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('medidor', data);
      return this.processResponseSingle<Medidor>(response);
    }, 'Error al crear medidor');
  }

  /**
   * Actualiza un medidor existente
   *
   * @param data - Datos a actualizar (incluye ID)
   * @returns Respuesta con medidor actualizado
   */
  async update(
    data: UpdateMedidorRequest
  ): Promise<ServiceResponse<Medidor | null>> {
    if (!data?.id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del medidor es requerido para actualizar'
      );
    }

    return this.executeDataOperation(async () => {
      const { id, ...updateData } = data;
      const response = await this.httpClient.put(`medidor/${id}`, updateData);
      return this.processResponseSingle<Medidor>(response);
    }, `Error al actualizar medidor ${data.id}`);
  }

  /**
   * Elimina un medidor
   *
   * @param id - ID del medidor a eliminar
   * @returns Respuesta de éxito/error
   */
  async delete(id: string | number): Promise<ServiceResponse<null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del medidor es requerido para eliminar'
      );
    }

    return this.executeOperation(async () => {
      await this.httpClient.delete(`medidor/${id}`);
    }, `Medidor ${id} eliminado exitosamente`) as Promise<
      ServiceResponse<null>
    >;
  }

  /**
   * Obtiene medidores por contrato
   *
   * @param contratoId - ID del contrato
   * @returns Respuesta con medidores del contrato
   */
  async getByContrato(
    contratoId: string | number
  ): Promise<ServiceResponse<Medidor[]>> {
    if (!contratoId) {
      return this.handleError(
        new Error('ID de contrato inválido'),
        'Se requiere el ID del contrato'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `medidor/contrato/${contratoId}`
      );
      return this.processResponseArray<Medidor>(response);
    }, `Error al obtener medidores del contrato ${contratoId}`);
  }

  /**
   * Obtiene medidores por acometida
   *
   * @param acometidaId - ID de la acometida
   * @returns Respuesta con medidores de la acometida
   */
  async getByAcometida(
    acometidaId: string | number
  ): Promise<ServiceResponse<Medidor[]>> {
    if (!acometidaId) {
      return this.handleError(
        new Error('ID de acometida inválido'),
        'Se requiere el ID de la acometida'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `medidor/acometida/${acometidaId}`
      );
      return this.processResponseArray<Medidor>(response);
    }, `Error al obtener medidores de la acometida ${acometidaId}`);
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const medidoresService = new MedidoresService();
export default medidoresService;
