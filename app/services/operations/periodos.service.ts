import type { ServiceResponse } from '~/services/core/api-response';
import { BaseApiService } from '~/services/core/base-service';
import type {
  Anio,
  Ciclo,
  PeriodoAbierto,
  Periodos
} from '~/types/operaciones';

export class PeriodosService extends BaseApiService {
  constructor(httpClient?: any) {
    super(httpClient);
  }

  async getOpenPeriod(): Promise<ServiceResponse<PeriodoAbierto[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/ConsultarPeriodoAbierto');
      return this.processResponseArray<PeriodoAbierto>(response);
    }, 'Error al obtener período abierto');
  }

  async getActiveBillingCycles(): Promise<ServiceResponse<Ciclo[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/ciclos-facturacion-activos');
      return this.processResponseArray<Ciclo>(response);
    }, 'Error al obtener ciclos de facturación');
  }

  async getAvailableYears(): Promise<ServiceResponse<Anio[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/consulta-año');
      return this.processResponseArray<Anio>(response);
    }, 'Error al obtener años disponibles');
  }

  async getAvailablePeriods(): Promise<ServiceResponse<Periodos[]>> {
    return this.executeDataOperation(async () => {
      const response = await this.httpClient.get('/consulta-periodo');
      return this.processResponseArray<Periodos>(response);
    }, 'Error al obtener períodos disponibles');
  }

  async getPeriodAndCyclesData(): Promise<
    ServiceResponse<{
      period: PeriodoAbierto[];
      cycles: Ciclo[];
    }>
  > {
    return this.executeDataOperation(async () => {
      const [periodRes, cyclesRes] = await this.executeParallelOperations([
        () => this.httpClient.get('/ConsultarPeriodoAbierto'),
        () => this.httpClient.get('/ciclos-facturacion-activos')
      ]);

      return {
        period: this.processResponseArray<PeriodoAbierto>(periodRes),
        cycles: this.processResponseArray<Ciclo>(cyclesRes)
      };
    }, 'Error al obtener período y ciclos');
  }

  async getYearsAndPeriodsData(): Promise<
    ServiceResponse<{
      years: Anio[];
      periods: Periodos[];
    }>
  > {
    return this.executeDataOperation(async () => {
      const [yearsRes, periodsRes] = await this.executeParallelOperations([
        () => this.httpClient.get('/consulta-año'),
        () => this.httpClient.get('/consulta-periodo')
      ]);

      return {
        years: this.processResponseArray<Anio>(yearsRes),
        periods: this.processResponseArray<Periodos>(periodsRes)
      };
    }, 'Error al obtener años y períodos');
  }
}

export const periodosService = new PeriodosService();
