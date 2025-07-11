import React, { useMemo, useState } from 'react';
import { columns } from './columns';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from '~/components/ui/card';
import {
  PlusCircleIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  History,
  Info,
} from 'lucide-react';
import DialogNuevoPeriodo from './dialog-nuevo-periodo';
import type { Anio, Periodos } from '~/types/operaciones';
import { DataTable } from '~/components/data-table/data-table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import CerrarPeriodo from './cerrar-periodo';
import { AlertDescription, AlertTitle } from '~/components/ui/alert';
import api from '~/lib/api';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';

export default function AbrirPeriodoFacturacion({
  years,
  periodos,
  error,
}: {
  years: Anio[];
  periodos: Periodos[];
  error: string | null;
}) {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [, setPeriodosData] = useState(periodos);

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Período Facturación' },
  ];

  //Se ejecuta cuando se crea un nuevo periodo
  const fetchPeriodos = async () => {
    const res = await api.get('/consulta-periodo');
    setPeriodosData(res.data as Periodos[]);
  };

  const periodoAbierto = useMemo(() => {
    return periodos.find((periodo) => periodo.epf_descripcion === 'Abierto');
  }, [periodos]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950/30">
        <div className="container mx-auto p-2 space-y-3">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Error al cargar datos
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950/30">
      <div className="container mx-auto p-2 space-y-3">
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Modern Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 dark:from-blue-100 dark:to-sky-100 bg-clip-text text-transparent">
              Períodos de Facturación
            </h1>
          </div>
          <div className="flex items-center gap-3 justify-end w-full">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-yellow-100 dark:hover:bg-yellow-800/50"
                >
                  <Info className="w-4 h-4 mr-1 text-yellow-600" />
                  <span className="text-yellow-600 text-sm">Información</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Información</DialogTitle>
                  <DialogDescription>
                    Gestión y control de períodos de facturación del sistema
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Status Card */}
        {periodoAbierto ? (
          <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Período Activo
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {periodoAbierto.pf_descripcion}
                      </span>{' '}
                      está abierto para operaciones
                    </CardDescription>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div className="inline-block">
                        <Button
                          onClick={() => setIsOpenDialog(true)}
                          disabled={!!periodoAbierto}
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <PlusCircleIcon className="h-3 w-3" />
                          <span className="text-sm">Nuevo Período</span>
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
            <CardContent className="pt-0">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex-1 space-y-1">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      Para crear un nuevo período de facturación, primero debe
                      cerrar el actual.
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 ml-5">
                    Esta acción es irreversible a menos que un administrador lo
                    reabra posteriormente.
                  </p>
                </div>
                <CerrarPeriodo
                  periodoId={periodoAbierto.pf_id}
                  className="w-full lg:w-auto min-w-32"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-800/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <AlertTitle className="text-lg text-emerald-800 dark:text-emerald-300 font-semibold">
                      Sistema Disponible
                    </AlertTitle>
                    <AlertDescription className="text-emerald-700 dark:text-emerald-400 mt-1 text-sm">
                      No hay períodos abiertos. Puede crear un nuevo período de
                      facturación. Todas las operaciones se registrarán en el
                      nuevo período.
                    </AlertDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpenDialog(true)}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <PlusCircleIcon className="h-3 w-3" />
                  <span className="text-sm">Crear Período</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Table */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-900 dark:text-slate-100">
                  Historial de Períodos
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm">
                  Visualiza todos los períodos de facturación del sistema (
                  {periodos.length} períodos)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {periodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 mb-4">
                  <History className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-lg font-medium">
                  No se encontraron períodos
                </p>
                <p className="text-sm">
                  No hay períodos de facturación registrados
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg p-3 border border-emerald-200/40 dark:border-emerald-800/40">
                    <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {
                        periodos.filter((p) => p.epf_descripcion === 'Abierto')
                          .length
                      }
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Períodos Abiertos
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg p-3 border border-red-200/40 dark:border-red-800/40">
                    <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {
                        periodos.filter((p) => p.epf_descripcion === 'Cerrado')
                          .length
                      }
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Períodos Cerrados
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-lg p-3 border border-slate-200/40 dark:border-slate-800/40">
                    <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                      {periodos.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Total Períodos
                    </div>
                  </div>
                </div>

                {/* Tabla moderna */}
                <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg overflow-hidden">
                  <DataTable
                    columns={columns}
                    data={periodos}
                    initialSorting={[{ id: 'Column1', desc: true }]}
                    searchPlaceholder="Buscar por descripción o ID..."
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
