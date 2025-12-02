/**
 * Módulo especializado para datos de referencia/catálogos
 *
 * Maneja operaciones con datos de referencia del sistema: giros, comunas, marcas,
 * condiciones de contrato, cargos facturables, etc.
 * Extiende BaseApiService para reutilizar lógica común.
 */

import api from '~/lib/api';
import { BaseApiService, type ServiceResponse } from '../core';
import type { GetGiros, GetComunas } from '~/types/administracion';

// ============================================================================
// TIPOS
// ============================================================================

/** Datos de referencia completos */
export interface ReferenceDataBundle {
  giros: GetGiros[];
  comunas: GetComunas[];
  marcas: Array<{ [key: string]: any }>;
  condiciones: Array<{ [key: string]: any }>;
  cargosTipo: Array<{ [key: string]: any }>;
  cargosFacturables: Array<{ [key: string]: any }>;
}

// ============================================================================
// SERVICIO
// ============================================================================

/**
 * Servicio especializado para operaciones con datos de referencia
 */
class ReferenceDataService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient = api) {
    super(httpClient);
  }

  /**
   * Obtiene todos los giros disponibles
   *
   * @returns Respuesta con lista de giros
   */
  async getGiros(): Promise<ServiceResponse<GetGiros[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('giro/buscar');
      return this.processResponseArray<GetGiros>(response);
    }, 'Error al obtener giros');
  }

  /**
   * Obtiene todas las comunas disponibles
   *
   * @returns Respuesta con lista de comunas
   */
  async getComunas(): Promise<ServiceResponse<GetComunas[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('comuna/por-region');
      return this.processResponseArray<GetComunas>(response);
    }, 'Error al obtener comunas');
  }

  /**
   * Obtiene todas las marcas de medidores disponibles
   *
   * @returns Respuesta con lista de marcas
   */
  async getMarcas(): Promise<ServiceResponse<Array<{ [key: string]: any }>>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('marca/buscar');
      return this.processResponseArray<{ [key: string]: any }>(response);
    }, 'Error al obtener marcas');
  }

  /**
   * Obtiene todas las condiciones de contrato disponibles
   *
   * @returns Respuesta con lista de condiciones
   */
  async getCondiciones(): Promise<
    ServiceResponse<Array<{ [key: string]: any }>>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('CondicionesContrato/buscar');
      return this.processResponseArray<{ [key: string]: any }>(response);
    }, 'Error al obtener condiciones de contrato');
  }

  /**
   * Obtiene todos los tipos de cargo de contrato
   *
   * @returns Respuesta con lista de tipos de cargo
   */
  async getCargosTipo(): Promise<
    ServiceResponse<Array<{ [key: string]: any }>>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('CargoTipoContrato/buscar');
      return this.processResponseArray<{ [key: string]: any }>(response);
    }, 'Error al obtener tipos de cargo');
  }

  /**
   * Obtiene todos los cargos facturables
   *
   * @returns Respuesta con lista de cargos facturables
   */
  async getCargosFacturables(): Promise<
    ServiceResponse<Array<{ [key: string]: any }>>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('CargoFacturable/buscar');
      return this.processResponseArray<{ [key: string]: any }>(response);
    }, 'Error al obtener cargos facturables');
  }

  /**
   * Obtiene todos los datos de referencia en paralelo
   *
   * Carga todos los catálogos de referencia en una sola llamada
   * combinada para optimizar el performance
   *
   * @returns Respuesta con todos los datos de referencia
   */
  async getAll(): Promise<ServiceResponse<ReferenceDataBundle>> {
    return this.executeDataOperation(async () => {
      const results = (await this.executeParallelOperations([
        () => this.httpClient.get('giro/buscar'),
        () => this.httpClient.get('comuna/por-region'),
        () => this.httpClient.get('marca/buscar'),
        () => this.httpClient.get('CondicionesContrato/buscar'),
        () => this.httpClient.get('CargoTipoContrato/buscar'),
        () => this.httpClient.get('CargoFacturable/buscar')
      ])) as [any, any, any, any, any, any];

      return {
        giros: this.processResponseArray<GetGiros>(results[0]),
        comunas: this.processResponseArray<GetComunas>(results[1]),
        marcas: this.processResponseArray<{ [key: string]: any }>(results[2]),
        condiciones: this.processResponseArray<{ [key: string]: any }>(
          results[3]
        ),
        cargosTipo: this.processResponseArray<{ [key: string]: any }>(
          results[4]
        ),
        cargosFacturables: this.processResponseArray<{ [key: string]: any }>(
          results[5]
        )
      };
    }, 'Error al obtener datos de referencia');
  }
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

export const referenceDataService = new ReferenceDataService();
export default referenceDataService;
