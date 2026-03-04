import {
  AlertCircleIcon,
  BarChart3Icon,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Eraser,
  FileTextIcon,
  MinusIcon,
  SearchIcon,
  TrendingDownIcon,
  TrendingUpIcon
} from 'lucide-react';
import { motion } from 'motion/react';
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

const mechanicalEase = [0.25, 0.1, 0.25, 1] as const;

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
        Number.parseInt(selectedEmpalme, 10)
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
      <div className='container mx-auto p-4 sm:p-6 space-y-6'>
        {/* Header con estilo industrial */}
        <header>
          <ModernHeader
            title='Resumen de Facturación'
            description='Revisión de la facturación por períodos y empalmes'
          />
          <div className='industrial-divider mt-4' />
        </header>

        {/* Filtros de Búsqueda — panel industrial */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: mechanicalEase }}
        >
          <Card className='overflow-hidden border border-border bg-card shadow-sm'>
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <div
                className='flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-2 border-l-primary/50'
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <div className='flex items-center gap-3'>
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border'>
                    <SearchIcon className='h-4 w-4' />
                  </div>
                  <div>
                    <CardTitle className='text-xs font-bold uppercase tracking-wide text-foreground'>
                      Criterios de Búsqueda
                    </CardTitle>
                    <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                      Período y empalme para consultar facturación
                    </CardDescription>
                  </div>
                </div>
                <Button variant='ghost' size='icon' className='h-8 w-8 shrink-0'>
                  {isFiltersOpen ? (
                    <ChevronUp className='h-4 w-4 text-muted-foreground' />
                  ) : (
                    <ChevronDown className='h-4 w-4 text-muted-foreground' />
                  )}
                </Button>
              </div>

              <CollapsibleContent>
                <div className='industrial-divider' />
                <CardContent className='p-4 space-y-4'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-full'>
                    <div className='space-y-2'>
                      <Label
                        htmlFor='periodo'
                        className='text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2'
                      >
                        <CalendarIcon className='h-3.5 w-3.5' />
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

                    <div className='space-y-2'>
                      <Label
                        htmlFor='empalme'
                        className='text-xs font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2 w-full'
                      >
                        <FileTextIcon className='h-3.5 w-3.5' />
                        Empalme
                      </Label>
                      <Select
                        value={selectedEmpalme}
                        onValueChange={setSelectedEmpalme}
                      >
                        <SelectTrigger
                          id='empalme'
                          className='h-10 bg-background border-border focus:border-ring focus:ring w-full'
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

                  <div className='industrial-divider' />
                  <div className='flex justify-end gap-3'>
                    <Button
                      onClick={handleClearFilters}
                      variant='outline'
                      disabled={isLoading}
                      className='gap-2'
                      size='sm'
                    >
                      <Eraser className='h-4 w-4' />
                      Limpiar
                    </Button>
                    <Button
                      onClick={handleConsultar}
                      disabled={
                        isLoading || !selectedPeriodo || !selectedEmpalme
                      }
                      className='gap-2'
                      variant='default'
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
        </motion.div>

        {/* Comparación por Conceptos — panel industrial */}
        {!isLoading && !fetchError && facturacionData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05, ease: mechanicalEase }}
          >
            <Card className='overflow-hidden border border-border bg-card shadow-sm'>
              <CardHeader className='p-4 pb-3'>
                <div className='flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border'>
                      <TrendingUpIcon className='h-4 w-4' />
                    </div>
                    <div className='min-w-0'>
                      <CardTitle className='text-xs font-bold uppercase tracking-wide text-foreground'>
                        Comparación por Conceptos
                      </CardTitle>
                      <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                        Cambios por concepto de facturación
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
              <div className='industrial-divider' />
              <CardContent className='p-4 space-y-3'>
                {facturacionData.map((item, index) => {
                  const facturaAnterior = parseFloat(
                    item.totalFacturaPeriodoAnterior.replace(/[^\d.-]/g, '') ||
                      '0'
                  );
                  const facturaActual = parseFloat(
                    item.totalFacturaPeriodoActual.replace(/[^\d.-]/g, '') ||
                      '0'
                  );
                  const cambio =
                    facturaAnterior > 0
                      ? ((facturaActual - facturaAnterior) / facturaAnterior) *
                        100
                      : 0;
                  const diferencia = facturaActual - facturaAnterior;
                  const borderAccent =
                    cambio > 0
                      ? 'border-l-energy bg-energy/5 dark:bg-energy/10'
                      : cambio < 0
                        ? 'border-l-destructive bg-destructive/5 dark:bg-destructive/10'
                        : 'border-l-border bg-muted/30';

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.02,
                        ease: mechanicalEase
                      }}
                      className={`rounded-lg border border-border border-l-4 p-4 ${borderAccent}`}
                    >
                      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3'>
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold text-sm text-foreground mb-3 truncate'>
                            {item.cargoDescripcion}
                          </h3>
                          <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                            <div>
                              <p className='sidebar-section-label mb-0.5'>
                                Energía
                              </p>
                              <p className='font-medium text-sm tabular-nums'>
                                {item.totalEnergiaPeriodoActual}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                vs {item.totalEnergiaPeriodoAnterior}
                              </p>
                            </div>
                            <div>
                              <p className='sidebar-section-label mb-0.5'>
                                Factura
                              </p>
                              <p className='font-medium text-sm tabular-nums'>
                                {item.totalFacturaPeriodoActual}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                vs {item.totalFacturaPeriodoAnterior}
                              </p>
                            </div>
                            <div>
                              <p className='sidebar-section-label mb-0.5'>
                                Cantidad
                              </p>
                              <p className='font-medium text-sm tabular-nums'>
                                {item.cantidadCargosPeriodoActual}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                vs {item.cantidadCargosPeriodoAnterior}
                              </p>
                            </div>
                            <div>
                              <p className='sidebar-section-label mb-0.5'>
                                Diferencia
                              </p>
                              <p className='font-medium text-sm tabular-nums'>
                                {item.diferenciaPeriodos}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className='shrink-0 text-right lg:pl-4'>
                          <div
                            className={`flex items-center justify-end gap-2 text-sm font-semibold tabular-nums ${obtenerColorPorcentaje(cambio)}`}
                          >
                            {obtenerIconoPorcentaje(cambio)}
                            <span>{formatearPorcentaje(cambio)}</span>
                          </div>
                          <div
                            className={`text-xs font-medium mt-1 ${diferencia >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                          >
                            {diferencia >= 0 ? '+' : ''}$
                            {formatearNumero(Math.abs(diferencia))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tabla Detallada — panel industrial */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1, ease: mechanicalEase }}
        >
          <Card className='overflow-hidden border border-border bg-card shadow-sm'>
            <CardHeader className='p-4 pb-3'>
              <div className='flex flex-wrap justify-between items-center gap-3'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground border border-border'>
                    <BarChart3Icon className='h-4 w-4' />
                  </div>
                  <div className='min-w-0'>
                    <CardTitle className='text-xs font-bold uppercase tracking-wide text-foreground'>
                      Tabla Detallada
                    </CardTitle>
                    <CardDescription className='text-xs mt-0.5 text-muted-foreground'>
                      {facturacionData.length > 0
                        ? `${facturacionData.length} conceptos`
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
            <div className='industrial-divider' />
            <CardContent className='p-4'>
            {isLoading && (
              <div className='flex flex-col items-center justify-center py-12'>
                <div className='space-y-3 w-full max-w-sm'>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className='flex justify-between items-center'
                    >
                      <div className='h-2.5 bg-muted animate-pulse rounded-sm w-24' />
                      <div className='h-3 bg-muted animate-pulse rounded-sm w-16' />
                    </div>
                  ))}
                </div>
                <p className='sidebar-section-label mt-4'>
                  Consultando datos...
                </p>
              </div>
            )}
            {!isLoading && fetchError && (
              <div className='rounded-lg border border-destructive/30 bg-destructive/5 dark:bg-destructive/10 p-4'>
                <div className='flex items-start gap-3'>
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-destructive/20'>
                    <AlertCircleIcon className='h-4 w-4 text-destructive' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-semibold text-sm text-foreground'>
                      Error al cargar los datos
                    </h4>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      {fetchError}
                    </p>
                    <Button
                      onClick={() => setFetchError(null)}
                      variant='outline'
                      size='sm'
                      className='mt-3'
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !fetchError && facturacionData.length === 0 && (
              <div className='flex flex-col items-center justify-center py-16 gap-4'>
                <div className='flex h-14 w-14 items-center justify-center rounded-lg bg-muted border border-border'>
                  <SearchIcon className='h-7 w-7 text-muted-foreground' />
                </div>
                <div className='text-center space-y-1'>
                  <p className='font-semibold text-sm text-foreground'>
                    Realizar consulta de facturación
                  </p>
                  <p className='text-xs text-muted-foreground max-w-xs'>
                    Selecciona período y empalme, luego Consultar
                  </p>
                </div>
              </div>
            )}
            {!isLoading &&
              !fetchError &&
              facturacionData.length > 0 &&
              showDetailedTable && (
                <div className='overflow-x-auto -mx-1'>
                  <DataTable columns={columns} data={facturacionData} />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
