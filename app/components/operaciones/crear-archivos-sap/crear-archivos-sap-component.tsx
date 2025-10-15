import { ChevronDown, Download, FileArchive, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isDownloadingEncabezado, setIsDownloadingEncabezado] = useState(false);
  const [isDownloadingDetalle, setIsDownloadingDetalle] = useState(false);

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
    setIsDownloadingEncabezado(true);
    try {
      toast.info('Generando archivo de encabezado...');

      const response = await api.get('/exportar-encabezado', {
        responseType: 'blob'
      });

      // Extract filename from headers or use fallback with proper format
      const filename =
        extractFilenameFromHeaders(response.headers) ||
        generateFallbackFilename('FAC');

      // Create blob with explicit CSV type and charset
      const blob = new Blob([response.data as BlobPart], {
        type: 'text/csv;charset=utf-8;'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup after a small delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success(`Archivo "${filename}" descargado exitosamente`);
    } catch (error: any) {
      console.error('Error al descargar archivo de encabezado:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al descargar el archivo';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDownloadingEncabezado(false);
    }
  };

  const handleDescargarDetalle = async () => {
    setIsDownloadingDetalle(true);
    try {
      toast.info('Generando archivo de detalle...');

      const response = await api.get('/exportar-detalle', {
        responseType: 'blob'
      });

      // Extract filename from headers or use fallback with proper format
      const filename =
        extractFilenameFromHeaders(response.headers) ||
        generateFallbackFilename('DET');

      // Create blob with explicit CSV type and charset
      const blob = new Blob([response.data as BlobPart], {
        type: 'text/csv;charset=utf-8;'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup after a small delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success(`Archivo "${filename}" descargado exitosamente`);
    } catch (error: any) {
      console.error('Error al descargar archivo de detalle:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al descargar el archivo';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDownloadingDetalle(false);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Archivos SAP'
          description='Generación y descarga de archivos CSV para integración con SAP'
        />

        <div className='space-y-4'>
          {/* Panel de Configuración */}
          <Card className='border-border bg-background'>
            <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <CollapsibleTrigger asChild>
                <div className='p-3 border-b border-border cursor-pointer hover:bg-muted  transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-background'>
                        <FileArchive className='h-4 w-4' />
                      </div>
                      <div>
                        <CardTitle className='text-lg font-semibold'>
                          Descarga de Archivos
                        </CardTitle>
                        <CardDescription className='text-sm'>
                          Haz clic en los botones para descargar los archivos
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-200 ${
                        isConfigOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className='p-4 space-y-4'>
                  {/* Archivo de Encabezado */}
                  <div className='flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-background'>
                    <div className='space-y-1 flex-1'>
                      <Label className='text-sm font-medium'>
                        Archivo de Encabezado Factura
                      </Label>
                      <p className='text-sm'>
                        Archivo CSV con los encabezados de facturas para SAP
                      </p>
                    </div>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleDescargarEncabezado}
                      disabled={isDownloadingEncabezado}
                      className='gap-1.5 bg-primary disabled:opacity-50'
                    >
                      {isDownloadingEncabezado ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Descargando...
                        </>
                      ) : (
                        <>
                          <Download className='h-4 w-4' />
                          Descargar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Archivo Detalle */}
                  <div className='flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-background'>
                    <div className='space-y-1 flex-1'>
                      <Label className='text-sm font-medium'>
                        Archivo Detalle Factura
                      </Label>
                      <p className='text-sm'>
                        Archivo CSV con los detalles de facturas para SAP
                      </p>
                    </div>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleDescargarDetalle}
                      disabled={isDownloadingDetalle}
                      className='gap-1.5 bg-primary disabled:opacity-50'
                    >
                      {isDownloadingDetalle ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Descargando...
                        </>
                      ) : (
                        <>
                          <Download className='h-4 w-4' />
                          Descargar
                        </>
                      )}
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
