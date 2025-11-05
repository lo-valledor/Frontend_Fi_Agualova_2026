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

/**
 * Interfaz estándar para respuestas del servicio de administración
 * Encapsula el resultado exitoso o error de operaciones
 *
 * @template T - Tipo de datos que retorna la operación exitosa
 */
export interface AdministracionServiceResponse<T> {
  /** Datos devueltos en caso de éxito, null si hay error */
  data: T | null;
  /** Mensaje de error si falla la operación, null si es exitosa */
  error: string | null;
}

/**
 * Servicio para operaciones de administración del sistema
 *
 * Maneja las operaciones CRUD y consultas para entidades de administración como:
 * - Acometidas
 * - Clientes
 * - Contratos
 * - Medidores
 * - Propietarios
 * - Contratantes
 * - Giros
 * - Comunas
 * - Usuarios
 * - Marcas
 * - Cargo Tipo Contrato
 * - Condiciones Contrato
 * - Cargo Facturable
 *
 * Todas las operaciones retornan un objeto AdministracionServiceResponse
 * que encapsula el resultado o error.
 */
class AdministracionService {
  /**
   * Normaliza respuestas de API con formato variable
   *
   * El backend puede retornar datos en dos formatos diferentes:
   * - Formato anidado: `{ data: { data: T[] } }`
   * - Formato directo: `{ data: T[] }`
   *
   * Este método normaliza ambos casos y retorna siempre un array.
   *
   * @template T - Tipo de elementos del array esperado
   * @param response - Respuesta de axios con estructura variable
   * @returns Array de tipo T, o array vacío si no se encuentra data válida
   *
   * @private
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
   *
   * @returns Promise con objeto conteniendo todos los datos o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.getAcometidasData();
   * if (error) {
   *   console.error('Error al obtener acometidas:', error);
   * } else {
   *   console.log('Datos de acometidas:', data);
   * }
   * ```
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
   *
   * @returns Promise con clientes, giros y comunas o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.getClientesData();
   * if (data) {
   *   console.log('Clientes:', data.clientes);
   *   console.log('Giros:', data.giros);
   * }
   * ```
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
   * Obtiene datos de contratos del sistema
   *
   * @returns Promise con lista de contratos o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.getContratosData();
   * if (data) {
   *   console.log('Total contratos:', data.contratos.length);
   * }
   * ```
   */
  async getContratosData(): Promise<
    AdministracionServiceResponse<{
      contratos: GetContratos[];
    }>
  > {
    try {
      const resContratos = await api.get('contrato/buscar');

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
   * Obtiene datos de propietarios y contratantes
   *
   * @returns Promise con propietarios y contratantes o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.getPropietariosData();
   * if (data) {
   *   console.log('Propietarios:', data.propietarios);
   * }
   * ```
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
   * Obtiene datos de contratantes con sus datos relacionados
   *
   * @returns Promise con contratantes, giros y comunas o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.getContratantesData();
   * if (data) {
   *   console.log('Total contratantes:', data.contratantes.length);
   * }
   * ```
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
   * Obtiene lista completa de clientes del sistema
   *
   * @returns Promise con array de clientes o error
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
   * Obtiene un contrato específico por su ID con todos sus datos relacionados
   *
   * @param id - ID del contrato a buscar
   * @returns Promise con datos completos del contrato o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.getContratoById(123);
   * if (data) {
   *   console.log('Contrato:', data.contrato.nombreContrato);
   * }
   * ```
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
   * Obtiene datos necesarios para crear un contrato nuevo
   *
   * Retorna propietarios, locales, comunas, madres y clientes que se
   * necesitan para los formularios de creación de contratos
   *
   * @returns Promise con todos los datos de creación o error
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
   * Obtiene datos de medidores con sus marcas asociadas
   *
   * @returns Promise con medidores y marcas o error
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
   * Obtiene marcas y tipos de medidor para formularios de creación
   *
   * @returns Promise con marcas y tipos de medidor o error
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
   * Obtiene un medidor específico por su código con marca y tipo
   *
   * @param params - Objeto con parámetros de búsqueda
   * @param params.codigo - Código del medidor a buscar
   * @returns Promise con medidor, marca y tipo o error
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
   * Obtiene lista completa de usuarios del sistema
   *
   * @returns Promise con array de usuarios o error
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
   * Obtiene lista de relaciones entre cargos y tipos de contrato
   *
   * @returns Promise con array de cargo-tipo-contrato o error
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
   * Obtiene datos completos de una relación cargo-tipo-contrato específica
   *
   * Incluye datos de edición, detalles, listbox y todos los combos necesarios
   * para la visualización y edición del registro
   *
   * @param cargoTipoContratoId - ID de la relación cargo-tipo-contrato
   * @returns Promise con todos los datos relacionados o error
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
   * Obtiene los datos necesarios para crear un nuevo cargo tipo contrato
   *
   * Incluye todos los combos necesarios sin datos de un registro específico
   *
   * @returns Promise con todos los combos necesarios o error
   */
  async getCargoTipoContratoCrear(): Promise<
    AdministracionServiceResponse<{
      conceptos: GeCombosConceptos[];
      tarifas: GetCombosTarifas[];
      tiposMedidor: GetCombosTiposMedidor[];
      condicionesContrato: GetCondicionesContrato[];
      cargos: BuscarCargoFacturable[];
    }>
  > {
    try {
      const [
        responseConceptos,
        responseTarifas,
        responseTiposMedidor,
        responseCondicionesContrato,
        responseCargos
      ] = await Promise.all([
        api.get('combos/conceptos'),
        api.get('combos/tarifas'),
        api.get('combos/tipos-medidor'),
        api.get('condicion-contrato/condicionContrato-Buscar'),
        api.get('buscarCargoFacturable')
      ]);

      return {
        data: {
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
   * Obtiene condiciones de contrato con sus conceptos asociados
   *
   * @returns Promise con condiciones y conceptos o error
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
   * Obtiene cargos facturables con sus datos de configuración
   *
   * Incluye conceptos, tarifas y tipos de medidor asociados
   *
   * @returns Promise con cargos y combos relacionados o error
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
   * Crea un nuevo contrato en el sistema
   *
   * @param contratoData - Datos del contrato a crear
   * @returns Promise con confirmación de creación o error
   *
   * @example
   * ```typescript
   * const nuevoContrato: CrearContratoProps = { ... };
   * const { data, error } = await administracionService.crearContrato(nuevoContrato);
   * if (error) {
   *   console.error('Error:', error);
   * }
   * ```
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
   * Modifica un contrato existente
   *
   * Realiza validación y actualización completa del contrato.
   * Incluye manejo detallado de errores de validación del backend.
   *
   * @param contratoData - Datos actualizados del contrato
   * @returns Promise con confirmación o error detallado
   *
   * @example
   * ```typescript
   * const datosActualizados: ModificarContratoProps = { id: 123, ... };
   * const { data, error } = await administracionService.modificarContrato(datosActualizados);
   * ```
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
      // Extraer información detallada del error
      let errorMessage: string;

      if (error.response) {
        // Error de respuesta del servidor (4xx, 5xx)

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
   * Obtiene catálogo completo de giros comerciales
   *
   * @returns Promise con array de giros o error
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
   * Obtiene listado de comunas organizadas por región
   *
   * @returns Promise con array de comunas o error
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
   * Obtiene lista completa de clientes indexados por RUT
   *
   * @returns Promise con array de clientes o error
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
   * Busca un cliente específico por su RUT
   *
   * @param rut - RUT del cliente (con o sin formato)
   * @returns Promise con datos del cliente o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.getClienteByRut('12345678-9');
   * ```
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
   * Busca un contratante específico por su RUT
   *
   * @param rut - RUT del contratante (con o sin formato)
   * @returns Promise con datos del contratante o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.getContratanteByRut('12345678-9');
   * ```
   */
  async getContratanteByRut(
    rut: string
  ): Promise<AdministracionServiceResponse<GetContratante>> {
    try {
      const response = await api.get(`Contratante/${rut}`);
      return {
        data: this.processApiResponse<GetContratante>(response)[0],
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
   * Busca un propietario específico por su RUT
   *
   * @param rut - RUT del propietario (con o sin formato)
   * @returns Promise con datos del propietario o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.getPropietarioByRut('12345678-9');
   * ```
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
   * Crea un nuevo medidor en el sistema
   *
   * @param data - Datos del medidor a crear (código, tipo, ubicación, etc.)
   * @returns Promise con el ID del medidor creado o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.crearMedidor({
   *   codigo: 'M001',
   *   tipo: 'Digital',
   *   ubicacion: 'Local 123'
   * });
   * ```
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
   * Actualiza los datos de un medidor existente
   *
   * @param data - Datos actualizados del medidor (incluye ID del medidor a modificar)
   * @returns Promise con respuesta de actualización o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.modificarMedidor({
   *   id: 123,
   *   codigo: 'M001-UPD',
   *   estado: 'Activo'
   * });
   * ```
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
   * Crea un nuevo contratante en el sistema
   *
   * @param contratanteData - Datos del contratante (RUT, nombre, dirección, contacto, etc.)
   * @returns Promise con datos del contratante creado o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.crearContratante({
   *   rut: '12345678-9',
   *   nombre: 'Juan Pérez',
   *   email: 'juan@example.com'
   * });
   * ```
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
   * Sincroniza propietarios con sus locales asociados
   *
   * Actualiza la relación entre propietarios y locales en el sistema,
   * asegurando consistencia de datos entre ambas entidades.
   *
   * @returns Promise con número de registros afectados y mensaje de confirmación, o error
   *
   * @example
   * ```typescript
   * const { data, error } = await administracionService.sincronizarPropietarios();
   * if (data) {
   *   console.log(`Sincronizados ${data.registrosAfectados} registros`);
   * }
   * ```
   */
  async sincronizarPropietarios(): Promise<
    AdministracionServiceResponse<{
      registrosAfectados: number;
      mensaje: string;
    }>
  > {
    try {
      const response = await api.put('/contrato/actualizar-propietarios-local');
      return {
        data: response.data as { registrosAfectados: number; mensaje: string },
        error: null
      };
    } catch (error: any) {
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
