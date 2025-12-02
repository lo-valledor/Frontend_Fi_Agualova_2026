/**
 * Módulo especializado para operaciones con usuarios
 *
 * Maneja todas las operaciones CRUD relacionadas con usuarios del sistema.
 * Extiende BaseApiService para reutilizar lógica común.
 */

import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';
import type { Usuarios } from '~/types/administracion';

// ============================================================================
// TIPOS
// ============================================================================

/** Solicitud para crear nuevo usuario */
export interface CreateUsuarioRequest {
  nombreDeUsuario: string;
  contrasena: string;
  email: string;
  perfilId: number;
  nombres: string;
  apellidos: string;
  departamento: number;
  activo: boolean;
}

/** Solicitud para actualizar usuario */
export interface UpdateUsuarioRequest {
  id: string | number;
  nombreDeUsuario?: string;
  contrasena?: string;
  nuevaContrasena?: string;
  nombres?: string;
  apellidos?: string;
  departamento?: number;
  activo?: boolean;
}

/** Respuesta de operación con usuario */
export interface UsuarioOperationResponse {
  usuario: Usuarios;
  message: string;
}

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * Servicio especializado para operaciones con usuarios
 */
class UsuariosService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient = api) {
    super(httpClient);
  }

  /**
   * Obtiene todos los usuarios del sistema
   *
   * @returns Respuesta con lista de usuarios
   */
  async getAll(): Promise<ServiceResponse<Usuarios[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('usuario/buscar');
      return this.processResponseArray<Usuarios>(response);
    }, 'Error al obtener usuarios');
  }

  /**
   * Obtiene un usuario específico por ID
   *
   * @param id - ID del usuario
   * @returns Respuesta con datos del usuario
   */
  async getById(
    id: string | number
  ): Promise<ServiceResponse<Usuarios | null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del usuario es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`usuario/${id}`);
      return this.processResponseSingle<Usuarios>(response);
    }, `Error al obtener usuario ${id}`);
  }

  /**
   * Crea un nuevo usuario
   *
   * @param data - Datos del nuevo usuario
   * @returns Respuesta con usuario creado
   */
  async create(
    data: CreateUsuarioRequest
  ): Promise<ServiceResponse<Usuarios | null>> {
    if (!data || Object.keys(data).length === 0) {
      return this.handleError(
        new Error('Datos vacíos'),
        'Se requieren datos válidos para crear el usuario'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('usuario', data);
      return this.processResponseSingle<Usuarios>(response);
    }, 'Error al crear usuario');
  }

  /**
   * Actualiza un usuario existente
   *
   * @param data - Datos a actualizar (incluye ID)
   * @returns Respuesta con usuario actualizado
   */
  async update(
    data: UpdateUsuarioRequest
  ): Promise<ServiceResponse<Usuarios | null>> {
    if (!data?.id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del usuario es requerido para actualizar'
      );
    }

    return this.executeDataOperation(async () => {
      const { id, ...updateData } = data;
      const response = await this.httpClient.put(`usuario/${id}`, updateData);
      return this.processResponseSingle<Usuarios>(response);
    }, `Error al actualizar usuario ${data.id}`);
  }

  /**
   * Elimina un usuario
   *
   * @param id - ID del usuario a eliminar
   * @returns Respuesta de éxito/error
   */
  async delete(id: string | number): Promise<ServiceResponse<null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del usuario es requerido para eliminar'
      );
    }

    return this.executeOperation(async () => {
      await this.httpClient.delete(`usuario/${id}`);
    }, `Usuario ${id} eliminado exitosamente`) as Promise<
      ServiceResponse<null>
    >;
  }

  /**
   * Busca usuarios por rol
   *
   * @param rolId - ID del rol
   * @returns Respuesta con usuarios del rol
   */
  async getByRol(rolId: string | number): Promise<ServiceResponse<Usuarios[]>> {
    if (!rolId) {
      return this.handleError(
        new Error('ID de rol inválido'),
        'Se requiere el ID del rol'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`usuario/rol/${rolId}`);
      return this.processResponseArray<Usuarios>(response);
    }, `Error al obtener usuarios del rol ${rolId}`);
  }

  /**
   * Busca usuarios por cliente/empresa
   *
   * @param empresaId - ID de la empresa/cliente
   * @returns Respuesta con usuarios de la empresa
   */
  async getByEmpresa(
    empresaId: string | number
  ): Promise<ServiceResponse<Usuarios[]>> {
    if (!empresaId) {
      return this.handleError(
        new Error('ID de empresa inválido'),
        'Se requiere el ID de la empresa'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `usuario/empresa/${empresaId}`
      );
      return this.processResponseArray<Usuarios>(response);
    }, `Error al obtener usuarios de la empresa ${empresaId}`);
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const usuariosService = new UsuariosService();
export default usuariosService;
