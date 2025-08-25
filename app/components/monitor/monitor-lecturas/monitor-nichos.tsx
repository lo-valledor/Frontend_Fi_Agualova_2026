import { type PaginationState } from '@tanstack/react-table';
import { Loader2, RotateCcw, Settings } from 'lucide-react';

import { useCallback, useEffect, useState } from 'react';

import { LoadingSpinner } from '~/components/loading-spinner';
import { EmptyState, LoadingState } from '~/components/loading-state';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import api from '~/lib/api';
import type { MedidorNichoItem } from '~/types/monitor';

import { columnGroups, columnsNichos } from './columns-nichos';
import { DataTableNichos } from './data-table-nichos';
import EditarMedidores from './editar-medidores';

export default function MonitorNichos({
  periodo,
  nicho,
  onSuccess
}: Readonly<{
  periodo: string;
  nicho: string;
  onSuccess?: () => void;
}>) {
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
    pageSize: 15
  });

  const searchResults = useCallback(async () => {
    const params = new URLSearchParams({
      periodo,
      nicho
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
    setOpenDialogs(prev => ({
      ...prev,
      [id]: isOpen
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
      <div className='flex items-center justify-center min-h-[400px]'>
        <LoadingState title='Cargando datos de nichos...' />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <EmptyState message='No se encontraron medidores para los parámetros seleccionados' />
      </div>
    );
  }

  // Preparar las props para pasar a la función de columnas
  const columnProps = {
    handleOpenDialog,
    openDialogs,
    lastEditedId,
    handleSuccess
  };

  return (
    <div className='w-full h-full flex flex-col'>
      {/* Header compacto para modal */}
      <div className='flex-shrink-0 border-b border-border/40 pb-3 mb-4'>
        <div className='flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-1.5'>
            <Badge
              variant='secondary'
              className='bg-sky-100/80 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200 border-sky-300 dark:border-sky-700 font-medium text-xs py-0.5 px-2'
            >
              Nicho: {nicho}
            </Badge>
            <Badge
              variant='secondary'
              className='bg-amber-100/80 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-medium text-xs py-0.5 px-2'
            >
              Periodo: {periodo}
            </Badge>
            <Badge
              variant='outline'
              className='bg-slate-50/80 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 text-xs py-0.5 px-2'
            >
              {results.length} medidores
            </Badge>
          </div>

          <Button
            variant='outline'
            size='sm'
            className='gap-1.5 bg-muted/50 hover:bg-muted/80 active:bg-muted/90 transition-all duration-200 h-7 px-2 text-xs self-start xs:self-auto tap-highlight-transparent touch-manipulation'
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className='h-3 w-3 animate-spin' />
            ) : (
              <RotateCcw className='h-3 w-3' />
            )}
            <span className='hidden xs:inline'>
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </span>
          </Button>
        </div>
      </div>

      {/* Contenido de la tabla */}
      <div className='flex-1 min-h-0 overflow-hidden'>
        {isLoading ? (
          <div className='flex items-center justify-center h-full min-h-[300px]'>
            <LoadingSpinner />
          </div>
        ) : (
          <div className='h-full'>
            <DataTableNichos
              columns={columnsNichos(columnProps)}
              data={results}
              columnGroups={columnGroups}
              onRowClick={handleRowClick}
              pagination={pagination}
              onPaginationChange={setPagination}
            />
          </div>
        )}
      </div>

      {/* Diálogo responsive para editar/reaperturar medidor */}
      {selectedMedidor && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className='max-w-[98vw] sm:max-w-[95vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[98vh] sm:max-h-[95vh] h-auto overflow-hidden flex flex-col'>
            <DialogHeader className='shrink-0 pb-3 sm:pb-4 border-b border-border/40'>
              <DialogTitle className='text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-2 text-sky-800 dark:text-sky-200'>
                <div className='flex items-center gap-2'>
                  {selectedMedidor.Estado === 4 ? (
                    <RotateCcw className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400' />
                  ) : (
                    <Settings className='h-4 w-4 sm:h-5 sm:w-5 text-sky-600 dark:text-sky-400' />
                  )}
                  <span className='text-base sm:text-lg'>
                    {selectedMedidor.Estado === 4
                      ? 'Reaperturar Medidor'
                      : 'Editar Medidor'}
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className='bg-sky-50/80 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-700 font-mono text-xs sm:text-sm'
                >
                  {selectedMedidor.ME_NSerie}
                </Badge>
              </DialogTitle>
              <DialogDescription className='text-muted-foreground text-sm'>
                Complete la información para{' '}
                {selectedMedidor.Estado === 4 ? 'reaperturar' : 'actualizar'} la
                medición del medidor seleccionado
              </DialogDescription>
            </DialogHeader>

            <div className='flex-1 overflow-auto'>
              <div className='p-3 sm:p-4 lg:p-6'>
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
