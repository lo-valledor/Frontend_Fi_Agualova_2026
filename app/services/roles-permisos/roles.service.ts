import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type { Roles } from '~/types/roles-permisos';

/**
 * Interface para crear un rol
 */
export interface CreateRoleRequest {
  nombreRol: string;
  descripcion: string;
  estadoRol: boolean;
}

/**
 * Interface para actualizar un rol
 */
export interface UpdateRoleRequest extends CreateRoleRequest {
  idRol: number;
}

/**
 * Servicio especializado para gestión de roles
 * Aplica SOLID: Single Responsibility = solo gestión de roles
 */
export class RolesService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient?: any) {
    super(httpClient);
  }

  /**
   * Obtiene la lista completa de roles
   * @returns Respuesta con lista de roles
   */
  async getAll(): Promise<ServiceResponse<Roles[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('listarRoles');
      const roles = this.processResponseArray<Roles>(response);

      // Mapear los datos del backend al formato esperado
      // El backend devuelve idUsuario pero debería ser idRol
      return roles.map((rol: any) => ({
        idRol: rol.idRol || rol.idUsuario,
        nombreRol: rol.nombreRol,
        descripcion: rol.descripcion,
        estadoRol: rol.estadoRol
      })) as Roles[];
    }, 'Error al obtener roles');
  }

  /**
   * Obtiene un rol específico por ID
   * @param id ID del rol
   * @returns Respuesta con datos del rol o null si no existe
   */
  async getById(id: number): Promise<ServiceResponse<Roles | null>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del rol es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`ObtenerRolpor/${id}`);
      return this.processResponseSingle<Roles>(response);
    }, `Error al obtener el rol ${id}`) as Promise<ServiceResponse<Roles>>;
  }

  /**
   * Crea un nuevo rol
   * @param request Datos del rol a crear
   * @returns Respuesta con datos del rol creado
   */
  async create(request: CreateRoleRequest): Promise<ServiceResponse<Roles>> {
    if (!request.nombreRol?.trim()) {
      return this.handleError(
        new Error('Nombre vacío'),
        'El nombre del rol es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('crearRol', request);

      // Respuesta 204 significa éxito sin contenido
      if (response.status === 204) {
        return {
          idRol: 0,
          nombreRol: request.nombreRol,
          descripcion: request.descripcion,
          estadoRol: request.estadoRol
        } as Roles;
      }

      return this.processResponseSingle<Roles>(response);
    }, 'Error al crear el rol') as Promise<ServiceResponse<Roles>>;
  }

  /**
   * Actualiza un rol existente
   * @param request Datos del rol a actualizar
   * @returns Respuesta con datos del rol actualizado
   */
  async update(request: UpdateRoleRequest): Promise<ServiceResponse<Roles>> {
    if (!request.idRol) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del rol es requerido'
      );
    }

    if (!request.nombreRol?.trim()) {
      return this.handleError(
        new Error('Nombre vacío'),
        'El nombre del rol es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.put('actualizarRol', request);

      // Respuesta 204 significa éxito sin contenido
      if (response.status === 204) {
        return {
          idRol: request.idRol,
          nombreRol: request.nombreRol,
          descripcion: request.descripcion,
          estadoRol: request.estadoRol
        } as Roles;
      }

      return this.processResponseSingle<Roles>(response);
    }, 'Error al actualizar el rol') as Promise<ServiceResponse<Roles>>;
  }

  /**
   * Elimina un rol
   * @param id ID del rol a eliminar
   * @returns Respuesta con confirmación de éxito
   */
  async delete(id: number): Promise<ServiceResponse<boolean>> {
    if (!id) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del rol es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      await this.httpClient.delete(`eliminarRol/${id}`);
      return true;
    }, `Error al eliminar el rol ${id}`);
  }

  /**
   * Obtiene roles de un usuario específico
   * @param codigoUsuario Código del usuario
   * @returns Respuesta con lista de roles del usuario
   */
  async getByUsuario(codigoUsuario: string): Promise<ServiceResponse<Roles[]>> {
    if (!codigoUsuario?.trim()) {
      return this.handleError(
        new Error('Código inválido'),
        'El código del usuario es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`${codigoUsuario}/roles`);
      return this.processResponseArray<Roles>(response);
    }, `Error al obtener roles del usuario ${codigoUsuario}`);
  }
}

export const rolesService = new RolesService();
