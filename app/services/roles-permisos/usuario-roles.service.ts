import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type { Roles } from '~/types/roles-permisos';

/**
 * Interface para asignar roles a un usuario
 */
export interface AssignUserRolesRequest {
  roles: number[];
}

/**
 * Servicio especializado para gestión de roles asignados a usuarios
 * Aplica SOLID: Single Responsibility = solo asignación de roles a usuarios
 */
export class UsuarioRolesService extends BaseApiService {
  /**
   * Obtiene los roles asignados a un usuario
   * @param codigoUsuario Código del usuario
   */
  async getByUsuario(
    codigoUsuario: string
  ): Promise<ServiceResponse<Roles[]>> {
    if (!codigoUsuario?.trim()) {
      return this.handleError(
        new Error('Código inválido'),
        'El código del usuario es requerido'
      );
    }

    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get(
          `${codigoUsuario}/roles`
        );
        return this.processResponseArray<Roles>(response);
      },
      `Error al obtener roles del usuario ${codigoUsuario}`
    );
  }

  /**
   * Asigna roles a un usuario
   * El API espera un array directo de IDs de roles, no un objeto con propiedad roles
   * @param codigoUsuario Código del usuario
   * @param request Datos de roles a asignar
   */
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

    return this.executeDataOperation(
      async () => {
        console.log('📤 API Request:', {
          endpoint,
          method: 'POST',
          body: request.roles
        });

        // El API espera un array directo, no un objeto con propiedad roles
        const response = await this.httpClient.post(
          endpoint,
          request.roles
        );

        console.log('📥 API Response:', response);

        // Respuesta 204 significa éxito sin contenido
        if (response.status === 204) {
          // Devolvemos un array vacío ya que no tenemos datos específicos
          return [];
        }

        return this.processResponseArray<Roles>(response);
      },
      `Error al asignar roles al usuario ${codigoUsuario}`
    );
  }

  /**
   * Quita un rol específico de un usuario
   * @param codigoUsuario Código del usuario
   * @param idRol ID del rol a quitar
   */
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

    return this.executeDataOperation(
      async () => {
        console.log('📤 API Request:', {
          endpoint,
          method: 'DELETE'
        });

        await this.httpClient.delete(endpoint);

        console.log('📥 API Response: Success');

        return true;
      },
      `Error al quitar el rol ${idRol} del usuario ${codigoUsuario}`
    );
  }
}

export const usuarioRolesService = new UsuarioRolesService();
