import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import {
  Scissors,
  Search,
  Eraser,
  ChevronUp,
  ChevronDown,
  FileText,
  UserRound,
  ArrowUpToLine,
  ListChecks,
  Download,
  Play,
  CheckCircle2,
} from "lucide-react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default function CorteReposicionComponent() {
  const [acometida, setAcometida] = useState<string>("");
  const [isRevisionOpen, setIsRevisionOpen] = useState(true);
  const [isTotalesOpen, setIsTotalesOpen] = useState(true);

  const handleSearch = () => {
    // Implementar lógica de búsqueda
  };

  const handleExportarExcel = () => {
    // Implementar lógica para exportar a Excel
  };

  const handleExportarExcelCorte = () => {
    // Implementar lógica para exportar a Excel con corte
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
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Buscar acometida y gestionar operaciones
                    </CardDescription>
                  </div>
                </div>
                {isRevisionOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="p-4 space-y-6">
                {/* Búsqueda de Acometida */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 flex-grow">
                    <Label
                      htmlFor="acometida"
                      className="text-sky-800 dark:text-sky-300 font-medium whitespace-nowrap"
                    >
                      Acometida:
                    </Label>
                    <div className="flex-grow">
                      <Input
                        id="acometida"
                        placeholder=""
                        value={acometida}
                        onChange={(e) => setAcometida(e.target.value)}
                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      />
                    </div>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSearch}
                    className="gap-1.5 bg-blue-900 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700"
                  >
                    <Search className="h-3.5 w-3.5" />
                    Buscar
                  </Button>
                </div>

                {/* Botones de Acción */}
                <div className="flex flex-wrap gap-2">
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
          </Collapsible>
        </Card>

        {/* Panel de Totales */}
        <Card className="shadow-sm border border-border/60">
          <Collapsible
            open={isTotalesOpen}
            onOpenChange={setIsTotalesOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg shadow-sm">
                    <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                      Totales
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Resumen de estados de corte y reposición
                    </CardDescription>
                  </div>
                </div>
                {isTotalesOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="p-4">
                <Table className="border-collapse border">
                  <TableBody>
                    <TableRow className="border border-border/60 hover:bg-muted/30">
                      <TableCell className="py-2 font-medium">
                        Pendiente
                      </TableCell>
                      <TableCell className="py-2 text-center">:</TableCell>
                      <TableCell className="py-2 text-right">376</TableCell>
                    </TableRow>
                    <TableRow className="border border-border/60 hover:bg-muted/30">
                      <TableCell className="py-2 font-medium">
                        Liberado
                      </TableCell>
                      <TableCell className="py-2 text-center">:</TableCell>
                      <TableCell className="py-2 text-right">0</TableCell>
                    </TableRow>
                    <TableRow className="border border-border/60 hover:bg-muted/30">
                      <TableCell className="py-2 font-medium">
                        Cortado
                      </TableCell>
                      <TableCell className="py-2 text-center">:</TableCell>
                      <TableCell className="py-2 text-right">1</TableCell>
                    </TableRow>
                    <TableRow className="border border-border/60 hover:bg-muted/30">
                      <TableCell className="py-2 font-medium">
                        Reposición Solicitada
                      </TableCell>
                      <TableCell className="py-2 text-center">:</TableCell>
                      <TableCell className="py-2 text-right">0</TableCell>
                    </TableRow>
                    <TableRow className="bg-blue-100 dark:bg-blue-900/30 border border-border/60 font-bold">
                      <TableCell className="py-2">TOTAL</TableCell>
                      <TableCell className="py-2 text-center">:</TableCell>
                      <TableCell className="py-2 text-right">377</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
