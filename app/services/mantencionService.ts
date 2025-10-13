import api from '~/lib/api';
import type {
  CiclosFacturacion,
  Claves,
  ComboAsociadoConceptos,
  Conceptos,
  CreateNichoRequest,
  Empalme,
  Marca,
  Nicho,
  Parametro,
  Sectores,
  Tarifas,
  TiposContrato,
  UpdateNichoRequest,
  Zonas
} from '~/types/mantencion';

/**
 * Interfaz estándar para respuestas del servicio de mantención
 * Encapsula el resultado exitoso o error de operaciones
 *
 * @template T - Tipo de datos que retorna la operación exitosa
 */
export interface MantencionServiceResponse<T> {
  /** Datos devueltos en caso de éxito, null si hay error */
  data: T | null;
  /** Mensaje de error si falla la operación, null si es exitosa */
  error: string | null;
}

/**
 * Servicio para operaciones de mantención del sistema
 *
 * Maneja las operaciones CRUD y consultas para entidades de mantención como:
 * - Ciclos de facturación
 * - Claves, conceptos y empalmes
 * - Marcas, nichos y parámetros
 * - Sectores, tarifas, tipos de contrato y zonas
 *
 * Todas las operaciones retornan un objeto MantencionServiceResponse
 * que encapsula el resultado o error.
 */
class MantencionService {
  /**
   * Normaliza respuestas de API con formato variable
   *
   * El backend puede retornar datos en dos formatos diferentes:
   * - Formato anidado: `{ data: { data: T[] } }`
   * - Formato directo: `{ data: T[] }`
   *
   * Este método normaliza ambos casos y retorna siempre un array.
   *
   * @template T - Tipo de elementos del array esperado
   * @param response - Respuesta de axios con estructura variable
   * @returns Array de tipo T, o array vacío si no se encuentra data válida
   *
   * @private
   */
  private processApiResponse<T>(response: any): T[] {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data &&
      Array.isArray((response.data as { data: T[] }).data)
    ) {
      return (response.data as { data: T[] }).data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  /**
   * Obtiene la lista de ciclos de facturación
   *
   * @returns Promise con array de ciclos o error
   *
   * @example
   * ```typescript
   * const { data, error } = await mantencionService.getCiclosFacturacion();
   * if (error) {
   *   console.error('Error:', error);
   * } else {
   *   console.log('Ciclos:', data);
   * }
   * ```
   */
  async getCiclosFacturacion(): Promise<
    MantencionServiceResponse<CiclosFacturacion[]>
  > {
    try {
      const response = await api.get('/buscarCiclo');
      return {
        data: this.processApiResponse<CiclosFacturacion>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la lista de claves del sistema
   *
   * @returns Promise con array de claves o error
   */
  async getClaves(): Promise<MantencionServiceResponse<Claves[]>> {
    try {
      const response = await api.get('/buscarClaves');
      return {
        data: this.processApiResponse<Claves>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene conceptos y su combo asociado en paralelo
   *
   * Realiza dos peticiones simultáneas para optimizar el tiempo de carga:
   * - Conceptos del sistema
   * - Combo asociado a conceptos
   *
   * @returns Promise con objeto conteniendo ambos arrays o error
   *
   * @example
   * ```typescript
   * const { data, error } = await mantencionService.getConceptosData();
   * if (data) {
   *   const { conceptos, comboAsociadoConceptos } = data;
   * }
   * ```
   */
  async getConceptosData(): Promise<
    MantencionServiceResponse<{
      conceptos: Conceptos[];
      comboAsociadoConceptos: ComboAsociadoConceptos[];
    }>
  > {
    try {
      // Realizamos ambas peticiones en paralelo para mejor performance
      const [resConceptos, resComboAsociado] = await Promise.all([
        api.get('/buscarConceptos'),
        api.get('/combo-asociado-conoceptos')
      ]);

      return {
        data: {
          conceptos: this.processApiResponse<Conceptos>(resConceptos),
          comboAsociadoConceptos:
            this.processApiResponse<ComboAsociadoConceptos>(resComboAsociado)
        },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la lista de empalmes
   *
   * @returns Promise con array de empalmes o error
   */
  async getEmpalmes(): Promise<MantencionServiceResponse<Empalme[]>> {
    try {
      const response = await api.get('/buscarEmpalmes');
      return {
        data: this.processApiResponse<Empalme>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la lista de marcas de medidores
   *
   * @returns Promise con array de marcas o error
   */
  async getMarcas(): Promise<MantencionServiceResponse<Marca[]>> {
    try {
      const response = await api.get('/buscarMarca');
      return {
        data: this.processApiResponse<Marca>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la lista de nichos
   *
   * @returns Promise con array de nichos o error
   */
  async getNichos(): Promise<MantencionServiceResponse<Nicho[]>> {
    try {
      const response = await api.get('/buscarNichoM');
      return {
        data: this.processApiResponse<Nicho>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Crea un nuevo nicho en el sistema
   *
   * @param nicho - Datos del nicho a crear
   * @returns Promise con el nicho creado o error
   *
   * @example
   * ```typescript
   * const nuevoNicho = { nombre: 'Nicho A', descripcion: 'Descripción' };
   * const { data, error } = await mantencionService.createNicho(nuevoNicho);
   * ```
   */
  async createNicho(
    nicho: CreateNichoRequest
  ): Promise<MantencionServiceResponse<Nicho>> {
    try {
      const response = await api.post('/CrearNichoM', nicho);
      return {
        data: response.data as Nicho,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un nicho existente
   *
   * @param id - ID del nicho a actualizar
   * @param nicho - Datos actualizados del nicho
   * @returns Promise con el nicho actualizado o error
   *
   * @example
   * ```typescript
   * const { data, error } = await mantencionService.updateNicho(1, {
   *   nombre: 'Nicho Actualizado'
   * });
   * ```
   */
  async updateNicho(
    id: number,
    nicho: UpdateNichoRequest
  ): Promise<MantencionServiceResponse<Nicho>> {
    try {
      const response = await api.patch(`/nichos/${id}`, nicho);
      return {
        data: response.data as Nicho,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la lista de parámetros del sistema
   *
   * @returns Promise con array de parámetros o error
   */
  async getParametros(): Promise<MantencionServiceResponse<Parametro[]>> {
    try {
      const response = await api.get('/buscarParametro');
      return {
        data: this.processApiResponse<Parametro>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la lista de sectores
   *
   * @returns Promise con array de sectores o error
   */
  async getSectores(): Promise<MantencionServiceResponse<Sectores[]>> {
    try {
      const response = await api.get('/buscarSector');
      return {
        data: this.processApiResponse<Sectores>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la lista de tarifas
   *
   * @returns Promise con array de tarifas o error
   */
  async getTarifas(): Promise<MantencionServiceResponse<Tarifas[]>> {
    try {
      const response = await api.get('/buscarTarifa');
      return {
        data: this.processApiResponse<Tarifas>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la lista de tipos de contratos
   *
   * @returns Promise con array de tipos de contrato o error
   */
  async getTiposContratos(): Promise<
    MantencionServiceResponse<TiposContrato[]>
  > {
    try {
      const response = await api.get('/buscarTipoContrato');
      return {
        data: this.processApiResponse<TiposContrato>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene la lista de zonas
   *
   * @returns Promise con array de zonas o error
   */
  async getZonas(): Promise<MantencionServiceResponse<Zonas[]>> {
    try {
      const response = await api.get('/buscarZona');
      return {
        data: this.processApiResponse<Zonas>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

/**
 * Instancia singleton del servicio de mantención
 *
 * @example
 * ```typescript
 * import { mantencionService } from '~/services/mantencionService';
 *
 * const { data, error } = await mantencionService.getCiclosFacturacion();
 * ```
 */
export const mantencionService = new MantencionService();
