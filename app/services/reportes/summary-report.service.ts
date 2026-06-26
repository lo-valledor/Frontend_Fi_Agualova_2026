import api from '~/lib/api';
import type { ServiceResponse } from '~/services/core/api-response';
import { BaseApiService } from '~/services/core/base-service';
import type {
  EmpalmesDisponibles,
  PeriodosDisponibles
} from '~/types/reportes';

export interface ResumenFacturacionData {
  comboEmpalmes: EmpalmesDisponibles[];
  periodosFacturacion: PeriodosDisponibles[];
}

export class SummaryReportService extends BaseApiService {
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  async getResumenFacturacion(): Promise<
    ServiceResponse<ResumenFacturacionData>
  > {
    return this.executeDataOperation(async () => {
      const [resComboEmpalmes, resPeriodosFacturacion] =
        await this.executeParallelOperations([
          () => this.httpClient.get('/combo-empalmes'),
          () => this.httpClient.get('/periodos-facturables')
        ]);

      return {
        comboEmpalmes:
          this.processResponseArray<EmpalmesDisponibles>(resComboEmpalmes),
        periodosFacturacion: this.processResponseArray<PeriodosDisponibles>(
          resPeriodosFacturacion
        )
      };
    }, 'Error getting billing summary');
  }

  async getBuscarContrato(): Promise<
    ServiceResponse<{
      buscarContratos: any[];
    }>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('buscarContrato');
      return {
        buscarContratos: this.processResponseArray<any>(response)
      };
    }, 'Error getting contract search data');
  }

  async getComboEmpalmes(): Promise<ServiceResponse<EmpalmesDisponibles[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/combo-empalmes');
      return this.processResponseArray<EmpalmesDisponibles>(response);
    }, 'Error getting empalmes');
  }

  async getPeriodosFacturacion(): Promise<
    ServiceResponse<PeriodosDisponibles[]>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/periodos-facturables');
      return this.processResponseArray<PeriodosDisponibles>(response);
    }, 'Error getting billing periods');
  }
}

export const summaryReportService = new SummaryReportService(api);
