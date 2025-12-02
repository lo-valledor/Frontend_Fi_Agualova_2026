import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type { Menus } from '~/types/roles-permisos';
import { debugApi, API_TEMPLATES } from '~/utils/api-debug';

/**
 * Interface para crear un menú
 */
export interface CreateMenuRequest {
  nombreMenu: string;
  ruta: string;
  orden: number;
  icono?: string | null;
  esVisible: boolean;
}

/**
 * Interface para actualizar un menú
 */
export interface UpdateMenuRequest extends CreateMenuRequest {
  idMenu: number;
}

/**
 * Servicio especializado para gestión de menús
 * Aplica SOLID: Single Responsibility = solo gestión de menús
 */
export class MenusService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient?: any) {
    super(httpClient);
  }

  /**
   * Obtiene la lista completa de menús
   * @returns Respuesta con lista de menús
   */
  async getAll(): Promise<ServiceResponse<Menus[]>> {
    const endpoint = 'ListarMenus';

    return this.executeDataOperation(async () => {
      debugApi({
        endpoint,
        method: 'GET',
        expectedTemplate: [API_TEMPLATES.menu]
      });

      const response = await this.httpClient.get(endpoint);
      const data = this.processResponseArray<Menus>(response);

      debugApi({
        endpoint,
        method: 'GET',
        response: data,
        expectedTemplate: [API_TEMPLATES.menu]
      });

      return data;
    }, 'Error al obtener menús');
  }

  /**
   * Obtiene un menú específico por ID
   * @param idMenu ID del menú
   * @returns Respuesta con datos del menú o null si no existe
   */
  async getById(idMenu: number): Promise<ServiceResponse<Menus>> {
    if (!idMenu) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del menú es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`ObtenerMenu/${idMenu}`);
      return this.processResponseSingle<Menus>(response);
    }, `Error al obtener el menú ${idMenu}`) as Promise<ServiceResponse<Menus>>;
  }

  /**
   * Crea un nuevo menú
   * @param request Datos del menú a crear
   * @returns Respuesta con datos del menú creado
   */
  async create(request: CreateMenuRequest): Promise<ServiceResponse<Menus>> {
    if (!request.nombreMenu?.trim()) {
      return this.handleError(
        new Error('Nombre vacío'),
        'El nombre del menú es requerido'
      );
    }

    if (!request.ruta?.trim()) {
      return this.handleError(
        new Error('Ruta vacía'),
        'La ruta del menú es requerida'
      );
    }

    const endpoint = 'CrearMenu';

    return this.executeDataOperation(async () => {
      debugApi({
        endpoint,
        method: 'POST',
        payload: request,
        expectedTemplate: API_TEMPLATES.menu
      });

      const response = await this.httpClient.post(endpoint, request);

      // Respuesta 204 significa éxito sin contenido
      if (response.status === 204) {
        debugApi({
          endpoint,
          method: 'POST',
          response: { status: 204, message: 'Success - No Content' }
        });

        return {
          idMenu: 0,
          ...request
        } as Menus;
      }

      const data = this.processResponseSingle<Menus>(response);

      debugApi({
        endpoint,
        method: 'POST',
        response: data
      });

      return data;
    }, 'Error al crear el menú') as Promise<ServiceResponse<Menus>>;
  }

  /**
   * Actualiza un menú existente
   * @param request Datos del menú a actualizar
   * @returns Respuesta con datos del menú actualizado
   */
  async update(request: UpdateMenuRequest): Promise<ServiceResponse<Menus>> {
    if (!request.idMenu) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del menú es requerido'
      );
    }

    if (!request.nombreMenu?.trim()) {
      return this.handleError(
        new Error('Nombre vacío'),
        'El nombre del menú es requerido'
      );
    }

    const endpoint = `ActualizarMenu/${request.idMenu}`;

    return this.executeDataOperation(async () => {
      debugApi({
        endpoint,
        method: 'PUT',
        payload: request,
        expectedTemplate: API_TEMPLATES.menu
      });

      const response = await this.httpClient.put(endpoint, request);

      // Respuesta 204 significa éxito sin contenido
      if (response.status === 204) {
        debugApi({
          endpoint,
          method: 'PUT',
          response: { status: 204, message: 'Success - No Content' }
        });

        return {
          nombreMenu: request.nombreMenu,
          ruta: request.ruta,
          orden: request.orden,
          icono: request.icono,
          esVisible: request.esVisible,
          idMenu: request.idMenu
        } as Menus;
      }

      const data = this.processResponseSingle<Menus>(response);

      debugApi({
        endpoint,
        method: 'PUT',
        response: data
      });

      return data;
    }, 'Error al actualizar el menú') as Promise<ServiceResponse<Menus>>;
  }

  /**
   * Elimina un menú
   * @param idMenu ID del menú a eliminar
   * @returns Respuesta con confirmación de éxito
   */
  async delete(idMenu: number): Promise<ServiceResponse<boolean>> {
    if (!idMenu) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del menú es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      await this.httpClient.delete(`BorrarMenu/${idMenu}`);
      return true;
    }, `Error al eliminar el menú ${idMenu}`);
  }

  /**
   * Obtiene menús de un rol específico
   * @param idRol ID del rol
   * @returns Respuesta con lista de menús del rol
   */
  async getByRol(idRol: number): Promise<ServiceResponse<Menus[]>> {
    if (!idRol) {
      return this.handleError(
        new Error('ID inválido'),
        'El ID del rol es requerido'
      );
    }

    const endpoint = `ListarMenu/${idRol}`;

    return this.executeDataOperation(async () => {
      debugApi({
        endpoint,
        method: 'GET',
        payload: { idRol },
        expectedTemplate: [API_TEMPLATES.permisoRolMenu]
      });

      const response = await this.httpClient.get(endpoint);
      const data = this.processResponseArray<Menus>(response);

      debugApi({
        endpoint,
        method: 'GET',
        response: data,
        expectedTemplate: [API_TEMPLATES.permisoRolMenu]
      });

      return data;
    }, `Error al obtener menús del rol ${idRol}`);
  }
}

export const menusService = new MenusService();
