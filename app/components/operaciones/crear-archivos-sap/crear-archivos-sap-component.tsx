import { ChevronDown, ChevronUp, Download, FileArchive } from 'lucide-react';

import { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import api from '~/lib/api';

export default function CrearArchivosSapComponent() {
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  // Helper function to extract filename from Content-Disposition header
  const extractFilenameFromHeaders = (headers: any): string => {
    const contentDisposition = headers['content-disposition'];
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950/30'>
      <div className='container mx-auto p-2 sm:p-4 space-y-3'>
        {/* Modern Header */}
        <div className='flex items-center gap-2 sm:gap-3 py-1 border-b border-slate-200 dark:border-slate-700'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 sm:gap-3 justify-between'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-sky-900 dark:text-sky-100 truncate'>
                  Crear Archivo SAP
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Principal */}
        <div className='grid grid-cols-1 gap-4 sm:gap-6'>
          {/* Panel de Configuración */}
          <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
            <Collapsible
              open={isConfigOpen}
              onOpenChange={setIsConfigOpen}
              className='w-full'
            >
              <CollapsibleTrigger asChild>
                <div className='flex justify-between items-center p-3 sm:p-4 cursor-pointer hover:bg-blue-50/50 rounded-t-xl dark:hover:bg-blue-900/20'>
                  <div className='flex items-center gap-2 sm:gap-3 min-w-0 flex-1'>
                    <div className='flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm'>
                      <FileArchive className='h-3 w-3 sm:h-4 sm:w-4' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <CardTitle className='text-base sm:text-lg font-semibold text-sky-900 dark:text-sky-100 truncate'>
                        Descarga de Archivos
                      </CardTitle>
                      <CardDescription className='text-xs sm:text-sm text-sky-700 dark:text-sky-300'>
                        Haz clic en los botones para descargar los archivos
                      </CardDescription>
                    </div>
                  </div>
                  {isConfigOpen ? (
                    <ChevronUp className='h-4 w-4 sm:h-5 sm:w-5 text-sky-600 dark:text-sky-400' />
                  ) : (
                    <ChevronDown className='h-4 w-4 sm:h-5 sm:w-5 text-sky-600 dark:text-sky-400' />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className='p-3 sm:p-4 space-y-4 sm:space-y-6'>
                  {/* Archivo de Encabezado */}
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border border-sky-200/40 bg-sky-50/30 dark:border-sky-800/40 dark:bg-sky-900/20'>
                    <div className='space-y-1 min-w-0 flex-1'>
                      <Label className='text-xs sm:text-sm font-medium text-sky-900 dark:text-sky-100'>
                        Archivo de Encabezado Factura
                      </Label>
                      <p className='text-xs text-sky-700 dark:text-sky-300'>
                        Archivo CSV con los encabezados de facturas para SAP
                      </p>
                    </div>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleDescargarEncabezado}
                      className='gap-1 sm:gap-1.5 h-8 sm:h-9 text-xs sm:text-sm bg-sky-600 hover:bg-sky-700 text-white shadow-sm w-full sm:w-auto'
                    >
                      <Download className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                      Descargar
                    </Button>
                  </div>

                  {/* Archivo Detalle */}
                  <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border border-sky-200/40 bg-sky-50/30 dark:border-sky-800/40 dark:bg-sky-900/20'>
                    <div className='space-y-1 min-w-0 flex-1'>
                      <Label className='text-xs sm:text-sm font-medium text-sky-900 dark:text-sky-100'>
                        Archivo Detalle Factura
                      </Label>
                      <p className='text-xs text-sky-700 dark:text-sky-300'>
                        Archivo CSV con los detalles de facturas para SAP
                      </p>
                    </div>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleDescargarDetalle}
                      className='gap-1 sm:gap-1.5 h-8 sm:h-9 text-xs sm:text-sm bg-sky-600 hover:bg-sky-700 text-white shadow-sm w-full sm:w-auto'
                    >
                      <Download className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
                      Descargar
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </div>
  );
}
