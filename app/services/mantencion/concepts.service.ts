import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type {
  Claves,
  Conceptos,
  ComboAsociadoConceptos
} from '~/types/mantencion';
import api from '~/lib/api';

/**
 * Concepts and Keys Data Interface
 */
export interface ConceptosData {
  conceptos: Conceptos[];
  comboAsociadoConceptos: ComboAsociadoConceptos[];
}

/**
 * ConceptsService (Mantencion Module)
 * Manages concepts, keys, and related classifications
 * - Keys/Claves
 * - Concepts/Conceptos
 * - Associated concepts
 */
export class ConceptsService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  /**
   * Get claves (keys)
   */
  async getClaves(): Promise<ServiceResponse<Claves[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarClaves');
      return this.processResponseArray<Claves>(response);
    }, 'Error getting keys');
  }

  /**
   * Get concepts and associated concepts data
   * Parallel execution for independent data loads
   */
  async getConceptosData(): Promise<ServiceResponse<ConceptosData>> {
    return this.executeDataOperation(async () => {
      const [resConceptos, resComboAsociado] =
        await this.executeParallelOperations([
          () => this.httpClient.get('/buscarConceptos'),
          () => this.httpClient.get('/combo-asociado-conoceptos')
        ]);

      return {
        conceptos: this.processResponseArray<Conceptos>(resConceptos),
        comboAsociadoConceptos:
          this.processResponseArray<ComboAsociadoConceptos>(resComboAsociado)
      };
    }, 'Error getting concepts data');
  }

  /**
   * Get concepts only
   */
  async getConceptos(): Promise<ServiceResponse<Conceptos[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarConceptos');
      return this.processResponseArray<Conceptos>(response);
    }, 'Error getting concepts');
  }

  /**
   * Get associated concepts only
   */
  async getComboAsociadoConceptos(): Promise<
    ServiceResponse<ComboAsociadoConceptos[]>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/combo-asociado-conoceptos');
      return this.processResponseArray<ComboAsociadoConceptos>(response);
    }, 'Error getting associated concepts');
  }
}

export const conceptsService = new ConceptsService(api);
