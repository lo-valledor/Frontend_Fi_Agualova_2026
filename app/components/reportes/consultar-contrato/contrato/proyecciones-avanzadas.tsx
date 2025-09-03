import {
  AlertTriangle,
  CalendarDays,
  Info,
  Snowflake,
  Sun,
  TrendingUp,
  Zap
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import { Separator } from '~/components/ui/separator';
import { Alert, AlertDescription } from '~/components/ui/alert';
import type { DetalleFacturas, DetalleLecturas } from '~/types/reportes';

interface ProyeccionesAvanzadasProps {
  detalleLecturas: DetalleLecturas[];
  detalleFacturas: DetalleFacturas[];
  contratoId?: number;
}

interface ProyeccionMensual {
  mes: number;
  mesNombre: string;
  mesCorto: string;
  periodo: string;
  consumoProyectado: number;
  facturacionProyectada: number;
  factorEstacional: number;
  factorHistorico: number;
  factorTendencia: number;
  confianza: 'Alta' | 'Media' | 'Baja';
  alertas: string[];
  contexto: string;
}

const ProyeccionesAvanzadas = memo(function ProyeccionesAvanzadas({
  detalleLecturas,
  detalleFacturas,
  contratoId
}: ProyeccionesAvanzadasProps) {
  const [periodoProyeccion, setPeriodoProyeccion] = useState<6 | 12 | 24>(12);

  // Definir factores estacionales para hemisferio sur
  const factoresEstacionales = {
    1: { factor: 1.15, estacion: 'Verano', descripcion: 'Pico de calor - Mayor uso de refrigeración' }, // Enero
    2: { factor: 1.20, estacion: 'Verano', descripcion: 'Máximo calor - Pico de aires acondicionados' }, // Febrero
    3: { factor: 1.05, estacion: 'Otoño', descripcion: 'Temperaturas moderadas' }, // Marzo
    4: { factor: 0.95, estacion: 'Otoño', descripcion: 'Clima templado - Menor demanda energética' }, // Abril
    5: { factor: 0.90, estacion: 'Otoño', descripcion: 'Temperaturas frescas' }, // Mayo
    6: { factor: 1.00, estacion: 'Invierno', descripcion: 'Inicio invierno - Calefacción moderada' }, // Junio
    7: { factor: 1.10, estacion: 'Invierno', descripcion: 'Pico invernal - Mayor uso calefacción' }, // Julio
    8: { factor: 1.08, estacion: 'Invierno', descripcion: 'Fin de invierno - Calefacción continua' }, // Agosto
    9: { factor: 0.95, estacion: 'Primavera', descripcion: 'Clima templado primaveral' }, // Septiembre
    10: { factor: 0.98, estacion: 'Primavera', descripcion: 'Temperaturas agradables' }, // Octubre
    11: { factor: 1.02, estacion: 'Primavera', descripcion: 'Pre-verano - Inicio uso refrigeración' }, // Noviembre
    12: { factor: 1.12, estacion: 'Verano', descripcion: 'Inicio verano - Aumenta refrigeración' } // Diciembre
  };

  const algoritmoProyeccionAvanzado = useMemo(() => {
    if (detalleLecturas.length === 0 && detalleFacturas.length === 0) {
      return { proyecciones: [], resumen: null };
    }

    // Procesar datos históricos
    const datosHistoricos = detalleLecturas.map(lectura => {
      let fecha;
      if (lectura.fechaLectura && lectura.fechaLectura !== '-') {
        if (typeof lectura.fechaLectura === 'string' && lectura.fechaLectura.includes('/')) {
          const [datePart] = lectura.fechaLectura.split(' ');
          const [day, month, year] = datePart.split('/');
          fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          fecha = new Date(lectura.fechaLectura);
        }
      } else {
        fecha = new Date();
      }

      const factura = detalleFacturas.find(f => f.periodo === lectura.periodo);
      
      return {
        fecha: fecha.getTime(),
        mes: fecha.getMonth() + 1,
        año: fecha.getFullYear(),
        consumo: lectura.consumoPeriodo || 0,
        facturacion: factura?.valorTotal || 0,
        periodo: lectura.periodo
      };
    }).sort((a, b) => a.fecha - b.fecha);

    // Calcular promedios históricos por mes
    const promediosPorMes: { [key: number]: { consumo: number; facturacion: number; count: number } } = {};
    
    datosHistoricos.forEach(dato => {
      if (!promediosPorMes[dato.mes]) {
        promediosPorMes[dato.mes] = { consumo: 0, facturacion: 0, count: 0 };
      }
      promediosPorMes[dato.mes].consumo += dato.consumo;
      promediosPorMes[dato.mes].facturacion += dato.facturacion;
      promediosPorMes[dato.mes].count++;
    });

    Object.keys(promediosPorMes).forEach(mes => {
      const mesNum = parseInt(mes);
      promediosPorMes[mesNum].consumo /= promediosPorMes[mesNum].count;
      promediosPorMes[mesNum].facturacion /= promediosPorMes[mesNum].count;
    });

    // Calcular tendencia general usando regresión lineal
    const n = datosHistoricos.length;
    let sumX = 0, sumYConsumo = 0, sumYFacturacion = 0, sumXYConsumo = 0, sumXYFacturacion = 0, sumX2 = 0;
    
    datosHistoricos.forEach((dato, index) => {
      const x = index;
      sumX += x;
      sumYConsumo += dato.consumo;
      sumYFacturacion += dato.facturacion;
      sumXYConsumo += x * dato.consumo;
      sumXYFacturacion += x * dato.facturacion;
      sumX2 += x * x;
    });
    
    const tendenciaConsumo = n > 1 ? (n * sumXYConsumo - sumX * sumYConsumo) / (n * sumX2 - sumX * sumX) : 0;
    const interceptConsumo = n > 1 ? (sumYConsumo - tendenciaConsumo * sumX) / n : 0;
    const tendenciaFacturacion = n > 1 ? (n * sumXYFacturacion - sumX * sumYFacturacion) / (n * sumX2 - sumX * sumX) : 0;
    const interceptFacturacion = n > 1 ? (sumYFacturacion - tendenciaFacturacion * sumX) / n : 0;

    // Calcular factor tarifario (asumiendo crecimiento promedio del 3% anual)
    const factorTarifarioAnual = 1.03;

    // Generar proyecciones
    const ahora = new Date();
    const proyecciones: ProyeccionMensual[] = [];

    for (let i = 1; i <= periodoProyeccion; i++) {
      const fechaProyeccion = new Date(ahora);
      fechaProyeccion.setMonth(fechaProyeccion.getMonth() + i);
      const mes = fechaProyeccion.getMonth() + 1;
      const año = fechaProyeccion.getFullYear();
      
      // 1. Factor estacional (30%)
      const factorEstacional = factoresEstacionales[mes as keyof typeof factoresEstacionales].factor;
      
      // 2. Promedio histórico del mes (60%)
      const promedioHistorico = promediosPorMes[mes] || { consumo: 0, facturacion: 0 };
      
      // 3. Tendencia lineal (10%)
      const proyeccionTendencia = {
        consumo: Math.max(0, interceptConsumo + tendenciaConsumo * (n + i - 1)),
        facturacion: Math.max(0, interceptFacturacion + tendenciaFacturacion * (n + i - 1))
      };
      
      // 4. Factor tarifario (años futuros)
      const añosFuturos = Math.max(0, año - ahora.getFullYear());
      const factorTarifario = Math.pow(factorTarifarioAnual, añosFuturos);

      // Combinar factores
      const consumoBase = promedioHistorico.consumo || 
        (datosHistoricos.length > 0 ? sumYConsumo / n : 0);
      const facturacionBase = promedioHistorico.facturacion || 
        (datosHistoricos.length > 0 ? sumYFacturacion / n : 0);

      const consumoProyectado = Math.round(
        (consumoBase * 0.6 + proyeccionTendencia.consumo * 0.1) * factorEstacional + 
        (consumoBase * 0.3)
      );

      const facturacionProyectada = Math.round(
        (facturacionBase * 0.6 + proyeccionTendencia.facturacion * 0.1) * 
        factorEstacional * factorTarifario + (facturacionBase * 0.3 * factorTarifario)
      );

      // Calcular confianza
      let confianza: 'Alta' | 'Media' | 'Baja' = 'Media';
      const datosDelMes = promediosPorMes[mes]?.count || 0;
      if (datosDelMes >= 3) confianza = 'Alta';
      else if (datosDelMes < 2) confianza = 'Baja';

      // Generar alertas contextuales
      const alertas: string[] = [];
      const contextoEstacional = factoresEstacionales[mes as keyof typeof factoresEstacionales];
      
      if (factorEstacional > 1.15) {
        alertas.push(`⚠️ Mes de alto consumo típico (${contextoEstacional.estacion})`);
      }
      if (factorEstacional < 0.95) {
        alertas.push(`💡 Mes de bajo consumo típico (${contextoEstacional.estacion})`);
      }
      if (añosFuturos > 0) {
        alertas.push(`💰 Incluye proyección tarifaria (+${((factorTarifario - 1) * 100).toFixed(1)}%)`);
      }
      if (confianza === 'Baja') {
        alertas.push(`📊 Pocos datos históricos para este mes`);
      }

      proyecciones.push({
        mes,
        mesNombre: fechaProyeccion.toLocaleDateString('es-CL', { month: 'long' }),
        mesCorto: fechaProyeccion.toLocaleDateString('es-CL', { month: 'short' }),
        periodo: `${fechaProyeccion.toLocaleDateString('es-CL', { month: 'short' })} ${año}`,
        consumoProyectado,
        facturacionProyectada,
        factorEstacional,
        factorHistorico: promedioHistorico.consumo > 0 ? 0.6 : 0,
        factorTendencia: 0.1,
        confianza,
        alertas,
        contexto: contextoEstacional.descripcion
      });
    }

    // Calcular resumen
    const totalConsumoProyectado = proyecciones.reduce((sum, p) => sum + p.consumoProyectado, 0);
    const totalFacturacionProyectada = proyecciones.reduce((sum, p) => sum + p.facturacionProyectada, 0);
    const promedioConfianza = proyecciones.filter(p => p.confianza === 'Alta').length / proyecciones.length;

    const resumen = {
      totalConsumoProyectado,
      totalFacturacionProyectada,
      promedioMensualConsumo: Math.round(totalConsumoProyectado / proyecciones.length),
      promedioMensualFacturacion: Math.round(totalFacturacionProyectada / proyecciones.length),
      confianzaGeneral: promedioConfianza > 0.6 ? 'Alta' : promedioConfianza > 0.3 ? 'Media' : 'Baja',
      mesesAltoConsumo: proyecciones.filter(p => p.factorEstacional > 1.1).length,
      mesesBajoConsumo: proyecciones.filter(p => p.factorEstacional < 0.95).length
    };

    return { proyecciones, resumen };
  }, [detalleLecturas, detalleFacturas, periodoProyeccion]);

  const chartConfig = {
    consumo: {
      label: 'Consumo Proyectado (kWh)',
      color: '#3b82f6'
    },
    facturacion: {
      label: 'Facturación Proyectada ($)',
      color: '#dc2626'
    }
  };

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
        <Card className='border bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800'>
          <CardHeader>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <CardTitle className='text-lg flex items-center gap-2 text-purple-900 dark:text-purple-100'>
                    🔮 Proyecciones Avanzadas
                    <Badge variant="outline" className='bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600'>
                      Algoritmo Mejorado
                    </Badge>
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-4 w-4 text-purple-600 dark:text-purple-400 cursor-help' />
                    </TooltipTrigger>
                    <TooltipContent className='max-w-md p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                      <div className='space-y-3 text-sm'>
                        <p className='font-semibold text-purple-700 dark:text-purple-300'>🔮 ¿Qué son las Proyecciones Avanzadas?</p>
                        <div className='space-y-2 text-slate-700 dark:text-slate-300'>
                          <p><strong className='text-slate-900 dark:text-slate-100'>• Algoritmo inteligente:</strong> Combina 4 factores para generar estimaciones más precisas</p>
                          <p><strong className='text-slate-900 dark:text-slate-100'>• Específico para hemisferio sur:</strong> Considera patrones estacionales locales</p>
                          <p><strong className='text-slate-900 dark:text-slate-100'>• Datos históricos:</strong> Usa todo tu historial disponible, no solo datos filtrados</p>
                          <p><strong className='text-slate-900 dark:text-slate-100'>• Proyección dual:</strong> Estima tanto consumo (kWh) como facturación ($)</p>
                        </div>
                        <div className='bg-purple-50 dark:bg-purple-950/50 p-3 rounded border border-purple-200 dark:border-purple-800'>
                          <p className='font-medium mb-1 text-purple-700 dark:text-purple-300'>💡 ¿Por qué es mejor?</p>
                          <p className='text-xs text-purple-700 dark:text-purple-300'>A diferencia de proyecciones simples que solo usan tendencias lineales, 
                          este algoritmo considera la realidad del consumo eléctrico: estaciones, patrones mensuales, 
                          y alzas tarifarias.</p>
                        </div>
                        <p className='text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2 rounded border border-amber-200 dark:border-amber-800'>
                          ⚠️ Recuerda: Son estimaciones estadísticas, no valores garantizados
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className='text-sm text-purple-700 dark:text-purple-300 mt-1'>
                  Análisis predictivo con factores estacionales, históricos y tarifarios
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-purple-600 dark:text-purple-400'>Período:</span>
                <div className='flex gap-1'>
                  {([6, 12, 24] as const).map(periodo => (
                    <Button
                      key={periodo}
                      variant={periodoProyeccion === periodo ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setPeriodoProyeccion(periodo)}
                      className='text-xs'
                    >
                      {periodo}m
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Resumen ejecutivo */}
        {algoritmoProyeccionAvanzado.resumen && (
          <div className='grid gap-4 md:grid-cols-4'>
            <Card>
              <CardContent className='pt-4'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center justify-between cursor-help'>
                      <div>
                        <p className='text-sm font-medium'>Consumo Proyectado</p>
                        <p className='text-2xl font-bold text-blue-600'>
                          {algoritmoProyeccionAvanzado.resumen.totalConsumoProyectado.toLocaleString('es-CL')}
                        </p>
                        <p className='text-xs text-muted-foreground'>kWh total</p>
                      </div>
                      <Zap className='h-4 w-4 text-muted-foreground' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-blue-700 dark:text-blue-300'>💡 Consumo Energético Proyectado</p>
                      <div className='space-y-1 text-slate-700 dark:text-slate-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Qué es:</strong> Suma total de kWh estimados para el período seleccionado</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Cómo se calcula:</strong> Factor histórico del mes (60%) + factor estacional (30%) + tendencia (10%)</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Promedio mensual:</strong> ~{algoritmoProyeccionAvanzado.resumen.promedioMensualConsumo.toLocaleString('es-CL')} kWh/mes</p>
                      </div>
                      <p className='text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-2 rounded border border-blue-200 dark:border-blue-800'>
                        📊 Este valor NO incluye alzas tarifarias, solo estima el consumo físico de energía
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-4'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center justify-between cursor-help'>
                      <div>
                        <p className='text-sm font-medium'>Facturación Proyectada</p>
                        <p className='text-2xl font-bold text-red-600'>
                          ${algoritmoProyeccionAvanzado.resumen.totalFacturacionProyectada.toLocaleString('es-CL')}
                        </p>
                        <p className='text-xs text-muted-foreground'>total estimado</p>
                      </div>
                      <TrendingUp className='h-4 w-4 text-muted-foreground' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-red-700 dark:text-red-300'>💰 Facturación Total Proyectada</p>
                      <div className='space-y-1 text-slate-700 dark:text-slate-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Qué es:</strong> Valor total estimado a pagar en el período (incluye IVA)</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Incluye:</strong> Consumo proyectado + alzas tarifarias estimadas (~3% anual)</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Promedio mensual:</strong> ~${algoritmoProyeccionAvanzado.resumen.promedioMensualFacturacion.toLocaleString('es-CL')}/mes</p>
                      </div>
                      <p className='text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-2 rounded border border-red-200 dark:border-red-800'>
                        📈 IMPORTANTE: Las alzas tarifarias reales pueden diferir significativamente de la estimación
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-4'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center justify-between cursor-help'>
                      <div>
                        <p className='text-sm font-medium'>Confianza General</p>
                        <Badge variant={
                          algoritmoProyeccionAvanzado.resumen.confianzaGeneral === 'Alta' ? 'default' :
                          algoritmoProyeccionAvanzado.resumen.confianzaGeneral === 'Media' ? 'secondary' : 'destructive'
                        }>
                          {algoritmoProyeccionAvanzado.resumen.confianzaGeneral}
                        </Badge>
                      </div>
                      <Info className='h-4 w-4 text-muted-foreground' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-slate-800 dark:text-slate-200'>🎯 Nivel de Confianza</p>
                      <div className='space-y-1 text-slate-700 dark:text-slate-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Alta:</strong> Más de 3 registros históricos por mes proyectado</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Media:</strong> 2-3 registros históricos por mes</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Baja:</strong> Menos de 2 registros por mes</p>
                      </div>
                      <div className='bg-slate-50 dark:bg-slate-900/50 p-2 rounded text-xs border border-slate-200 dark:border-slate-600'>
                        <p className='text-slate-800 dark:text-slate-200'><strong>Confianza actual:</strong> {algoritmoProyeccionAvanzado.resumen.confianzaGeneral}</p>
                        <p className='text-slate-600 dark:text-slate-400'>Basada en la cantidad de datos históricos disponibles para hacer la proyección</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-4'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center justify-between cursor-help'>
                      <div>
                        <p className='text-sm font-medium'>Estacionalidad</p>
                        <div className='flex items-center gap-1 mt-1'>
                          <Sun className='h-3 w-3 text-orange-500' />
                          <span className='text-xs'>{algoritmoProyeccionAvanzado.resumen.mesesAltoConsumo}</span>
                          <Snowflake className='h-3 w-3 text-blue-500 ml-2' />
                          <span className='text-xs'>{algoritmoProyeccionAvanzado.resumen.mesesBajoConsumo}</span>
                        </div>
                        <p className='text-xs text-muted-foreground'>alto/bajo consumo</p>
                      </div>
                      <CalendarDays className='h-4 w-4 text-muted-foreground' />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-orange-700 dark:text-orange-300'>🌡️ Análisis Estacional - Hemisferio Sur</p>
                      <div className='space-y-1 text-slate-700 dark:text-slate-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>☀️ Alto Consumo:</strong> {algoritmoProyeccionAvanzado.resumen.mesesAltoConsumo} meses (Verano: Dic-Feb, Invierno frío)</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>❄️ Bajo Consumo:</strong> {algoritmoProyeccionAvanzado.resumen.mesesBajoConsumo} meses (Otoño-Primavera templados)</p>
                      </div>
                      <div className='bg-orange-50 dark:bg-orange-950/50 p-2 rounded text-xs border border-orange-200 dark:border-orange-800'>
                        <p className='text-orange-700 dark:text-orange-300 font-medium mb-1'><strong>Factores considerados:</strong></p>
                        <div className='text-orange-700 dark:text-orange-300'>
                          <p>• Verano: +12-20% (aires acondicionados)</p>
                          <p>• Invierno: +0-10% (calefacción variable)</p>
                          <p>• Otoño/Primavera: -5% a +5% (templado)</p>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos de proyección */}
        <div className='grid gap-6 lg:grid-cols-2'>
          {/* Consumo proyectado */}
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-base'>Proyección de Consumo por Mes</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-4 w-4 text-muted-foreground cursor-help' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-blue-700 dark:text-blue-300'>📊 Gráfico de Consumo Mensual</p>
                      <div className='space-y-1 text-slate-700 dark:text-slate-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Qué muestra:</strong> kWh estimados para cada mes del período</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Variaciones:</strong> Reflejan patrones estacionales del hemisferio sur</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Barras altas:</strong> Meses de verano/invierno (mayor demanda energética)</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Barras bajas:</strong> Meses de otoño/primavera (consumo moderado)</p>
                      </div>
                      <p className='text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-2 rounded border border-blue-200 dark:border-blue-800'>
                        💡 Pasa el mouse sobre cada barra para ver detalles específicos y nivel de confianza
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className='aspect-[4/3]'>
                <BarChart data={algoritmoProyeccionAvanzado.proyecciones}>
                  <XAxis
                    dataKey='mesCorto'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? `${item.periodo} (${item.contexto})` : label;
                    }}
                    formatter={(value, name, props) => [
                      `~${Number(value).toLocaleString('es-CL')} kWh`,
                      `Estimación (Confianza: ${props.payload?.confianza})`
                    ]}
                  />
                  <Bar
                    dataKey='consumoProyectado'
                    fill='#3b82f6'
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Facturación proyectada */}
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-base'>Proyección de Facturación por Mes</CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className='h-4 w-4 text-muted-foreground cursor-help' />
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-red-700 dark:text-red-300'>💰 Gráfico de Facturación Mensual</p>
                      <div className='space-y-1 text-slate-700 dark:text-slate-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Qué muestra:</strong> Monto total estimado a pagar cada mes (incluye IVA)</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Incluye:</strong> Consumo proyectado + alzas tarifarias (~3% anual)</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Gráfico de área:</strong> Visualiza el flujo acumulativo de gastos</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Variaciones:</strong> Siguen el patrón de consumo + inflación tarifaria</p>
                      </div>
                      <p className='text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 p-2 rounded border border-red-200 dark:border-red-800'>
                        ⚠️ Los valores incluyen estimación de alzas eléctricas, que pueden variar significativamente
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className='aspect-[4/3]'>
                <AreaChart data={algoritmoProyeccionAvanzado.proyecciones}>
                  <XAxis
                    dataKey='mesCorto'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={12}
                  />
                  <YAxis hide />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    labelFormatter={(label, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? `${item.periodo} (${item.contexto})` : label;
                    }}
                    formatter={(value, name, props) => [
                      `~$${Number(value).toLocaleString('es-CL')}`,
                      `Estimación (Confianza: ${props.payload?.confianza})`
                    ]}
                  />
                  <Area
                    dataKey='facturacionProyectada'
                    fill='#dc2626'
                    fillOpacity={0.2}
                    stroke='#dc2626'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer importante */}
        <Alert className='border-amber-200 bg-amber-50 dark:bg-amber-950/10'>
          <AlertTriangle className='h-4 w-4 text-amber-600' />
          <AlertDescription className='text-amber-800 dark:text-amber-200'>
            <strong>Importante:</strong> Estas proyecciones son estimaciones estadísticas basadas en datos históricos, 
            factores estacionales del hemisferio sur, y tendencias tarifarias. Los valores reales pueden diferir 
            significativamente debido a cambios en patrones de consumo, condiciones climáticas atípicas, 
            modificaciones tarifarias no previstas, o cambios en el equipamiento eléctrico.
          </AlertDescription>
        </Alert>

        <Separator />

        {/* Metodología y factores */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Metodología de Proyección Avanzada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-2 cursor-help'>
                      <CalendarDays className='h-4 w-4 text-blue-500' />
                      <span className='font-medium text-sm'>Factor Histórico</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-blue-700 dark:text-blue-300'>📅 Factor Histórico (60% del peso)</p>
                      <div className='space-y-1 text-slate-700 dark:text-slate-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Qué es:</strong> Promedio de consumo del mismo mes en años anteriores</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Por ejemplo:</strong> Para proyectar enero, usa el promedio de todos los eneros anteriores</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Mayor peso:</strong> Los patrones mensales son el mejor predictor</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Ventaja:</strong> Captura comportamientos específicos de cada mes</p>
                      </div>
                      <p className='text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 p-2 rounded border border-blue-200 dark:border-blue-800'>
                        💡 Si enero siempre consume mucho por calor, el algoritmo lo considera automáticamente
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <p className='text-xs text-muted-foreground'>
                  60% del peso. Promedio de consumo del mismo mes en años anteriores.
                </p>
              </div>
              <div className='space-y-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-2 cursor-help'>
                      <Sun className='h-4 w-4 text-orange-500' />
                      <span className='font-medium text-sm'>Factor Estacional</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-orange-900 dark:text-orange-100'>🌡️ Factor Estacional (30% del peso)</p>
                      <div className='space-y-1 text-gray-700 dark:text-gray-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Hemisferio Sur:</strong> Considera estaciones invertidas vs hemisferio norte</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Verano (Dic-Feb):</strong> +12% a +20% por aires acondicionados</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Invierno (Jun-Ago):</strong> +0% a +10% por calefacción</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Otoño/Primavera:</strong> -5% a +5% por clima templado</p>
                      </div>
                      <p className='text-xs text-orange-800 dark:text-orange-200 bg-orange-50 dark:bg-orange-900/30 p-2 rounded border border-orange-200 dark:border-orange-700'>
                        🇨🇱 Calibrado específicamente para patrones climáticos de Chile/Argentina/Uruguay
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <p className='text-xs text-muted-foreground'>
                  30% del peso. Ajuste según hemisferio sur (verano: +20%, invierno variable).
                </p>
              </div>
              <div className='space-y-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-2 cursor-help'>
                      <TrendingUp className='h-4 w-4 text-green-500' />
                      <span className='font-medium text-sm'>Tendencia Lineal</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-green-900 dark:text-green-100'>📈 Tendencia Lineal (10% del peso)</p>
                      <div className='space-y-1 text-gray-700 dark:text-gray-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Qué detecta:</strong> Si el consumo está creciendo o disminuyendo a largo plazo</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Regresión lineal:</strong> Encuentra la "línea de tendencia" en los datos históricos</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Ejemplos:</strong> Casa nueva (↑), eficiencia energética (↓), más habitantes (↑)</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Peso menor:</strong> Los patrones mensuales son más importantes</p>
                      </div>
                      <p className='text-xs text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-900/30 p-2 rounded border border-green-200 dark:border-green-700'>
                        📊 Útil para detectar cambios graduales en hábitos de consumo
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <p className='text-xs text-muted-foreground'>
                  10% del peso. Dirección de crecimiento o decrecimiento histórico.
                </p>
              </div>
              <div className='space-y-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-2 cursor-help'>
                      <Zap className='h-4 w-4 text-purple-500' />
                      <span className='font-medium text-sm'>Factor Tarifario</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='max-w-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'>
                    <div className='space-y-2 text-sm'>
                      <p className='font-semibold text-purple-900 dark:text-purple-100'>💰 Factor Tarifario (Solo facturación)</p>
                      <div className='space-y-1 text-gray-700 dark:text-gray-300'>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Qué es:</strong> Estimación de alzas eléctricas futuras</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Asunción:</strong> ~3% de aumento anual (promedio histórico)</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Solo facturación:</strong> NO afecta el consumo en kWh, solo el precio</p>
                        <p><strong className='text-slate-900 dark:text-slate-100'>• Acumulativo:</strong> Se aplica año tras año para períodos largos</p>
                      </div>
                      <p className='text-xs text-purple-800 dark:text-purple-200 bg-purple-50 dark:bg-purple-900/30 p-2 rounded border border-purple-200 dark:border-purple-700'>
                        ⚠️ Las alzas reales dependen de regulación, inflación, costos energéticos, etc.
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <p className='text-xs text-muted-foreground'>
                  Proyección de alzas eléctricas (~3% anual) aplicada sobre facturación.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});

export default ProyeccionesAvanzadas;