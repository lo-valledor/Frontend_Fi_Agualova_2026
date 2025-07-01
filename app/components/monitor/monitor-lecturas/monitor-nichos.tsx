import React, { useCallback, useEffect, useState } from 'react';
import api from '~/lib/api';
import { RotateCcw, Loader2, Gauge, Settings } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import EditarMedidores from './editar-medidores';
import type { MedidorNichoItem } from '~/types/monitor';
import { LoadingState, EmptyState } from '~/components/loading-state';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { columnsNichos, columnGroups } from './columns-nichos';
import { DataTableNichos } from './data-table-nichos';
import { type PaginationState } from '@tanstack/react-table';
import { LoadingSpinner } from '~/components/loading-spinner';

export default function MonitorNichos({
  periodo,
  nicho,
  onSuccess,
}: {
  periodo: string;
  nicho: string;
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<MedidorNichoItem[]>([]);
  const [openDialogs, setOpenDialogs] = useState<Record<number, boolean>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastEditedId, setLastEditedId] = useState<number | null>(null);
  const [highlightTimeout, setHighlightTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [selectedMedidor, setSelectedMedidor] =
    useState<MedidorNichoItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [needsRefreshOnClose, setNeedsRefreshOnClose] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });

  const searchResults = useCallback(async () => {
    const params = new URLSearchParams({
      periodo,
      nicho,
    });

    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }
      const response = await api.get('/lecturas-nicho', { params });
      setResults(response.data as MedidorNichoItem[]);
    } catch (error) {
      console.error('Error al obtener lecturas de nicho:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [periodo, nicho, isRefreshing]);

  useEffect(() => {
    searchResults();
  }, [searchResults]);

  // Limpiar el temporizador cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (highlightTimeout) {
        clearTimeout(highlightTimeout);
      }
    };
  }, [highlightTimeout]);

  useEffect(() => {
    if (!isDialogOpen && needsRefreshOnClose) {
      setIsRefreshing(true);
      searchResults();
      setNeedsRefreshOnClose(false);
    }
  }, [isDialogOpen, needsRefreshOnClose, searchResults]);

  const handleOpenDialog = (id: number, isOpen: boolean) => {
    setOpenDialogs((prev) => ({
      ...prev,
      [id]: isOpen,
    }));
  };

  const handleRowClick = (medidor: MedidorNichoItem) => {
    // Solo abrir el diálogo si no es Estado 5 (facturación) y no es el último editado
    if (medidor.Estado !== 5 && lastEditedId !== medidor.LM_ID) {
      setSelectedMedidor(medidor);
      setIsDialogOpen(true);
    }
  };

  const handleSuccess = (id: number) => {
    // Cerrar el diálogo
    setIsDialogOpen(false);
    setNeedsRefreshOnClose(true);

    // Limpiar cualquier temporizador existente
    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
    }

    // Establecer el ID editado para resaltarlo
    setLastEditedId(id);

    // Configurar un temporizador para quitar el resaltado después de 3 segundos
    const timer = setTimeout(() => {
      setLastEditedId(null);
    }, 3000);

    setHighlightTimeout(timer);

    // Notificar al componente padre que hubo una actualización exitosa
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    searchResults();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingState message="Cargando datos de nichos..." />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState message="No se encontraron medidores para los parámetros seleccionados" />
      </div>
    );
  }

  // Preparar las props para pasar a la función de columnas
  const columnProps = {
    handleOpenDialog,
    openDialogs,
    lastEditedId,
    handleSuccess,
  };

  return (
    <div className="space-y-3">
      <Card className="border-border/50 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <CardHeader className="pb-2 px-4 pt-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Monitor de Medidores
            </CardTitle>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="secondary"
                className="bg-sky-100/80 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700 font-medium text-xs py-0 px-2 h-5"
              >
                Nicho: {nicho}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-amber-100/80 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-medium text-xs py-0 px-2 h-5"
              >
                Periodo: {periodo}
              </Badge>
              <Badge
                variant="outline"
                className="bg-slate-50/80 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 text-xs py-0 px-2 h-5"
              >
                {results.length} medidores
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 bg-muted/50 hover:bg-muted/80 transition-all duration-200 h-6 px-2 text-xs"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RotateCcw className="h-3 w-3" />
                )}
                {isRefreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="mt-4">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <DataTableNichos
                columns={columnsNichos(columnProps)}
                data={results}
                columnGroups={columnGroups}
                onRowClick={handleRowClick}
                pagination={pagination}
                onPaginationChange={setPagination}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo responsive para editar/reaperturar medidor */}
      {selectedMedidor && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-auto lg:max-w-4xl xl:max-w-5xl overflow-auto flex flex-col">
            <DialogHeader className="shrink-0 pb-4 border-b border-border/40">
              <DialogTitle className="text-xl flex flex-col sm:flex-row sm:items-center gap-2 text-sky-800 dark:text-sky-200">
                <div className="flex items-center gap-2">
                  {selectedMedidor.Estado === 4 ? (
                    <RotateCcw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Settings className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  )}
                  {selectedMedidor.Estado === 4
                    ? 'Reaperturar Medidor'
                    : 'Editar Medidor'}
                </div>
                <Badge
                  variant="outline"
                  className="bg-sky-50/80 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700 font-mono text-sm"
                >
                  {selectedMedidor.ME_NSerie}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Complete la información para{' '}
                {selectedMedidor.Estado === 4 ? 'reaperturar' : 'actualizar'} la
                medición del medidor seleccionado
              </DialogDescription>
            </DialogHeader>

            <div>
              <div className="p-6">
                <EditarMedidores
                  result={selectedMedidor}
                  onSuccess={() => handleSuccess(selectedMedidor.LM_ID)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
