import { Eye, MessageSquare, Unlock } from 'lucide-react';
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
import { Table, TableBody, TableCell, TableRow } from '~/components/ui/table';
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
  const [comentario, setComentario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      void loadData();
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
      <DialogContent className='mx-4 sm:max-w-xl'>
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
                  <TableRow className='border-border'>
                    <TableCell className='font-medium text-xs py-1'>
                      Fecha Vencimiento
                    </TableCell>
                    <TableCell className='text-xs py-1'>:</TableCell>
                    <TableCell className='text-xs py-1'>
                      {data.reFechaIngreso}
                    </TableCell>
                  </TableRow>
                  <TableRow className='border-border'>
                    <TableCell className='font-medium text-xs py-1'>
                      Fecha de pago
                    </TableCell>
                    <TableCell className='text-xs py-1'>:</TableCell>
                    <TableCell className='text-xs py-1'>-</TableCell>
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
