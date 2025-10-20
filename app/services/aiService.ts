/**
 * Servicio de IA - Cliente para el microservicio de IA
 * Conecta con el servicio Python FastAPI independiente
 */

// ============================================================
// Tipos
// ============================================================

export interface ProyeccionIARequest {
  contratoId: number;
  periodoMeses: 6 | 12 | 24;
}

export interface ProyeccionMensual {
  fecha: string;
  mes: string;
  mesNumero: number;
  año: number;
  consumoProyectado: number;
  intervaloInferior: number;
  intervaloSuperior: number;
  facturacionProyectada?: number;
  facturacionInferior?: number;
  facturacionSuperior?: number;
  precioPorKwh?: number;
  confianza: 'Alta' | 'Media' | 'Baja';
}

export interface ProyeccionMetadata {
  modeloUsado: string;
  muestrasEntrenamiento: number;
  confianzaGeneral: 'Alta' | 'Media' | 'Baja';
  fechaEntrenamiento: string;
  periodoHistorico: string;
  totalConsumoProyectado: number;
  totalFacturacionProyectada: number;
  promedioMensualConsumo: number;
  promedioMensualFacturacion: number;
}

export interface ProyeccionIAResponse {
  proyecciones: ProyeccionMensual[];
  metadata: ProyeccionMetadata;
}

// ------------------------------------------------------------
// Nuevos tipos: Estado Modelo / Cache / Scheduler / Diagnóstico
// ------------------------------------------------------------

export interface EstadoModeloResponse {
  contratoId: number;
  modeloEntrenado: boolean;
  calidad: string;
  fechaEntrenamiento?: string | null;
  muestrasEntrenamiento: number;
  necesitaReentrenamiento: boolean;
  configuracion: Record<string, any>;
}

export interface ReentrenarModeloResponse {
  contratoId: number;
  exito: boolean;
  muestrasEntrenamiento: number;
  calidad: string;
  fechaEntrenamiento: string;
  rangoFechas: string;
}

export interface CacheInfoResponse {
  contratoId: number;
  entradas: number;
  llaves: string[];
  ttlSegundosPromedio?: number;
  ultimoAcceso?: string;
  habilitado?: boolean;
  mensaje?: string;
  estadisticas?: Record<string, any>;
}

export interface CacheInvalidateResponse {
  success: boolean;
  contrato_id: number;
  entradas_eliminadas: number;
  message: string;
}

export interface CacheHealthResponse {
  redis_conectado: boolean;
  modo: string;
  uptime_segundos?: number;
  keys?: number;
  memoria_mb?: number;
  mensaje?: string;
  timestamp?: string;
}

export interface PreentrenamientoGlobalResponse {
  totalContratos: number;
  procesados: number;
  cacheados: number;
  errores: number;
  duracionSegundos: number;
  detalles?: any[];
}

export interface PreentrenamientoContratoResponse {
  contratoId: number;
  meses: number[];
  resultados: Array<{
    meses: number;
    exito: boolean;
    muestrasEntrenamiento?: number;
    calidad?: string;
    error?: string;
  }>;
  totalCacheado: number;
}

export interface SchedulerStatusResponse {
  activo: boolean;
  proximaEjecucion?: string | null;
  jobs: Array<{
    id: string;
    descripcion: string;
    ultimaEjecucion?: string;
    proximaEjecucion?: string;
    estado: string;
  }>;
  metadata?: Record<string, any>;
}

export interface DiagnosticoDbStatusResponse {
  db_mode: string;
  engine_ready: boolean;
  attempts: number;
  last_error?: string | null;
  test_connection: Record<string, any>;
  timestamp: string;
}

export interface DiagnosticoContratoCoverageItem {
  contratoId: number;
  registros: number;
  calidad: string;
  fechaInicio: string;
  fechaFin: string;
  mesesSpan: number;
  coberturaPct: number;
  consumoMin: number;
  consumoMax: number;
  consumoPromedio: number;
  rangoConsumo: string;
  aptoProphet: boolean;
}

export interface DiagnosticoContratosCoverageResponse {
  resumen: {
    totalAnalizados: number;
    aptosParaProphet: number;
    conDatosSuficientes: number;
    conPocosDatos: number;
  };
  mejoresCandidatos: DiagnosticoContratoCoverageItem[];
  todosCandidatos: DiagnosticoContratoCoverageItem[];
  recomendacion: {
    mejorContrato?: number | null;
    razon: string;
  };
}

export interface DiagnosticoContratoDetalleResponse {
  contratoId: number;
  resumenGeneral: {
    totalRegistros: number;
    calidad: string;
    fechaInicio: string;
    fechaFin: string;
    aptoProphet: boolean;
  };
  estadisticosPorAño: Record<string, {
    registros: number;
    promedio: number;
    minimo: number;
    maximo: number;
  }>;
  analisisRegimen: {
    promedioTotal: number;
    promedioUltimos6: number;
    promedioUltimos12: number;
    cambioRegimenDetectado: boolean;
    ratioRecienteVsTotal: number;
  };
  recomendacion: {
    usarProphet: boolean;
    ventanaRecomendada: string;
    expectativaProyeccion: string;
  };
  datosCompletos: Array<{
    fecha: string;
    consumo: number;
  }>;
}

export interface EstadoDetectorAnomaliasResponse {
  medidorId: number;
  detectorEntrenado: boolean;
  fechaEntrenamiento?: string | null;
  muestrasEntrenamiento: number;
  necesitaReentrenamiento: boolean;
  estadisticas: Record<string, any>;
  configuracion: Record<string, any>;
}

export interface AnomaliaBatchItemInput {
  medidorId: number;
  consumoActual: number;
}

export interface AnomaliaBatchItemOutput extends AnomaliaResponse {
  medidorId: number;
  error?: string;
}

export interface AnomaliaBatchResponse {
  total: number;
  resultados: AnomaliaBatchItemOutput[];
}

export interface EstadoPredictorLecturasResponse {
  medidorId: number;
  predictorEntrenado: boolean;
  fechaEntrenamiento?: string | null;
  estadisticasMedidor: Record<string, any>;
  estadisticasNicho: Record<string, any>;
  necesitaReentrenamiento: boolean;
}

export interface LecturaBatchItemInput {
  medidorId: number;
  nichoId: number;
  periodo: string; // YYYYMM
}

export interface LecturaBatchItemOutput extends LecturaFaltanteResponse {
  medidorId: number;
  periodo: string;
  error?: string;
}

export interface LecturasBatchResponse {
  total: number;
  resultados: LecturaBatchItemOutput[];
}

export interface EstadisticasNichoResponse {
  nichoId: number;
  totalMedidores: number;
  promedioConsumo: number;
  medianaConsumo: number;
  desviacionEstandar: number;
  consumoMinimo: number;
  consumoMaximo: number;
  ultimaActualizacion?: string | null;
  mensaje?: string;
}

export interface ErrorIAService {
  detail: string;
  error_code?: string;
  timestamp?: string;
  statusCode?: number;
}

export interface AnomaliaRequest {
  medidorId: number;
  consumoActual: number;
}

export interface EstadisticasConsumo {
  promedio: number;
  mediana: number;
  desviacionEstandar: number;
  percentil95: number;
  percentil5: number;
}

export interface AnomaliaResponse {
  esAnomalia: boolean;
  tipoAnomalia?: string;
  scoreConfianza: number;
  scoreNormalizado: number;
  consumoActual: number;
  estadisticas: EstadisticasConsumo;
  claveRecomendada: 'Roja' | 'Naranja' | 'Verde';
  recomendacion: string;
  confianza: 'Alta' | 'Media' | 'Baja' | 'Muy Baja';
  muestrasAnalizadas: number;
}

export interface LecturaFaltanteRequest {
  medidorId: number;
  nichoId: number;
  periodo: string; // formato: YYYYMM
}

export interface LecturaFaltanteResponse {
  valorPredicho: number;
  confianza: 'Alta' | 'Media' | 'Baja' | 'Muy Baja';
  metodoUsado: string;
  basadoEn: {
    historicoMedidor: number;
    promedioMedidor?: number;
    promedioNicho?: number;
    pesoHistorico: number;
  };
  metadata: {
    medidorId: number;
    nichoId: number;
    periodo: string;
  };
}

export interface HealthResponse {
  status: string;
  database: string;
  database_path: string;
  stats: {
    lecturas: number;
    facturas: number;
    contratos: number;
    modelos_entrenados: number;
    anomalias_pendientes: number;
    ultima_sincronizacion?: string;
    fecha_minima?: string;
    fecha_maxima?: string;
  };
  ultima_sincronizacion?: string;
  timestamp: string;
}

// ============================================================
// Servicio de IA
// ============================================================

class AIService {
  private baseURL: string;

  private defaultTimeout = 12000; // ms

  constructor() {
    // Obtener URL del servicio de IA desde variables de entorno
    // En desarrollo: http://localhost:8001
    // En producción: configurar en .env como VITE_AI_API_URL
    this.baseURL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8001';
  }

  /**
   * Obtiene headers con autenticación estándar para el servicio de IA.
   * @returns HeadersInit con Content-Type, Accept y Authorization si existe token.
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Realiza petición fetch y parsea JSON tipado con soporte de timeout.
   * @template T Tipo esperado de respuesta.
   * @param url - Endpoint completo.
   * @param options - Opciones fetch (method, body, headers adicionales).
   * @param timeoutMs - Tiempo máximo en milisegundos (default 12s).
   * @returns Promesa con el JSON tipado.
   * @throws ErrorIAService si status !ok o timeout.
   */
  private async fetchJSON<T>(
    url: string,
    options: RequestInit = {},
    timeoutMs: number = this.defaultTimeout
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...(options.headers || {})
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let err: ErrorIAService | undefined;
        try {
          err = await response.json();
        } catch (_) {
          // ignore
        }
        const error: ErrorIAService = {
          detail: err?.detail || `Error ${response.status}`,
          error_code: err?.error_code,
          timestamp: err?.timestamp,
          statusCode: response.status
        };
        throw error;
      }
      return (await response.json()) as T;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        throw { detail: 'Timeout excedido', statusCode: 408 } as ErrorIAService;
      }
      throw e;
    }
  }

  /**
   * Verificar estado del servicio de IA
   */
  async checkHealth(): Promise<HealthResponse | null> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        console.warn('Servicio de IA no disponible');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error verificando servicio de IA:', error);
      return null;
    }
  }

  /**
   * Obtener proyecciones avanzadas usando Prophet (Facebook)
   * @param request - Parámetros de proyección
   * @returns Proyecciones con intervalos de confianza o null si falla
   */
  async obtenerProyeccionesIA(
    request: ProyeccionIARequest
  ): Promise<ProyeccionIAResponse | null> {
    try {
      // Usar endpoint de prueba temporalmente para evitar problemas de autenticación
      return await this.fetchJSON<ProyeccionIAResponse>(
        `${this.baseURL}/api/ai/proyecciones-test/${request.contratoId}?meses=${request.periodoMeses}`,
        { method: 'POST' }
      );
    } catch (error) {
      console.error('Error obteniendo proyecciones IA:', error);
      return null;
    }
  }

  /** Obtener estado del modelo Prophet para un contrato */
  /** Obtiene estado del modelo Prophet para un contrato.
   * @param contratoId - ID del contrato.
   * @returns EstadoModeloResponse o null si falla.
   */
  async estadoModelo(contratoId: number): Promise<EstadoModeloResponse | null> {
    try {
      return await this.fetchJSON<EstadoModeloResponse>(
        `${this.baseURL}/api/ai/proyecciones/estado/${contratoId}`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error obteniendo estado modelo:', e);
      return null;
    }
  }

  /** Forzar reentrenamiento del modelo */
  /** Fuerza reentrenamiento del modelo para un contrato.
   * @param contratoId - ID del contrato.
   * @returns ReentrenarModeloResponse o null.
   */
  async reentrenarModelo(contratoId: number): Promise<ReentrenarModeloResponse | null> {
    try {
      return await this.fetchJSON<ReentrenarModeloResponse>(
        `${this.baseURL}/api/ai/proyecciones/reentrenar/${contratoId}`,
        { method: 'POST' }
      );
    } catch (e) {
      console.error('Error reentrenando modelo:', e);
      return null;
    }
  }

  /** Información de cache de proyecciones */
  /** Obtiene información de cache para un contrato.
   * @param contratoId - ID del contrato.
   * @returns CacheInfoResponse o null.
   */
  async infoCache(contratoId: number): Promise<CacheInfoResponse | null> {
    try {
      return await this.fetchJSON<CacheInfoResponse>(
        `${this.baseURL}/api/ai/cache/info/${contratoId}`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error obteniendo info cache:', e);
      return null;
    }
  }

  /** Invalidar cache para un contrato */
  /** Invalida cache de proyecciones para un contrato.
   * @param contratoId - ID del contrato.
   * @returns CacheInvalidateResponse o null.
   */
  async invalidarCache(contratoId: number): Promise<CacheInvalidateResponse | null> {
    try {
      return await this.fetchJSON<CacheInvalidateResponse>(
        `${this.baseURL}/api/ai/cache/invalidar/${contratoId}`,
        { method: 'DELETE' }
      );
    } catch (e) {
      console.error('Error invalidando cache:', e);
      return null;
    }
  }

  /** Salud del cache (Redis) */
  /** Obtiene salud del servicio de cache (Redis).
   * @returns CacheHealthResponse o null.
   */
  async saludCache(): Promise<CacheHealthResponse | null> {
    try {
      return await this.fetchJSON<CacheHealthResponse>(
        `${this.baseURL}/api/ai/cache/health`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error verificando salud cache:', e);
      return null;
    }
  }

  /** Ejecutar preentrenamiento global */
  /** Ejecuta preentrenamiento global manual.
   * @returns PreentrenamientoGlobalResponse o null.
   */
  async ejecutarPreentrenamientoGlobal(): Promise<PreentrenamientoGlobalResponse | null> {
    try {
      return await this.fetchJSON<PreentrenamientoGlobalResponse>(
        `${this.baseURL}/api/ai/preentrenamiento/ejecutar`,
        { method: 'POST' }
      );
    } catch (e) {
      console.error('Error ejecutando preentrenamiento global:', e);
      return null;
    }
  }

  /** Preentrenar contrato específico */
  /** Pre-entrena un contrato específico para varios horizontes.
   * @param contratoId - ID del contrato.
   * @param meses - Arreglo de horizontes en meses.
   * @returns PreentrenamientoContratoResponse o null.
   */
  async preentrenarContrato(
    contratoId: number,
    meses: number[] = [6, 12, 24]
  ): Promise<PreentrenamientoContratoResponse | null> {
    try {
      return await this.fetchJSON<PreentrenamientoContratoResponse>(
        `${this.baseURL}/api/ai/preentrenamiento/contrato/${contratoId}`,
        {
          method: 'POST',
          body: JSON.stringify(meses)
        }
      );
    } catch (e) {
      console.error('Error preentrenando contrato:', e);
      return null;
    }
  }

  /** Estado del scheduler */
  /** Obtiene estado del scheduler de tareas.
   * @returns SchedulerStatusResponse o null.
   */
  async estadoScheduler(): Promise<SchedulerStatusResponse | null> {
    try {
      return await this.fetchJSON<SchedulerStatusResponse>(
        `${this.baseURL}/api/ai/scheduler/status`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error obteniendo estado scheduler:', e);
      return null;
    }
  }

  /** Ejecuta job de preentrenamiento inmediato.
   * @returns true si se ejecutó correctamente, false si falló.
   */
  async ejecutarJobPreentrenamiento(): Promise<boolean> {
    try {
      await this.fetchJSON<CacheInvalidateResponse>(
        `${this.baseURL}/api/ai/scheduler/ejecutar-preentrenamiento`,
        { method: 'POST' }
      );
      return true;
    } catch (e) {
      console.error('Error ejecutando job preentrenamiento:', e);
      return false;
    }
  }

  /** Obtiene diagnóstico de estado de la base de datos.
   * @returns DiagnosticoDbStatusResponse o null.
   */
  async diagnosticoDbStatus(): Promise<DiagnosticoDbStatusResponse | null> {
    try {
      return await this.fetchJSON<DiagnosticoDbStatusResponse>(
        `${this.baseURL}/api/ai/diagnostico/db-status`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error obteniendo db-status diagnóstico:', e);
      return null;
    }
  }

  /** Obtiene coverage de contratos para análisis diagnóstico.
   * @returns DiagnosticoContratosCoverageResponse o null.
   */
  async diagnosticoContratosCoverage(): Promise<DiagnosticoContratosCoverageResponse | null> {
    try {
      return await this.fetchJSON<DiagnosticoContratosCoverageResponse>(
        `${this.baseURL}/api/ai/diagnostico/contratos-coverage`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error obteniendo coverage contratos:', e);
      return null;
    }
  }

  /** Obtiene detalle diagnóstico de un contrato.
   * @param contratoId - ID del contrato.
   * @returns DiagnosticoContratoDetalleResponse o null.
   */
  async diagnosticoContratoDetalle(
    contratoId: number
  ): Promise<DiagnosticoContratoDetalleResponse | null> {
    try {
      return await this.fetchJSON<DiagnosticoContratoDetalleResponse>(
        `${this.baseURL}/api/ai/diagnostico/contrato/${contratoId}/detalle`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error obteniendo detalle diagnóstico contrato:', e);
      return null;
    }
  }

  /**
   * Detectar anomalías en lectura de medidor
   * @param request - Parámetros de detección
   * @returns Resultado de detección o null si falla
   */
  async detectarAnomaliaLectura(
    request: AnomaliaRequest
  ): Promise<AnomaliaResponse | null> {
    try {
      return await this.fetchJSON<AnomaliaResponse>(
        `${this.baseURL}/api/ai/detectar-anomalias`,
        { method: 'POST', body: JSON.stringify(request) }
      );
    } catch (error) {
      console.error('Error en detección de anomalías:', error);
      return null;
    }
  }

  /** Obtiene estado del detector de anomalías para un medidor.
   * @param medidorId - ID del medidor.
   * @returns EstadoDetectorAnomaliasResponse o null.
   */
  async estadoDetectorAnomalias(medidorId: number): Promise<EstadoDetectorAnomaliasResponse | null> {
    try {
      return await this.fetchJSON<EstadoDetectorAnomaliasResponse>(
        `${this.baseURL}/api/ai/anomalias/estado/${medidorId}`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error estado detector anomalías:', e);
      return null;
    }
  }

  /** Ejecuta análisis batch de anomalías.
   * @param items - Lista de medidores y consumos actuales.
   * @returns AnomaliaBatchResponse o null.
   */
  async analizarAnomaliasBatch(
    items: AnomaliaBatchItemInput[]
  ): Promise<AnomaliaBatchResponse | null> {
    try {
      return await this.fetchJSON<AnomaliaBatchResponse>(
        `${this.baseURL}/api/ai/anomalias/analisis-batch`,
        { method: 'POST', body: JSON.stringify(items) }
      );
    } catch (e) {
      console.error('Error análisis batch anomalías:', e);
      return null;
    }
  }

  /**
   * Predecir valor de lectura faltante
   * @param request - Parámetros de predicción
   * @returns Valor predicho o null si falla
   */
  async predecirLecturaFaltante(
    request: LecturaFaltanteRequest
  ): Promise<LecturaFaltanteResponse | null> {
    try {
      return await this.fetchJSON<LecturaFaltanteResponse>(
        `${this.baseURL}/api/ai/predecir-lectura`,
        { method: 'POST', body: JSON.stringify(request) }
      );
    } catch (error) {
      console.error('Error en predicción de lectura:', error);
      return null;
    }
  }

  /** Obtiene estado del predictor de lecturas para un medidor.
   * @param medidorId - ID del medidor.
   * @returns EstadoPredictorLecturasResponse o null.
   */
  async estadoPredictorLecturas(medidorId: number): Promise<EstadoPredictorLecturasResponse | null> {
    try {
      return await this.fetchJSON<EstadoPredictorLecturasResponse>(
        `${this.baseURL}/api/ai/lecturas/estado/${medidorId}`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error estado predictor lecturas:', e);
      return null;
    }
  }

  /** Ejecuta batch de predicción de lecturas faltantes.
   * @param requests - Lista de solicitudes con medidor, nicho y período.
   * @returns LecturasBatchResponse o null.
   */
  async predecirLecturasBatch(
    requests: LecturaBatchItemInput[]
  ): Promise<LecturasBatchResponse | null> {
    try {
      return await this.fetchJSON<LecturasBatchResponse>(
        `${this.baseURL}/api/ai/lecturas/batch-prediccion`,
        { method: 'POST', body: JSON.stringify(requests) }
      );
    } catch (e) {
      console.error('Error batch predicción lecturas:', e);
      return null;
    }
  }

  /** Obtiene estadísticas agregadas de un nicho.
   * @param nichoId - ID del nicho.
   * @returns EstadisticasNichoResponse o null.
   */
  async estadisticasNicho(nichoId: number): Promise<EstadisticasNichoResponse | null> {
    try {
      return await this.fetchJSON<EstadisticasNichoResponse>(
        `${this.baseURL}/api/ai/lecturas/estadisticas-nicho/${nichoId}`,
        { method: 'GET' }
      );
    } catch (e) {
      console.error('Error obteniendo estadísticas nicho:', e);
      return null;
    }
  }

  /**
   * Obtener anomalías pendientes de revisión
   * @param limit - Número máximo de registros
   * @returns Lista de anomalías o null si falla
   */
  async obtenerAnomaliasPendientes(limit: number = 50): Promise<any[] | null> {
    try {
      const response = await fetch(
        `${this.baseURL}/api/ai/anomalias-pendientes?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return data.anomalias || [];
    } catch (error) {
      console.error('Error obteniendo anomalías pendientes:', error);
      return null;
    }
  }

  /**
   * Marcar anomalía como revisada
   * @param anomalyId - ID de la anomalía
   * @param observaciones - Observaciones de la revisión
   * @returns Success boolean
   */
  async marcarAnomaliaRevisada(
    anomalyId: number,
    observaciones?: string
  ): Promise<boolean> {
    try {
      const url = new URL(
        `${this.baseURL}/api/ai/revisar-anomalia/${anomalyId}`
      );
      if (observaciones) {
        url.searchParams.append('observaciones', observaciones);
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Error marcando anomalía como revisada:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas del servicio de IA
   * @returns Estadísticas generales o null si falla
   */
  async obtenerEstadisticasIA(): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseURL}/api/ai/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas IA:', error);
      return null;
    }
  }

  /**
   * Verificar si el servicio de IA está disponible
   * @returns true si está online, false si no
   */
  async isAvailable(): Promise<boolean> {
    const health = await this.checkHealth();
    return health !== null && health.status === 'healthy';
  }
}

// Exportar instancia única
export const aiService = new AIService();
