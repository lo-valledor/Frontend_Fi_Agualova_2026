import {
  AlertCircle,
  CheckCircle2,
  FileTextIcon,
  Info,
  PlayIcon,
  ServerIcon,
  UsersIcon
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import { operacionesService } from '~/services/operacionesService';
import type { PrepararLecturasBuscarNichosRequest } from '~/types/operaciones';

interface TablaAsignacionSectoresProps {
  data: PrepararLecturasBuscarNichosRequest[];
  isLoading: boolean;
  cicloId: number;
  periodoId: string;
  onSuccess?: () => Promise<void> | void;
}

type ResultadoProceso = {
  exitosos: number;
  fallidos: number;
  mensaje?: string;
};

const generarResumenProceso = (
  resultado: ResultadoProceso
): { tipo: 'success' | 'warning' | 'error'; mensaje: string } => {
  if (resultado.fallidos === 0 && resultado.exitosos > 0) {
    return {
      tipo: 'success',
      mensaje: `${resultado.exitosos} nichos generados correctamente`
    };
  }
  if (resultado.exitosos === 0 && resultado.fallidos > 0) {
    return {
      tipo: 'error',
      mensaje:
        resultado.mensaje ??
        `No se pudo procesar ningún nicho (${resultado.fallidos} errores)`
    };
  }
  return {
    tipo: 'warning',
    mensaje: `${resultado.exitosos} exitosos, ${resultado.fallidos} con error`
  };
};

export default function TablaAsignacionSectores({
  data,
  isLoading,
  cicloId,
  periodoId,
  onSuccess
}: Readonly<TablaAsignacionSectoresProps>) {
  const [selectedIdsNichos, setSelectedIdsNichos] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultado, setResultado] = useState<ResultadoProceso | null>(null);

  const toggleNicho = (idNicho: number): void => {
    setSelectedIdsNichos(prev =>
      prev.includes(idNicho)
        ? prev.filter(id => id !== idNicho)
        : [...prev, idNicho]
    );
  };

  const toggleSeleccionarTodo = (): void => {
    if (selectedIdsNichos.length === data.length) {
      setSelectedIdsNichos([]);
    } else {
      setSelectedIdsNichos(data.map(d => d.idNicho));
    }
  };

  const prepararLecturas = async (): Promise<void> => {
    if (selectedIdsNichos.length === 0) {
      toast.error('Selecciona al menos un nicho para preparar');
      return;
    }

    if (!cicloId || !periodoId) {
      toast.error('Faltan datos de ciclo o período');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await operacionesService.postGenerarLecturas({
        idsNichos: selectedIdsNichos,
        cicloId,
        periodoId
      });

      if (result.error) {
        const resumen = generarResumenProceso({
          exitosos: 0,
          fallidos: selectedIdsNichos.length,
          mensaje: result.error
        });
        setResultado({
          exitosos: 0,
          fallidos: selectedIdsNichos.length,
          mensaje: result.error
        });
        toast.error(resumen.mensaje);
        return;
      }

      setResultado({
        exitosos: selectedIdsNichos.length,
        fallidos: 0
      });
      toast.success(
        `${selectedIdsNichos.length} nichos preparados correctamente`
      );
      setSelectedIdsNichos([]);
      await onSuccess?.();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error al preparar lecturas';
      setResultado({
        exitosos: 0,
        fallidos: selectedIdsNichos.length,
        mensaje
      });
      toast.error(mensaje);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFilas = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center h-32">
            <div className="flex justify-center items-center flex-col gap-3">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-border border-t-primary" />
              <span className="text-muted-foreground text-sm font-medium">
                Cargando nichos...
              </span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center h-32 px-4">
            <div className="flex flex-col items-center gap-2">
              <Info className="h-6 w-6 text-muted-foreground" />
              <p className="font-medium text-sm">No hay nichos pendientes</p>
              <p className="text-xs text-muted-foreground">
                Selecciona un ciclo y período, luego haz clic en Buscar.
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return data.map(item => (
      <TableRow
        key={item.idNicho}
        className={
          selectedIdsNichos.includes(item.idNicho)
            ? 'bg-emerald-50/40 dark:bg-emerald-900/10'
            : 'hover:bg-muted/40'
        }
      >
        <TableCell className="text-center px-2 sm:px-4">
          <Checkbox
            checked={selectedIdsNichos.includes(item.idNicho)}
            onCheckedChange={() => toggleNicho(item.idNicho)}
            aria-label={`Seleccionar nicho ${item.idNicho}`}
          />
        </TableCell>
        <TableCell className="text-center px-2 sm:px-4 text-sm">
          {item.nombreSector}
        </TableCell>
        <TableCell className="px-2 sm:px-4 hidden sm:table-cell">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[250px] truncate text-sm">
                  {item.nombreNicho}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{item.nombreNicho}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className="text-center px-2 sm:px-4">
          <span className="font-medium bg-muted px-2 sm:px-3 py-1 rounded-full inline-block text-xs sm:text-sm">
            {item.cantidadMedidores}
          </span>
        </TableCell>
        <TableCell className="text-center px-2 sm:px-4">
          {selectedIdsNichos.includes(item.idNicho) ? (
            <Badge className="bg-emerald-600 text-white border-0 text-xs">
              Seleccionado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Pendiente
            </Badge>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-medium">
                {selectedIdsNichos.length === 0
                  ? 'Sin selección'
                  : `${selectedIdsNichos.length} nicho${
                      selectedIdsNichos.length === 1 ? '' : 's'
                    } seleccionado(s)`}
              </div>
              <div className="text-xs text-muted-foreground">
                Selecciona filas para habilitar acciones
              </div>
            </div>
          </div>

          <Button
            onClick={prepararLecturas}
            disabled={
              isSubmitting ||
              selectedIdsNichos.length === 0 ||
              !cicloId ||
              !periodoId
            }
            size="sm"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            <span>{isSubmitting ? 'Procesando...' : 'Preparar lecturas'}</span>
          </Button>
        </div>
      </div>

      {resultado && (
        <div
          className={`rounded-xl p-4 border ${
            resultado.fallidos === 0
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : resultado.exitosos === 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="flex gap-3 items-start">
            {resultado.fallidos === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : resultado.exitosos === 0 ? (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            )}
            <div className="flex-1">
              <p
                className={`font-medium ${
                  resultado.fallidos === 0
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : resultado.exitosos === 0
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                {resultado.mensaje ?? generarResumenProceso(resultado).mensaje}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden bg-background shadow-sm">
        <ScrollArea className="h-[calc(100vh-500px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/60">
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={
                      data.length > 0 &&
                      selectedIdsNichos.length === data.length
                    }
                    onCheckedChange={toggleSeleccionarTodo}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
                <TableHead className="text-center font-semibold text-xs sm:text-sm">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <ServerIcon className="w-3 h-3 sm:w-4 sm:w-4 text-muted-foreground" />
                    <span className="hidden sm:inline">Sector</span>
                    <span className="sm:hidden">Sect</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-xs sm:text-sm hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                    Nicho
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-xs sm:text-sm">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <UsersIcon className="w-3 h-3 sm:w-4 sm:w-4 text-muted-foreground" />
                    <span className="hidden sm:inline">Medidores</span>
                    <span className="sm:hidden">Med</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-xs sm:text-sm w-20 sm:w-[120px]">
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderFilas()}</TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
