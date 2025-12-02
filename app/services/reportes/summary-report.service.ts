import { BaseApiService } from '~/services/core/base-service';
import type { ServiceResponse } from '~/services/core/api-response';
import type { ComboEmpalmes, PeriodosFacturacion } from '~/types/reportes';
import api from '~/lib/api';

/**
 * Summary Report Data Interface
 */
export interface ResumenFacturacionData {
  comboEmpalmes: ComboEmpalmes[];
  periodosFacturacion: PeriodosFacturacion[];
}

/**
 * SummaryReportService
 * Manages summary and overview reports
 * - Billing summaries
 * - Available empalmes and periods
 * - Search contracts overview
 */
export class SummaryReportService extends BaseApiService {
  /**
   * Constructor
   * @param httpClient Axios HTTP client instance
   */
  constructor(httpClient: any = api) {
    super(httpClient);
  }

  /**
   * Get resumen facturación with empalmes and periods
   * Parallel execution for independent data loads
   */
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
          this.processResponseArray<ComboEmpalmes>(resComboEmpalmes),
        periodosFacturacion: this.processResponseArray<PeriodosFacturacion>(
          resPeriodosFacturacion
        )
      };
    }, 'Error getting billing summary');
  }

  /**
   * Get contract search data
   */
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

  /**
   * Get available empalmes only
   */
  async getComboEmpalmes(): Promise<ServiceResponse<ComboEmpalmes[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/combo-empalmes');
      return this.processResponseArray<ComboEmpalmes>(response);
    }, 'Error getting empalmes');
  }

  /**
   * Get billing periods only
   */
  async getPeriodosFacturacion(): Promise<
    ServiceResponse<PeriodosFacturacion[]>
  > {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/periodos-facturables');
      return this.processResponseArray<PeriodosFacturacion>(response);
    }, 'Error getting billing periods');
  }
}

export const summaryReportService = new SummaryReportService(api);
