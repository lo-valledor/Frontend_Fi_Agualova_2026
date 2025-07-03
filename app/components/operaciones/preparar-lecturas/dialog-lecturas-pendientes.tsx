import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import {
  ClockIcon,
  Loader2,
  Info,
  AlertCircleIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { type ValidarSectoresPendientes } from '~/types/operaciones';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from '~/components/ui/table';
import { ScrollArea } from '@radix-ui/react-scroll-area';

interface DialogLecturasPendientesProps {
  data: ValidarSectoresPendientes | undefined;
  isLoading?: boolean;
  onRefresh?: () => Promise<unknown>;
}

export default function DialogLecturasPendientes({
  data,
  isLoading,
  onRefresh,
}: DialogLecturasPendientesProps) {
  // Función para renderizar el badge del estado
  const renderEstadoBadge = (estado: number) => {
    switch (estado) {
      case 1:
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
            Pendiente
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
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
          variant="outline"
          size="sm"
          className="gap-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/40 dark:hover:to-orange-900/40"
        >
          <ClockIcon className="h-4 w-4" />
          Lecturas pendientes
          {data && !data.sinPendientes && (
            <Badge
              variant="secondary"
              className="ml-1 bg-amber-200 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200"
            >
              {data.totalPendientes}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-amber-700 to-orange-700 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
                Sectores con Lecturas Pendientes
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Sectores con lecturas pendientes para el periodo en consulta
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            {data && !data.sinPendientes && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800/50 rounded-lg flex items-center justify-center">
                  <AlertCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  {data.mensaje}
                </span>
              </div>
            )}

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 ml-auto border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                onClick={onRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCwIcon className="h-4 w-4" />
                )}
                Actualizar
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <ScrollArea className="h-[calc(70vh-200px)] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50 to-amber-50 dark:from-slate-900 dark:to-amber-900/20 hover:from-slate-100 hover:to-amber-100 dark:hover:from-slate-800 dark:hover:to-amber-900/30">
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                      Sector
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                      Nicho
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                      Cantidad
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                      Estado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-32">
                        <div className="flex justify-center items-center flex-col gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full border-4 border-amber-200 dark:border-amber-800"></div>
                            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></div>
                          </div>
                          <span className="text-amber-700 dark:text-amber-300 font-medium">
                            Cargando...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : !data || data.sinPendientes ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-32">
                        <div className="flex justify-center items-center flex-col gap-3">
                          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
                            <Info className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                              No hay lecturas pendientes
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Todos los sectores están al día
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.detalles.map((item, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                      >
                        <TableCell className="text-center">
                          <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md inline-block">
                            {item.sector}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-mono text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-md inline-block">
                            {item.nicho}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block">
                            {item.cantidad}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
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
                    <TableFooter className="bg-gradient-to-r from-slate-50 to-amber-50 dark:from-slate-900 dark:to-amber-900/20">
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="font-medium text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            Periodo: {data.periodo}
                          </div>
                        </TableCell>
                        <TableCell
                          colSpan={2}
                          className="text-right font-medium text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex items-center justify-end gap-2">
                            <span>Total pendientes:</span>
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
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

        <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
