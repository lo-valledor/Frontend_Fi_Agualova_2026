import NumberFlow, { continuous } from '@number-flow/react';
import {
  Activity,
  Building,
  CheckCircle,
  FileText,
  Power,
  Settings,
  User,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { Label, Pie, PieChart } from 'recharts';

import { Badge } from '~/components/ui/badge';
import { Card, CardContent } from '~/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import api from '~/lib/api';
import { cn } from '~/lib/utils';

const MECHANICAL_EASE = [0.25, 0.1, 0.25, 1] as const;

function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 py-1">
          <div className="w-2 h-2 rounded-sm bg-muted animate-pulse" />
          <div className="h-3 flex-1 bg-muted/50 rounded animate-pulse" />
          <div className="h-3 w-8 bg-muted/50 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function AnalyticsCard({
  icon: Icon,
  title,
  delay,
  children
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: MECHANICAL_EASE }}
    >
      <Card className="overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary transition-colors h-full">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="p-1 sm:p-1.5 rounded-md bg-primary/10 shrink-0">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="text-xs sm:text-sm font-semibold truncate">
              {title}
            </h3>
          </div>
          <div className={cn('min-h-[140px] sm:min-h-[180px]')}>{children}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Data processing helpers
function procesarContratosPorTipo(data: Array<{ tipoContrato?: string }>): {
  [key: string]: number;
} {
  return data.reduce(
    (acc, curr) => {
      const tipo = curr.tipoContrato ?? 'Sin tipo';
      acc[tipo] = (acc[tipo] ?? 0) + 1;
      return acc;
    },
    {} as { [key: string]: number }
  );
}

function procesarClientesPorTipo(data: Array<{ esEmpresa?: boolean }>): {
  empresa: number;
  persona: number;
} {
  return data.reduce(
    (acc, curr) => {
      if (curr.esEmpresa) acc.empresa += 1;
      else acc.persona += 1;
      return acc;
    },
    { empresa: 0, persona: 0 }
  );
}

function procesarMedidores(
  data: Array<{
    tipoMedidor?: string;
    estado?: string;
  }>
): {
  porTipo: { [key: string]: number };
  porEstado: { [key: string]: number };
} {
  return data.reduce(
    (acc, curr) => {
      const tipo = curr.tipoMedidor ?? 'Sin tipo';
      const estado = curr.estado ?? 'Sin estado';
      acc.porTipo[tipo] = (acc.porTipo[tipo] ?? 0) + 1;
      acc.porEstado[estado] = (acc.porEstado[estado] ?? 0) + 1;
      return acc;
    },
    {
      porTipo: {} as { [key: string]: number },
      porEstado: {} as { [key: string]: number }
    }
  );
}

function procesarAcometidasPorSector(data: Array<{ sector?: string }>): {
  [key: string]: number;
} {
  return data.reduce(
    (acc, curr) => {
      const sector = curr.sector ?? 'Sin sector';
      acc[sector] = (acc[sector] ?? 0) + 1;
      return acc;
    },
    {} as { [key: string]: number }
  );
}

function renderDonutLabel(total: number) {
  return function LabelContent({ viewBox }: { viewBox?: unknown }) {
    const vb = viewBox as { cx?: number; cy?: number } | undefined;
    if (!vb || vb.cx === undefined || vb.cy === undefined) return null;
    return (
      <text x={vb.cx} y={vb.cy} textAnchor="middle" dominantBaseline="middle">
        <tspan
          x={vb.cx}
          y={vb.cy}
          className="fill-foreground text-xl sm:text-2xl font-bold font-mono"
        >
          {total}
        </tspan>
        <tspan
          x={vb.cx}
          y={(vb.cy ?? 0) + 18}
          className="fill-muted-foreground text-[0.6rem] sm:text-xs"
        >
          Total
        </tspan>
      </text>
    );
  };
}

function getBadgeVariant(
  estado: string
): 'default' | 'destructive' | 'secondary' | 'outline' {
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
}

export const AdminAnalyticsComponent = React.memo(
  function AdminAnalyticsComponent() {
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
            contratosRes.data as Array<{ tipoContrato?: string }>
          );
          const clientesPorTipo = procesarClientesPorTipo(
            clientesRes.data as Array<{ esEmpresa?: boolean }>
          );
          const { porTipo: medidoresPorTipo, porEstado: medidoresPorEstado } =
            procesarMedidores(
              medidoresRes.data as Array<{
                tipoMedidor?: string;
                estado?: string;
              }>
            );
          const acometidasPorSector = procesarAcometidasPorSector(
            (acometidasRes.data ?? []) as Array<{ sector?: string }>
          );

          setAnalyticsData({
            contratosPorTipo,
            clientesPorTipo,
            medidoresPorTipo,
            medidoresPorEstado,
            acometidasPorSector,
            loading: false
          });
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Error fetching analytics data:', error);
          }
          setAnalyticsData(prev => ({ ...prev, loading: false }));
        }
      };

      fetchAnalyticsData();
    }, []);

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

    const chartAcometidasData = Object.entries(
      analyticsData.acometidasPorSector
    )
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
      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
        <AnalyticsCard icon={FileText} title="Contratos por Tipo" delay={0.1}>
          {analyticsData.loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <ChartContainer
                config={contratosChartConfig}
                className="mx-auto aspect-square max-h-[150px] sm:max-h-[190px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartContratosData}
                    dataKey="cantidad"
                    nameKey="tipo"
                    innerRadius={50}
                    strokeWidth={2}
                  >
                    <Label content={renderDonutLabel(totalContratos)} />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="space-y-1.5 flex-1 min-w-0 w-full sm:w-auto">
                {chartContratosData.slice(0, 4).map(item => (
                  <div
                    key={item.tipo}
                    className="flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-sm shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-xs font-medium truncate">
                        {item.tipo}
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono tabular-nums shrink-0">
                      <NumberFlow
                        value={item.cantidad}
                        plugins={[continuous]}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnalyticsCard>

        <AnalyticsCard icon={Users} title="Clientes por Tipo" delay={0.15}>
          {analyticsData.loading ? (
            <LoadingSkeleton rows={2} />
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <ChartContainer
                config={clientesChartConfig}
                className="mx-auto aspect-square max-h-[150px] sm:max-h-[190px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartClientesData}
                    dataKey="cantidad"
                    nameKey="tipo"
                    innerRadius={50}
                    strokeWidth={2}
                  >
                    <Label content={renderDonutLabel(totalClientes)} />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="space-y-2 flex-1 w-full sm:w-auto">
                {chartClientesData.map(item => (
                  <div
                    key={item.tipo}
                    className="flex justify-between items-center py-1.5 px-2 rounded-sm hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {item.tipo === 'empresas' ? (
                        <Building className="h-3.5 w-3.5 text-chart-1" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-chart-2" />
                      )}
                      <span className="text-xs font-medium">
                        {item.tipo === 'empresas' ? 'Empresas' : 'Personas'}
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono tabular-nums">
                      <NumberFlow
                        value={item.cantidad}
                        plugins={[continuous]}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnalyticsCard>

        <AnalyticsCard icon={Activity} title="Medidores" delay={0.2}>
          {analyticsData.loading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Settings className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground">
                    Por Tipo
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(analyticsData.medidoresPorTipo)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([tipo, cantidad], index) => (
                      <div
                        key={tipo}
                        className="flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2 h-2 rounded-sm"
                            style={{
                              backgroundColor: `var(--chart-${(index % 5) + 1})`
                            }}
                          />
                          <span className="truncate">{tipo}</span>
                        </div>
                        <span className="font-bold font-mono tabular-nums shrink-0">
                          <NumberFlow value={cantidad} plugins={[continuous]} />
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="industrial-divider" />

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground">
                    Por Estado
                  </span>
                </div>
                <div className="space-y-1">
                  {Object.entries(analyticsData.medidoresPorEstado)
                    .sort(([, a], [, b]) => b - a)
                    .map(([estado, cantidad]) => (
                      <div
                        key={estado}
                        className="flex justify-between items-center text-xs py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors"
                      >
                        <Badge
                          variant={getBadgeVariant(estado)}
                          className="text-[0.6rem] px-1.5 py-0 h-5 font-bold tracking-wide"
                        >
                          <span className="truncate max-w-20 sm:max-w-none">
                            {estado}
                          </span>
                        </Badge>
                        <span className="font-bold font-mono tabular-nums shrink-0">
                          <NumberFlow value={cantidad} plugins={[continuous]} />
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </AnalyticsCard>

        <AnalyticsCard icon={Power} title="Acometidas por Sector" delay={0.25}>
          {analyticsData.loading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <ChartContainer
                config={acometidasChartConfig}
                className="mx-auto aspect-square max-h-[150px] sm:max-h-[190px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartAcometidasData}
                    dataKey="cantidad"
                    nameKey="sector"
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

              <div className="space-y-1.5 flex-1 min-w-0 w-full sm:w-auto">
                {chartAcometidasData.slice(0, 5).map(item => (
                  <div
                    key={item.sector}
                    className="flex justify-between items-center py-1 px-2 rounded-sm hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-sm shrink-0"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-xs font-medium truncate">
                        {item.sector}
                      </span>
                    </div>
                    <span className="text-sm font-bold font-mono tabular-nums shrink-0">
                      <NumberFlow
                        value={item.cantidad}
                        plugins={[continuous]}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnalyticsCard>
      </div>
    );
  }
);
