import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '~/components/ui/card';
import {
  FileArchive,
  ChevronUp,
  ChevronDown,
  Download,
  Database,
} from 'lucide-react';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import api from '~/lib/api';

export default function CrearArchivosSapComponent() {
  const [archivoEncabezado, setArchivoEncabezado] = useState<string>('');
  const [archivoDetalle, setArchivoDetalle] = useState<string>('');
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isArchivosOpen, setIsArchivosOpen] = useState(true);

  // Helper function to extract filename from Content-Disposition header
  const extractFilenameFromHeaders = (headers: any): string => {
    const contentDisposition = headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
      );
      if (filenameMatch && filenameMatch[1]) {
        return filenameMatch[1].replace(/['"]/g, '');
      }
    }
    return ''; // empty string to use custom fallback
  };

  // Helper function to generate filename with proper format
  const generateFallbackFilename = (type: 'FAC' | 'DET'): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${type}-${day}${month}${year}-${hours}${minutes}.csv`;
  };

  const handleDescargarEncabezado = async () => {
    try {
      const response = await api.get('/exportar-encabezado', {
        responseType: 'blob',
      });
      // Extract filename from headers or use fallback with proper format
      const filename =
        extractFilenameFromHeaders(response.headers) ||
        generateFallbackFilename('FAC');

      const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo de encabezado:', error);
    }
  };

  const handleDescargarDetalle = async () => {
    try {
      const response = await api.get('/exportar-detalle', {
        responseType: 'blob',
      });
      // Extract filename from headers or use fallback with proper format
      const filename =
        extractFilenameFromHeaders(response.headers) ||
        generateFallbackFilename('DET');

      const blob = new Blob([response.data as BlobPart], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar archivo de detalle:', error);
    }
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header modernizado */}
      <div className="flex items-center gap-4 border-b border-border/40 pb-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
          <Database className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Carga de Archivos a SAP
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gestión de archivos para integración con SAP
          </p>
        </div>
      </div>

      {/* Sección Principal */}
      <div className="grid grid-cols-1 gap-6">
        {/* Panel de Configuración */}
        <Card className="rounded-xl border border-blue-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-blue-800/40 dark:bg-gray-900/50">
          <Collapsible
            open={isConfigOpen}
            onOpenChange={setIsConfigOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-blue-50/50 rounded-t-xl dark:hover:bg-blue-900/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
                    <FileArchive className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Descarga de Archivos
                    </CardTitle>
                    <CardDescription className="text-sm text-blue-700 dark:text-blue-300">
                      Haz clic en los botones para descargar los archivos
                    </CardDescription>
                  </div>
                </div>
                {isConfigOpen ? (
                  <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="p-6 space-y-6">
                {/* Archivo de Encabezado */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-blue-200/40 bg-blue-50/30 dark:border-blue-800/40 dark:bg-blue-900/20">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Archivo de Encabezado Factura
                    </Label>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Archivo CSV con los encabezados de facturas para SAP
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDescargarEncabezado}
                    className="gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </Button>
                </div>

                {/* Archivo Detalle */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-indigo-200/40 bg-indigo-50/30 dark:border-indigo-800/40 dark:bg-indigo-900/20">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                      Archivo Detalle Factura
                    </Label>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                      Archivo CSV con los detalles de facturas para SAP
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleDescargarDetalle}
                    className="gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
