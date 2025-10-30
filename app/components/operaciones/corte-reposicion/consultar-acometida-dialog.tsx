import { Download, Eye, MessageSquare, Unlock } from 'lucide-react';
import { toast } from 'sonner';

import { useEffect, useState } from 'react';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import api from '~/lib/api';

interface ConsultarAcometidaData {
  ctId: string;
  seCodigo: string;
  meNSerie: string;
  clRut: string;
  clRazonSocialCompleto: string;
  niDescripcion: string;
  secDescripcion: string;
  reEstado: string;
  reCantDocumentos: number;
  reDeudaTotal: number;
  reFechaIngreso: string;
}

interface FacturaImpaga {
  clRut: string;
  seCodigo: string;
  faNumero: number;
  faFechaVencimiento: string;
  faTotal: number;
  faSaldo: number;
}

interface ConsultarAcometidaDialogProps {
  acometida: string;
  onSuccess: () => void;
  disabled?: boolean;
}

export function ConsultarAcometidaDialog({
  acometida,
  onSuccess,
  disabled = false
}: Readonly<ConsultarAcometidaDialogProps>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ConsultarAcometidaData | null>(null);
  const [facturasImpagas, setFacturasImpagas] = useState<FacturaImpaga[]>([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      void loadData();
      void loadFacturasImpagas();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get<ConsultarAcometidaData[]>(
        'consulta-mantenedor-revision',
        {
          params: { acometida }
        }
      );

      if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setData(response.data[0]);
      } else {
        toast.error('No se encontraron datos para esta acometida');
      }
    } catch (error) {
      console.error('Error al consultar acometida:', error);
      toast.error('Error al cargar los datos de la acometida');
    } finally {
      setLoading(false);
    }
  };

  const loadFacturasImpagas = async () => {
    setLoadingFacturas(true);
    try {
      const response = await api.get<FacturaImpaga[]>(
        `facturas-impagas/${acometida}/2`
      );

      if (response.data && Array.isArray(response.data)) {
        setFacturasImpagas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar facturas impagas:', error);
      toast.error('Error al cargar las facturas impagas');
    } finally {
      setLoadingFacturas(false);
    }
  };

  const handleExportarExcel = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('exportar-facturas-impagas', {
        params: { acometida },
        responseType: 'blob'
      });

      // Crear un link temporal para descargar el archivo
      // El tipado de axios con responseType: 'blob' retorna response.data como "unknown"
      // así que lo forzamos a Blob de manera segura para su uso en el objeto URL.
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facturas-impagas-${acometida}.xlsx`);
      document.body.appendChild(link);

      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Excel exportado correctamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      toast.error('Error al exportar las facturas a Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLiberar = async () => {
    if (!comentario.trim()) {
      toast.error('El comentario es obligatorio');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('marcar-liberar', null, {
        params: { acometida, comentario }
      });
      toast.success('Liberación registrada correctamente');
      onSuccess();
      setOpen(false);
      // Limpiar formulario
      setComentario('');
    } catch (error) {
      console.error('Error al marcar como liberado:', error);
      toast.error('Error al registrar la liberación. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='h-8 w-8 border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:border-blue-600 transition-colors'
                disabled={disabled}
              >
                <Eye className='h-4 w-4' />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {disabled
                ? 'No tiene permisos para consultar'
                : 'Consultar Acometida'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className='mx-4 sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-sm'>
            <div className='flex h-5 w-5 items-center justify-center rounded-full bg-primary flex-shrink-0'>
              <Eye className='h-3 w-3 text-primary-foreground' />
            </div>
            <span className='truncate'>Consulta - {acometida}</span>
          </DialogTitle>
          <DialogDescription className='text-xs'>
            Información detallada y opción de liberación
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex items-center justify-center py-6'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
          </div>
        ) : data ? (
          <div className='space-y-3'>
            {/* Información principal */}
            <div className='bg-muted rounded-lg p-2 border'>
              <Table>
                <TableBody>
                  <TableRow className='border-border'>
                    <TableCell className='font-medium text-xs py-1 w-2/5'>
                      RUT
                    </TableCell>
                    <TableCell className='text-xs py-1 w-8'>:</TableCell>
                    <TableCell className='font-mono text-xs py-1'>
                      {data.clRut}
                    </TableCell>
                  </TableRow>
                  <TableRow className='border-border'>
                    <TableCell className='font-medium text-xs py-1'>
                      Acometida
                    </TableCell>
                    <TableCell className='text-xs py-1'>:</TableCell>
                    <TableCell className='font-mono text-xs py-1'>
                      {data.seCodigo}
                    </TableCell>
                  </TableRow>
                  <TableRow className='border-border'>
                    <TableCell className='font-medium text-xs py-1'>
                      Número Factura
                    </TableCell>
                    <TableCell className='text-xs py-1'>:</TableCell>
                    <TableCell className='font-mono text-xs py-1'>
                      {data.ctId}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Información de cliente */}
            <div className='bg-card rounded-lg p-2 border'>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className='font-medium text-xs py-1 w-2/5'>
                      Nombre Cliente
                    </TableCell>
                    <TableCell className='text-xs py-1 w-8'>:</TableCell>
                    <TableCell className='text-xs py-1'>
                      {data.clRazonSocialCompleto}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className='font-medium text-xs py-1'>
                      N° Serie Medidor
                    </TableCell>
                    <TableCell className='text-xs py-1'>:</TableCell>
                    <TableCell className='font-mono text-xs py-1'>
                      {data.meNSerie}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className='font-medium text-xs py-1'>
                      Sección
                    </TableCell>
                    <TableCell className='text-xs py-1'>:</TableCell>
                    <TableCell className='text-xs py-1'>
                      {data.secDescripcion}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className='font-medium text-xs py-1'>
                      Nivel
                    </TableCell>
                    <TableCell className='text-xs py-1'>:</TableCell>
                    <TableCell className='text-xs py-1'>
                      {data.niDescripcion}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Información financiera */}
            <div className='bg-accent rounded-lg p-2 border'>
              <Table>
                <TableBody>
                  <TableRow className='border-border'>
                    <TableCell className='font-medium text-xs py-1 w-2/5'>
                      Total
                    </TableCell>
                    <TableCell className='text-xs py-1 w-8'>:</TableCell>
                    <TableCell className='font-mono font-bold text-sm py-1'>
                      {formatCurrency(data.reDeudaTotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow className='border-border'>
                    <TableCell className='font-medium text-xs py-1'>
                      Saldo
                    </TableCell>
                    <TableCell className='text-xs py-1'>:</TableCell>
                    <TableCell className='font-mono font-bold text-sm py-1'>
                      {formatCurrency(data.reDeudaTotal)}
                    </TableCell>
                  </TableRow>
                  <TableRow className='border-border'>
                    <TableCell className='font-medium text-xs py-1'>
                      HC Asociada
                    </TableCell>
                    <TableCell className='text-xs py-1'>:</TableCell>
                    <TableCell className='font-mono text-xs py-1'>
                      {data.reCantDocumentos}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Facturas Impagas */}
            <div className='border-t pt-3'>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-sm font-semibold'>Facturas Impagas</h3>
                <Button
                  onClick={handleExportarExcel}
                  disabled={isExporting || facturasImpagas.length === 0}
                  size='sm'
                  variant='outline'
                  className='h-7 text-xs'
                >
                  <Download className='h-3 w-3 mr-1' />
                  {isExporting ? 'Exportando...' : 'Exportar Excel'}
                </Button>
              </div>

              {loadingFacturas ? (
                <div className='flex items-center justify-center py-4'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-primary'></div>
                </div>
              ) : facturasImpagas.length > 0 ? (
                <div className='border rounded-lg overflow-hidden'>
                  <div className='max-h-[300px] overflow-y-auto'>
                    <Table>
                      <TableHeader className='sticky top-0 bg-muted z-10'>
                        <TableRow>
                          <TableHead className='text-xs py-2'>
                            N° Factura
                          </TableHead>
                          <TableHead className='text-xs py-2'>
                            Vencimiento
                          </TableHead>
                          <TableHead className='text-xs py-2 text-right'>
                            Total
                          </TableHead>
                          <TableHead className='text-xs py-2 text-right'>
                            Saldo
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facturasImpagas.map((factura, index) => (
                          <TableRow key={index} className='border-border'>
                            <TableCell className='font-mono text-xs py-2'>
                              {factura.faNumero}
                            </TableCell>
                            <TableCell className='text-xs py-2'>
                              {new Date(
                                factura.faFechaVencimiento
                              ).toLocaleDateString('es-CL')}
                            </TableCell>
                            <TableCell className='font-mono text-xs py-2 text-right'>
                              {formatCurrency(factura.faTotal)}
                            </TableCell>
                            <TableCell className='font-mono text-xs py-2 text-right'>
                              {formatCurrency(factura.faSaldo)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className='bg-muted px-3 py-2 text-xs font-medium border-t'>
                    Total facturas: {facturasImpagas.length} | Total adeudado:{' '}
                    {formatCurrency(
                      facturasImpagas.reduce(
                        (sum, factura) => sum + factura.faSaldo,
                        0
                      )
                    )}
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center py-4 border rounded-lg bg-muted/50'>
                  <p className='text-muted-foreground text-xs'>
                    No hay facturas impagas
                  </p>
                </div>
              )}
            </div>

            {/* Sección de comentario para liberar */}
            <div className='border-t pt-2'>
              <p className='text-xs text-muted-foreground mb-2'>
                Para liberar de corte, ingresar motivo y presionar liberar
              </p>
              <div className='space-y-2'>
                <div className='space-y-1'>
                  <Label
                    htmlFor='comentario-liberar'
                    className='flex items-center gap-1 text-xs'
                  >
                    <MessageSquare className='h-3 w-3' />
                    Comentario
                  </Label>
                  <Textarea
                    id='comentario-liberar'
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder='Comentario obligatorio para liberación...'
                    className='min-h-[60px] resize-none text-xs'
                    maxLength={500}
                  />
                  <div className='text-xs text-right text-muted-foreground'>
                    {comentario.length}/500
                  </div>
                </div>
                <Button
                  onClick={handleLiberar}
                  disabled={!comentario.trim() || isSubmitting}
                  className='w-full text-xs h-8'
                >
                  <Unlock className='h-3 w-3 mr-1' />
                  {isSubmitting ? 'Liberando...' : 'Liberar'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-6'>
            <p className='text-muted-foreground text-sm'>
              No se encontraron datos para esta acometida
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
