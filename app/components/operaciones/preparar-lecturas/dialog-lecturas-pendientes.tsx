import { ScrollArea } from '@radix-ui/react-scroll-area';
import {
  AlertCircleIcon,
  ClockIcon,
  Info,
  Loader2,
  RefreshCwIcon
} from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { type ValidarSectoresPendientes } from '~/types/operaciones';

interface DialogLecturasPendientesProps {
  data: ValidarSectoresPendientes | undefined;
  isLoading?: boolean;
  onRefresh?: () => Promise<unknown>;
}

export default function DialogLecturasPendientes({
  data,
  isLoading,
  onRefresh
}: DialogLecturasPendientesProps) {
  // Función para renderizar el badge del estado
  const renderEstadoBadge = (estado: number) => {
    switch (estado) {
      case 1:
        return <Badge className='bg-emerald-500 border-0'>Pendiente</Badge>;
      default:
        return (
          <Badge
            variant='outline'
            className='bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
          >
            Por procesar
          </Badge>
        );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='gap-1 sm:gap-2  border-border text-xs sm:text-sm px-2 sm:px-3'
        >
          <ClockIcon className='h-3 w-3 sm:h-4 sm:w-4' />
          <span className='hidden sm:inline'>Lecturas pendientes</span>
          <span className='sm:hidden'>Pendientes</span>
          {data && !data.sinPendientes && (
            <Badge
              variant='secondary'
              className='ml-0.5 sm:ml-1 bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 text-xs px-1 sm:px-2'
            >
              {data.totalPendientes}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-hidden'>
        <DialogHeader className='pb-3 sm:pb-4 border-b border-border'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center'>
              <ClockIcon className='h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground' />
            </div>
            <div>
              <DialogTitle className='text-lg sm:text-xl font-semibold text-foreground'>
                <span className='hidden sm:inline'>
                  Sectores con Lecturas Pendientes
                </span>
                <span className='sm:hidden'>Lecturas Pendientes</span>
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm'>
                <span className='hidden sm:inline'>
                  Sectores con lecturas pendientes para el periodo en consulta
                </span>
                <span className='sm:hidden'>
                  Sectores pendientes del periodo
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-3 sm:space-y-4 py-2 sm:py-4 overflow-hidden'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0'>
            {data && !data.sinPendientes && (
              <div className='flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-muted/50 border border-border w-full sm:w-auto'>
                <div className='w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-xl flex items-center justify-center flex-shrink-0'>
                  <AlertCircleIcon className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground' />
                </div>
                <span className='text-xs sm:text-sm text-muted-foreground font-medium'>
                  {data.mensaje}
                </span>
              </div>
            )}

            {onRefresh && (
              <Button
                variant='outline'
                size='sm'
                className='gap-1 sm:gap-2 ml-auto border-slate-200 hover:bg-muted-50 dark:border-slate-700 dark:hover:bg-muted-800 text-xs sm:text-sm px-2 sm:px-3'
                onClick={onRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
                ) : (
                  <RefreshCwIcon className='h-3 w-3 sm:h-4 sm:w-4' />
                )}
                <span className='hidden sm:inline'>Actualizar</span>
                <span className='sm:hidden'>Act</span>
              </Button>
            )}
          </div>

          <div className='rounded-xl border-border overflow-hidden bg-background shadow-sm'>
            <ScrollArea className='h-[calc(70vh-150px)] sm:h-[calc(70vh-200px)] overflow-y-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-background'>
                    <TableHead className='text-center font-semibold text-xs sm:text-sm px-2 sm:px-4'>
                      Sector
                    </TableHead>
                    <TableHead className='text-center font-semibold text-xs sm:text-sm px-2 sm:px-4'>
                      Nicho
                    </TableHead>
                    <TableHead className='text-center font-semibold text-xs sm:text-sm px-2 sm:px-4'>
                      <span className='hidden sm:inline'>Cantidad</span>
                      <span className='sm:hidden'>Cant</span>
                    </TableHead>
                    <TableHead className='text-center font-semibold text-xs sm:text-sm px-2 sm:px-4'>
                      Estado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='text-center py-6 sm:py-8'
                      >
                        <div className='flex items-center justify-center gap-2'>
                          <Loader2 className='h-4 w-4 sm:h-5 sm:w-5 animate-spin text-slate-500' />
                          <span className='text-slate-500 text-xs sm:text-sm'>
                            Cargando lecturas pendientes...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : !data || data.sinPendientes ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='text-center py-6 sm:py-8'
                      >
                        <div className='flex justify-center items-center flex-col gap-2 sm:gap-3'>
                          <div className='w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center'>
                            <Info className='h-6 w-6 sm:h-8 sm:w-8 text-emerald-500 dark:text-emerald-400' />
                          </div>
                          <div className='text-center'>
                            <p className='text-emerald-700 dark:text-emerald-300 font-medium text-sm sm:text-base'>
                              No hay lecturas pendientes
                            </p>
                            <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
                              <span className='hidden sm:inline'>
                                Todos los sectores están al día
                              </span>
                              <span className='sm:hidden'>Sectores al día</span>
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.detalles.map((item, index) => (
                      <TableRow key={index} className='hover:bg-muted'>
                        <TableCell className='text-center px-2 sm:px-4 py-2 sm:py-3'>
                          <div className='font-mono text-xs sm:text-sm font-medium bg-background px-1 sm:px-2 py-1 rounded-md inline-block'>
                            {item.sector}
                          </div>
                        </TableCell>
                        <TableCell className='text-center px-2 sm:px-4 py-2 sm:py-3'>
                          <div className='font-mono text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-1 sm:px-2 py-1 rounded-md inline-block'>
                            {item.nicho}
                          </div>
                        </TableCell>
                        <TableCell className='text-center px-2 sm:px-4 py-2 sm:py-3'>
                          <div className='font-medium text-primary bg-primary/10 px-2 sm:px-3 py-1 rounded-full inline-block text-xs sm:text-sm'>
                            {item.cantidad}
                          </div>
                        </TableCell>
                        <TableCell className='text-center px-2 sm:px-4 py-2 sm:py-3'>
                          {renderEstadoBadge(item.estado)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {data &&
                  !data.sinPendientes &&
                  data.detalles &&
                  data.detalles.length > 0 && (
                    <TableFooter className='bg-muted/30'>
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className='font-medium text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3'
                        >
                          <div className='flex items-center gap-1 sm:gap-2'>
                            <ClockIcon className='w-3 h-3 sm:w-4 sm:h-4 text-primary' />
                            <span className='hidden sm:inline'>
                              Periodo: {data.periodo}
                            </span>
                            <span className='sm:hidden'>
                              Per: {data.periodo}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          colSpan={2}
                          className='text-right font-medium text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3'
                        >
                          <div className='flex items-center justify-end gap-1 sm:gap-2'>
                            <span className='hidden sm:inline'>
                              Total pendientes:
                            </span>
                            <span className='sm:hidden'>Total:</span>
                            <Badge className='bg-primary text-xs px-1 sm:px-2'>
                              {data.totalPendientes}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
              </Table>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className='pt-3 sm:pt-4 border-t border-border'>
          <DialogClose asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='border-slate-200 hover:bg-muted-50 dark:border-slate-700 dark:hover:bg-muted-800 w-full sm:w-auto text-xs sm:text-sm px-3 sm:px-4'
            >
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
