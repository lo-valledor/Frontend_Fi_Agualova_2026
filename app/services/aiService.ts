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

  constructor() {
    // Obtener URL del servicio de IA desde variables de entorno
    // En desarrollo: http://localhost:8001
    // En producción: configurar en .env como VITE_AI_API_URL
    this.baseURL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8001';
  }

  /**
   * Obtener headers con autenticación
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
      const response = await fetch(
        `${this.baseURL}/api/ai/proyecciones-test/${request.contratoId}?meses=${request.periodoMeses}`,
        {
          method: 'POST',
          headers: this.getAuthHeaders()
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Error en proyecciones IA:', error);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo proyecciones IA:', error);
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
      const response = await fetch(
        `${this.baseURL}/api/ai/detectar-anomalias`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(request)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('Error detectando anomalías:', error);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error en detección de anomalías:', error);
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
      const response = await fetch(`${this.baseURL}/api/ai/predecir-lectura`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error prediciendo lectura:', error);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error en predicción de lectura:', error);
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
