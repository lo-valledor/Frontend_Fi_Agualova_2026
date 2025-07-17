import api from '~/lib/api';
import type {
  Acometida,
  ComboEmpalmes,
  ComboNichos,
  ComboSectores,
  ContratosDisponibles,
  GetClientes,
  GetGiros,
  GetRegiones,
  GetContratos,
  GetContratosClientes,
  GetLimiteInvierno,
  GetFechaActual,
  GetMedidores,
  GetCargoTipoContrato,
  GetCondicionesContrato,
  GeCombosConceptos,
  GetCombosTarifas,
  GetCombosTiposMedidor,
  BuscarCargoFacturable,
  Usuarios,
} from '~/types/administracion';
import type { Marca, Conceptos, Tarifas, TiposContrato } from '~/types/mantencion';

export interface AdministracionServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class AdministracionService {
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
   * Obtiene datos de acometidas con todos sus combos
   */
  async getAcometidasData(): Promise<AdministracionServiceResponse<{
    acometidas: Acometida[];
    comboEmpalmes: ComboEmpalmes[];
    comboNichos: ComboNichos[];
    comboSectores: ComboSectores[];
    contratosDisponibles: ContratosDisponibles[];
  }>> {
    try {
      const [
        resAcometidas,
        resComboEmpalmes,
        resComboNichos,
        resComboSectores,
        resContratosDisponibles,
      ] = await Promise.all([
        api.get('buscar-Acometida', { params: {} }),
        api.get('combo-empalmes-Acometida'),
        api.get('combo-nichos'),
        api.get('combo-sectores'),
        api.get('contratos-disponibles'),
      ]);

      return {
        data: {
          acometidas: this.processApiResponse<Acometida>(resAcometidas),
          comboEmpalmes: this.processApiResponse<ComboEmpalmes>(resComboEmpalmes),
          comboNichos: this.processApiResponse<ComboNichos>(resComboNichos),
          comboSectores: this.processApiResponse<ComboSectores>(resComboSectores),
          contratosDisponibles: this.processApiResponse<ContratosDisponibles>(resContratosDisponibles),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene datos de clientes con giros y regiones
   */
  async getClientesData(): Promise<AdministracionServiceResponse<{
    clientes: GetClientes[];
    giros: GetGiros[];
    regiones: GetRegiones[];
  }>> {
    try {
      const [resClientes, resGiros, resRegiones] = await Promise.all([
        api.get('ClienteBuscar'),
        api.get('giro/buscar'),
        api.get('region/listar'),
      ]);

      return {
        data: {
          clientes: this.processApiResponse<GetClientes>(resClientes),
          giros: this.processApiResponse<GetGiros>(resGiros),
          regiones: this.processApiResponse<GetRegiones>(resRegiones),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene datos de contratos con todos sus combos
   */
  async getContratosData(): Promise<AdministracionServiceResponse<{
    contratos: GetContratos[];
    regiones: GetRegiones[];
    contratosClientes: GetContratosClientes[];
    limiteInvierno: GetLimiteInvierno[];
    fechaActual: GetFechaActual[];
    tipoContrato: TiposContrato[];
    tarifas: Tarifas[];
  }>> {
    try {
      const [
        resContratos,
        resRegiones,
        resContratosClientes,
        resLimiteInvierno,
        resFechaActual,
        resTipoContrato,
        resTarifas,
      ] = await Promise.all([
        api.get('contrato/buscar'),
        api.get('region/listar'),
        api.get('contrato/buscar'),
        api.get('parametro/limite-invierno'),
        api.get('util/fecha-actual'),
        api.get('buscarTipoContrato'),
        api.get('buscarTarifa'),
      ]);

      return {
        data: {
          contratos: resContratos.data as GetContratos[],
          regiones: resRegiones.data as GetRegiones[],
          contratosClientes: resContratosClientes.data as GetContratosClientes[],
          limiteInvierno: resLimiteInvierno.data as GetLimiteInvierno[],
          fechaActual: resFechaActual.data as GetFechaActual[],
          tipoContrato: resTipoContrato.data as TiposContrato[],
          tarifas: resTarifas.data as Tarifas[],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene datos de medidores con marcas
   */
  async getMedidoresData(): Promise<AdministracionServiceResponse<{
    medidores: GetMedidores[];
    marcas: Marca[];
  }>> {
    try {
      const [resMedidores, resMarcas] = await Promise.all([
        api.get('buscarMedidor'),
        api.get('buscarMarca'),
      ]);

      return {
        data: {
          medidores: resMedidores.data as GetMedidores[],
          marcas: resMarcas.data as Marca[],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene usuarios
   */
  async getUsuarios(): Promise<AdministracionServiceResponse<Usuarios[]>> {
    try {
      const response = await api.get('listar');
      return {
        data: response.data as Usuarios[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene cargo tipo contrato
   */
  async getCargoTipoContrato(): Promise<AdministracionServiceResponse<GetCargoTipoContrato[]>> {
    try {
      const response = await api.get('cargoTipoContrato-buscar');
      return {
        data: response.data as GetCargoTipoContrato[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene condiciones contrato con conceptos
   */
  async getCondicionesContratoData(): Promise<AdministracionServiceResponse<{
    condicionesContrato: GetCondicionesContrato[];
    conceptos: Conceptos[];
  }>> {
    try {
      const [resCondicionesContrato, resConceptos] = await Promise.all([
        api.get('condicion-contrato/condicionContrato-Buscar'),
        api.get('buscarConceptos'),
      ]);

      return {
        data: {
          condicionesContrato: this.processApiResponse<GetCondicionesContrato>(resCondicionesContrato),
          conceptos: this.processApiResponse<Conceptos>(resConceptos),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene cargo facturable con combos
   */
  async getCargoFacturableData(): Promise<AdministracionServiceResponse<{
    cargos: BuscarCargoFacturable[];
    conceptos: GeCombosConceptos[];
    tarifas: GetCombosTarifas[];
    tiposMedidor: GetCombosTiposMedidor[];
  }>> {
    try {
      const [resCargoFacturable, resConceptos, resTarifas, resTiposMedidor] = await Promise.all([
        api.get('buscarCargoFacturable'),
        api.get('combos/conceptos'),
        api.get('combos/tarifas'),
        api.get('combos/tipos-medidor'),
      ]);

      return {
        data: {
          cargos: resCargoFacturable.data as BuscarCargoFacturable[],
          conceptos: resConceptos.data as GeCombosConceptos[],
          tarifas: resTarifas.data as GetCombosTarifas[],
          tiposMedidor: resTiposMedidor.data as GetCombosTiposMedidor[],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}

export const administracionService = new AdministracionService();
