import {
  AlertTriangle,
  CheckCircle,
  Clock,
  History,
  PlusCircleIcon
} from 'lucide-react';

import { useMemo, useState } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import api from '~/lib/api';
import type { Anio, Periodos } from '~/types/operaciones';

import CerrarPeriodo from './cerrar-periodo';
import { columns } from './columns';
import DialogNuevoPeriodo from './dialog-nuevo-periodo';

export default function AbrirPeriodoFacturacion({
  years,
  periodos,
  error
}: Readonly<{
  years: Anio[];
  periodos: Periodos[];
  error: string | null;
}>) {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [, setPeriodosData] = useState(periodos);

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Período Facturación' }
  ];

  //Se ejecuta cuando se crea un nuevo periodo
  const fetchPeriodos = async () => {
    const res = await api.get('/consulta-periodo');
    setPeriodosData(res.data as Periodos[]);
  };

  const periodoAbierto = useMemo(() => {
    return periodos.find(periodo => periodo.epf_descripcion === 'Abierto');
  }, [periodos]);

  if (error) {
    return (
      <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
        <div className='container mx-auto p-3 space-y-4'>
          <div className='text-center py-8'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-lg mb-3'>
              <AlertTriangle className='w-6 h-6 text-red-600 dark:text-red-400' />
            </div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2'>
              Error al cargar datos
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Header */}
        <ModernHeader
          title='Período Facturación'
          description='Gestión de períodos de facturación activos'
        />

        {/* Status Card */}
        {periodoAbierto ? (
          <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
            <CardHeader className=''>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center'>
                    <Clock className='w-4 h-4 text-slate-600 dark:text-slate-400' />
                  </div>
                  <div>
                    <CardTitle className='text-base text-slate-900 dark:text-slate-100'>
                      Período Activo
                    </CardTitle>
                    <CardDescription className='text-slate-600 dark:text-slate-400 mt-1 text-xs'>
                      <span className='font-medium text-blue-600 dark:text-blue-400'>
                        {periodoAbierto.pf_descripcion}
                      </span>{' '}
                      está abierto
                    </CardDescription>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div className='inline-block w-full sm:w-auto'>
                        <Button
                          onClick={() => setIsOpenDialog(true)}
                          disabled={!!periodoAbierto}
                          variant='outline'
                          size='sm'
                          className='gap-2 w-full sm:w-auto'
                        >
                          <PlusCircleIcon className='h-4 w-4' />
                          <span className='text-sm'>Nuevo Período</span>
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {periodoAbierto && (
                      <TooltipContent>
                        <p>
                          Debe cerrar el período vigente para poder crear uno
                          nuevo.
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className='pt-0 p-4'>
              <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700'>
                <div className='flex-1 space-y-1'>
                  <div className='flex items-start gap-2'>
                    <AlertTriangle className='w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0' />
                    <p className='text-xs text-slate-700 dark:text-slate-300'>
                      Para crear un nuevo período de facturación, primero debe
                      cerrar el actual.
                    </p>
                  </div>
                  <p className='text-xs text-slate-500 dark:text-slate-400 ml-6'>
                    Esta acción es irreversible a menos que un administrador lo
                    reabra posteriormente.
                  </p>
                </div>
                <CerrarPeriodo
                  periodoId={periodoAbierto.pf_id}
                  className='w-full lg:w-auto min-w-32'
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
            <CardContent className='p-4'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center'>
                    <CheckCircle className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                  </div>
                  <div>
                    <AlertTitle className='text-base text-emerald-800 dark:text-emerald-300 font-medium'>
                      Sistema Disponible
                    </AlertTitle>
                    <AlertDescription className='text-emerald-700 dark:text-emerald-400 mt-1 text-xs'>
                      No hay períodos abiertos. Puede crear un nuevo período de
                      facturación. Todas las operaciones se registrarán en el
                      nuevo período.
                    </AlertDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpenDialog(true)}
                  size='sm'
                  className='gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white'
                >
                  <PlusCircleIcon className='h-4 w-4' />
                  <span className='text-sm'>Crear Período</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Table */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardHeader className='border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center'>
                <History className='w-4 h-4 text-slate-600 dark:text-slate-400' />
              </div>
              <div>
                <CardTitle className='text-base text-slate-900 dark:text-slate-100'>
                  Historial de Períodos
                </CardTitle>
                <CardDescription className='text-slate-600 dark:text-slate-400 text-xs'>
                  Gestión completa de períodos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-4'>
            {periodos.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400'>
                <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 mb-3'>
                  <History className='h-6 w-6 text-slate-400 dark:text-slate-500' />
                </div>
                <p className='text-base font-medium'>
                  No se encontraron períodos
                </p>
                <p className='text-xs'>
                  No hay períodos de facturación registrados
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Estadísticas */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <div className='bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700'>
                    <div className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                      <div>
                        <div className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
                          {
                            periodos.filter(
                              p => p.epf_descripcion === 'Abierto'
                            ).length
                          }
                        </div>
                        <div className='text-xs text-slate-600 dark:text-slate-400'>
                          Períodos Abiertos
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700'>
                    <div className='flex items-center gap-2'>
                      <Clock className='w-4 h-4 text-red-600 dark:text-red-400' />
                      <div>
                        <div className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
                          {
                            periodos.filter(
                              p => p.epf_descripcion === 'Cerrado'
                            ).length
                          }
                        </div>
                        <div className='text-xs text-slate-600 dark:text-slate-400'>
                          Períodos Cerrados
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700'>
                    <div className='flex items-center gap-2'>
                      <History className='w-4 h-4 text-slate-600 dark:text-slate-400' />
                      <div>
                        <div className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
                          {periodos.length}
                        </div>
                        <div className='text-xs text-slate-600 dark:text-slate-400'>
                          Total Períodos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla */}
                <div className='rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden'>
                  <DataTable
                    columns={columns}
                    data={periodos}
                    initialSorting={[{ id: 'Column1', desc: true }]}
                    searchPlaceholder='Buscar por descripción o ID...'
                    defaultPageSize={10}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para crear nuevo periodo */}
        <DialogNuevoPeriodo
          open={isOpenDialog}
          onOpenChange={setIsOpenDialog}
          onPeriodoCreated={() => {
            setIsOpenDialog(false);
            fetchPeriodos();
          }}
          years={years}
        />
      </div>
    </div>
  );
}
