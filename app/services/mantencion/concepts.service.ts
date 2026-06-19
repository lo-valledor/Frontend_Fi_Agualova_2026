import api from '~/lib/api';
import type { ServiceResponse } from '~/services/core/api-response';
import { BaseApiService } from '~/services/core/base-service';
import type {
  Claves,
  ComboAsociadoConceptos,
  Conceptos
} from '~/types/mantencion';

export interface ConceptosData {
  conceptos: Conceptos[];
  comboAsociadoConceptos: ComboAsociadoConceptos[];
}

export class ConceptsService extends BaseApiService {
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  async getClaves(): Promise<ServiceResponse<Claves[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarClaves');
      return this.processResponseArray<Claves>(response);
    }, 'Error getting keys');
  }

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

  async getConceptos(): Promise<ServiceResponse<Conceptos[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/buscarConceptos');
      return this.processResponseArray<Conceptos>(response);
    }, 'Error getting concepts');
  }

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
