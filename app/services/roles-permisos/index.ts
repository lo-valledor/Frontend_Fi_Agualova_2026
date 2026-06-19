import { menusService } from './menus.service';
import { permisosService } from './permisos.service';
import { rolesService } from './roles.service';
import { usuarioRolesService } from './usuario-roles.service';

export type { CreateMenuRequest, UpdateMenuRequest } from './menus.service';
export { MenusService, menusService } from './menus.service';
export type {
  AssignPermissionDirectRequest,
  AssignPermissionsRequest,
  RoleMenuRelation,
  RolePermissions,
  UserPermissions
} from './permisos.service';
export { PermisosService, permisosService } from './permisos.service';
export type { CreateRoleRequest, UpdateRoleRequest } from './roles.service';
// Servicios
export { RolesService, rolesService } from './roles.service';
// Tipos compartidos
export * from './types';
export type { AssignUserRolesRequest } from './usuario-roles.service';
export {
  UsuarioRolesService,
  usuarioRolesService
} from './usuario-roles.service';

export const rolesPermisosServices = {
  roles: rolesService,
  menus: menusService,
  permisos: permisosService,
  usuarioRoles: usuarioRolesService
};
