// ============================================================================
// EXPORTACIONES DE MÓDULO CORE
// ============================================================================

export {
  extractErrorMessage as extractApiErrorMessage,
  hasData,
  processArrayResponse,
  processSingleResponse
} from './core/api-processing';
export {
  errorResponse,
  errorResult,
  hasError,
  isSuccess,
  type OperationResult,
  type ServiceResponse,
  successResponse,
  successResult,
  toErrorMessage
} from './core/api-response';

export { BaseApiService, type HttpClient } from './core/base-service';

// ============================================================================
// EXPORTACIONES DE SERVICIOS ESPECIALIZADOS
// ============================================================================

// Servicios de administración especializados (REFACTORIZADOS)
// Compatibilidad hacia atrás - administracionService ahora es un alias
// Servicios de autenticación
export { authService } from './authService';
// Servicios de monitor
export { monitorService } from './monitorService';
// Servicios de roles y permisos (REFACTORIZADOS)
// Compatibilidad hacia atrás - rolesPermisosService ahora es un alias
export {
  menusService,
  permisosService,
  rolesPermisosServices,
  rolesPermisosServices as rolesPermisosService,
  rolesService,
  usuarioRolesService
} from './roles-permisos';
// Servicios de usuario
export { userService } from './userService';

// ============================================================================
// EXPORTACIONES DE TIPOS
// ============================================================================

export type {
  MonitorBasicData,
  MonitorServiceResponse
} from './monitorService';
export type { OperacionesServiceResponse } from './operacionesService';
export type {
  AssignPermissionDirectRequest,
  AssignPermissionsRequest,
  AssignUserRolesRequest,
  CreateMenuRequest,
  CreateRoleRequest,
  RoleMenuRelation,
  RolePermissions,
  UpdateMenuRequest,
  UpdateRoleRequest,
  UserPermissions
} from './roles-permisos';
