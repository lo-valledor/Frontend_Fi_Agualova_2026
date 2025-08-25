import {
  ArrowLeft,
  FileText,
  MapPin,
  Settings,
  TrendingUp,
  User,
  Zap
} from 'lucide-react';

import { memo, useMemo, useState } from 'react';

import { useNavigate } from 'react-router';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { ExportColumn } from '~/hooks/shared/use-export-data';
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

import { facturasTableColumns } from './columns-facturas';
import { lecturasTableColumns } from './columns-lecturas';

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

  // Columnas para exportación de lecturas - Memoizadas para rendimiento
  const lecturasColumns = useMemo(
    (): ExportColumn[] => [
      { key: 'periodo', header: 'Período' },
      { key: 'fechaLectura', header: 'Fecha Lectura' },
      { key: 'lecturaAnterior', header: 'Lectura Anterior' },
      { key: 'lecturaActual', header: 'Lectura Actual' },
      { key: 'consumoPeriodo', header: 'Consumo Período' },
      { key: 'energiaBase', header: 'Energía Base' },
      { key: 'sobreconsumo', header: 'Sobreconsumo' }
    ],
    []
  );

  // Columnas para exportación de facturas - Memoizadas para rendimiento
  const facturasColumns = useMemo(
    (): ExportColumn[] => [
      { key: 'periodo', header: 'Período' },
      { key: 'nroFactura', header: 'Nro. Factura' },
      { key: 'tarifa', header: 'Tarifa' },
      { key: 'fechaEmision', header: 'Fecha Emisión' },
      { key: 'fechaVencimiento', header: 'Fecha Vencimiento' },
      {
        key: 'valorNeto',
        header: 'Valor Neto',
        formatter: (value: number) => `$${value?.toLocaleString('es-CL')}`
      },
      {
        key: 'iva',
        header: 'IVA',
        formatter: (value: number) => `$${value?.toLocaleString('es-CL')}`
      },
      {
        key: 'valorTotal',
        header: 'Valor Total',
        formatter: (value: number) => `$${value?.toLocaleString('es-CL')}`
      },
      { key: 'consumoPeriodo', header: 'Consumo Período' }
    ],
    []
  );

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

  // Calcular estadísticas para mejorar la visualización
  const estadisticas = useMemo(() => {
    const totalFacturas = detalleFacturas.length;
    const totalConsumo = detalleLecturas.reduce(
      (sum, lectura) => sum + (lectura.consumoPeriodo || 0),
      0
    );
    const totalFacturado = detalleFacturas.reduce(
      (sum, factura) => sum + (factura.valorTotal || 0),
      0
    );
    const facturasPendientes = detalleFacturas.filter(
      factura => new Date(factura.fechaVencimiento) < new Date()
    ).length;

    return {
      totalFacturas,
      totalConsumo,
      totalFacturado,
      facturasPendientes,
      promedioConsumo:
        detalleLecturas.length > 0
          ? Math.round(totalConsumo / detalleLecturas.length)
          : 0
    };
  }, [detalleFacturas, detalleLecturas]);

  const handleGoBack = () => {
    navigate('/dashboard/reportes/consultar-contrato');
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
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
              Volver a Consultar Contratos
            </Button>
          </div>

          {/* Header principal */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 border-b border-slate-200/60 dark:border-slate-700/60 space-y-2 sm:space-y-0'>
            <div className='text-center sm:text-left'>
              <div className='flex items-center gap-2 justify-center sm:justify-start mb-2'>
                <FileText className='h-5 w-5 text-blue-600' />
                <h1 className='text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 dark:text-slate-100'>
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
              <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400'>
                {propietarioInfo?.nombre} • {localInfo?.empresa}
              </p>
            </div>

            {/* Estadísticas rápidas */}
            <div className='flex items-center gap-4 text-xs sm:text-sm'>
              <div className='text-center'>
                <div className='font-semibold text-green-600 dark:text-green-400'>
                  {estadisticas.totalFacturas}
                </div>
                <div className='text-slate-500'>Facturas</div>
              </div>
              <Separator orientation='vertical' className='h-8' />
              <div className='text-center'>
                <div className='font-semibold text-blue-600 dark:text-blue-400'>
                  {estadisticas.totalConsumo.toLocaleString('es-CL')} kWh
                </div>
                <div className='text-slate-500'>Consumo Total</div>
              </div>
              <Separator orientation='vertical' className='h-8' />
              <div className='text-center'>
                <div className='font-semibold text-amber-600 dark:text-amber-400'>
                  ${estadisticas.totalFacturado.toLocaleString('es-CL')}
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
          <TabsList className='grid w-full grid-cols-2 lg:grid-cols-4 h-11'>
            <TabsTrigger value='resumen' className='gap-2'>
              <User className='h-4 w-4' />
              <span className='hidden sm:inline'>Resumen</span>
            </TabsTrigger>
            <TabsTrigger value='lecturas' className='gap-2'>
              <TrendingUp className='h-4 w-4' />
              <span className='hidden sm:inline'>Lecturas</span>
            </TabsTrigger>
            <TabsTrigger value='facturas' className='gap-2'>
              <FileText className='h-4 w-4' />
              <span className='hidden sm:inline'>Facturas</span>
            </TabsTrigger>
            <TabsTrigger value='tecnico' className='gap-2'>
              <Settings className='h-4 w-4' />
              <span className='hidden sm:inline'>Técnico</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Resumen General */}
          <TabsContent value='resumen' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {/* Información del Contrato */}
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-blue-600' />
                    Información del Contrato
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {contratoInfo && (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          ID:
                        </span>
                        <span className='text-xs font-medium'>
                          {contratoInfo.contratoId}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Tipo:
                        </span>
                        <span className='text-xs font-medium'>
                          {contratoInfo.tipoContrato}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Tarifa:
                        </span>
                        <Badge variant='outline' className='text-xs'>
                          {contratoInfo.codigoTarifa}
                        </Badge>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Potencia:
                        </span>
                        <span className='text-xs font-medium'>
                          {contratoInfo.potenciaContratada} kW
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Estado:
                        </span>
                        <Badge
                          variant={
                            contratoInfo.estadoContrato === 'Activo'
                              ? 'default'
                              : 'secondary'
                          }
                          className='text-xs'
                        >
                          {contratoInfo.estadoContrato}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Información del Propietario */}
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                    <User className='h-4 w-4 text-green-600' />
                    Propietario
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {propietarioInfo && (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          RUT:
                        </span>
                        <span className='text-xs font-medium'>
                          {propietarioInfo.rut}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Nombre:
                        </span>
                        <span className='text-xs font-medium'>
                          {propietarioInfo.nombre}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Comuna:
                        </span>
                        <span className='text-xs font-medium'>
                          {propietarioInfo.comuna}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Teléfono:
                        </span>
                        <span className='text-xs font-medium'>
                          {propietarioInfo.telefono}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Email:
                        </span>
                        <span className='text-xs font-medium truncate'>
                          {propietarioInfo.email}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Información del Cliente */}
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                    <User className='h-4 w-4 text-purple-600' />
                    Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {clienteInfo && (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          RUT:
                        </span>
                        <span className='text-xs font-medium'>
                          {clienteInfo.rut}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Nombre:
                        </span>
                        <span className='text-xs font-medium'>
                          {clienteInfo.nombre}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Comuna:
                        </span>
                        <span className='text-xs font-medium'>
                          {clienteInfo.comuna}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Teléfono:
                        </span>
                        <span className='text-xs font-medium'>
                          {clienteInfo.telefono}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Email:
                        </span>
                        <span className='text-xs font-medium truncate'>
                          {clienteInfo.email}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Información del Local */}
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-orange-600' />
                    Local
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {localInfo && (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          ID:
                        </span>
                        <span className='text-xs font-medium'>
                          {localInfo.localId}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Empresa:
                        </span>
                        <span className='text-xs font-medium'>
                          {localInfo.empresa}
                        </span>
                      </div>
                      <div className='flex flex-col gap-1'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Dirección:
                        </span>
                        <span className='text-xs font-medium'>
                          {localInfo.lugarEntregaServicio}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Información del Medidor */}
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                    <Zap className='h-4 w-4 text-yellow-600' />
                    Medidor
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {medidorInfo && (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Serie:
                        </span>
                        <span className='text-xs font-medium'>
                          {medidorInfo.nroSerie}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Tipo:
                        </span>
                        <span className='text-xs font-medium'>
                          {medidorInfo.tipoMedidor}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Constante:
                        </span>
                        <span className='text-xs font-medium'>
                          {medidorInfo.constanteMultiplicadora}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Dígitos:
                        </span>
                        <span className='text-xs font-medium'>
                          {medidorInfo.digitos}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Información de Ubicación */}
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                    <MapPin className='h-4 w-4 text-teal-600' />
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {ubicacionInfo && (
                    <>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Subempalme:
                        </span>
                        <span className='text-xs font-medium'>
                          {ubicacionInfo.codigoSubempalme}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Nicho:
                        </span>
                        <span className='text-xs font-medium'>
                          {ubicacionInfo.nicho}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Sector:
                        </span>
                        <span className='text-xs font-medium'>
                          {ubicacionInfo.sector}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Empalme:
                        </span>
                        <span className='text-xs font-medium'>
                          {ubicacionInfo.empalme}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-xs text-slate-600 dark:text-slate-400'>
                          Zona:
                        </span>
                        <span className='text-xs font-medium'>
                          {ubicacionInfo.zona}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Lecturas */}
          <TabsContent value='lecturas' className='space-y-4'>
            <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <CardTitle className='text-base font-medium text-slate-700 dark:text-slate-300'>
                  Historial de Lecturas ({detalleLecturas.length})
                </CardTitle>
                {detalleLecturas.length > 0 && (
                  <ExportButton
                    data={detalleLecturas}
                    columns={lecturasColumns}
                    filename={`lecturas_contrato_${contratoInfo?.contratoId}`}
                    size='sm'
                  />
                )}
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <DataTable
                    columns={lecturasTableColumns}
                    data={detalleLecturas}
                    showSearch={false}
                    defaultPageSize={10}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Facturas */}
          <TabsContent value='facturas' className='space-y-4'>
            <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <CardTitle className='text-base font-medium text-slate-700 dark:text-slate-300'>
                  Historial de Facturas ({detalleFacturas.length})
                </CardTitle>
                {detalleFacturas.length > 0 && (
                  <ExportButton
                    data={detalleFacturas}
                    columns={facturasColumns}
                    filename={`facturas_contrato_${contratoInfo?.contratoId}`}
                    size='sm'
                  />
                )}
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <DataTable
                    columns={facturasTableColumns}
                    data={detalleFacturas}
                    showSearch={false}
                    defaultPageSize={10}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Información Técnica */}
          <TabsContent value='tecnico' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              {/* Detalles del Medidor */}
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
                <CardHeader>
                  <CardTitle className='text-base font-medium text-slate-700 dark:text-slate-300'>
                    Especificaciones del Medidor
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {medidorInfo && (
                    <>
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          Número de Serie:
                        </span>
                        <span className='text-sm font-medium'>
                          {medidorInfo.nroSerie}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          Tipo de Medidor:
                        </span>
                        <span className='text-sm font-medium'>
                          {medidorInfo.tipoMedidor}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          Constante Multiplicadora:
                        </span>
                        <span className='text-sm font-medium'>
                          {medidorInfo.constanteMultiplicadora}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          Dígitos de Display:
                        </span>
                        <span className='text-sm font-medium'>
                          {medidorInfo.digitos}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Información de la Instalación */}
              <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
                <CardHeader>
                  <CardTitle className='text-base font-medium text-slate-700 dark:text-slate-300'>
                    Detalles de la Instalación
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {contratoInfo && (
                    <>
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          Límite de Inversión:
                        </span>
                        <span className='text-sm font-medium'>
                          $
                          {contratoInfo.limiteInversionVigente?.toLocaleString(
                            'es-CL'
                          )}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          Potencia Contratada:
                        </span>
                        <span className='text-sm font-medium'>
                          {contratoInfo.potenciaContratada} kW
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          Ciclo de Facturación:
                        </span>
                        <span className='text-sm font-medium'>
                          {contratoInfo.cicloFacturacion}
                        </span>
                      </div>
                      <Separator />
                      <div className='grid grid-cols-2 gap-2'>
                        <span className='text-sm text-slate-600 dark:text-slate-400'>
                          Fecha de Inicio:
                        </span>
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
