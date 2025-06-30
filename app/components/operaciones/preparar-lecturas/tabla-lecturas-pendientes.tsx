import { type ValidarSectoresPendientes } from '~/types/operaciones';
import { Button } from '~/components/ui/button';
import { RefreshCwIcon, Loader2, Info, AlertCircleIcon } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
} from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';

interface TablaLecturasPendientesProps {
  data: ValidarSectoresPendientes | undefined;
  isLoading?: boolean;
  onRefresh?: () => Promise<unknown>;
}

export default function TablaLecturasPendientes({
  data,
  isLoading,
  onRefresh,
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
      <div className="flex justify-between items-center">
        {data && !data.sinPendientes && (
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">
              {data.mensaje}
            </span>
          </div>
        )}

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 ml-auto"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCwIcon className="h-3.5 w-3.5" />
            )}
            Actualizar
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden shadow-sm bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/60">
              <TableHead className="text-xs font-medium text-muted-foreground">
                Sector
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Nicho
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Cantidad
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">
                Estado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  <span className="mt-2 block text-xs">Cargando...</span>
                </TableCell>
              </TableRow>
            ) : !data || data.sinPendientes ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Info className="mx-auto h-5 w-5 text-muted-foreground" />
                  <span className="mt-2 block text-xs">
                    No hay lecturas pendientes
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              data.detalles.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell>{item.sector}</TableCell>
                  <TableCell>{item.nicho}</TableCell>
                  <TableCell>{item.cantidad}</TableCell>
                  <TableCell>{renderEstadoBadge(item.estado)}</TableCell>
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
                  <TableCell colSpan={2} className="text-xs font-medium">
                    Periodo: {data.periodo}
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    className="text-xs font-medium text-right"
                  >
                    Total pendientes: {data.totalPendientes}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
        </Table>
      </div>
    </div>
  );
}
