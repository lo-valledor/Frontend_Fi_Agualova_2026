import { driver } from "driver.js";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eraser,
  Filter,
  Hash,
  HelpCircle,
  KeyRound,
  ListFilter,
  MapPin,
  Search,
  Settings2,
} from "lucide-react";
import { motion } from "motion/react";

import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import ResultadosBusqueda from "~/components/monitor/monitor-lecturas/resultados-busqueda";
import { LoadingSpinner } from "~/components/loading-spinner";
import { ModernHeader } from "~/components/shared/modern-header";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent
} from "~/components/ui/collapsible";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useMonitorKeyboardShortcuts } from "~/hooks/use-keyboard-shortcuts";
import {
  findActivePeriod,
  formatDateDDMMYYYY,
  getDefaultDates,
  getLastNPeriods,
  validateSearchParams,
} from "~/hooks/use-monitor";
import { cn } from "~/lib/utils";
import {
  type MonitorClaves,
  type MonitorGrillaProps,
  type MonitorPeriodos,
  type MonitorSectores,
} from "~/types/monitor";
import "driver.js/dist/driver.css";

interface MonitorLecturasComponentProps {
  periodos: MonitorPeriodos[];
  sectores: MonitorSectores[];
  claves: MonitorClaves[];
  activePeriodoId: string | null;
  error: Error | null;
}

const MonitorLecturasComponent = ({
  periodos,
  sectores,
  claves,
  error,
}: MonitorLecturasComponentProps) => {
  const pageBreadcrumbs = [
    { label: "Monitor" },
    { label: "Monitor de Lecturas" },
  ];

  // Form filter states with descriptive names
  const [selectedSector, setSelectedSector] = useState<MonitorSectores | null>(
    null,
  );
  const [selectedPeriodo, setSelectedPeriodo] =
    useState<MonitorPeriodos | null>(null);
  const [selectedClave, setSelectedClave] = useState<MonitorClaves | null>(
    null,
  );
  const [meterSerial, setMeterSerial] = useState<string>("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

  // Modal state
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // UI states
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Initialize default period and dates with early returns
  useEffect(() => {
    // Early return if no periods available
    if (!periodos || periodos.length === 0) return;

    // Early return if period already selected
    if (selectedPeriodo) return;

    const periodoActivo = findActivePeriod(periodos);

    // Early return if no active period found
    if (!periodoActivo) return;

    setSelectedPeriodo(periodoActivo);
    const defaultDates = getDefaultDates(periodoActivo);
    setFechaInicio(defaultDates.fechaInicio);

    if (!fechaFin) {
      setFechaFin(defaultDates.fechaFin);
    }
  }, [periodos, selectedPeriodo, fechaFin]);

  // Actualizar fechaInicio cuando cambia el período seleccionado
  // Usa getDefaultDates para que, si periodo.fechaInicio es null,
  // derive el primer día del mes a partir de periodo.value (MMYYYY).
  useEffect(() => {
    if (selectedPeriodo) {
      const defaultDates = getDefaultDates(selectedPeriodo);
      setFechaInicio(defaultDates.fechaInicio);
    }
  }, [selectedPeriodo]);

  const handleLimpiezaFiltros = () => {
    setSelectedSector(null);

    const periodoActivo = findActivePeriod(periodos);
    setSelectedPeriodo(periodoActivo);
    setSelectedClave(null);
    setMeterSerial("");
    setSelectedStatusFilter("");

    const defaultDates = getDefaultDates(periodoActivo);
    setFechaInicio(defaultDates.fechaInicio);
    setFechaFin(defaultDates.fechaFin);
    setIsFiltersOpen(true);
  };

  const handleOpenMedidor = () => {
    const validation = validateSearchParams(selectedSector, selectedPeriodo);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    setIsSearchActive(true);
    setSearchTrigger(prev => prev + 1);
    setIsFiltersOpen(false);
  };

  // Keyboard shortcuts for accessibility (after function declarations)
  useMonitorKeyboardShortcuts({
    onSearch: () => {
      // Open filters and focus meter input
      if (!isFiltersOpen) {
        setIsFiltersOpen(true);
      }

      // Focus input after React renders
      setTimeout(() => {
        const input = document.getElementById("meter-serial-input");
        input?.focus();
      }, 100);
    },
    onRefresh: handleOpenMedidor,
    onEscape: () => setIsFiltersOpen(false),
  });

  // Early return for error state
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

  const startTour = () => {
    const driverjs = driver({
      showProgress: true,
      progressText: "Paso {{current}} de {{total}}",
      smoothScroll: true,
      stagePadding: 4,
      stageRadius: 6,
      animate: true,
      allowClose: true,
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Finalizar",
      onHighlightStarted: (element) => {
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
    });

    driverjs.setSteps(tourSteps);
    driverjs.drive();
  };

  const grillaParams = useMemo<MonitorGrillaProps>(
    () => ({
      periodo: selectedPeriodo?.value ?? "",
      sector: selectedSector?.secId.toString() ?? "",
      medidor: meterSerial,
      fechaIni: fechaInicio,
      fechaFin: formatDateDDMMYYYY(fechaFin),
      clave: selectedClave?.value ?? "",
      criterio: selectedStatusFilter
    }),
    [
      selectedPeriodo,
      selectedSector,
      meterSerial,
      fechaInicio,
      fechaFin,
      selectedClave,
      selectedStatusFilter
    ]
  );

  const tourSteps = [
    {
      element: "#sector-selector",
      popover: {
        title: "📍 Sector de Monitoreo (Obligatorio)",
        description:
          "Debes seleccionar el <strong>área a monitorear</strong> para poder buscar lecturas. Este es un campo requerido.",
        side: "bottom" as const,
        align: "start" as const,
      },
    },
    {
      element: "#periodo-selector",
      popover: {
        title: "📅 Periodo (Obligatorio)",
        description:
          "Selecciona el <strong>periodo de monitoreo</strong>. Es necesario para realizar la búsqueda.",
        side: "bottom" as const,
        align: "start" as const,
      },
    },
    {
      element: "#fecha-fin-selector",
      popover: {
        title: "📆 Fecha Fin",
        description:
          "Puedes ajustar la <strong>fecha final</strong> del monitoreo si lo requieres para acotar el rango de búsqueda.",
        side: "bottom" as const,
        align: "start" as const,
      },
    },
    {
      element: "#filtros-avanzados",
      popover: {
        title: "🔧 Filtros Opcionales",
        description:
          "Puedes filtrar por <strong>clave, estado o número de serie</strong> para refinar tu búsqueda y obtener resultados más específicos.",
        side: "bottom" as const,
        align: "start" as const,
      },
    },
    {
      element: "#search-button",
      popover: {
        title: "🔍 Buscar",
        description:
          "Haz clic aquí para <strong>iniciar la búsqueda</strong> una vez que hayas completado los filtros obligatorios (Sector y Periodo).",
        side: "bottom" as const,
        align: "center" as const,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <BreadcrumbSetter items={pageBreadcrumbs} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <ModernHeader
            title="Monitor de Lecturas"
            description="Gestion, ingreso y visualización de lecturas hechas a medidores"
          />

          {/* Botón para iniciar el tour interactivo */}
          <Button
            variant="outline"
            size="sm"
            onClick={startTour}
            className="mb-2"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-md bg-card backdrop-blur-sm">
            <CardContent className="p-3 sm:p-4 space-y-3">
              {/* Sector Selection - Clean Grid */}
              <div className="space-y-3 sm:space-y-4" id="sector-selector">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg">
                      Sector de Monitoreo
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Selecciona el área a monitorear
                    </p>
                  </div>
                </div>

                {sectores && sectores.length > 0 ? (
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                    {sectores.map((sector, index) => (
                      <motion.div
                        key={sector.secId}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                      >
                        <Button
                          variant={
                            selectedSector?.secId === sector.secId
                              ? "default"
                              : "outline"
                          }
                          onClick={() => setSelectedSector(sector)}
                          className={cn(
                            "h-auto p-3 transition-all duration-200 text-center w-full",
                            selectedSector?.secId === sector.secId
                              ? "bg-primary hover:bg-primary-700 shadow-md border-0"
                              : "hover:border",
                          )}
                        >
                          <div className="text-center w-full">
                            <div className="font-semibold text-xs sm:text-sm leading-tight">
                              {sector.descripcion}
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 text-muted-foreground">
                    <Settings2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm sm:text-base">
                      No hay sectores disponibles
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                {/* Periodo */}
                <div
                  className="space-y-1 w-full sm:w-1/3"
                  id="periodo-selector"
                >
                  <Label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary shrink-0" />
                    Periodo
                  </Label>
                  {(() => {
                    const periodosParaSelect = getLastNPeriods(periodos, 12);
                    return periodosParaSelect.length > 0 ? (
                      <Select
                        value={selectedPeriodo?.value || ""}
                        onValueChange={(value) => {
                          const periodo = periodosParaSelect.find(
                            (p) => p.value === value,
                          );
                          setSelectedPeriodo(periodo || null);
                        }}
                      >
                        <SelectTrigger className="w-full bg-background border-border">
                          <SelectValue placeholder="Seleccionar periodo..." />
                        </SelectTrigger>
                        <SelectContent>
                          {periodosParaSelect.map((periodo) => (
                            <SelectItem
                              key={periodo.value}
                              value={periodo.value}
                              className="truncate"
                            >
                              {periodo.text}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
                    );
                  })()}
                </div>

                {/* Fecha Inicio */}
                <div className="space-y-1 w-full sm:w-1/3">
                  <Label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary shrink-0" />
                    Fecha Inicio
                  </Label>
                  <Input
                    type="text"
                    value={fechaInicio || "Definida por período"}
                    readOnly
                    className="w-full bg-muted text-muted-foreground cursor-not-allowed truncate"
                  />
                </div>

                {/* Fecha Fin */}
                <div
                  className="space-y-1 w-full sm:w-1/3"
                  id="fecha-fin-selector"
                >
                  <Label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary shrink-0" />
                    Fecha Fin
                  </Label>
                  <Input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full bg-background border-border"
                  />
                </div>
              </div>

              {/* Search Action */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch sm:items-center justify-between pt-4 border-t">
                <div
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 order-2 sm:order-1"
                  id="filtros-avanzados"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className="text-muted-foreground hover:text-foreground justify-center sm:justify-start"
                  >
                    <Filter className="w-4 h-4 mr-1" />
                    <span className="text-sm">Filtros Avanzados</span>
                    {isFiltersOpen ? (
                      <ChevronUp className="w-4 h-4 ml-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Button>

                  {(selectedClave ||
                    meterSerial ||
                    selectedStatusFilter !== "") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLimpiezaFiltros}
                      className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 justify-center sm:justify-start"
                    >
                      <Eraser className="w-4 h-4 mr-1" />
                      <span className="text-sm">Limpiar</span>
                    </Button>
                  )}
                </div>

                <Button
                  id="open-medidor-button"
                  onClick={handleOpenMedidor}
                  disabled={!selectedSector || !selectedPeriodo}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 sm:py-2 shadow-md hover:shadow-lg transition-all duration-200 order-1 sm:order-2"
                >
                  <Search className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">
                    Iniciar Monitoreo
                  </span>
                </Button>
              </div>

              {/* Advanced Filters - Collapsible */}
              <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <CollapsibleContent>
                  <div className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Clave */}
                      <div className="space-y-2 w-full">
                        <Label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-primary shrink-0" />
                          Clave
                        </Label>
                        {claves && claves.length > 0 ? (
                          <Select
                            value={selectedClave?.value || "ALL"}
                            onValueChange={(value) => {
                              if (value === "ALL") {
                                setSelectedClave(null);
                              } else {
                                const clave = claves?.find(
                                  (c) => c.value === value,
                                );
                                setSelectedClave(clave || null);
                              }
                            }}
                          >
                            <SelectTrigger className="w-full bg-background border-border">
                              <SelectValue placeholder="Todas las claves..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL" className="truncate">
                                Todas las claves
                              </SelectItem>
                              {claves?.map((clave) => (
                                <SelectItem
                                  key={clave.value}
                                  value={clave.value}
                                  className="truncate"
                                >
                                  {clave.text}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
                        )}
                      </div>

                      {/* Estado */}
                      <div className="space-y-2 w-full">
                        <Label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                          <ListFilter className="w-3 h-3 text-primary shrink-0" />
                          Estado
                        </Label>
                        <Select
                          value={selectedStatusFilter}
                          onValueChange={(value) =>
                            setSelectedStatusFilter(value === "0" ? "" : value)
                          }
                        >
                          <SelectTrigger className="w-full bg-background border-border">
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
                      <div className="space-y-2 w-full">
                        <Label className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-1">
                          <Hash className="w-3 h-3 text-primary shrink-0" />
                          Número de Serie
                        </Label>
                        <Input
                          id="meter-serial-input"
                          type="text"
                          placeholder="Buscar medidor específico..."
                          value={meterSerial}
                          onChange={(e) => setMeterSerial(e.target.value)}
                          className="w-full bg-background border-border"
                          aria-label="Número de serie del medidor"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grilla de resultados */}
        {isSearchActive && (
          <Suspense
            fallback={
              <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <LoadingSpinner message="Cargando grilla de medidores..." />
                </CardContent>
              </Card>
            }
          >
            <ResultadosBusqueda
              {...grillaParams}
              triggerSearch={searchTrigger}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default MonitorLecturasComponent;
