/**
 * Módulo de servicios de administración
 *
 * Exporta todos los servicios especializados para operaciones administrativas.
 * Cada servicio extiende BaseApiService y maneja un dominio específico.
 */

// ============================================================================
// SERVICIOS ESPECIALIZADOS
// ============================================================================

export { clientesService, type GetClientesDataResponse } from './clientes.service';
export { contratosService, type ContratoOperationResponse } from './contratos.service';
export { medidoresService, type MedidorOperationResponse } from './medidores.service';
export { acometidaService, type AcometidaOperationResponse } from './acometida.service';
export { referenceDataService, type ReferenceDataBundle } from './reference-data.service';
export { usuariosService, type UsuarioOperationResponse } from './usuarios.service';
export {
  propietariosService,
  contratantesService,
  type PropietarioOperationResponse,
  type ContratanteOperationResponse
} from './owners-contractors.service';

// ============================================================================
// TIPOS COMPARTIDOS
// ============================================================================

export type * from './clientes.service';
export type * from './contratos.service';
export type * from './medidores.service';
export type * from './acometida.service';
export type * from './reference-data.service';
export type * from './usuarios.service';
export type * from './owners-contractors.service';

// ============================================================================
// TIPOS BASE DE ADMINISTRACIÓN
// ============================================================================

export type * from './types';

// ============================================================================
// CONVENIENCIA: ACCESO CONSOLIDADO
// ============================================================================

/**
 * Servicios de administración consolidados
 *
 * Proporciona acceso a todos los servicios especializados en un solo punto.
 * Cada propiedad corresponde a un dominio específico del negocio.
 *
 * @example
 * ```typescript
 * import { administrationServices } from '~/services/administration';
 *
 * // Acceso directo a servicios
 * const clientes = await administrationServices.clientes.getAll();
 * const contratos = await administrationServices.contratos.getAll();
 * const medidores = await administrationServices.medidores.getAll();
 * ```
 */
export const administrationServices = {
  clientes: require('./clientes.service').clientesService,
  contratos: require('./contratos.service').contratosService,
  medidores: require('./medidores.service').medidoresService,
  acometidas: require('./acometida.service').acometidaService,
  referenceData: require('./reference-data.service').referenceDataService,
  usuarios: require('./usuarios.service').usuariosService,
  propietarios: require('./owners-contractors.service').propietariosService,
  contratantes: require('./owners-contractors.service').contratantesService
};
