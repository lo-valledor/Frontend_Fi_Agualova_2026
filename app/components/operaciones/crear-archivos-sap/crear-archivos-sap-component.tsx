import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import {
  FileArchive,
  ChevronUp,
  ChevronDown,
  Download,
} from "lucide-react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import api from "~/lib/api";

export default function CrearArchivosSapComponent() {
  const [archivoEncabezado, setArchivoEncabezado] = useState<string>("");
  const [archivoDetalle, setArchivoDetalle] = useState<string>("");
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isArchivosOpen, setIsArchivosOpen] = useState(true);
  // Helper function to extract filename from Content-Disposition header
  const extractFilenameFromHeaders = (headers: any): string => {
    const contentDisposition = headers["content-disposition"];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
      if (filenameMatch && filenameMatch[1]) {
        return filenameMatch[1].replace(/['"]/g, "");
      }
    }
    return ""; // empty string to use custom fallback
  };

  // Helper function to generate filename with proper format
  const generateFallbackFilename = (type: "FAC" | "DET"): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    return `${type}-${day}${month}${year}-${hours}${minutes}.csv`;
  };
  const handleDescargarEncabezado = async () => {
    try {
      const response = await api.get("/exportar-encabezado", {
        responseType: "blob",
      });
      // Extract filename from headers or use fallback with proper format
      const filename =
        extractFilenameFromHeaders(response.headers) ||
        generateFallbackFilename("FAC");

      const blob = new Blob([response.data as BlobPart], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar archivo de encabezado:", error);
    }
  };

  const handleDescargarDetalle = async () => {
    try {
      const response = await api.get("/exportar-detalle", {
        responseType: "blob",
      });
      // Extract filename from headers or use fallback with proper format
      const filename =
        extractFilenameFromHeaders(response.headers) ||
        generateFallbackFilename("DET");

      const blob = new Blob([response.data as BlobPart], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar archivo de detalle:", error);
    }
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
                      Descarga de Archivos
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Haz clic en los botones para descargar los archivos
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
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
