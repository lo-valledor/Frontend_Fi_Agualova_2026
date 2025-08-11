import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Eraser,
  FileTextIcon,
  SearchIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { ExportButton } from '~/components/shared/export-button';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import type { ExportColumn } from '~/hooks/shared/use-export-data';
import { reportesService } from '~/services/reportesService';
import type {
  ComboEmpalmes,
  FacturacionPorCargo,
  PeriodosFacturacion,
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
  error: _error,
}: ResumenFacturacionComponentProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
  const [selectedEmpalme, setSelectedEmpalme] = useState<string>('');
  const [facturacionData, setFacturacionData] = useState<FacturacionPorCargo[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Columnas para exportación
  const exportColumns: ExportColumn[] = [
    { key: 'cargoDescripcion', header: 'Descripción' },
    { key: 'totalEnergiaPeriodoAnterior', header: 'Energía Período Anterior' },
    { key: 'totalFacturaPeriodoAnterior', header: 'Factura Período Anterior' },
    {
      key: 'cantidadCargosPeriodoAnterior',
      header: 'Cantidad Cargos Anterior',
    },
    { key: 'totalEnergiaPeriodoActual', header: 'Energía Período Actual' },
    { key: 'totalFacturaPeriodoActual', header: 'Factura Período Actual' },
    { key: 'cantidadCargosPeriodoActual', header: 'Cantidad Cargos Actual' },
    { key: 'diferenciaPeriodos', header: 'Diferencia Períodos' },
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

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Resumen de Facturación
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Revisión de la Facturación Realizada por períodos y empalmes
            </p>
          </div>
          {facturacionData.length > 0 && (
            <ExportButton
              data={facturacionData}
              columns={exportColumns}
              filename='resumen_facturacion'
              size='sm'
            />
          )}
        </div>

        {/* Filtros de Búsqueda */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className='flex justify-between items-center p-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60'>
                  <SearchIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                </div>
                <div>
                  <CardTitle className='text-base font-medium text-slate-900 dark:text-slate-100'>
                    Criterios de Búsqueda
                  </CardTitle>
                  <CardDescription className='text-sm text-slate-600 dark:text-slate-400'>
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
                      className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'
                    >
                      <CalendarIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                      Período de Facturación
                    </Label>
                    <Select
                      value={selectedPeriodo}
                      onValueChange={setSelectedPeriodo}
                    >
                      <SelectTrigger
                        id='periodo'
                        className='h-10 bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 focus:border-sky-400 focus:ring-sky-400/20 w-full'
                      >
                        <SelectValue placeholder='Seleccionar período' />
                      </SelectTrigger>
                      <SelectContent>
                        {periodosFacturacion.map(periodo => (
                          <SelectItem
                            key={periodo.pF_ID}
                            value={periodo.pF_ID}
                            className='hover:bg-slate-50 dark:hover:bg-slate-800'
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
                      className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 w-full'
                    >
                      <FileTextIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                      Empalme
                    </Label>
                    <Select
                      value={selectedEmpalme}
                      onValueChange={setSelectedEmpalme}
                    >
                      <SelectTrigger
                        id='empalme'
                        className='h-10 bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 focus:border-sky-400 focus:ring-sky-400/20 w-full'
                      >
                        <SelectValue placeholder='Seleccionar empalme' />
                      </SelectTrigger>
                      <SelectContent>
                        {comboEmpalmes.map(empalme => (
                          <SelectItem
                            key={empalme.emId}
                            value={empalme.emId.toString()}
                            className='hover:bg-slate-50 dark:hover:bg-slate-800'
                          >
                            {empalme.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className='flex justify-end gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60'>
                  <Button
                    onClick={handleClearFilters}
                    variant='outline'
                    disabled={isLoading}
                    className='gap-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                    size='sm'
                  >
                    <Eraser className='h-4 w-4' />
                    Limpiar
                  </Button>
                  <Button
                    onClick={handleConsultar}
                    disabled={isLoading || !selectedPeriodo || !selectedEmpalme}
                    className='gap-2 bg-sky-600 hover:bg-sky-700 text-white'
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

        {/* Resultados de la búsqueda */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardHeader className='p-3 border-b border-slate-200/60 dark:border-slate-700/60'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60'>
                <TrendingUpIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
              </div>
              <div>
                <CardTitle className='text-base font-medium text-slate-900 dark:text-slate-100'>
                  Resumen de Facturación
                </CardTitle>
                <CardDescription className='text-sm text-slate-600 dark:text-slate-400'>
                  {facturacionData.length > 0
                    ? `${facturacionData.length} cargos de facturación encontrados`
                    : 'No hay datos disponibles'}
                </CardDescription>
              </div>
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
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Por favor espere
                    </p>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && fetchError && (
              <div className='p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-700/60'>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center'>
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
                <div className='w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center'>
                  <SearchIcon className='w-6 h-6 text-slate-500 dark:text-slate-400' />
                </div>
                <div className='text-center'>
                  <p className='font-medium text-slate-700 dark:text-slate-300 text-sm'>
                    Realizar consulta de facturación
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    Selecciona período y empalme, luego haz clic en "Consultar"
                  </p>
                </div>
              </div>
            )}
            {!isLoading && !fetchError && facturacionData.length > 0 && (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
                  <div className='w-6 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center'>
                    <TrendingUpIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                  </div>
                  <span className='font-medium text-slate-700 dark:text-slate-300 text-sm'>
                    {facturacionData.length} cargos encontrados
                  </span>
                </div>
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
