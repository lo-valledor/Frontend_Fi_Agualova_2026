import type { ServiceResponse } from '~/services/core/api-response';
import { BaseApiService } from '~/services/core/base-service';
import type { Roles } from '~/types/roles-permisos';

export interface AssignUserRolesRequest {
  roles: number[];
}

export class UsuarioRolesService extends BaseApiService {
  constructor(httpClient?: any) {
    super(httpClient);
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

  async assignToUsuario(
    codigoUsuario: string,
    request: AssignUserRolesRequest
  ): Promise<ServiceResponse<Roles[]>> {
    if (!codigoUsuario?.trim()) {
      return this.handleError(
        new Error('Código inválido'),
        'El código del usuario es requerido'
      );
    }

    if (!Array.isArray(request.roles) || request.roles.length === 0) {
      return this.handleError(
        new Error('Roles vacío'),
        'Se debe asignar al menos un rol'
      );
    }

    const endpoint = `${codigoUsuario}/roles`;

    return this.executeDataOperation(async () => {
      // El API espera un array directo, no un objeto con propiedad roles
      const response = await this.httpClient.post(endpoint, request.roles);

      // Respuesta 204 significa éxito sin contenido
      if (response.status === 204) {
        // Devolvemos un array vacío ya que no tenemos datos específicos
        return [];
      }

      return this.processResponseArray<Roles>(response);
    }, `Error al asignar roles al usuario ${codigoUsuario}`);
  }

  async removeFromUsuario(
    codigoUsuario: string,
    idRol: number
  ): Promise<ServiceResponse<boolean>> {
    if (!codigoUsuario?.trim()) {
      return this.handleError(
        new Error('Código inválido'),
        'El código del usuario es requerido'
      );
    }

    if (!idRol) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del rol es requerido'
      );
    }

    const endpoint = `${codigoUsuario}/roles/${idRol}`;

    return this.executeDataOperation(async () => {
      await this.httpClient.delete(endpoint);

      return true;
    }, `Error al quitar el rol ${idRol} del usuario ${codigoUsuario}`);
  }
}

export const usuarioRolesService = new UsuarioRolesService();
