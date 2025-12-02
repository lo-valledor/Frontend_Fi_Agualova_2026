/**
 * Tipos compartidos para los servicios de roles y permisos
 */

export interface RoleMenuPermissions {
  lectura: boolean;
  escritura: boolean;
  edicion: boolean;
  eliminacion: boolean;
}

export interface RoleOperation {
  idRol: number;
  nombreRol: string;
  descripcion?: string;
  estadoRol?: boolean;
}

export interface MenuOperation {
  idMenu: number;
  nombreMenu: string;
  ruta: string;
  orden?: number;
}

export interface PermissionOperation {
  idRol: number;
  idMenu: number;
  permisos: RoleMenuPermissions;
}

export interface UserRoleAssignment {
  codigoUsuario: string;
  rolIds: number[];
}
