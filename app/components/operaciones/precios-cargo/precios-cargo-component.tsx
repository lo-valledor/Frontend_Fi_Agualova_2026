import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
  Building2,
  Calendar,
  ChevronDown,
  Eraser,
  HelpCircle,
  Info,
  Search,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ModernHeader } from "~/components/shared/modern-header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { operacionesService } from "~/services/operacionesService";
import type {
  PreciosConsultarRequest,
  PrepararLecturasFiltrosPeriodosResponse,
} from "~/types/operaciones";
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthLabel,
  getYearsRange,
  MONTHS,
  validatePeriod,
} from "~/utils/operaciones";

import { columns as columnsEnel } from "./columns-enel";
import { DataTablePreciosVirtualized } from "./data-table-precios-virtualized";

interface PreciosCargoComponentProps {
  precios: PreciosConsultarRequest[];
  initialMes: string;
  initialAnio: string;
  error: string | null;
}

export default function PreciosCargoComponent({
  precios: initialPrecios,
  initialMes,
  initialAnio,
  error,
}: Readonly<PreciosCargoComponentProps>) {
  const [mes, setMes] = useState(initialMes);
  const [anio, setAnio] = useState(initialAnio);
  const [precios, setPrecios] =
    useState<PreciosConsultarRequest[]>(initialPrecios);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [periodoAbierto, setPeriodoAbierto] =
    useState<PrepararLecturasFiltrosPeriodosResponse | null>(null);

  useEffect(() => {
    async function fetchPeriodoAbierto(): Promise<void> {
      const response = await operacionesService.getPeriodoAbierto();
      if (response.error || !response.data || response.data.length === 0) {
        return;
      }
      setPeriodoAbierto(response.data[0] ?? null);
    }
    fetchPeriodoAbierto();
  }, []);

  const handleSearch = async (): Promise<void> => {
    const validation = validatePeriod(mes, anio);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsLoading(true);
      setIsFiltersOpen(false);
      const response = await operacionesService.getPreciosCargoData(mes, anio);

      if (response.error || !response.data) {
        toast.error(response.error || "Error al buscar precios de cargo");
        return;
      }

      setPrecios(response.data);
      toast.success("Búsqueda completada exitosamente");
    } catch (err) {
      toast.error("Error al buscar precios de cargo", {
        description: String(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = (): void => {
    setMes(getCurrentMonth());
    setAnio(getCurrentYear());
    toast.success("Filtros reiniciados");
  };

  const handleDataUpdate = async (): Promise<void> => {
    await handleSearch();
  };

  const tourSteps = [
    {
      element: "#filtros-periodo",
      popover: {
        title: "📅 Filtros de Período",
        description:
          "Este panel te permite <strong>seleccionar el período</strong> (mes y año) para consultar los precios de cargo históricos o actuales.",
        side: "bottom" as const,
        align: "start" as const,
      },
    },
    {
      element: "#periodo-actual",
      popover: {
        title: "📌 Período Activo",
        description:
          "Aquí se muestra el <strong>período abierto actualmente</strong> en el sistema.",
        side: "bottom" as const,
        align: "start" as const,
      },
    },
    {
      element: "#buscar-btn",
      popover: {
        title: "🔍 Buscar Precios",
        description:
          "Una vez seleccionado el período deseado, haz clic en <strong>Buscar</strong> para cargar los precios de cargo.",
        side: "bottom" as const,
        align: "center" as const,
      },
    },
    {
      element: "#limpiar-btn",
      popover: {
        title: "🧹 Limpiar Filtros",
        description:
          "Este botón <strong>restablece los filtros</strong> al mes y año actual del sistema.",
        side: "bottom" as const,
        align: "center" as const,
      },
    },
    {
      element: "#tabla-precios",
      popover: {
        title: "💰 Tabla de Precios",
        description:
          "Aquí se muestran los <strong>precios de cargo publicados por la distribuidora</strong>.",
        side: "top" as const,
        align: "start" as const,
      },
    },
  ];

  const startTour = (): void => {
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-3 space-y-4">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-xl mb-3">
              <TrendingUp className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold mb-2">
              Error al cargar datos
            </h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <ModernHeader
            title="Precios Cargo"
            description="Gestión de precios de cargo para facturación"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={startTour}
            className="mb-2"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        <Card id="filtros-periodo" className="border border-border shadow-sm">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className="p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium">
                      Período de Consulta
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Selecciona el período para consultar los precios de cargo
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isFiltersOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            <div id="periodo-actual" className="px-4 pb-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Periodo abierto:</span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {periodoAbierto
                    ? periodoAbierto.descripcion
                    : `${getMonthLabel(mes)} ${anio}`}
                </Badge>
              </div>
            </div>

            <CollapsibleContent>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mes</Label>
                    <Select value={mes} onValueChange={setMes}>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Selecciona un mes" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {MONTHS.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Año</Label>
                    <Select value={anio} onValueChange={setAnio}>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="Selecciona un año" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {getYearsRange().map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border">
                  <Button
                    id="limpiar-btn"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="gap-2"
                  >
                    <Eraser className="w-4 h-4" />
                    Limpiar
                  </Button>

                  <Button
                    id="buscar-btn"
                    size="sm"
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-base font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  Precios de Cargo
                </h3>
              </div>
              <Badge variant="outline" className="text-sm">
                {getMonthLabel(mes)} {anio}
              </Badge>
            </div>
            <div
              id="tabla-precios"
              className="rounded-xl border border-border overflow-hidden"
            >
              <DataTablePreciosVirtualized
                columns={columnsEnel(mes, anio, handleDataUpdate)}
                data={precios}
                searchPlaceholder="Buscar por descripción o código..."
                showSearch
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
