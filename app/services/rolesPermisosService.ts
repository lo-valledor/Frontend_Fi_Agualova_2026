import api from '~/lib/api';
import type {
  Permisos,
  Roles,
  UpdateRolePermissions
} from '~/types/roles-permisos';

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
  // ============================================
  // MÉTODOS PARA ROLES
  // ============================================

  async getAllRoles(): Promise<RolesPermisosServiceResponse<Roles[]>> {
    try {
      const response = await api.get('/GetAllRoles');
      return {
        data: response.data as Roles[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getAllPermissions(): Promise<RolesPermisosServiceResponse<Permisos[]>> {
    try {
      const response = await api.get('/GetAllPermissions');
      return {
        data: response.data as Permisos[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getRolePermissions(
    roleId: string
  ): Promise<RolesPermisosServiceResponse<Permisos[]>> {
    try {
      const response = await api.get(`/GetRolePermissions/${roleId}`);
      return {
        data: response.data as Permisos[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateRolePermissions(
    roleId: string,
    permisos: UpdateRolePermissions[]
  ): Promise<RolesPermisosServiceResponse<any>> {
    try {
      const response = await api.put(`/UpdateRolePermissions`, permisos);
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

export const rolesPermisosService = new RolesPermisosService();
