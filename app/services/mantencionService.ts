import api from '~/lib/api';
import type {
  CicloFacturacion,
  Clave,
  Concepto,
  ConceptoAsociables,
  Empalme,
  Marca,
  Nicho,
  NichoFormValues,
  Parametro,
  Sector,
  Tarifa,
  TipoContrato,
  Zona
} from '~/types/mantencion';

export interface MantencionServiceResponse<T> {
  data: T | null;
  error: string | null;
}
class MantencionService {
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

  async getCiclosFacturacion(): Promise<
    MantencionServiceResponse<CicloFacturacion[]>
  > {
    try {
      const response = await api.get('/ciclos-facturacion/buscar');
      return {
        data: this.processApiResponse<CicloFacturacion>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getClaves(): Promise<MantencionServiceResponse<Clave[]>> {
    try {
      const response = await api.get('/claves/buscar');
      return {
        data: this.processApiResponse<Clave>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getConceptosData(): Promise<
    MantencionServiceResponse<{
      conceptos: Concepto[];
      conceptoAsociables: ConceptoAsociables[];
    }>
  > {
    try {
      // Realizamos ambas peticiones en paralelo para mejor performance
      const [resConceptos, resConceptoAsociables] = await Promise.all([
        api.get('/conceptos/buscar'),
        api.get('/conceptos/asociables')
      ]);

      return {
        data: {
          conceptos: this.processApiResponse<Concepto>(resConceptos),
          conceptoAsociables: this.processApiResponse<ConceptoAsociables>(
            resConceptoAsociables
          )
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

  async getEmpalmes(): Promise<MantencionServiceResponse<Empalme[]>> {
    try {
      const response = await api.get('/empalmes/buscar');
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

  async getMarcas(): Promise<MantencionServiceResponse<Marca[]>> {
    try {
      const response = await api.get('/marcas/buscar');
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

  async getNichos(): Promise<MantencionServiceResponse<Nicho[]>> {
    try {
      const response = await api.get('/nichos/buscar');
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

  async createNicho(
    nicho: NichoFormValues
  ): Promise<MantencionServiceResponse<Nicho>> {
    try {
      const response = await api.post('/nichos/crear', nicho);
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

  async updateNicho(
    id: number,
    nicho: NichoFormValues
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

  async getParametros(): Promise<MantencionServiceResponse<Parametro[]>> {
    try {
      const response = await api.get('/parametros/buscar');
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

  async getSectores(): Promise<MantencionServiceResponse<Sector[]>> {
    try {
      const response = await api.get('/sectores/buscar');
      return {
        data: this.processApiResponse<Sector>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getTarifas(): Promise<MantencionServiceResponse<Tarifa[]>> {
    try {
      const response = await api.get('/tarifas/buscar');
      return {
        data: this.processApiResponse<Tarifa>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getTiposContratos(): Promise<
    MantencionServiceResponse<TipoContrato[]>
  > {
    try {
      const response = await api.get('/tipos-contrato/buscar');
      return {
        data: this.processApiResponse<TipoContrato>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getZonas(): Promise<MantencionServiceResponse<Zona[]>> {
    try {
      const response = await api.get('/zonas/buscar');
      return {
        data: this.processApiResponse<Zona>(response),
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

export const mantencionService = new MantencionService();
