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
import { PlusCircleIcon, AlertTriangle, CheckCircle } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import api from '~/lib/api';

export default function AbrirPeriodoFacturacion({
  years,
  periodos,
}: {
  years: Anio[];
  periodos: Periodos[];
}) {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [periodosData, setPeriodosData] = useState(periodos);

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
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
            Periodos de Facturación
          </h1>
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <Button
                      onClick={() => setIsOpenDialog(true)}
                      disabled={!!periodoAbierto}
                      className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusCircleIcon className="h-4 w-4" />
                      Nuevo Periodo
                    </Button>
                  </div>
                </TooltipTrigger>
                {periodoAbierto && (
                  <TooltipContent>
                    <p>
                      Debe cerrar el periodo vigente para poder crear uno nuevo.
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <p className="text-muted-foreground">
          Gestiona los periodos de facturación del sistema
        </p>
      </div>
      {periodoAbierto ? (
        <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
              <span>Periodo Vigente Abierto</span>
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-400">
              El periodo de{' '}
              <span className="font-semibold">
                {periodoAbierto.pf_descripcion}
              </span>{' '}
              está actualmente abierto.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-b-lg p-4 bg-amber-50/80 dark:bg-amber-900/20">
            <p className="text-sm text-amber-900 dark:text-amber-200 flex-1">
              Para crear un nuevo periodo de facturación, primero debe cerrar el
              actual. Esta acción es irreversible a menos que un administrador
              lo reabra.
            </p>
            <CerrarPeriodo
              periodoId={periodoAbierto.pf_id}
              className="w-full md:w-auto"
            />
          </CardContent>
        </Card>
      ) : (
        <Alert className="border-green-500/50 bg-green-50/50 dark:bg-green-900/10">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-300">
            No hay periodos abiertos
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            Puede crear un nuevo periodo de facturación. Todas las operaciones
            se registrarán en el nuevo periodo.
          </AlertDescription>
        </Alert>
      )}
      {/* Tabla de resultados como componente principal */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Periodos</CardTitle>
          <CardDescription>
            Visualiza todos los periodos de facturación pasados del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={periodos} />
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
