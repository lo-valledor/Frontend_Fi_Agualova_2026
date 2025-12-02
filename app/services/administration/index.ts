/**
 * Módulo de servicios de administración
 *
 * Exporta todos los servicios especializados para operaciones administrativas.
 * Cada servicio extiende BaseApiService y maneja un dominio específico.
 */

// ============================================================================
// IMPORTAR SERVICIOS
// ============================================================================

import { clientesService } from './clientes.service';
import { contratosService } from './contratos.service';
import { medidoresService } from './medidores.service';
import { acometidaService } from './acometida.service';
import { referenceDataService } from './reference-data.service';
import { usuariosService } from './usuarios.service';
import {
  propietariosService,
  contratantesService
} from './owners-contractors.service';

// ============================================================================
// SERVICIOS ESPECIALIZADOS
// ============================================================================

export {
  clientesService,
  type GetClientesDataResponse
} from './clientes.service';
export {
  contratosService,
  type ContratoOperationResponse
} from './contratos.service';
export {
  medidoresService,
  type MedidorOperationResponse
} from './medidores.service';
export {
  acometidaService,
  type AcometidaOperationResponse
} from './acometida.service';
export {
  referenceDataService,
  type ReferenceDataBundle
} from './reference-data.service';
export {
  usuariosService,
  type UsuarioOperationResponse
} from './usuarios.service';
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
export {
  clientesService as clientes,
  contratosService as contratos,
  medidoresService as medidores,
  acometidaService as acometidas,
  referenceDataService as referenceData,
  usuariosService as usuarios,
  propietariosService as propietarios,
  contratantesService as contratantes
};

export const administrationServices = {
  clientes: clientesService,
  contratos: contratosService,
  medidores: medidoresService,
  acometidas: acometidaService,
  referenceData: referenceDataService,
  usuarios: usuariosService,
  propietarios: propietariosService,
  contratantes: contratantesService
};
