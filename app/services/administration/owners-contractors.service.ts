/**
 * Módulo especializado para operaciones con propietarios y contratantes
 *
 * Maneja operaciones CRUD relacionadas con propietarios y contratantes del sistema.
 * Extiende BaseApiService para reutilizar lógica común.
 */

import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';
import type { GetPropietario, GetContratante } from '~/types/administracion';

// ============================================================================
// TIPOS - PROPIETARIOS
// ============================================================================

/** Solicitud para crear nuevo propietario */
export interface CreatePropietarioRequest {
  rut: string;
  nombre: string;
  comuna: string;
  telefono: string;
  celular: string;
  email: string;
}

/** Solicitud para actualizar propietario */
export interface UpdatePropietarioRequest {
  id: string | number;
  rut?: string;
  nombre?: string;
  comuna?: string;
  telefono?: string;
  celular?: string;
  email?: string;
}

export type PropietarioOperationResponse = {
  propietario: GetPropietario;
  message: string;
};

// ============================================================================
// TIPOS - CONTRATANTES
// ============================================================================

/** Solicitud para crear nuevo contratante */
export interface CreateContratanteRequest {
  rut: string;
  nombre: string;
  apellido: string;
  esEmpresa: boolean;
  direccion: string;
  comuna: string;
  contacto: string;
  telefono: string;
  email: string;
}

/** Solicitud para actualizar contratante */
export interface UpdateContratanteRequest {
  id: string | number;
  rut?: string;
  nombre?: string;
  apellido?: string;
  esEmpresa?: boolean;
  direccion?: string;
  comuna?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
}

export type ContratanteOperationResponse = {
  contratante: GetContratante;
  message: string;
};

// ============================================================================
// SERVICIO - PROPIETARIOS
// ============================================================================

/**
 * Servicio especializado para operaciones con propietarios
 */
class PropietariosService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient = api) {
    super(httpClient);
  }

  /**
   * Obtiene todos los propietarios del sistema
   *
   * @returns Respuesta con lista de propietarios
   */
  async getAll(): Promise<ServiceResponse<GetPropietario[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('propietario/buscar');
      return this.processResponseArray<GetPropietario>(response);
    }, 'Error al obtener propietarios');
  }

  /**
   * Obtiene un propietario específico por ID
   *
   * @param id - ID del propietario
   * @returns Respuesta con datos del propietario
   */
  async getById(
    id: string | number
  ): Promise<ServiceResponse<GetPropietario | null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del propietario es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`propietario/${id}`);
      return this.processResponseSingle<GetPropietario>(response);
    }, `Error al obtener propietario ${id}`);
  }

  /**
   * Crea un nuevo propietario
   *
   * @param data - Datos del nuevo propietario
   * @returns Respuesta con propietario creado
   */
  async create(
    data: CreatePropietarioRequest
  ): Promise<ServiceResponse<GetPropietario | null>> {
    if (!data || Object.keys(data).length === 0) {
      return this.handleError(
        new Error('Datos vacíos'),
        'Se requieren datos válidos para crear el propietario'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('propietario', data);
      return this.processResponseSingle<GetPropietario>(response);
    }, 'Error al crear propietario');
  }

  /**
   * Actualiza un propietario existente
   *
   * @param data - Datos a actualizar (incluye ID)
   * @returns Respuesta con propietario actualizado
   */
  async update(
    data: UpdatePropietarioRequest
  ): Promise<ServiceResponse<GetPropietario | null>> {
    if (!data?.id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del propietario es requerido para actualizar'
      );
    }

    return this.executeDataOperation(async () => {
      const { id, ...updateData } = data;
      const response = await this.httpClient.put(
        `propietario/${id}`,
        updateData
      );
      return this.processResponseSingle<GetPropietario>(response);
    }, `Error al actualizar propietario ${data.id}`);
  }

  /**
   * Elimina un propietario
   *
   * @param id - ID del propietario a eliminar
   * @returns Respuesta de éxito/error
   */
  async delete(id: string | number): Promise<ServiceResponse<string>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del propietario es requerido para eliminar'
      );
    }

    return this.executeOperation<string>(async () => {
      await this.httpClient.delete(`propietario/${id}`);
    }, `Propietario ${id} eliminado exitosamente`);
  }

  /**
   * Obtiene propietarios de un cliente
   *
   * @param clienteId - ID del cliente
   * @returns Respuesta con propietarios del cliente
   */
  async getByCliente(
    clienteId: string | number
  ): Promise<ServiceResponse<GetPropietario[]>> {
    if (!clienteId) {
      return this.handleError(
        new Error('ID de cliente inválido'),
        'Se requiere el ID del cliente'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `propietario/cliente/${clienteId}`
      );
      return this.processResponseArray<GetPropietario>(response);
    }, `Error al obtener propietarios del cliente ${clienteId}`);
  }
}

// ============================================================================
// SERVICIO - CONTRATANTES
// ============================================================================

/**
 * Servicio especializado para operaciones con contratantes
 */
class ContratantesService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient = api) {
    super(httpClient);
  }

  /**
   * Obtiene todos los contratantes del sistema
   *
   * @returns Respuesta con lista de contratantes
   */
  async getAll(): Promise<ServiceResponse<GetContratante[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('contratante/buscar');
      return this.processResponseArray<GetContratante>(response);
    }, 'Error al obtener contratantes');
  }

  /**
   * Obtiene un contratante específico por ID
   *
   * @param id - ID del contratante
   * @returns Respuesta con datos del contratante
   */
  async getById(
    id: string | number
  ): Promise<ServiceResponse<GetContratante | null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del contratante es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`contratante/${id}`);
      return this.processResponseSingle<GetContratante>(response);
    }, `Error al obtener contratante ${id}`);
  }

  /**
   * Crea un nuevo contratante
   *
   * @param data - Datos del nuevo contratante
   * @returns Respuesta con contratante creado
   */
  async create(
    data: CreateContratanteRequest
  ): Promise<ServiceResponse<GetContratante | null>> {
    if (!data || Object.keys(data).length === 0) {
      return this.handleError(
        new Error('Datos vacíos'),
        'Se requieren datos válidos para crear el contratante'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('contratante', data);
      return this.processResponseSingle<GetContratante>(response);
    }, 'Error al crear contratante');
  }

  /**
   * Actualiza un contratante existente
   *
   * @param data - Datos a actualizar (incluye ID)
   * @returns Respuesta con contratante actualizado
   */
  async update(
    data: UpdateContratanteRequest
  ): Promise<ServiceResponse<GetContratante | null>> {
    if (!data?.id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del contratante es requerido para actualizar'
      );
    }

    return this.executeDataOperation(async () => {
      const { id, ...updateData } = data;
      const response = await this.httpClient.put(
        `contratante/${id}`,
        updateData
      );
      return this.processResponseSingle<GetContratante>(response);
    }, `Error al actualizar contratante ${data.id}`);
  }

  /**
   * Elimina un contratante
   *
   * @param id - ID del contratante a eliminar
   * @returns Respuesta de éxito/error
   */
  async delete(id: string | number): Promise<ServiceResponse<string>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del contratante es requerido para eliminar'
      );
    }

    return this.executeOperation<string>(async () => {
      await this.httpClient.delete(`contratante/${id}`);
    }, `Contratante ${id} eliminado exitosamente`);
  }

  /**
   * Obtiene contratantes de un cliente
   *
   * @param clienteId - ID del cliente
   * @returns Respuesta con contratantes del cliente
   */
  async getByCliente(
    clienteId: string | number
  ): Promise<ServiceResponse<GetContratante[]>> {
    if (!clienteId) {
      return this.handleError(
        new Error('ID de cliente inválido'),
        'Se requiere el ID del cliente'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `contratante/cliente/${clienteId}`
      );
      return this.processResponseArray<GetContratante>(response);
    }, `Error al obtener contratantes del cliente ${clienteId}`);
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const propietariosService = new PropietariosService();
export const contratantesService = new ContratantesService();

export default {
  propietariosService,
  contratantesService
};
