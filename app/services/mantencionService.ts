import api from '~/lib/api';
import type {
  CicloFacturacion,
  CicloFacturacionFormValues,
  Clave,
  ClaveFormValues,
  Concepto,
  ConceptoAsociables,
  ConceptoFormValues,
  Empalme,
  EmpalmeFormValues,
  Marca,
  MarcaFormValues,
  Nicho,
  NichoFormValues,
  Parametro,
  ParametroFormValues,
  Sector,
  SectorFormValues,
  SectorZona,
  Tarifa,
  TarifaFormValues,
  TipoContrato,
  TipoContratoFormValues,
  Zona,
  ZonaFormValues,
  ZonaProps
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

  async createCicloFacturacion(
    ciclo: CicloFacturacionFormValues
  ): Promise<MantencionServiceResponse<CicloFacturacionFormValues>> {
    try {
      const response = await api.post('/ciclos-facturacion/crear', ciclo);
      return {
        data: response.data as CicloFacturacionFormValues,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateCicloFacturacion(
    ciclo: CicloFacturacionFormValues
  ): Promise<MantencionServiceResponse<CicloFacturacionFormValues>> {
    try {
      const response = await api.put('/ciclos-facturacion/editar', ciclo);
      return {
        data: response.data as CicloFacturacionFormValues,
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

  async createClaves(
    clave: ClaveFormValues
  ): Promise<MantencionServiceResponse<ClaveFormValues>> {
    try {
      const response = await api.post('/claves/crear', clave);
      return {
        data: response.data as ClaveFormValues,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateClaves(
    request: ClaveFormValues
  ): Promise<MantencionServiceResponse<ClaveFormValues>> {
    try {
      const response = await api.put('/claves/editar', request);
      return {
        data: response.data as ClaveFormValues,
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

  async createConcepto(
    concepto: ConceptoFormValues
  ): Promise<MantencionServiceResponse<ConceptoFormValues>> {
    try {
      const response = await api.post('/conceptos/crear', concepto);
      return {
        data: response.data as ConceptoFormValues,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateConcepto(
    request: ConceptoFormValues
  ): Promise<MantencionServiceResponse<ConceptoFormValues>> {
    try {
      const response = await api.put('/conceptos/editar', request);
      return {
        data: response.data as ConceptoFormValues,
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

  async createEmpalme(
    empalme: EmpalmeFormValues
  ): Promise<MantencionServiceResponse<EmpalmeFormValues>> {
    try {
      const response = await api.post('/empalmes/crear', empalme);
      return {
        data: response.data as EmpalmeFormValues,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateEmpalme(
    request: EmpalmeFormValues
  ): Promise<MantencionServiceResponse<EmpalmeFormValues>> {
    try {
      const response = await api.put('/empalmes/editar', request);
      return {
        data: response.data as EmpalmeFormValues,
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

  async createMarca(
    marca: MarcaFormValues
  ): Promise<MantencionServiceResponse<MarcaFormValues>> {
    try {
      const response = await api.post('/marcas/crear', marca);
      return {
        data: response.data as MarcaFormValues,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateMarca(
    request: MarcaFormValues
  ): Promise<MantencionServiceResponse<MarcaFormValues>> {
    try {
      const response = await api.put('/marcas/editar', request);
      return {
        data: response.data as MarcaFormValues,
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
  ): Promise<MantencionServiceResponse<NichoFormValues>> {
    try {
      const response = await api.post('/nichos/crear', nicho);
      return {
        data: response.data as NichoFormValues,
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
    request: NichoFormValues
  ): Promise<MantencionServiceResponse<NichoFormValues>> {
    try {
      const response = await api.put('/nichos', request);
      return {
        data: response.data as NichoFormValues,
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

  async createParametro(
    request: ParametroFormValues
  ): Promise<MantencionServiceResponse<ParametroFormValues>> {
    try {
      const response = await api.post('/parametros/crear', request);
      return {
        data: response.data as ParametroFormValues,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateParametro(
    request: ParametroFormValues
  ): Promise<MantencionServiceResponse<ParametroFormValues>> {
    try {
      const response = await api.put('/parametros/editar', request);
      return {
        data: response.data as ParametroFormValues,
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

  async getSectoresZonas(): Promise<MantencionServiceResponse<SectorZona[]>> {
    try {
      const response = await api.get('/sectores/zonas');
      return {
        data: this.processApiResponse<SectorZona>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async postSectores(request: SectorFormValues) {
    try {
      const response = await api.post('/sectores/crear', request);
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

  async updateSector(request: SectorFormValues) {
    try {
      const response = await api.put('/sectores/editar', request);
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

  async createTarifa(
    tarifa: TarifaFormValues
  ): Promise<MantencionServiceResponse<TarifaFormValues>> {
    try {
      const response = await api.post('/tarifas/crear', tarifa);
      return {
        data: response.data as TarifaFormValues,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateTarifa(
    request: TarifaFormValues
  ): Promise<MantencionServiceResponse<TarifaFormValues>> {
    try {
      const response = await api.put('/tarifas/editar', request);
      return {
        data: response.data as TarifaFormValues,
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

  async createTipoContrato(
    data: TipoContratoFormValues
  ): Promise<MantencionServiceResponse<TipoContratoFormValues>> {
    try {
      const response = await api.post('/tipos-contrato/crear', data);
      return {
        data: response.data as TipoContratoFormValues,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateTipoContrato(
    request: TipoContratoFormValues
  ): Promise<MantencionServiceResponse<TipoContratoFormValues>> {
    try {
      const response = await api.put('/tipos-contrato/editar', request);
      return {
        data: response.data as TipoContratoFormValues,
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

  async createZona(
    data: ZonaProps
  ): Promise<MantencionServiceResponse<ZonaProps>> {
    try {
      const response = await api.post('/zonas/crear', data);
      return {
        data: response.data as ZonaProps,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async updateZona(
    data: ZonaFormValues
  ): Promise<MantencionServiceResponse<ZonaFormValues>> {
    try {
      const response = await api.put('/zonas/editar', data);
      return {
        data: response.data as ZonaFormValues,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async deleteClave(id: number): Promise<MantencionServiceResponse<unknown>> {
    try {
      const response = await api.delete(`/eliminarClaves/${id}`);
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async deleteConcepto(
    id: number
  ): Promise<MantencionServiceResponse<unknown>> {
    try {
      const response = await api.delete(`/eliminarConceptos/${id}`);
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async deleteParametro(
    id: number
  ): Promise<MantencionServiceResponse<unknown>> {
    try {
      const response = await api.delete(`/parametros/eliminar/${id}`);
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async deleteTarifa(id: number): Promise<MantencionServiceResponse<unknown>> {
    try {
      const response = await api.delete(`/eliminarTarifa/${id}`);
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async deleteTipoContrato(
    id: number
  ): Promise<MantencionServiceResponse<unknown>> {
    try {
      const response = await api.delete(`/eliminarTipoContrato/${id}`);
      return {
        data: response.data,
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
