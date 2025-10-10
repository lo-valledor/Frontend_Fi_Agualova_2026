import {
  ArrowUpToLine,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  HelpCircle,
  ListChecks,
  Loader2,
  Play,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

import { useState } from 'react';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';
import api from '~/lib/api';
import type {
  ConsultarMantenedorRevisionCorte,
  TotalesCorteReposicion
} from '~/types/operaciones';

import { columns } from './columns';

interface CorteReposicionComponentProps {
  totalesData: TotalesCorteReposicion[];
  mantenedorCorteData: ConsultarMantenedorRevisionCorte[];
}

export default function CorteReposicionComponent({
  totalesData,
  mantenedorCorteData: initialMantenedorCorteData
}: Readonly<CorteReposicionComponentProps>) {
  const [isRevisionOpen, setIsRevisionOpen] = useState(true);
  const [mantenedorCorteData, setMantenedorCorteData] = useState<
    ConsultarMantenedorRevisionCorte[]
  >(initialMantenedorCorteData);
  const [isSearching, setIsSearching] = useState(false);

  // Obtener cantidad por código
  const getCantidadPorCodigo = (codigo: string): number => {
    const item = totalesData.find(item => item.codigo === codigo);
    return item ? item.cantidad : 0;
  };

  const handleExportarExcel = async () => {
    try {
      const res = await api.get('exportar-mantenedor-revision', {
        responseType: 'blob'
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
      const res = await api.get('exportar-revision-corte', {
        responseType: 'blob'
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
      const res = await api.post('finalizar-revision');
      if (res.status === 200) {
        toast.success('Proceso de revisión finalizado correctamente.');
        void handleBuscar();
      } else {
        toast.error('Error al finalizar el proceso de revisión.');
      }
    } catch (error) {
      console.error('Error al finalizar el proceso:', error);
      toast.error('Error al finalizar el proceso.');
    }
  };

  // Pasos del tour interactivo con driver.js
  const tourSteps = [
    {
      element: '#panel-revision',
      popover: {
        title: '🔧 Panel de Revisión',
        description:
          'Este es el <strong>panel principal</strong> donde encontrarás todas las herramientas de gestión y control para el proceso de corte y reposición.',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#buscar-btn',
      popover: {
        title: '🔍 Buscar Datos',
        description:
          '¡Empezar aquí! Este botón <strong>actualiza y carga</strong> los datos más recientes del mantenedor de revisión de corte.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#ver-totales-btn',
      popover: {
        title: '📊 Ver Totales',
        description:
          'Muestra un <strong>resumen estadístico</strong> de todos los estados: Pendientes, Liberados, Cortados y Reposición Solicitada.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#estadisticas-rapidas',
      popover: {
        title: '📈 Estadísticas Rápidas',
        description:
          'Vista rápida de los <strong>totales por estado</strong>. Te permite entender la distribución de casos sin abrir el modal.',
        side: 'top' as const,
        align: 'center' as const
      }
    },
    {
      element: '#proceso-buttons',
      popover: {
        title: '⚙️ Activar Actualización',
        description:
          'Primer paso del <strong>flujo de trabajo</strong>: Activa la actualización del proceso de revisión antes de iniciarlo.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#export-buttons',
      popover: {
        title: '💾 Exportar Datos',
        description:
          'Descarga los datos en formato <strong>Excel</strong>. Disponible en dos versiones: Mantenedor completo y Revisión de Corte específica.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#tabla-datos',
      popover: {
        title: '📋 Tabla de Datos',
        description:
          'Listado detallado de todos los registros con <strong>filtros y búsqueda</strong>. Puedes buscar por código, RUT o razón social.',
        side: 'top' as const,
        align: 'start' as const
      }
    }
  ];

  // Función para iniciar el tour
  const startTour = () => {
    const driverjs = driver({
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      smoothScroll: true,
      stagePadding: 4,
      stageRadius: 6,
      animate: true,
      allowClose: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      onHighlightStarted: element => {
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    driverjs.setSteps(tourSteps);
    driverjs.drive();
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          {/* Header */}
          <ModernHeader
            title='Corte y Reposición'
            description='Gestión integral de procesos de corte y reposición de servicios'
          />

          {/* Botón de Guía Interactiva */}
          {/* Botón para iniciar el tour interactivo */}
          <Button
            variant='outline'
            size='sm'
            onClick={startTour}
            className='mb-2'
          >
            <HelpCircle className='h-4 w-4' />
          </Button>
        </div>

        <div className='space-y-4'>
          {/* Panel de Revisión modernizado */}
          <Card
            id='panel-revision'
            className='border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80'
          >
            <Collapsible open={isRevisionOpen} onOpenChange={setIsRevisionOpen}>
              <CollapsibleTrigger asChild>
                <div className='p-3 border-b border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'>
                        <ListChecks className='h-4 w-4' />
                      </div>
                      <div>
                        <CardTitle className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                          Panel de Revisión
                        </CardTitle>
                        <CardDescription className='text-sm text-slate-600 dark:text-slate-400'>
                          Herramientas de gestión y control
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${
                        isRevisionOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className='p-4 space-y-6'>
                  {/* Botones de Acción modernizados */}
                  <div className='flex flex-wrap gap-3 justify-center'>
                    <Button
                      id='buscar-btn'
                      variant='outline'
                      size='sm'
                      onClick={handleBuscar}
                      disabled={isSearching}
                      className='gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300'
                    >
                      {isSearching ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Search className='h-4 w-4' />
                      )}
                      Buscar
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          id='ver-totales-btn'
                          variant='outline'
                          size='sm'
                          className='gap-1.5 border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300'
                        >
                          <BarChart3 className='h-4 w-4' />
                          Ver Totales
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='sm:max-w-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'>
                        <DialogHeader>
                          <DialogTitle className='flex items-center gap-2 text-slate-900 dark:text-slate-100'>
                            <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'>
                              <BarChart3 className='h-4 w-4' />
                            </div>
                            Totales de Corte y Reposición
                          </DialogTitle>
                          <DialogDescription className='text-slate-600 dark:text-slate-400'>
                            Resumen de estados de corte y reposición
                          </DialogDescription>
                        </DialogHeader>
                        <div className='py-4'>
                          <Table className='border border-slate-200 dark:border-slate-700'>
                            <TableBody>
                              <TableRow className='border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'>
                                <TableCell className='py-2 font-medium text-slate-900 dark:text-slate-100'>
                                  Pendiente
                                </TableCell>
                                <TableCell className='py-2 text-center text-slate-600 dark:text-slate-400'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right font-semibold text-slate-800 dark:text-slate-200'>
                                  {getCantidadPorCodigo('NULL')}
                                </TableCell>
                              </TableRow>
                              <TableRow className='border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'>
                                <TableCell className='py-2 font-medium text-slate-900 dark:text-slate-100'>
                                  Liberado
                                </TableCell>
                                <TableCell className='py-2 text-center text-slate-600 dark:text-slate-400'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right font-semibold text-slate-800 dark:text-slate-200'>
                                  {getCantidadPorCodigo('1')}
                                </TableCell>
                              </TableRow>
                              <TableRow className='border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'>
                                <TableCell className='py-2 font-medium text-slate-900 dark:text-slate-100'>
                                  Cortado
                                </TableCell>
                                <TableCell className='py-2 text-center text-slate-600 dark:text-slate-400'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right font-semibold text-slate-800 dark:text-slate-200'>
                                  {getCantidadPorCodigo('2')}
                                </TableCell>
                              </TableRow>
                              <TableRow className='border-b border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'>
                                <TableCell className='py-2 font-medium text-slate-900 dark:text-slate-100'>
                                  Reposición Solicitada
                                </TableCell>
                                <TableCell className='py-2 text-center text-slate-600 dark:text-slate-400'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right font-semibold text-slate-800 dark:text-slate-200'>
                                  {getCantidadPorCodigo('3')}
                                </TableCell>
                              </TableRow>
                              <TableRow className='bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-bold'>
                                <TableCell className='py-2 text-slate-900 dark:text-slate-100'>
                                  TOTAL
                                </TableCell>
                                <TableCell className='py-2 text-center text-slate-600 dark:text-slate-400'>
                                  :
                                </TableCell>
                                <TableCell className='py-2 text-right text-slate-900 dark:text-slate-100'>
                                  {getCantidadPorCodigo('TOTAL')}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      id='export-buttons'
                      variant='default'
                      size='sm'
                      onClick={handleExportarExcel}
                      className='gap-1.5 bg-sky-600 hover:bg-sky-700 text-white'
                    >
                      <Download className='h-4 w-4' />
                      Exportar Excel
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleExportarExcelCorte}
                      className='gap-1.5 bg-sky-600 hover:bg-sky-700 text-white'
                    >
                      <Download className='h-4 w-4' />
                      Exportar Excel Corte
                    </Button>
                    <Button
                      id='proceso-buttons'
                      variant='default'
                      size='sm'
                      onClick={handleActivarActualizacion}
                      className='gap-1.5 bg-slate-600 hover:bg-slate-700 text-white'
                    >
                      <ArrowUpToLine className='h-4 w-4' />
                      Activar Actualización
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleIniciar}
                      className='gap-1.5 bg-slate-600 hover:bg-slate-700 text-white'
                    >
                      <Play className='h-4 w-4' />
                      Iniciar
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleFinalizar}
                      className='gap-1.5 bg-slate-600 hover:bg-slate-700 text-white'
                    >
                      <CheckCircle2 className='h-4 w-4' />
                      Finalizar
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Panel de Datos de Mantenedor modernizado */}
          <Card className='border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80'>
            <div className='p-4 border-b border-slate-200/60 dark:border-slate-700/60'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'>
                  <FileText className='h-4 w-4' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                    Mantenedor de Revisión de Corte
                  </h3>
                  <p className='text-sm text-slate-600 dark:text-slate-400'>
                    Listado de registros de mantenimiento (
                    {mantenedorCorteData.length} registros)
                  </p>
                </div>
              </div>
            </div>
            <div className='p-4'>
              {mantenedorCorteData.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 mb-4'>
                    <FileText className='h-8 w-8 text-slate-400 dark:text-slate-500' />
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
                  <div
                    id='estadisticas-rapidas'
                    className='grid grid-cols-2 lg:grid-cols-4 gap-3'
                  >
                    <div className='bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700'>
                      <div className='text-2xl font-bold text-slate-700 dark:text-slate-300'>
                        {getCantidadPorCodigo('NULL')}
                      </div>
                      <div className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                        Pendientes
                      </div>
                    </div>
                    <div className='bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700'>
                      <div className='text-2xl font-bold text-slate-700 dark:text-slate-300'>
                        {getCantidadPorCodigo('1')}
                      </div>
                      <div className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                        Liberados
                      </div>
                    </div>
                    <div className='bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700'>
                      <div className='text-2xl font-bold text-slate-700 dark:text-slate-300'>
                        {getCantidadPorCodigo('2')}
                      </div>
                      <div className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                        Cortados
                      </div>
                    </div>
                    <div className='bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700'>
                      <div className='text-2xl font-bold text-slate-700 dark:text-slate-300'>
                        {getCantidadPorCodigo('3')}
                      </div>
                      <div className='text-xs text-slate-600 dark:text-slate-400 font-medium'>
                        Reposición Solicitada
                      </div>
                    </div>
                  </div>

                  {/* Tabla moderna */}
                  <div
                    id='tabla-datos'
                    className='border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden'
                  >
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
