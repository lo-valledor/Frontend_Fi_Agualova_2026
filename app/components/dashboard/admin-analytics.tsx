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

import { useEffect, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import api from '~/lib/api';
import type {
  Acometida,
  GetClientes,
  GetContratos,
  GetMedidores
} from '~/types/administracion';

interface AnalyticsData {
  contratosPorTipo: { [key: string]: number };
  clientesPorTipo: {
    empresa: number;
    persona: number;
  };
  medidoresPorTipo: { [key: string]: number };
  medidoresPorEstado: { [key: string]: number };
  acometidasPorSector: { [key: string]: number };
  loading: boolean;
}

export function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    contratosPorTipo: {},
    clientesPorTipo: { empresa: 0, persona: 0 },
    medidoresPorTipo: {},
    medidoresPorEstado: {},
    acometidasPorSector: {},
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
          contratosRes.data.forEach((contrato: GetContratos) => {
            const tipo = contrato.tipoContrato || 'Sin Tipo';
            contratosPorTipo[tipo] = (contratosPorTipo[tipo] || 0) + 1;
          });
        }

        // Procesar clientes por tipo (empresa/persona)
        let empresas = 0;
        let personas = 0;
        if (Array.isArray(clientesRes.data)) {
          clientesRes.data.forEach((cliente: GetClientes) => {
            if (cliente.esEmpresa) {
              empresas++;
            } else {
              personas++;
            }
          });
        }

        // Procesar medidores por tipo
        const medidoresPorTipo: { [key: string]: number } = {};
        const medidoresPorEstado: { [key: string]: number } = {};
        if (Array.isArray(medidoresRes.data)) {
          medidoresRes.data.forEach((medidor: GetMedidores) => {
            // Por tipo
            const tipo = medidor.tipo || 'Sin Tipo';
            medidoresPorTipo[tipo] = (medidoresPorTipo[tipo] || 0) + 1;

            // Por estado
            const estado = medidor.estado || 'Sin Estado';
            medidoresPorEstado[estado] = (medidoresPorEstado[estado] || 0) + 1;
          });
        }

        // Procesar acometidas por sector
        const acometidasPorSector: { [key: string]: number } = {};
        let acometidasData: Acometida[] = [];

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

        acometidasData.forEach((acometida: Acometida) => {
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

  const getBadgeVariant = (estado: string) => {
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

  return (
    <div className='grid gap-3 sm:gap-4 sm:grid-cols-1 lg:grid-cols-2'>
      {/* Contratos por Tipo */}
      <Card>
        <CardHeader className='p-3 sm:p-6'>
          <CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
            <FileText className='h-4 w-4 sm:h-5 sm:w-5 text-blue-500' />
            Contratos por Tipo
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            Distribución de contratos según su tipo de servicio
          </CardDescription>
        </CardHeader>
        <CardContent className='p-3 sm:p-6'>
          {analyticsData.loading ? (
            <div className='space-y-2 sm:space-y-3'>
              {[1, 2, 3].map(i => (
                <div key={i} className='flex justify-between items-center'>
                  <div className='h-3 sm:h-4 bg-muted animate-pulse rounded w-20 sm:w-24'></div>
                  <div className='h-5 sm:h-6 bg-muted animate-pulse rounded w-12 sm:w-16'></div>
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-2 sm:space-y-3'>
              {Object.entries(analyticsData.contratosPorTipo)
                .sort(([, a], [, b]) => b - a)
                .map(([tipo, cantidad], index) => (
                  <div key={tipo} className='flex justify-between items-center'>
                    <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
                      <div
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getColorForIndex(index)} flex-shrink-0`}
                      ></div>
                      <span className='text-xs sm:text-sm font-medium truncate'>
                        {tipo}
                      </span>
                    </div>
                    <div className='text-lg sm:text-xl font-bold flex-shrink-0'>
                      <NumberFlow
                        value={cantidad}
                        plugins={[continuous]}
                        className='tabular-nums'
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clientes por Tipo */}
      <Card>
        <CardHeader className='p-3 sm:p-6'>
          <CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
            <Users className='h-4 w-4 sm:h-5 sm:w-5 text-green-500' />
            Clientes por Tipo
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            Clasificación entre empresas y personas naturales
          </CardDescription>
        </CardHeader>
        <CardContent className='p-3 sm:p-6'>
          {analyticsData.loading ? (
            <div className='space-y-3 sm:space-y-4'>
              {[1, 2].map(i => (
                <div key={i} className='flex justify-between items-center'>
                  <div className='h-3 sm:h-4 bg-muted animate-pulse rounded w-16 sm:w-20'></div>
                  <div className='h-5 sm:h-6 bg-muted animate-pulse rounded w-12 sm:w-16'></div>
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-3 sm:space-y-4'>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
                  <Building className='h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0' />
                  <span className='text-xs sm:text-sm font-medium'>
                    Empresas
                  </span>
                </div>
                <div className='text-lg sm:text-xl font-bold flex-shrink-0'>
                  <NumberFlow
                    value={analyticsData.clientesPorTipo.empresa}
                    plugins={[continuous]}
                    className='tabular-nums'
                  />
                </div>
              </div>
              <div className='flex justify-between items-center'>
                <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
                  <User className='h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0' />
                  <span className='text-xs sm:text-sm font-medium'>
                    Personas
                  </span>
                </div>
                <div className='text-lg sm:text-xl font-bold flex-shrink-0'>
                  <NumberFlow
                    value={analyticsData.clientesPorTipo.persona}
                    plugins={[continuous]}
                    className='tabular-nums'
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medidores por Tipo y Estado */}
      <Card>
        <CardHeader className='p-3 sm:p-6'>
          <CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
            <Activity className='h-4 w-4 sm:h-5 sm:w-5 text-purple-500' />
            Medidores por Tipo y Estado
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            Distribución de medidores según tipo y estado operativo
          </CardDescription>
        </CardHeader>
        <CardContent className='p-3 sm:p-6'>
          {analyticsData.loading ? (
            <div className='space-y-3 sm:space-y-4'>
              <div className='space-y-1 sm:space-y-2'>
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
                <h4 className='text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 flex items-center gap-1'>
                  <Settings className='h-2.5 w-2.5 sm:h-3 sm:w-3' />
                  Por Tipo
                </h4>
                <div className='space-y-1.5 sm:space-y-2'>
                  {Object.entries(analyticsData.medidoresPorTipo)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([tipo, cantidad], index) => (
                      <div
                        key={tipo}
                        className='flex justify-between items-center text-xs sm:text-sm'
                      >
                        <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
                          <div
                            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getColorForIndex(index)} flex-shrink-0`}
                          ></div>
                          <span className='truncate'>{tipo}</span>
                        </div>
                        <NumberFlow
                          value={cantidad}
                          plugins={[continuous]}
                          className='tabular-nums font-medium'
                        />
                      </div>
                    ))}
                </div>
              </div>

              {/* Por Estado */}
              <div>
                <h4 className='text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 flex items-center gap-1'>
                  <CheckCircle className='h-2.5 w-2.5 sm:h-3 sm:w-3' />
                  Por Estado
                </h4>
                <div className='space-y-1.5 sm:space-y-2'>
                  {Object.entries(analyticsData.medidoresPorEstado)
                    .sort(([, a], [, b]) => b - a)
                    .map(([estado, cantidad]) => (
                      <div
                        key={estado}
                        className='flex justify-between items-center text-xs sm:text-sm'
                      >
                        <Badge
                          variant={getBadgeVariant(estado)}
                          className='text-xs px-1.5 sm:px-2 py-0.5 truncate max-w-[100px] sm:max-w-none'
                        >
                          {estado}
                        </Badge>
                        <NumberFlow
                          value={cantidad}
                          plugins={[continuous]}
                          className='tabular-nums font-medium'
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
      <Card>
        <CardHeader className='p-3 sm:p-6'>
          <CardTitle className='flex items-center gap-2 text-sm sm:text-base'>
            <Power className='h-4 w-4 sm:h-5 sm:w-5 text-orange-500' />
            Acometidas por Sector
          </CardTitle>
          <CardDescription className='text-xs sm:text-sm'>
            Distribución geográfica de puntos de suministro
          </CardDescription>
        </CardHeader>
        <CardContent className='p-3 sm:p-6'>
          {analyticsData.loading ? (
            <div className='space-y-2 sm:space-y-3'>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className='flex justify-between items-center'>
                  <div className='h-3 sm:h-4 bg-muted animate-pulse rounded w-24 sm:w-28'></div>
                  <div className='h-5 sm:h-6 bg-muted animate-pulse rounded w-10 sm:w-12'></div>
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-2 sm:space-y-3'>
              {Object.entries(analyticsData.acometidasPorSector)
                .sort(([, a], [, b]) => b - a)
                .map(([sector, cantidad], index) => (
                  <div
                    key={sector}
                    className='flex justify-between items-center'
                  >
                    <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
                      <div
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getColorForIndex(index)} flex-shrink-0`}
                      ></div>
                      <span className='text-xs sm:text-sm font-medium truncate'>
                        {sector}
                      </span>
                    </div>
                    <div className='text-lg sm:text-xl font-bold flex-shrink-0'>
                      <NumberFlow
                        value={cantidad}
                        plugins={[continuous]}
                        className='tabular-nums'
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
