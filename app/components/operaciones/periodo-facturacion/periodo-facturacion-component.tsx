/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { columns } from "./columns";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import {
  PlusCircleIcon,
  CalendarRangeIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import DialogNuevoPeriodo from "./dialog-nuevo-periodo";
import type { Anio, Periodos } from "~/types/operaciones";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ScrollArea } from "~/components/ui/scroll-area";
import { DataTable } from "~/components/data-table/data-table";

export default function AbrirPeriodoFacturacion({
  years,
  periodos,
}: {
  years: Anio[];
  periodos: Periodos[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isResultsOpen, setIsResultsOpen] = useState(true);

  // Nueva función para filtrar periodos
  const filteredPeriodos = useMemo(() => {
    if (!searchTerm) {
      return periodos; // Si no hay término de búsqueda, devuelve todos los periodos
    }
    return periodos.filter(
      (periodo) =>
        periodo.pf_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        periodo.pf_descripcion
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        periodo.Column1.toLowerCase().includes(searchTerm.toLowerCase()) || // Asegúrate que Column1 y Column2 existan en tu tipo Periodos
        periodo.Column2.toLowerCase().includes(searchTerm.toLowerCase()) ||
        periodo.epf_descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [periodos, searchTerm]);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
            Periodos de Facturación
          </h1>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsOpenDialog(true)}
              className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              <PlusCircleIcon className="h-4 w-4" />
              Nuevo Periodo
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">
          Gestiona los periodos de facturación del sistema
        </p>
      </div>

      {/* Tabla de resultados como componente principal */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible
          open={isResultsOpen}
          onOpenChange={setIsResultsOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg shadow-sm">
                  <CalendarRangeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Periodos de Facturación
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {filteredPeriodos.length > 0
                      ? `${filteredPeriodos.length} periodos`
                      : "No hay periodos"}
                  </CardDescription>
                </div>
              </div>
              {isResultsOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <DataTable columns={columns} data={periodos} />
              </ScrollArea>
            </CardContent>

            {filteredPeriodos.length > 0 && (
              <CardFooter className="border-t border-border/60 p-4 bg-muted/30 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {filteredPeriodos.length} periodos
                </div>
              </CardFooter>
            )}
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Dialog para crear nuevo periodo */}
      <DialogNuevoPeriodo
        open={isOpenDialog}
        onOpenChange={setIsOpenDialog}
        onPeriodoCreated={() => {
          setIsOpenDialog(false);
          setIsResultsOpen(true);
        }}
        years={years}
      />
    </div>
  );
}
