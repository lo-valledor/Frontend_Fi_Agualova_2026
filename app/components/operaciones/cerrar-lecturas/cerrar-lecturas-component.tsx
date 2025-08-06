import {
  AlertCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDown,
  ChevronUp,
  CircleX,
  Eraser,
  FileTextIcon,
  SearchIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { useMemo, useState } from 'react';

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
import api from '~/lib/api';
import {
  type Ciclo,
  type EstadoCierreLecturas,
  type PeriodoAbierto,
} from '~/types/operaciones';

import { DataTable } from '../../data-table/data-table';
import AlertCerrarLecturas from './alert-cerrar-lecturas';
import { columns } from './columns';

export default function CerrarLecturasComponent({
  periodoAbierto,
  ciclosFacturacion,
}: {
  periodoAbierto: PeriodoAbierto[];
  ciclosFacturacion: Ciclo[];
}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cicloSeleccionado, setCicloSeleccionado] = useState<string>('');
  const [estadoCierreLecturas, setEstadoCierreLecturas] = useState<
    EstadoCierreLecturas[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<EstadoCierreLecturas[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [totalLecturasCerrar, setTotalLecturasCerrar] = useState(0);

  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      return `${mes.toString().padStart(2, '0')}${anio.toString()}`;
    }
    return '';
  }, [periodoAbierto]);

  const handleSearch = async () => {
    if (!periodoFormateado) {
      toast.error('No hay un periodo abierto disponible');
      return;
    }

    if (!cicloSeleccionado) {
      toast.error('Debe seleccionar un ciclo de facturación');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSelectedRows([]); // Limpiar selección en nueva búsqueda

      const params = new URLSearchParams();
      params.append('cicloFacturable', cicloSeleccionado);
      params.append('periodo', periodoFormateado);

      const response = await api.get('/estado-cierre-lecturas', {
        params,
      });

      if (response.status === 200) {
        const data = response.data as EstadoCierreLecturas[];
        setEstadoCierreLecturas(data);
        if (data.length === 0) {
          toast.info(
            'No se encontraron resultados para los criterios seleccionados'
          );
        } else {
          toast.success(`Se encontraron ${data.length} registros`);
        }
      } else {
        setError('Error al buscar lecturas');
        toast.error('Error al buscar lecturas');
      }
    } catch (error: any) {
      setError(`Error: ${error.message || 'Error desconocido'}`);

      if (error.response) {
        toast.error(
          `Error ${error.response.status}: ${
            error.response.data?.mensaje || 'Error en la consulta'
          }`
        );
      } else if (error.request) {
        toast.error('No se recibió respuesta del servidor');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCicloSeleccionado('');
    setEstadoCierreLecturas([]);
    setSelectedRows([]);
    setError(null);
    toast.success('Filtros limpiados');
  };

  // Función para manejar la actualización después de cerrar lecturas
  const handleLecturaCerrada = () => {
    // Volvemos a buscar para actualizar la lista
    if (cicloSeleccionado && periodoFormateado) {
      handleSearch();
    }
  };

  const handleOpenAlert = () => {
    if (selectedRows.length > 0) {
      const total = selectedRows.reduce(
        (acc, row) =>
          acc +
          row.cantidadLecturasOK +
          row.cantidadClaveRoja +
          row.cantidadClaveNaranja +
          row.cantidadCorregidas,
        0
      );
      setTotalLecturasCerrar(total);
      setIsAlertOpen(true);
    } else {
      toast.info('Debe seleccionar al menos un nicho para cerrar.');
    }
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Cierre de Lecturas
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestión de cierre de lecturas por ciclo de facturación
            </p>
          </div>
        </div>

        {/* Filtros de Búsqueda */}
        <Card className='border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95'>
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
                    Selecciona criterios para cerrar lecturas
                  </CardDescription>
                </div>
              </div>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                {isFiltersOpen ? (
                  <ChevronUp className='h-4 w-4 text-slate-500' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-slate-500' />
                )}
              </Button>
            </div>

            <CollapsibleContent>
              <CardContent className='p-3 space-y-4'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-full'>
                  {/* Periodo */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                      <CalendarIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                      Periodo actual
                    </Label>
                    {periodoAbierto && periodoAbierto.length > 0 ? (
                      <div className='flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60'>
                        <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <CalendarIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                        </div>
                        <div>
                          <span className='font-medium text-slate-900 dark:text-slate-100 text-sm'>
                            {periodoAbierto[0].mes.toString().padStart(2, '0')}/
                            {periodoAbierto[0].anio}
                          </span>
                          <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5'>
                            Periodo activo para facturación
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60'>
                        <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0'>
                          <AlertCircleIcon className='w-4 h-4 text-slate-600 dark:text-slate-400' />
                        </div>
                        <div>
                          <span className='font-medium text-slate-900 dark:text-slate-100 text-sm'>
                            No hay periodo abierto
                          </span>
                          <p className='text-xs text-slate-600 dark:text-slate-400 mt-0.5'>
                            Contacta al administrador
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ciclo de facturación */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='ciclo'
                      className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'
                    >
                      <FileTextIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                      Ciclo de facturación
                    </Label>
                    <Select
                      value={cicloSeleccionado}
                      onValueChange={setCicloSeleccionado}
                    >
                      <SelectTrigger
                        id='ciclo'
                        className='h-10 bg-white dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 focus:border-sky-400 focus:ring-sky-400/20 w-full text-sm'
                      >
                        <SelectValue placeholder='Selecciona un ciclo de facturación' />
                      </SelectTrigger>
                      <SelectContent>
                        {ciclosFacturacion && ciclosFacturacion.length > 0 ? (
                          ciclosFacturacion.map(ciclo => {
                            // Determinar el valor correcto para el API (1 o 2)
                            let valorCiclo = '1';
                            if (
                              ciclo.diaFacturacion === '30' ||
                              ciclo.descripcion.includes('30')
                            ) {
                              valorCiclo = '2';
                            }

                            return (
                              <SelectItem
                                key={ciclo.diaFacturacion}
                                value={valorCiclo}
                                className='hover:bg-slate-50 dark:hover:bg-slate-800'
                              >
                                <div className='flex items-center gap-2'>
                                  <div className='w-2 h-2 rounded-full bg-sky-500'></div>
                                  <span className='font-medium'>
                                    {ciclo.descripcion}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })
                        ) : (
                          <>
                            <SelectItem
                              value='1'
                              className='hover:bg-slate-50 dark:hover:bg-slate-800'
                            >
                              <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full bg-sky-500'></div>
                                <span className='font-medium'>
                                  Ciclo día 15
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value='2'
                              className='hover:bg-slate-50 dark:hover:bg-slate-800'
                            >
                              <div className='flex items-center gap-2'>
                                <div className='w-2 h-2 rounded-full bg-sky-500'></div>
                                <span className='font-medium'>
                                  Ciclo día 30
                                </span>
                              </div>
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className='flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-700/60'>
                  <Button
                    onClick={handleClearFilters}
                    variant='outline'
                    disabled={isLoading}
                    className='gap-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  >
                    <Eraser className='h-4 w-4' />
                    Limpiar
                  </Button>
                  <Button
                    onClick={handleSearch}
                    disabled={
                      isLoading || !cicloSeleccionado || !periodoFormateado
                    }
                    className='gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600'
                  >
                    <SearchIcon className='h-4 w-4' />
                    {isLoading ? 'Buscando...' : 'Buscar Lecturas'}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Resultados de la búsqueda */}
        <Card className='border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95'>
          <CardHeader className='border-b border-slate-200/60 dark:border-slate-700/60 p-3'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60'>
                <CheckCircleIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
              </div>
              <div>
                <CardTitle className='text-base font-medium text-slate-900 dark:text-slate-100'>
                  Estado de Cierre de Lecturas
                </CardTitle>
                <CardDescription className='text-sm text-slate-600 dark:text-slate-400'>
                  {estadoCierreLecturas.length > 0
                    ? `${estadoCierreLecturas.length} lecturas disponibles para cierre`
                    : 'No hay lecturas disponibles para cierre'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-3'>
            {isLoading ? (
              <div className='flex justify-center items-center h-64'>
                <div className='flex flex-col items-center gap-4'>
                  <div className='relative'>
                    <div className='w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700'></div>
                    <div className='absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-sky-600 border-t-transparent animate-spin'></div>
                  </div>
                  <div className='text-center'>
                    <p className='text-slate-700 dark:text-slate-300 font-medium'>
                      Buscando lecturas...
                    </p>
                    <p className='text-sm text-slate-600 dark:text-slate-400 mt-1'>
                      Por favor espere mientras procesamos su consulta
                    </p>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className='p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60'>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center'>
                    <AlertCircleIcon className='w-4 h-4 text-slate-600 dark:text-slate-400' />
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-medium text-slate-900 dark:text-slate-100'>
                      Error al cargar los datos
                    </h4>
                    <p className='mt-1 text-slate-700 dark:text-slate-300 text-sm'>
                      {error}
                    </p>
                    <Button
                      onClick={() => setError(null)}
                      variant='outline'
                      size='sm'
                      className='mt-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            ) : estadoCierreLecturas.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-64 gap-4'>
                <div className='w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center'>
                  <SearchIcon className='w-8 h-8 text-sky-600 dark:text-sky-400' />
                </div>
                <div className='text-center'>
                  <p className='font-medium text-slate-700 dark:text-slate-300 text-sm'>
                    Realizar consulta de lecturas
                  </p>
                  <p className='text-xs text-slate-600 dark:text-slate-400 mt-1'>
                    Selecciona un ciclo y haz clic en "Buscar Lecturas" para ver
                    los resultados
                  </p>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <CheckCircleIcon className='w-4 h-4 text-sky-600 dark:text-sky-400' />
                    </div>
                    <span className='font-medium text-slate-700 dark:text-slate-300 text-sm'>
                      {estadoCierreLecturas.length} registros encontrados
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={handleOpenAlert}
                      disabled={selectedRows.length === 0}
                      className='gap-2'
                    >
                      <CircleX className='h-4 w-4' />
                      Cerrar Lecturas ({selectedRows.length})
                    </Button>
                  </div>
                </div>
                <div className='rounded-lg border border-slate-200/60 dark:border-slate-700/60 overflow-hidden bg-white dark:bg-slate-900'>
                  <DataTable
                    columns={columns}
                    data={estadoCierreLecturas}
                    onRowSelectionChange={setSelectedRows}
                    rowIdKey='nichoId'
                    meta={{
                      allRowsDisabled: estadoCierreLecturas.every(
                        row =>
                          row.cantidadLecturasOK === 0 &&
                          row.cantidadClaveRoja === 0 &&
                          row.cantidadClaveNaranja === 0 &&
                          row.cantidadCorregidas === 0
                      ),
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isAlertOpen && (
          <AlertCerrarLecturas
            isOpen={isAlertOpen}
            onOpenChange={setIsAlertOpen}
            selectedRows={selectedRows}
            cicloFact={cicloSeleccionado}
            periodo={periodoFormateado}
            onSuccess={handleLecturaCerrada}
            totalLecturas={totalLecturasCerrar}
          />
        )}
      </div>
    </div>
  );
}
