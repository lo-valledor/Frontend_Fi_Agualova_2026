import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import { debugApi, logApiError, API_TEMPLATES } from '~/utils/api-debug';

/**
 * Interface para los permisos de un rol sobre un menú
 */
export interface RolePermissions {
  lectura?: boolean;
  escritura?: boolean;
  edicion?: boolean;
  eliminacion?: boolean;
}

/**
 * Interface para asignar permisos en formato legado
 */
export interface AssignPermissionsRequest {
  idRol: number;
  idMenu: number;
  permisos: RolePermissions;
}

/**
 * Interface para asignar permisos en formato directo del API
 */
export interface AssignPermissionDirectRequest {
  idRol: number;
  idMenu: number;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  fechaAsignacion?: string;
}

/**
 * Interface para permisos de usuario
 */
export interface UserPermissions {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

/**
 * Interface para relación rol-menú con permisos
 */
export interface RoleMenuRelation {
  idRelacion: number;
  idRol: number;
  idMenu: number;
  nombreRol: string;
  nombreMenu: string;
  permisos: RolePermissions;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

/**
 * Servicio especializado para gestión de permisos (rol-menú)
 * Aplica SOLID: Single Responsibility = solo gestión de permisos
 */
export class PermisosService extends BaseApiService {
  /**
   * Obtiene los permisos de un usuario específico
   * @param codigoUsuario Código del usuario
   */
  async getUsuarioPermisos(
    codigoUsuario: string
  ): Promise<ServiceResponse<UserPermissions[]>> {
    if (!codigoUsuario?.trim()) {
      return this.handleError(
        new Error('Código inválido'),
        'El código del usuario es requerido'
      );
    }

    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get(
          `ObtenerPermisoUsuario/${codigoUsuario}`
        );
        return this.processResponseArray<UserPermissions>(response);
      },
      `Error al obtener permisos del usuario ${codigoUsuario}`
    );
  }

  /**
   * Obtiene la relación específica entre un rol y un menú
   * @param idRol ID del rol
   * @param idMenu ID del menú
   */
  async getRelacionRolMenu(
    idRol: number,
    idMenu: number
  ): Promise<ServiceResponse<RoleMenuRelation | null>> {
    if (!idRol || !idMenu) {
      return this.handleError(
        new Error('IDs inválidos'),
        'Los IDs del rol y menú son requeridos'
      );
    }

    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get(
          `ObtenerRelacion/${idRol}/${idMenu}`
        );
        return this.processResponseSingle<RoleMenuRelation>(response);
      },
      `Error al obtener relación rol ${idRol} - menú ${idMenu}`
    );
  }

  /**
   * Asigna permisos a un rol sobre un menú (formato legado)
   * @param request Datos de los permisos a asignar
   */
  async assignPermissions(
    request: AssignPermissionsRequest
  ): Promise<ServiceResponse<RoleMenuRelation>> {
    if (!request.idRol || !request.idMenu) {
      return this.handleError(
        new Error('IDs inválidos'),
        'Los IDs del rol y menú son requeridos'
      );
    }

    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.post(
          'AsignarPermisos',
          request
        );

        // Respuesta 204 significa éxito sin contenido
        if (response.status === 204) {
          return {
            idRelacion: 0,
            idRol: request.idRol,
            idMenu: request.idMenu,
            nombreRol: '',
            nombreMenu: '',
            permisos: {
              lectura: request.permisos.lectura || false,
              escritura: request.permisos.escritura || false,
              edicion: request.permisos.edicion || false,
              eliminacion: request.permisos.eliminacion || false
            }
          } as RoleMenuRelation;
        }

        return this.processResponseSingle<RoleMenuRelation>(response);
      },
      'Error al asignar permisos'
    );
  }

  /**
   * Asigna permisos a un rol sobre un menú (formato directo del API)
   * @param request Datos de los permisos a asignar
   */
  async assignPermissionDirect(
    request: AssignPermissionDirectRequest
  ): Promise<ServiceResponse<AssignPermissionDirectRequest>> {
    if (!request.idRol || !request.idMenu) {
      return this.handleError(
        new Error('IDs inválidos'),
        'Los IDs del rol y menú son requeridos'
      );
    }

    const endpoint = 'AsignarPermisos';

    // Usar fecha actual si no se proporciona
    const fechaActual =
      request.fechaAsignacion || new Date().toISOString().split('.')[0];

    const dataToSend = {
      ...request,
      fechaAsignacion: fechaActual
    };

    return this.executeDataOperation(
      async () => {
        debugApi({
          endpoint,
          method: 'POST',
          payload: dataToSend,
          expectedTemplate: API_TEMPLATES.permisoRolMenu
        });

        const response = await this.httpClient.post(endpoint, dataToSend);

        // Respuesta 204 significa éxito sin contenido
        if (response.status === 204) {
          debugApi({
            endpoint,
            method: 'POST',
            response: { status: 204, message: 'Success - No Content' }
          });

          return dataToSend;
        }

        const responseData =
          this.processResponseSingle<AssignPermissionDirectRequest>(response);

        debugApi({
          endpoint,
          method: 'POST',
          response: responseData
        });

        return responseData;
      },
      'Error al asignar permiso'
    );
  }

  /**
   * Elimina la relación entre un rol y un menú (y sus permisos asociados)
   * @param idRol ID del rol
   * @param idMenu ID del menú
   */
  async deleteRelacionRolMenu(
    idRol: number,
    idMenu: number
  ): Promise<ServiceResponse<boolean>> {
    if (!idRol || !idMenu) {
      return this.handleError(
        new Error('IDs inválidos'),
        'Los IDs del rol y menú son requeridos'
      );
    }

    return this.executeDataOperation(
      async () => {
        await this.httpClient.delete(`EliminarRelacio/${idRol}/${idMenu}`);
        return true;
      },
      `Error al eliminar relación rol ${idRol} - menú ${idMenu}`
    );
  }
}

export const permisosService = new PermisosService();
