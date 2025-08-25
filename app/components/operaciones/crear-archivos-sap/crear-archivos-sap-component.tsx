import { ChevronDown, Download, FileArchive } from 'lucide-react';

import { useState } from 'react';

import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
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
        responseType: 'blob'
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
        responseType: 'blob'
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
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Archivos SAP'
          description='Generación y descarga de archivos CSV para integración con SAP'
        />

        <div className='space-y-4'>
          {/* Panel de Configuración */}
          <Card className='border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80'>
            <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <CollapsibleTrigger asChild>
                <div className='p-3 border-b border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'>
                        <FileArchive className='h-4 w-4' />
                      </div>
                      <div>
                        <CardTitle className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                          Descarga de Archivos
                        </CardTitle>
                        <CardDescription className='text-sm text-slate-600 dark:text-slate-400'>
                          Haz clic en los botones para descargar los archivos
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${
                        isConfigOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className='p-4 space-y-4'>
                  {/* Archivo de Encabezado */}
                  <div className='flex items-center justify-between gap-4 p-4 rounded-lg border border-slate-200/60 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-800/50'>
                    <div className='space-y-1 flex-1'>
                      <Label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                        Archivo de Encabezado Factura
                      </Label>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        Archivo CSV con los encabezados de facturas para SAP
                      </p>
                    </div>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleDescargarEncabezado}
                      className='gap-1.5 bg-sky-600 hover:bg-sky-700 text-white'
                    >
                      <Download className='h-4 w-4' />
                      Descargar
                    </Button>
                  </div>

                  {/* Archivo Detalle */}
                  <div className='flex items-center justify-between gap-4 p-4 rounded-lg border border-slate-200/60 bg-slate-50/50 dark:border-slate-700/60 dark:bg-slate-800/50'>
                    <div className='space-y-1 flex-1'>
                      <Label className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                        Archivo Detalle Factura
                      </Label>
                      <p className='text-sm text-slate-600 dark:text-slate-400'>
                        Archivo CSV con los detalles de facturas para SAP
                      </p>
                    </div>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleDescargarDetalle}
                      className='gap-1.5 bg-sky-600 hover:bg-sky-700 text-white'
                    >
                      <Download className='h-4 w-4' />
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
