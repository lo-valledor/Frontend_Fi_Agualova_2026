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
export {
  acometidaService,
  administrationServices,
  administrationServices as administracionService,
  clientesService,
  contratantesService,
  contratosService,
  medidoresService,
  propietariosService,
  referenceDataService,
  usuariosService
} from './administration';
// Servicios de autenticación
export { authService } from './authService';
// Servicios de inserción automática (REFACTORIZADOS)
// Compatibilidad hacia atrás - insercionAutomaticaService ahora es un alias
export {
  autoInsertionService,
  autoInsertionServices,
  autoInsertionServices as insercionAutomaticaService,
  consumptionCalculationService,
  validationService
} from './auto-insertion';
// Servicios de mantención (REFACTORIZADOS)
// Compatibilidad hacia atrás - mantencionService ahora es un alias
export {
  classificationsService,
  conceptsService,
  mantencionServices,
  mantencionServices as mantencionService,
  nichosService,
  referenceDataMantencionService
} from './mantencion';
// Servicios de monitor
export { monitorService } from './monitorService';
// Servicios de reportes (REFACTORIZADOS)
// Compatibilidad hacia atrás - reportesService ahora es un alias
export {
  billingReportService,
  contractDetailsReportService,
  reportesServices,
  reportesServices as reportesService,
  summaryReportService
} from './reportes';
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
  AcometidaOperationResponse,
  ContratanteOperationResponse,
  ContratoOperationResponse,
  CreateContratoRequest,
  GetClientesDataResponse,
  MedidorOperationResponse,
  PropietarioOperationResponse,
  ReferenceDataBundle,
  UpdateContratoRequest,
  UsuarioOperationResponse
} from './administration';
export type {
  EntityListResponse,
  EntityOperationResponse,
  SearchByIdRequest,
  SearchByRutRequest,
  ValidationError
} from './administration/types';
export type {
  AnomalyDetection,
  AutoInsertionResult,
  ConsumptionCalculationResult,
  ConsumptionValidationRequest,
  InsertionBatchRequest,
  InsertionStatistics,
  MeterAnalysisResult,
  MeterValidationRequest,
  ReadingForInsertion,
  ValidationResult
} from './auto-insertion';
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
