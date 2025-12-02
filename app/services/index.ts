// ============================================================================
// EXPORTACIONES DE MÓDULO CORE
// ============================================================================

export {
  successResponse,
  errorResponse,
  successResult,
  errorResult,
  toErrorMessage,
  isSuccess,
  hasError,
  type ServiceResponse,
  type OperationResult
} from './core/api-response';

export {
  processArrayResponse,
  processSingleResponse,
  hasData,
  extractErrorMessage as extractApiErrorMessage
} from './core/api-processing';

export { BaseApiService, type HttpClient } from './core/base-service';

// ============================================================================
// EXPORTACIONES DE SERVICIOS ESPECIALIZADOS
// ============================================================================

// Servicios de autenticación
export { authService } from './authService';

// Servicios de usuario
export { userService } from './userService';

// Servicios de monitor
export { monitorService } from './monitorService';

// Servicios de administración especializados (REFACTORIZADOS)
export {
  clientesService,
  contratosService,
  medidoresService,
  acometidaService,
  referenceDataService,
  usuariosService,
  propietariosService,
  contratantesService,
  administrationServices
} from './administration';

// Compatibilidad hacia atrás - administracionService ahora es un alias
export { administrationServices as administracionService } from './administration';

// Servicios de operaciones
export { operacionesService } from './operacionesService';

// Servicios de mantención
export { mantencionService } from './mantencionService';

// Servicios de roles y permisos (REFACTORIZADOS)
export {
  rolesService,
  menusService,
  permisosService,
  usuarioRolesService,
  rolesPermisosServices
} from './roles-permisos';

// Compatibilidad hacia atrás - rolesPermisosService ahora es un alias
export { rolesPermisosServices as rolesPermisosService } from './roles-permisos';

// Servicios de reportes
export { reportesService } from './reportesService';

// ============================================================================
// EXPORTACIONES DE TIPOS
// ============================================================================

export type {
  MonitorServiceResponse,
  MonitorBasicData
} from './monitorService';

export type {
  GetClientesDataResponse,
  CreateContratoRequest,
  UpdateContratoRequest,
  ContratoOperationResponse,
  MedidorOperationResponse,
  AcometidaOperationResponse,
  ReferenceDataBundle,
  UsuarioOperationResponse,
  PropietarioOperationResponse,
  ContratanteOperationResponse
} from './administration';

export type {
  EntityOperationResponse,
  EntityListResponse,
  SearchByRutRequest,
  SearchByIdRequest,
  ValidationResult,
  ValidationError
} from './administration/types';

export type { OperacionesServiceResponse } from './operacionesService';

export type { MantencionServiceResponse } from './mantencionService';

export type {
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateMenuRequest,
  UpdateMenuRequest,
  RolePermissions,
  AssignPermissionsRequest,
  AssignPermissionDirectRequest,
  UserPermissions,
  RoleMenuRelation,
  AssignUserRolesRequest
} from './roles-permisos';

