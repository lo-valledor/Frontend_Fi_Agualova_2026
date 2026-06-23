import api from "~/lib/api";
import type {
  AcometidaDetail,
  AcometidaRow,
  BuscarAcometidas,
  BuscarContratosLibres,
  CargoFacturableConceptos,
  CargoFacturableProps,
  CargoFacturableRow,
  CargoFacturableTarifas,
  CargoFacturableTiposMedidor,
  CargosFacturables,
  CargoTipoContrato,
  Cliente,
  ClienteFormValues,
  ClientesRow,
  Concepto,
  Conceptos,
  CondicionContrato,
  CondicionContratoFormValues,
  Condiciones,
  CondicionesContratoRow,
  ContratoFormValues,
  ContratosRow,
  Empalmes,
  Estado,
  GuardarConfiguracionPayload,
  Marca,
  MedidoresRow,
  MedidorProps,
  Nichos,
  NombreComuna,
  NombreGiro,
  Sectores,
  Tipo,
  TiposContrato,
  Usuarios,
} from "~/types/administracion";

export interface AdministracionServiceResponse<T> {
  data: T | null;

  error: string | null;
}

class AdministracionService {
  private processApiResponse<T>(response: any): T[] {
    if (
      response.data &&
      typeof response.data === "object" &&
      "data" in response.data &&
      Array.isArray((response.data as { data: T[] }).data)
    ) {
      return (response.data as { data: T[] }).data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }

  async getAcometidasData(): Promise<
    AdministracionServiceResponse<{
      acometidas: AcometidaRow[];
      comboEmpalmes: Empalmes[];
      comboNichos: Nichos[];
      comboSectores: Sectores[];
      contratosDisponibles: BuscarContratosLibres[];
    }>
  > {
    try {
      const [
        resAcometidas,
        resComboEmpalmes,
        resComboNichos,
        resComboSectores,
        resContratosDisponibles,
      ] = await Promise.all([
        api.get("/acometidas/buscar", { params: {} }),
        api.get("/acometidas/empalmes"),
        api.get("/acometidas/nichos"),
        api.get("/acometidas/sectores"),
        api.get("/acometidas/buscar-contratos-libres"),
      ]);

      return {
        data: {
          acometidas: this.processApiResponse<AcometidaRow>(resAcometidas),
          comboEmpalmes: this.processApiResponse<Empalmes>(resComboEmpalmes),
          comboNichos: this.processApiResponse<Nichos>(resComboNichos),
          comboSectores: this.processApiResponse<Sectores>(resComboSectores),
          contratosDisponibles: this.processApiResponse<BuscarContratosLibres>(
            resContratosDisponibles,
          ),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getAcometidasBuscarContratosLibres(
    nombreCliente?: string,
    limit?: number,
    offset?: number,
  ) {
    try {
      const params: Record<string, string | number> = {};
      if (nombreCliente) params.nombreCliente = nombreCliente;
      if (limit) params.limit = limit;
      if (offset) params.offset = offset;

      const response = await api.get("/acometidas/buscar-contratos-libres", {
        params,
      });
      return {
        data: this.processApiResponse<BuscarContratosLibres>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getAcometidaById(
    id: number,
  ): Promise<AdministracionServiceResponse<AcometidaDetail>> {
    try {
      const response = await api.get(`/acometidas/${id}`);
      return {
        data: response.data as AcometidaDetail,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getClientesData(): Promise<
    AdministracionServiceResponse<{
      clientes: ClientesRow[];
      giros: NombreGiro[];
      regiones: string[];
      comunas: NombreComuna[];
    }>
  > {
    try {
      const [resClientes, resGiros, resRegiones] = await Promise.all([
        api.get("/clientes/buscar"),
        api.get("/clientes/buscar-giros"),
        api.get("/clientes/regiones"),
      ]);

      return {
        data: {
          clientes: this.processApiResponse<ClientesRow>(resClientes),
          giros: this.processApiResponse<NombreGiro>(resGiros),
          regiones: this.processApiResponse<string>(resRegiones),
          comunas: [],
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getContratosData(): Promise<
    AdministracionServiceResponse<{
      contratos: ContratosRow[];
    }>
  > {
    try {
      const resContratos = await api.get("/contratos/buscar");

      return {
        data: {
          contratos: this.processApiResponse<ContratosRow>(resContratos),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getClientesBuscar(): Promise<
    AdministracionServiceResponse<ClientesRow[]>
  > {
    try {
      const response = await api.get("/clientes/buscar");
      return {
        data: this.processApiResponse<ClientesRow>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getContratoById(
    id: number,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const resContratos = await api.get(`/contratos/${id}`);
      return {
        data: resContratos.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getDataCreacionContrato(): Promise<
    AdministracionServiceResponse<unknown>
  > {
    try {
      return {
        data: null,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async putDataActualizarContrato(
    data: ContratoFormValues,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const response = await api.put("/contratos/editar", data);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getMedidoresData(): Promise<
    AdministracionServiceResponse<{
      medidores: MedidoresRow[];
      marcas: Marca[];
      tipos: Tipo[];
      estados: Estado[];
      buscarAcometidas: BuscarAcometidas[];
    }>
  > {
    try {
      const [
        resMedidores,
        resMarcas,
        resTipos,
        resEstados,
        resBuscarAcometidas,
      ] = await Promise.all([
        api.get("/medidores/buscar"),
        api.get("/medidores/marcas"),
        api.get("/medidores/tipos"),
        api.get("/medidores/estados"),
        api.get("/medidores/buscar-acometidas"),
      ]);

      return {
        data: {
          medidores: this.processApiResponse<MedidoresRow>(resMedidores),
          marcas: this.processApiResponse<Marca>(resMarcas),
          tipos: this.processApiResponse<Tipo>(resTipos),
          estados: this.processApiResponse<Estado>(resEstados),
          buscarAcometidas:
            this.processApiResponse<BuscarAcometidas>(resBuscarAcometidas),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async postMedidoresData(): Promise<
    AdministracionServiceResponse<{
      marca: Marca[];
      tipoMedidor: Tipo[];
    }>
  > {
    try {
      const [resMarcas, resTiposMedidor] = await Promise.all([
        api.get("/medidores/marcas"),
        api.get("/medidores/tipos"),
      ]);

      return {
        data: {
          marca: this.processApiResponse<Marca>(resMarcas),
          tipoMedidor: this.processApiResponse<Tipo>(resTiposMedidor),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getMedidoresByCodigo({ codigo }: { codigo: string }): Promise<
    AdministracionServiceResponse<{
      medidor: MedidoresRow | null;
      marca: Marca[];
      tipoMedidor: Tipo[];
      estados: Estado[];
      buscarAcometidas: BuscarAcometidas[];
    }>
  > {
    try {
      const [
        resMedidor,
        resMarcas,
        resTiposMedidor,
        resEstados,
        resBuscarAcometidas,
      ] = await Promise.all([
        api.get(`/medidores/${codigo}`),
        api.get("/medidores/marcas"),
        api.get("/medidores/tipos"),
        api.get("/medidores/estados"),
        api.get("/medidores/buscar-acometidas"),
      ]);

      return {
        data: {
          medidor: (resMedidor.data as MedidoresRow) ?? null,
          marca: this.processApiResponse<Marca>(resMarcas),
          tipoMedidor: this.processApiResponse<Tipo>(resTiposMedidor),
          estados: this.processApiResponse<Estado>(resEstados),
          buscarAcometidas:
            this.processApiResponse<BuscarAcometidas>(resBuscarAcometidas),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getUsuarios(): Promise<AdministracionServiceResponse<Usuarios[]>> {
    try {
      const response = await api.get("GetAllUsers");
      return {
        data: response.data as Usuarios[],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getCargoTipoContrato(): Promise<
    AdministracionServiceResponse<CargoTipoContrato[]>
  > {
    try {
      const response = await api.get("/cargos-tipos-contrato/buscar");
      return {
        data: this.processApiResponse<CargoTipoContrato>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getCargoTipoContratoById(cargoTipoContratoId: number): Promise<
    AdministracionServiceResponse<{
      tipoContratoId: number;
      tipoContrato: string;
      configuracion: GuardarConfiguracionPayload;
      conceptos: Conceptos[];
      condiciones: Condiciones[];
      cargosFacturables: CargosFacturables[];
    }>
  > {
    try {
      const [
        responseEditar,
        responseConceptos,
        responseCondicionesContrato,
        responseCargos,
      ] = await Promise.all([
        api.get(`/cargos-tipos-contrato/${cargoTipoContratoId}`),
        api.get("/cargos-tipos-contrato/conceptos"),
        api.get("/cargos-tipos-contrato/condiciones"),
        api.get("/cargos-tipos-contrato/cargos-facturables"),
      ]);
      const estructura = responseEditar.data as Record<string, unknown>;
      const detalle = Array.isArray(estructura.detalle)
        ? estructura.detalle
        : Array.isArray(estructura.condiciones)
          ? estructura.condiciones
          : [];
      const listbox = Array.isArray(estructura.listbox)
        ? estructura.listbox
        : [];
      const toNumber = (value: unknown): number | null => {
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (typeof value === "string" && value.trim() !== "") {
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
      };
      const toNumberArray = (value: unknown): number[] =>
        Array.isArray(value)
          ? value
              .map((item) =>
                toNumber(
                  typeof item === "object" && item !== null && "idCargo" in item
                    ? (item as { idCargo?: unknown }).idCargo
                    : item,
                ),
              )
              .filter((item): item is number => item !== null)
          : [];
      const configuracion: GuardarConfiguracionPayload = {
        idTipoContrato:
          toNumber(estructura.idTipoContrato) ?? cargoTipoContratoId,
        condiciones: detalle
          .map((item) => {
            const current = item as Record<string, unknown>;
            const idCargo =
              toNumber(current.idCargo) ?? toNumber(current.cargoId);
            const idCondicion =
              toNumber(current.idCondicion) ?? toNumber(current.condicionId);
            if (idCargo === null || idCondicion === null) {
              return null;
            }
            return {
              idCargo,
              idCondicion,
              descripcion:
                typeof current.descripcion === "string"
                  ? current.descripcion
                  : "",
            };
          })
          .filter(
            (
              item,
            ): item is GuardarConfiguracionPayload["condiciones"][number] =>
              item !== null,
          ),
        idsCargosMonofasicos:
          toNumberArray(estructura.idsCargosMonofasicos).length > 0
            ? toNumberArray(estructura.idsCargosMonofasicos)
            : listbox
                .filter((item) => {
                  const tipoMedidor = toNumber(
                    (item as { tipoMedidor?: unknown }).tipoMedidor,
                  );
                  return tipoMedidor === 1;
                })
                .map((item) =>
                  toNumber((item as { cargoId?: unknown }).cargoId),
                )
                .filter((item): item is number => item !== null),
        idsCargosTrifasicos:
          toNumberArray(estructura.idsCargosTrifasicos).length > 0
            ? toNumberArray(estructura.idsCargosTrifasicos)
            : listbox
                .filter((item) => {
                  const tipoMedidor = toNumber(
                    (item as { tipoMedidor?: unknown }).tipoMedidor,
                  );
                  return tipoMedidor === 2;
                })
                .map((item) =>
                  toNumber((item as { cargoId?: unknown }).cargoId),
                )
                .filter((item): item is number => item !== null),
        idsCargosAmbos:
          toNumberArray(estructura.idsCargosAmbos).length > 0
            ? toNumberArray(estructura.idsCargosAmbos)
            : listbox
                .filter((item) => {
                  const tipoMedidor = toNumber(
                    (item as { tipoMedidor?: unknown }).tipoMedidor,
                  );
                  return tipoMedidor === 0;
                })
                .map((item) =>
                  toNumber((item as { cargoId?: unknown }).cargoId),
                )
                .filter((item): item is number => item !== null),
      };

      return {
        data: {
          tipoContratoId: configuracion.idTipoContrato,
          tipoContrato:
            typeof estructura.tipoContrato === "string"
              ? estructura.tipoContrato
              : `Tipo de contrato ${configuracion.idTipoContrato}`,
          configuracion,
          conceptos: this.processApiResponse<Conceptos>(responseConceptos),
          condiciones: this.processApiResponse<Condiciones>(
            responseCondicionesContrato,
          ),
          cargosFacturables:
            this.processApiResponse<CargosFacturables>(responseCargos),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getCargoTipoContratoCrear(): Promise<
    AdministracionServiceResponse<{
      tiposContrato: TiposContrato[];
      conceptos: Conceptos[];
      condiciones: Condiciones[];
      cargosFacturables: CargosFacturables[];
    }>
  > {
    try {
      const [
        responseTiposContrato,
        responseConceptos,
        responseCondicionesContrato,
        responseCargos,
      ] = await Promise.all([
        api.get("/cargos-tipos-contrato/tipos-contrato"),
        api.get("/cargos-tipos-contrato/conceptos"),
        api.get("/cargos-tipos-contrato/condiciones"),
        api.get("/cargos-tipos-contrato/cargos-facturables"),
      ]);

      return {
        data: {
          tiposContrato: this.processApiResponse<TiposContrato>(
            responseTiposContrato,
          ),
          conceptos: this.processApiResponse<Conceptos>(responseConceptos),
          condiciones: this.processApiResponse<Condiciones>(
            responseCondicionesContrato,
          ),
          cargosFacturables:
            this.processApiResponse<CargosFacturables>(responseCargos),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async saveCargoTipoContratoConfiguration(
    payload: GuardarConfiguracionPayload | Record<string, unknown>,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const response = await api.post(
        "/cargos-tipos-contrato/guardar-configuracion",
        payload,
      );
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getCondicionesContratoData(): Promise<
    AdministracionServiceResponse<{
      condicionesContrato: CondicionesContratoRow[];
      conceptos: Concepto[];
    }>
  > {
    try {
      const [resCondicionesContrato, resConceptos] = await Promise.all([
        api.get("/condiciones-contrato/buscar"),
        api.get("/condiciones-contrato/conceptos"),
      ]);

      return {
        data: {
          condicionesContrato: this.processApiResponse<CondicionesContratoRow>(
            resCondicionesContrato,
          ),
          conceptos: this.processApiResponse<Concepto>(resConceptos),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getCargoFacturableData(): Promise<
    AdministracionServiceResponse<{
      cargos: CargoFacturableRow[];
      conceptos: CargoFacturableConceptos[];
      tarifas: CargoFacturableTarifas[];
      tiposMedidor: CargoFacturableTiposMedidor[];
    }>
  > {
    try {
      const [resCargoFacturable, resConceptos, resTarifas, resTiposMedidor] =
        await Promise.all([
          api.get("/cargos-facturables/buscar"),
          api.get("/cargos-facturables/conceptos"),
          api.get("/cargos-facturables/tarifas"),
          api.get("/cargos-facturables/tipos-medidor"),
        ]);

      return {
        data: {
          cargos:
            this.processApiResponse<CargoFacturableRow>(resCargoFacturable),
          conceptos:
            this.processApiResponse<CargoFacturableConceptos>(resConceptos),
          tarifas: this.processApiResponse<CargoFacturableTarifas>(resTarifas),
          tiposMedidor:
            this.processApiResponse<CargoFacturableTiposMedidor>(
              resTiposMedidor,
            ),
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getCondicionContratoById(
    id: number,
  ): Promise<AdministracionServiceResponse<CondicionContrato>> {
    try {
      const response = await api.get(`/condiciones-contrato/${id}`);
      return {
        data: response.data as CondicionContrato,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async createCondicionContrato(
    data: CondicionContratoFormValues | Record<string, unknown>,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const response = await api.post("/condiciones-contrato/crear", data);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async updateCondicionContrato(
    data: CondicionContratoFormValues | Record<string, unknown>,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const response = await api.put("/condiciones-contrato/editar", data);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getCargoFacturableById(
    id: number,
  ): Promise<AdministracionServiceResponse<CargoFacturableProps>> {
    try {
      const response = await api.get(`/cargos-facturables/${id}`);
      return {
        data: response.data as CargoFacturableProps,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async createCargoFacturable(
    data: Record<string, unknown>,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const response = await api.post("/cargos-facturables/crear", data);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async updateCargoFacturable(
    data: Record<string, unknown>,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const response = await api.put("/cargos-facturables/editar", data);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async crearContrato(
    contratoData: Record<string, unknown>,
  ): Promise<AdministracionServiceResponse<any>> {
    try {
      // 🐛 DEBUG: Logs del servicio
      console.log("🔧 [administracionService.crearContrato]");
      console.log("📍 URL:", "/contrato/crear");
      console.log("📦 Payload:", JSON.stringify(contratoData, null, 2));
      console.log("🔑 Campos enviados:", Object.keys(contratoData));

      const response = await api.post("/contrato/crear", contratoData);

      console.log("✅ Respuesta exitosa:", response.data);

      return {
        data: response.data,
        error: null,
      };
    } catch (error: any) {
      // 🐛 DEBUG: Logs de error detallados
      console.error("❌ [administracionService.crearContrato] ERROR");
      console.error("📍 Status:", error.response?.status);
      console.error("📍 Status Text:", error.response?.statusText);
      console.error("📍 Response Data:", error.response?.data);
      console.error("📍 Request URL:", error.config?.url);
      console.error("📍 Request Method:", error.config?.method);
      console.error("📍 Request Headers:", error.config?.headers);
      console.error("📍 Error completo:", error);

      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al crear el contrato",
      };
    }
  }

  async modificarContrato(
    contratoData: Record<string, unknown>,
  ): Promise<AdministracionServiceResponse<any>> {
    try {
      const response = await api.put("/contrato/modificar", contratoData);
      return {
        data: response.data,
        error: null,
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
        errorMessage = "Error de conexión con el servidor";
      } else {
        // Error en configuración de la petición
        errorMessage = error.message || "Error al modificar el contrato";
      }

      return {
        data: null,
        error: errorMessage,
      };
    }
  }

  async getGiros(): Promise<AdministracionServiceResponse<NombreGiro[]>> {
    try {
      const response = await api.get("/clientes/buscar-giros");
      return {
        data: this.processApiResponse<NombreGiro>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getComunas(
    region?: string,
  ): Promise<AdministracionServiceResponse<NombreComuna[]>> {
    try {
      if (!region) {
        return { data: [], error: null };
      }
      const response = await api.get(`/clientes/comunas/${region}`);
      return {
        data: this.processApiResponse<NombreComuna>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getClientesByRut(): Promise<
    AdministracionServiceResponse<ClientesRow[]>
  > {
    try {
      const response = await api.get("/clientes/buscar");
      return {
        data: this.processApiResponse<ClientesRow>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getClienteByRut(
    rut: string,
  ): Promise<AdministracionServiceResponse<Cliente>> {
    try {
      const response = await api.get(`/clientes/${rut}`);
      return {
        data: response.data as Cliente,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async createCliente(
    data: ClienteFormValues | Record<string, unknown>,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const response = await api.post("/clientes/crear", data);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async updateCliente(
    data: ClienteFormValues | Record<string, unknown>,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const response = await api.put("/clientes/editar", data);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getContratanteByRut(
    rut: string,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const response = await api.get(`/clientes/datos-propietario/${rut}`);
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getPropietarioByRut(
    nombre?: string,
    rut?: string,
  ): Promise<AdministracionServiceResponse<unknown>> {
    try {
      const params = new URLSearchParams();
      if (nombre) params.append("nombre", nombre);
      if (rut) params.append("rut", rut);
      const response = await api.get(`/contratos/buscar-propietarios`, {
        params,
      });
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async crearMedidor(
    data: MedidorProps,
  ): Promise<AdministracionServiceResponse<{ id: number }>> {
    try {
      const response = await api.post("/medidores/crear", data);
      return {
        data: response.data as { id: number },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al crear medidor",
      };
    }
  }

  async modificarMedidor(
    data: MedidorProps,
  ): Promise<AdministracionServiceResponse<any>> {
    try {
      const response = await api.put("/medidores/editar", data);
      return {
        data: response.data,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al modificar el medidor",
      };
    }
  }

  async crearContratante(
    contratanteData: any,
  ): Promise<AdministracionServiceResponse<any>> {
    try {
      const response = await api.post("/contratante/crear", contratanteData);
      return {
        data: response.data,
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al crear el contratante",
      };
    }
  }

  async sincronizarPropietarios(): Promise<
    AdministracionServiceResponse<{
      registrosAfectados: number;
      mensaje: string;
    }>
  > {
    try {
      const response = await api.post("/contrato/sincronizar-propietarios");
      return {
        data: response.data as { registrosAfectados: number; mensaje: string },
        error: null,
      };
    } catch (error: any) {
      return {
        data: null,
        error:
          error.response?.data?.message ||
          error.message ||
          "Error al sincronizar propietarios",
      };
    }
  }

  // Busquedas con limit y offset para paginación
  async getAcometidaByLimitAndOffset(
    ubicacion?: string,
    idSector?: number,
    idNicho?: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<AdministracionServiceResponse<AcometidaRow[]>> {
    try {
      const params: Record<string, string | number> = {
        limit,
        offset,
      };
      if (ubicacion) params.ubicacion = ubicacion;
      if (idSector) params.idSector = idSector;
      if (idNicho) params.idNicho = idNicho;
      const response = await api.get("/acometidas/buscar", { params });
      return {
        data: this.processApiResponse<AcometidaRow>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  async getContratosByLimitAndOffset(params: {
    nombreCliente?: string;
    rutCliente?: string;
    nombrePropietario?: string;
    rutPropietario?: string;
    numeroLocal?: string;
    numeroContrato?: string;
    Limit?: number;
    Offset?: number;
  }): Promise<AdministracionServiceResponse<ContratosRow[]>> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params.nombreCliente)
        queryParams.nombreCliente = params.nombreCliente;
      if (params.rutCliente) queryParams.rutCliente = params.rutCliente;
      if (params.nombrePropietario) {
        queryParams.nombrePropietario = params.nombrePropietario;
      }
      if (params.rutPropietario) {
        queryParams.rutPropietario = params.rutPropietario;
      }
      if (params.numeroLocal) queryParams.numeroLocal = params.numeroLocal;
      if (params.numeroContrato) {
        queryParams.numeroContrato = params.numeroContrato;
      }
      if (params.Limit !== undefined) queryParams.Limit = params.Limit;
      if (params.Offset !== undefined) queryParams.Offset = params.Offset;

      const response = await api.get("/contratos/buscar", {
        params: queryParams,
      });
      return {
        data: this.processApiResponse<ContratosRow>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al buscar contratos",
      };
    }
  }

  async getClientesByLimitAndOffset(params: {
    nombreCliente?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdministracionServiceResponse<ClientesRow[]>> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params.nombreCliente)
        queryParams.nombreCliente = params.nombreCliente;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.offset !== undefined) queryParams.offset = params.offset;

      const response = await api.get("/clientes/buscar", {
        params: queryParams,
      });
      return {
        data: this.processApiResponse<ClientesRow>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al buscar clientes",
      };
    }
  }

  async getMedidoresByLimitAndOffset(params: {
    modelo?: string;
    serie?: string;
    limit?: number;
    offset?: number;
  }): Promise<AdministracionServiceResponse<MedidoresRow[]>> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params.modelo) queryParams.modelo = params.modelo;
      if (params.serie) queryParams.serie = params.serie;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.offset !== undefined) queryParams.offset = params.offset;

      const response = await api.get("/medidores/buscar", {
        params: queryParams,
      });
      return {
        data: this.processApiResponse<MedidoresRow>(response),
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Error al buscar medidores",
      };
    }
  }
}

export const administracionService = new AdministracionService();
