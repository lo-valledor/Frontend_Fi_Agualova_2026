import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useMonitor } from "~/hooks/use-monitor";
import {
  Calendar,
  Eraser,
  Filter,
  Search,
  MapPin, // Icon for Sector
  ListFilter, // Icon for Criterio
  KeyRound, // Icon for Clave
  Hash,
  ChevronUp,
  ChevronDown, // Icon for Medidor
} from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import { type Sector, type Periodo, type Clave } from "~/types/monitor";
import { LoadingSpinner } from "~/components/loading-spinner";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { DatePicker } from "~/components/date-picker";
import ResultadosBusqueda from "~/components/monitor/monitor-lecturas/resultados-busqueda";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"; // Import Collapsible
import { Separator } from "~/components/ui/separator"; // Import Separator
import { cn } from "~/lib/utils"; // Assuming you have this utility
import { toast } from "sonner";

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
  activePeriodoId,
  error,
}: MonitorLecturasComponentProps) => {
  // Solo usamos useMonitor para funciones específicas, no para carga inicial
  const { fetchLecturas, fetchMedidores } = useMonitor();

  const pageBreadcrumbs = [
    { label: "Monitor" },
    { label: "Monitor de Lecturas" },
  ];

  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [selectedPeriodo, setSelectedPeriodo] = useState<Periodo | null>(null);
  const [selectedClave, setSelectedClave] = useState<Clave | null>(null);
  const [medidor, setMedidor] = useState<string>("");
  const [selectedEstado, setSelectedEstado] = useState<number>(0); // Renamed from tipoclave for clarity
  const [fechaInicio, setFechaInicio] = useState<string>(""); // Keep state for derived start date
  const [fechaFin, setFechaFin] = useState<string>("");
  const [shouldSearch, setShouldSearch] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true); // State for collapsible filters

  // Effect to set default Periodo and Dates
  useEffect(() => {
    if (periodos && periodos.length > 0 && !selectedPeriodo) {
      // Set only if not already set
      const periodoActivo =
        periodos.find((p) => Number(p.IdPeriodo) === Number(activePeriodoId)) ||
        periodos[0]; // Fallback to first if active not found

      if (periodoActivo) {
        setSelectedPeriodo(periodoActivo);
        setFechaInicio(periodoActivo.FechaInicio);
        // Set default end date only if not already set or if period changes
        if (!fechaFin) {
          setFechaFin(new Date().toISOString().split("T")[0]);
        }
      }
    }
  }, [periodos, activePeriodoId, selectedPeriodo, fechaFin]);

  // Update fechaInicio when selectedPeriodo changes
  useEffect(() => {
    if (selectedPeriodo) {
      setFechaInicio(selectedPeriodo.FechaInicio);
    }
  }, [selectedPeriodo]);

  // Limpieza de filtros
  const handleLimpiezaFiltros = () => {
    setShouldSearch(false);
    setSearchTrigger(0);
    setSelectedSector(null);
    const periodoActivo =
      periodos.find((p) => Number(p.IdPeriodo) === Number(activePeriodoId)) ||
      periodos[0] ||
      null;
    setSelectedPeriodo(periodoActivo);
    setSelectedClave(null);
    setMedidor("");
    setSelectedEstado(0);
    setFechaInicio(periodoActivo?.FechaInicio || "");
    setFechaFin(new Date().toISOString().split("T")[0]);
    setIsFiltersOpen(true); // Re-open filters on clear
  };

  const handleSearch = () => {
    // Basic validation example
    if (!selectedSector) {
      toast.error("Por favor, seleccione un sector.");
      return;
    }
    if (!selectedPeriodo) {
      toast.error("Por favor, seleccione un periodo.");
      return;
    }
    setShouldSearch(true);
    setSearchTrigger((prev) => prev + 1);
  };

  // --- Error State ---
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Carga</AlertTitle>
          <AlertDescription>
            {error.message ||
              "Ocurrió un error al cargar los datos iniciales. Por favor, intente recargar la página."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  // --- End Error State ---

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />

      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
          Monitor de Lecturas
        </h1>
        <p className="text-muted-foreground">
          Seleccione un sector y aplique filtros para visualizar las lecturas de
          medidores.
        </p>
      </div>

      {/* Sector Selection Card */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg border shadow-sm">
              <MapPin className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                Seleccionar Sector
              </CardTitle>
              <CardDescription className="text-sm">
                Elija el área geográfica para iniciar el monitoreo.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          {sectores && sectores.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sectores.map((sector) => (
                <Button
                  key={sector.sectorId}
                  variant={
                    selectedSector?.sectorId === sector.sectorId
                      ? "default" // Use default variant for selected
                      : "outline"
                  }
                  onClick={() => setSelectedSector(sector)}
                  size="sm"
                  className={cn(
                    "transition-all duration-150",
                    selectedSector?.sectorId === sector.sectorId
                      ? "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white"
                      : "dark:text-sky-300 border-border/70 hover:bg-muted/50"
                  )}
                >
                  {sector.descripcion}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No hay sectores disponibles para seleccionar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Filters Card (Collapsible) */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border shadow-sm">
                  <Filter className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Filtros de Búsqueda
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Ajuste los parámetros para refinar los resultados.
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevenir que el evento se propague al CollapsibleTrigger
                    setIsFiltersOpen(!isFiltersOpen);
                  }}
                >
                  {isFiltersOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Abrir/Cerrar filtros</span>
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 md:p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">
                {/* Periodo */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="periodo-select"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Periodo
                  </Label>
                  {periodos && periodos.length > 0 ? (
                    <Select
                      value={selectedPeriodo?.IdPeriodo || ""}
                      onValueChange={(value) => {
                        const periodo = periodos.find(
                          (p) => p.IdPeriodo === value
                        );
                        setSelectedPeriodo(periodo || null);
                      }}
                    >
                      <SelectTrigger
                        id="periodo-select"
                        className="w-full bg-background border-border/70"
                      >
                        <SelectValue placeholder="Seleccione periodo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {periodos?.map((periodo) => (
                          <SelectItem
                            key={periodo.IdPeriodo}
                            value={String(periodo.IdPeriodo)}
                          >
                            {periodo.DescripcionPeriodo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-9 w-full animate-pulse bg-muted rounded-md"></div>
                  )}
                </div>

                {/* Clave */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="clave-select"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Clave (Opcional)
                  </Label>
                  {claves && claves.length > 0 ? (
                    <Select
                      // Use 'ALL' when selectedClave is null, otherwise the ID
                      value={selectedClave?.IdClave.toString() || "ALL"}
                      onValueChange={(value) => {
                        if (value === "ALL") {
                          // If user selects 'ALL', set selectedClave state to null
                          setSelectedClave(null);
                        } else {
                          // Otherwise, find the corresponding clave object
                          const clave = claves?.find(
                            (c) => c.IdClave === parseInt(value)
                          );
                          setSelectedClave(clave || null);
                        }
                      }}
                    >
                      <SelectTrigger
                        id="clave-select"
                        className="w-full bg-background border-border/70"
                      >
                        <SelectValue placeholder="Todas las claves..." />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Use 'ALL' as the value for the "clear" option */}
                        <SelectItem value="ALL">Todas las claves</SelectItem>
                        {claves?.map((clave) => (
                          <SelectItem
                            key={clave.IdClave}
                            value={String(clave.IdClave)} // Keep using the ID string here
                          >
                            {clave.DescripcionClave} ({clave.IdClave})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="h-9 w-full animate-pulse bg-muted rounded-md"></div>
                  )}
                </div>

                {/* Medidor */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="medidor-input"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <Hash className="h-3.5 w-3.5" /> Medidor (Opcional)
                  </Label>
                  <Input
                    type="text"
                    id="medidor-input"
                    placeholder="Número de serie..."
                    value={medidor}
                    onChange={(e) => setMedidor(e.target.value)}
                    className="bg-background border-border/70"
                  />
                </div>

                {/* Criterio (Estado) */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="criterio-select"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <ListFilter className="h-3.5 w-3.5" /> Criterio (Opcional)
                  </Label>
                  <Select
                    value={selectedEstado?.toString()}
                    onValueChange={(value) => setSelectedEstado(Number(value))}
                  >
                    <SelectTrigger
                      id="criterio-select"
                      className="w-full bg-background border-border/70"
                    >
                      <SelectValue placeholder="Seleccione criterio..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todos los criterios</SelectItem>
                      <SelectItem value="1">Sin Lectura</SelectItem>
                      <SelectItem value="2">Lectura Normal</SelectItem>
                      <SelectItem value="3">Clave Informativa</SelectItem>
                      <SelectItem value="4">Clave Relevante</SelectItem>
                      <SelectItem value="5">Clave Crítica</SelectItem>
                      {/* Add more if needed */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha Inicio (Read Only) */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fecha-inicio-lectura"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Fecha Inicio (Periodo)
                  </Label>
                  <Input
                    type="text"
                    id="fecha-inicio-lectura"
                    value={fechaInicio || "Seleccione periodo"}
                    readOnly // Use readOnly for better UX than disabled
                    className="bg-muted/50 border-border/70 text-muted-foreground"
                  />
                </div>

                {/* Fecha Fin */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fecha-fin-lectura"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Fecha Fin
                  </Label>
                  <DatePicker
                    date={
                      fechaFin ? new Date(fechaFin + "T00:00:00") : undefined
                    } // Ensure correct date parsing
                    setDate={(date) => {
                      if (date) {
                        // No need for UTC conversion if only date matters
                        setFechaFin(date.toISOString().split("T")[0]);
                      } else {
                        setFechaFin("");
                      }
                    }}
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="mt-6 flex justify-end">
                <Button
                  variant="ghost" // Use ghost for less emphasis
                  onClick={handleLimpiezaFiltros}
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  size="sm"
                >
                  <Eraser className="h-4 w-4" />
                  Limpiar Filtros
                </Button>
                <Button
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent trigger toggle
                    handleSearch();
                  }}
                  size="sm"
                  className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                  disabled={!selectedSector || !selectedPeriodo} // Disable if required fields missing
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Separator */}
      {shouldSearch && <Separator className="my-6" />}

      {/* Results Section */}
      {shouldSearch && (
        <Suspense
          fallback={
            <Card className="shadow-sm p-8 border border-border/60">
              <LoadingSpinner message="Cargando resultados..." />
            </Card>
          }
        >
          <ResultadosBusqueda
            // Pass necessary props
            sector={selectedSector?.sectorId || ""}
            periodo={selectedPeriodo?.IdPeriodo || ""}
            stfechaini={fechaInicio} // Use state variable
            stfechafin={fechaFin}
            tipoclave={selectedEstado.toString()} // Pass selectedEstado as tipoclave
            medidor={medidor}
            clave={selectedClave?.IdClave.toString() || ""} // Pass ID for potential backend use
            triggerSearch={searchTrigger}
          />
        </Suspense>
      )}
    </div>
  );
};

export default MonitorLecturasComponent;
