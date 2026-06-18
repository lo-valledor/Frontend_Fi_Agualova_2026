import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';
import type { Usuarios } from '~/types/administracion';

// ============================================================================
// TIPOS
// ============================================================================


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


export interface UsuarioOperationResponse {
  usuario: Usuarios;
  message: string;
}

// ============================================================================
// SERVICIO
// ============================================================================


class UsuariosService extends BaseApiService {
  
  constructor(httpClient = api) {
    super(httpClient);
  }

  
  async getAll(): Promise<ServiceResponse<Usuarios[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('usuario/buscar');
      return this.processResponseArray<Usuarios>(response);
    }, 'Error al obtener usuarios');
  }

  
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
