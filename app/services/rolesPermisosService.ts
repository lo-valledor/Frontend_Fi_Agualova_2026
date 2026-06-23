import api from '~/lib/api';
import type { Menus, Roles } from '~/types/roles-permisos';
import { API_TEMPLATES, debugApi, logApiError } from '~/utils/api-debug';

export interface RolesPermisosServiceResponse<T> {
  data: T | null;
  error: string | null;
}

// Interfaces para los tipos de datos específicos
export interface CrearRolData {
  idRol: number;
  nombreRol: string;
  descripcion: string;
  estadoRol: boolean;
}

export interface ActualizarRolData {
  idRol: number;
  nombreRol: string;
  descripcion: string;
  estadoRol: boolean;
}

export interface CrearMenuData {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  orden: number;
  icono: string | null;
  esVisible: boolean;
}

export interface ActualizarMenuData {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  orden: number;
  icono: string | null;
  esVisible: boolean;
}

export interface AsignarPermisosData {
  idRol: number;
  idMenu: number;
  permisos: {
    lectura?: boolean;
    escritura?: boolean;
    edicion?: boolean;
    eliminacion?: boolean;
  };
}

// Nueva interface para el formato directo del API
export interface AsignarPermisoDirecto {
  idRol: number;
  idMenu: number;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  fechaAsignacion?: string;
}

export interface AsignarRolesUsuarioData {
  roles: number[];
}

// Interfaces adicionales para permisos y relaciones
export interface RolMenu {
  idRol: number;
  idMenu: number;
  nombreRol: string;
  nombreMenu: string;
  permisos: {
    lectura: boolean;
    escritura: boolean;
    edicion: boolean;
    eliminacion: boolean;
  };
}

export interface RelacionRolMenu {
  idRelacion: number;
  idRol: number;
  idMenu: number;
  permisos: {
    lectura: boolean;
    escritura: boolean;
    edicion: boolean;
    eliminacion: boolean;
  };
  fechaCreacion?: string;
  fechaModificacion?: string;
}

class RolesPermisosService {
  private processApiResponse<T>(response: any): T[] {
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as { data: T[] }).data)
    ) {
      return (response.data as { data: T[] }).data;
    }

    if (
      response.data &&
      typeof response.data === 'object' &&
      !Array.isArray(response.data)
    ) {
      return [response.data as T];
    }

    return [];
  }

  private processSingleApiResponse<T>(response: any): T | null {
    if (response?.data) {
      if (typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as { data: T }).data || null;
      }
      return response.data as T;
    }
    return null;
  }

  // ============================================
  // MÉTODOS PARA ROLES
  // ============================================

  async getRoles(): Promise<RolesPermisosServiceResponse<Roles[]>> {
    try {
      const response = await api.get('listarRoles');
      const roles = this.processApiResponse<any>(response);

      // Mapear los datos del backend al formato esperado
      // El backend devuelve id pero debería ser idRol
      const mappedRoles = roles.map((rol: any) => ({
        idRol: rol.idRol || rol.id, // Usar idRol si existe, sino id
        nombreRol: rol.nombreRol,
        descripcion: rol.descripcion,
        estadoRol: rol.estadoRol
      }));

      return {
        data: mappedRoles,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getRolById(id: number): Promise<RolesPermisosServiceResponse<Roles>> {
    try {
      const response = await api.get(`ObtenerRolpor/${id}`);
      return {
        data: this.processSingleApiResponse<Roles>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async crearRol(
    rolData: CrearRolData
  ): Promise<RolesPermisosServiceResponse<Roles>> {
    try {
      const response = await api.post('crearRol', rolData);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        return {
          data: rolData as Roles,
          error: null
        };
      }

      return {
        data: this.processSingleApiResponse<Roles>(response),
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al crear el rol'
      };
    }
  }

  async actualizarRol(
    rolData: ActualizarRolData
  ): Promise<RolesPermisosServiceResponse<Roles>> {
    try {
      const response = await api.put('actualizarRol', rolData);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        return {
          data: rolData as Roles,
          error: null
        };
      }

      return {
        data: this.processSingleApiResponse<Roles>(response),
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al actualizar el rol'
      };
    }
  }

  async eliminarRol(
    id: number
  ): Promise<RolesPermisosServiceResponse<boolean>> {
    try {
      await api.delete(`eliminarRol/${id}`);
      return {
        data: true,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al eliminar el rol'
      };
    }
  }

  // ============================================
  // MÉTODOS PARA MENÚS
  // ============================================

  async getMenus(): Promise<RolesPermisosServiceResponse<Menus[]>> {
    const endpoint = 'ListarMenus';

    try {
      debugApi({
        endpoint,
        method: 'GET',
        expectedTemplate: [API_TEMPLATES.menu]
      });

      const response = await api.get(endpoint);
      const data = this.processApiResponse<Menus>(response);

      debugApi({
        endpoint,
        method: 'GET',
        response: data,
        expectedTemplate: [API_TEMPLATES.menu]
      });

      return {
        data,
        error: null
      };
    } catch (error) {
      logApiError(endpoint, error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getMenuById(
    idMenu: number
  ): Promise<RolesPermisosServiceResponse<Menus>> {
    try {
      const response = await api.get(`ObtenerMenu/${idMenu}`);
      return {
        data: this.processSingleApiResponse<Menus>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async crearMenu(
    menuData: CrearMenuData
  ): Promise<RolesPermisosServiceResponse<Menus>> {
    const endpoint = 'CrearMenu';

    try {
      debugApi({
        endpoint,
        method: 'POST',
        payload: menuData,
        expectedTemplate: API_TEMPLATES.menu
      });

      const response = await api.post(endpoint, menuData);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        debugApi({
          endpoint,
          method: 'POST',
          response: { status: 204, message: 'Success - No Content' }
        });

        return {
          data: menuData as Menus,
          error: null
        };
      }

      const data = this.processSingleApiResponse<Menus>(response);

      debugApi({
        endpoint,
        method: 'POST',
        response: data
      });

      return {
        data,
        error: null
      };
    } catch (error: any) {
      logApiError(endpoint, error, { menuData });

      // Intentar extraer el mensaje de error más descriptivo
      let errorMessage = 'Error al crear el menú';

      if (error.response?.data) {
        // Si el error tiene un título (común en ASP.NET)
        if (error.response.data.title) {
          errorMessage = error.response.data.title;
        }
        // Si tiene errores de validación
        else if (error.response.data.errors) {
          const validationErrors = Object.values(
            error.response.data.errors
          ).flat();
          errorMessage = validationErrors.join(', ');
        }
        // Si tiene un mensaje directo
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        // Si el data es un string
        else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        data: null,
        error: errorMessage
      };
    }
  }

  async actualizarMenu(
    menuData: ActualizarMenuData
  ): Promise<RolesPermisosServiceResponse<Menus>> {
    const endpoint = `ActualizarMenu/${menuData.idMenu}`;

    try {
      debugApi({
        endpoint,
        method: 'PUT',
        payload: menuData,
        expectedTemplate: API_TEMPLATES.menu
      });

      const response = await api.put(endpoint, menuData);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        debugApi({
          endpoint,
          method: 'PUT',
          response: { status: 204, message: 'Success - No Content' }
        });

        return {
          data: menuData as Menus,
          error: null
        };
      }

      const data = this.processSingleApiResponse<Menus>(response);

      debugApi({
        endpoint,
        method: 'PUT',
        response: data
      });

      return {
        data,
        error: null
      };
    } catch (error: any) {
      logApiError(endpoint, error, { menuData });

      // Intentar extraer el mensaje de error más descriptivo
      let errorMessage = 'Error al actualizar el menú';

      if (error.response?.data) {
        if (error.response.data.title) {
          errorMessage = error.response.data.title;
        } else if (error.response.data.errors) {
          const validationErrors = Object.values(
            error.response.data.errors
          ).flat();
          errorMessage = validationErrors.join(', ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        data: null,
        error: errorMessage
      };
    }
  }

  async eliminarMenu(
    idMenu: number
  ): Promise<RolesPermisosServiceResponse<boolean>> {
    try {
      await api.delete(`BorrarMenu/${idMenu}`);
      return {
        data: true,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al eliminar el menú'
      };
    }
  }

  // ============================================
  // MÉTODOS PARA ROL MENÚ
  // ============================================

  async getMenusPorRol(
    idRol: number
  ): Promise<RolesPermisosServiceResponse<RolMenu[]>> {
    const endpoint = `ListarMenu/${idRol}`;

    try {
      debugApi({
        endpoint,
        method: 'GET',
        payload: { idRol },
        expectedTemplate: [API_TEMPLATES.permisoRolMenu]
      });

      const response = await api.get(endpoint);
      const data = this.processApiResponse<RolMenu>(response);

      debugApi({
        endpoint,
        method: 'GET',
        response: data,
        expectedTemplate: [API_TEMPLATES.permisoRolMenu]
      });

      return {
        data,
        error: null
      };
    } catch (error) {
      logApiError(endpoint, error, { idRol });
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getRelacionRolMenu(
    idRol: number,
    idMenu: number
  ): Promise<RolesPermisosServiceResponse<RelacionRolMenu>> {
    try {
      const response = await api.get(`ObtenerRelacion/${idRol}/${idMenu}`);
      return {
        data: this.processSingleApiResponse<RelacionRolMenu>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async asignarPermisos(
    permisosData: AsignarPermisosData
  ): Promise<RolesPermisosServiceResponse<RelacionRolMenu>> {
    try {
      const response = await api.post('AsignarPermisos', permisosData);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        return {
          data: {
            idRelacion: 0, // El backend no devuelve el ID en 204
            idRol: permisosData.idRol,
            idMenu: permisosData.idMenu,
            permisos: {
              lectura: permisosData.permisos.lectura || false,
              escritura: permisosData.permisos.escritura || false,
              edicion: permisosData.permisos.edicion || false,
              eliminacion: permisosData.permisos.eliminacion || false
            }
          } as RelacionRolMenu,
          error: null
        };
      }

      return {
        data: this.processSingleApiResponse<RelacionRolMenu>(response),
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al asignar permisos'
      };
    }
  }

  async asignarPermisoDirecto(
    permisoData: AsignarPermisoDirecto
  ): Promise<RolesPermisosServiceResponse<any>> {
    const endpoint = 'AsignarPermisos';

    try {
      // Formato de fecha sin milisegundos: YYYY-MM-DDTHH:mm:ss
      const fechaActual =
        permisoData.fechaAsignacion || new Date().toISOString().split('.')[0];

      const dataToSend = {
        idRol: permisoData.idRol,
        idMenu: permisoData.idMenu,
        puedeVer: permisoData.puedeVer,
        puedeCrear: permisoData.puedeCrear,
        puedeEditar: permisoData.puedeEditar,
        puedeEliminar: permisoData.puedeEliminar,
        fechaAsignacion: fechaActual
      };

      debugApi({
        endpoint,
        method: 'POST',
        payload: dataToSend,
        expectedTemplate: API_TEMPLATES.permisoRolMenu
      });

      const response = await api.post(endpoint, dataToSend);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        debugApi({
          endpoint,
          method: 'POST',
          response: { status: 204, message: 'Success - No Content' }
        });

        return {
          data: dataToSend,
          error: null
        };
      }

      const responseData = this.processSingleApiResponse<any>(response);

      debugApi({
        endpoint,
        method: 'POST',
        response: responseData
      });

      return {
        data: responseData,
        error: null
      };
    } catch (error: any) {
      logApiError(endpoint, error, { permisoData });

      return {
        data: null,
        error:
          error.response?.data?.title ||
          error.response?.data?.message ||
          error.message ||
          'Error al asignar permiso'
      };
    }
  }

  async eliminarRelacionRolMenu(
    idRol: number,
    idMenu: number
  ): Promise<RolesPermisosServiceResponse<boolean>> {
    try {
      await api.delete(`EliminarRelacio/${idRol}/${idMenu}`);
      return {
        data: true,
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al eliminar la relación'
      };
    }
  }

  // ============================================
  // MÉTODOS PARA USUARIO ROL
  // ============================================

  async getRolesUsuario(
    codigoUsuario: string
  ): Promise<RolesPermisosServiceResponse<Roles[]>> {
    try {
      const response = await api.get(`${codigoUsuario}/roles`);
      return {
        data: this.processApiResponse<Roles>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async asignarRolesUsuario(
    codigoUsuario: string,
    rolesData: AsignarRolesUsuarioData
  ): Promise<RolesPermisosServiceResponse<Roles[]>> {
    try {
      // El API espera un array directo, no un objeto con propiedad roles
      const rolesArray = rolesData.roles;

      console.log('📤 API Request:', {
        endpoint: `${codigoUsuario}/roles`,
        method: 'POST',
        body: rolesArray
      });

      const response = await api.post(`${codigoUsuario}/roles`, rolesArray);

      console.log('📥 API Response:', response);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        // Devolvemos un array vacío ya que no tenemos datos específicos
        return {
          data: [],
          error: null
        };
      }

      return {
        data: this.processApiResponse<Roles>(response),
        error: null
      };
    } catch (error: any) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      return {
        data: null,
        error:
          error.response?.data?.title ||
          error.response?.data?.message ||
          error.message ||
          'Error al asignar roles al usuario'
      };
    }
  }

  async quitarRolUsuario(
    codigoUsuario: string,
    idRol: number
  ): Promise<RolesPermisosServiceResponse<boolean>> {
    try {
      console.log('📤 API Request:', {
        endpoint: `${codigoUsuario}/roles/${idRol}`,
        method: 'DELETE'
      });

      await api.delete(`${codigoUsuario}/roles/${idRol}`);

      console.log('📥 API Response: Success');

      return {
        data: true,
        error: null
      };
    } catch (error: any) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });

      return {
        data: null,
        error:
          error.response?.data?.title ||
          error.response?.data?.message ||
          error.message ||
          'Error al quitar el rol del usuario'
      };
    }
  }
}

export const rolesPermisosService = new RolesPermisosService();
