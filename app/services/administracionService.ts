import api from '~/lib/api';
import type {
  Acometida,
  BuscarCargoFacturable,
  CargoTipoContratoEditor,
  CargoTipoDetalle,
  CargoTipoListbox,
  ComboEmpalmes,
  ComboNichos,
  ComboSectores,
  ContratosDisponibles,
  CrearContratoProps,
  GeCombosConceptos,
  GetCargoTipoContrato,
  GetClientes,
  GetCombosTarifas,
  GetCombosTiposMedidor,
  GetComunas,
  GetCondicionesContrato,
  GetContratos,
  GetGiros,
  GetLocal,
  GetMadres,
  GetMedidores,
  GetPropietario,
  ModificarContratoProps,
  Usuarios
} from '~/types/administracion';
import type { Conceptos, Marca } from '~/types/mantencion';

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
  async getAcometidasData(): Promise<
    AdministracionServiceResponse<{
      acometidas: Acometida[];
      comboEmpalmes: ComboEmpalmes[];
      comboNichos: ComboNichos[];
      comboSectores: ComboSectores[];
      contratosDisponibles: ContratosDisponibles[];
    }>
  > {
    try {
      const [
        resAcometidas,
        resComboEmpalmes,
        resComboNichos,
        resComboSectores,
        resContratosDisponibles
      ] = await Promise.all([
        api.get('buscar-Acometida', { params: {} }),
        api.get('combo-empalmes-Acometida'),
        api.get('combo-nichos'),
        api.get('combo-sectores'),
        api.get('contratos-disponibles')
      ]);

      return {
        data: {
          acometidas: this.processApiResponse<Acometida>(resAcometidas),
          comboEmpalmes:
            this.processApiResponse<ComboEmpalmes>(resComboEmpalmes),
          comboNichos: this.processApiResponse<ComboNichos>(resComboNichos),
          comboSectores:
            this.processApiResponse<ComboSectores>(resComboSectores),
          contratosDisponibles: this.processApiResponse<ContratosDisponibles>(
            resContratosDisponibles
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

  /**
   * Obtiene datos de clientes con giros y regiones
   */
  async getClientesData(): Promise<
    AdministracionServiceResponse<{
      clientes: GetClientes[];
      giros: GetGiros[];
      comunas: GetComunas[];
    }>
  > {
    try {
      const [resClientes, resGiros, resComunas] = await Promise.all([
        api.get('ClienteBuscar'),
        api.get('giro/buscar'),
        api.get('comuna/por-region')
      ]);

      return {
        data: {
          clientes: this.processApiResponse<GetClientes>(resClientes),
          giros: this.processApiResponse<GetGiros>(resGiros),
          comunas: this.processApiResponse<GetComunas>(resComunas)
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
   * Obtiene datos de contratos con todos sus combos
   */
  async getContratosData(): Promise<
    AdministracionServiceResponse<{
      contratos: GetContratos[];
    }>
  > {
    try {
      const [resContratos] = await Promise.all([api.get('contrato/buscar')]);

      return {
        data: {
          contratos: resContratos.data as GetContratos[]
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
   * Obtiene datos de clientes para contratos
   */
  async getClientesBuscar(): Promise<
    AdministracionServiceResponse<GetClientes[]>
  > {
    try {
      const response = await api.get('cliente/buscar');
      return {
        data: response.data as GetClientes[],
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
   * Obtiene contrato por ID
   */
  async getContratoById(id: number): Promise<
    AdministracionServiceResponse<{
      contrato: GetContratos;
      propietarios: GetPropietario[];
      locales: GetLocal[];
      comunas: GetComunas[];
      madres: GetMadres[];
      clientes: GetClientes[];
    }>
  > {
    try {
      const [
        resContratos,
        resPropietarios,
        resLocales,
        resComunas,
        resMadres,
        resClientes
      ] = await Promise.all([
        api.get(`contrato/${id}`),
        api.get('propietario/buscar'),
        api.get('local/buscar'),
        api.get('comuna/por-region'),
        api.get('contrato/madres/buscar'),
        api.get('cliente/buscar')
      ]);
      return {
        data: {
          contrato: resContratos.data as GetContratos,
          propietarios: resPropietarios.data as GetPropietario[],
          locales: resLocales.data as GetLocal[],
          comunas: resComunas.data as GetComunas[],
          madres: resMadres.data as GetMadres[],
          clientes: resClientes.data as GetClientes[]
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
   * Obtiene solo los propietarios, local, comuna y madres
   */
  async getDataCreacionContrato(): Promise<
    AdministracionServiceResponse<{
      propietarios: GetPropietario[];
      locales: GetLocal[];
      comunas: GetComunas[];
      madres: GetMadres[];
      clientes: GetClientes[];
    }>
  > {
    try {
      const [resPropietarios, resLocales, resComunas, resMadres, resClientes] =
        await Promise.all([
          api.get('propietario/buscar'),
          api.get('local/buscar'),
          api.get('comuna/por-region'),
          api.get('contrato/madres/buscar'),
          api.get('cliente/buscar')
        ]);

      return {
        data: {
          propietarios: resPropietarios.data as GetPropietario[],
          locales: resLocales.data as GetLocal[],
          comunas: resComunas.data as GetComunas[],
          madres: resMadres.data as GetMadres[],
          clientes: resClientes.data as GetClientes[]
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
   * Obtiene datos de medidores con marcas
   */
  async getMedidoresData(): Promise<
    AdministracionServiceResponse<{
      medidores: GetMedidores[];
      marcas: Marca[];
    }>
  > {
    try {
      const [resMedidores, resMarcas] = await Promise.all([
        api.get('buscarMedidor'),
        api.get('buscarMarca')
      ]);

      return {
        data: {
          medidores: resMedidores.data as GetMedidores[],
          marcas: resMarcas.data as Marca[]
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
   * Obtiene usuarios
   */
  async getUsuarios(): Promise<AdministracionServiceResponse<Usuarios[]>> {
    try {
      const response = await api.get('listar');
      return {
        data: response.data as Usuarios[],
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
   * Obtiene cargo tipo contrato
   */
  async getCargoTipoContrato(): Promise<
    AdministracionServiceResponse<GetCargoTipoContrato[]>
  > {
    try {
      const response = await api.get('cargoTipoContrato-buscar');
      return {
        data: response.data as GetCargoTipoContrato[],
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
   * Obtiene datos completos de cargo tipo contrato por ID
   */
  async getCargoTipoContratoById(cargoTipoContratoId: number): Promise<
    AdministracionServiceResponse<{
      editar: CargoTipoContratoEditor;
      detalle: CargoTipoDetalle[];
      listbox: CargoTipoListbox[];
      conceptos: GeCombosConceptos[];
      tarifas: GetCombosTarifas[];
      tiposMedidor: GetCombosTiposMedidor[];
      condicionesContrato: GetCondicionesContrato[];
      cargos: BuscarCargoFacturable[];
    }>
  > {
    try {
      const [
        responseEditar,
        responseDetalle,
        responseListbox,
        responseConceptos,
        responseTarifas,
        responseTiposMedidor,
        responseCondicionesContrato,
        responseCargos
      ] = await Promise.all([
        api.get(`cargoTipoContrato-editar/${cargoTipoContratoId}`),
        api.get(`cargoTipoContrato-detalle/${cargoTipoContratoId}`),
        api.get(`cargoTipoContrato-listbox/${cargoTipoContratoId}`),
        api.get('combos/conceptos'),
        api.get('combos/tarifas'),
        api.get('combos/tipos-medidor'),
        api.get('condicion-contrato/condicionContrato-Buscar'),
        api.get('buscarCargoFacturable')
      ]);

      return {
        data: {
          editar: responseEditar.data as CargoTipoContratoEditor,
          detalle: responseDetalle.data as CargoTipoDetalle[],
          listbox: responseListbox.data as CargoTipoListbox[],
          conceptos:
            this.processApiResponse<GeCombosConceptos>(responseConceptos),
          tarifas: this.processApiResponse<GetCombosTarifas>(responseTarifas),
          tiposMedidor:
            this.processApiResponse<GetCombosTiposMedidor>(
              responseTiposMedidor
            ),
          condicionesContrato:
            responseCondicionesContrato.data as GetCondicionesContrato[],
          cargos: responseCargos.data as BuscarCargoFacturable[]
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
   * Obtiene condiciones contrato con conceptos
   */
  async getCondicionesContratoData(): Promise<
    AdministracionServiceResponse<{
      condicionesContrato: GetCondicionesContrato[];
      conceptos: Conceptos[];
    }>
  > {
    try {
      const [resCondicionesContrato, resConceptos] = await Promise.all([
        api.get('condicion-contrato/condicionContrato-Buscar'),
        api.get('buscarConceptos')
      ]);

      return {
        data: {
          condicionesContrato: this.processApiResponse<GetCondicionesContrato>(
            resCondicionesContrato
          ),
          conceptos: this.processApiResponse<Conceptos>(resConceptos)
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
   * Obtiene cargo facturable con combos
   */
  async getCargoFacturableData(): Promise<
    AdministracionServiceResponse<{
      cargos: BuscarCargoFacturable[];
      conceptos: GeCombosConceptos[];
      tarifas: GetCombosTarifas[];
      tiposMedidor: GetCombosTiposMedidor[];
    }>
  > {
    try {
      const [resCargoFacturable, resConceptos, resTarifas, resTiposMedidor] =
        await Promise.all([
          api.get('buscarCargoFacturable'),
          api.get('combos/conceptos'),
          api.get('combos/tarifas'),
          api.get('combos/tipos-medidor')
        ]);

      return {
        data: {
          cargos: resCargoFacturable.data as BuscarCargoFacturable[],
          conceptos: resConceptos.data as GeCombosConceptos[],
          tarifas: resTarifas.data as GetCombosTarifas[],
          tiposMedidor: resTiposMedidor.data as GetCombosTiposMedidor[]
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
   * Crear un nuevo contrato
   */
  async crearContrato(
    contratoData: CrearContratoProps
  ): Promise<AdministracionServiceResponse<any>> {
    try {
      const response = await api.post('/contrato/crear', contratoData);
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      console.error('Error al crear contrato:', error);
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al crear el contrato'
      };
    }
  }

  /**
   * Modificar un contrato existente
   */
  async modificarContrato(
    contratoData: ModificarContratoProps
  ): Promise<AdministracionServiceResponse<any>> {
    try {
      const response = await api.put('/contrato/modificar', contratoData);
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      console.error('Error al modificar contrato:', error);

      // Extraer información detallada del error
      let errorMessage: string;

      if (error.response) {
        // Error de respuesta del servidor (4xx, 5xx)
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);

        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Error ${error.response.status}: ${error.response.statusText}`;

        // Si hay detalles de validación, incluirlos
        if (error.response.data?.details) {
          errorMessage += ` - Detalles: ${JSON.stringify(error.response.data.details)}`;
        }
      } else if (error.request) {
        // Error de red
        errorMessage = 'Error de conexión con el servidor';
      } else {
        // Error en configuración de la petición
        errorMessage = error.message || 'Error al modificar el contrato';
      }

      return {
        data: null,
        error: errorMessage
      };
    }
  }
}

export const administracionService = new AdministracionService();
