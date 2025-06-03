import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
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
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Table, TableBody, TableCell, TableRow } from "~/components/ui/table";
import type {
  TotalesCorteReposicion,
  ConsultarMantenedorRevisionCorte,
} from "~/types/operaciones";
import { DataTable } from "~/components/data-table/data-table";
import { columns } from "./columns";
import api from "~/lib/api";

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
    const res = await api.get("exportar-mantenedor-revision", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data as Blob]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "corte_reposicion.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportarExcelCorte = async () => {
    const res = await api.get("exportar-revision-corte", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data as Blob]));
    const a = document.createElement("a");
    a.href = url;
    a.download = "corte.xlsx";
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
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
          Corte y Reposición
        </h1>
        <p className="text-muted-foreground">
          Gestión de cortes y reposiciones del servicio
        </p>
      </div>

      {/* Sección Principal */}
      <div className="grid grid-cols-1 gap-6">
        {/* Panel de Revisión */}
        <Card className="shadow-sm border border-border/60">
          <Collapsible
            open={isRevisionOpen}
            onOpenChange={setIsRevisionOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg shadow-sm">
                    <ListChecks className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                      Revisión
                    </CardTitle>{" "}
                    <CardDescription className="text-sm">
                      Acciones de gestión y operaciones
                    </CardDescription>
                  </div>
                </div>
                {isRevisionOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>{" "}
            <CollapsibleContent>
              <CardContent className="p-4 space-y-6">
                {/* Botones de Acción */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/30"
                      >
                        <BarChart3 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        Ver Totales
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          Totales de Corte y Reposición
                        </DialogTitle>
                        <DialogDescription>
                          Resumen de estados de corte y reposición
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Table className="border-collapse border">
                          <TableBody>
                            <TableRow className="border border-border/60 hover:bg-muted/30">
                              <TableCell className="py-2 font-medium">
                                Pendiente
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                :
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                {getCantidadPorCodigo("NULL")}
                              </TableCell>
                            </TableRow>
                            <TableRow className="border border-border/60 hover:bg-muted/30">
                              <TableCell className="py-2 font-medium">
                                Liberado
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                :
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                {getCantidadPorCodigo("1")}
                              </TableCell>
                            </TableRow>
                            <TableRow className="border border-border/60 hover:bg-muted/30">
                              <TableCell className="py-2 font-medium">
                                Cortado
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                :
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                {getCantidadPorCodigo("2")}
                              </TableCell>
                            </TableRow>
                            <TableRow className="border border-border/60 hover:bg-muted/30">
                              <TableCell className="py-2 font-medium">
                                Reposición Solicitada
                              </TableCell>
                              <TableCell className="py-2 text-center">
                                :
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                {getCantidadPorCodigo("3")}
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-blue-100 dark:bg-blue-900/30 border border-border/60 font-bold">
                              <TableCell className="py-2">TOTAL</TableCell>
                              <TableCell className="py-2 text-center">
                                :
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                {getCantidadPorCodigo("TOTAL")}
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
                    className="gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Exportar Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleExportarExcelCorte}
                    className="gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Exportar Excel Corte
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleActivarActualizacion}
                    className="gap-1.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                  >
                    <ArrowUpToLine className="h-3.5 w-3.5" />
                    Activar Actualización
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleIniciar}
                    className="gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Iniciar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleFinalizar}
                    className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Finalizar
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>{" "}
        </Card>

        {/* Panel de Datos de Mantenedor */}
        <Card className="shadow-sm border border-border/60">
          <div className="p-4 border-b border-border/60 bg-muted/40">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg shadow-sm">
                <FileText className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Mantenedor de Revisión de Corte
                </h3>
                <p className="text-sm text-muted-foreground">
                  Listado de registros de mantenimiento (
                  {mantenedorCorteData.length} registros)
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            {mantenedorCorteData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mb-2 opacity-50" />
                <p>No se encontraron registros de mantenimiento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <DataTable columns={columns} data={mantenedorCorteData} />
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
