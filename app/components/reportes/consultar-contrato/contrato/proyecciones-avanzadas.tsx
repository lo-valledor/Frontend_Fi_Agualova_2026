import {
  AlertTriangle,
  Brain,
  Download,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';

import React, { memo, useState } from 'react';
import * as XLSX from 'xlsx';

import { Area, AreaChart, Bar, BarChart, Cell, XAxis, YAxis } from 'recharts';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import { Alert, AlertDescription } from '~/components/ui/alert';
import type { DetalleFacturas, DetalleLecturas } from '~/types/reportes';

// Tipos para la respuesta del servicio de IA
interface ProyeccionIA {
  fecha: string;
  mes: string;
  consumoProyectado: number;
  intervaloInferior: number;
  intervaloSuperior: number;
  confianza: 'Alta' | 'Media' | 'Baja';
}

interface MetadataIA {
  modeloUsado: string;
  muestrasEntrenamiento: number;
  confianzaGeneral: string;
  fechaEntrenamiento: string;
  periodoHistorico: string | { from: string; to: string };
  totalConsumoProyectado: number;
  promedioMensualConsumo: number;
  from_cache?: boolean;
  tiempoTotal?: number;
}

interface RespuestaIA {
  contratoId: number;
  proyecciones: ProyeccionIA[];
  metadata: MetadataIA;
}

interface ProyeccionesAvanzadasProps {
  detalleLecturas: DetalleLecturas[];
  detalleFacturas: DetalleFacturas[];
  contratoId?: number;
}

const ProyeccionesAvanzadas = memo(function ProyeccionesAvanzadas({
  detalleLecturas,
  detalleFacturas,
  contratoId
}: ProyeccionesAvanzadasProps) {
  // Formatea periodoHistorico si viene como rango
  const formatPeriodoHistorico = (ph: MetadataIA['periodoHistorico']) => {
    if (!ph) return 'N/D';
    if (typeof ph === 'string') return ph;
    if (typeof ph === 'object' && 'from' in ph && 'to' in ph) {
      return `${ph.from} a ${ph.to}`;
    }
    try {
      return JSON.stringify(ph);
    } catch {
      return 'N/D';
    }
  };
  // Función para obtener color basado en el nivel de confianza
  const getConfianzaColor = (confianza: string) => {
    switch (confianza) {
      case 'Alta':
        return '#10b981';
      case 'Media':
        return '#f59e0b';
      case 'Baja':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const [periodoProyeccion, setPeriodoProyeccion] = useState<6 | 12 | 24>(6);
  const [proyeccionesData, setProyeccionesData] = useState<RespuestaIA | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modeloEntrenado, setModeloEntrenado] = useState(false);
  const [serviceHealth, setServiceHealth] = useState<{
    status: string;
    database?: string;
  } | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{
    fromCache: boolean;
    responseTime: number;
  }>({ fromCache: false, responseTime: 0 });
  const [canClearCache, setCanClearCache] = useState(false);

  // Servicio de IA URL - desde variables de entorno
  const AI_SERVICE_URL =
    import.meta.env.VITE_AI_API_URL || 'http://localhost:8001';

  const generarProyecciones = async () => {
    if (!contratoId) {
      setError('ID de contrato no disponible');
      return;
    }

    setIsLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      // Usar el endpoint de prueba sin autenticación
      const response = await fetch(
        `${AI_SERVICE_URL}/api/ai/proyecciones-test/${contratoId}?meses=${periodoProyeccion}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Error del servidor: ${response.status}`
        );
      }

      const data: RespuestaIA = await response.json();
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      setProyeccionesData(data);
      setModeloEntrenado(true);
      setCacheInfo({
        fromCache: data.metadata?.from_cache || false,
        responseTime
      });
      setCanClearCache(data.metadata?.from_cache || false);
    } catch (err) {
      console.error('Error al generar proyecciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setProyeccionesData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const reentrenarModelo = async () => {
    if (!contratoId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${AI_SERVICE_URL}/api/ai/proyecciones/reentrenar/${contratoId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error en reentrenamiento');
      }

      // Después de reentrenar, generar nuevas proyecciones
      await generarProyecciones();
    } catch (err) {
      console.error('Error al reentrenar:', err);
      setError(err instanceof Error ? err.message : 'Error en reentrenamiento');
    }
  };

  const verificarEstadoModelo = async () => {
    if (!contratoId) return;

    try {
      const response = await fetch(
        `${AI_SERVICE_URL}/api/ai/proyecciones/estado/${contratoId}`
      );
      if (response.ok) {
        const data = await response.json();
        setModeloEntrenado(data.entrenado || false);
      }
    } catch (err) {
      console.warn('No se pudo verificar el estado del modelo:', err);
    }
  };

  const verificarHealthServicio = async () => {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        setServiceHealth(data);
      }
    } catch (err) {
      console.warn('No se pudo verificar el health del servicio:', err);
      setServiceHealth(null);
    }
  };

  const limpiarCache = async () => {
    if (!contratoId) return;

    try {
      const response = await fetch(
        `${AI_SERVICE_URL}/api/ai/cache/invalidar/${contratoId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setCanClearCache(false);
        setCacheInfo({ fromCache: false, responseTime: 0 });
        // Regenerar proyecciones desde fuente
        await generarProyecciones();
      }
    } catch (err) {
      console.error('Error limpiando cache:', err);
    }
  };

  // Verificar estado al montar el componente
  React.useEffect(() => {
    if (contratoId) {
      verificarEstadoModelo();
      verificarHealthServicio();
    }
  }, [contratoId]);

  // Regenerar cuando cambie el período
  React.useEffect(() => {
    if (proyeccionesData && contratoId) {
      generarProyecciones();
    }
  }, [periodoProyeccion]);

  const exportarAExcel = () => {
    if (!proyeccionesData) return;

    const { proyecciones, metadata } = proyeccionesData;

    const datosExportacion = proyecciones.map((proyeccion, index) => ({
      'N°': index + 1,
      Período: proyeccion.mes,
      Fecha: proyeccion.fecha,
      'Consumo Proyectado (kWh)':
        proyeccion.consumoProyectado.toLocaleString('es-CL'),
      'Intervalo Inferior (kWh)':
        proyeccion.intervaloInferior.toLocaleString('es-CL'),
      'Intervalo Superior (kWh)':
        proyeccion.intervaloSuperior.toLocaleString('es-CL'),
      'Nivel de Confianza': proyeccion.confianza
    }));

    const datosResumen = [
      {},
      {
        'N°': 'RESUMEN EJECUTIVO',
        Período: '',
        Fecha: '',
        'Consumo Proyectado (kWh)': ''
      },
      {},
      { 'N°': 'Modelo Usado:', Período: metadata.modeloUsado },
      {
        'N°': 'Muestras de Entrenamiento:',
        Período: metadata.muestrasEntrenamiento.toString()
      },
      { 'N°': 'Confianza General:', Período: metadata.confianzaGeneral },
      {
        'N°': 'Total Consumo Proyectado:',
        Período: `${metadata.totalConsumoProyectado.toLocaleString('es-CL')} kWh`
      },
      {
        'N°': 'Promedio Mensual:',
        Período: `${metadata.promedioMensualConsumo.toLocaleString('es-CL')} kWh`
      },
      {
        'N°': 'Período Histórico:',
        Período: formatPeriodoHistorico(metadata.periodoHistorico)
      },
      { 'N°': 'Fecha Entrenamiento:', Período: metadata.fechaEntrenamiento },
      {},
      {
        'N°': 'MODELO DE IA',
        Período: '',
        Fecha: '',
        'Consumo Proyectado (kWh)': ''
      },
      {},
      {
        'N°': '• Algoritmo:',
        Período: 'Prophet (Facebook) - Optimizado para series temporales'
      },
      {
        'N°': '• Características:',
        Período: 'Detección automática de estacionalidad y tendencias'
      },
      {
        'N°': '• Intervalos de confianza:',
        Período: 'Calculados automáticamente por el modelo'
      },
      {
        'N°': '• Ventajas:',
        Período: 'Robusto ante datos faltantes y outliers'
      }
    ];

    const todosLosDatos = [...datosExportacion, ...datosResumen];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(todosLosDatos);

    const columnWidths = [
      { wch: 5 }, // N°
      { wch: 15 }, // Período
      { wch: 12 }, // Fecha
      { wch: 20 }, // Consumo Proyectado
      { wch: 22 }, // Intervalo Inferior
      { wch: 22 }, // Intervalo Superior
      { wch: 18 } // Nivel de Confianza
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Proyecciones IA');

    const fechaActual = new Date()
      .toLocaleDateString('es-CL')
      .replace(/\//g, '-');
    const nombreArchivo = `Proyecciones_IA_Contrato${contratoId}_${fechaActual}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
  };

  const chartConfig = {
    consumo: {
      label: 'Consumo Proyectado (kWh)',
      color: '#3b82f6'
    },
    inferior: {
      label: 'Intervalo Inferior',
      color: '#93c5fd'
    },
    superior: {
      label: 'Intervalo Superior',
      color: '#1e40af'
    }
  };

  // Preparar datos para los gráficos
  const chartData =
    proyeccionesData?.proyecciones.map(p => ({
      mes: p.mes,
      fecha: p.fecha,
      consumoProyectado: p.consumoProyectado,
      intervaloInferior: p.intervaloInferior,
      intervaloSuperior: p.intervaloSuperior,
      confianza: p.confianza
    })) || [];

  if (detalleLecturas.length === 0 && detalleFacturas.length === 0) {
    return (
      <Card className='border bg-background'>
        <CardContent className='pt-6 text-center'>
          <div className='text-muted-foreground text-sm'>
            No hay datos suficientes para generar proyecciones
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className='space-y-3 sm:space-y-4'>
        {/* Header y controles */}
        <Card className='border bg-background'>
          <CardHeader className='pb-3 sm:pb-6'>
            <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-1'>
                  <Brain className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
                                    <CardTitle className='text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100'>
                    🤖 Proyecciones con IA
                    <Badge variant='default' className='bg-blue-600'>
                      Prophet AI
                    </Badge>
                    {proyeccionesData && cacheInfo.fromCache && (
                      <Badge variant='secondary' className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'>
                        ⚡ Desde Cache
                      </Badge>
                    )}
                    {proyeccionesData && cacheInfo.responseTime > 0 && (
                      <Badge variant='outline' className='text-xs'>
                        {cacheInfo.responseTime}ms
                      </Badge>
                    )}
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-md p-4'>
                      <div className='space-y-2 text-xs sm:text-sm'>
                        <p className='font-semibold'>
                          Proyecciones con Inteligencia Artificial
                        </p>
                        <div className='space-y-1'>
                          <p>
                            <strong>• Modelo Prophet:</strong> Algoritmo de Facebook para series temporales
                          </p>
                          <p>
                            <strong>• Auto-entrenamiento:</strong> Aprende de tus datos históricos reales
                          </p>
                          <p>
                            <strong>• Intervalos de confianza:</strong> Rango superior e inferior automático
                          </p>
                          <p>
                            <strong>• Estacionalidad:</strong> Detecta patrones automáticamente
                          </p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  Modelo entrenado con datos históricos reales del contrato
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs sm:text-sm text-muted-foreground'>Período:</span>
                  <div className='flex gap-1'>
                    {([6, 12, 24] as const).map(periodo => (
                      <Button
                        key={periodo}
                        variant={
                          periodoProyeccion === periodo ? 'default' : 'outline'
                        }
                        size='sm'
                        onClick={() => setPeriodoProyeccion(periodo)}
                        className='text-xs h-8'
                        disabled={isLoading}
                      >
                        {periodo}m
                      </Button>
                    ))}
                  </div>
                </div>
                <div className='flex gap-2'>
                  {!proyeccionesData && (
                    <Button
                      onClick={generarProyecciones}
                      disabled={isLoading || !contratoId}
                      className='gap-2 h-8'
                      size='sm'
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
                          <span className='text-xs'>Generando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className='h-3 w-3 sm:h-4 sm:w-4' />
                          <span className='text-xs'>Generar IA</span>
                        </>
                      )}
                    </Button>
                  )}
                  {proyeccionesData && (
                    <>
                      <Button
                        onClick={reentrenarModelo}
                        variant='outline'
                        size='sm'
                        disabled={isLoading}
                        className='gap-2 h-8'
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
                            <span className='text-xs hidden sm:inline'>Reentrenando...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className='h-3 w-3 sm:h-4 sm:w-4' />
                            <span className='text-xs hidden sm:inline'>Reentrenar</span>
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={exportarAExcel}
                        variant='outline'
                        size='sm'
                        className='gap-2 h-8 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/20'
                      >
                        <Download className='h-3 w-3 sm:h-4 sm:w-4' />
                        <span className='text-xs'>Excel</span>
                      </Button>
                      {canClearCache && (
                        <Button
                          onClick={limpiarCache}
                          variant='outline'
                          size='sm'
                          className='gap-2 h-8 text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/20'
                        >
                          <RefreshCw className='h-3 w-3 sm:h-4 sm:w-4' />
                          <span className='text-xs hidden sm:inline'>Limpiar Cache</span>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Estado del modelo y servicio */}
        {contratoId && (
          <div className='grid gap-3 sm:gap-4 md:grid-cols-2'>
            <Card>
              <CardContent className='pt-4 sm:pt-6'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-start gap-3'>
                    <div
                      className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full mt-1 flex-shrink-0 ${modeloEntrenado ? 'bg-green-500' : 'bg-yellow-500'}`}
                    />
                    <div className='min-w-0'>
                      <p className='font-medium text-xs sm:text-sm'>
                        Modelo {modeloEntrenado ? 'Entrenado' : 'Pendiente'} - Contrato {contratoId}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {modeloEntrenado
                          ? 'El modelo de IA está listo para generar proyecciones precisas'
                          : 'El modelo necesita ser entrenado con los datos históricos disponibles'}
                      </p>
                    </div>
                  </div>
                  {proyeccionesData?.metadata && (
                    <Badge variant='outline' className='text-xs flex-shrink-0'>
                      {proyeccionesData.metadata.muestrasEntrenamiento} muestras
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-4 sm:pt-6'>
                <div className='space-y-3'>
                  <div className='flex items-start gap-3'>
                    <div
                      className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full mt-1 flex-shrink-0 ${
                        serviceHealth?.status === 'healthy'
                          ? 'bg-green-500'
                          : serviceHealth?.status === 'degraded'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                    />
                    <div className='min-w-0'>
                      <p className='font-medium text-xs sm:text-sm'>
                        Servicio de IA: {serviceHealth?.status || 'Unknown'}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        {serviceHealth?.database
                          ? `Conectado a la base de datos`
                          : 'Verificando conexión...'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <strong>Error del servicio de IA:</strong> {error}
              <div className='mt-2 text-xs'>
                • Verifica que el servicio de IA esté corriendo en
                http://localhost:8001
                <br />• Confirma que el contrato {contratoId} tenga datos
                históricos suficientes
                <br />• Revisa la conexión a la base de datos del servicio de IA
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Resultados de IA */}
        {proyeccionesData && (
          <>
            {/* Metadata del modelo */}
            <Card>
              <CardHeader className='pb-3 sm:pb-6'>
                <CardTitle className='text-base sm:text-lg flex items-center gap-2'>
                  <TrendingUp className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
                  Información del Modelo de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-1'>
                      <p className='text-xs sm:text-sm font-medium'>Algoritmo</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          <p className='text-xs'>
                            <strong>Prophet</strong> es un algoritmo desarrollado por Facebook/Meta
                            especializado en predicción de series temporales. Detecta automáticamente
                            patrones estacionales y tendencias en los datos históricos.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      {proyeccionesData.metadata.modeloUsado}
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-1'>
                      <p className='text-xs sm:text-sm font-medium'>
                        Muestras Entrenamiento
                      </p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          <p className='text-xs'>
                            Cantidad de registros históricos utilizados para entrenar el modelo.
                            <strong> Más muestras = Mayor precisión.</strong> Se recomienda tener
                            al menos 12 meses de datos para proyecciones confiables.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      {proyeccionesData.metadata.muestrasEntrenamiento}{' '}
                      registros
                    </p>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-1'>
                      <p className='text-xs sm:text-sm font-medium'>Confianza General</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          <p className='text-xs'>
                            Nivel de confiabilidad de las proyecciones basado en la cantidad y
                            calidad de datos históricos:
                          </p>
                          <ul className='text-xs mt-1 space-y-0.5'>
                            <li><strong>• Excelente:</strong> 24+ meses de datos</li>
                            <li><strong>• Buena:</strong> 12-23 meses de datos</li>
                            <li><strong>• Regular:</strong> 6-11 meses de datos</li>
                            <li><strong>• Baja:</strong> Menos de 6 meses</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Badge
                      variant={
                        proyeccionesData.metadata.confianzaGeneral ===
                        'Excelente'
                          ? 'default'
                          : proyeccionesData.metadata.confianzaGeneral ===
                              'Buena'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className='text-xs'
                    >
                      {proyeccionesData.metadata.confianzaGeneral}
                    </Badge>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-1'>
                      <p className='text-xs sm:text-sm font-medium'>Período Histórico</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                        </TooltipTrigger>
                        <TooltipContent className='max-w-xs'>
                          <p className='text-xs'>
                            Rango de fechas de los datos históricos que el modelo utilizó para
                            aprender los patrones de consumo. El modelo analiza este período
                            completo para detectar tendencias y estacionalidad.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className='text-xs sm:text-sm text-muted-foreground'>
                      {formatPeriodoHistorico(
                        proyeccionesData.metadata.periodoHistorico
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen ejecutivo */}
            <div className='grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Card>
                <CardContent className='pt-4 sm:pt-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-1'>
                        <p className='text-xs sm:text-sm font-medium text-muted-foreground'>Total Proyectado</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-xs'>
                            <p className='text-xs'>
                              Suma total del consumo energético estimado por el modelo de IA
                              para los próximos <strong>{periodoProyeccion} meses</strong>.
                              Este valor te ayuda a planificar el presupuesto energético del período.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className='text-xl sm:text-2xl font-bold text-blue-600 mt-1'>
                        {proyeccionesData.metadata.totalConsumoProyectado.toLocaleString(
                          'es-CL'
                        )}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        kWh en {periodoProyeccion} meses
                      </p>
                    </div>
                    <Zap className='h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0' />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='pt-4 sm:pt-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-1'>
                        <p className='text-xs sm:text-sm font-medium text-muted-foreground'>Promedio Mensual</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-xs'>
                            <p className='text-xs'>
                              Consumo promedio esperado por mes según las proyecciones del modelo.
                              Es útil para comparar con consumos históricos y detectar cambios
                              en los patrones de uso energético.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className='text-xl sm:text-2xl font-bold text-green-600 mt-1'>
                        {proyeccionesData.metadata.promedioMensualConsumo.toLocaleString(
                          'es-CL'
                        )}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        kWh por mes
                      </p>
                    </div>
                    <TrendingUp className='h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0' />
                  </div>
                </CardContent>
              </Card>

              <Card className='sm:col-span-2 lg:col-span-1'>
                <CardContent className='pt-4 sm:pt-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-1'>
                        <p className='text-xs sm:text-sm font-medium text-muted-foreground'>Precisión IA</p>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                          </TooltipTrigger>
                          <TooltipContent className='max-w-xs'>
                            <p className='text-xs'>
                              Indicador estimado de la precisión del modelo basado en la cantidad
                              de datos históricos disponibles. Más datos = mayor precisión.
                              <strong> Se recomienda al menos 12 meses</strong> de historial
                              para obtener proyecciones confiables.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className='text-xl sm:text-2xl font-bold text-purple-600 mt-1'>
                        {Math.round(
                          (proyeccionesData.metadata.muestrasEntrenamiento /
                            Math.max(
                              proyeccionesData.metadata.muestrasEntrenamiento,
                              50
                            )) *
                            100
                        )}
                        %
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        basado en datos históricos
                      </p>
                    </div>
                    <Brain className='h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0' />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className='grid gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-2'>
              {/* Consumo proyectado con intervalos */}
              <Card>
                <CardHeader className='pb-3 sm:pb-6'>
                  <div className='flex items-center gap-2'>
                    <CardTitle className='text-sm sm:text-base'>
                      Proyección de Consumo con Intervalos de Confianza
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground cursor-help' />
                      </TooltipTrigger>
                      <TooltipContent className='max-w-xs'>
                        <p className='text-xs'>
                          <strong>Línea azul:</strong> Consumo proyectado más probable según el modelo.
                        </p>
                        <p className='text-xs mt-1'>
                          <strong>Área sombreada:</strong> Rango de incertidumbre. El consumo real
                          probablemente estará dentro de esta zona. Mientras más ancha la banda,
                          mayor incertidumbre en la proyección.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className='aspect-[4/3]'>
                    <AreaChart data={chartData}>
                      <XAxis
                        dataKey='mes'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={10}
                        angle={-45}
                        textAnchor='end'
                        height={60}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item ? `${item.mes} (${item.fecha})` : label;
                        }}
                        formatter={(value, _name, props) => {
                          const formatValue = `${Number(value).toLocaleString('es-CL')} kWh`;
                          const confianza = props.payload?.confianza;
                          return [formatValue, `${_name} (${confianza})`];
                        }}
                      />
                      <Area
                        dataKey='intervaloSuperior'
                        fill='#93c5fd'
                        fillOpacity={0.3}
                        stroke='none'
                      />
                      <Area
                        dataKey='intervaloInferior'
                        fill='#ffffff'
                        fillOpacity={1}
                        stroke='none'
                      />
                      <Area
                        dataKey='consumoProyectado'
                        fill='#3b82f6'
                        fillOpacity={0.8}
                        stroke='#1e40af'
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Barras por confianza */}
              <Card>
                <CardHeader className='pb-3 sm:pb-6'>
                  <div className='flex items-center gap-2'>
                    <CardTitle className='text-sm sm:text-base'>
                      Proyección por Nivel de Confianza
                    </CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground cursor-help' />
                      </TooltipTrigger>
                      <TooltipContent className='max-w-xs'>
                        <p className='text-xs'>
                          Las barras muestran el consumo proyectado coloreadas según el nivel
                          de confianza del modelo:
                        </p>
                        <ul className='text-xs mt-1 space-y-0.5'>
                          <li><strong>• Verde:</strong> Alta confianza (datos históricos robustos)</li>
                          <li><strong>• Amarillo:</strong> Media confianza (datos moderados)</li>
                          <li><strong>• Rojo:</strong> Baja confianza (datos limitados o atípicos)</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className='aspect-[4/3]'>
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey='mes'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={10}
                        angle={-45}
                        textAnchor='end'
                        height={60}
                      />
                      <YAxis hide />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        labelFormatter={(label, payload) => {
                          const item = payload?.[0]?.payload;
                          return item ? `${item.mes} (${item.fecha})` : label;
                        }}
                        formatter={(value, _name, props) => {
                          const formatValue = `${Number(value).toLocaleString('es-CL')} kWh`;
                          const confianza = props.payload?.confianza;
                          return [formatValue, `Confianza: ${confianza}`];
                        }}
                      />
                      <Bar dataKey='consumoProyectado' radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={getConfianzaColor(entry.confianza)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabla detallada */}
            <Card>
              <CardHeader className='pb-3 sm:pb-6'>
                <CardTitle className='text-sm sm:text-base'>
                  Detalle de Proyecciones Mensuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full text-xs sm:text-sm'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left p-2'>Período</th>
                        <th className='text-right p-2'>
                          <div className='flex items-center justify-end gap-1'>
                            <span>Proyección (kWh)</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                              </TooltipTrigger>
                              <TooltipContent className='max-w-xs'>
                                <p className='text-xs'>
                                  Valor más probable de consumo según el modelo de IA para ese mes.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                        <th className='text-right p-2 hidden sm:table-cell'>
                          <div className='flex items-center justify-end gap-1'>
                            <span>Intervalo Inferior</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                              </TooltipTrigger>
                              <TooltipContent className='max-w-xs'>
                                <p className='text-xs'>
                                  Límite mínimo estimado del consumo. Hay aproximadamente 80% de
                                  probabilidad de que el consumo real sea mayor a este valor.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                        <th className='text-right p-2 hidden sm:table-cell'>
                          <div className='flex items-center justify-end gap-1'>
                            <span>Intervalo Superior</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                              </TooltipTrigger>
                              <TooltipContent className='max-w-xs'>
                                <p className='text-xs'>
                                  Límite máximo estimado del consumo. Hay aproximadamente 80% de
                                  probabilidad de que el consumo real sea menor a este valor.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                        <th className='text-center p-2'>
                          <div className='flex items-center justify-center gap-1'>
                            <span>Confianza</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className='h-3 w-3 text-muted-foreground cursor-help' />
                              </TooltipTrigger>
                              <TooltipContent className='max-w-xs'>
                                <p className='text-xs'>
                                  Nivel de confiabilidad de la proyección para ese mes específico,
                                  basado en la calidad y cantidad de datos históricos similares.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyeccionesData.proyecciones.map(
                        (proyeccion, index) => (
                          <tr
                            key={index}
                            className='border-b hover:bg-muted/50'
                          >
                            <td className='p-2 font-medium'>
                              {proyeccion.mes}
                            </td>
                            <td className='p-2 text-right font-mono'>
                              {proyeccion.consumoProyectado.toLocaleString(
                                'es-CL'
                              )}
                            </td>
                            <td className='p-2 text-right font-mono text-muted-foreground hidden sm:table-cell'>
                              {proyeccion.intervaloInferior.toLocaleString(
                                'es-CL'
                              )}
                            </td>
                            <td className='p-2 text-right font-mono text-muted-foreground hidden sm:table-cell'>
                              {proyeccion.intervaloSuperior.toLocaleString(
                                'es-CL'
                              )}
                            </td>
                            <td className='p-2 text-center'>
                              <Badge
                                variant={
                                  proyeccion.confianza === 'Alta'
                                    ? 'default'
                                    : proyeccion.confianza === 'Media'
                                      ? 'secondary'
                                      : 'destructive'
                                }
                                className='text-xs'
                              >
                                {proyeccion.confianza}
                              </Badge>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Información sobre el modelo Prophet */}
        <Card>
          <CardHeader className='pb-3 sm:pb-6'>
            <CardTitle className='text-sm sm:text-base flex items-center gap-2'>
              <Brain className='h-4 w-4 sm:h-5 sm:w-5 text-purple-600' />
              Sobre el Modelo Prophet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 sm:gap-4 md:grid-cols-2'>
              <div className='space-y-2 sm:space-y-3'>
                <div>
                  <h4 className='font-medium text-xs sm:text-sm'>¿Qué es Prophet?</h4>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Prophet es un algoritmo de Machine Learning desarrollado por
                    Facebook, especializado en series temporales como el consumo
                    energético.
                  </p>
                </div>
                <div>
                  <h4 className='font-medium text-xs sm:text-sm'>Ventajas principales</h4>
                  <ul className='text-xs text-muted-foreground mt-1 space-y-1'>
                    <li>• Detecta automáticamente patrones estacionales</li>
                    <li>• Robusto ante datos faltantes u outliers</li>
                    <li>• Calcula intervalos de confianza automáticamente</li>
                    <li>• Se adapta a cambios en tendencias</li>
                  </ul>
                </div>
              </div>
              <div className='space-y-2 sm:space-y-3'>
                <div>
                  <h4 className='font-medium text-xs sm:text-sm'>¿Cómo funciona?</h4>
                  <p className='text-xs text-muted-foreground mt-1'>
                    El modelo analiza tus datos históricos para encontrar
                    patrones (tendencias, estacionalidad) y proyecta estos
                    patrones hacia el futuro.
                  </p>
                </div>
                <div>
                  <h4 className='font-medium text-xs sm:text-sm'>Interpretación</h4>
                  <ul className='text-xs text-muted-foreground mt-1 space-y-1'>
                    <li>
                      • <strong>Proyección:</strong> Valor más probable
                    </li>
                    <li>
                      • <strong>Intervalo Inferior/Superior:</strong> Rango de
                      incertidumbre
                    </li>
                    <li>
                      • <strong>Confianza:</strong> Calidad de los datos
                      históricos
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className='border-amber-200 bg-amber-50 dark:bg-amber-950/10'>
          <AlertTriangle className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-800 dark:text-amber-200 text-xs sm:text-sm'>
            <strong>Importante:</strong> Las proyecciones de IA son estimaciones
            estadísticas basadas en patrones históricos. Los valores reales
            pueden diferir debido a cambios en hábitos, equipamiento,
            condiciones climáticas atípicas o factores externos no considerados
            en el entrenamiento del modelo. Usa estas proyecciones como guía
            para planificación, no como valores garantizados.
          </AlertDescription>
        </Alert>
      </div>
    </TooltipProvider>
  );
});

export default ProyeccionesAvanzadas;
