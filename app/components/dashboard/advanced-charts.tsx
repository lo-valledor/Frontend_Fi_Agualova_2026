'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';

// Datos para gráfico de crecimiento de usuarios
const userGrowthData = [
  { month: 'Ene', usuarios: 1200, nuevos: 120, activos: 980 },
  { month: 'Feb', usuarios: 1350, nuevos: 150, activos: 1100 },
  { month: 'Mar', usuarios: 1580, nuevos: 230, activos: 1280 },
  { month: 'Apr', usuarios: 1720, nuevos: 140, activos: 1420 },
  { month: 'May', usuarios: 1950, nuevos: 230, activos: 1650 },
  { month: 'Jun', usuarios: 2180, nuevos: 230, activos: 1880 },
];

// Datos para gráfico de distribución de dispositivos
const deviceData = [
  { name: 'Desktop', value: 45, color: '#0088FE' },
  { name: 'Mobile', value: 35, color: '#00C49F' },
  { name: 'Tablet', value: 20, color: '#FFBB28' },
];

// Datos para gráfico de rendimiento por hora
const hourlyData = [
  { hour: '00', visitas: 120, conversiones: 12 },
  { hour: '04', visitas: 80, conversiones: 8 },
  { hour: '08', visitas: 450, conversiones: 45 },
  { hour: '12', visitas: 680, conversiones: 68 },
  { hour: '16', visitas: 520, conversiones: 52 },
  { hour: '20', visitas: 380, conversiones: 38 },
];

export function AdvancedCharts() {
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {/* Gráfico de Crecimiento de Usuarios */}
      <Card className='col-span-2'>
        <CardHeader>
          <CardTitle>Crecimiento de Usuarios</CardTitle>
          <CardDescription>
            Evolución de usuarios totales, nuevos y activos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              usuarios: {
                label: 'Total Usuarios',
                color: 'hsl(var(--chart-1))',
              },
              nuevos: {
                label: 'Nuevos Usuarios',
                color: 'hsl(var(--chart-2))',
              },
              activos: {
                label: 'Usuarios Activos',
                color: 'hsl(var(--chart-3))',
              },
            }}
            className='h-[300px]'
          >
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={userGrowthData}>
                <XAxis dataKey='month' />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type='monotone'
                  dataKey='usuarios'
                  stackId='1'
                  stroke='var(--color-usuarios)'
                  fill='var(--color-usuarios)'
                  fillOpacity={0.8}
                />
                <Area
                  type='monotone'
                  dataKey='activos'
                  stackId='2'
                  stroke='var(--color-activos)'
                  fill='var(--color-activos)'
                  fillOpacity={0.6}
                />
                <Area
                  type='monotone'
                  dataKey='nuevos'
                  stackId='3'
                  stroke='var(--color-nuevos)'
                  fill='var(--color-nuevos)'
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Distribución de Dispositivos */}
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos</CardTitle>
          <CardDescription>
            Distribución por tipo de dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              desktop: {
                label: 'Desktop',
                color: '#0088FE',
              },
              mobile: {
                label: 'Mobile',
                color: '#00C49F',
              },
              tablet: {
                label: 'Tablet',
                color: '#FFBB28',
              },
            }}
            className='h-[250px]'
          >
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey='value'
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className='mt-4 space-y-2'>
            {deviceData.map((item, index) => (
              <div
                key={index}
                className='flex items-center justify-between text-sm'
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='h-3 w-3 rounded-full'
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}</span>
                </div>
                <span className='font-medium'>{item.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Rendimiento por Hora */}
      <Card className='col-span-full'>
        <CardHeader>
          <CardTitle>Rendimiento por Hora</CardTitle>
          <CardDescription>
            Visitas y conversiones durante el día
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              visitas: {
                label: 'Visitas',
                color: 'hsl(var(--chart-1))',
              },
              conversiones: {
                label: 'Conversiones',
                color: 'hsl(var(--chart-2))',
              },
            }}
            className='h-[200px]'
          >
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={hourlyData}>
                <XAxis dataKey='hour' />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey='visitas'
                  fill='var(--color-visitas)'
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey='conversiones'
                  fill='var(--color-conversiones)'
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
