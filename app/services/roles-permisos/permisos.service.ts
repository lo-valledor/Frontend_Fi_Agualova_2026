import type { ServiceResponse } from '~/services/core/api-response';
import { BaseApiService } from '~/services/core/base-service';
import { API_TEMPLATES, debugApi } from '~/utils/api-debug';

export interface RolePermissions {
  lectura?: boolean;
  escritura?: boolean;
  edicion?: boolean;
  eliminacion?: boolean;
}

export interface AssignPermissionsRequest {
  idRol: number;
  idMenu: number;
  permisos: RolePermissions;
}

export interface AssignPermissionDirectRequest {
  idRol: number;
  idMenu: number;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  fechaAsignacion?: string;
}

export interface UserPermissions {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

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

export class PermisosService extends BaseApiService {
  constructor(httpClient?: any) {
    super(httpClient);
  }

  async getUsuarioPermisos(
    codigoUsuario: string
  ): Promise<ServiceResponse<UserPermissions[]>> {
    if (!codigoUsuario?.trim()) {
      return this.handleError(
        new Error('Código inválido'),
        'El código del usuario es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `ObtenerPermisoUsuario/${codigoUsuario}`
      );
      return this.processResponseArray<UserPermissions>(response);
    }, `Error al obtener permisos del usuario ${codigoUsuario}`);
  }

  async getRelacionRolMenu(
    idRol: number,
    idMenu: number
  ): Promise<ServiceResponse<RoleMenuRelation>> {
    if (!idRol || !idMenu) {
      return this.handleError(
        new Error('IDs inválidos'),
        'Los IDs del rol y menú son requeridos'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(
        `ObtenerRelacion/${idRol}/${idMenu}`
      );
      return this.processResponseSingle<RoleMenuRelation>(response);
    }, `Error al obtener relación rol ${idRol} - menú ${idMenu}`) as Promise<
      ServiceResponse<RoleMenuRelation>
    >;
  }

  async assignPermissions(
    request: AssignPermissionsRequest
  ): Promise<ServiceResponse<RoleMenuRelation>> {
    if (!request.idRol || !request.idMenu) {
      return this.handleError(
        new Error('IDs inválidos'),
        'Los IDs del rol y menú son requeridos'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('AsignarPermisos', request);

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
    }, 'Error al asignar permisos') as Promise<
      ServiceResponse<RoleMenuRelation>
    >;
  }

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

    return this.executeDataOperation(async () => {
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
    }, 'Error al asignar permiso') as Promise<
      ServiceResponse<AssignPermissionDirectRequest>
    >;
  }

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

    return this.executeDataOperation(async () => {
      await this.httpClient.delete(`EliminarRelacio/${idRol}/${idMenu}`);
      return true;
    }, `Error al eliminar relación rol ${idRol} - menú ${idMenu}`);
  }
}

export const permisosService = new PermisosService();
