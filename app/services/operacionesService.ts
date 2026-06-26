import api from '~/lib/api';
import type {
  CambioMedidorBuscarAntiguoRequest,
  CambioMedidorBuscarNuevoRequest,
  CambioMedidorEjecutarCambioRequest,
  CerrarLecturasBuscarEstadisticasRequest,
  CerrarLecturasCerrarRequest,
  CerrarLecturasCerrarResponse,
  CerrarLecturasFiltrosCiclosResponse,
  CerrarLecturasFiltrosPeriodosResponse,
  CorteReposicionBuscarRequest,
  CorteReposicionLiberarRequest,
  CorteReposicionRegistrarCorteRequest,
  CorteReposicionResumenResponse,
  LanzarCalculoResponse,
  PeriodosAniosDisponiblesResponse,
  PeriodosBuscarRequest,
  PeriodosCrearRequest,
  PreciosConsultarRequest,
  PreciosGuardarMasivoRequest,
  PrepararLecturasBuscarNichosRequest,
  PrepararLecturasFiltrosCiclosResponse,
  PrepararLecturasFiltrosPeriodosResponse,
  PrepararLecturasGenerarRequest,
  RevisarCalculosBuscarPrefacturasResponse,
  RevisarCalculosEstadoProcesoRequest,
  RevisarCalculosFiltrosCiclosResponse,
  RevisarCalculosFiltrosPeriodosResponse,
  RevisarCalculosLanzarCalculoRequest,
  RevisionPreciosBuscarRequest,
  RevisionPreciosConfirmarRequest,
  RevisionPreciosCorregirRequest,
  RevisionPreciosDetalleCorreccionResponse,
  SAPEmpresas,
  SAPSugeridos
} from '~/types/operaciones';

export interface OperacionesServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export interface SAPDownloadFile {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
}

class OperacionesService {
  /**
   * Algunos endpoints del backend devuelven status 200 con un body
   * `{ message: "Error: ..." }` para señalar fallos. Este helper extrae ese
   * mensaje para que el llamador lo trate como error.
   */
  private extractErrorFromResponse(data: unknown): string | null {
    if (data && typeof data === 'object' && 'message' in data) {
      const message = String((data as { message: unknown }).message);
      if (message.toLowerCase().startsWith('error:')) {
        return message;
      }
    }
    return null;
  }

  private processApiResponse<T>(response: unknown): T[] {
    if (
      typeof response === 'object' &&
      response !== null &&
      'data' in response
    ) {
      const data = (response as { data?: unknown }).data;

      if (
        typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        Array.isArray((data as { data?: unknown }).data)
      ) {
        return (data as { data: T[] }).data;
      }

      if (Array.isArray(data)) {
        return data as T[];
      }
    }

    return [];
  }

  private normalizeSapEmpresas(response: unknown): SAPEmpresas[] {
    const empresas = this.processApiResponse<SAPEmpresas>(response);

    if (empresas.length > 0) {
      return empresas;
    }

    if (
      typeof response === 'object' &&
      response !== null &&
      'data' in response &&
      typeof (response as { data?: unknown }).data === 'object' &&
      (response as { data?: unknown }).data !== null
    ) {
      const data = (response as { data: unknown }).data;

      if (Array.isArray(data)) {
        return data as SAPEmpresas[];
      }

      if ('id' in (data as object) && 'nombre' in (data as object)) {
        return [data as SAPEmpresas];
      }
    }

    return [];
  }

  private normalizeSapSugeridos(response: unknown): SAPSugeridos | null {
    if (
      typeof response === 'object' &&
      response !== null &&
      'data' in response &&
      typeof (response as { data?: unknown }).data === 'object' &&
      (response as { data?: unknown }).data !== null
    ) {
      const data = (response as { data: unknown }).data;

      if (
        'nombreEncabezado' in (data as object) &&
        'nombreDetalle' in (data as object)
      ) {
        return data as SAPSugeridos;
      }
    }

    return null;
  }

  private extractFilenameFromHeaders(headers: unknown): string | null {
    if (!headers || typeof headers !== 'object') {
      return null;
    }

    const contentDisposition =
      'content-disposition' in headers
        ? String(
            (headers as Record<string, unknown>)['content-disposition'] ?? ''
          )
        : '';

    if (!contentDisposition) {
      return null;
    }

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]);
    }

    const filenameMatch = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    );

    if (filenameMatch?.[1]) {
      return filenameMatch[1].replace(/['"]/g, '');
    }

    return null;
  }

  /**
   * Periodos Facturacion
   * @returns
   */
  async getPeriodoAbierto(): Promise<
    OperacionesServiceResponse<PrepararLecturasFiltrosPeriodosResponse[]>
  > {
    try {
      const response = await api.get('/preparar-lecturas/filtros/periodos');
      return {
        data: this.processApiResponse<PrepararLecturasFiltrosPeriodosResponse>(
          response
        ),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPeriodoFacturacionData(
    mes?: string,
    anio?: string,
    limit?: number,
    offset?: number
  ): Promise<OperacionesServiceResponse<PeriodosBuscarRequest[]>> {
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes);
      if (anio) params.append('anio', anio);
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      const response = await api.get('/periodos/buscar', {
        params
      });
      return {
        data: this.processApiResponse<PeriodosBuscarRequest>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPeriodosAniosDisponibles(): Promise<
    OperacionesServiceResponse<PeriodosAniosDisponiblesResponse[]>
  > {
    try {
      const response = await api.get('/periodos/anios-disponibles');
      return {
        data: this.processApiResponse<PeriodosAniosDisponiblesResponse>(
          response
        ),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getPeriodoFacturacionPageData(): Promise<
    OperacionesServiceResponse<{
      years: PeriodosAniosDisponiblesResponse[];
      periodos: PeriodosBuscarRequest[];
    }>
  > {
    try {
      const [yearsResponse, periodosResponse] = await Promise.all([
        api.get('/periodos/anios-disponibles'),
        api.get('/periodos/buscar')
      ]);

      return {
        data: {
          years:
            this.processApiResponse<PeriodosAniosDisponiblesResponse>(
              yearsResponse
            ),
          periodos:
            this.processApiResponse<PeriodosBuscarRequest>(periodosResponse)
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

  async getPeriodoFacturacionByLimitAndOffset(
    mes?: string,
    anio?: string,
    limit?: number,
    offset?: number
  ): Promise<OperacionesServiceResponse<PeriodosBuscarRequest[]>> {
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes);
      if (anio) params.append('anio', anio);
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      const response = await api.get('/periodos/buscar', {
        params
      });
      return {
        data: this.processApiResponse<PeriodosBuscarRequest>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getCiclosFacturacion(): Promise<
    OperacionesServiceResponse<PrepararLecturasFiltrosCiclosResponse[]>
  > {
    try {
      const response = await api.get('/preparar-lecturas/filtros/ciclos');
      return {
        data: this.processApiResponse<PrepararLecturasFiltrosCiclosResponse>(
          response
        ),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async postCrearPeriodoFacturacion(request: PeriodosCrearRequest) {
    try {
      const response = await api.post('/periodos/crear', request);
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

  async postCerrarPeriodoFacturacion(codigo: string) {
    try {
      const params = new URLSearchParams();
      params.append('codigo', codigo);
      const response = await api.post(
        `/periodos/cerrar/${codigo}`,
        {},
        { params }
      );
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

  /**
   * Preparar lecturas
   * @returns
   */

  async getPrepararLecturasData(): Promise<
    OperacionesServiceResponse<{
      periodoAbierto: PrepararLecturasFiltrosPeriodosResponse[];
      ciclos: PrepararLecturasFiltrosCiclosResponse[];
    }>
  > {
    try {
      const [periodoAbierto, ciclos] = await Promise.all([
        api.get('/preparar-lecturas/filtros/periodos'),
        api.get('/preparar-lecturas/filtros/ciclos')
      ]);

      return {
        data: {
          periodoAbierto:
            this.processApiResponse<PrepararLecturasFiltrosPeriodosResponse>(
              periodoAbierto
            ),
          ciclos:
            this.processApiResponse<PrepararLecturasFiltrosCiclosResponse>(
              ciclos
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

  async postGenerarLecturas(
    request: PrepararLecturasGenerarRequest
  ): Promise<OperacionesServiceResponse<any>> {
    try {
      const response = await api.post('/preparar-lecturas/generar', request);
      const errorFromBody = this.extractErrorFromResponse(response.data);
      if (errorFromBody) {
        return { data: null, error: errorFromBody };
      }
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

  async getBuscarNichos(
    cicloId: number,
    periodoId: string
  ): Promise<
    OperacionesServiceResponse<PrepararLecturasBuscarNichosRequest[]>
  > {
    try {
      const params = new URLSearchParams();
      params.append('cicloId', cicloId.toString());
      params.append('periodoId', periodoId);
      const response = await api.get('/preparar-lecturas/buscar-nichos', {
        params
      });
      return {
        data: this.processApiResponse<PrepararLecturasBuscarNichosRequest>(
          response
        ),
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
   * Precios Cargo
   * @param mes
   * @param anio
   * @returns
   */

  async getPreciosCargoData(
    mes: string,
    anio: string
  ): Promise<OperacionesServiceResponse<PreciosConsultarRequest[]>> {
    try {
      const params = new URLSearchParams();
      params.append('mes', mes);
      params.append('anio', anio);

      const response = await api.get('/precios/consultar', {
        params
      });
      return {
        data: response.data as PreciosConsultarRequest[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async postGuardarPreciosCargoMasivo(
    request: PreciosGuardarMasivoRequest
  ): Promise<OperacionesServiceResponse<any>> {
    try {
      const response = await api.post('/precios/guardar-masivo', request);
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

  /** Revisar Precios */

  async getRevisarPreciosData(
    mes: string,
    anio: string
  ): Promise<OperacionesServiceResponse<RevisionPreciosBuscarRequest[]>> {
    try {
      const params = new URLSearchParams();
      params.append('mes', mes);
      params.append('anio', anio);

      const response = await api.get('/revision-precios/buscar', {
        params
      });

      return {
        data: this.processApiResponse<RevisionPreciosBuscarRequest>(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async postConfirmarRevisionPrecios(
    request: RevisionPreciosConfirmarRequest
  ): Promise<OperacionesServiceResponse<any>> {
    try {
      const response = await api.post('/revision-precios/confirmar', request);
      const errorFromBody = this.extractErrorFromResponse(response.data);
      if (errorFromBody) {
        return { data: null, error: errorFromBody };
      }
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

  async getDetalleCorreccionCodigoCargo(
    indice: number
  ): Promise<
    OperacionesServiceResponse<RevisionPreciosDetalleCorreccionResponse>
  > {
    try {
      const response = await api.get(
        `/revision-precios/detalle-correccion/${indice}`
      );
      return {
        data: response.data as RevisionPreciosDetalleCorreccionResponse,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async postCorregirPrecioCargo(
    request: RevisionPreciosCorregirRequest
  ): Promise<OperacionesServiceResponse<any>> {
    try {
      const response = await api.post('/revision-precios/corregir', request);
      const errorFromBody = this.extractErrorFromResponse(response.data);
      if (errorFromBody) {
        return { data: null, error: errorFromBody };
      }
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

  /**
   * Cerrar Lecturas
   */
  async getObtenerCiclos(): Promise<
    OperacionesServiceResponse<CerrarLecturasFiltrosCiclosResponse>
  > {
    try {
      const response = await api.get('/cerrar-lecturas/filtros/ciclos');
      return {
        data: response.data as CerrarLecturasFiltrosCiclosResponse,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getObtenerPeriodosCerrarLecturas(): Promise<
    OperacionesServiceResponse<CerrarLecturasFiltrosPeriodosResponse[]>
  > {
    try {
      const response = await api.get('/cerrar-lecturas/filtros/periodos');
      return {
        data: response.data as CerrarLecturasFiltrosPeriodosResponse[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getObtenerGrilla(
    cicloId: number,
    periodoId: string
  ): Promise<
    OperacionesServiceResponse<CerrarLecturasBuscarEstadisticasRequest[]>
  > {
    try {
      const response = await api.get(
        `/cerrar-lecturas/buscar-estadisticas?cicloId=${cicloId}&periodoId=${periodoId}`
      );
      return {
        data: response.data as CerrarLecturasBuscarEstadisticasRequest[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async postCerrarLecturas(
    request: CerrarLecturasCerrarRequest
  ): Promise<OperacionesServiceResponse<CerrarLecturasCerrarResponse>> {
    try {
      const response = await api.post('/cerrar-lecturas/cerrar', request);
      return {
        data: response.data as CerrarLecturasCerrarResponse,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getObtenerGrillaData(): Promise<
    OperacionesServiceResponse<CerrarLecturasBuscarEstadisticasRequest[]>
  > {
    try {
      const response = await api.get('/cerrar-lecturas/buscar-estadisticas');
      return {
        data: response.data as CerrarLecturasBuscarEstadisticasRequest[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /** Corte y Reposición */

  async getCorteReposicionData(): Promise<
    OperacionesServiceResponse<{
      resumen: CorteReposicionResumenResponse;
      mantenedorCorteData: CorteReposicionBuscarRequest[];
    }>
  > {
    try {
      const [resResumen, ResData] = await Promise.all([
        api.get('/corte-reposicion/resumen'),
        api.get('/corte-reposicion/buscar')
      ]);

      return {
        data: {
          resumen:
            this.processApiResponse<CorteReposicionResumenResponse>(
              resResumen
            )[0],
          mantenedorCorteData:
            this.processApiResponse<CorteReposicionBuscarRequest>(ResData)
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

  async getBuscarCorteReposicion(acomedita?: string) {
    try {
      const params = new URLSearchParams();
      if (acomedita) {
        params.append('acometida', acomedita);
      }

      const response = await api.get('/corte-reposicion/buscar', {
        params
      });
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

  async postIniciarProcesoCorteReposicion() {
    try {
      const response = await api.post('/corte-reposicion/iniciar', {});
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

  async postFinalizarProcesoCorteReposicion() {
    try {
      const response = await api.post('/corte-reposicion/finalizar', {});
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

  async postActualizarProcesoCorteReposicion() {
    try {
      const response = await api.post(
        '/corte-reposicion/actualizar-estados',
        {}
      );
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

  async getConsultarDeuda(acometida: string) {
    try {
      const params = new URLSearchParams();
      params.append('acometida', acometida);
      const response = await api.get('/corte-reposicion/consultar-deuda', {
        params
      });
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

  async postLiberarAcometida(request: CorteReposicionLiberarRequest) {
    try {
      const response = await api.post('/corte-reposicion/liberar', request);
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

  async postRegistrarCorte(request: CorteReposicionRegistrarCorteRequest) {
    try {
      const response = await api.post(
        '/corte-reposicion/registrar-corte',
        request
      );
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

  async postSolicitarReposicion(contratoId: number, acometida: string) {
    try {
      const response = await api.post(
        '/corte-reposicion/solicitar-reposicion',
        { contratoId, acometida }
      );
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

  /**
   * Revisar Calculos
   */
  async getRevisarCalculosData() {
    try {
      const [filtrosCiclos, filtrosPeriodos] = await Promise.all([
        api.get('/revisar-calculos/filtros/ciclos'),
        api.get('/revisar-calculos/filtros/periodos')
      ]);
      return {
        data: {
          filtrosCiclos:
            filtrosCiclos.data as RevisarCalculosFiltrosCiclosResponse,
          filtrosPeriodos:
            filtrosPeriodos.data as RevisarCalculosFiltrosPeriodosResponse
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

  async getRevisarCalculosEstadoProceso(
    cicloId: number,
    periodoId: string
  ): Promise<OperacionesServiceResponse<RevisarCalculosEstadoProcesoRequest>> {
    try {
      const params = new URLSearchParams();
      params.append('cicloId', cicloId.toString());
      params.append('periodoId', periodoId);
      const response = await api.get('/revisar-calculos/estado-proceso', {
        params
      });
      return {
        data: response.data as RevisarCalculosEstadoProcesoRequest,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async postRevisarCalculosLanzarCalculo(
    request: RevisarCalculosLanzarCalculoRequest
  ): Promise<OperacionesServiceResponse<LanzarCalculoResponse>> {
    try {
      const response = await api.post(
        '/revisar-calculos/lanzar-calculo',
        request
      );
      return {
        data: response.data as LanzarCalculoResponse,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getRevisarCalculosBuscarPrefacturas(
    cicloId: number,
    periodoId: string,
    rut?: string,
    nombre?: string,
    sector?: string,
    local?: string,
    modo?: string,
    procesoId?: number
  ): Promise<
    OperacionesServiceResponse<RevisarCalculosBuscarPrefacturasResponse>
  > {
    try {
      const params = new URLSearchParams();
      params.append('cicloId', cicloId.toString());
      params.append('periodoId', periodoId);
      if (rut) params.append('rut', rut);
      if (nombre) params.append('nombre', nombre);
      if (sector) params.append('sector', sector);
      if (local) params.append('local', local);
      if (modo) params.append('modo', modo);
      if (procesoId) params.append('procesoId', procesoId.toString());
      const response = await api.get('/revisar-calculos/buscar-prefacturas', {
        params
      });
      return {
        data: response.data as RevisarCalculosBuscarPrefacturasResponse,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async postRevisarCalculosAceptar(periodoId: string, lecturaIds: number[]) {
    try {
      const params = new URLSearchParams();
      params.append('periodoId', periodoId);

      const response = await api.post('/revisar-calculos/aceptar', lecturaIds, {
        params
      });
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

  /**
   * cambio Medidor
   */
  async getBuscarMedidorAntiguo(acometida?: string, serie?: string) {
    try {
      const params = new URLSearchParams();
      if (acometida || serie) {
        if (acometida) params.append('acometida', acometida);
        if (serie) params.append('serie', serie);
      } else {
        throw new Error(
          'Se debe proporcionar al menos un parámetro: acometida o número de serie'
        );
      }
      const response = await api.get('/cambio-medidor/buscar-antiguo', {
        params
      });
      return {
        data: response.data as CambioMedidorBuscarAntiguoRequest,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getBuscarMedidorNuevo(serie: string) {
    try {
      const params = new URLSearchParams();
      params.append('serie', serie);
      const response = await api.get('/cambio-medidor/buscar-nuevo', {
        params
      });
      return {
        data: response.data as CambioMedidorBuscarNuevoRequest,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async postEjecutarCambioMedidor(request: CambioMedidorEjecutarCambioRequest) {
    try {
      const response = await api.post(
        '/cambio-medidor/ejecutar-cambio',
        request
      );
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

  /**
   * Archivos SAP
   */
  async getArchivoSAPEmpresas() {
    try {
      const response = await api.get('archivo-sap/empresas');
      const errorFromBody = this.extractErrorFromResponse(response.data);

      if (errorFromBody) {
        return {
          data: null,
          error: errorFromBody
        };
      }

      return {
        data: this.normalizeSapEmpresas(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getNombresSugeridos() {
    try {
      const response = await api.get('archivo-sap/nombres-sugeridos');
      const errorFromBody = this.extractErrorFromResponse(response.data);

      if (errorFromBody) {
        return {
          data: null,
          error: errorFromBody
        };
      }

      return {
        data: this.normalizeSapSugeridos(response),
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getDescargarEnacabezado(empresaId: string, nombreArchivo: string) {
    const params = new URLSearchParams();
    params.append('empresaId', empresaId);
    params.append('nombreArchivo', nombreArchivo);

    try {
      const response = await api.get('/archivo-sap/descargar-encabezado', {
        params,
        responseType: 'blob'
      });
      const filename = this.extractFilenameFromHeaders(response.headers);

      return {
        data: {
          blob: response.data as Blob,
          filename,
          contentType:
            typeof response.headers?.['content-type'] === 'string'
              ? response.headers['content-type']
              : null
        } as SAPDownloadFile,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getDescargarDetalle(empresaId: string, nombreArchivo: string) {
    const params = new URLSearchParams();
    params.append('empresaId', empresaId);
    params.append('nombreArchivo', nombreArchivo);

    try {
      const response = await api.get('/archivo-sap/descargar-detalle', {
        params,
        responseType: 'blob'
      });
      const filename = this.extractFilenameFromHeaders(response.headers);

      return {
        data: {
          blob: response.data as Blob,
          filename,
          contentType:
            typeof response.headers?.['content-type'] === 'string'
              ? response.headers['content-type']
              : null
        } as SAPDownloadFile,
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

export const operacionesService = new OperacionesService();
