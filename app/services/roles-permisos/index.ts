/**
 * Barrel export para servicios de roles y permisos
 * Centraliza todas las exportaciones de la carpeta roles-permisos
 */

import { menusService } from './menus.service';
import { permisosService } from './permisos.service';
import { rolesService } from './roles.service';
import { usuarioRolesService } from './usuario-roles.service';

// Servicios
export { rolesService, RolesService } from './roles.service';
export type { CreateRoleRequest, UpdateRoleRequest } from './roles.service';

export { menusService, MenusService } from './menus.service';
export type { CreateMenuRequest, UpdateMenuRequest } from './menus.service';

export { permisosService, PermisosService } from './permisos.service';
export type {
  RolePermissions,
  AssignPermissionsRequest,
  AssignPermissionDirectRequest,
  UserPermissions,
  RoleMenuRelation
} from './permisos.service';

export {
  usuarioRolesService,
  UsuarioRolesService
} from './usuario-roles.service';
export type { AssignUserRolesRequest } from './usuario-roles.service';

// Tipos compartidos
export * from './types';

/**
 * Objeto consolidado con todos los servicios de roles y permisos
 * Permite importar como: import { rolesPermisosServices } from '~/services'
 */
export const rolesPermisosServices = {
  roles: rolesService,
  menus: menusService,
  permisos: permisosService,
  usuarioRoles: usuarioRolesService
};
