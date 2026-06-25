import { Download, Eye, MessageSquare, Unlock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import api from '~/lib/api';
import { operacionesService } from '~/services/operacionesService';

interface ConsultaAcometidaDetalle {
  ctId?: string;
  seCodigo?: string;
  meNSerie?: string;
  clRut?: string;
  clRazonSocialCompleto?: string;
  niDescripcion?: string;
  secDescripcion?: string;
  reCantDocumentos?: number;
  reDeudaTotal?: number;
  reFechaIngreso?: string;
}

interface ConsultarAcometidaDialogProps {
  acometida: string;
  onSuccess: () => void;
}

const FORMATO_MONEDA = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

const formatCurrency = (value: number | undefined): string =>
  FORMATO_MONEDA.format(value ?? 0);

const ColonCell = () => (
  <TableCell className="text-xs py-1 w-3 text-center">:</TableCell>
);

export function ConsultarAcometidaDialog({
  acometida,
  onSuccess
}: Readonly<ConsultarAcometidaDialogProps>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ConsultaAcometidaDetalle | null>(null);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (open) {
      void loadData();
    }
  }, [open]);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await operacionesService.getConsultarDeuda(acometida);
      const list = Array.isArray(response.data) ? response.data : [];
      if (list.length > 0) {
        setData(list[0] as ConsultaAcometidaDetalle);
      } else if (response.data && !Array.isArray(response.data)) {
        setData(response.data as ConsultaAcometidaDetalle);
      } else {
        toast.error('No se encontraron datos para esta acometida');
        setData(null);
      }
    } catch (err) {
      toast.error('Error al cargar los datos de la acometida', {
        description: String(err)
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = async (): Promise<void> => {
    setIsExporting(true);
    try {
      const response = await api.get('exportar-facturas-impagas', {
        params: { acometida },
        responseType: 'blob'
      });

      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data as BlobPart]);
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facturas-impagas-${acometida}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);

      toast.success('Excel exportado correctamente');
    } catch (err) {
      toast.error('Error al exportar las facturas a Excel', {
        description: String(err)
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleLiberar = async (): Promise<void> => {
    if (!comentario.trim()) {
      toast.error('El comentario es obligatorio');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await operacionesService.postLiberarAcometida({
        acometida,
        comentario
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Liberación registrada correctamente');
      setOpen(false);
      setComentario('');
      onSuccess();
    } catch (err) {
      toast.error('Error al registrar la liberación', {
        description: String(err)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:border-blue-600 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Consultar Acometida</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="mx-4 sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shrink-0">
              <Eye className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="truncate">Consulta - {acometida}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Información detallada y opción de liberación
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarExcel}
            disabled={isExporting}
            className="gap-1.5"
          >
            <Download className="h-3 w-3" />
            {isExporting ? 'Exportando...' : 'Exportar Facturas'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : data ? (
          <div className="space-y-3">
            <div className="bg-muted rounded-lg p-2 border">
              <Table className="table-fixed w-full">
                <TableBody>
                  <TableRow className="border-border">
                    <TableCell className="font-medium text-xs py-1 w-2/5">
                      RUT
                    </TableCell>
                    <ColonCell />
                    <TableCell className="font-mono text-xs py-1">
                      {data.clRut ?? '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-xs py-1 w-2/5">
                      Nombre Cliente
                    </TableCell>
                    <ColonCell />
                    <TableCell className="text-xs py-1">
                      {data.clRazonSocialCompleto ?? '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-card rounded-lg p-2 border">
              <Table className="table-fixed w-full">
                <TableBody>
                  <TableRow className="border-border">
                    <TableCell className="font-medium text-xs py-1">
                      Acometida
                    </TableCell>
                    <ColonCell />
                    <TableCell className="font-mono text-xs py-1">
                      {data.seCodigo ?? '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border">
                    <TableCell className="font-medium text-xs py-1">
                      ID Contrato
                    </TableCell>
                    <ColonCell />
                    <TableCell className="font-mono text-xs py-1">
                      {data.ctId ?? '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-xs py-1">
                      N° Serie Medidor
                    </TableCell>
                    <ColonCell />
                    <TableCell className="font-mono text-xs py-1">
                      {data.meNSerie ?? '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-xs py-1">
                      Sección
                    </TableCell>
                    <ColonCell />
                    <TableCell className="text-xs py-1">
                      {data.secDescripcion ?? '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium text-xs py-1">
                      Nivel
                    </TableCell>
                    <ColonCell />
                    <TableCell className="text-xs py-1">
                      {data.niDescripcion ?? '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="bg-accent rounded-lg p-2 border">
              <Table className="table-fixed w-full">
                <TableBody>
                  <TableRow className="border-border">
                    <TableCell className="font-medium text-xs py-1 w-2/5">
                      Deuda Total
                    </TableCell>
                    <ColonCell />
                    <TableCell className="font-mono font-bold text-sm py-1">
                      {formatCurrency(data.reDeudaTotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border">
                    <TableCell className="font-medium text-xs py-1">
                      Documentos Asociados
                    </TableCell>
                    <ColonCell />
                    <TableCell className="font-mono text-xs py-1">
                      {data.reCantDocumentos ?? 0}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-border">
                    <TableCell className="font-medium text-xs py-1">
                      Fecha Ingreso
                    </TableCell>
                    <ColonCell />
                    <TableCell className="font-mono text-xs py-1">
                      {data.reFechaIngreso ?? '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="border-t pt-2">
              <p className="text-xs text-muted-foreground mb-2">
                Para liberar de corte, ingresar motivo y presionar liberar
              </p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label
                    htmlFor="comentario-liberar"
                    className="flex items-center gap-1 text-xs"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Comentario
                  </Label>
                  <Textarea
                    id="comentario-liberar"
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Comentario obligatorio para liberación..."
                    className="min-h-15 resize-none text-xs"
                    maxLength={500}
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {comentario.length}/500
                  </div>
                </div>
                <Button
                  onClick={handleLiberar}
                  disabled={!comentario.trim() || isSubmitting}
                  className="w-full text-xs h-8"
                >
                  <Unlock className="h-3 w-3 mr-1" />
                  {isSubmitting ? 'Liberando...' : 'Liberar'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <p className="text-muted-foreground text-sm">
              No se encontraron datos para esta acometida
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
