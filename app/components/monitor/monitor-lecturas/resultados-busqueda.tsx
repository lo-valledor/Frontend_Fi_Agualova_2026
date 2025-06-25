import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '~/lib/api';
import ClockLoader from 'react-spinners/ClockLoader';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';

import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Grid3X3,
  History,
  MapPin,
  Pencil,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  Info,
  Calendar,
  Gauge,
} from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import MonitorNichos from '~/components/monitor/monitor-lecturas/monitor-nichos';
import DetallesMedidor from '~/components/monitor/monitor-lecturas/detalles-medidor';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { formatToYYYYMMDD } from '~/utils/date-formatter';
import { cn } from '~/lib/utils'; // Assuming you have this utility for conditional classes
import type { Fila, Medidor, NichoBusqueda } from '~/types/monitor';
// Status helpers with enhanced information
const getMeterStatus = (claveHtml: string) => {
  const statusMap = {
    SINLEC: {
      color: 'gray',
      bgColor: 'bg-gray-500',
      borderColor: 'border-gray-500',
      textColor: 'text-gray-500',
      label: 'Sin Lectura',
      icon: <History className="h-3.5 w-3.5" />,
      severity: 1,
    },
    SINCLA: {
      color: 'green',
      bgColor: 'bg-green-500',
      borderColor: 'border-green-500',
      textColor: 'text-green-500',
      label: 'Lectura Normal',
      icon: <Grid3X3 className="h-3.5 w-3.5" />,
      severity: 0,
    },
    CLAINF: {
      color: 'yellow',
      bgColor: 'bg-yellow-500',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-500',
      label: 'Clave Informativa',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      severity: 2,
    },
    CLAREL: {
      color: 'orange',
      bgColor: 'bg-orange-500',
      borderColor: 'border-orange-500',
      textColor: 'text-orange-500',
      label: 'Clave Relevante',
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      severity: 3,
    },
    CLACRI: {
      color: 'red',
      bgColor: 'bg-red-500',
      borderColor: 'border-red-500',
      textColor: 'text-red-500',
      label: 'Clave Crítica',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      severity: 4,
    },
    LECCER: {
      color: 'blue',
      bgColor: 'bg-blue-500',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-500',
      label: 'Lectura Cerrada',
      icon: <MapPin className="h-3.5 w-3.5" />,
      severity: 0,
    },
    LECIMP: {
      color: 'purple',
      bgColor: 'bg-purple-500',
      borderColor: 'border-purple-500',
      textColor: 'text-purple-500',
      label: 'En Facturación',
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      severity: 0,
    },
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
        sinlec: acc.sinlec + stats.sinlec,
      };
    },
    { total: 0, critical: 0, warning: 0, info: 0, normal: 0, sinlec: 0 },
  );
};

// Component for status circle indicator
const StatusIndicator = ({
  status,
  size = 'md',
}: {
  status: any;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses: { [key in 'sm' | 'md' | 'lg']: string } = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
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
  onRefresh,
}: {
  medidor: any;
  onRefresh: any;
}) => {
  const status = getMeterStatus(medidor.claveHtml);

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 ${status.borderColor}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <StatusIndicator status={status} size="md" />
            <div>
              <div className="font-medium text-sm">{medidor.nSerie}</div>
              <div className="text-xs text-muted-foreground">
                ID: {medidor.id}
              </div>
            </div>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
              <SheetHeader className="border-b">
                <SheetTitle>
                  <div className="flex items-center gap-3 rounded-lg p-4">
                    <div
                      className={`p-2 rounded-lg ${status.bgColor} text-white`}
                    >
                      {status.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        Detalle de Lectura
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        ID: {medidor.id} | Medidor: {medidor.nSerie}
                      </p>
                    </div>
                    <Badge className={status.bgColor}>{status.label}</Badge>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="pt-2">
                <DetallesMedidor lecturaId={medidor.id} onSuccess={onRefresh} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Lectura</div>
            <div className="font-semibold">{medidor.ultimaLectura || '-'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Consumo</div>
            <div className="font-semibold">{medidor.consumo || '0'}</div>
          </div>
          <div className="col-span-2">
            <div className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {medidor.fechaLectura
                ? new Date(medidor.fechaLectura).toLocaleString('es-CL', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                    hour12: false,
                  })
                : 'Sin registro'}
            </div>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between items-center">
          <Badge
            variant="outline"
            className={`${status.borderColor} ${status.textColor}`}
          >
            <span className="mr-1">{status.icon}</span>
            {medidor.clave || status.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de fila compacta para vista detallada
const MeterRowDetailed = ({
  medidor,
  onRefresh,
}: {
  medidor: any;
  onRefresh: any;
}) => {
  const status = getMeterStatus(medidor.claveHtml);

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 border-l-4 ${status.borderColor}`}
    >
      {/* Status Indicator */}
      <div className="flex items-center gap-2 min-w-0">
        <StatusIndicator status={status} size="sm" />
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{medidor.nSerie}</div>
          <div className="text-xs text-muted-foreground">ID: {medidor.id}</div>
        </div>
      </div>

      {/* Lectura */}
      <div className="flex-shrink-0 text-center min-w-[80px]">
        <div className="text-xs text-muted-foreground">Lectura</div>
        <div className="font-semibold text-sm">
          {medidor.ultimaLectura || '-'}
        </div>
      </div>

      {/* Consumo */}
      <div className="flex-shrink-0 text-center min-w-[70px]">
        <div className="text-xs text-muted-foreground">Consumo</div>
        <div className="font-semibold text-sm">{medidor.consumo || '0'}</div>
      </div>

      {/* Fecha */}
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">Fecha</div>
        <div className="text-sm font-medium truncate">
          {medidor.fechaLectura
            ? new Date(medidor.fechaLectura).toLocaleString('es-CL', {
                dateStyle: 'short',
                timeStyle: 'short',
                hour12: false,
              })
            : 'Sin registro'}
        </div>
      </div>

      {/* Estado */}
      <div className="flex-shrink-0">
        <Badge
          variant="outline"
          className={`${status.borderColor} ${status.textColor} text-xs`}
        >
          <span className="mr-1">{status.icon}</span>
          {medidor.clave || status.label}
        </Badge>
      </div>

      {/* Acción */}
      <div className="flex-shrink-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
            <SheetHeader className="border-b">
              <SheetTitle>
                <div className="flex items-center gap-3 rounded-lg p-4">
                  <div
                    className={`p-2 rounded-lg ${status.bgColor} text-white`}
                  >
                    {status.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Detalle de Lectura
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {medidor.id} | Medidor: {medidor.nSerie}
                    </p>
                  </div>
                  <Badge className={status.bgColor}>{status.label}</Badge>
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="pt-2">
              <DetallesMedidor lecturaId={medidor.id} onSuccess={onRefresh} />
            </div>
          </SheetContent>
        </Sheet>
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
  triggerSearch,
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
    {},
  );
  const [isNichoModalOpen, setIsNichoModalOpen] = useState(false);

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
    // NO resetear los resultados inmediatamente para mantener la UI estable
    // setResults({ nichos: [] });

    const params = new URLSearchParams({
      sector,
      periodo,
      stfechaini: formatToYYYYMMDD(stfechaini),
      stfechafin: formatToYYYYMMDD(stfechafin),
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
        filas: Array.isArray(nicho.filas) ? nicho.filas : [],
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

  useEffect(() => {
    if (triggerSearch > 0) {
      searchResults();
    }
  }, [triggerSearch, refreshCounter]);

  const handleRefresh = () => {
    if (sector && periodo && stfechaini && stfechafin) {
      // Incrementar el contador de refrescar para desencadenar la recarga
      setRefreshCounter((prev) => prev + 1);

      // Después de que se completa la búsqueda, restauramos el estado expandido
      // Esto se maneja automáticamente si preservamos el objeto de estado
    } else {
      toast.info('Seleccione Sector, Periodo y Fechas para refrescar.');
    }
  };

  interface ToggleFilaFn {
    (nichoIndex: number, filaIndex: number): void;
  }

  const toggleFila: ToggleFilaFn = (nichoIndex, filaIndex) => {
    const key = `${nichoIndex}-${filaIndex}`;
    setExpandedFilas((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  interface HandleNichoChangeFn {
    (index: number): void;
  }

  const handleNichoChange: HandleNichoChangeFn = (index) => {
    setSelectedNichoIndex(index);
  };

  const handleNichoModalSuccess = () => {
    // Mostrar notificación de éxito inmediatamente
    toast.success('Medidor actualizado correctamente');

    // Refrescar los resultados en segundo plano sin cerrar el modal
    handleRefresh();

    // Mostrar notificación adicional que los datos se están actualizando
    setTimeout(() => {
      toast.info('Datos actualizados en segundo plano');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-b">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl text-sky-800 dark:text-sky-200 font-bold tracking-tight">
            Resultados de la búsqueda
          </h2>
          <p className="text-sm text-muted-foreground">
            {results.nichos.length} nichos encontrados
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {viewMode === 'detailed' ? (
                  <BarChart3 className="h-4 w-4" />
                ) : viewMode === 'compact' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Grid3X3 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {viewMode === 'detailed'
                    ? 'Lista'
                    : viewMode === 'compact'
                      ? 'Problemas'
                      : 'Tarjetas'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className={cn(viewMode === 'default' && 'bg-accent')}
                onClick={() => setViewMode('default')}
              >
                <Grid3X3 className="mr-2 h-4 w-4" /> Tarjetas
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(viewMode === 'detailed' && 'bg-accent')}
                onClick={() => setViewMode('detailed')}
              >
                <BarChart3 className="mr-2 h-4 w-4" /> Lista Compacta
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(viewMode === 'compact' && 'bg-accent')}
                onClick={() => setViewMode('compact')}
              >
                <AlertCircle className="mr-2 h-4 w-4" /> Solo Problemas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isSearching}
            className="gap-1 text-sky-800 dark:text-sky-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSearching ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refrescar</span>
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isSearching && (
        <div className="flex justify-center items-center py-12">
          <ClockLoader color="#0ea5e9" size={40} />
          <span className="ml-4 text-muted-foreground">
            Buscando resultados...
          </span>
        </div>
      )}

      {/* Error State */}
      {searchError && !isSearching && (
        <Alert variant="destructive">
          <AlertDescription>{searchError}</AlertDescription>
        </Alert>
      )}

      {/* Results Display - Command Center Design */}
      {results.nichos.length > 0 && !isSearching && !searchError && (
        <div className="space-y-6">
          {/* Quick Stats Summary (if we have data) */}
          {results.nichos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {(() => {
                const stats = calculateTotalStats(results.nichos);
                return (
                  <>
                    <Card>
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Total Medidores
                          </p>
                          <h3 className="text-2xl font-bold mt-1">
                            {stats.total}
                          </h3>
                        </div>
                        <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 dark:border-red-900">
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Críticos
                          </p>
                          <h3 className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">
                            {stats.critical}
                          </h3>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200 dark:border-orange-900">
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Relevantes
                          </p>
                          <h3 className="text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">
                            {stats.warning}
                          </h3>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-yellow-200 dark:border-yellow-900">
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Informativos
                          </p>
                          <h3 className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">
                            {stats.info}
                          </h3>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                          <Info className="h-5 w-5 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200 dark:border-gray-900">
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Sin Lectura
                          </p>
                          <h3 className="text-2xl font-bold mt-1 text-gray-600 dark:text-gray-400">
                            {stats.sinlec}
                          </h3>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-900/30 flex items-center justify-center">
                          <Info className="h-5 w-5 text-gray-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 dark:border-green-900">
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Correctas
                          </p>
                          <h3 className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
                            {stats.normal}
                          </h3>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <RefreshCw className="h-5 w-5 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </>
                );
              })()}
            </div>
          )}

          {/* Nicho Tabs Navigation - Modernized Design */}
          <div className="w-full space-y-6">
            {/* Modern Tab Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                  Nichos
                </h3>
                <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {results.nichos.length} encontrados
                </span>
              </div>
            </div>

            {/* Modern Horizontal Tabs */}
            <div className="space-y-4">
              <ScrollArea className="w-full">
                <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border backdrop-blur-sm">
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
                                'flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 min-w-fit whitespace-nowrap text-sm font-medium',
                                'hover:bg-background/60 hover:shadow-sm',
                                isActive
                                  ? 'bg-background shadow-sm border text-sky-700 dark:text-sky-300 font-semibold'
                                  : 'text-muted-foreground hover:text-foreground',
                              )}
                            >
                              <span className="font-medium">
                                {nicho.nombre}
                              </span>

                              {/* Status indicators */}
                              <div className="flex items-center gap-1">
                                {stats.critical > 0 && (
                                  <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                    {stats.critical}
                                  </span>
                                )}
                                {stats.warning > 0 && (
                                  <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-orange-500 rounded-full">
                                    {stats.warning}
                                  </span>
                                )}
                                {stats.info > 0 && (
                                  <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-slate-700 bg-yellow-400 rounded-full">
                                    {stats.info}
                                  </span>
                                )}
                                {stats.sinlec > 0 && (
                                  <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-gray-500 rounded-full">
                                    {stats.sinlec}
                                  </span>
                                )}
                                {stats.normal > 0 &&
                                  stats.critical === 0 &&
                                  stats.warning === 0 &&
                                  stats.info === 0 &&
                                  stats.sinlec === 0 && (
                                    <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-green-500 rounded-full">
                                      {stats.normal}
                                    </span>
                                  )}
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            className="bg-background border shadow-lg"
                          >
                            <div className="space-y-1">
                              <p className="font-semibold text-foreground">
                                Nicho: {nicho.nombre}
                              </p>
                              <div className="text-xs text-muted-foreground space-y-0.5">
                                <div>
                                  {nicho.filas.length} filas • {stats.total}{' '}
                                  medidores
                                </div>
                                {stats.critical > 0 && (
                                  <div className="text-red-600 font-medium">
                                    • {stats.critical} críticos
                                  </div>
                                )}
                                {stats.warning > 0 && (
                                  <div className="text-orange-600 font-medium">
                                    • {stats.warning} relevantes
                                  </div>
                                )}
                                {stats.info > 0 && (
                                  <div className="text-yellow-600 font-medium">
                                    • {stats.info} informativos
                                  </div>
                                )}
                                {stats.sinlec > 0 && (
                                  <div className="text-gray-600 font-medium">
                                    • {stats.sinlec} sin lectura
                                  </div>
                                )}
                                {stats.normal > 0 && (
                                  <div className="text-green-600 font-medium">
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
                <div className="space-y-6">
                  {/* Nicho Header with Edit Button */}
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg">
                        <MapPin className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                          {results.nichos[selectedNichoIndex].nombre}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {results.nichos[selectedNichoIndex].filas.length}{' '}
                          filas •{' '}
                          {results.nichos[selectedNichoIndex].filas.reduce(
                            (acc, fila) => acc + fila.medidores.length,
                            0,
                          )}{' '}
                          medidores
                        </p>
                      </div>

                      {/* Color Legend */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-auto"
                          >
                            <AlertCircle className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Leyenda</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">
                              Colores de las claves
                            </DialogTitle>
                            <DialogDescription>
                              Referencia de colores para los diferentes estados
                              de lectura
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h3 className="font-medium">
                                Estado de Lecturas:
                              </h3>
                              <div className="space-y-2">
                                {/* Lista estática de todos los estados posibles */}
                                {[
                                  'SINLEC',
                                  'SINCLA',
                                  'CLAINF',
                                  'CLAREL',
                                  'CLACRI',
                                  'LECCER',
                                  'LECIMP',
                                ].map((claveHtml) => {
                                  const status = getMeterStatus(claveHtml);
                                  return (
                                    <div
                                      key={claveHtml}
                                      className="flex items-center gap-3"
                                    >
                                      <StatusIndicator
                                        status={status}
                                        size="lg"
                                      />
                                      <div className="flex-grow">
                                        <div className="font-medium">
                                          {status.label}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          ({claveHtml})
                                        </div>
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
                          size="sm"
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                          onClick={() => setIsNichoModalOpen(true)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Ingresar Lecturas
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="min-w-full h-auto overflow-y-auto">
                        <DialogTitle>
                          <div className="text-2xl font-bold flex items-center gap-2 text-sky-700 dark:text-sky-500">
                            <Gauge className="h-5 w-5 text-sky-700 dark:text-sky-500" />
                            Monitor de Medidores
                          </div>
                        </DialogTitle>
                        <ScrollArea className="h-[calc(100vh-200px)]">
                          <MonitorNichos
                            periodo={periodo}
                            nicho={results.nichos[selectedNichoIndex].nombre}
                            onSuccess={handleNichoModalSuccess}
                          />
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Filas Container */}
                  <div className="space-y-6">
                    {results.nichos[selectedNichoIndex].filas.map(
                      (fila: Fila, filaIndex: number) => {
                        // Get all problems in this fila for the badge
                        const problemCount = fila.medidores.filter(
                          (m: Medidor) =>
                            getMeterStatus(m.claveHtml).severity > 2,
                        ).length;

                        // For 'compact' view, skip filas with no problems
                        if (viewMode === 'compact' && problemCount === 0) {
                          return null;
                        }

                        const key = `${selectedNichoIndex}-${filaIndex}`;
                        const isExpanded = expandedFilas[key];

                        return (
                          <Card
                            key={`fila-${selectedNichoIndex}-${filaIndex}`}
                            className="overflow-hidden border-0 shadow-sm bg-card/50 backdrop-blur-sm"
                          >
                            {/* Collapsible Fila Header */}
                            <Collapsible
                              open={
                                isExpanded !== undefined ? isExpanded : true
                              }
                              onOpenChange={() =>
                                toggleFila(selectedNichoIndex, filaIndex)
                              }
                            >
                              <CollapsibleTrigger asChild>
                                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-muted rounded-md">
                                      <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-medium">
                                        Fila {fila.numero}
                                      </h4>
                                      <p className="text-sm text-muted-foreground">
                                        {fila.medidores.length} medidores
                                      </p>
                                    </div>
                                    {problemCount > 0 && (
                                      <Badge
                                        variant="destructive"
                                        className="ml-2"
                                      >
                                        {problemCount} problema
                                        {problemCount !== 1 && 's'}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <div className="text-sm text-muted-foreground">
                                      {isExpanded ? 'Ocultar' : 'Mostrar'}
                                    </div>
                                    {isExpanded ? (
                                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              {/* Content based on view mode */}
                              <CollapsibleContent>
                                <div className="p-4 pt-0">
                                  {viewMode === 'detailed' ? (
                                    /* Vista de Lista Compacta */
                                    <div className="space-y-2">
                                      {/* Header de la tabla para vista detallada */}
                                      <div className="flex items-center gap-3 p-3 text-xs font-medium text-muted-foreground bg-muted/30 rounded-lg border">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-4"></div>{' '}
                                          {/* Espacio para status indicator */}
                                          <div className="min-w-[120px]">
                                            Medidor
                                          </div>
                                        </div>
                                        <div className="flex-shrink-0 text-center min-w-[80px]">
                                          Lectura
                                        </div>
                                        <div className="flex-shrink-0 text-center min-w-[70px]">
                                          Consumo
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          Fecha de Lectura
                                        </div>
                                        <div className="flex-shrink-0 min-w-[100px]">
                                          Estado
                                        </div>
                                        <div className="flex-shrink-0 w-10">
                                          Acción
                                        </div>
                                      </div>

                                      {fila.medidores.map(
                                        (medidor: Medidor) => {
                                          return (
                                            <MeterRowDetailed
                                              key={medidor.id}
                                              medidor={medidor}
                                              onRefresh={handleRefresh}
                                            />
                                          );
                                        },
                                      )}
                                    </div>
                                  ) : (
                                    /* Vista de Tarjetas (default y compact) */
                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-5 2xl:grid-cols-10 gap-4">
                                      {fila.medidores.map(
                                        (medidor: Medidor) => {
                                          // For 'compact' view, only show problematic medidores
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
                                        },
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </Card>
                        );
                      },
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
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No se encontraron resultados para los criterios seleccionados.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Intente ajustar los filtros o el rango de fechas.
          </p>
        </div>
      )}
    </div>
  );
}
