import {
  ArrowUpToLine,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  ListChecks,
  Loader2,
  Play,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

import { useActivityEvent } from '~/components/activity-tracker-hoc';
import { DataTable } from '~/components/data-table/data-table';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';
import api from '~/lib/api';
import type {
  ConsultarMantenedorRevisionCorte,
  TotalesCorteReposicion,
} from '~/types/operaciones';

import { columns } from './columns';

interface CorteReposicionComponentProps {
  totalesData: TotalesCorteReposicion[];
  mantenedorCorteData: ConsultarMantenedorRevisionCorte[];
}

export default function CorteReposicionComponent({
  totalesData,
  mantenedorCorteData: initialMantenedorCorteData,
}: CorteReposicionComponentProps) {
  const [isRevisionOpen, setIsRevisionOpen] = useState(true);
  const [mantenedorCorteData, setMantenedorCorteData] = useState<
    ConsultarMantenedorRevisionCorte[]
  >(initialMantenedorCorteData);
  const [isSearching, setIsSearching] = useState(false);

  const { trackPageView, trackDataAction } = useActivityEvent();

  // Rastrear vista de página
  useEffect(() => {
    trackPageView('Corte y Reposición');
  }, [trackPageView]);

  // Obtener cantidad por código
  const getCantidadPorCodigo = (codigo: string): number => {
    const item = totalesData.find(item => item.codigo === codigo);
    return item ? item.cantidad : 0;
  };

  const handleExportarExcel = async () => {
    try {
      trackDataAction(
        'Exportar',
        'Corte y Reposición',
        'Exportar mantenedor revisión'
      );
      const res = await api.get('exportar-mantenedor-revision', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data as Blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mantenedor_revision.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Archivo exportado correctamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      toast.error('Error al exportar el archivo');
    }
  };

  const handleExportarExcelCorte = async () => {
    try {
      trackDataAction(
        'Exportar',
        'Corte y Reposición',
        'Exportar revisión corte'
      );
      const res = await api.get('exportar-revision-corte', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data as Blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'revision_corte.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Archivo exportado correctamente');
    } catch (error) {
      console.error('Error al exportar Excel corte:', error);
      toast.error('Error al exportar el archivo');
    }
  };

  const handleBuscar = async () => {
    setIsSearching(true);
    try {
      trackDataAction(
        'Buscar',
        'Corte y Reposición',
        'Consultar mantenedor revisión corte'
      );
      const res = await api.get<ConsultarMantenedorRevisionCorte[]>(
        'consulta-mantenedor-revision-corte'
      );
      if (Array.isArray(res.data)) {
        setMantenedorCorteData(res.data);
        toast.success(`Se encontraron ${res.data.length} registros`);
      }
    } catch (error) {
      console.error('Error al buscar datos de corte y reposición:', error);
      toast.error('Error al buscar los datos de corte y reposición.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleActivarActualizacion = async () => {
    try {
      trackDataAction(
        'Activar',
        'Corte y Reposición',
        'Activar actualización revisión'
      );
      const res = await api.post('modificar-revision');
      if (res.status === 200) {
        toast.success('Proceso de revisión modificado correctamente.');
        void handleBuscar();
      } else {
        toast.error('Error al activar la actualización.');
      }
    } catch (error) {
      console.error('Error al activar la actualización:', error);
      toast.error('Error al activar la actualización.');
    }
  };

  const handleIniciar = async () => {
    try {
      trackDataAction(
        'Iniciar',
        'Corte y Reposición',
        'Iniciar proceso de revisión'
      );
      const res = await api.post('ingresar-revision');
      if (res.status === 200) {
        toast.success('Proceso de revisión iniciado correctamente.');
        void handleBuscar();
      } else {
        toast.error('Error al iniciar el proceso de revisión.');
      }
    } catch (error) {
      console.error('Error al iniciar el proceso de revisión:', error);
      toast.error('Error al iniciar el proceso de revisión.');
    }
  };

  const handleFinalizar = async () => {
    try {
      trackDataAction(
        'Finalizar',
        'Corte y Reposición',
        'Finalizar proceso de revisión'
      );
      toast.info('Funcionalidad de finalización en desarrollo');
      /* const res = await api.delete('eliminar-revision');
      if (res.status === 200) {
        toast.success('Actualización activada correctamente');
      } else {
        toast.error('Error al activar actualización');
      } */
    } catch (error) {
      console.error('Error al finalizar el proceso:', error);
      toast.error('Error al finalizar el proceso.');
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-950 dark:to-red-950/30'>
      <div className='container mx-auto p-2 space-y-3'>
        {/* Modern Header */}
        <div className='flex items-center gap-3 py-1 border-b border-slate-200 dark:border-slate-700'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 justify-between'>
              <div className='flex items-center gap-3'>
                <h1 className='text-3xl font-bold bg-clip-text text-sky-900 dark:text-sky-100'>
                  Corte y Reposición
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Principal */}
        <div className='grid grid-cols-1 gap-6'>
          {/* Panel de Revisión */}
          <Card className='rounded-xl border border-sky-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-sky-800/40 dark:bg-gray-900/50'>
            <Collapsible
              open={isRevisionOpen}
              onOpenChange={setIsRevisionOpen}
              className='w-full'
            >
              <CollapsibleTrigger asChild>
                <div className='flex justify-between items-center p-4 cursor-pointer hover:bg-sky-50/50 rounded-t-xl dark:hover:bg-sky-900/20'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-sm'>
                      <ListChecks className='h-4 w-4' />
                    </div>
                    <div>
                      <CardTitle className='text-lg font-semibold text-sky-900 dark:text-sky-100'>
                        Revisión
                      </CardTitle>
                      <CardDescription className='text-sm text-sky-700 dark:text-sky-300'>
                        Acciones de gestión y operaciones
                      </CardDescription>
                    </div>
                  </div>
                  {isRevisionOpen ? (
                    <ChevronUp className='h-5 w-5 text-sky-600 dark:text-sky-400' />
                  ) : (
                    <ChevronDown className='h-5 w-5 text-sky-600 dark:text-sky-400' />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className='p-4 space-y-6'>
                  {/* Botones de Acción modernizados */}
                  <div className='flex flex-wrap gap-3 justify-center'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleBuscar}
                      disabled={isSearching}
                      className='gap-1.5 border-sky-200 hover:bg-sky-50 text-sky-700 dark:border-sky-800 dark:hover:bg-sky-900/30 dark:text-sky-300'
                    >
                      {isSearching ? (
                        <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <Search className='h-3.5 w-3.5' />
                      )}
                      Buscar
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          className='gap-1.5 border-sky-200 hover:bg-sky-50 text-sky-700 dark:border-sky-800 dark:hover:bg-sky-900/30 dark:text-sky-300'
                        >
                          <BarChart3 className='h-3.5 w-3.5' />
                          Ver Totales
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-md rounded-xl border border-amber-200/40 bg-white/95 backdrop-blur-sm dark:border-amber-800/40 dark:bg-gray-900/95'>
                        <DialogHeader>
                          <DialogTitle className='flex items-center gap-2 text-sky-900 dark:text-sky-100'>
                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-500 text-white'>
                              <BarChart3 className='h-3 w-3' />
                            </div>
                            Totales de Corte y Reposición
                          </DialogTitle>
                          <DialogDescription className='text-sky-700 dark:text-sky-300'>
                            Resumen de estados de corte y reposición
                          </DialogDescription>
                        </DialogHeader>
                        <div className='py-4'>
                          <Table className='border-collapse border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden'>
                            <TableBody>
                              <TableRow className='border border-amber-200/60 hover:bg-amber-50/50 dark:border-amber-800/60 dark:hover:bg-amber-900/20'>
                                <TableCell className='py-2 font-medium text-amber-900 dark:text-amber-100'>
                                  Pendiente
                                </TableCell>
                                <TableCell className='py-2 text-center text-amber-600 dark:text-amber-400'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right font-semibold text-amber-800 dark:text-amber-200'>
                                  {getCantidadPorCodigo('NULL')}
                                </TableCell>
                              </TableRow>
                              <TableRow className='border border-amber-200/60 hover:bg-amber-50/50 dark:border-amber-800/60 dark:hover:bg-amber-900/20'>
                                <TableCell className='py-2 font-medium text-amber-900 dark:text-amber-100'>
                                  Liberado
                                </TableCell>
                                <TableCell className='py-2 text-center text-amber-600 dark:text-amber-400'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right font-semibold text-amber-800 dark:text-amber-200'>
                                  {getCantidadPorCodigo('1')}
                                </TableCell>
                              </TableRow>
                              <TableRow className='border border-amber-200/60 hover:bg-amber-50/50 dark:border-amber-800/60 dark:hover:bg-amber-900/20'>
                                <TableCell className='py-2 font-medium text-amber-900 dark:text-amber-100'>
                                  Cortado
                                </TableCell>
                                <TableCell className='py-2 text-center text-amber-600 dark:text-amber-400'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right font-semibold text-amber-800 dark:text-amber-200'>
                                  {getCantidadPorCodigo('2')}
                                </TableCell>
                              </TableRow>
                              <TableRow className='border border-amber-200/60 hover:bg-amber-50/50 dark:border-amber-800/60 dark:hover:bg-amber-900/20'>
                                <TableCell className='py-2 font-medium text-amber-900 dark:text-amber-100'>
                                  Reposición Solicitada
                                </TableCell>
                                <TableCell className='py-2 text-center text-amber-600 dark:text-amber-400'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right font-semibold text-amber-800 dark:text-amber-200'>
                                  {getCantidadPorCodigo('3')}
                                </TableCell>
                              </TableRow>
                              <TableRow className='bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-300 dark:border-amber-700 font-bold'>
                                <TableCell className='py-2 text-amber-900 dark:text-amber-100'>
                                  TOTAL
                                </TableCell>
                                <TableCell className='py-2 text-center text-amber-700 dark:text-amber-300'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right text-amber-900 dark:text-amber-100'>
                                  {getCantidadPorCodigo('TOTAL')}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleExportarExcel}
                      className='gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    >
                      <Download className='h-3.5 w-3.5' />
                      Exportar Excel
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleExportarExcelCorte}
                      className='gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    >
                      <Download className='h-3.5 w-3.5' />
                      Exportar Excel Corte
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleActivarActualizacion}
                      className='gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                    >
                      <ArrowUpToLine className='h-3.5 w-3.5' />
                      Activar Actualización
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleIniciar}
                      className='gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    >
                      <Play className='h-3.5 w-3.5' />
                      Iniciar
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleFinalizar}
                      className='gap-1.5 bg-red-600 hover:bg-red-700 text-white shadow-sm'
                    >
                      <CheckCircle2 className='h-3.5 w-3.5' />
                      Finalizar
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Panel de Datos de Mantenedor modernizado */}
          <Card className='rounded-xl border border-slate-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-slate-800/40 dark:bg-gray-900/50'>
            <div className='p-4 border-b border-slate-200/40 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 dark:border-slate-800/40 rounded-t-xl'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'>
                  <FileText className='h-4 w-4' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-sky-900 dark:text-sky-100'>
                    Mantenedor de Revisión de Corte
                  </h3>
                  <p className='text-sm text-sky-600 dark:text-sky-400'>
                    Listado de registros de mantenimiento (
                    {mantenedorCorteData.length} registros)
                  </p>
                </div>
              </div>
            </div>
            <div className='p-4'>
              {mantenedorCorteData.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-sky-500 dark:text-sky-400'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 mb-4'>
                    <FileText className='h-8 w-8 text-sky-400 dark:text-sky-500' />
                  </div>
                  <p className='text-lg font-medium'>
                    No se encontraron registros
                  </p>
                  <p className='text-sm'>
                    No hay datos de mantenimiento disponibles
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Estadísticas rápidas */}
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    <div className='bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-3 border border-amber-200/40 dark:border-amber-800/40'>
                      <div className='text-2xl font-bold text-amber-700 dark:text-amber-300'>
                        {getCantidadPorCodigo('NULL')}
                      </div>
                      <div className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
                        Pendientes
                      </div>
                    </div>
                    <div className='bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-3 border border-emerald-200/40 dark:border-emerald-800/40'>
                      <div className='text-2xl font-bold text-emerald-700 dark:text-emerald-300'>
                        {getCantidadPorCodigo('1')}
                      </div>
                      <div className='text-xs text-emerald-600 dark:text-emerald-400 font-medium'>
                        Liberados
                      </div>
                    </div>
                    <div className='bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg p-3 border border-red-200/40 dark:border-red-800/40'>
                      <div className='text-2xl font-bold text-red-700 dark:text-red-300'>
                        {getCantidadPorCodigo('2')}
                      </div>
                      <div className='text-xs text-red-600 dark:text-red-400 font-medium'>
                        Cortados
                      </div>
                    </div>
                    <div className='bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-sky-200/40 dark:border-sky-800/40'>
                      <div className='text-2xl font-bold text-sky-700 dark:text-sky-300'>
                        {getCantidadPorCodigo('3')}
                      </div>
                      <div className='text-xs text-sky-600 dark:text-sky-400 font-medium'>
                        Reposición Solicitada
                      </div>
                    </div>
                  </div>

                  {/* Tabla moderna */}
                  <div className='rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg overflow-hidden'>
                    <DataTable
                      columns={columns}
                      data={mantenedorCorteData}
                      meta={{ handleBuscar }}
                      searchPlaceholder='Buscar por código, RUT o razón social...'
                      defaultPageSize={15}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
