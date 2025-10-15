import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Eraser,
  FileTextIcon,
  SearchIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  MinusIcon,
  BarChart3Icon
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import type { ExportColumn } from '~/hooks/shared/use-export-data';
import { reportesService } from '~/services/reportesService';
import type {
  ComboEmpalmes,
  FacturacionPorCargo,
  PeriodosFacturacion
} from '~/types/reportes';

import { columns } from './columns';

interface ResumenFacturacionComponentProps {
  comboEmpalmes: ComboEmpalmes[];
  periodosFacturacion: PeriodosFacturacion[];
  error: Error | null;
}

export default function ResumenFacturacionComponent({
  comboEmpalmes,
  periodosFacturacion,
  error: _error
}: Readonly<ResumenFacturacionComponentProps>) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedEmpalme, setSelectedEmpalme] = useState<string>('0');
  const [facturacionData, setFacturacionData] = useState<FacturacionPorCargo[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showDetailedTable, setShowDetailedTable] = useState(false);

  // Columnas para exportación
  const exportColumns: ExportColumn[] = [
    { key: 'cargoDescripcion', header: 'Descripción' },
    { key: 'totalEnergiaPeriodoAnterior', header: 'Energía Período Anterior' },
    { key: 'totalFacturaPeriodoAnterior', header: 'Factura Período Anterior' },
    {
      key: 'cantidadCargosPeriodoAnterior',
      header: 'Cantidad Cargos Anterior'
    },
    { key: 'totalEnergiaPeriodoActual', header: 'Energía Período Actual' },
    { key: 'totalFacturaPeriodoActual', header: 'Factura Período Actual' },
    { key: 'cantidadCargosPeriodoActual', header: 'Cantidad Cargos Actual' },
    { key: 'diferenciaPeriodos', header: 'Diferencia Períodos' }
  ];

  const handleConsultar = async () => {
    if (!selectedPeriodo || !selectedEmpalme) {
      toast.error('Debe seleccionar un período y empalme');
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await reportesService.getFacturacionPorCargo(
        selectedPeriodo,
        parseInt(selectedEmpalme, 10)
      );

      if (response.error) {
        setFetchError(response.error);
        setFacturacionData([]);
        toast.error('Error al consultar los datos de facturación');
      } else {
        setFacturacionData(response.data || []);
        if (response.data && response.data.length > 0) {
          toast.success(`Se encontraron ${response.data.length} registros`);
        } else {
          toast.info(
            'No se encontraron datos para los criterios seleccionados'
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      setFetchError(errorMessage);
      setFacturacionData([]);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedPeriodo('');
    setSelectedEmpalme('');
    setFacturacionData([]);
    setFetchError(null);
    toast.success('Filtros limpiados');
  };

  // Calcular métricas de resumen
  const calcularResumen = () => {
    if (facturacionData.length === 0) return null;

    const totales = facturacionData.reduce(
      (acc, item) => {
        const energiaAnterior = parseFloat(
          item.totalEnergiaPeriodoAnterior.replace(/[^\d.-]/g, '') || '0'
        );
        const energiaActual = parseFloat(
          item.totalEnergiaPeriodoActual.replace(/[^\d.-]/g, '') || '0'
        );
        const facturaAnterior = parseFloat(
          item.totalFacturaPeriodoAnterior.replace(/[^\d.-]/g, '') || '0'
        );
        const facturaActual = parseFloat(
          item.totalFacturaPeriodoActual.replace(/[^\d.-]/g, '') || '0'
        );
        const cantAnterior = parseFloat(
          item.cantidadCargosPeriodoAnterior.replace(/[^\d.-]/g, '') || '0'
        );
        const cantActual = parseFloat(
          item.cantidadCargosPeriodoActual.replace(/[^\d.-]/g, '') || '0'
        );

        return {
          energiaAnterior: acc.energiaAnterior + energiaAnterior,
          energiaActual: acc.energiaActual + energiaActual,
          facturaAnterior: acc.facturaAnterior + facturaAnterior,
          facturaActual: acc.facturaActual + facturaActual,
          cantidadAnterior: acc.cantidadAnterior + cantAnterior,
          cantidadActual: acc.cantidadActual + cantActual
        };
      },
      {
        energiaAnterior: 0,
        energiaActual: 0,
        facturaAnterior: 0,
        facturaActual: 0,
        cantidadAnterior: 0,
        cantidadActual: 0
      }
    );

    const cambioEnergia =
      totales.energiaAnterior > 0
        ? ((totales.energiaActual - totales.energiaAnterior) /
            totales.energiaAnterior) *
          100
        : 0;
    const cambioFactura =
      totales.facturaAnterior > 0
        ? ((totales.facturaActual - totales.facturaAnterior) /
            totales.facturaAnterior) *
          100
        : 0;
    const cambioCantidad =
      totales.cantidadAnterior > 0
        ? ((totales.cantidadActual - totales.cantidadAnterior) /
            totales.cantidadAnterior) *
          100
        : 0;

    return { ...totales, cambioEnergia, cambioFactura, cambioCantidad };
  };

  const resumen = calcularResumen();

  const formatearNumero = (valor: number) => {
    return new Intl.NumberFormat('es-CL').format(Math.round(valor));
  };

  const formatearPorcentaje = (valor: number) => {
    const signo = valor > 0 ? '+' : '';
    return `${signo}${valor.toFixed(1)}%`;
  };

  const obtenerIconoPorcentaje = (valor: number) => {
    if (valor > 0)
      return (
        <TrendingUpIcon className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
      );
    if (valor < 0)
      return (
        <TrendingDownIcon className='w-4 h-4 text-red-600 dark:text-red-400' />
      );
    return <MinusIcon className='w-4 h-4' />;
  };

  const obtenerColorPorcentaje = (valor: number) => {
    if (valor > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (valor < 0) return 'text-red-600 dark:text-red-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}

        <ModernHeader
          title='Resumen de Facturación'
          description='Revisión de la Facturación Realizada por períodos y empalmes'
        />

        {/* Filtros de Búsqueda */}
        <Card className='border border-border shadow-sm'>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className='flex justify-between items-center p-3 cursor-pointer hover:bg-muted transition-colors'
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center border border-border'>
                  <SearchIcon className='w-4 h-4' />
                </div>
                <div>
                  <CardTitle className='text-base font-medium'>
                    Criterios de Búsqueda
                  </CardTitle>
                  <CardDescription className='text-sm'>
                    Selecciona período y empalme para consultar facturación
                  </CardDescription>
                </div>
              </div>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                {isFiltersOpen ? (
                  <ChevronUp className='h-5 w-5 text-slate-500' />
                ) : (
                  <ChevronDown className='h-5 w-5 text-slate-500' />
                )}
              </Button>
            </div>

            <CollapsibleContent>
              <CardContent className='p-3 space-y-4'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-full'>
                  {/* Período de Facturación */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='periodo'
                      className='text-sm font-medium flex items-center gap-2'
                    >
                      <CalendarIcon className='w-4 h-4' />
                      Período de Facturación
                    </Label>
                    <Select
                      value={selectedPeriodo}
                      onValueChange={setSelectedPeriodo}
                    >
                      <SelectTrigger
                        id='periodo'
                        className='h-10 bg-background border-border focus:border-ring focus:ring w-full'
                      >
                        <SelectValue placeholder='Seleccionar período' />
                      </SelectTrigger>
                      <SelectContent>
                        {periodosFacturacion.map(periodo => (
                          <SelectItem
                            key={periodo.pF_ID}
                            value={periodo.pF_ID}
                            className='hover:bg-muted'
                          >
                            {periodo.pF_Descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Empalme */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='empalme'
                      className='text-sm font-medium flex items-center gap-2 w-full'
                    >
                      <FileTextIcon className='w-4 h-4' />
                      Empalme
                    </Label>
                    <Select
                      value={selectedEmpalme}
                      onValueChange={setSelectedEmpalme}
                    >
                      <SelectTrigger
                        id='empalme'
                        className='h-10 bg-backgroundborder-border focus:border-sky-400 focus:ring-sky-400/20 w-full'
                      >
                        <SelectValue placeholder='Seleccionar empalme' />
                      </SelectTrigger>
                      <SelectContent>
                        {comboEmpalmes.map(empalme => (
                          <SelectItem
                            key={empalme.emId}
                            value={empalme.emId.toString()}
                            className='hover:bg-muted'
                          >
                            {empalme.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className='flex justify-end gap-3 pt-3 border-t border-border'>
                  <Button
                    onClick={handleClearFilters}
                    variant='outline'
                    disabled={isLoading}
                    className='gap-2 border-slate-200 hover:bg-muted-50 dark:border-slate-700 dark:hover:bg-muted-800'
                    size='sm'
                  >
                    <Eraser className='h-4 w-4' />
                    Limpiar
                  </Button>
                  <Button
                    onClick={handleConsultar}
                    disabled={isLoading || !selectedPeriodo || !selectedEmpalme}
                    className='gap-2 bg-sky-600 hover:bg-sky-700'
                    size='sm'
                  >
                    <SearchIcon className='h-4 w-4' />
                    {isLoading ? 'Consultando...' : 'Consultar'}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Comparación por Conceptos */}
        {!isLoading && !fetchError && facturacionData.length > 0 && (
          <Card className='border border-border shadow-sm'>
            <CardHeader className='p-4 border-b border-border'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center border border-border'>
                    <TrendingUpIcon className='w-4 h-4' />
                  </div>
                  <div>
                    <CardTitle className='text-base font-medium'>
                      Comparación por Conceptos
                    </CardTitle>
                    <CardDescription className='text-sm'>
                      Análisis detallado de cambios en cada concepto de
                      facturación
                    </CardDescription>
                  </div>
                </div>
                <ExportButton
                  data={facturacionData}
                  columns={exportColumns}
                  filename='resumen_facturacion'
                  size='sm'
                />
              </div>
            </CardHeader>
            <CardContent className='p-4 space-y-3'>
              {facturacionData.map((item, index) => {
                const facturaAnterior = parseFloat(
                  item.totalFacturaPeriodoAnterior.replace(/[^\d.-]/g, '') ||
                    '0'
                );
                const facturaActual = parseFloat(
                  item.totalFacturaPeriodoActual.replace(/[^\d.-]/g, '') || '0'
                );
                const cambio =
                  facturaAnterior > 0
                    ? ((facturaActual - facturaAnterior) / facturaAnterior) *
                      100
                    : 0;
                const diferencia = facturaActual - facturaAnterior;

                return (
                  <Card
                    key={index}
                    className={`p-4 border-l-4 ${
                      cambio > 0
                        ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                        : cambio < 0
                          ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
                          : 'border-l-slate-300 dark:border-l-slate-600'
                    }`}
                  >
                    <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3'>
                      <div className='flex-1'>
                        <h3 className='font-medium text-sm mb-2'>
                          {item.cargoDescripcion}
                        </h3>
                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs'>
                          <div>
                            <p className=''>Energía</p>
                            <p className='font-medium'>
                              {item.totalEnergiaPeriodoActual}
                            </p>
                            <p className='text-slate-500 dark:text-slate-400'>
                              vs {item.totalEnergiaPeriodoAnterior}
                            </p>
                          </div>
                          <div>
                            <p className=''>Factura</p>
                            <p className='font-medium'>
                              {item.totalFacturaPeriodoActual}
                            </p>
                            <p className='text-slate-500 dark:text-slate-400'>
                              vs {item.totalFacturaPeriodoAnterior}
                            </p>
                          </div>
                          <div>
                            <p className=''>Cantidad</p>
                            <p className='font-medium'>
                              {item.cantidadCargosPeriodoActual}
                            </p>
                            <p className='text-slate-500 dark:text-slate-400'>
                              vs {item.cantidadCargosPeriodoAnterior}
                            </p>
                          </div>
                          <div>
                            <p className=''>Diferencia</p>
                            <p className='font-medium'>
                              {item.diferenciaPeriodos}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div
                          className={`flex items-center justify-end gap-2 text-sm font-medium ${obtenerColorPorcentaje(cambio)}`}
                        >
                          {obtenerIconoPorcentaje(cambio)}
                          <span>{formatearPorcentaje(cambio)}</span>
                        </div>
                        <div
                          className={`text-xs font-medium ${diferencia >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                        >
                          {diferencia >= 0 ? '+' : ''}$
                          {formatearNumero(Math.abs(diferencia))}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Resultados con tabla detallada (colapsible) */}
        <Card className='border border-border shadow-sm'>
          <CardHeader className='p-3 border-b border-border'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center border border-border'>
                  <BarChart3Icon className='w-4 h-4' />
                </div>
                <div>
                  <CardTitle className='text-base font-medium'>
                    Tabla Detallada
                  </CardTitle>
                  <CardDescription className='text-sm'>
                    {facturacionData.length > 0
                      ? `Vista completa de ${facturacionData.length} conceptos de facturación`
                      : 'No hay datos disponibles'}
                  </CardDescription>
                </div>
              </div>
              {facturacionData.length > 0 && (
                <Button
                  onClick={() => setShowDetailedTable(!showDetailedTable)}
                  variant='outline'
                  size='sm'
                  className='gap-2'
                >
                  {showDetailedTable ? (
                    <>
                      <ChevronUp className='h-4 w-4' />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown className='h-4 w-4' />
                      Ver Detalle
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className='p-3'>
            {isLoading && (
              <div className='flex justify-center items-center h-48'>
                <div className='flex flex-col items-center gap-3'>
                  <div className='w-8 h-8 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600 dark:border-slate-600 dark:border-t-sky-400'></div>
                  <div className='text-center'>
                    <p className='text-slate-700 dark:text-slate-300 font-medium text-sm'>
                      Consultando datos...
                    </p>
                    <p className='text-xs'>Por favor espere</p>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && fetchError && (
              <div className='p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-700/60'>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-xl flex items-center justify-center'>
                    <AlertCircleIcon className='w-4 h-4 text-red-600 dark:text-red-400' />
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-medium text-red-800 dark:text-red-200 text-sm'>
                      Error al cargar los datos
                    </h4>
                    <p className='mt-1 text-red-700 dark:text-red-300 text-xs'>
                      {fetchError}
                    </p>
                    <Button
                      onClick={() => setFetchError(null)}
                      variant='outline'
                      size='sm'
                      className='mt-2 border-red-200 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20'
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !fetchError && facturacionData.length === 0 && (
              <div className='flex flex-col items-center justify-center h-48 gap-3'>
                <div className='w-12 h-12 bg-background rounded-xl flex items-center justify-center'>
                  <SearchIcon className='w-6 h-6' />
                </div>
                <div className='text-center'>
                  <p className='font-medium text-sm'>
                    Realizar consulta de facturación
                  </p>
                  <p className='text-xs'>
                    Selecciona período y empalme, luego haz clic en "Consultar"
                  </p>
                </div>
              </div>
            )}
            {!isLoading &&
              !fetchError &&
              facturacionData.length > 0 &&
              showDetailedTable && (
                <div className='space-y-4'>
                  <div className='overflow-x-auto'>
                    <DataTable columns={columns} data={facturacionData} />
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
