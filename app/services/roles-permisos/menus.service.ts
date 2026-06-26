import type { ServiceResponse } from '~/services/core/api-response';
import { BaseApiService } from '~/services/core/base-service';

export interface MenuItem {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  orden: number;
  icono: string | null;
  esVisible: boolean;
}

export interface CreateMenuRequest {
  nombreMenu: string;
  ruta: string;
  orden: number;
  icono?: string | null;
  esVisible: boolean;
}

export interface UpdateMenuRequest extends CreateMenuRequest {
  idMenu: number;
}

export class MenusService extends BaseApiService {
  constructor(httpClient?: any) {
    super(httpClient);
  }

  async getAll(): Promise<ServiceResponse<MenuItem[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('ListarMenus');
      return this.processResponseArray<MenuItem>(response);
    }, 'Error al obtener menus');
  }

  async getById(idMenu: number): Promise<ServiceResponse<MenuItem>> {
    if (!idMenu) {
      return this.handleError(
        new Error('ID invalido'),
        'El ID del menu es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get(`ObtenerMenu/${idMenu}`);
      return this.processResponseSingle<MenuItem>(response);
    }, `Error al obtener el menu ${idMenu}`) as Promise<
      ServiceResponse<MenuItem>
    >;
  }

  async create(request: CreateMenuRequest): Promise<ServiceResponse<MenuItem>> {
    if (!request.nombreMenu?.trim()) {
      return this.handleError(
        new Error('Nombre vacio'),
        'El nombre del menu es requerido'
      );
    }

    if (!request.ruta?.trim()) {
      return this.handleError(
        new Error('Ruta vacia'),
        'La ruta del menu es requerida'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.post('CrearMenu', request);

      if (response.status === 204) {
        return {
          idMenu: 0,
          nombreMenu: request.nombreMenu,
          ruta: request.ruta,
          orden: request.orden,
          icono: request.icono ?? null,
          esVisible: request.esVisible
        };
      }

      return this.processResponseSingle<MenuItem>(response);
    }, 'Error al crear el menu') as Promise<ServiceResponse<MenuItem>>;
  }

  async update(request: UpdateMenuRequest): Promise<ServiceResponse<MenuItem>> {
    if (!request.idMenu) {
      return this.handleError(
        new Error('ID invalido'),
        'El ID del menu es requerido'
      );
    }

    if (!request.nombreMenu?.trim()) {
      return this.handleError(
        new Error('Nombre vacio'),
        'El nombre del menu es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      const response = await this.httpClient.put(
        `ActualizarMenu/${request.idMenu}`,
        request
      );

      if (response.status === 204) {
        return {
          idMenu: request.idMenu,
          nombreMenu: request.nombreMenu,
          ruta: request.ruta,
          orden: request.orden,
          icono: request.icono ?? null,
          esVisible: request.esVisible
        };
      }

      return this.processResponseSingle<MenuItem>(response);
    }, 'Error al actualizar el menu') as Promise<ServiceResponse<MenuItem>>;
  }

  async delete(idMenu: number): Promise<ServiceResponse<boolean>> {
    if (!idMenu) {
      return this.handleError(
        new Error('ID invalido'),
        'El ID del menu es requerido'
      );
    }

    return this.executeDataOperation(async () => {
      await this.httpClient.delete(`BorrarMenu/${idMenu}`);
      return true;
    }, `Error al eliminar el menu ${idMenu}`);
  }
}

export const menusService = new MenusService();
