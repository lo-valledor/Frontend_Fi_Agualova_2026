import api from "~/lib/api";
import type { ServiceResponse } from "~/services/core/api-response";
import { BaseApiService } from "~/services/core/base-service";
import type { Clave, Concepto, ConceptoAsociables } from "~/types/mantencion";

export interface ConceptosData {
  conceptos: Concepto[];
  comboAsociadoConceptos: ConceptoAsociables[];
}

export class ConceptsService extends BaseApiService {
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  async getClaves(): Promise<ServiceResponse<Clave[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get("/claves/buscar");
      return this.processResponseArray<Clave>(response);
    }, "Error getting keys");
  }

  async getConceptosData(): Promise<ServiceResponse<ConceptosData>> {
    return this.executeDataOperation(async () => {
      const [resConceptos, resComboAsociado] =
        await this.executeParallelOperations([
          () => this.httpClient.get("/conceptos/buscar"),
          () => this.httpClient.get("/conceptos/asociables"),
        ]);

      return {
        conceptos: this.processResponseArray<Concepto>(resConceptos),
        comboAsociadoConceptos:
          this.processResponseArray<ConceptoAsociables>(resComboAsociado),
      };
    }, "Error getting concepts data");
  }

  async getConceptos(): Promise<ServiceResponse<Concepto[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get("/conceptos/buscar");
      return this.processResponseArray<Concepto>(response);
    }, "Error getting concepts");
  }

  async getComboAsociadoConceptos(): Promise<
    ServiceResponse<ConceptoAsociables[]>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get("/conceptos/asociables");
      return this.processResponseArray<ConceptoAsociables>(response);
    }, "Error getting associated concepts");
  }
}

export const conceptsService = new ConceptsService(api);
