import {
  Building2,
  ChevronDown,
  Download,
  FileArchive,
  Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';
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
import type { EmpresaSAP, NombreSugeridoSAP } from '~/types/operaciones';

const ENCABEZADO_PREFIX = 'FAC';
const DETALLE_PREFIX = 'DET';
const TIMESTAMP_FORMAT = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}${month}${year}-${hours}${minutes}`;
};

const buildCsvBlob = (data: BlobPart): Blob =>
  new Blob([data], { type: 'text/csv;charset=utf-8;' });

const downloadBlob = (blob: Blob, filename: string): void => {
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

export default function CrearArchivosSapComponent() {
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [empresas, setEmpresas] = useState<EmpresaSAP[]>([]);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [nombreEncabezado, setNombreEncabezado] = useState('');
  const [nombreDetalle, setNombreDetalle] = useState('');
  const [isLoadingEmpresas, setIsLoadingEmpresas] = useState(false);
  const [isDownloadingEncabezado, setIsDownloadingEncabezado] = useState(false);
  const [isDownloadingDetalle, setIsDownloadingDetalle] = useState(false);

  useEffect(() => {
    const cargarEmpresas = async () => {
      setIsLoadingEmpresas(true);
      const response = await operacionesService.getListadoEmpresasSAP();
      setIsLoadingEmpresas(false);
      if (response.error || !response.data) {
        toast.error('No se pudieron cargar las empresas SAP');
        return;
      }
      setEmpresas(response.data);
    };
    void cargarEmpresas();
  }, []);

  useEffect(() => {
    if (empresaId === null) {
      setNombreEncabezado('');
      setNombreDetalle('');
      return;
    }
    const empresa = empresas.find((e) => e.id === empresaId);
    const cargarNombresSugeridos = async () => {
      const response = await operacionesService.getNombreSugeridoSAP(
        empresa?.nombre
      );
      if (response.error || !response.data) {
        const stamp = TIMESTAMP_FORMAT(new Date());
        setNombreEncabezado(`${ENCABEZADO_PREFIX}-${stamp}.csv`);
        setNombreDetalle(`${DETALLE_PREFIX}-${stamp}.csv`);
        return;
      }
      const sugeridos: NombreSugeridoSAP = response.data;
      setNombreEncabezado(
        sugeridos.nombreEncabezado || `${ENCABEZADO_PREFIX}-${stamp}.csv`
      );
      setNombreDetalle(
        sugeridos.nombreDetalle || `${DETALLE_PREFIX}-${stamp}.csv`
      );
    };
    const stamp = TIMESTAMP_FORMAT(new Date());
    void cargarNombresSugeridos();
  }, [empresaId, empresas]);

  const handleDescargarEncabezado = async () => {
    if (empresaId === null) {
      toast.error('Debe seleccionar una empresa');
      return;
    }
    if (!nombreEncabezado.trim()) {
      toast.error('Debe ingresar un nombre para el archivo de encabezado');
      return;
    }
    setIsDownloadingEncabezado(true);
    try {
      toast.info('Generando archivo de encabezado...');
      const response = await operacionesService.getDescargarEncabezadoSAP(
        empresaId,
        nombreEncabezado.trim()
      );
      if (response.error || !response.data) {
        toast.error(`Error: ${response.error ?? 'No se pudo generar el archivo'}`);
        return;
      }
      const blob = buildCsvBlob(response.data as BlobPart);
      downloadBlob(blob, nombreEncabezado.trim());
      toast.success(`Archivo "${nombreEncabezado.trim()}" descargado exitosamente`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error: ${message}`);
    } finally {
      setIsDownloadingEncabezado(false);
    }
  };

  const handleDescargarDetalle = async () => {
    if (empresaId === null) {
      toast.error('Debe seleccionar una empresa');
      return;
    }
    if (!nombreDetalle.trim()) {
      toast.error('Debe ingresar un nombre para el archivo de detalle');
      return;
    }
    setIsDownloadingDetalle(true);
    try {
      toast.info('Generando archivo de detalle...');
      const response = await operacionesService.getDescargarDetalleSAP(
        empresaId,
        nombreDetalle.trim()
      );
      if (response.error || !response.data) {
        toast.error(`Error: ${response.error ?? 'No se pudo generar el archivo'}`);
        return;
      }
      const blob = buildCsvBlob(response.data as BlobPart);
      downloadBlob(blob, nombreDetalle.trim());
      toast.success(`Archivo "${nombreDetalle.trim()}" descargado exitosamente`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error: ${message}`);
    } finally {
      setIsDownloadingDetalle(false);
    }
  };

  const downloadDisabled = empresaId === null || isDownloadingEncabezado;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <ModernHeader
          title="Archivos SAP"
          description="Generación y descarga de archivos CSV para integración con SAP"
        />

        <div className="space-y-4">
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
                          Seleccione la empresa y descargue los archivos CSV
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
                  <div className="space-y-2">
                    <Label htmlFor="empresa" className="text-sm font-medium">
                      Empresa
                    </Label>
                    <Select
                      value={empresaId === null ? '' : String(empresaId)}
                      onValueChange={(value) => setEmpresaId(Number(value))}
                      disabled={isLoadingEmpresas}
                    >
                      <SelectTrigger id="empresa" className="w-full">
                        <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <SelectValue
                          placeholder={
                            isLoadingEmpresas
                              ? 'Cargando empresas...'
                              : 'Seleccione una empresa'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={String(empresa.id)}>
                            {empresa.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-background">
                    <div className="space-y-2 flex-1">
                      <Label
                        htmlFor="nombreEncabezado"
                        className="text-sm font-medium"
                      >
                        Archivo de Encabezado Factura
                      </Label>
                      <p className="text-sm">
                        Archivo CSV con los encabezados de facturas para SAP
                      </p>
                      <Input
                        id="nombreEncabezado"
                        type="text"
                        value={nombreEncabezado}
                        onChange={(e) => setNombreEncabezado(e.target.value)}
                        placeholder="FAC-AAAA.csv"
                        disabled={empresaId === null}
                      />
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleDescargarEncabezado}
                      disabled={downloadDisabled}
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

                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-background">
                    <div className="space-y-2 flex-1">
                      <Label
                        htmlFor="nombreDetalle"
                        className="text-sm font-medium"
                      >
                        Archivo Detalle Factura
                      </Label>
                      <p className="text-sm">
                        Archivo CSV con los detalles de facturas para SAP
                      </p>
                      <Input
                        id="nombreDetalle"
                        type="text"
                        value={nombreDetalle}
                        onChange={(e) => setNombreDetalle(e.target.value)}
                        placeholder="DET-AAAA.csv"
                        disabled={empresaId === null}
                      />
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleDescargarDetalle}
                      disabled={downloadDisabled}
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
