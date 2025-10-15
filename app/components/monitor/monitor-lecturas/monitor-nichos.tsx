import { type PaginationState } from '@tanstack/react-table';
import { Loader2, RotateCcw, Search, Settings, X, Zap } from 'lucide-react';

import { useCallback, useEffect, useMemo, useState } from 'react';

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
import { Input } from '~/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import api from '~/lib/api';
import type { MedidorNichoItem } from '~/types/monitor';

import { columnGroups, columnsNichos } from './columns-nichos';
import { DataTableNichos } from './data-table-nichos';
import EditarMedidores from './editar-medidores';
import { InsercionAutomaticaDialog } from './insercion-automatica-dialog';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isInsercionAutomaticaOpen, setIsInsercionAutomaticaOpen] =
    useState(false);

  // Filtrar resultados basado en el término de búsqueda
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) {
      return results;
    }

    const searchLower = searchTerm.toLowerCase().trim();
    return results.filter(item => {
      return (
        item.ME_NSerie?.toLowerCase().includes(searchLower) ||
        item.ubicacion?.toLowerCase().includes(searchLower) ||
        item.local?.toLowerCase().includes(searchLower) ||
        item.tarifa?.toLowerCase().includes(searchLower) ||
        item.Nro?.toString().includes(searchLower)
      );
    });
  }, [results, searchTerm]);

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

  if (filteredResults.length === 0 && searchTerm.trim()) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <EmptyState
          message={`No se encontraron medidores que coincidan con "${searchTerm}"`}
        />
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
      <div className='flex-shrink-0 border-b border-border pb-4 mb-4 space-y-3'>
        {/* Primera fila: Badges y botón actualizar */}
        <div className='flex items-center justify-between gap-3 flex-wrap'>
          <div className='flex items-center gap-2 flex-wrap'>
            <Badge
              variant='outline'
              className='h-9 bg-primary/10 text-primary border-primary/20 font-semibold text-sm px-3 shadow-sm inline-flex items-center'
            >
              <div className='w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse' />
              Nicho: {nicho}
            </Badge>
            <Badge
              variant='outline'
              className='h-9 bg-secondary/50 text-secondary-foreground border-border font-semibold text-sm px-3 shadow-sm inline-flex items-center'
            >
              <div className='w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mr-2' />
              Periodo: {periodo}
            </Badge>
            <Badge
              variant='outline'
              className='h-9 bg-muted text-muted-foreground border-border font-semibold text-sm px-3 shadow-sm inline-flex items-center'
            >
              {filteredResults.length} medidores
              {searchTerm.trim() && ` de ${results.length}`}
            </Badge>
          </div>

          <div className='flex items-center gap-2'>
            {/* Botón de Inserción Automática */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-9 gap-2 bg-secondary hover:bg-secondary/80 border-border text-secondary-foreground transition-all duration-200 px-4 text-sm font-medium tap-highlight-transparent touch-manipulation shadow-sm hover:shadow-md inline-flex items-center'
                    onClick={() => setIsInsercionAutomaticaOpen(true)}
                    disabled={isRefreshing || results.length === 0}
                  >
                    <Zap className='h-4 w-4' />
                    <span className='hidden sm:inline'>Autovalidar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Insertar automáticamente lecturas importadas válidas (solo
                    BT1/BT2)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Botón de Actualizar */}
            <Button
              variant='outline'
              size='sm'
              className='h-9 gap-2 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary transition-all duration-200 px-4 text-sm font-medium tap-highlight-transparent touch-manipulation shadow-sm hover:shadow-md inline-flex items-center'
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span className='hidden xs:inline'>Actualizando...</span>
                </>
              ) : (
                <>
                  <RotateCcw className='h-4 w-4' />
                  <span className='hidden xs:inline'>Actualizar</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Segunda fila: Buscador */}
        <div className='flex items-center gap-3'>
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4' />
            <Input
              type='text'
              placeholder='Buscar por N° Serie, Ubicación, Local, Tarifa o N°...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 pr-10 h-9 bg-background border-border focus:border-primary focus:ring-primary text-sm'
            />
            {searchTerm && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-background dark:hover:bg-muted-800'
                onClick={() => setSearchTerm('')}
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido de la tabla */}
      <div className='flex-1 min-h-0 overflow-auto'>
        {isLoading ? (
          <div className='flex items-center justify-center h-full min-h-[300px]'>
            <LoadingSpinner />
          </div>
        ) : (
          <div className='h-full overflow-auto'>
            <DataTableNichos
              columns={columnsNichos(columnProps)}
              data={filteredResults}
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
              <DialogTitle className='text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-2 text-foreground'>
                <div className='flex items-center gap-2'>
                  {selectedMedidor.Estado === 4 ? (
                    <RotateCcw className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                  ) : (
                    <Settings className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
                  )}
                  <span className='text-base sm:text-lg'>
                    {selectedMedidor.Estado === 4
                      ? 'Reaperturar Medidor'
                      : 'Editar Medidor'}
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className='bg-primary/10 text-primary border-primary/20 font-mono text-xs sm:text-sm'
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
                  key={selectedMedidor.LM_ID}
                  result={selectedMedidor}
                  onSuccess={() => handleSuccess(selectedMedidor.LM_ID)}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de Inserción Automática */}
      <InsercionAutomaticaDialog
        open={isInsercionAutomaticaOpen}
        onOpenChange={setIsInsercionAutomaticaOpen}
        medidores={results}
        periodo={periodo}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
