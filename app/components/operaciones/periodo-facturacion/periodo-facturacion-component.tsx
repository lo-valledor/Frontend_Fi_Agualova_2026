import {
  AlertTriangle,
  CheckCircle,
  Clock,
  History,
  PlusCircleIcon
} from 'lucide-react';

import { useMemo, useState } from 'react';

import { useAuth } from '~/context/AuthContext';

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
  const [periodosData, setPeriodosData] = useState(periodos);
  const { canCreate, canDelete } = useAuth();

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Período Facturación' }
  ];

  //Se ejecuta cuando se crea o cierra un periodo
  const fetchPeriodos = async () => {
    const res = await api.get('/consulta-periodo');
    setPeriodosData(res.data as Periodos[]);
  };

  const periodoAbierto = useMemo(() => {
    return periodosData.find(periodo => periodo.epf_descripcion === 'Abierto');
  }, [periodosData]);

  if (error) {
    return (
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto p-3 space-y-4'>
          <div className='text-center py-8'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-xl mb-3'>
              <AlertTriangle className='w-6 h-6 text-destructive' />
            </div>
            <h1 className='text-xl font-semibold mb-2'>
              Error al cargar datos
            </h1>
            <p className='text-sm text-muted-foreground'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Header */}
        <ModernHeader
          title='Período Facturación'
          description='Gestión de períodos de facturación activos'
        />

        {/* Status Card */}
        {periodoAbierto ? (
          <Card className='border border-border shadow-sm'>
            <CardHeader className=''>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center'>
                    <Clock className='w-4 h-4' />
                  </div>
                  <div>
                    <CardTitle className='text-base'>Período Activo</CardTitle>
                    <CardDescription className='mt-1 text-xs'>
                      <span className='font-medium text-primary'>
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
                          disabled={
                            !!periodoAbierto ||
                            !canCreate(
                              '/dashboard/operaciones/periodo-facturacion'
                            )
                          }
                          variant='outline'
                          size='sm'
                          className='gap-2 w-full sm:w-auto'
                        >
                          <PlusCircleIcon className='h-4 w-4' />
                          <span className='text-sm'>Nuevo Período</span>
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {(periodoAbierto ||
                      !canCreate(
                        '/dashboard/operaciones/periodo-facturacion'
                      )) && (
                      <TooltipContent>
                        {!canCreate(
                          '/dashboard/operaciones/periodo-facturacion'
                        ) ? (
                          <p>No tiene permisos para crear períodos</p>
                        ) : (
                          <p>
                            Debe cerrar el período vigente para poder crear uno
                            nuevo.
                          </p>
                        )}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className='pt-0 p-4'>
              <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border border-border'>
                <div className='flex-1 space-y-1'>
                  <div className='flex items-start gap-2'>
                    <AlertTriangle className='w-4 h-4 text-warning mt-0.5 flex-shrink-0' />
                    <p className='text-xs text-foreground'>
                      Para crear un nuevo período de facturación, primero debe
                      cerrar el actual.
                    </p>
                  </div>
                  <p className='text-xs text-muted-foreground ml-6'>
                    Esta acción es irreversible a menos que un administrador lo
                    reabra posteriormente.
                  </p>
                </div>
                <CerrarPeriodo
                  periodoId={periodoAbierto.pf_id}
                  onSuccess={fetchPeriodos}
                  className='w-full lg:w-auto min-w-32'
                  disabled={
                    !canDelete('/dashboard/operaciones/periodo-facturacion')
                  }
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className='border border-border shadow-sm'>
            <CardContent className='p-4'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-success/10 rounded-xl flex items-center justify-center'>
                    <CheckCircle className='w-4 h-4 text-success' />
                  </div>
                  <div>
                    <AlertTitle className='text-base text-foreground font-medium'>
                      Sistema Disponible
                    </AlertTitle>
                    <AlertDescription className='text-muted-foreground mt-1 text-xs'>
                      No hay períodos abiertos. Puede crear un nuevo período de
                      facturación. Todas las operaciones se registrarán en el
                      nuevo período.
                    </AlertDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpenDialog(true)}
                  size='sm'
                  variant='default'
                >
                  <PlusCircleIcon className='h-4 w-4' />
                  <span className='text-sm'>Crear Período</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Table */}
        <Card className='border border-border shadow-sm'>
          <CardHeader className='border-b border-border bg-background p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center'>
                <History className='w-4 h-4' />
              </div>
              <div>
                <CardTitle className='text-base'>
                  Historial de Períodos
                </CardTitle>
                <CardDescription className='text-xs'>
                  Gestión completa de períodos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-4'>
            {periodosData.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-8'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3'>
                  <History className='h-6 w-6 text-muted-foreground' />
                </div>
                <p className='text-base font-medium text-foreground'>
                  No se encontraron períodos
                </p>
                <p className='text-xs text-muted-foreground'>
                  No hay períodos de facturación registrados
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Estadísticas */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                  <div className='bg-muted/30 rounded-xl p-3 border border-border'>
                    <div className='flex items-center gap-2'>
                      <CheckCircle className='w-4 h-4 text-success' />
                      <div>
                        <div className='text-xl font-semibold text-foreground'>
                          {
                            periodosData.filter(
                              p => p.epf_descripcion === 'Abierto'
                            ).length
                          }
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          Períodos Abiertos
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='bg-muted/30 rounded-xl p-3 border border-border'>
                    <div className='flex items-center gap-2'>
                      <Clock className='w-4 h-4 text-destructive' />
                      <div>
                        <div className='text-xl font-semibold text-foreground'>
                          {
                            periodosData.filter(
                              p => p.epf_descripcion === 'Cerrado'
                            ).length
                          }
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          Períodos Cerrados
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='bg-muted/30 rounded-xl p-3 border border-border'>
                    <div className='flex items-center gap-2'>
                      <History className='w-4 h-4 text-foreground' />
                      <div>
                        <div className='text-xl font-semibold text-foreground'>
                          {periodosData.length}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          Total Períodos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla */}
                <div className='rounded-xl border border-border overflow-hidden'>
                  <DataTable
                    columns={columns}
                    data={periodosData}
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
