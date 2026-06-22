import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
  AlertCircleIcon,
  CalendarIcon,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eraser,
  FileSpreadsheet,
  FileTextIcon,
  HelpCircle,
  Info,
  RefreshCw,
  Search as SearchIcon,
  TrendingUp,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "~/components/data-table/data-table";
import { ModernHeader } from "~/components/shared/modern-header";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Collapsible, CollapsibleContent } from "~/components/ui/collapsible";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  type PrefacturaItem,
  useCalculoFactura,
} from "~/hooks/operaciones/use-calculo-factura";
import { useCalculoProceso } from "~/hooks/operaciones/use-calculo-proceso";
import { useValidacionPrecios } from "~/hooks/operaciones/use-validacion-precios";
import type {
  RevisarCalculosFiltrosCiclosResponse,
  RevisarCalculosFiltrosPeriodosResponse,
} from "~/types/operaciones";

interface RevisarCalculoFacturaComponentProps {
  readonly periodos: RevisarCalculosFiltrosPeriodosResponse;
  readonly ciclos: RevisarCalculosFiltrosCiclosResponse;
  readonly error: string | null;
}

const formatCurrencyCL = (value: number | undefined): string => {
  if (typeof value !== "number") return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function RevisarCalculoFacturaComponent({
  periodos,
  ciclos,
  error,
}: RevisarCalculoFacturaComponentProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [cicloId, setCicloId] = useState<string>("");
  const [periodoId, setPeriodoId] = useState<string>(
    () => periodos[0]?.id ?? "",
  );

  useMemo(() => {
    if (periodos.length > 0 && !periodos.some((p) => p.id === periodoId)) {
      setPeriodoId(periodos[0].id);
    }
  }, [periodos, periodoId]);

  const periodoFormateado = periodoId;
  const {
    preciosConfirmados,
    isLoading: isLoadingValidacion,
    preciosConfirmadosCount,
    preciosPendientesCount,
    totalPrecios,
  } = useValidacionPrecios({
    periodoFormateado,
    cicloId: cicloId || "1",
  });

  const {
    isLaunching,
    isAccepting,
    selectedContratos,
    setSelectedContratos,
    handleLanzarCalculo,
    handleAceptarCalculo,
  } = useCalculoProceso({
    periodoFormateado,
    cicloId: cicloId || "1",
    onCalculoAceptado: useCallback(() => {
      void handleRevisarCalculo();
    }, []),
  });

  const {
    data,
    filteredData,
    isLoading,
    error: dataError,
    searchTerm,
    setSearchTerm,
    handleRevisarCalculo,
  } = useCalculoFactura({
    periodoFormateado,
    cicloId: cicloId || "1",
  });

  const totalRegistros = filteredData.length;
  const totalFacturado = useMemo(
    () =>
      filteredData.reduce((acc, item) => acc + (item.totalFacturado ?? 0), 0),
    [filteredData],
  );
  const totalConsumo = useMemo(
    () =>
      filteredData.reduce((acc, item) => acc + (item.consumoPeriodo ?? 0), 0),
    [filteredData],
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "contratoId",
        header: () => (
          <div className="text-left font-medium text-xs">Contrato</div>
        ),
        cell: ({ row }: { row: { original: PrefacturaItem } }) => (
          <span className="font-mono text-xs text-primary bg-primary/10 px-1 py-0.5 rounded">
            {String(row.original.contratoId ?? "-")}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: "rut",
        header: () => <div className="text-left font-medium text-xs">RUT</div>,
        cell: ({ row }: { row: { original: PrefacturaItem } }) => (
          <span className="font-mono text-xs">
            {String(row.original.rut ?? "-")}
          </span>
        ),
        size: 110,
      },
      {
        accessorKey: "nombre",
        header: () => (
          <div className="text-left font-medium text-xs">Nombre</div>
        ),
        cell: ({ row }: { row: { original: PrefacturaItem } }) => (
          <span className="text-xs truncate block" title={row.original.nombre}>
            {String(row.original.nombre ?? "-")}
          </span>
        ),
        size: 220,
      },
      {
        accessorKey: "sector",
        header: () => (
          <div className="text-center font-medium text-xs">Sector</div>
        ),
        cell: ({ row }: { row: { original: PrefacturaItem } }) => (
          <span className="text-[10px] font-mono bg-primary/10 text-primary px-1 py-0.5 rounded">
            {String(row.original.sector ?? "-")}
          </span>
        ),
        size: 80,
      },
      {
        accessorKey: "consumoPeriodo",
        header: () => (
          <div className="text-right font-medium text-xs">Consumo</div>
        ),
        cell: ({ row }: { row: { original: PrefacturaItem } }) => (
          <span className="text-xs">
            {(row.original.consumoPeriodo ?? 0).toLocaleString("es-CL")}
          </span>
        ),
        size: 90,
      },
      {
        accessorKey: "totalFacturado",
        header: () => (
          <div className="text-right font-medium text-xs">Total Facturado</div>
        ),
        cell: ({ row }: { row: { original: PrefacturaItem } }) => (
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {formatCurrencyCL(row.original.totalFacturado ?? 0)}
          </span>
        ),
        size: 130,
      },
    ],
    [],
  );

  const handleSelectionChange = useCallback(
    (selected: PrefacturaItem[]) => {
      setSelectedContratos(
        selected
          .map((item) => item.lecturaId ?? item.contratoId ?? 0)
          .filter((id) => id > 0),
      );
    },
    [setSelectedContratos],
  );

  const tourSteps = [
    {
      element: "#periodo-info",
      popover: {
        title: "Período de Facturación",
        description:
          "Período activo para facturación. Solo se puede trabajar con períodos abiertos.",
        side: "bottom" as const,
        align: "start" as const,
      },
    },
    {
      element: "#preparar-calculo-btn",
      popover: {
        title: "Preparar Cálculo",
        description:
          "Inicia el procesamiento de facturación. Requisito: confirmar todos los precios en Revisar Precios.",
        side: "bottom" as const,
        align: "center" as const,
      },
    },
    {
      element: "#ver-calculo-btn",
      popover: {
        title: "Ver Cálculos",
        description:
          "Consulta los resultados cuando el sistema termine de procesar.",
        side: "bottom" as const,
        align: "center" as const,
      },
    },
    {
      element: "#aceptar-calculo-btn",
      popover: {
        title: "Aceptar Cálculo",
        description:
          "Finaliza el proceso aceptando los cálculos seleccionados.",
        side: "top" as const,
        align: "center" as const,
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
          <ModernHeader
            title="Revisar Cálculo de Factura"
            description="Gestión y revisión de cálculos de facturación por periodo"
          />
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error al cargar datos</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1880px] mx-auto p-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <ModernHeader
            title="Revisar Cálculo de Factura"
            description="Gestión y revisión de cálculos de facturación por periodo"
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

        <Card className="border border-border shadow-sm">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex justify-between items-center px-4 py-3 h-auto cursor-pointer hover:bg-muted/40 transition-colors rounded-b-none"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              type="button"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="text-sm font-medium leading-none">
                    Configuración de Búsqueda
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure período y ciclo de facturación
                  </p>
                </div>
              </div>
              {isFiltersOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </Button>

            <CollapsibleContent>
              <CardContent className="px-4 pt-3 pb-4 border-t border-border space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Periodo
                    </Label>
                    <Select value={periodoId} onValueChange={setPeriodoId}>
                      <SelectTrigger
                        id="periodo-info"
                        className="h-9 w-full bg-background border-border text-sm"
                      >
                        <SelectValue placeholder="Selecciona un período" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodos.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                      <FileTextIcon className="w-3.5 h-3.5" />
                      Ciclo de Facturación
                    </Label>
                    <Select value={cicloId} onValueChange={setCicloId}>
                      <SelectTrigger className="h-9 w-full bg-background border-border text-sm">
                        <SelectValue placeholder="Selecciona un ciclo" />
                      </SelectTrigger>
                      <SelectContent>
                        {ciclos.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!isLoadingValidacion && !preciosConfirmados && (
                  <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
                    <AlertCircleIcon className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        Precios pendientes de confirmación
                      </p>
                      <p className="text-xs mt-0.5 opacity-80">
                        Confirma {preciosPendientesCount} de {totalPrecios}{" "}
                        precios en <strong>Revisar Precios</strong> antes de
                        continuar. ({preciosConfirmadosCount}/{totalPrecios}{" "}
                        confirmados)
                      </p>
                    </div>
                  </div>
                )}

                {!isLoadingValidacion && preciosConfirmados && (
                  <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {totalPrecios} precios confirmados — listo para procesar
                      </p>
                      <p className="text-xs mt-0.5 opacity-80">
                        El proceso puede tardar varios minutos. Use "Ver Cálculo
                        Facturas" para consultar los resultados.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                  <Button
                    id="preparar-calculo-btn"
                    onClick={handleLanzarCalculo}
                    disabled={
                      isLaunching ||
                      !preciosConfirmados ||
                      isLoadingValidacion ||
                      !cicloId ||
                      !periodoId
                    }
                    size="sm"
                  >
                    {isLaunching ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span className="hidden sm:inline">Preparando...</span>
                      </>
                    ) : (
                      <>
                        <SearchIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Preparar Cálculo
                        </span>
                        <span className="sm:hidden">Preparar</span>
                      </>
                    )}
                  </Button>

                  <Button
                    id="ver-calculo-btn"
                    onClick={handleRevisarCalculo}
                    disabled={
                      isLoading ||
                      !preciosConfirmados ||
                      isLoadingValidacion ||
                      !cicloId ||
                      !periodoId
                    }
                    variant="secondary"
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span className="hidden sm:inline">Cargando...</span>
                      </>
                    ) : (
                      <>
                        <FileTextIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Ver Cálculo Facturas
                        </span>
                        <span className="sm:hidden">Ver Cálculo</span>
                      </>
                    )}
                  </Button>

                  <Button
                    id="limpiar-btn"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCicloId("");
                      setSearchTerm("");
                      setSelectedContratos([]);
                    }}
                  >
                    <Eraser className="h-4 w-4" />
                    <span className="hidden sm:inline">Limpiar</span>
                  </Button>

                  <Button
                    id="actualizar-btn"
                    variant="outline"
                    size="sm"
                    onClick={handleRevisarCalculo}
                    disabled={isLoading}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Actualizar</span>
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div>
                <CardTitle className="text-sm font-medium">
                  Resultados de Consulta
                </CardTitle>
                <CardDescription className="text-xs">
                  Contratos y cálculos de facturación
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {(() => {
              if (isLoading) {
                return (
                  <div className="flex justify-center items-center h-40">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20" />
                        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      </div>
                      <p className="font-medium">Cargando resultados...</p>
                    </div>
                  </div>
                );
              }

              if (dataError === "NO_LECTURAS_CERRADAS") {
                return (
                  <Alert className="border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <AlertTitle className="text-emerald-900 dark:text-emerald-100 font-bold">
                      ✓ Sistema al día - No hay lecturas pendientes
                    </AlertTitle>
                    <AlertDescription className="text-emerald-800 dark:text-emerald-200 mt-2">
                      Todas las lecturas cerradas del periodo actual ya fueron
                      procesadas y facturadas.
                    </AlertDescription>
                  </Alert>
                );
              }

              if (dataError && dataError !== "NO_LECTURAS_CERRADAS") {
                return (
                  <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertTitle>Error al cargar datos</AlertTitle>
                    <AlertDescription>{dataError}</AlertDescription>
                  </Alert>
                );
              }

              if (data.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
                    <Info className="h-10 w-10" />
                    <p className="font-medium">
                      Realizar consulta de precálculos
                    </p>
                    <p className="text-xs">
                      Selecciona período y ciclo, haz clic en "Preparar Cálculo"
                      o "Ver Cálculo Facturas"
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-md">
                    <div className="px-4 py-3 text-center">
                      <div className="text-xl font-semibold tabular-nums">
                        {totalRegistros}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Lecturas Cerradas
                      </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <div className="text-lg font-semibold tabular-nums">
                        {formatCurrencyCL(totalFacturado)}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Total Facturado
                      </div>
                    </div>
                    <div className="px-4 py-3 text-center">
                      <div className="text-xl font-semibold tabular-nums">
                        {totalConsumo.toLocaleString("es-CL")}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Consumo kWh
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Buscar por contrato, RUT o nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {searchTerm && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {filteredData.length}/{data.length}
                      </span>
                    )}
                  </div>

                  <DataTable
                    columns={columns as never[]}
                    data={filteredData as never[]}
                    onRowSelectionChange={handleSelectionChange as never}
                    rowIdKey="lecturaId"
                    searchPlaceholder="Buscar por contrato, RUT o nombre..."
                  />
                </div>
              );
            })()}

            {selectedContratos.length > 0 && data.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button
                  id="aceptar-calculo-btn"
                  onClick={handleAceptarCalculo}
                  disabled={isAccepting}
                  size="sm"
                  className="gap-2"
                >
                  {isAccepting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Aceptando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Aceptar {selectedContratos.length} cálculo
                      {selectedContratos.length === 1 ? "" : "s"}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
