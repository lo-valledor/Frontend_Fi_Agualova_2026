import {
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Gauge,
  Grid3X3,
  History,
  Info,
  MapPin,
  Pencil,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

import { useCallback, useEffect, useState } from 'react';

import ClockLoader from 'react-spinners/ClockLoader';

import DetallesMedidor from '~/components/monitor/monitor-lecturas/detalles-medidor';
import MonitorNichos from '~/components/monitor/monitor-lecturas/monitor-nichos';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import { useApiWithLoadingBar } from '~/lib/api';
import { cn } from '~/lib/utils';
// Assuming you have this utility for conditional classes
import type { Fila, Medidor, NichoBusqueda } from '~/types/monitor';
import { formatToYYYYMMDD } from '~/utils/date-formatter';

// Status helpers with enhanced information
const getMeterStatus = (claveHtml: string) => {
  const statusMap = {
    SINLEC: {
      color: 'gray',
      bgColor: 'bg-gray-500',
      borderColor: 'border-gray-500',
      textColor: 'text-gray-500',
      label: 'Sin Lectura',
      icon: <History className='h-3.5 w-3.5' />,
      severity: 1
    },
    SINCLA: {
      color: 'green',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-500',
      textColor: 'text-green-500',
      label: 'Lectura Normal',
      icon: <Grid3X3 className='h-3.5 w-3.5' />,
      severity: 0
    },
    CLAINF: {
      color: 'yellow',
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-500',
      label: 'Clave Informativa',
      icon: <AlertCircle className='h-3.5 w-3.5' />,
      severity: 2
    },
    CLAREL: {
      color: 'orange',
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-500',
      label: 'Clave Relevante',
      icon: <AlertTriangle className='h-3.5 w-3.5' />,
      severity: 3
    },
    CLACRI: {
      color: 'red',
      bgColor: 'bg-red-500',
      borderColor: 'border-red-500',
      textColor: 'text-red-500',
      label: 'Clave Crítica',
      icon: <AlertCircle className='h-3.5 w-3.5' />,
      severity: 4
    },
    LECCER: {
      color: 'blue',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-500',
      label: 'Lectura Cerrada',
      icon: <MapPin className='h-3.5 w-3.5' />,
      severity: 0
    },
    LECIMP: {
      color: 'purple',
      bgColor: 'bg-purple-500',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-500',
      label: 'En Facturación',
      icon: <BarChart3 className='h-3.5 w-3.5' />,
      severity: 0
    }
  };

  return statusMap[claveHtml as keyof typeof statusMap] || statusMap.SINLEC;
};

// Calculate severity stats for a nicho (for the stats display)
const calculateNichoStats = (nicho: NichoBusqueda) => {
  let total = 0;
  let critical = 0;
  let warning = 0;
  let info = 0;
  let normal = 0;
  let sinlec = 0;

  nicho.filas.forEach((fila: Fila) => {
    fila.medidores.forEach((medidor: Medidor) => {
      total++;
      const status = getMeterStatus(medidor.claveHtml);

      if (status.severity === 4) critical++;
      else if (status.severity === 3) warning++;
      else if (status.severity === 2) info++;
      else if (status.severity === 1) sinlec++;
      else normal++;
    });
  });

  return { total, critical, warning, info, normal, sinlec };
};

// Calculate total stats across all nichos
const calculateTotalStats = (nichos: NichoBusqueda[]) => {
  return nichos.reduce(
    (acc, nicho) => {
      const stats = calculateNichoStats(nicho);
      return {
        total: acc.total + stats.total,
        critical: acc.critical + stats.critical,
        warning: acc.warning + stats.warning,
        info: acc.info + stats.info,
        normal: acc.normal + stats.normal,
        sinlec: acc.sinlec + stats.sinlec
      };
    },
    { total: 0, critical: 0, warning: 0, info: 0, normal: 0, sinlec: 0 }
  );
};

// Component for status circle indicator
const StatusIndicator = ({
  status,
  size = 'md'
}: {
  status: any;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses: { [key in 'sm' | 'md' | 'lg']: string } = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div
      className={`rounded-full ${status.bgColor} ${
        sizeClasses[size ?? 'md']
      } flex-shrink-0`}
    />
  );
};

// Meter card component for reuse
const MeterCard = ({
  medidor,
  onRefresh
}: {
  medidor: any;
  onRefresh: any;
}) => {
  const status = getMeterStatus(medidor.claveHtml);

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${status.borderColor}`}
    >
      <CardContent className='p-2 sm:p-3'>
        <div className='flex justify-between items-start'>
          <div className='flex items-center gap-1 sm:gap-2 min-w-0'>
            <StatusIndicator status={status} size='sm' />
            <div className='min-w-0'>
              <div className='font-medium text-xs truncate'>
                {medidor.nSerie}
              </div>
              <div className='text-[10px] text-muted-foreground'>
                ID: {medidor.id}
              </div>
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                <Eye className='h-3 w-3' />
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-[95vw] w-full max-h-[95vh] h-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-hidden flex flex-col'>
              <DialogHeader className='shrink-0 pb-3 sm:pb-4 border-b border-border/40 px-4 sm:px-6'>
                <DialogTitle className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                  <div className='flex items-center gap-2 sm:gap-3'>
                    <div
                      className={`p-1.5 sm:p-2 rounded-lg ${status.bgColor} text-white`}
                    >
                      {status.icon}
                    </div>
                    <div>
                      <h2 className='text-lg sm:text-xl font-semibold tracking-tight'>
                        Detalle de Lectura
                      </h2>
                      <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
                        ID: {medidor.id} | Medidor: {medidor.nSerie}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${status.bgColor} text-xs sm:text-sm`}>
                    {status.label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className='flex-1 overflow-y-auto'>
                <div className='p-3 sm:p-6'>
                  <DetallesMedidor
                    lecturaId={medidor.id}
                    onSuccess={onRefresh}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className='mt-2 grid grid-cols-2 gap-1 text-xs'>
          <div>
            <div className='text-muted-foreground text-[10px]'>Lectura</div>
            <div className='font-semibold text-xs'>
              {medidor.ultimaLectura || '-'}
            </div>
          </div>
          <div>
            <div className='text-muted-foreground text-[10px]'>Consumo</div>
            <div className='font-semibold text-xs'>
              {medidor.consumo || '0'}
            </div>
          </div>
          <div className='col-span-2'>
            <div className='font-medium text-xs flex items-center gap-1'>
              <Calendar className='h-3 w-3' />
              <span className='truncate'>
                {medidor.fechaLectura
                  ? new Date(medidor.fechaLectura).toLocaleString()
                  : 'Sin registro'}
              </span>
            </div>
          </div>
        </div>

        <Separator className='my-2' />

        <div className='flex justify-center'>
          <Badge
            variant='outline'
            className={`${status.borderColor} ${status.textColor} text-[10px] px-1 py-0`}
          >
            <span className='mr-1'>{status.icon}</span>
            <span className='truncate'>{medidor.clave || status.label}</span>
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de fila compacta para vista detallada
const MeterRowDetailed = ({
  medidor,
  onRefresh
}: {
  medidor: any;
  onRefresh: any;
}) => {
  const status = getMeterStatus(medidor.claveHtml);

  return (
    <div
      className={cn(
        'group grid items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 border-l-4',
        'grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))_auto]',
        status.borderColor
      )}
    >
      {/* Status Indicator & Name/ID */}
      <div className='flex items-center gap-2 min-w-0'>
        <StatusIndicator status={status} size='sm' />
        <div className='min-w-0'>
          <div className='font-medium text-sm truncate'>{medidor.nSerie}</div>
          <div className='text-xs text-muted-foreground'>ID: {medidor.id}</div>
          {/* Mobile-only additional info */}
          <div className='sm:hidden flex items-center gap-2 mt-1'>
            <Badge
              variant='outline'
              className={cn('text-xs', status.borderColor, status.textColor)}
            >
              <span className='mr-1'>{status.icon}</span>
              <span className='truncate'>{medidor.clave || status.label}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Lectura */}
      <div className='hidden sm:block text-left'>
        <div className='text-xs text-muted-foreground'>Lectura</div>
        <div className='font-semibold text-sm'>
          {medidor.ultimaLectura || '-'}
        </div>
      </div>

      {/* Consumo */}
      <div className='hidden sm:block text-left'>
        <div className='text-xs text-muted-foreground'>Consumo</div>
        <div className='font-semibold text-sm'>{medidor.consumo || '0'}</div>
      </div>

      {/* Fecha */}
      <div className='hidden sm:block min-w-0 text-left'>
        <div className='text-xs text-muted-foreground'>Fecha</div>
        <div className='text-sm font-medium truncate'>
          {medidor.fechaLectura
            ? new Date(medidor.fechaLectura).toLocaleString('es-CL', {
                dateStyle: 'short',
                timeStyle: 'short',
                hour12: false
              })
            : 'Sin registro'}
        </div>
      </div>

      {/* Estado */}
      <div className='hidden sm:flex justify-start'>
        <Badge
          variant='outline'
          className={cn(
            'text-xs whitespace-nowrap',
            status.borderColor,
            status.textColor
          )}
        >
          <span className='mr-1'>{status.icon}</span>
          <span className='truncate'>{medidor.clave || status.label}</span>
        </Badge>
      </div>

      {/* Acción */}
      <div className='flex justify-end'>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
            >
              <Eye className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-[95vw] w-full max-h-[95vh] h-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-hidden flex flex-col'>
            <DialogHeader className='shrink-0 pb-3 sm:pb-4 border-b border-border/40 px-4 sm:px-6'>
              <DialogTitle className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <div
                    className={cn(
                      'p-1.5 sm:p-2 rounded-lg text-white',
                      status.bgColor
                    )}
                  >
                    {status.icon}
                  </div>
                  <div>
                    <h2 className='text-lg sm:text-xl font-semibold tracking-tight'>
                      Detalle de Lectura
                    </h2>
                    <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
                      ID: {medidor.id} | Medidor: {medidor.nSerie}
                    </p>
                  </div>
                </div>
                <Badge className={cn(status.bgColor, 'text-xs sm:text-sm')}>
                  {status.label}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className='flex-1 overflow-y-auto'>
              <div className='p-3 sm:p-6'>
                <DetallesMedidor lecturaId={medidor.id} onSuccess={onRefresh} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Type para el estado de resultados
interface ResultsState {
  nichos: NichoBusqueda[];
}

export default function ResultadosBusqueda({
  sector,
  periodo,
  stfechaini,
  stfechafin,
  tipoclave,
  medidor,
  clave,
  triggerSearch
}: {
  sector: string;
  periodo: string;
  stfechaini: string;
  stfechafin: string;
  tipoclave: string;
  medidor: string;
  clave: string;
  triggerSearch: number;
}) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [results, setResults] = useState<ResultsState>({ nichos: [] });
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [viewMode, setViewMode] = useState('default'); // 'default', 'compact', 'detailed'
  const [selectedNichoIndex, setSelectedNichoIndex] = useState(0);
  const [expandedFilas, setExpandedFilas] = useState<Record<string, boolean>>(
    {}
  );
  const [isNichoModalOpen, setIsNichoModalOpen] = useState(false);
  const [needsNichoRefresh, setNeedsNichoRefresh] = useState(false);
  const api = useApiWithLoadingBar();

  // Search function (same as before)
  const searchResults = async () => {
    if (!sector) {
      toast.error('Sector no seleccionado');
      return;
    }
    if (!periodo) {
      toast.error('Periodo no seleccionado');
      return;
    }
    if (!stfechaini) {
      toast.error('Fecha de inicio no seleccionada');
      return;
    }
    if (!stfechafin) {
      toast.error('Fecha de fin no seleccionada');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const params = new URLSearchParams({
      sector,
      periodo,
      stfechaini: formatToYYYYMMDD(stfechaini),
      stfechafin: formatToYYYYMMDD(stfechafin)
    });

    if (tipoclave) params.append('tipoclave', tipoclave);
    if (medidor) params.append('medidor', medidor);
    if (clave) params.append('clave', clave);

    try {
      const response = await api.get('/sector', { params });

      // Asegurarse de que la respuesta tenga la estructura esperada
      const responseData =
        response.data && typeof response.data === 'object'
          ? response.data
          : { nichos: [] };

      // Extraer los nichos de la respuesta con validación de tipo
      let rawNichos: any[] = [];
      if (
        'data' in responseData &&
        responseData.data &&
        typeof responseData.data === 'object'
      ) {
        rawNichos = Array.isArray((responseData.data as any).nichos)
          ? (responseData.data as any).nichos
          : [];
      } else if (
        'nichos' in responseData &&
        Array.isArray(responseData.nichos)
      ) {
        rawNichos = responseData.nichos;
      }

      // Aseguramos que cada nicho tenga la propiedad 'nombre'
      const nichos = rawNichos.map((nicho: any, index: number) => ({
        nombre: nicho.nombre || `Nicho ${index + 1}`,
        filas: Array.isArray(nicho.filas) ? nicho.filas : []
      }));

      setResults({ nichos });

      // Verificar si el índice actual sigue siendo válido
      if (selectedNichoIndex >= nichos.length && nichos.length > 0) {
        setSelectedNichoIndex(0);
      }

      // Initialize expanded state for all filas
      const newExpandedState: Record<string, boolean> = {};
      if (nichos && nichos.length > 0) {
        nichos.forEach((nicho, nichoIndex) => {
          // Nos aseguramos de que filas.map esté disponible
          if (Array.isArray(nicho.filas)) {
            nicho.filas.forEach((fila, filaIndex) => {
              const key = `${nichoIndex}-${filaIndex}`;
              newExpandedState[key] = expandedFilas[key] ?? true; // Mantener estado previo o expandir por defecto
            });
          }
        });
      }
      setExpandedFilas(newExpandedState);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchError(null); // Cambiado para coincidir con el tipo esperado
      toast.error('Error al buscar lecturas');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = useCallback(() => {
    if (sector && periodo && stfechaini && stfechafin) {
      // Incrementar el contador de refrescar para desencadenar la recarga
      setRefreshCounter(prev => prev + 1);

      // Después de que se completa la búsqueda, restauramos el estado expandido
      // Esto se maneja automáticamente si preservamos el objeto de estado
    } else {
      toast.info('Seleccione Sector, Periodo y Fechas para refrescar.');
    }
  }, [sector, periodo, stfechaini, stfechafin]);

  useEffect(() => {
    if (triggerSearch > 0) {
      searchResults();
    }
  }, [triggerSearch, refreshCounter]);

  useEffect(() => {
    if (!isNichoModalOpen && needsNichoRefresh) {
      handleRefresh();
      setNeedsNichoRefresh(false);
    }
  }, [isNichoModalOpen, needsNichoRefresh, handleRefresh]);

  interface ToggleFilaFn {
    (nichoIndex: number, filaIndex: number): void;
  }

  const toggleFila: ToggleFilaFn = (nichoIndex, filaIndex) => {
    const key = `${nichoIndex}-${filaIndex}`;
    setExpandedFilas(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  interface HandleNichoChangeFn {
    (index: number): void;
  }

  const handleNichoChange: HandleNichoChangeFn = index => {
    setSelectedNichoIndex(index);
  };

  const handleNichoModalSuccess = () => {
    // Mostrar notificación de éxito inmediatamente
    toast.success('Medidor actualizado correctamente');
    setNeedsNichoRefresh(true);

    // Refrescar los resultados en segundo plano sin cerrar el modal
    // handleRefresh();

    // Mostrar notificación adicional que los datos se están actualizando
    setTimeout(() => {
      toast.info('Datos actualizados en segundo plano');
    }, 800);
  };

  return (
    <div className='space-y-6'>
      {/* Header with Controls */}
      <div className='flex flex-wrap justify-between items-center gap-3 pb-4 border-b'>
        <div className='flex items-center gap-3'>
          <h2 className='text-2xl text-sky-800 dark:text-sky-200 font-bold tracking-tight'>
            Resultados de la búsqueda
          </h2>
        </div>

        <div className='flex items-center gap-2'>
          {/* View Mode Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-1'>
                {viewMode === 'detailed' ? (
                  <BarChart3 className='h-4 w-4' />
                ) : viewMode === 'compact' ? (
                  <AlertCircle className='h-4 w-4' />
                ) : (
                  <Grid3X3 className='h-4 w-4' />
                )}
                <span className='hidden sm:inline'>
                  {(() => {
                    if (viewMode === 'detailed') return 'Lista';
                    if (viewMode === 'compact') return 'Problemas';
                    return 'Tarjetas';
                  })()}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                className={cn(viewMode === 'default' && 'bg-accent')}
                onClick={() => {
                  setViewMode('default');
                }}
              >
                <Grid3X3 className='mr-2 h-4 w-4' /> Tarjetas
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(viewMode === 'detailed' && 'bg-accent')}
                onClick={() => {
                  setViewMode('detailed');
                }}
              >
                <BarChart3 className='mr-2 h-4 w-4' /> Lista Compacta
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(viewMode === 'compact' && 'bg-accent')}
                onClick={() => {
                  setViewMode('compact');
                }}
              >
                <AlertCircle className='mr-2 h-4 w-4' /> Solo Problemas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isSearching}
            className='gap-1 text-sky-800 dark:text-sky-200'
          >
            <RefreshCw
              className={`h-4 w-4 ${isSearching ? 'animate-spin' : ''}`}
            />
            <span className='hidden sm:inline'>Refrescar</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className='flex justify-center items-center py-12'>
          <ClockLoader color='#0ea5e9' size={40} />
          <span className='ml-4 text-muted-foreground'>
            Buscando resultados...
          </span>
        </div>
      )}

      {/* Error State */}
      {searchError && !isSearching && (
        <Alert variant='destructive'>
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      {/* Results Display - Command Center Design */}
      {results.nichos.length > 0 && !isSearching && !searchError && (
        <div className='space-y-6'>
          {/* Quick Stats Summary (if we have data) */}
          {results.nichos.length > 0 && (
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4'>
              {(() => {
                const stats = calculateTotalStats(results.nichos);
                return (
                  <>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card className='cursor-help hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-3 sm:p-4 text-center'>
                              <Grid3X3 className='h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mb-2' />
                              <h3 className='text-lg sm:text-2xl font-bold'>
                                {stats.total}
                              </h3>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total Medidores</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card className='border-red-200 dark:border-red-900 cursor-help hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-3 sm:p-4 text-center'>
                              <div className='h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2'>
                                <AlertCircle className='h-4 w-4 sm:h-5 sm:w-5 text-red-500' />
                              </div>
                              <h3 className='text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400'>
                                {stats.critical}
                              </h3>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Críticos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card className='border-orange-200 dark:border-orange-900 cursor-help hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-3 sm:p-4 text-center'>
                              <div className='h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-2'>
                                <AlertTriangle className='h-4 w-4 sm:h-5 sm:w-5 text-orange-500' />
                              </div>
                              <h3 className='text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400'>
                                {stats.warning}
                              </h3>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Relevantes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card className='border-yellow-200 dark:border-yellow-900 cursor-help hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-3 sm:p-4 text-center'>
                              <div className='h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-2'>
                                <Info className='h-4 w-4 sm:h-5 sm:w-5 text-yellow-500' />
                              </div>
                              <h3 className='text-lg sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                                {stats.info}
                              </h3>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Informativos</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card className='border-gray-200 dark:border-gray-900 cursor-help hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-3 sm:p-4 text-center'>
                              <div className='h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center mb-2'>
                                <Info className='h-4 w-4 sm:h-5 sm:w-5 text-gray-500' />
                              </div>
                              <h3 className='text-lg sm:text-2xl font-bold text-gray-600 dark:text-gray-400'>
                                {stats.sinlec}
                              </h3>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sin Lectura</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Card className='border-green-200 dark:border-green-900 cursor-help hover:shadow-md transition-shadow'>
                            <CardContent className='flex flex-col items-center justify-center p-3 sm:p-4 text-center'>
                              <div className='h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2'>
                                <RefreshCw className='h-4 w-4 sm:h-5 sm:w-5 text-green-500' />
                              </div>
                              <h3 className='text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400'>
                                {stats.normal}
                              </h3>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Correctas</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                );
              })()}
            </div>
          )}

          {/* Nicho Tabs Navigation - Modernized Design */}
          <div className='w-full space-y-6'>
            {/* Modern Tab Header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <h3 className='text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2'>
                  <MapPin className='h-5 w-5 text-sky-600 dark:text-sky-400' />
                  Nichos
                </h3>
                <span className='text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full'>
                  {results.nichos.length} encontrados
                </span>
              </div>
            </div>

            {/* Modern Horizontal Tabs */}
            <div className='space-y-4'>
              <ScrollArea className='w-full'>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1 p-1 bg-muted/30 rounded-xl border backdrop-blur-sm'>
                  {results.nichos.map((nicho: NichoBusqueda, index: number) => {
                    const stats = calculateNichoStats(nicho);
                    const isActive = index === selectedNichoIndex;

                    return (
                      <TooltipProvider key={`tab-${index}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleNichoChange(index)}
                              className={cn(
                                'flex flex-col items-center gap-1 px-2 py-2 md:px-3 md:py-3 rounded-lg transition-all duration-200 text-xs md:text-sm font-medium',
                                'hover:bg-background/60 hover:shadow-sm',
                                isActive
                                  ? 'bg-background shadow-sm border text-sky-700 dark:text-sky-300 font-semibold'
                                  : 'text-muted-foreground hover:text-foreground'
                              )}
                            >
                              <span className='font-medium text-center leading-tight'>
                                {nicho.nombre}
                              </span>

                              {/* Status indicators */}
                              <div className='flex items-center justify-center gap-1 flex-wrap'>
                                {stats.critical > 0 && (
                                  <span className='inline-flex items-center justify-center h-4 w-4 md:h-5 md:w-5 text-xs font-bold text-white bg-red-500 rounded-full'>
                                    {stats.critical}
                                  </span>
                                )}
                                {stats.warning > 0 && (
                                  <span className='inline-flex items-center justify-center h-4 w-4 md:h-5 md:w-5 text-xs font-bold text-white bg-orange-500 rounded-full'>
                                    {stats.warning}
                                  </span>
                                )}
                                {stats.info > 0 && (
                                  <span className='inline-flex items-center justify-center h-4 w-4 md:h-5 md:w-5 text-xs font-bold text-slate-700 bg-yellow-400 rounded-full'>
                                    {stats.info}
                                  </span>
                                )}
                                {stats.sinlec > 0 && (
                                  <span className='inline-flex items-center justify-center h-4 w-4 md:h-5 md:w-5 text-xs font-bold text-white bg-gray-500 rounded-full'>
                                    {stats.sinlec}
                                  </span>
                                )}
                                {stats.normal > 0 &&
                                  stats.critical === 0 &&
                                  stats.warning === 0 &&
                                  stats.info === 0 &&
                                  stats.sinlec === 0 && (
                                    <span className='inline-flex items-center justify-center h-4 w-4 md:h-5 md:w-5 text-xs font-bold text-white bg-green-500 rounded-full'>
                                      {stats.normal}
                                    </span>
                                  )}
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side='bottom'
                            className='bg-background border shadow-lg'
                          >
                            <div className='space-y-1'>
                              <p className='font-semibold text-foreground'>
                                Nicho: {nicho.nombre}
                              </p>
                              <div className='text-xs text-muted-foreground space-y-0.5'>
                                <div>
                                  {nicho.filas.length} filas • {stats.total}{' '}
                                  medidores
                                </div>
                                {stats.critical > 0 && (
                                  <div className='text-red-600 font-medium'>
                                    • {stats.critical} críticos
                                  </div>
                                )}
                                {stats.warning > 0 && (
                                  <div className='text-orange-600 font-medium'>
                                    • {stats.warning} relevantes
                                  </div>
                                )}
                                {stats.info > 0 && (
                                  <div className='text-yellow-600 font-medium'>
                                    • {stats.info} informativos
                                  </div>
                                )}
                                {stats.sinlec > 0 && (
                                  <div className='text-gray-600 font-medium'>
                                    • {stats.sinlec} sin lectura
                                  </div>
                                )}
                                {stats.normal > 0 && (
                                  <div className='text-green-600 font-medium'>
                                    • {stats.normal} normales
                                  </div>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Content for Selected Nicho */}
              {results.nichos[selectedNichoIndex] && (
                <div className='space-y-3'>
                  {/* Nicho Header with Edit Button */}
                  <div className='flex justify-between items-center p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-lg border'>
                    <div className='flex items-center gap-2'>
                      <div className='p-1.5 bg-sky-100 dark:bg-sky-900/50 rounded-lg'>
                        <MapPin className='h-4 w-4 text-sky-600 dark:text-sky-400' />
                      </div>
                      <div>
                        <h3 className='text-lg font-semibold text-slate-800 dark:text-slate-200'>
                          {results.nichos[selectedNichoIndex].nombre}
                        </h3>
                        <p className='text-xs text-muted-foreground'>
                          {results.nichos[selectedNichoIndex].filas.length}{' '}
                          filas •{' '}
                          {results.nichos[selectedNichoIndex].filas.reduce(
                            (acc, fila) => acc + fila.medidores.length,
                            0
                          )}{' '}
                          medidores
                        </p>
                      </div>

                      {/* Color Legend */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            className='ml-auto'
                          >
                            <AlertCircle className='h-4 w-4 sm:mr-1' />
                            <span className='hidden sm:inline'>Leyenda</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-md'>
                          <DialogHeader>
                            <DialogTitle className='text-xl font-semibold'>
                              Colores de las claves
                            </DialogTitle>
                            <DialogDescription>
                              Referencia de colores para los diferentes estados
                              de lectura
                            </DialogDescription>
                          </DialogHeader>
                          <div className='space-y-4'>
                            <div className='space-y-2'>
                              <h3 className='font-medium'>
                                Estado de Lecturas:
                              </h3>
                              <div className='space-y-2'>
                                {/* Lista estática de todos los estados posibles */}
                                {[
                                  'SINLEC',
                                  'SINCLA',
                                  'CLAINF',
                                  'CLAREL',
                                  'CLACRI',
                                  'LECCER',
                                  'LECIMP'
                                ].map(claveHtml => {
                                  const status = getMeterStatus(claveHtml);
                                  return (
                                    <div
                                      key={claveHtml}
                                      className='flex items-center gap-3'
                                    >
                                      <StatusIndicator
                                        status={status}
                                        size='lg'
                                      />
                                      <div className='flex-grow'>
                                        <div className='font-medium'>
                                          {status.label}
                                        </div>
                                        {/* <div className="text-xs text-muted-foreground">
                                          ({claveHtml})
                                        </div> */}
                                      </div>
                                      <div>{status.icon}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Dialog
                      open={isNichoModalOpen}
                      onOpenChange={setIsNichoModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size='sm'
                          className='bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg'
                          onClick={() => {
                            setIsNichoModalOpen(true);
                          }}
                        >
                          <Pencil className='h-4 w-4 mr-2' />
                          Ingresar Lecturas
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='max-w-[99vw] sm:max-w-[96vw] md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[90vw] w-full max-h-[99vh] sm:max-h-[96vh] h-auto overflow-hidden flex flex-col'>
                        <DialogHeader className='shrink-0 pb-2 sm:pb-3 lg:pb-4 border-b border-border/40 px-3 sm:px-4 lg:px-6'>
                          <DialogTitle>
                            <div className='text-base sm:text-lg lg:text-xl xl:text-2xl font-bold flex items-center gap-2 text-sky-700 dark:text-sky-500'>
                              <Gauge className='h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-sky-700 dark:text-sky-500' />
                              <span className='truncate'>
                                Monitor de Medidores
                              </span>
                              {/* Indicador de responsive */}
                              <div className='hidden sm:flex items-center gap-1 ml-auto'>
                                <div className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full'>
                                  {results.nichos[selectedNichoIndex]?.nombre}
                                </div>
                              </div>
                            </div>
                          </DialogTitle>
                        </DialogHeader>
                        <div className='flex-1 overflow-hidden min-h-0'>
                          <div className='h-full p-2 sm:p-3 lg:p-4 xl:p-6'>
                            <MonitorNichos
                              periodo={periodo}
                              nicho={results.nichos[selectedNichoIndex].nombre}
                              onSuccess={handleNichoModalSuccess}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Filas Container */}
                  <div className='space-y-3'>
                    {results.nichos[selectedNichoIndex].filas.map(
                      (fila: Fila, filaIndex: number) => {
                        const problemCount = fila.medidores.filter(
                          (m: Medidor) =>
                            getMeterStatus(m.claveHtml).severity > 2
                        ).length;

                        if (viewMode === 'compact' && problemCount === 0) {
                          return null;
                        }

                        const key = `${selectedNichoIndex}-${filaIndex}`;
                        const isExpanded = expandedFilas[key];

                        return (
                          <Card
                            key={`fila-${selectedNichoIndex}-${filaIndex}`}
                            className='overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm'
                          >
                            <Collapsible
                              open={
                                isExpanded !== undefined ? isExpanded : true
                              }
                              onOpenChange={() =>
                                toggleFila(selectedNichoIndex, filaIndex)
                              }
                            >
                              <CollapsibleTrigger asChild>
                                <div className='flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors'>
                                  <div className='flex items-center gap-2'>
                                    <div className='p-1 bg-muted rounded-md'>
                                      <Grid3X3 className='h-3 w-3 text-muted-foreground' />
                                    </div>
                                    <div>
                                      <h4 className='text-base font-medium'>
                                        Fila {fila.numero}
                                      </h4>
                                      <p className='text-xs text-muted-foreground'>
                                        {fila.medidores.length} medidores
                                      </p>
                                    </div>
                                    {problemCount > 0 && (
                                      <Badge
                                        variant='destructive'
                                        className='ml-2'
                                      >
                                        {problemCount} problema
                                        {problemCount !== 1 && 's'}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className='flex items-center gap-3'>
                                    <div className='text-sm text-muted-foreground'>
                                      {isExpanded ? 'Ocultar' : 'Mostrar'}
                                    </div>
                                    {isExpanded ? (
                                      <ChevronUp className='h-5 w-5 text-muted-foreground' />
                                    ) : (
                                      <ChevronDown className='h-5 w-5 text-muted-foreground' />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className='p-3 pt-0'>
                                  {viewMode === 'detailed' ? (
                                    /* Vista de Lista Compacta */
                                    <div className='space-y-2'>
                                      {fila.medidores.map(
                                        (medidor: Medidor) => {
                                          return (
                                            <MeterRowDetailed
                                              key={medidor.id}
                                              medidor={medidor}
                                              onRefresh={handleRefresh}
                                            />
                                          );
                                        }
                                      )}
                                    </div>
                                  ) : (
                                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 sm:gap-3'>
                                      {fila.medidores.map(
                                        (medidor: Medidor) => {
                                          if (
                                            viewMode === 'compact' &&
                                            getMeterStatus(medidor.claveHtml)
                                              .severity <= 1
                                          ) {
                                            return null;
                                          }

                                          return (
                                            <MeterCard
                                              key={medidor.id}
                                              medidor={medidor}
                                              onRefresh={handleRefresh}
                                            />
                                          );
                                        }
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </Card>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {results.nichos.length === 0 && !isSearching && !searchError && (
        <div className='flex flex-col items-center justify-center py-12 text-center'>
          <AlertCircle className='h-12 w-12 text-muted-foreground mb-4' />
          <p className='text-muted-foreground'>
            No se encontraron resultados para los criterios seleccionados.
          </p>
          <p className='text-sm text-muted-foreground mt-1'>
            Intente ajustar los filtros o el rango de fechas.
          </p>
        </div>
      )}
    </div>
  );
}
