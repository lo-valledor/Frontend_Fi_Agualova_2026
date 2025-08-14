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

export interface MantencionServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class MantencionService {
  /**
   * Función helper para procesar respuestas de API con formato flexible
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
   * Obtiene ciclos de facturación
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
   * Obtiene claves
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
   * Obtiene conceptos con combo asociado
   */
  async getConceptosData(): Promise<
    MantencionServiceResponse<{
      conceptos: Conceptos[];
      comboAsociadoConceptos: ComboAsociadoConceptos[];
    }>
  > {
    try {
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
   * Obtiene empalmes
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
   * Obtiene marcas
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
   * Obtiene nichos
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
   * Crea un nuevo nicho
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
   * Obtiene parámetros
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
   * Obtiene sectores
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
   * Obtiene tarifas
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
   * Obtiene tipos de contratos
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
   * Obtiene zonas
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

export const mantencionService = new MantencionService();
