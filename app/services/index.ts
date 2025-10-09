// Servicios de autenticación
export { authService } from './authService';

// Servicios de usuario
export { userService } from './userService';

// Servicios de monitor
export { monitorService } from './monitorService';

// Servicios de administración
export { administracionService } from './administracionService';

// Servicios de operaciones
export { operacionesService } from './operacionesService';

// Servicios de mantención
export { mantencionService } from './mantencionService';

// Servicios de IA
export { aiService } from './aiService';

// Tipos de servicios
export type {
  MonitorServiceResponse,
  MonitorBasicData
} from './monitorService';
export type { AdministracionServiceResponse } from './administracionService';
export type { OperacionesServiceResponse } from './operacionesService';
export type { MantencionServiceResponse } from './mantencionService';

// Tipos de IA
export type {
  ProyeccionIARequest,
  ProyeccionIAResponse,
  ProyeccionMensual,
  ProyeccionMetadata,
  AnomaliaRequest,
  AnomaliaResponse,
  LecturaFaltanteRequest,
  LecturaFaltanteResponse,
  HealthResponse
} from './aiService';
