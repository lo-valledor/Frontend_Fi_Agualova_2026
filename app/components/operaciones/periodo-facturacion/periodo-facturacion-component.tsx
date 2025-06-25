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
  Calendar,
  Clock,
  History,
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

export default function AbrirPeriodoFacturacion({
  years,
  periodos,
}: {
  years: Anio[];
  periodos: Periodos[];
}) {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [, setPeriodosData] = useState(periodos);

  //Se ejecuta cuando se crea un nuevo periodo
  const fetchPeriodos = async () => {
    const res = await api.get('/consulta-periodo');
    setPeriodosData(res.data as Periodos[]);
  };

  const periodoAbierto = useMemo(() => {
    return periodos.find((periodo) => periodo.epf_descripcion === 'Abierto');
  }, [periodos]);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header modernizado */}
      <div className="flex items-center gap-4 border-b border-border/40 pb-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-sky-500 text-white shadow-sm">
          <Calendar className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Períodos de Facturación
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestión y control de períodos de facturación del sistema
          </p>
        </div>
      </div>

      {/* Status Card */}
      {periodoAbierto ? (
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Período Activo
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
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
                        className="gap-2 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusCircleIcon className="h-4 w-4" />
                        Nuevo Período
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
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Para crear un nuevo período de facturación, primero debe
                    cerrar el actual.
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">
                  Esta acción es irreversible a menos que un administrador lo
                  reabra posteriormente.
                </p>
              </div>
              <CerrarPeriodo
                periodoId={periodoAbierto.pf_id}
                className="w-full lg:w-auto min-w-40"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 backdrop-blur-sm border-emerald-200/50 dark:border-emerald-800/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <AlertTitle className="text-xl text-emerald-800 dark:text-emerald-300 font-semibold">
                    Sistema Disponible
                  </AlertTitle>
                  <AlertDescription className="text-emerald-700 dark:text-emerald-400 mt-1">
                    No hay períodos abiertos. Puede crear un nuevo período de
                    facturación. Todas las operaciones se registrarán en el
                    nuevo período.
                  </AlertDescription>
                </div>
              </div>
              <Button
                onClick={() => setIsOpenDialog(true)}
                className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlusCircleIcon className="h-4 w-4" />
                Crear Período
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History Table */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
              <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                Historial de Períodos
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Visualiza todos los períodos de facturación del sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
            <DataTable
              columns={columns}
              data={periodos}
              initialSorting={[{ id: 'Column1', desc: true }]}
            />
          </div>
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
  );
}
