/**
 * Módulo especializado para operaciones con clientes
 *
 * Maneja todas las operaciones CRUD relacionadas con clientes del sistema.
 * Extiende BaseApiService para reutilizar lógica común.
 */

import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';
import type { GetClienteContrato, GetComunas } from '~/types/administracion';

// ============================================================================
// TIPOS
// ============================================================================

/** Respuesta con datos de clientes y combos relacionados */
export interface GetClientesDataResponse {
  clientes: GetClienteContrato[];
  comunas: GetComunas[];
}

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * Servicio especializado para operaciones con clientes
 */
class ClientesService extends BaseApiService {
  /**
   * Constructor
   */
  constructor(httpClient = api) {
    super(httpClient);
  }

  /**
   * Obtiene todos los clientes del sistema
   *
   * @returns Respuesta con lista de clientes
   */
  async getAll(): Promise<ServiceResponse<GetClienteContrato[]>> {
    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get('ClienteBuscar');
        return this.processResponseArray<GetClienteContrato>(response);
      },
      'Error al obtener clientes'
    );
  }

  /**
   * Obtiene datos de clientes con comunas
   *
   * Retorna clientes y comunas disponibles para formularios
   *
   * @returns Respuesta con clientes y comunas
   */
  async getDataWithCombos(): Promise<ServiceResponse<GetClientesDataResponse>> {
    return this.executeDataOperation(
      async () => {
        const [resClientes, resComunas] = await this.executeParallelOperations([
          () => this.httpClient.get('ClienteBuscar'),
          () => this.httpClient.get('comuna/por-region')
        ]);

        return {
          clientes: this.processResponseArray<GetClienteContrato>(resClientes[0]),
          comunas: this.processResponseArray<GetComunas>(resComunas[1])
        };
      },
      'Error al obtener datos de clientes'
    );
  }

  /**
   * Busca un cliente por RUT
   *
   * @param rut - RUT del cliente (con o sin formato)
   * @returns Respuesta con datos del cliente encontrado
   */
  async searchByRut(rut: string): Promise<ServiceResponse<GetClienteContrato | null>> {
    if (!rut || typeof rut !== 'string' || rut.trim().length === 0) {
      return this.handleError(
        new Error('RUT inválido'),
        'El RUT debe ser proporcionado'
      );
    }

    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get(`cliente/rut/${rut}`);
        return this.processResponseSingle<GetClienteContrato>(response);
      },
      `Error al buscar cliente con RUT ${rut}`
    );
  }

  /**
   * Obtiene todos los clientes por búsqueda genérica
   *
   * @returns Respuesta con lista de clientes
   */
  async search(): Promise<ServiceResponse<GetClienteContrato[]>> {
    return this.executeDataOperation(
      async () => {
        const response = await this.httpClient.get('cliente/buscar');
        return this.processResponseArray<GetClienteContrato>(response);
      },
      'Error al buscar clientes'
    );
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const clientesService = new ClientesService();
export default clientesService;
