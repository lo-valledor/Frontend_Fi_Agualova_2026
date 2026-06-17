import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type { Roles } from '~/types/roles-permisos';


export interface CreateRoleRequest {
  nombreRol: string;
  descripcion: string;
  estadoRol: boolean;
}


export interface UpdateRoleRequest extends CreateRoleRequest {
  idRol: number;
}


export class RolesService extends BaseApiService {
  
  constructor(httpClient?: any) {
    super(httpClient);
  }

  
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
