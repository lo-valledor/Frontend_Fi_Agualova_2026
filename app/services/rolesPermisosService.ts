import api from '~/lib/api';
import type { Menus, Roles } from '~/types/roles-permisos';

export interface RolesPermisosServiceResponse<T> {
  data: T | null;
  error: string | null;
}

// Interfaces para los tipos de datos específicos
export interface CrearRolData {
  nombre: string;
  descripcion?: string;
}

export interface ActualizarRolData {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CrearMenuData {
  nombre: string;
  url?: string;
  icono?: string;
  orden?: number;
  menuPadreId?: number;
}

export interface ActualizarMenuData {
  idMenu: number;
  nombre: string;
  url?: string;
  icono?: string;
  orden?: number;
  menuPadreId?: number;
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
export interface PermisosUsuario {
  codigoUsuario: string;
  idMenu: number;
  nombreMenu: string;
  permisos: {
    lectura: boolean;
    escritura: boolean;
    edicion: boolean;
    eliminacion: boolean;
  };
}

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
  /**
   * Función helper para procesar respuestas de API que devuelven arrays
   * @param response
   */
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

  /**
   * Función helper para procesar respuestas de API que devuelven objetos únicos
   * @param response
   */
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

  /**
   * Lista todos los roles configurados en el sistema
   */
  async getRoles(): Promise<RolesPermisosServiceResponse<Roles[]>> {
    try {
      const response = await api.get('listarRoles');
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

  /**
   * Obtiene los detalles de un rol específico por su ID
   * @param id
   */
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

  /**
   * Crea un nuevo rol en el sistema
   * @param rolData
   */
  async crearRol(
    rolData: CrearRolData
  ): Promise<RolesPermisosServiceResponse<Roles>> {
    try {
      const response = await api.post('crearRol', rolData);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        return {
          data: {
            idRol: 0, // Se establecerá por el backend
            nombreRol: rolData.nombre,
            descripcion: rolData.descripcion || '',
            estadoRol: true
          } as Roles,
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

  /**
   * Actualiza la información de un rol existente
   * @param rolData
   */
  async actualizarRol(
    rolData: ActualizarRolData
  ): Promise<RolesPermisosServiceResponse<Roles>> {
    try {
      const response = await api.put('actualizarRol', rolData);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        return {
          data: {
            idRol: rolData.id,
            nombreRol: rolData.nombre,
            descripcion: rolData.descripcion || '',
            estadoRol: true // Asumimos que está activo si se actualizó
          } as Roles,
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

  /**
   * Elimina un rol del sistema por su ID
   * @param id
   */
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

  /**
   * Lista todos los menús disponibles en el sistema
   */
  async getMenus(): Promise<RolesPermisosServiceResponse<Menus[]>> {
    try {
      const response = await api.get('ListarMenus');
      return {
        data: this.processApiResponse<Menus>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene los detalles de un menú específico por su ID
   * @param idMenu
   */
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

  /**
   * Crea un nuevo menú en el sistema
   * @param menuData
   */
  async crearMenu(
    menuData: CrearMenuData
  ): Promise<RolesPermisosServiceResponse<Menus>> {
    try {
      const response = await api.post('CrearMenu', menuData);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        return {
          data: {
            idMenu: 0, // El backend no devuelve el ID en 204
            nombreMenu: menuData.nombre,
            ruta: menuData.url || '',
            orden: menuData.orden || 0,
            icono: menuData.icono || '',
            esVisible: true
          } as Menus,
          error: null
        };
      }

      return {
        data: this.processSingleApiResponse<Menus>(response),
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al crear el menú'
      };
    }
  }

  /**
   * Actualiza la información de un menú existente
   * @param menuData
   */
  async actualizarMenu(
    menuData: ActualizarMenuData
  ): Promise<RolesPermisosServiceResponse<Menus>> {
    try {
      const response = await api.put(
        `ActualizarMenu/${menuData.idMenu}`,
        menuData
      );

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        return {
          data: {
            idMenu: menuData.idMenu,
            nombreMenu: menuData.nombre,
            ruta: menuData.url || '',
            orden: menuData.orden || 1,
            icono: menuData.icono || '',
            esVisible: true // Asumimos que está visible si se actualizó
          } as Menus,
          error: null
        };
      }

      return {
        data: this.processSingleApiResponse<Menus>(response),
        error: null
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al actualizar el menú'
      };
    }
  }

  /**
   * Elimina un menú del sistema
   * @param idMenu
   */
  async eliminarMenu(
    idMenu: number
  ): Promise<RolesPermisosServiceResponse<boolean>> {
    try {
      await api.delete(`BorrarMenu${idMenu}`);
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
  // MÉTODOS PARA PERMISOS DE USUARIOS
  // ============================================

  /**
   * Obtiene los permisos de menú asignados a un usuario específico
   * @param codigoUsuario
   */
  async getPermisosUsuario(
    codigoUsuario: string
  ): Promise<RolesPermisosServiceResponse<PermisosUsuario[]>> {
    try {
      const response = await api.get(`ObtenerPermisoUsuario/${codigoUsuario}`);
      return {
        data: this.processApiResponse<PermisosUsuario>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // ============================================
  // MÉTODOS PARA ROL MENÚ
  // ============================================

  /**
   * Lista todos los menús y permisos asociados a un rol específico
   * @param idRol
   */
  async getMenusPorRol(
    idRol: number
  ): Promise<RolesPermisosServiceResponse<RolMenu[]>> {
    try {
      const response = await api.get(`ListarMenu/${idRol}`);
      return {
        data: this.processApiResponse<RolMenu>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la relación específica entre un rol y un menú determinado
   * @param idRol
   * @param idMenu
   */
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

  /**
   * Asigna o actualiza los permisos de un rol sobre un menú
   * @param permisosData
   */
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

  /**
   * Asigna permisos usando el formato directo del API
   * @param permisoData
   */
  async asignarPermisoDirecto(
    permisoData: AsignarPermisoDirecto
  ): Promise<RolesPermisosServiceResponse<any>> {
    try {
      const dataToSend = {
        ...permisoData,
        fechaAsignacion: permisoData.fechaAsignacion || new Date().toISOString()
      };

      const response = await api.post('AsignarPermisos', dataToSend);

      // Si la respuesta es 204 (No Content), la operación fue exitosa
      if (response.status === 204) {
        return {
          data: dataToSend, // Devolvemos los datos que enviamos como confirmación
          error: null
        };
      }

      return {
        data: this.processSingleApiResponse<any>(response),
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

  /**
   * Elimina la relación de permisos entre un rol y un menú
   * @param idRol
   * @param idMenu
   */
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

  /**
   * Obtiene los roles asignados a un usuario
   * @param codigoUsuario
   */
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

  /**
   * Asigna uno o más roles a un usuario
   * @param codigoUsuario
   * @param rolesData
   */
  async asignarRolesUsuario(
    codigoUsuario: string,
    rolesData: AsignarRolesUsuarioData
  ): Promise<RolesPermisosServiceResponse<Roles[]>> {
    try {
      const response = await api.post(`${codigoUsuario}/roles`, rolesData);

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
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al asignar roles al usuario'
      };
    }
  }

  /**
   * Quita un rol específico a un usuario
   * @param codigoUsuario
   * @param idRol
   */
  async quitarRolUsuario(
    codigoUsuario: string,
    idRol: number
  ): Promise<RolesPermisosServiceResponse<boolean>> {
    try {
      await api.delete(`${codigoUsuario}/roles/${idRol}`);
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
          'Error al quitar el rol del usuario'
      };
    }
  }
}

export const rolesPermisosService = new RolesPermisosService();
