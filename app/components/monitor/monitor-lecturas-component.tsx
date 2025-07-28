import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  Calendar,
  Eraser,
  Filter,
  Search,
  MapPin,
  KeyRound,
  Hash,
  ChevronUp,
  ChevronDown,
  ListFilter,
  Settings2,
  Info,
} from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import { type Sector, type Periodo, type Clave } from '~/types/monitor';
import { LoadingSpinner } from '~/components/loading-spinner';
import { Alert, AlertTitle, AlertDescription } from '~/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';
import { Input } from '~/components/ui/input';
import ResultadosBusqueda from '~/components/monitor/monitor-lecturas/resultados-busqueda';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { cn } from '~/lib/utils';
import { toast } from 'sonner';
import {
  findActivePeriod,
  validateSearchParams,
  getDefaultDates,
} from '~/hooks/use-monitor';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';

interface MonitorLecturasComponentProps {
  periodos: Periodo[];
  sectores: Sector[];
  claves: Clave[];
  activePeriodoId: number | null;
  error: Error | null;
}

const MonitorLecturasComponent = ({
  periodos,
  sectores,
  claves,
  error,
}: MonitorLecturasComponentProps) => {
  const pageBreadcrumbs = [
    { label: 'Monitor' },
    { label: 'Monitor de Lecturas' },
  ];

  // Estados del formulario de filtros
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [selectedClave, setSelectedClave] = useState<Clave | null>(null);
  const [medidor, setMedidor] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<number>(0);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Estados de UI
  const [shouldSearch, setShouldSearch] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Establecer valores por defecto del período y fechas usando funciones utilitarias
  useEffect(() => {
    if (periodos && periodos.length > 0 && !selectedPeriodo) {
      const periodoActivo = findActivePeriod(periodos);

      if (periodoActivo) {
        setSelectedPeriodo(periodoActivo);
        const defaultDates = getDefaultDates(periodoActivo);
        setFechaInicio(defaultDates.fechaInicio);
        if (!fechaFin) {
          setFechaFin(defaultDates.fechaFin);
        }
      }
    }
  }, [periodos, selectedPeriodo, fechaFin]);

  // Actualizar fechaInicio cuando cambia el período seleccionado
  useEffect(() => {
    if (selectedPeriodo) {
      setFechaInicio(selectedPeriodo.FechaInicio);
    }
  }, [selectedPeriodo]);

  // Limpiar filtros y resetear estado usando funciones utilitarias
  const handleLimpiezaFiltros = () => {
    setShouldSearch(false);
    setSearchTrigger(0);
    setSelectedSector(null);

    const periodoActivo = findActivePeriod(periodos);
    setSelectedPeriodo(periodoActivo);
    setSelectedClave(null);
    setMedidor('');
    setSelectedEstado(0);

    const defaultDates = getDefaultDates(periodoActivo);
    setFechaInicio(defaultDates.fechaInicio);
    setFechaFin(defaultDates.fechaFin);
    setIsFiltersOpen(true);
  };

  // Ejecutar búsqueda con validaciones usando función utilitaria
  const handleSearch = () => {
    const validation = validateSearchParams(selectedSector, selectedPeriodo);

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setShouldSearch(true);
    setSearchTrigger((prev) => prev + 1);
    setIsFiltersOpen(false); // Colapsar filtros después de buscar
  };

  // Manejo de errores
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Carga</AlertTitle>
          <AlertDescription>
            {error.message ||
              'Ocurrió un error al cargar los datos iniciales. Por favor, intente recargar la página.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950/30">
      <div className="container mx-auto p-2 space-y-3">
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Modern Header */}
        <div className="flex items-center gap-3 py-1 border-b border-slate-200 dark:border-slate-700">
          <div className="flex-1">
            <div className="items-center gap-3 grid grid-cols-2 mb-2">
              <div className="col-span-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 dark:from-blue-100 dark:to-sky-100 bg-clip-text text-transparent">
                  Monitor de Lecturas
                </h1>
              </div>
              <div className="flex items-center gap-3 justify-end w-full">
                <Dialog>
                  <DialogTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-yellow-100 dark:hover:bg-yellow-800/50"
                    >
                      <Info className="w-4 h-4 mr-1 text-yellow-600" />
                      <span className="text-yellow-600 text-sm">
                        Información
                      </span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Información</DialogTitle>
                      <DialogDescription>
                        Selecciona un sector y configura tus filtros para
                        monitorear las lecturas de medidores en tiempo real
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Main Control Panel */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-2 space-y-4">
            {/* Sector Selection - Clean Grid */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
                    Sector de Monitoreo
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Selecciona el área a monitorear
                  </p>
                </div>
              </div>

              {sectores && sectores.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                  {sectores.map((sector) => (
                    <Button
                      key={sector.sectorId}
                      variant={
                        selectedSector?.sectorId === sector.sectorId
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() => setSelectedSector(sector)}
                      className={cn(
                        'h-auto p-3 transition-all duration-200 hover:scale-105',
                        selectedSector?.sectorId === sector.sectorId
                          ? 'bg-gradient-to-r from-blue-500 to-sky-600 text-white shadow-lg border-0'
                          : 'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-700 dark:text-slate-300',
                      )}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-xs">
                          {sector.descripcion}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Settings2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay sectores disponibles</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {/* Periodo */}
              <div className="space-y-1 w-full">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  Periodo
                </Label>
                {periodos && periodos.length > 0 ? (
                  <Select
                    value={selectedPeriodo?.IdPeriodo || ''}
                    onValueChange={(value) => {
                      const periodo = periodos.find(
                        (p) => p.IdPeriodo === value,
                      );
                      setSelectedPeriodo(periodo || null);
                    }}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <SelectValue placeholder="Seleccionar periodo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {periodos?.map((periodo) => (
                        <SelectItem
                          key={periodo.IdPeriodo}
                          value={String(periodo.IdPeriodo)}
                          className="truncate"
                        >
                          {periodo.DescripcionPeriodo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                )}
              </div>

              {/* Fecha Inicio */}
              <div className="space-y-1 w-full sm:col-span-2 lg:col-span-1">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  Fecha Inicio
                </Label>
                <Input
                  type="text"
                  value={fechaInicio || 'Definida por período'}
                  readOnly
                  className="w-full bg-slate-50 dark:bg-slate-800 text-muted-foreground cursor-not-allowed truncate"
                />
              </div>

              {/* Fecha Fin */}
              <div className="space-y-1 w-full sm:col-span-2 lg:col-span-1">
                <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  Fecha Fin
                </Label>
                <Input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Search Action */}
            <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  <span className="text-sm">Filtros Avanzados</span>
                  {isFiltersOpen ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </Button>

                {(selectedClave || medidor || selectedEstado > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLimpiezaFiltros}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                  >
                    <Eraser className="w-4 h-4 mr-1" />
                    <span className="text-sm">Limpiar</span>
                  </Button>
                )}
              </div>

              <Button
                onClick={handleSearch}
                disabled={!selectedSector || !selectedPeriodo}
                className="bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Search className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {shouldSearch ? 'Buscar Nuevamente' : 'Iniciar Monitoreo'}
                </span>
              </Button>
            </div>

            {/* Advanced Filters - Collapsible */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent>
                <div className="border-t pt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-3">
                    {/* Clave */}
                    <div className="space-y-1 w-full">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <KeyRound className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        Clave
                      </Label>
                      {claves && claves.length > 0 ? (
                        <Select
                          value={selectedClave?.IdClave.toString() || 'ALL'}
                          onValueChange={(value) => {
                            if (value === 'ALL') {
                              setSelectedClave(null);
                            } else {
                              const clave = claves?.find(
                                (c) => c.IdClave === parseInt(value),
                              );
                              setSelectedClave(clave || null);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder="Todas las claves..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL" className="truncate">
                              Todas las claves
                            </SelectItem>
                            {claves?.map((clave) => (
                              <SelectItem
                                key={clave.IdClave}
                                value={String(clave.IdClave)}
                                className="truncate"
                              >
                                {clave.DescripcionClave}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                      )}
                    </div>

                    {/* Estado */}
                    <div className="space-y-1 w-full">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <ListFilter className="w-3 h-3 text-purple-500 flex-shrink-0" />
                        Estado
                      </Label>
                      <Select
                        value={selectedEstado?.toString()}
                        onValueChange={(value) =>
                          setSelectedEstado(Number(value))
                        }
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Filtrar por estado..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0" className="truncate">
                            Todos los estados
                          </SelectItem>
                          <SelectItem value="1" className="truncate">
                            Sin Lectura
                          </SelectItem>
                          <SelectItem value="2" className="truncate">
                            Lectura Normal
                          </SelectItem>
                          <SelectItem value="3" className="truncate">
                            Clave Informativa
                          </SelectItem>
                          <SelectItem value="4" className="truncate">
                            Clave Relevante
                          </SelectItem>
                          <SelectItem value="5" className="truncate">
                            Clave Crítica
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Medidor */}
                    <div className="space-y-1 w-full">
                      <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-green-500 flex-shrink-0" />
                        Número de Serie
                      </Label>
                      <Input
                        type="text"
                        placeholder="Buscar medidor específico..."
                        value={medidor}
                        onChange={(e) => setMedidor(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Results Section */}
        {shouldSearch && (
          <Suspense
            fallback={
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <LoadingSpinner message="Cargando resultados del monitoreo..." />
                </CardContent>
              </Card>
            }
          >
            <ResultadosBusqueda
              sector={selectedSector?.sectorId || ''}
              periodo={selectedPeriodo?.IdPeriodo || ''}
              stfechaini={fechaInicio}
              stfechafin={fechaFin}
              tipoclave={selectedEstado.toString()}
              medidor={medidor}
              clave={selectedClave?.IdClave.toString() || ''}
              triggerSearch={searchTrigger}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default MonitorLecturasComponent;
