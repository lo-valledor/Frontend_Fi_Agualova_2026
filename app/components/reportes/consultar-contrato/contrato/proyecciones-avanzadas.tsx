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

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  XAxis,
  YAxis
} from 'recharts';

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
      case 'Alta': return '#10b981';
      case 'Media': return '#f59e0b';
      case 'Baja': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const [periodoProyeccion, setPeriodoProyeccion] = useState<6 | 12 | 24>(6);
  const [proyeccionesData, setProyeccionesData] = useState<RespuestaIA | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modeloEntrenado, setModeloEntrenado] = useState(false);

  // Servicio de IA URL - usando endpoint de prueba sin autenticación
  const AI_SERVICE_URL = 'http://localhost:8001';

  const generarProyecciones = async () => {
    if (!contratoId) {
      setError('ID de contrato no disponible');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Usar el endpoint de prueba sin autenticación
      const response = await fetch(
        `${AI_SERVICE_URL}/api/ai/proyecciones-test/${contratoId}?meses=${periodoProyeccion}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error del servidor: ${response.status}`);
      }

      const data: RespuestaIA = await response.json();
      setProyeccionesData(data);
      setModeloEntrenado(true);
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
            'Content-Type': 'application/json',
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
      const response = await fetch(`${AI_SERVICE_URL}/api/ai/proyecciones/estado/${contratoId}`);
      if (response.ok) {
        const data = await response.json();
        setModeloEntrenado(data.entrenado || false);
      }
    } catch (err) {
      console.warn('No se pudo verificar el estado del modelo:', err);
    }
  };

  // Verificar estado al montar el componente
  React.useEffect(() => {
    if (contratoId) {
      verificarEstadoModelo();
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
      'Período': proyeccion.mes,
      'Fecha': proyeccion.fecha,
      'Consumo Proyectado (kWh)': proyeccion.consumoProyectado.toLocaleString('es-CL'),
      'Intervalo Inferior (kWh)': proyeccion.intervaloInferior.toLocaleString('es-CL'),
      'Intervalo Superior (kWh)': proyeccion.intervaloSuperior.toLocaleString('es-CL'),
      'Nivel de Confianza': proyeccion.confianza
    }));

    const datosResumen = [
      {},
      { 'N°': 'RESUMEN EJECUTIVO', 'Período': '', 'Fecha': '', 'Consumo Proyectado (kWh)': '' },
      {},
      { 'N°': 'Modelo Usado:', 'Período': metadata.modeloUsado },
      { 'N°': 'Muestras de Entrenamiento:', 'Período': metadata.muestrasEntrenamiento.toString() },
      { 'N°': 'Confianza General:', 'Período': metadata.confianzaGeneral },
      { 'N°': 'Total Consumo Proyectado:', 'Período': `${metadata.totalConsumoProyectado.toLocaleString('es-CL')} kWh` },
      { 'N°': 'Promedio Mensual:', 'Período': `${metadata.promedioMensualConsumo.toLocaleString('es-CL')} kWh` },
  { 'N°': 'Período Histórico:', 'Período': formatPeriodoHistorico(metadata.periodoHistorico) },
      { 'N°': 'Fecha Entrenamiento:', 'Período': metadata.fechaEntrenamiento },
      {},
      { 'N°': 'MODELO DE IA', 'Período': '', 'Fecha': '', 'Consumo Proyectado (kWh)': '' },
      {},
      { 'N°': '• Algoritmo:', 'Período': 'Prophet (Facebook) - Optimizado para series temporales' },
      { 'N°': '• Características:', 'Período': 'Detección automática de estacionalidad y tendencias' },
      { 'N°': '• Intervalos de confianza:', 'Período': 'Calculados automáticamente por el modelo' },
      { 'N°': '• Ventajas:', 'Período': 'Robusto ante datos faltantes y outliers' }
    ];

    const todosLosDatos = [...datosExportacion, ...datosResumen];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(todosLosDatos);

    const columnWidths = [
      { wch: 5 },   // N°
      { wch: 15 },  // Período
      { wch: 12 },  // Fecha
      { wch: 20 },  // Consumo Proyectado
      { wch: 22 },  // Intervalo Inferior
      { wch: 22 },  // Intervalo Superior
      { wch: 18 }   // Nivel de Confianza
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Proyecciones IA');

    const fechaActual = new Date().toLocaleDateString('es-CL').replace(/\//g, '-');
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
  const chartData = proyeccionesData?.proyecciones.map(p => ({
    mes: p.mes,
    fecha: p.fecha,
    consumoProyectado: p.consumoProyectado,
    intervaloInferior: p.intervaloInferior,
    intervaloSuperior: p.intervaloSuperior,
    confianza: p.confianza
  })) || [];

  if (detalleLecturas.length === 0 && detalleFacturas.length === 0) {
    return (
      <Card className='border bg-white dark:bg-slate-900'>
        <CardContent className='pt-6 text-center'>
          <div className='text-slate-500'>No hay datos suficientes para generar proyecciones</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className='space-y-6'>
        {/* Header y controles */}
        <Card className='border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800'>
          <CardHeader>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <CardTitle className='text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100'>
                    🤖 Proyecciones con IA
                    <Badge variant="default" className='bg-blue-600 text-white'>
                      Prophet AI
                    </Badge>
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-4 w-4 text-blue-600 dark:text-blue-400 cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-md p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                      <div className='space-y-3 text-sm'>
                        <p className='font-semibold text-blue-700 dark:text-blue-300'>🤖 Proyecciones con Inteligencia Artificial</p>
                        <div className='space-y-2 text-slate-700 dark:text-slate-300'>
                          <p><strong className='text-slate-900 dark:text-slate-100'>• Modelo Prophet:</strong> Algoritmo de Facebook para series temporales</p>
                          <p><strong className='text-slate-900 dark:text-slate-100'>• Auto-entrenamiento:</strong> Aprende de tus datos históricos reales</p>
                          <p><strong className='text-slate-900 dark:text-slate-100'>• Intervalos de confianza:</strong> Rango superior e inferior automático</p>
                          <p><strong className='text-slate-900 dark:text-slate-100'>• Estacionalidad:</strong> Detecta patrones automáticamente</p>
                        </div>
                        <div className='bg-blue-50 dark:bg-blue-950/50 p-3 rounded border border-blue-200 dark:border-blue-800'>
                          <p className='font-medium mb-1 text-blue-700 dark:text-blue-300'>🎯 Ventajas del AI</p>
                          <p className='text-xs text-blue-700 dark:text-blue-300'>El modelo se entrena específicamente con TUS datos, 
                          capturando patrones únicos de tu consumo que algoritmos genéricos no pueden detectar.</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className='text-sm text-blue-700 dark:text-blue-300 mt-1'>
                  Modelo Prophet entrenado con datos históricos reales del contrato
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-blue-600 dark:text-blue-400'>Período:</span>
                  <div className='flex gap-1'>
                    {([6, 12, 24] as const).map(periodo => (
                      <Button
                        key={periodo}
                        variant={periodoProyeccion === periodo ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setPeriodoProyeccion(periodo)}
                        className='text-xs'
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
                      className='gap-2'
                      size='sm'
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Sparkles className='h-4 w-4' />
                          Generar IA
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
                        className='gap-2'
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            Reentrenando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className='h-4 w-4' />
                            Reentrenar
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={exportarAExcel}
                        variant='outline'
                        size='sm'
                        className='gap-2 text-green-700 border-green-200 hover:bg-green-50'
                      >
                        <Download className='h-4 w-4' />
                        Excel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Estado del modelo */}
        {contratoId && (
          <Card className='border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'>
            <CardContent className='pt-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className={`h-3 w-3 rounded-full ${modeloEntrenado ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className='font-medium text-sm'>
                      Modelo {modeloEntrenado ? 'Entrenado' : 'Pendiente'} - Contrato {contratoId}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {modeloEntrenado 
                        ? 'El modelo de IA está listo para generar proyecciones precisas'
                        : 'El modelo necesita ser entrenado con los datos históricos disponibles'
                      }
                    </p>
                  </div>
                </div>
                {proyeccionesData?.metadata && (
                  <Badge variant='outline' className='text-xs'>
                    {proyeccionesData.metadata.muestrasEntrenamiento} muestras
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <strong>Error del servicio de IA:</strong> {error}
              <div className='mt-2 text-xs'>
                • Verifica que el servicio de IA esté corriendo en http://localhost:8001
                <br />
                • Confirma que el contrato {contratoId} tenga datos históricos suficientes
                <br />
                • Revisa la conexión a la base de datos del servicio de IA
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Resultados de IA */}
        {proyeccionesData && (
          <>
            {/* Metadata del modelo */}
            <Card className='bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800'>
              <CardHeader>
                <CardTitle className='text-base text-green-800 dark:text-green-200'>
                  📊 Información del Modelo de IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Algoritmo</p>
                    <p className='text-sm text-muted-foreground'>{proyeccionesData.metadata.modeloUsado}</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Muestras Entrenamiento</p>
                    <p className='text-sm text-muted-foreground'>{proyeccionesData.metadata.muestrasEntrenamiento} registros</p>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Confianza General</p>
                    <Badge variant={
                      proyeccionesData.metadata.confianzaGeneral === 'Excelente' ? 'default' :
                      proyeccionesData.metadata.confianzaGeneral === 'Buena' ? 'secondary' : 'destructive'
                    }>
                      {proyeccionesData.metadata.confianzaGeneral}
                    </Badge>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>Período Histórico</p>
                    <p className='text-sm text-muted-foreground'>{formatPeriodoHistorico(proyeccionesData.metadata.periodoHistorico)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen ejecutivo */}
            <div className='grid gap-4 md:grid-cols-3'>
              <Card>
                <CardContent className='pt-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium'>Total Proyectado</p>
                      <p className='text-2xl font-bold text-blue-600'>
                        {proyeccionesData.metadata.totalConsumoProyectado.toLocaleString('es-CL')}
                      </p>
                      <p className='text-xs text-muted-foreground'>kWh en {periodoProyeccion} meses</p>
                    </div>
                    <Zap className='h-5 w-5 text-blue-500' />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='pt-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium'>Promedio Mensual</p>
                      <p className='text-2xl font-bold text-green-600'>
                        {proyeccionesData.metadata.promedioMensualConsumo.toLocaleString('es-CL')}
                      </p>
                      <p className='text-xs text-muted-foreground'>kWh por mes</p>
                    </div>
                    <TrendingUp className='h-5 w-5 text-green-500' />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='pt-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm font-medium'>Precisión IA</p>
                      <p className='text-2xl font-bold text-purple-600'>
                        {Math.round((proyeccionesData.metadata.muestrasEntrenamiento / Math.max(proyeccionesData.metadata.muestrasEntrenamiento, 50)) * 100)}%
                      </p>
                      <p className='text-xs text-muted-foreground'>basado en datos históricos</p>
                    </div>
                    <Brain className='h-5 w-5 text-purple-500' />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className='grid gap-6 lg:grid-cols-2'>
              {/* Consumo proyectado con intervalos */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Proyección de Consumo con Intervalos de Confianza</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className='aspect-[4/3]'>
                    <AreaChart data={chartData}>
                      <XAxis
                        dataKey='mes'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
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
                        formatter={(value, name, props) => {
                          const formatValue = `${Number(value).toLocaleString('es-CL')} kWh`;
                          const confianza = props.payload?.confianza;
                          return [formatValue, `${name} (${confianza})`];
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
                <CardHeader>
                  <CardTitle className='text-base'>Proyección por Nivel de Confianza</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className='aspect-[4/3]'>
                    <BarChart data={chartData}>
                      <XAxis
                        dataKey='mes'
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
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
                        formatter={(value, name, props) => {
                          const formatValue = `${Number(value).toLocaleString('es-CL')} kWh`;
                          const confianza = props.payload?.confianza;
                          return [formatValue, `Confianza: ${confianza}`];
                        }}
                      />
                      <Bar
                        dataKey='consumoProyectado'
                        radius={[4, 4, 0, 0]}
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getConfianzaColor(entry.confianza)} />
                          ))}
                        </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabla detallada */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Detalle de Proyecciones Mensuales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left p-2'>Período</th>
                        <th className='text-right p-2'>Proyección (kWh)</th>
                        <th className='text-right p-2'>Intervalo Inferior</th>
                        <th className='text-right p-2'>Intervalo Superior</th>
                        <th className='text-center p-2'>Confianza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyeccionesData.proyecciones.map((proyeccion, index) => (
                        <tr key={index} className='border-b hover:bg-muted/50'>
                          <td className='p-2 font-medium'>{proyeccion.mes}</td>
                          <td className='p-2 text-right font-mono'>
                            {proyeccion.consumoProyectado.toLocaleString('es-CL')}
                          </td>
                          <td className='p-2 text-right font-mono text-muted-foreground'>
                            {proyeccion.intervaloInferior.toLocaleString('es-CL')}
                          </td>
                          <td className='p-2 text-right font-mono text-muted-foreground'>
                            {proyeccion.intervaloSuperior.toLocaleString('es-CL')}
                          </td>
                          <td className='p-2 text-center'>
                            <Badge variant={
                              proyeccion.confianza === 'Alta' ? 'default' :
                              proyeccion.confianza === 'Media' ? 'secondary' : 'destructive'
                            } className='text-xs'>
                              {proyeccion.confianza}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Información sobre el modelo Prophet */}
        <Card className='border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20'>
          <CardHeader>
            <CardTitle className='text-base text-purple-800 dark:text-purple-200'>
              🧠 Sobre el Modelo Prophet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-3'>
                <div>
                  <h4 className='font-medium text-sm'>¿Qué es Prophet?</h4>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Prophet es un algoritmo de Machine Learning desarrollado por Facebook, 
                    especializado en series temporales como el consumo energético.
                  </p>
                </div>
                <div>
                  <h4 className='font-medium text-sm'>Ventajas principales</h4>
                  <ul className='text-xs text-muted-foreground mt-1 space-y-1'>
                    <li>• Detecta automáticamente patrones estacionales</li>
                    <li>• Robusto ante datos faltantes u outliers</li>
                    <li>• Calcula intervalos de confianza automáticamente</li>
                    <li>• Se adapta a cambios en tendencias</li>
                  </ul>
                </div>
              </div>
              <div className='space-y-3'>
                <div>
                  <h4 className='font-medium text-sm'>¿Cómo funciona?</h4>
                  <p className='text-xs text-muted-foreground mt-1'>
                    El modelo analiza tus datos históricos para encontrar patrones 
                    (tendencias, estacionalidad) y proyecta estos patrones hacia el futuro.
                  </p>
                </div>
                <div>
                  <h4 className='font-medium text-sm'>Interpretación</h4>
                  <ul className='text-xs text-muted-foreground mt-1 space-y-1'>
                    <li>• <strong>Proyección:</strong> Valor más probable</li>
                    <li>• <strong>Intervalo Inferior/Superior:</strong> Rango de incertidumbre</li>
                    <li>• <strong>Confianza:</strong> Calidad de los datos históricos</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert className='border-amber-200 bg-amber-50 dark:bg-amber-950/10'>
          <AlertTriangle className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-800 dark:text-amber-200'>
            <strong>Importante:</strong> Las proyecciones de IA son estimaciones estadísticas basadas en 
            patrones históricos. Los valores reales pueden diferir debido a cambios en hábitos, equipamiento, 
            condiciones climáticas atípicas o factores externos no considerados en el entrenamiento del modelo.
            Usa estas proyecciones como guía para planificación, no como valores garantizados.
          </AlertDescription>
        </Alert>
      </div>
    </TooltipProvider>
  );
});

export default ProyeccionesAvanzadas;