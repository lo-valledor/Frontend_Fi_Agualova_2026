// ============================================================================
// IMPORTAR SERVICIOS
// ============================================================================

import { acometidaService } from './acometida.service';
import { clientesService } from './clientes.service';
import { contratosService } from './contratos.service';
import { medidoresService } from './medidores.service';
import {
  contratantesService,
  propietariosService
} from './owners-contractors.service';
import { referenceDataService } from './reference-data.service';
import { usuariosService } from './usuarios.service';

// ============================================================================
// SERVICIOS ESPECIALIZADOS
// ============================================================================

export {
  type AcometidaOperationResponse,
  acometidaService
} from './acometida.service';
export {
  clientesService,
  type GetClientesDataResponse
} from './clientes.service';
export {
  type ContratoOperationResponse,
  contratosService
} from './contratos.service';
export {
  type MedidorOperationResponse,
  medidoresService
} from './medidores.service';
export {
  type ContratanteOperationResponse,
  contratantesService,
  type PropietarioOperationResponse,
  propietariosService
} from './owners-contractors.service';
export {
  type ReferenceDataBundle,
  referenceDataService
} from './reference-data.service';
export {
  type UsuarioOperationResponse,
  usuariosService
} from './usuarios.service';

// ============================================================================
// TIPOS COMPARTIDOS
// ============================================================================

export type * from './acometida.service';
export type * from './clientes.service';
export type * from './contratos.service';
export type * from './medidores.service';
export type * from './owners-contractors.service';
export type * from './reference-data.service';
export type * from './usuarios.service';

// ============================================================================
// TIPOS BASE DE ADMINISTRACIÓN
// ============================================================================

export type * from './types';

// ============================================================================
// CONVENIENCIA: ACCESO CONSOLIDADO
// ============================================================================

export {
  acometidaService as acometidas,
  clientesService as clientes,
  contratantesService as contratantes,
  contratosService as contratos,
  medidoresService as medidores,
  propietariosService as propietarios,
  referenceDataService as referenceData,
  usuariosService as usuarios
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
