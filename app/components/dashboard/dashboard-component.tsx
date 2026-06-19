import NumberFlow, { continuous } from '@number-flow/react';
import {
  Activity,
  ArrowRight,
  Building,
  CheckCircle,
  FileText,
  Package,
  PlusCircle,
  Power,
  Settings,
  Snowflake,
  User,
  Users,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Label, Pie, PieChart } from 'recharts';

import React, { useEffect, useState } from 'react';

import { Link } from 'react-router';

import { usePrefetchMultiple } from '~/hooks/shared/use-prefetch';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import api from '~/lib/api';

const quickActions = [
  {
    title: 'Monitor Lecturas',
    description: 'Visualizar lecturas de medidores',
    icon: Activity,
    accent: 'border-chart-1 text-chart-1',
    href: '/dashboard/monitor/monitor-lecturas'
  },
  {
    title: 'Nuevo Contrato',
    description: 'Registrar contrato de servicio',
    icon: FileText,
    accent: 'border-chart-2 text-chart-2',
    href: '/dashboard/administracion/contratos/crear'
  },
  {
    title: 'Periodo Facturación',
    description: 'Gestionar periodos activos',
    icon: Settings,
    accent: 'border-chart-3 text-slate-800 dark:border-chart-3 dark:text-white',
    href: '/dashboard/operaciones/periodo-facturacion'
  },
  {
    title: 'Agregar Cliente',
    description: 'Registrar nuevo cliente',
    icon: Users,
    accent: 'border-energy text-energy',
    href: '/dashboard/administracion/clientes/crear'
  },
  {
    title: 'Registrar Medidor',
    description: 'Añadir medidor al inventario',
    icon: Package,
    accent:
      'border-chart-4 text-purple-800 dark:border-chart-4 dark:text-white',
    href: '/dashboard/administracion/medidores/crear'
  },
  {
    title: 'Preparar Lecturas',
    description: 'Configurar lecturas del periodo',
    icon: PlusCircle,
    accent: 'border-chart-5 text-chart-5',
    href: '/dashboard/operaciones/preparar-lecturas'
  }
];


const procesarContratosPorTipo = (data: any[]): { [key: string]: number } => {
  const contratosPorTipo: { [key: string]: number } = {};
  if (!Array.isArray(data)) return contratosPorTipo;

  for (const contrato of data) {
    const tipo = contrato.tipoContrato || 'Sin Tipo';
    contratosPorTipo[tipo] = (contratosPorTipo[tipo] || 0) + 1;
  }
  return contratosPorTipo;
};


const procesarClientesPorTipo = (
  data: any[]
): { empresa: number; persona: number } => {
  let empresas = 0;
  let personas = 0;

  if (!Array.isArray(data)) return { empresa: 0, persona: 0 };

  for (const cliente of data) {
    if (cliente.esEmpresa) {
      empresas++;
    } else {
      personas++;
    }
  }
  return { empresa: empresas, persona: personas };
};


const procesarMedidores = (
  data: any[]
): {
  porTipo: { [key: string]: number };
  porEstado: { [key: string]: number };
} => {
  const medidoresPorTipo: { [key: string]: number } = {};
  const medidoresPorEstado: { [key: string]: number } = {};

  if (!Array.isArray(data)) {
    return { porTipo: medidoresPorTipo, porEstado: medidoresPorEstado };
  }

  for (const medidor of data) {
    const tipo = medidor.tipo || 'Sin Tipo';
    medidoresPorTipo[tipo] = (medidoresPorTipo[tipo] || 0) + 1;

    const estado = medidor.estado || 'Sin Estado';
    medidoresPorEstado[estado] = (medidoresPorEstado[estado] || 0) + 1;
  }

  return { porTipo: medidoresPorTipo, porEstado: medidoresPorEstado };
};


const procesarAcometidasPorSector = (
  response: any
): { [key: string]: number } => {
  const acometidasPorSector: { [key: string]: number } = {};
  let acometidasData: any[] = [];

  if (!response.data) return acometidasPorSector;

  if (Array.isArray(response.data)) {
    acometidasData = response.data;
  } else if (
    typeof response.data === 'object' &&
    'data' in response.data &&
    Array.isArray(response.data.data)
  ) {
    acometidasData = response.data.data;
  }

  for (const acometida of acometidasData) {
    const sector = acometida.sectorDescripcion || 'Sin Sector';
    acometidasPorSector[sector] = (acometidasPorSector[sector] || 0) + 1;
  }

  return acometidasPorSector;
};


const renderDonutLabel =
  (value: number, label: string = 'Total') =>
  ({ viewBox }: any) => {
    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
      return (
        <text
          x={viewBox.cx}
          y={viewBox.cy}
          textAnchor='middle'
          dominantBaseline='middle'
        >
          <tspan
            x={viewBox.cx}
            y={viewBox.cy}
            className='fill-foreground text-2xl font-black'
          >
            {value.toLocaleString()}
          </tspan>
          <tspan
            x={viewBox.cx}
            y={(viewBox.cy || 0) + 18}
            className='fill-muted-foreground text-[0.6rem] font-bold uppercase tracking-widest'
          >
            {label}
          </tspan>
        </text>
      );
    }
  };


const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;


const LoadingSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className='flex items-center justify-center h-[200px] sm:h-[220px]'>
    <div className='space-y-3 w-full'>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className='flex justify-between items-center'>
          <div className='h-2.5 bg-muted animate-pulse rounded-sm w-20 sm:w-24' />
          <div className='h-4 bg-muted animate-pulse rounded-sm w-10 sm:w-14' />
        </div>
      ))}
    </div>
  </div>
);


const AnalyticsCard = ({
  icon: Icon,
  title,
  children,
  delay = 0
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay, ease: mechanicalEase }}
  >
    <Card className='flex flex-col overflow-hidden'>
      <CardHeader className='pb-2 sm:pb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground'>
            <Icon className='h-3.5 w-3.5' />
          </div>
          <CardTitle className='text-xs font-bold tracking-wide uppercase'>
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className='flex-1 pb-3'>{children}</CardContent>
    </Card>
  </motion.div>
);


const AdminAnalyticsComponent = React.memo(() => {
  const [analyticsData, setAnalyticsData] = useState({
    contratosPorTipo: {} as { [key: string]: number },
    clientesPorTipo: { empresa: 0, persona: 0 },
    medidoresPorTipo: {} as { [key: string]: number },
    medidoresPorEstado: {} as { [key: string]: number },
    acometidasPorSector: {} as { [key: string]: number },
    loading: true
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const [contratosRes, clientesRes, medidoresRes, acometidasRes] =
          await Promise.all([
            api.get('contratos/buscar'),
            api.get('clientes/buscar'),
            api.get('medidores/buscar'),
            api.get('acometidas/buscar')
          ]);

        const contratosPorTipo = procesarContratosPorTipo(
          contratosRes.data as any[]
        );
        const clientesPorTipo = procesarClientesPorTipo(
          clientesRes.data as any[]
        );
        const { porTipo: medidoresPorTipo, porEstado: medidoresPorEstado } =
          procesarMedidores(medidoresRes.data as any[]);
        const acometidasPorSector = procesarAcometidasPorSector(acometidasRes);

        setAnalyticsData({
          contratosPorTipo,
          clientesPorTipo,
          medidoresPorTipo,
          medidoresPorEstado,
          acometidasPorSector,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setAnalyticsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalyticsData();
  }, []);

  const getBadgeVariant = (
    estado: string
  ): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (estado.toLowerCase()) {
      case 'activo':
      case 'operativo':
      case 'funcionando':
        return 'default';
      case 'inactivo':
      case 'fuera de servicio':
        return 'destructive';
      case 'mantenimiento':
      case 'reparación':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const contratosChartConfig = {
    cantidad: { label: 'Cantidad' }
  } satisfies ChartConfig;

  const clientesChartConfig = {
    cantidad: { label: 'Cantidad' }
  } satisfies ChartConfig;

  const acometidasChartConfig = {
    cantidad: { label: 'Cantidad' }
  } satisfies ChartConfig;

  const chartContratosData = Object.entries(analyticsData.contratosPorTipo)
    .sort(([, a], [, b]) => b - a)
    .map(([tipo, cantidad], index) => ({
      tipo,
      cantidad,
      fill: `var(--chart-${(index % 5) + 1})`
    }));

  const chartClientesData = [
    {
      tipo: 'empresas',
      cantidad: analyticsData.clientesPorTipo.empresa,
      fill: 'var(--chart-1)'
    },
    {
      tipo: 'personas',
      cantidad: analyticsData.clientesPorTipo.persona,
      fill: 'var(--chart-2)'
    }
  ];

  const chartAcometidasData = Object.entries(analyticsData.acometidasPorSector)
    .sort(([, a], [, b]) => b - a)
    .map(([sector, cantidad], index) => ({
      sector,
      cantidad,
      fill: `var(--chart-${(index % 5) + 1})`
    }));

  const totalContratos = Object.values(analyticsData.contratosPorTipo).reduce(
    (acc, curr) => acc + curr,
    0
  );
  const totalClientes =
    analyticsData.clientesPorTipo.empresa +
    analyticsData.clientesPorTipo.persona;

  return (
    <div className='grid gap-3 sm:grid-cols-1 lg:grid-cols-2'>
      {/* Contratos por Tipo */}
      <AnalyticsCard icon={FileText} title='Contratos por Tipo' delay={0.1}>
        {analyticsData.loading ? (
          <LoadingSkeleton />
        ) : (
          <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
            <ChartContainer
              config={contratosChartConfig}
              className='mx-auto aspect-square max-h-[150px] sm:max-h-[190px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto'
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartContratosData}
                  dataKey='cantidad'
                  nameKey='tipo'
                  innerRadius={50}
                  strokeWidth={2}
                >
                  <Label content={renderDonutLabel(totalContratos)} />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className='space-y-1.5 flex-1 min-w-0 w-full sm:w-auto'>
              {chartContratosData.slice(0, 4).map(item => (
                <div
                  key={item.tipo}
                  className='flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors'
                >
                  <div className='flex items-center gap-2 min-w-0'>
                    <div
                      className='w-2 h-2 rounded-sm shrink-0'
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className='text-xs font-medium truncate'>
                      {item.tipo}
                    </span>
                  </div>
                  <span className='text-sm font-bold font-mono tabular-nums shrink-0'>
                    <NumberFlow value={item.cantidad} plugins={[continuous]} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnalyticsCard>

      {/* Clientes por Tipo */}
      <AnalyticsCard icon={Users} title='Clientes por Tipo' delay={0.15}>
        {analyticsData.loading ? (
          <LoadingSkeleton rows={2} />
        ) : (
          <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
            <ChartContainer
              config={clientesChartConfig}
              className='mx-auto aspect-square max-h-[150px] sm:max-h-[190px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto'
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartClientesData}
                  dataKey='cantidad'
                  nameKey='tipo'
                  innerRadius={50}
                  strokeWidth={2}
                >
                  <Label content={renderDonutLabel(totalClientes)} />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className='space-y-2 flex-1 w-full sm:w-auto'>
              {chartClientesData.map(item => (
                <div
                  key={item.tipo}
                  className='flex justify-between items-center py-1.5 px-2 rounded-sm hover:bg-accent/40 transition-colors'
                >
                  <div className='flex items-center gap-2'>
                    {item.tipo === 'empresas' ? (
                      <Building className='h-3.5 w-3.5 text-chart-1' />
                    ) : (
                      <User className='h-3.5 w-3.5 text-chart-2' />
                    )}
                    <span className='text-xs font-medium'>
                      {item.tipo === 'empresas' ? 'Empresas' : 'Personas'}
                    </span>
                  </div>
                  <span className='text-sm font-bold font-mono tabular-nums'>
                    <NumberFlow value={item.cantidad} plugins={[continuous]} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnalyticsCard>

      {/* Medidores por Tipo y Estado */}
      <AnalyticsCard icon={Activity} title='Medidores' delay={0.2}>
        {analyticsData.loading ? (
          <LoadingSkeleton rows={4} />
        ) : (
          <div className='space-y-4'>
            {/* Por Tipo */}
            <div>
              <div className='flex items-center gap-1.5 mb-2'>
                <Settings className='h-3 w-3 text-muted-foreground' />
                <span className='text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground'>
                  Por Tipo
                </span>
              </div>
              <div className='space-y-1'>
                {Object.entries(analyticsData.medidoresPorTipo)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([tipo, cantidad], index) => (
                    <div
                      key={tipo}
                      className='flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors'
                    >
                      <div className='flex items-center gap-2 min-w-0'>
                        <div
                          className='w-2 h-2 rounded-sm'
                          style={{
                            backgroundColor: `var(--chart-${(index % 5) + 1})`
                          }}
                        />
                        <span className='truncate'>{tipo}</span>
                      </div>
                      <span className='font-bold font-mono tabular-nums shrink-0'>
                        <NumberFlow value={cantidad} plugins={[continuous]} />
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className='industrial-divider' />

            {/* Por Estado */}
            <div>
              <div className='flex items-center gap-1.5 mb-2'>
                <CheckCircle className='h-3 w-3 text-muted-foreground' />
                <span className='text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground'>
                  Por Estado
                </span>
              </div>
              <div className='space-y-1'>
                {Object.entries(analyticsData.medidoresPorEstado)
                  .sort(([, a], [, b]) => b - a)
                  .map(([estado, cantidad]) => (
                    <div
                      key={estado}
                      className='flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors'
                    >
                      <Badge
                        variant={getBadgeVariant(estado)}
                        className='text-[0.6rem] px-1.5 py-0 h-5 font-bold tracking-wide'
                      >
                        <span className='truncate max-w-20 sm:max-w-none'>
                          {estado}
                        </span>
                      </Badge>
                      <span className='font-bold font-mono tabular-nums shrink-0'>
                        <NumberFlow value={cantidad} plugins={[continuous]} />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </AnalyticsCard>

      {/* Acometidas por Sector */}
      <AnalyticsCard icon={Power} title='Acometidas por Sector' delay={0.25}>
        {analyticsData.loading ? (
          <LoadingSkeleton rows={4} />
        ) : (
          <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
            <ChartContainer
              config={acometidasChartConfig}
              className='mx-auto aspect-square max-h-[150px] sm:max-h-[190px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto'
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartAcometidasData}
                  dataKey='cantidad'
                  nameKey='sector'
                  innerRadius={50}
                  strokeWidth={2}
                >
                  <Label
                    content={renderDonutLabel(
                      Object.values(analyticsData.acometidasPorSector).reduce(
                        (acc, curr) => acc + curr,
                        0
                      )
                    )}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className='space-y-1.5 flex-1 min-w-0 w-full sm:w-auto'>
              {chartAcometidasData.slice(0, 5).map(item => (
                <div
                  key={item.sector}
                  className='flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors'
                >
                  <div className='flex items-center gap-2 min-w-0'>
                    <div
                      className='w-2 h-2 rounded-sm shrink-0'
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className='text-xs font-medium truncate'>
                      {item.sector}
                    </span>
                  </div>
                  <span className='text-sm font-bold font-mono tabular-nums shrink-0'>
                    <NumberFlow value={item.cantidad} plugins={[continuous]} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnalyticsCard>
    </div>
  );
});


const renderPeriodoActual = (
  loading: boolean,
  periodoActual: { mes: number; anio: number; estado: string }
) => {
  if (loading) {
    return <span className='animate-pulse text-muted-foreground'>---</span>;
  }

  if (periodoActual.mes > 0) {
    return (
      <span>
        {periodoActual.mes.toString().padStart(2, '0')}/{periodoActual.anio}
      </span>
    );
  }

  return <span className='text-sm text-destructive'>Sin período</span>;
};

export default function DashboardComponent() {
  usePrefetchMultiple(
    [
      '/dashboard/administracion/contratos',
      '/dashboard/administracion/clientes',
      '/dashboard/administracion/medidores',
      '/dashboard/monitor/lecturas',
      '/dashboard/operaciones/periodo-facturacion'
    ],
    2000,
    1000
  );

  const [dashboardData, setDashboardData] = useState({
    periodoActual: { mes: 0, anio: 0, estado: 'Sin período' },
    lecturasPendientes: 0,
    totalesCorte: {
      pendiente: 0,
      liberado: 0,
      cortado: 0,
      reposicionSolicitada: 0,
      total: 0
    },
    fechaHora: new Date(),
    loading: false
  });

  const [displayData, setDisplayData] = useState({
    lecturasPendientes: 0,
    totalesCorte: {
      pendiente: 0,
      liberado: 0,
      cortado: 0,
      reposicionSolicitada: 0,
      total: 0
    },
    limiteInvierno: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setDashboardData(prev => ({ ...prev, fechaHora: new Date() }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  
  const statCards = [
    {
      label: 'Período Actual',
      icon: FileText,
      accentClass: 'border-t-energy',
      content: (
        <div className='text-2xl sm:text-3xl font-black font-mono tracking-tight'>
          {renderPeriodoActual(
            dashboardData.loading,
            dashboardData.periodoActual
          )}
        </div>
      ),
      sub: (
        <div className='flex gap-1.5'>
          {dashboardData.periodoActual.mes > 0 && !dashboardData.loading && (
            <div className='energy-dot-sm' />
          )}
          <span className='text-[0.65rem] text-muted-foreground uppercase tracking-wider font-bold'>
            {dashboardData.periodoActual.estado}
          </span>
        </div>
      )
    },
    {
      label: 'Sectores Pendientes',
      icon: Activity,
      accentClass: 'border-t-chart-1',
      content: (
        <div className='text-2xl sm:text-3xl font-black font-mono tracking-tight'>
          {dashboardData.loading ? (
            <span className='animate-pulse text-muted-foreground'>---</span>
          ) : (
            <NumberFlow
              value={displayData.lecturasPendientes}
              format={{
                useGrouping: true,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }}
              transformTiming={{
                duration: 1200,
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
              }}
              plugins={[continuous]}
              className='tabular-nums'
            />
          )}
        </div>
      ),
      sub: (
        <div>
          <span className='text-[0.65rem] text-muted-foreground uppercase tracking-wider font-bold'>
            Lecturas por procesar
          </span>
        </div>
      )
    },
    {
      label: 'Límite Invierno',
      icon: Snowflake,
      accentClass: 'border-t-chart-4',
      content: (
        <div className='text-2xl sm:text-3xl font-black font-mono tracking-tight'>
          {dashboardData.loading ? (
            <span className='animate-pulse text-muted-foreground'>---</span>
          ) : (
            <>
              <NumberFlow
                value={displayData.limiteInvierno}
                format={{
                  useGrouping: true,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }}
                transformTiming={{
                  duration: 1500,
                  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
                plugins={[continuous]}
                className='tabular-nums'
              />
              <span className='text-base font-light text-muted-foreground ml-1'>
                kWh
              </span>
            </>
          )}
        </div>
      ),
      sub: (
        <div>
          <span className='text-[0.65rem] text-muted-foreground uppercase tracking-wider font-bold'>
            Sobrecargo invierno
          </span>
        </div>
      )
    },
    {
      label: 'Cortes Totales',
      icon: Power,
      accentClass: 'border-t-destructive',
      content: (
        <div className='text-2xl sm:text-3xl font-black font-mono tracking-tight'>
          {dashboardData.loading ? (
            <span className='animate-pulse text-muted-foreground'>---</span>
          ) : (
            <NumberFlow
              value={displayData.totalesCorte.total}
              format={{
                useGrouping: true,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }}
              transformTiming={{
                duration: 1800,
                easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
              }}
              plugins={[continuous]}
              className='tabular-nums'
            />
          )}
        </div>
      ),
      sub: (
        <div className='flex items-center gap-2'>
          <span className='text-[0.6rem] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-destructive/10 text-destructive border border-destructive/20'>
            {displayData.totalesCorte.cortado} cortados
          </span>
          <span className='text-[0.6rem] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm bg-chart-2/10 text-chart-2 border border-chart-2/20'>
            {displayData.totalesCorte.liberado} liberados
          </span>
        </div>
      )
    }
  ];

  return (
    <div className='flex flex-col gap-4 sm:gap-5 p-3 sm:p-5 lg:p-6'>
      {/* ── Header del Dashboard ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: mechanicalEase }}
        className='flex items-center justify-between'
      >
        <div className='flex items-center gap-3'>
          <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary'>
            <Zap className='h-4 w-4 text-primary-foreground' />
          </div>
          <div>
            <h1 className='text-sm sm:text-base font-black tracking-tight uppercase'>
              Panel de Control
            </h1>
            <p className='text-[0.65rem] text-muted-foreground font-bold tracking-wider uppercase'>
              Resumen operacional
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <AnimatePresence>
          {statCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: index * 0.06,
                ease: mechanicalEase
              }}
            >
              <Card
                className={`border-t-2 ${card.accentClass} overflow-hidden h-full flex flex-col`}
              >
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4'>
                  <span className='text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground'>
                    {card.label}
                  </span>
                  <div className='flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground'>
                    <card.icon className='h-3.5 w-3.5' />
                  </div>
                </CardHeader>
                <CardContent className='px-4 pb-3 flex flex-col gap-1 flex-1'>
                  {card.content}
                  {card.sub}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3, ease: mechanicalEase }}
      >
        <div className='flex items-center gap-2.5 mb-3'>
          <div className='flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground'>
            <Zap className='h-3.5 w-3.5' />
          </div>
          <span className='text-xs font-bold tracking-wide uppercase'>
            Accesos Rápidos
          </span>
        </div>
        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
          {quickActions.map((action, index) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.2,
                delay: 0.35 + index * 0.04,
                ease: mechanicalEase
              }}
            >
              <Link
                to={action.href}
                className={`group flex items-center gap-3 p-3 rounded-md border-l-2 ${action.accent} bg-card hover:bg-accent/40 transition-all duration-150 border border-l-2 border-border`}
              >
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent/80 text-accent-foreground transition-colors group-hover:bg-accent'>
                  <action.icon className='h-4 w-4' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-xs font-bold tracking-tight truncate'>
                    {action.title}
                  </div>
                  <div className='text-[0.65rem] text-muted-foreground truncate'>
                    {action.description}
                  </div>
                </div>
                <ArrowRight className='h-3 w-3 text-muted-foreground opacity-0 -translate-x-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 shrink-0' />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Divider ── */}
      <div className='industrial-divider' />

      {/* ── Analytics Panel ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5, ease: mechanicalEase }}
        className='space-y-3'
      >
        <div className='flex items-center gap-2.5'>
          <div className='flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-foreground'>
            <Settings className='h-3.5 w-3.5' />
          </div>
          <span className='text-xs font-bold tracking-wide uppercase'>
            Panel de Administración
          </span>
        </div>
        <AdminAnalyticsComponent />
      </motion.div>
    </div>
  );
}
