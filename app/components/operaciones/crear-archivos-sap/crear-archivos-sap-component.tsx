import { ChevronDown, Download, FileArchive, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { operacionesService } from '~/services/operacionesService';
import type { SAPSugeridos } from '~/types/operaciones';

type SAPEmpresaOption = {
  id: string;
  nombre: string;
};

interface CrearArchivosSapComponentProps {
  empresas: SAPEmpresaOption[];
  nombresSugeridos: SAPSugeridos | null;
  error: string | null;
}

export default function CrearArchivosSapComponent({
  empresas,
  nombresSugeridos,
  error
}: CrearArchivosSapComponentProps) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [isDownloadingEncabezado, setIsDownloadingEncabezado] = useState(false);
  const [isDownloadingDetalle, setIsDownloadingDetalle] = useState(false);
  const [empresaId, setEmpresaId] = useState('');
  const [nombreEncabezado, setNombreEncabezado] = useState('');
  const [nombreDetalle, setNombreDetalle] = useState('');

  useEffect(() => {
    if (empresas.length > 0 && !empresaId) {
      setEmpresaId(empresas[0].id);
    }
  }, [empresas, empresaId]);

  useEffect(() => {
    if (nombresSugeridos?.nombreEncabezado) {
      setNombreEncabezado(nombresSugeridos.nombreEncabezado);
    }

    if (nombresSugeridos?.nombreDetalle) {
      setNombreDetalle(nombresSugeridos.nombreDetalle);
    }
  }, [nombresSugeridos]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const selectedEmpresa = useMemo(
    () => empresas.find(empresa => empresa.id === empresaId) ?? null,
    [empresas, empresaId]
  );

  const generateFallbackFilename = (type: 'FAC' | 'DET'): string => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${type}-${day}${month}${year}-${hours}${minutes}.csv`;
  };

  const downloadBlobFile = (blob: Blob, filename: string) => {
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      globalThis.URL.revokeObjectURL(url);
    }, 100);
  };

  const handleDescargarEncabezado = async () => {
    if (!empresaId) {
      toast.error('Debes seleccionar una empresa antes de descargar.');
      return;
    }

    if (!nombreEncabezado.trim()) {
      toast.error('Debes indicar un nombre para el archivo de encabezado.');
      return;
    }

    setIsDownloadingEncabezado(true);
    try {
      toast.info('Generando archivo de encabezado...');

      const response = await operacionesService.getDescargarEnacabezado(
        empresaId,
        nombreEncabezado.trim()
      );

      if (response.error || !response.data) {
        throw new Error(
          response.error || 'No fue posible descargar el archivo'
        );
      }

      const filename =
        response.data.filename || generateFallbackFilename('FAC');
      const blob = new Blob([response.data.blob], {
        type: response.data.contentType || 'text/csv;charset=utf-8;'
      });

      downloadBlobFile(blob, filename);

      toast.success(`Archivo "${filename}" descargado exitosamente`);
    } catch (error: unknown) {
      const typedError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        typedError.response?.data?.message ||
        typedError.message ||
        'Error al descargar el archivo';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDownloadingEncabezado(false);
    }
  };

  const handleDescargarDetalle = async () => {
    if (!empresaId) {
      toast.error('Debes seleccionar una empresa antes de descargar.');
      return;
    }

    if (!nombreDetalle.trim()) {
      toast.error('Debes indicar un nombre para el archivo de detalle.');
      return;
    }

    setIsDownloadingDetalle(true);
    try {
      toast.info('Generando archivo de detalle...');

      const response = await operacionesService.getDescargarDetalle(
        empresaId,
        nombreDetalle.trim()
      );

      if (response.error || !response.data) {
        throw new Error(
          response.error || 'No fue posible descargar el archivo'
        );
      }

      const filename =
        response.data.filename || generateFallbackFilename('DET');
      const blob = new Blob([response.data.blob], {
        type: response.data.contentType || 'text/csv;charset=utf-8;'
      });

      downloadBlobFile(blob, filename);

      toast.success(`Archivo "${filename}" descargado exitosamente`);
    } catch (error: unknown) {
      const typedError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        typedError.response?.data?.message ||
        typedError.message ||
        'Error al descargar el archivo';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsDownloadingDetalle(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        {/* Header */}
        <ModernHeader
          title="Archivos SAP"
          description="Generación y descarga de archivos CSV para integración con SAP"
        />

        <div className="space-y-4">
          {/* Panel de Configuración */}
          <Card className="border-border bg-background">
            <Collapsible open={isConfigOpen} onOpenChange={setIsConfigOpen}>
              <CollapsibleTrigger asChild>
                <div className="p-3 border-b border-border cursor-pointer hover:bg-muted  transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-background">
                        <FileArchive className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          Descarga de Archivos
                        </CardTitle>
                        <CardDescription className="text-sm">
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
                <CardContent className="p-4 space-y-4">
                  <div className="grid gap-4 rounded-xl border border-border bg-muted/20 p-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Empresa SAP</Label>
                      <Select value={empresaId} onValueChange={setEmpresaId}>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Selecciona una empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {empresas.map(empresa => (
                            <SelectItem key={empresa.id} value={empresa.id}>
                              {empresa.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {selectedEmpresa
                          ? `Empresa seleccionada: ${selectedEmpresa.nombre}`
                          : 'No hay empresas disponibles para descargar archivos.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Estado de configuración
                      </Label>
                      <div className="rounded-lg border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                        {nombresSugeridos
                          ? 'Se cargaron nombres sugeridos desde SAP.'
                          : 'No se recibieron nombres sugeridos; puedes escribirlos manualmente.'}
                      </div>
                    </div>
                  </div>

                  {/* Archivo de Encabezado */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-background">
                    <div className="space-y-3 flex-1">
                      <Label className="text-sm font-medium">
                        Archivo de Encabezado Factura
                      </Label>
                      <p className="text-sm">
                        Archivo CSV con los encabezados de facturas para SAP
                      </p>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Nombre del archivo
                        </Label>
                        <Input
                          value={nombreEncabezado}
                          onChange={event =>
                            setNombreEncabezado(event.target.value)
                          }
                          placeholder="Ej: FAC-24062026-1030.csv"
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleDescargarEncabezado}
                      disabled={
                        isDownloadingEncabezado || empresas.length === 0
                      }
                      className="gap-1.5 bg-primary disabled:opacity-50"
                    >
                      {isDownloadingEncabezado ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Descargando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Descargar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Archivo Detalle */}
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-background">
                    <div className="space-y-3 flex-1">
                      <Label className="text-sm font-medium">
                        Archivo Detalle Factura
                      </Label>
                      <p className="text-sm">
                        Archivo CSV con los detalles de facturas para SAP
                      </p>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Nombre del archivo
                        </Label>
                        <Input
                          value={nombreDetalle}
                          onChange={event =>
                            setNombreDetalle(event.target.value)
                          }
                          placeholder="Ej: DET-24062026-1030.csv"
                          className="bg-background"
                        />
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleDescargarDetalle}
                      disabled={isDownloadingDetalle || empresas.length === 0}
                      className="gap-1.5 bg-primary disabled:opacity-50"
                    >
                      {isDownloadingDetalle ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Descargando...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
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
