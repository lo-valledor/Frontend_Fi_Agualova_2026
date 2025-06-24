import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  ChevronUp,
  ChevronDown,
  FileText,
  ArrowUpToLine,
  ListChecks,
  Download,
  Play,
  CheckCircle2,
  BarChart3,
  Info,
} from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';
import type {
  TotalesCorteReposicion,
  ConsultarMantenedorRevisionCorte,
} from '~/types/operaciones';
import { DataTable } from '~/components/data-table/data-table';
import { columns } from './columns';
import api from '~/lib/api';

interface CorteReposicionComponentProps {
  totalesData: TotalesCorteReposicion[];
  mantenedorCorteData: ConsultarMantenedorRevisionCorte[];
}

export default function CorteReposicionComponent({
  totalesData,
  mantenedorCorteData,
}: CorteReposicionComponentProps) {
  const [isRevisionOpen, setIsRevisionOpen] = useState(true);

  // Obtener cantidad por código
  const getCantidadPorCodigo = (codigo: string): number => {
    const item = totalesData.find((item) => item.codigo === codigo);
    return item ? item.cantidad : 0;
  };

  const handleExportarExcel = async () => {
    const res = await api.get('exportar-mantenedor-revision', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data as Blob]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corte_reposicion.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportarExcelCorte = async () => {
    const res = await api.get('exportar-revision-corte', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([res.data as Blob]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corte.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleActivarActualizacion = () => {
    // Implementar lógica para activar actualización
  };

  const handleIniciar = () => {
    // Implementar lógica para iniciar
  };

  const handleFinalizar = () => {
    // Implementar lógica para finalizar
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-950 dark:to-red-950/30">
      <div className="container mx-auto p-2 space-y-3">
        {/* Header modernizado */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 dark:from-red-100 dark:to-rose-100 bg-clip-text text-transparent">
              Corte y Reposición
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger>
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
                    Gestión de cortes y reposiciones del servicio
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Sección Principal */}
        <div className="grid grid-cols-1 gap-6">
          {/* Panel de Revisión */}
          <Card className="rounded-xl border border-rose-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-rose-800/40 dark:bg-gray-900/50">
            <Collapsible
              open={isRevisionOpen}
              onOpenChange={setIsRevisionOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-rose-50/50 rounded-t-xl dark:hover:bg-rose-900/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm">
                      <ListChecks className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-rose-900 dark:text-rose-100">
                        Revisión
                      </CardTitle>
                      <CardDescription className="text-sm text-rose-700 dark:text-rose-300">
                        Acciones de gestión y operaciones
                      </CardDescription>
                    </div>
                  </div>
                  {isRevisionOpen ? (
                    <ChevronUp className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="p-4 space-y-6">
                  {/* Botones de Acción modernizados */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-amber-200 hover:bg-amber-50 text-amber-700 dark:border-amber-800 dark:hover:bg-amber-900/30 dark:text-amber-300"
                        >
                          <BarChart3 className="h-3.5 w-3.5" />
                          Ver Totales
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md rounded-xl border border-amber-200/40 bg-white/95 backdrop-blur-sm dark:border-amber-800/40 dark:bg-gray-900/95">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                              <BarChart3 className="h-3 w-3" />
                            </div>
                            Totales de Corte y Reposición
                          </DialogTitle>
                          <DialogDescription className="text-amber-700 dark:text-amber-300">
                            Resumen de estados de corte y reposición
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Table className="border-collapse border border-amber-200 dark:border-amber-800 rounded-lg overflow-hidden">
                            <TableBody>
                              <TableRow className="border border-amber-200/60 hover:bg-amber-50/50 dark:border-amber-800/60 dark:hover:bg-amber-900/20">
                                <TableCell className="py-2 font-medium text-amber-900 dark:text-amber-100">
                                  Pendiente
                                </TableCell>
                                <TableCell className="py-2 text-center text-amber-600 dark:text-amber-400">
                                  :
                                </TableCell>
                                <TableCell className="py-2 text-right font-semibold text-amber-800 dark:text-amber-200">
                                  {getCantidadPorCodigo('NULL')}
                                </TableCell>
                              </TableRow>
                              <TableRow className="border border-amber-200/60 hover:bg-amber-50/50 dark:border-amber-800/60 dark:hover:bg-amber-900/20">
                                <TableCell className="py-2 font-medium text-amber-900 dark:text-amber-100">
                                  Liberado
                                </TableCell>
                                <TableCell className="py-2 text-center text-amber-600 dark:text-amber-400">
                                  :
                                </TableCell>
                                <TableCell className="py-2 text-right font-semibold text-amber-800 dark:text-amber-200">
                                  {getCantidadPorCodigo('1')}
                                </TableCell>
                              </TableRow>
                              <TableRow className="border border-amber-200/60 hover:bg-amber-50/50 dark:border-amber-800/60 dark:hover:bg-amber-900/20">
                                <TableCell className="py-2 font-medium text-amber-900 dark:text-amber-100">
                                  Cortado
                                </TableCell>
                                <TableCell className="py-2 text-center text-amber-600 dark:text-amber-400">
                                  :
                                </TableCell>
                                <TableCell className="py-2 text-right font-semibold text-amber-800 dark:text-amber-200">
                                  {getCantidadPorCodigo('2')}
                                </TableCell>
                              </TableRow>
                              <TableRow className="border border-amber-200/60 hover:bg-amber-50/50 dark:border-amber-800/60 dark:hover:bg-amber-900/20">
                                <TableCell className="py-2 font-medium text-amber-900 dark:text-amber-100">
                                  Reposición Solicitada
                                </TableCell>
                                <TableCell className="py-2 text-center text-amber-600 dark:text-amber-400">
                                  :
                                </TableCell>
                                <TableCell className="py-2 text-right font-semibold text-amber-800 dark:text-amber-200">
                                  {getCantidadPorCodigo('3')}
                                </TableCell>
                              </TableRow>
                              <TableRow className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-300 dark:border-amber-700 font-bold">
                                <TableCell className="py-2 text-amber-900 dark:text-amber-100">
                                  TOTAL
                                </TableCell>
                                <TableCell className="py-2 text-center text-amber-700 dark:text-amber-300">
                                  :
                                </TableCell>
                                <TableCell className="py-2 text-right text-amber-900 dark:text-amber-100">
                                  {getCantidadPorCodigo('TOTAL')}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleExportarExcel}
                      className="gap-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Exportar Excel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleExportarExcelCorte}
                      className="gap-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Exportar Excel Corte
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleActivarActualizacion}
                      className="gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
                    >
                      <ArrowUpToLine className="h-3.5 w-3.5" />
                      Activar Actualización
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleIniciar}
                      className="gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-sm"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Iniciar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleFinalizar}
                      className="gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Finalizar
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Panel de Datos de Mantenedor modernizado */}
          <Card className="rounded-xl border border-slate-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-slate-800/40 dark:bg-gray-900/50">
            <div className="p-4 border-b border-slate-200/40 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 dark:border-slate-800/40 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Mantenedor de Revisión de Corte
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Listado de registros de mantenimiento (
                    {mantenedorCorteData.length} registros)
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {mantenedorCorteData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-800 mb-4">
                    <FileText className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-lg font-medium">
                    No se encontraron registros
                  </p>
                  <p className="text-sm">
                    No hay datos de mantenimiento disponibles
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200/40 dark:border-slate-800/40 overflow-hidden">
                  <DataTable columns={columns} data={mantenedorCorteData} />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
