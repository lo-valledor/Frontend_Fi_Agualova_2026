import type { ServiceResponse } from '~/services/core/api-response';
import { BaseApiService } from '~/services/core/base-service';
import type { Roles } from '~/types/roles-permisos';

export interface CreateRoleRequest {
  nombreRol: string;
  descripcion: string;
  estadoRol: boolean;
}

export interface UpdateRoleRequest extends CreateRoleRequest {
  idRol: number;
}

const mapRoleResponse = (role: any): Roles => ({
  id: String(role.id ?? role.idRol ?? ''),
  name: role.name ?? role.nombreRol ?? '',
  normalizedName: role.normalizedName ?? role.descripcion ?? '',
  concurrencyStamp: role.concurrencyStamp ?? null
});

export class RolesService extends BaseApiService {
  constructor(httpClient?: any) {
    super(httpClient);
  }

  async getAll(): Promise<ServiceResponse<Roles[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/GetAllRoles');
      const roles = this.processResponseArray<any>(response);
      return roles.map(mapRoleResponse);
    }, 'Error al obtener roles');
  }

  async getById(id: string): Promise<ServiceResponse<Roles | null>> {
    if (!id?.trim()) {
      return this.handleError(
        new Error('ID invalido'),
        'El ID del rol es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`/roles/${id}`);
      const data = this.processResponseSingle<any>(response);
      return data ? mapRoleResponse(data) : null;
    }, `Error al obtener el rol ${id}`) as Promise<
      ServiceResponse<Roles | null>
    >;
  }

  async create(_request: CreateRoleRequest): Promise<ServiceResponse<Roles>> {
    return this.handleError(
      new Error('No soportado'),
      'La creacion de roles no esta disponible en los endpoints nuevos'
    );
  }

  async update(_request: UpdateRoleRequest): Promise<ServiceResponse<Roles>> {
    return this.handleError(
      new Error('No soportado'),
      'La actualizacion de roles no esta disponible en los endpoints nuevos'
    );
  }

  async delete(_id: number): Promise<ServiceResponse<boolean>> {
    return this.handleError(
      new Error('No soportado'),
      'La eliminacion de roles no esta disponible en los endpoints nuevos'
    );
  }
}

export const rolesService = new RolesService();
