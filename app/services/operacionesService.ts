import api from '~/lib/api';
import type {
  CambioMedidorBuscarAntiguoRequest,
  CambioMedidorBuscarNuevoRequest,
  CambioMedidorEjecutarCambioRequest,
  CorteReposicionLiberarRequest,
  CorteReposicionRegistrarCorteRequest,
  CorteReposicionResumenResponse,
  PeriodosCrearRequest,
  PreciosConsultarRequest,
  PreciosGuardarMasivoRequest,
  PrepararLecturasBuscarNichosRequest,
  PrepararLecturasFiltrosCiclosResponse,
  PrepararLecturasFiltrosPeriodosResponse,
  PrepararLecturasGenerarRequest,
  RevisarCalculosLanzarCalculoRequest,
  RevisionPreciosConfirmarRequest,
  RevisionPreciosCorregirRequest
} from '~/types/operaciones';

export interface OperacionesServiceResponse<T> {
  data: T | null;
  error: string | null;
}

class OperacionesService {
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
        data: response.data as PrepararLecturasFiltrosPeriodosResponse[],
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
  ) {
    try {
      const params = new URLSearchParams();
      if (mes) params.append('mes', mes);
      if (anio) params.append('año', anio);
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      const response = await api.get('/periodos/buscar', {
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

  async getCiclosFacturacion(): Promise<
    OperacionesServiceResponse<PrepararLecturasFiltrosCiclosResponse[]>
  > {
    try {
      const response = await api.get('/preparar-lecturas/filtros/ciclos');
      return {
        data: response.data as PrepararLecturasFiltrosCiclosResponse[],
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
            periodoAbierto.data as PrepararLecturasFiltrosPeriodosResponse[],
          ciclos: ciclos.data as PrepararLecturasFiltrosCiclosResponse[]
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
        data: response.data as PrepararLecturasBuscarNichosRequest[],
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
      params.append('año', anio);

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

  async gerRevisarPreciosData(mes: string, anio: string) {
    try {
      const params = new URLSearchParams();
      params.append('mes', mes);
      params.append('año', anio);

      const response = await api.get('/revision-precios/consultar', {
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

  async postConfirmarRevisionPrecios(
    request: RevisionPreciosConfirmarRequest
  ): Promise<OperacionesServiceResponse<any>> {
    try {
      const response = await api.post('/revision-precios/confirmar', request);
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
    codigo: number
  ): Promise<OperacionesServiceResponse<any>> {
    try {
      const params = new URLSearchParams();
      params.append('codigoCargo', codigo.toString());
      const response = await api.get('/revision-precios/correccion', {
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

  async postCorregirPrecioCargo(request: RevisionPreciosCorregirRequest) {
    try {
      const response = await api.post('/revision-precios/corregir', request);
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

  /** Corte y Reposición */

  async getCorteReposicionData(): Promise<
    OperacionesServiceResponse<CorteReposicionResumenResponse>
  > {
    try {
      const [res] = await Promise.all([api.get('corte-reposicion/resumen')]);

      return {
        data: res.data as CorteReposicionResumenResponse,
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
  async getRevisarCalculosFiltrosCiclos() {
    try {
      const response = await api.get('/revisar-calculos/filtros/ciclos');
      return {
        data: response.data as PrepararLecturasFiltrosCiclosResponse[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getRevisarCalculosFiltrosPeriodos() {
    try {
      const response = await api.get('/revisar-calculos/filtros/periodos');
      return {
        data: response.data as PrepararLecturasFiltrosPeriodosResponse[],
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async getRevisarCalculosEstadoProceso(cicloId: number, periodoId: string) {
    try {
      const params = new URLSearchParams();
      params.append('cicloId', cicloId.toString());
      params.append('periodoId', periodoId);
      const response = await api.get('/revisar-calculos/estado-proceso', {
        params
      });
      return {
        data: response.data as [],
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
  ) {
    try {
      const response = await api.post(
        '/revisar-calculos/lanzar-calculo',
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

  async getRevisarCalculosBuscarPrefacturas(
    cicloId: number,
    periodoId: string,
    rut?: string,
    nombre?: string,
    sector?: string,
    local?: string,
    modo?: string,
    procesoId?: number
  ) {
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

  async postRevisarCalculosAceptar(periodoId: string) {
    try {
      const response = await api.post('/revisar-calculos/aceptar-calculos', {
        periodoId
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
  async getBuscarMedidorAntiguo(acometida?: string, numeroSerie?: string) {
    try {
      const params = new URLSearchParams();
      if (acometida || numeroSerie) {
        if (acometida) params.append('acometida', acometida);
        if (numeroSerie) params.append('numeroSerie', numeroSerie);
      } else {
        throw new Error(
          'Se debe proporcionar al menos un parámetro: acometida o número de serie'
        );
      }
      const response = await api.get('/cambio-medidor/buscar-medidor-antiguo', {
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
      params.append('numeroSerie', serie);
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
}

export const operacionesService = new OperacionesService();
