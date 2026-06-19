import { AlertCircleIcon, Info, Loader2, RefreshCwIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
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

interface TablaLecturasPendientesProps {
  data: ValidarSectoresPendientes | undefined;
  isLoading?: boolean;
  onRefresh?: () => Promise<unknown>;
}

export default function TablaLecturasPendientes({
  data,
  isLoading,
  onRefresh
}: TablaLecturasPendientesProps) {
  // Función para renderizar el badge del estado
  const renderEstadoBadge = (estado: number) => {
    switch (estado) {
      case 1:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            Pendiente
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
          >
            Por procesar
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        {data && !data.sinPendientes && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <AlertCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              {data.mensaje}
            </span>
          </div>
        )}

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 sm:gap-1.5 ml-auto w-full sm:w-auto text-xs sm:text-sm px-2 sm:px-3"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            )}
            <span className="hidden sm:inline">Actualizar</span>
            <span className="sm:hidden">Act</span>
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden shadow-sm bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/60">
              <TableHead className="text-xs font-medium text-muted-foreground px-2 sm:px-4">
                Sector
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground px-2 sm:px-4">
                Nicho
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground px-2 sm:px-4">
                <span className="hidden sm:inline">Cantidad</span>
                <span className="sm:hidden">Cant</span>
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground px-2 sm:px-4">
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 sm:py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                    <span className="text-xs sm:text-sm">Cargando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data || data.sinPendientes ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 sm:py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Info className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <span className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">
                        No hay lecturas pendientes
                      </span>
                      <span className="sm:hidden">Sin pendientes</span>
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.detalles.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    {item.sector}
                  </TableCell>
                  <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    {item.nicho}
                  </TableCell>
                  <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                    {item.cantidad}
                  </TableCell>
                  <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
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
              <TableFooter className="bg-muted/30">
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-xs font-medium px-2 sm:px-4 py-2 sm:py-3"
                  >
                    <span className="hidden sm:inline">
                      Periodo: {data.periodo}
                    </span>
                    <span className="sm:hidden">Per: {data.periodo}</span>
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    className="text-xs font-medium text-right px-2 sm:px-4 py-2 sm:py-3"
                  >
                    <span className="hidden sm:inline">
                      Total pendientes: {data.totalPendientes}
                    </span>
                    <span className="sm:hidden">
                      Total: {data.totalPendientes}
                    </span>
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
        </Table>
      </div>
    </div>
  );
}
