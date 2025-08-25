import api from '~/lib/api';
import type {
  Acometida,
  ActualizarMedidorProps,
  BuscarCargoFacturable,
  CargoTipoContratoEditor,
  CargoTipoDetalle,
  CargoTipoListbox,
  ComboEmpalmes,
  ComboNichos,
  ComboSectores,
  ContratosDisponibles,
  CrearContratoProps,
  CrearMedidorProps,
  GeCombosConceptos,
  GetCargoTipoContrato,
  GetClientes,
  GetClienteById,
  GetClientesByRut,
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
  Usuarios,
  GetContratante
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
   * Obtiene datos de propietarios para contratos
   */
  async getPropietariosData(): Promise<
    AdministracionServiceResponse<{
      propietarios: GetPropietario[];
      contratante: GetContratante[];
    }>
  > {
    try {
      const [resPropietarios, resContratante] = await Promise.all([
        api.get('propietario/buscar'),
        api.get('contratante/existe')
      ]);

      return {
        data: {
          propietarios:
            this.processApiResponse<GetPropietario>(resPropietarios),
          contratante: this.processApiResponse<GetContratante>(resContratante)
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
   * Obtiene datos de contratantes con giros y comunas
   */
  async getContratantesData(): Promise<
    AdministracionServiceResponse<{
      contratantes: GetContratante[];
      giros: GetGiros[];
      comunas: GetComunas[];
    }>
  > {
    try {
      const [resContratantes, resGiros, resComunas] = await Promise.all([
        api.get('contratante/existe'),
        api.get('giro/buscar'),
        api.get('comuna/por-region')
      ]);

      return {
        data: {
          contratantes:
            this.processApiResponse<GetContratante>(resContratantes),
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
   * Obtiene datos de medidores con marcas
   */
  async postMedidoresData(): Promise<
    AdministracionServiceResponse<{
      marca: Marca[];
      tipoMedidor: GetCombosTiposMedidor[];
    }>
  > {
    try {
      const [resMedidores, resMarcas] = await Promise.all([
        api.get('buscarMarca'),
        api.get('combos/tipos-medidor')
      ]);

      return {
        data: {
          marca: resMedidores.data as Marca[],
          tipoMedidor: resMarcas.data as GetCombosTiposMedidor[]
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
  async getMedidoresByCodigo({ codigo }: { codigo: string }): Promise<
    AdministracionServiceResponse<{
      medidor: GetMedidores[];
      marca: Marca[];
      tipoMedidor: GetCombosTiposMedidor[];
    }>
  > {
    try {
      const [resMedidores, resMarcas, resTiposMedidor] = await Promise.all([
        api.get(`medidor/${codigo}`),
        api.get('buscarMarca'),
        api.get('combos/tipos-medidor')
      ]);

      return {
        data: {
          medidor: resMedidores.data as GetMedidores[],
          marca: resMarcas.data as Marca[],
          tipoMedidor: resTiposMedidor.data as GetCombosTiposMedidor[]
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

  /**
   * Obtiene giros
   */
  async getGiros(): Promise<AdministracionServiceResponse<GetGiros[]>> {
    try {
      const response = await api.get('giro/buscar');
      return {
        data: this.processApiResponse<GetGiros>(response),
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
   * Obtiene comunas
   */
  async getComunas(): Promise<AdministracionServiceResponse<GetComunas[]>> {
    try {
      const response = await api.get('comuna/por-region');
      return {
        data: this.processApiResponse<GetComunas>(response),
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
   * Obtiene todos los clientes por RUT
   */
  async getClientesByRut(): Promise<
    AdministracionServiceResponse<GetClientesByRut[]>
  > {
    try {
      const response = await api.get('ClienteBuscar');
      return {
        data: this.processApiResponse<GetClientesByRut>(response),
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
   * Obtiene un cliente específico por RUT
   */
  async getClienteByRut(
    rut: string
  ): Promise<AdministracionServiceResponse<GetClientesByRut>> {
    try {
      const response = await api.get(`/cliente/${rut}`);
      // Convertir GetClienteById a GetClientesByRut mapeando email a correo
      const clienteById = response.data as GetClienteById;
      const clientesByRut: GetClientesByRut = {
        ...clienteById,
        correo: clienteById.email
      };
      return {
        data: clientesByRut,
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
   * Obtiene un contratante específico por RUT
   */
  async getContratanteByRut(
    rut: string
  ): Promise<AdministracionServiceResponse<GetContratante>> {
    try {
      const response = await api.get(`/contratante/${rut}`);
      return {
        data: response.data as GetContratante,
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
   * Obtiene un propietario específico por RUT
   */
  async getPropietarioByRut(
    rut: string
  ): Promise<AdministracionServiceResponse<GetPropietario>> {
    try {
      const response = await api.get(`/propietario/${rut}`);
      return {
        data: response.data as GetPropietario,
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
   * Crea un nuevo medidor
   */
  async crearMedidor(
    data: CrearMedidorProps
  ): Promise<AdministracionServiceResponse<{ id: number }>> {
    try {
      const response = await api.post('medidorCrear', data);
      return {
        data: response.data as { id: number },
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error al crear medidor'
      };
    }
  }

  /**
   * Modifica un medidor existente
   */
  async modificarMedidor(
    data: ActualizarMedidorProps
  ): Promise<AdministracionServiceResponse<any>> {
    try {
      const response = await api.put('medidorModificar', data);
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      console.error('Error al modificar medidor:', error);
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al modificar el medidor'
      };
    }
  }

  /**
   * Crea un nuevo contratante
   */
  async crearContratante(
    contratanteData: any
  ): Promise<AdministracionServiceResponse<any>> {
    try {
      const response = await api.post('/contratante/crear', contratanteData);
      return {
        data: response.data,
        error: null
      };
    } catch (error: any) {
      console.error('Error al crear contratante:', error);
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al crear el contratante'
      };
    }
  }

  /**
   * Sincroniza propietarios con locales asociados
   */
  async sincronizarPropietarios(): Promise<AdministracionServiceResponse<{
    registrosAfectados: number;
    mensaje: string;
  }>> {
    try {
      const response = await api.put('/contrato/actualizar-propietarios-local');
      return {
        data: response.data as { registrosAfectados: number; mensaje: string },
        error: null
      };
    } catch (error: any) {
      console.error('Error al sincronizar propietarios:', error);
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          'Error al sincronizar propietarios'
      };
    }
  }
}

export const administracionService = new AdministracionService();
