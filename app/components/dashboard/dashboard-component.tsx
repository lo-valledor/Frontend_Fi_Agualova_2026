import NumberFlow, { continuous } from '@number-flow/react';
import {
  Activity,
  Building,
  CheckCircle,
  FileText,
  Package,
  PlusCircle,
  Power,
  Settings,
  Snowflake,
  User,
  Users
} from 'lucide-react';
import { Label, Pie, PieChart } from 'recharts';

import React, { useEffect, useState } from 'react';

import { Link } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import api from '~/lib/api';
import type { GetLimiteInvierno } from '~/types/administracion';
import type {
  PeriodoAbierto,
  TotalesCorteReposicion,
  ValidarSectoresPendientes
} from '~/types/operaciones';

// Datos de atajos rápidos
const quickActions = [
  {
    title: 'Monitor de Lecturas',
    description: 'Visualizar y gestionar lecturas de medidores',
    icon: Activity,
    color: 'bg-blue-500',
    href: '/dashboard/monitor/monitor-lecturas'
  },
  {
    title: 'Nuevo Contrato',
    description: 'Registrar un nuevo contrato de servicio',
    icon: FileText,
    color: 'bg-green-500',
    href: '/dashboard/administracion/contratos/crear'
  },
  {
    title: 'Periodo Facturación',
    description: 'Gestionar periodos de facturación',
    icon: Settings,
    color: 'bg-purple-500',
    href: '/dashboard/operaciones/periodo-facturacion'
  },
  {
    title: 'Agregar Cliente',
    description: 'Registrar un nuevo cliente en el sistema',
    icon: Users,
    color: 'bg-orange-500',
    href: '/dashboard/administracion/clientes/crear'
  },
  {
    title: 'Registrar Medidor',
    description: 'Añadir nuevo medidor al inventario',
    icon: Package,
    color: 'bg-teal-500',
    href: '/dashboard/administracion/medidores/crear'
  },
  {
    title: 'Preparar Lecturas',
    description: 'Configurar lecturas para el periodo',
    icon: PlusCircle,
    color: 'bg-indigo-500',
    href: '/dashboard/operaciones/preparar-lecturas'
  }
];

// Componente de Análisis de Administración
const AdminAnalyticsComponent = () => {
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
            api.get('contrato/buscar'),
            api.get('ClienteBuscar'),
            api.get('buscarMedidor'),
            api.get('buscar-Acometida')
          ]);

        // Procesar contratos por tipo
        const contratosPorTipo: { [key: string]: number } = {};
        if (Array.isArray(contratosRes.data)) {
          contratosRes.data.forEach((contrato: any) => {
            const tipo = contrato.tipoContrato || 'Sin Tipo';
            contratosPorTipo[tipo] = (contratosPorTipo[tipo] || 0) + 1;
          });
        }

        // Procesar clientes por tipo (empresa/persona)
        let empresas = 0;
        let personas = 0;
        if (Array.isArray(clientesRes.data)) {
          clientesRes.data.forEach((cliente: any) => {
            if (cliente.esEmpresa) {
              empresas++;
            } else {
              personas++;
            }
          });
        }

        // Procesar medidores por tipo y estado
        const medidoresPorTipo: { [key: string]: number } = {};
        const medidoresPorEstado: { [key: string]: number } = {};
        if (Array.isArray(medidoresRes.data)) {
          medidoresRes.data.forEach((medidor: any) => {
            const tipo = medidor.tipo || 'Sin Tipo';
            medidoresPorTipo[tipo] = (medidoresPorTipo[tipo] || 0) + 1;

            const estado = medidor.estado || 'Sin Estado';
            medidoresPorEstado[estado] = (medidoresPorEstado[estado] || 0) + 1;
          });
        }

        // Procesar acometidas por sector
        const acometidasPorSector: { [key: string]: number } = {};
        let acometidasData: any[] = [];

        if (acometidasRes.data) {
          if (Array.isArray(acometidasRes.data)) {
            acometidasData = acometidasRes.data;
          } else if (
            typeof acometidasRes.data === 'object' &&
            'data' in acometidasRes.data &&
            Array.isArray(acometidasRes.data.data)
          ) {
            acometidasData = acometidasRes.data.data;
          }
        }

        acometidasData.forEach((acometida: any) => {
          const sector = acometida.sectorDescripcion || 'Sin Sector';
          acometidasPorSector[sector] = (acometidasPorSector[sector] || 0) + 1;
        });

        setAnalyticsData({
          contratosPorTipo,
          clientesPorTipo: { empresa: empresas, persona: personas },
          medidoresPorTipo,
          medidoresPorEstado,
          acometidasPorSector,
          loading: false
        });
      } catch (error) {
        console.error('Error al cargar datos de análisis:', error);
        setAnalyticsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAnalyticsData();
  }, []);

  const getColorForIndex = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-orange-500',
      'bg-teal-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500'
    ];
    return colors[index % colors.length];
  };

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

  // Configuraciones de chart simplificadas
  const contratosChartConfig = {
    cantidad: { label: 'Cantidad' }
  } satisfies ChartConfig;

  const clientesChartConfig = {
    cantidad: { label: 'Cantidad' }
  } satisfies ChartConfig;

  const acometidasChartConfig = {
    cantidad: { label: 'Cantidad' }
  } satisfies ChartConfig;

  // Preparar datos para gráficos de donut
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
    <div className='grid gap-4 sm:grid-cols-1 lg:grid-cols-2'>
      {/* Contratos por Tipo */}
      <Card className='flex flex-col'>
        <CardHeader className='items-center pb-2 sm:pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
            <FileText className='h-4 w-4 sm:h-5 sm:w-5 text-blue-500' />
            Contratos por Tipo
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm text-center'>
            Distribución de contratos según su tipo de servicio
          </CardDescription>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
          {analyticsData.loading ? (
            <div className='flex items-center justify-center h-[200px] sm:h-[250px]'>
              <div className='space-y-3 w-full'>
                {[1, 2, 3].map(i => (
                  <div key={i} className='flex justify-between items-center'>
                    <div className='h-3 sm:h-4 bg-muted animate-pulse rounded w-20 sm:w-24'></div>
                    <div className='h-4 sm:h-6 bg-muted animate-pulse rounded w-12 sm:w-16'></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
              {/* Gráfico Donut */}
              <ChartContainer
                config={contratosChartConfig}
                className='mx-auto aspect-square max-h-[150px] sm:max-h-[200px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto'
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
                    <Label
                      content={({ viewBox }) => {
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
                                className='fill-foreground text-2xl font-bold'
                              >
                                {totalContratos.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className='fill-muted-foreground text-sm'
                              >
                                Total
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Lista de datos */}
              <div className='space-y-1 sm:space-y-2 flex-1 min-w-0 w-full sm:w-auto'>
                {chartContratosData.slice(0, 4).map(item => (
                  <div
                    key={item.tipo}
                    className='flex justify-between items-center p-2 sm:p-0'
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      <div
                        className='w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0'
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className='text-xs sm:text-sm font-medium truncate'>
                        {item.tipo}
                      </span>
                    </div>
                    <div className='text-sm sm:text-lg font-bold flex-shrink-0'>
                      <NumberFlow
                        value={item.cantidad}
                        plugins={[continuous]}
                        className='tabular-nums'
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clientes por Tipo */}
      <Card className='flex flex-col'>
        <CardHeader className='items-center pb-2 sm:pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
            <Users className='h-4 w-4 sm:h-5 sm:w-5 text-green-500' />
            Clientes por Tipo
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm text-center'>
            Clasificación entre empresas y personas naturales
          </CardDescription>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
          {analyticsData.loading ? (
            <div className='flex items-center justify-center h-[200px] sm:h-[250px]'>
              <div className='space-y-3 sm:space-y-4 w-full'>
                {[1, 2].map(i => (
                  <div key={i} className='flex justify-between items-center'>
                    <div className='h-3 sm:h-4 bg-muted animate-pulse rounded w-16 sm:w-20'></div>
                    <div className='h-4 sm:h-6 bg-muted animate-pulse rounded w-12 sm:w-16'></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
              {/* Gráfico Donut */}
              <ChartContainer
                config={clientesChartConfig}
                className='mx-auto aspect-square max-h-[150px] sm:max-h-[200px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto'
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
                    <Label
                      content={({ viewBox }) => {
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
                                className='fill-foreground text-2xl font-bold'
                              >
                                {totalClientes.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className='fill-muted-foreground text-sm'
                              >
                                Total
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Lista de datos */}
              <div className='space-y-3 sm:space-y-4 flex-1 w-full sm:w-auto'>
                {chartClientesData.map(item => (
                  <div
                    key={item.tipo}
                    className='flex justify-between items-center p-2 sm:p-0'
                  >
                    <div className='flex items-center gap-2'>
                      {item.tipo === 'empresas' ? (
                        <Building className='h-3 w-3 sm:h-4 sm:w-4 text-blue-500' />
                      ) : (
                        <User className='h-3 w-3 sm:h-4 sm:w-4 text-orange-500' />
                      )}
                      <span className='text-xs sm:text-sm font-medium'>
                        {item.tipo === 'empresas' ? 'Empresas' : 'Personas'}
                      </span>
                    </div>
                    <div className='text-sm sm:text-lg font-bold'>
                      <NumberFlow
                        value={item.cantidad}
                        plugins={[continuous]}
                        className='tabular-nums'
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medidores por Tipo y Estado */}
      <Card>
        <CardHeader className='pb-3 sm:pb-6'>
          <CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
            <Activity className='h-4 w-4 sm:h-5 sm:w-5 text-purple-500' />
            Medidores por Tipo y Estado
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            Distribución de medidores según tipo y estado operativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.loading ? (
            <div className='space-y-3 sm:space-y-4'>
              <div className='space-y-2'>
                <div className='h-3 sm:h-4 bg-muted animate-pulse rounded w-16 sm:w-20'></div>
                <div className='space-y-1'>
                  {[1, 2].map(i => (
                    <div key={i} className='flex justify-between'>
                      <div className='h-2 sm:h-3 bg-muted animate-pulse rounded w-12 sm:w-16'></div>
                      <div className='h-2 sm:h-3 bg-muted animate-pulse rounded w-6 sm:w-8'></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className='space-y-3 sm:space-y-4'>
              {/* Por Tipo */}
              <div>
                <h4 className='text-xs sm:text-sm font-semibold mb-2 flex items-center gap-1'>
                  <Settings className='h-3 w-3' />
                  Por Tipo
                </h4>
                <div className='space-y-1 sm:space-y-2'>
                  {Object.entries(analyticsData.medidoresPorTipo)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([tipo, cantidad], index) => (
                      <div
                        key={tipo}
                        className='flex justify-between items-center text-xs sm:text-sm p-1 sm:p-0'
                      >
                        <div className='flex items-center gap-2 min-w-0'>
                          <div
                            className={`w-2 h-2 rounded-full ${getColorForIndex(index)}`}
                          ></div>
                          <span className='truncate'>{tipo}</span>
                        </div>
                        <NumberFlow
                          value={cantidad}
                          plugins={[continuous]}
                          className='tabular-nums font-medium flex-shrink-0'
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Por Estado */}
              <div>
                <h4 className='text-xs sm:text-sm font-semibold mb-2 flex items-center gap-1'>
                  <CheckCircle className='h-3 w-3' />
                  Por Estado
                </h4>
                <div className='space-y-1 sm:space-y-2'>
                  {Object.entries(analyticsData.medidoresPorEstado)
                    .sort(([, a], [, b]) => b - a)
                    .map(([estado, cantidad]) => (
                      <div
                        key={estado}
                        className='flex justify-between items-center text-xs sm:text-sm p-1 sm:p-0'
                      >
                        <Badge
                          variant={getBadgeVariant(estado)}
                          className='text-xs px-1 sm:px-2'
                        >
                          <span className='truncate max-w-[80px] sm:max-w-none'>
                            {estado}
                          </span>
                        </Badge>
                        <NumberFlow
                          value={cantidad}
                          plugins={[continuous]}
                          className='tabular-nums font-medium flex-shrink-0'
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acometidas por Sector */}
      <Card className='flex flex-col'>
        <CardHeader className='items-center pb-2 sm:pb-0'>
          <CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
            <Power className='h-4 w-4 sm:h-5 sm:w-5 text-orange-500' />
            Acometidas por Sector
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm text-center'>
            Distribución geográfica de puntos de suministro
          </CardDescription>
        </CardHeader>
        <CardContent className='flex-1 pb-0'>
          {analyticsData.loading ? (
            <div className='flex items-center justify-center h-[200px] sm:h-[250px]'>
              <div className='space-y-3 w-full'>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className='flex justify-between items-center'>
                    <div className='h-3 sm:h-4 bg-muted animate-pulse rounded w-20 sm:w-28'></div>
                    <div className='h-4 sm:h-6 bg-muted animate-pulse rounded w-8 sm:w-12'></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
              {/* Gráfico Donut */}
              <ChartContainer
                config={acometidasChartConfig}
                className='mx-auto aspect-square max-h-[150px] sm:max-h-[200px] min-h-[120px] sm:min-h-[150px] w-full sm:w-auto'
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
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          const totalAcometidas = Object.values(
                            analyticsData.acometidasPorSector
                          ).reduce((acc, curr) => acc + curr, 0);
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
                                className='fill-foreground text-2xl font-bold'
                              >
                                {totalAcometidas.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className='fill-muted-foreground text-sm'
                              >
                                Total
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Lista de datos */}
              <div className='space-y-1 sm:space-y-2 flex-1 min-w-0 w-full sm:w-auto'>
                {chartAcometidasData.slice(0, 5).map(item => (
                  <div
                    key={item.sector}
                    className='flex justify-between items-center p-2 sm:p-0'
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      <div
                        className='w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0'
                        style={{ backgroundColor: item.fill }}
                      ></div>
                      <span className='text-xs sm:text-sm font-medium truncate'>
                        {item.sector}
                      </span>
                    </div>
                    <div className='text-sm sm:text-lg font-bold flex-shrink-0'>
                      <NumberFlow
                        value={item.cantidad}
                        plugins={[continuous]}
                        className='tabular-nums'
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function DashboardComponent({
  periodoAbierto,
  lecturasPendientes,
  corte,
  limiteInvierno
}: {
  periodoAbierto: PeriodoAbierto;
  lecturasPendientes: ValidarSectoresPendientes;
  corte: TotalesCorteReposicion;
  limiteInvierno: GetLimiteInvierno;
}) {
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
    loading: true
  });

  // Estados para mostrar los números desde 0
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

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setDashboardData(prev => ({ ...prev, fechaHora: new Date() }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const processDashboardData = () => {
      try {
        // Procesar período actual
        let periodoActual = { mes: 0, anio: 0, estado: 'Sin período abierto' };
        if (
          periodoAbierto &&
          Array.isArray(periodoAbierto) &&
          periodoAbierto.length > 0
        ) {
          const periodo = periodoAbierto[0];
          periodoActual = {
            mes: periodo.mes || 0,
            anio: periodo.anio || 0,
            estado: 'Abierto'
          };
        }

        // Procesar lecturas pendientes
        let lecturasPendientesCount = 0;
        if (
          lecturasPendientes &&
          typeof lecturasPendientes === 'object' &&
          'sinPendientes' in lecturasPendientes &&
          !lecturasPendientes.sinPendientes
        ) {
          lecturasPendientesCount = lecturasPendientes.totalPendientes || 0;
        }

        // Procesar totales de corte
        const totalesCorte = {
          pendiente: 0,
          liberado: 0,
          cortado: 0,
          reposicionSolicitada: 0,
          total: 0
        };

        if (corte && Array.isArray(corte)) {
          corte.forEach((item: any) => {
            switch (item.codigo) {
              case 'NULL':
                totalesCorte.pendiente = item.cantidad || 0;
                break;
              case '1':
                totalesCorte.liberado = item.cantidad || 0;
                break;
              case '2':
                totalesCorte.cortado = item.cantidad || 0;
                break;
              case '3':
                totalesCorte.reposicionSolicitada = item.cantidad || 0;
                break;
              case 'TOTAL':
                totalesCorte.total = item.cantidad || 0;
                break;
            }
          });
        }

        // Actualizar los datos reales
        setDashboardData(prev => ({
          ...prev,
          periodoActual,
          lecturasPendientes: lecturasPendientesCount,
          totalesCorte,
          loading: false
        }));

        // Pequeño delay para que se vea el estado de carga, luego animar desde 0
        setTimeout(() => {
          setDisplayData({
            lecturasPendientes: lecturasPendientesCount,
            totalesCorte,
            limiteInvierno: parseInt(limiteInvierno?.valor || '0', 10)
          });
        }, 100);
      } catch (_error) {
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    };

    processDashboardData();
  }, [periodoAbierto, lecturasPendientes, corte, limiteInvierno]);

  return (
    <div className='flex flex-col gap-3 sm:gap-4 py-3 sm:py-4 lg:gap-6 lg:py-6'>
      {/* Contenido Principal */}
      <div className='flex flex-1 flex-col gap-3 sm:gap-4 p-2 sm:p-4 pt-0'>
        {/* Estadísticas Principales */}
        <div className='grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Período Actual */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs sm:text-sm font-medium'>
                Período Actual
              </CardTitle>
              <FileText className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-lg sm:text-2xl font-bold font-mono'>
                {dashboardData.loading ? (
                  <span className='animate-pulse text-muted-foreground'>
                    ---
                  </span>
                ) : dashboardData.periodoActual.mes > 0 ? (
                  <span>
                    {dashboardData.periodoActual.mes
                      .toString()
                      .padStart(2, '0')}
                    /{dashboardData.periodoActual.anio}
                  </span>
                ) : (
                  <span className='text-sm sm:text-base text-red-500'>
                    Sin período
                  </span>
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                {dashboardData.periodoActual.estado}
              </p>
            </CardContent>
          </Card>

          {/* Lecturas Pendientes */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs sm:text-sm font-medium'>
                Lecturas Pendientes
              </CardTitle>
              <Activity className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-lg sm:text-2xl font-bold font-mono'>
                {dashboardData.loading ? (
                  <span className='animate-pulse text-muted-foreground'>
                    ---
                  </span>
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
              <p className='text-xs text-muted-foreground'>
                Sectores con lecturas por procesar
              </p>
            </CardContent>
          </Card>

          {/* Límite de Invierno */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs sm:text-sm font-medium'>
                Límite de Invierno
              </CardTitle>
              <Snowflake className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-lg sm:text-2xl font-bold font-mono'>
                {dashboardData.loading ? (
                  <span className='animate-pulse text-muted-foreground'>
                    ---
                  </span>
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
                    <span className='text-base sm:text-xl font-normal text-muted-foreground'>
                      {' '}
                      kWh
                    </span>
                  </>
                )}
              </div>
              <p className='text-xs text-muted-foreground'>
                Límite para sobrecargo de invierno
              </p>
            </CardContent>
          </Card>

          {/* Totales Corte */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs sm:text-sm font-medium'>
                Cortes Totales
              </CardTitle>
              <Power className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-lg sm:text-2xl font-bold font-mono'>
                {dashboardData.loading ? (
                  <span className='animate-pulse text-muted-foreground'>
                    ---
                  </span>
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
              <div className='flex flex-col sm:flex-row gap-1 sm:gap-2 mt-1'>
                <span className='text-xs px-2 py-1 bg-red-100 text-red-700 rounded dark:bg-red-900/30 dark:text-red-300 text-center'>
                  {displayData.totalesCorte.cortado} cortados
                </span>
                <span className='text-xs px-2 py-1 bg-green-100 text-green-700 rounded dark:bg-green-900/30 dark:text-green-300 text-center'>
                  {displayData.totalesCorte.liberado} liberados
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atajos Rápidos */}
        <Card>
          <CardHeader className='pb-3 sm:pb-6'>
            <CardTitle className='text-base sm:text-lg'>
              Atajos Rápidos
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm'>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant='outline'
                  className='h-auto flex-col items-start gap-2 p-3 sm:p-4 text-left hover:bg-muted/50'
                  asChild
                >
                  <Link to={action.href}>
                    <div className={`rounded-xl p-2 ${action.color}`}>
                      <action.icon className='h-3 w-3 sm:h-4 sm:w-4' />
                    </div>
                    <div>
                      <div className='font-semibold text-xs sm:text-sm'>
                        {action.title}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Panel de Control de Administración */}
        <div className='space-y-3 sm:space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-base sm:text-lg font-semibold'>
                Panel de Control de Administración
              </h2>
              <p className='text-xs sm:text-sm text-muted-foreground'>
                Análisis detallado de contratos, clientes, medidores y
                acometidas
              </p>
            </div>
          </div>
          <AdminAnalyticsComponent />
        </div>
      </div>
    </div>
  );
}
