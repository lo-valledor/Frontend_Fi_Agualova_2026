import {
  //Activity,
  ArrowLeft,
  //DollarSign,
  FileText,
  Settings,
  TrendingUp,
  User
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import NumberFlow from '@number-flow/react';
import { useNavigate } from 'react-router';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type {
  DetalleCliente,
  DetalleContrato,
  DetalleFacturas,
  DetalleLecturas,
  DetalleLocal,
  DetalleMedidores,
  DetallePropietario,
  DetalleUbicacion
} from '~/types/reportes';

import BillingDashboard from './facturas/billing-dashboard';
import EnergyConsumptionDashboard from './facturas/energy-consumption-dashboard';
import FacturasAnalyticsSimple from './facturas-analytics-simple';
import InformacionContrato from './informacion-contrato';
import LecturasAnalyticsSimple from './lecturas-analytics-simple';

interface ContratoComponentProps {
  detallesContrato: {
    detallePropietario: DetallePropietario[];
    detalleCliente: DetalleCliente[];
    detalleLocal: DetalleLocal[];
    detalleContrato: DetalleContrato[];
    detalleMedidores: DetalleMedidores[];
    detalleUbicacion: DetalleUbicacion[];
    detalleLecturas: DetalleLecturas[];
    detalleFacturas: DetalleFacturas[];
  };
}

const ContratoComponent = memo(function ContratoComponent({
  detallesContrato
}: ContratoComponentProps) {
  const [activeTab, setActiveTab] = useState('resumen');
  const navigate = useNavigate();

  const {
    detallePropietario,
    detalleCliente,
    detalleLocal,
    detalleContrato,
    detalleMedidores,
    detalleUbicacion,
    detalleLecturas,
    detalleFacturas
  } = detallesContrato;

  // Memoizar datos principales para evitar re-renderizados innecesarios
  const contratoInfo = useMemo(() => detalleContrato[0], [detalleContrato]);
  const propietarioInfo = useMemo(
    () => detallePropietario[0],
    [detallePropietario]
  );
  const clienteInfo = useMemo(() => detalleCliente[0], [detalleCliente]);
  const localInfo = useMemo(() => detalleLocal[0], [detalleLocal]);
  const medidorInfo = useMemo(() => detalleMedidores[0], [detalleMedidores]);
  const ubicacionInfo = useMemo(() => detalleUbicacion[0], [detalleUbicacion]);

  // Calcular estadísticas rápidas para el header
  const estadisticasHeader = useMemo(() => {
    const totalFacturas = detalleFacturas.length;
    const totalConsumo = detalleLecturas.reduce(
      (sum, lectura) => sum + (lectura.consumoPeriodo || 0),
      0
    );
    const totalFacturado = detalleFacturas.reduce(
      (sum, factura) => sum + (factura.valorTotal || 0),
      0
    );

    return {
      totalFacturas,
      totalConsumo,
      totalFacturado
    };
  }, [detalleFacturas, detalleLecturas]);

  const handleGoBack = () => {
    navigate('/dashboard/reportes/consultar-contrato');
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4 sm:space-y-6'>
        {/* Header con navegación y estadísticas */}
        <div className='space-y-4'>
          {/* Botón de navegación */}
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleGoBack}
              className='gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            >
              <ArrowLeft className='h-4 w-4' />
              Volver a Consultar Contratos Activos
            </Button>
          </div>

          {/* Header principal mejorado */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 border-b border-border space-y-2 sm:space-y-0'>
            <div className='text-center sm:text-left'>
              <div className='flex items-center gap-2 justify-center sm:justify-start mb-2'>
                <FileText className='h-5 w-5 text-blue-600' />
                <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold'>
                  Contrato {contratoInfo?.contratoId}
                </h1>
                {contratoInfo?.estadoContrato && (
                  <Badge
                    variant={
                      contratoInfo.estadoContrato === 'Activo'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {contratoInfo.estadoContrato}
                  </Badge>
                )}
              </div>
              <p className='text-xs sm:text-sm'>
                {propietarioInfo?.nombre} • {localInfo?.empresa}
              </p>
            </div>

            {/* Estadísticas rápidas con colores mejorados */}
            <div className='flex items-center gap-4 text-xs sm:text-sm'>
              <div className='text-center'>
                <div className='font-semibold'>
                  <NumberFlow value={estadisticasHeader.totalFacturas} />
                </div>
                <div className='text-slate-500'>Facturas</div>
              </div>
              <Separator orientation='vertical' className='h-8' />
              <div className='text-center'>
                <div className='font-semibold'>
                  <NumberFlow
                    value={estadisticasHeader.totalConsumo}
                    format={{
                      style: 'decimal',
                      minimumFractionDigits: 0
                    }}
                    locales='es-CL'
                  />{' '}
                  kWh
                </div>
                <div className='text-slate-500'>Consumo Total</div>
              </div>
              <Separator orientation='vertical' className='h-8' />
              <div className='text-center'>
                <div className='font-semibold'>
                  $
                  <NumberFlow
                    value={estadisticasHeader.totalFacturado}
                    format={{
                      style: 'decimal',
                      minimumFractionDigits: 0
                    }}
                    locales='es-CL'
                  />
                </div>
                <div className='text-slate-500'>Facturado</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Container */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'
        >
          <TabsList className='grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-11 gap-1 p-1'>
            <TabsTrigger value='resumen' className='gap-2 h-10 sm:h-9'>
              <User className='h-4 w-4 shrink-0' />
              <span className='hidden sm:inline'>Información</span>
              <span className='sm:hidden text-xs'>Info</span>
            </TabsTrigger>
            <TabsTrigger value='lecturas' className='gap-2 h-10 sm:h-9'>
              <TrendingUp className='h-4 w-4 shrink-0' />
              <span className='hidden sm:inline'>Lecturas</span>
              <span className='sm:hidden text-xs'>Lect.</span>
            </TabsTrigger>
            {/* <TabsTrigger
              value='consumo-electrico'
              className='gap-2 h-10 sm:h-9'
            >
              <Activity className='h-4 w-4 shrink-0' />
              <span className='hidden sm:inline'>Consumo Eléctrico</span>
              <span className='sm:hidden text-xs'>Cons.</span>
            </TabsTrigger> */}
            <TabsTrigger value='facturas' className='gap-2 h-10 sm:h-9'>
              <FileText className='h-4 w-4 shrink-0' />
              <span className='hidden sm:inline'>Facturas</span>
              <span className='sm:hidden text-xs'>Fact.</span>
            </TabsTrigger>
            {/* <TabsTrigger
              value='dashboard-facturas'
              className='gap-2 h-10 sm:h-9'
            >
              <DollarSign className='h-4 w-4 shrink-0' />
              <span className='hidden sm:inline'>Dashboard Facturación</span>
              <span className='sm:hidden text-xs'>Dash F.</span>
            </TabsTrigger> */}
            <TabsTrigger value='tecnico' className='gap-2 h-10 sm:h-9'>
              <Settings className='h-4 w-4 shrink-0' />
              <span className='hidden sm:inline'>Técnico</span>
              <span className='sm:hidden text-xs'>Téc.</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Resumen General - Simple */}
          <TabsContent value='resumen' className='space-y-4'>
            <InformacionContrato
              contratoInfo={contratoInfo}
              propietarioInfo={propietarioInfo}
              clienteInfo={clienteInfo}
              localInfo={localInfo}
              medidorInfo={medidorInfo}
              ubicacionInfo={ubicacionInfo}
            />
          </TabsContent>

          {/* Tab: Análisis de Lecturas */}
          <TabsContent value='lecturas' className='space-y-4'>
            <LecturasAnalyticsSimple
              detalleLecturas={detalleLecturas}
              contratoId={contratoInfo?.contratoId}
            />
          </TabsContent>

          {/* Tab: Dashboard de Consumo Eléctrico */}
          <TabsContent value='consumo-electrico' className='space-y-4'>
            <EnergyConsumptionDashboard
              detalleLecturas={detalleLecturas}
              contratoId={contratoInfo?.contratoId}
            />
          </TabsContent>

          {/* Tab: Análisis de Facturas */}
          <TabsContent value='facturas' className='space-y-4'>
            <FacturasAnalyticsSimple
              detalleFacturas={detalleFacturas}
              contratoId={contratoInfo?.contratoId}
            />
          </TabsContent>

          {/* Tab: Dashboard de Facturación */}
          <TabsContent value='dashboard-facturas' className='space-y-4'>
            <BillingDashboard
              detalleFacturas={detalleFacturas}
              detalleLecturas={detalleLecturas}
              contratoId={contratoInfo?.contratoId}
            />
          </TabsContent>

          {/* Tab: Información Técnica - Simple */}
          <TabsContent value='tecnico' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              {/* Detalles del Medidor */}
              <Card className='border bg-background'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Especificaciones del Medidor
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {medidorInfo && (
                    <>
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm'>Número de Serie:</span>
                        <span className='text-sm font-medium'>
                          {medidorInfo.nroSerie}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm'>Tipo de Medidor:</span>
                        <span className='text-sm font-medium'>
                          {medidorInfo.tipoMedidor}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm'>
                          Constante Multiplicadora:
                        </span>
                        <span className='text-sm font-medium'>
                          {medidorInfo.constanteMultiplicadora}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm'>Dígitos de Display:</span>
                        <span className='text-sm font-medium'>
                          {medidorInfo.digitos}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Información de la Instalación */}
              <Card className='border bg-background'>
                <CardHeader>
                  <CardTitle className='text-base font-medium'>
                    Detalles de la Instalación
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {contratoInfo && (
                    <>
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm'>Límite de Inversión:</span>
                        <span className='text-sm font-medium'>
                          $
                          {contratoInfo.limiteInversionVigente?.toLocaleString(
                            'es-CL'
                          )}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm'>Potencia Contratada:</span>
                        <span className='text-sm font-medium'>
                          {contratoInfo.potenciaContratada} kW
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm'>Ciclo de Facturación:</span>
                        <span className='text-sm font-medium'>
                          {contratoInfo.cicloFacturacion}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm'>Fecha de Inicio:</span>
                        <span className='text-sm font-medium'>
                          {new Date(
                            contratoInfo.fechaInicio
                          ).toLocaleDateString('es-CL')}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

export default ContratoComponent;
