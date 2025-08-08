export interface Roles {
  idRol: number;
  nombreRol: string;
  descripcion: string;
  estadoRol: boolean;
}

export interface Menus {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  orden: number;
  icono: string;
  esVisible: boolean;
}

export interface ObtenerPermisoUsuario {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
}

export interface RolMenu {
  idRol: number;
  idMenu: number;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  fechaAsignacion: string;
}

export interface UsuarioRol {
  idRol: number;
  nombreRol: string;
  descripcion: string;
  estadoRol: boolean;
}

// Interfaces para la matriz de permisos
export interface PermisoRolMenu {
  idRol: number;
  idMenu: number;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  fechaAsignacion: string;
}

export interface AsignarPermisoData {
  idRol: number;
  idMenu: number;
  puedeVer: boolean;
  puedeCrear: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
  fechaAsignacion?: string;
}
