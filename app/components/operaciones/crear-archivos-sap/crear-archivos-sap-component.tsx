import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import {
  FileArchive,
  Search,
  Eraser,
  ChevronUp,
  ChevronDown,
  Download,
  FilePlus2,
  FileText,
  Upload,
  ArrowDown,
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

export default function CrearArchivosSapComponent() {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("");
  const [archivoEncabezado, setArchivoEncabezado] = useState<string>("");
  const [archivoDetalle, setArchivoDetalle] = useState<string>("");
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isArchivosOpen, setIsArchivosOpen] = useState(true);

  const handleDescargarEncabezado = () => {
    // Implementar lógica de descarga
  };

  const handleDescargarDetalle = () => {
    // Implementar lógica de descarga
  };

  const handleClearFilters = () => {
    setSelectedPeriodo("");
    setArchivoEncabezado("");
    setArchivoDetalle("");
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
          Carga de Archivos a SAP
        </h1>
        <p className="text-muted-foreground">
          Gestión de archivos para integración con SAP
        </p>
      </div>

      {/* Sección Principal */}
      <div className="grid grid-cols-1 gap-6">
        {/* Panel de Configuración */}
        <Card className="shadow-sm border border-border/60">
          <Collapsible
            open={isConfigOpen}
            onOpenChange={setIsConfigOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shadow-sm">
                    <FileArchive className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                      Carga de Archivos a SAP
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Selecciona los archivos para la carga
                    </CardDescription>
                  </div>
                </div>
                {isConfigOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="p-4 space-y-4">
                {/* Periodo */}
                <div className="space-y-2">
                  <Label htmlFor="periodo" className="text-muted-foreground">
                    Periodo de Facturación
                  </Label>
                  <Select
                    value={selectedPeriodo}
                    onValueChange={setSelectedPeriodo}
                  >
                    <SelectTrigger id="periodo" className="w-full">
                      <SelectValue placeholder="Selecciona un periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="202401">Enero 2024</SelectItem>
                      <SelectItem value="202402">Febrero 2024</SelectItem>
                      <SelectItem value="202403">Marzo 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Archivo de Encabezado */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="archivo-encabezado"
                      className="text-muted-foreground"
                    >
                      Archivo de Encabezado Factura
                    </Label>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleDescargarEncabezado}
                      className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Descargar
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="archivo-encabezado"
                      value={archivoEncabezado}
                      onChange={(e) => setArchivoEncabezado(e.target.value)}
                      placeholder="FAC-10012025-1149"
                      className="flex-grow"
                    />
                  </div>
                </div>

                {/* Archivo Detalle */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="archivo-detalle"
                      className="text-muted-foreground"
                    >
                      Archivo detalle Factura
                    </Label>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleDescargarDetalle}
                      className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Descargar
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="archivo-detalle"
                      value={archivoDetalle}
                      onChange={(e) => setArchivoDetalle(e.target.value)}
                      placeholder="DET-10012025-1149"
                      className="flex-grow"
                    />
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="default"
                    className="gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                  >
                    <Upload className="h-4 w-4" />
                    Cargar Archivos
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Panel de Archivos */}
        <Card className="shadow-sm border border-border/60">
          <Collapsible
            open={isArchivosOpen}
            onOpenChange={setIsArchivosOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shadow-sm">
                    <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                      Historial de Carga
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Últimos archivos cargados a SAP
                    </CardDescription>
                  </div>
                </div>
                {isArchivosOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="p-4">
                <div className="rounded-lg border border-border/60 p-8 text-center bg-muted/20">
                  <p className="text-muted-foreground">
                    No hay archivos cargados recientemente
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
