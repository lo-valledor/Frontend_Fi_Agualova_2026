import { CircleX, BookOpenIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useOperaciones } from "~/hooks/use-operaciones";
import { type EstadoCierreLecturas } from "~/types/operaciones";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Eraser,
  SearchIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import api from "~/lib/api";
import { DataTable } from "../../data-table/data-table";
import { columns } from "./columns";
import DialogInformacion from "./dialog-informacion";

export default function CerrarLecturasComponent() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isResultsOpen, setIsResultsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cicloSeleccionado, setCicloSeleccionado] = useState<string>("");
  const [estadoCierreLecturas, setEstadoCierreLecturas] = useState<
    EstadoCierreLecturas[]
  >([]);
  const {
    consultarPeriodoAbierto: periodoAbierto,
    fetchPeriodoAbierto,
    fetchCiclosFacturacion,
    loadingState,
  } = useOperaciones();

  const isPeriodoLoading = loadingState.periodoAbierto.isLoading;
  const isCiclosLoading = loadingState.ciclos.isLoading;

  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      return `${mes.toString().padStart(2, "0")}${anio.toString()}`;
    }
    return "";
  }, [periodoAbierto]);

  useEffect(() => {
    fetchPeriodoAbierto();
    fetchCiclosFacturacion();
  }, [fetchPeriodoAbierto, fetchCiclosFacturacion]);

  const handleSearch = async () => {
    if (!periodoFormateado) {
      toast.error("No hay un periodo abierto disponible");
      return;
    }

    if (!cicloSeleccionado) {
      toast.error("Debe seleccionar un ciclo de facturación");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append("cicloFacturable", cicloSeleccionado);
      params.append("periodo", periodoFormateado);

      const response = await api.get("/estado-cierre-lecturas", {
        params,
      });

      if (response.status === 200) {
        const data = response.data as EstadoCierreLecturas[];
        setEstadoCierreLecturas(data);
        setIsResultsOpen(true);
        if (data.length === 0) {
          toast.info(
            "No se encontraron resultados para los criterios seleccionados"
          );
        } else {
          toast.success(`Se encontraron ${data.length} registros`);
        }
      } else {
        setError("Error al buscar lecturas");
        toast.error("Error al buscar lecturas");
      }
    } catch (error: any) {
      console.error("Error al buscar lecturas:", error);
      setError(`Error: ${error.message || "Error desconocido"}`);

      if (error.response) {
        toast.error(
          `Error ${error.response.status}: ${
            error.response.data?.mensaje || "Error en la consulta"
          }`
        );
      } else if (error.request) {
        toast.error("No se recibió respuesta del servidor");
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCicloSeleccionado("");
    setEstadoCierreLecturas([]);
    setError(null);
  };

  // Función para manejar la actualización después de cerrar lecturas
  const handleLecturaCerrada = () => {
    // Volvemos a buscar para actualizar la lista
    if (cicloSeleccionado && periodoFormateado) {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Cerrar Lecturas
          </h1>
          <p className="text-muted-foreground">
            Cierra las lecturas de los nichos y sectores para su facturación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DialogInformacion />
          {periodoAbierto && periodoAbierto.length > 0 && (
            <Badge
              variant="outline"
              className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
            >
              Periodo: {periodoAbierto[0].mes.toString().padStart(2, "0")}/
              {periodoAbierto[0].anio}
            </Badge>
          )}
        </div>
      </div>

      {/* Sección principal dividida en dos bloques */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Columna izquierda: Filtros */}
        <div className="lg:col-span-1">
          {/* Filtros */}
          <Card className="shadow-sm border border-border/60">
            <Collapsible
              open={isFiltersOpen}
              onOpenChange={setIsFiltersOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                      <SearchIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                        Filtros de Búsqueda
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Selecciona criterios para cerrar lecturas
                      </CardDescription>
                    </div>
                  </div>
                  {isFiltersOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="p-4 space-y-4">
                  {/* Periodo */}
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Periodo actual
                    </Label>
                    {isPeriodoLoading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : periodoAbierto && periodoAbierto.length > 0 ? (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border/60">
                        <CalendarIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        <span className="font-medium">
                          {periodoAbierto[0].mes.toString().padStart(2, "0")}/
                          {periodoAbierto[0].anio}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
                        <AlertCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span className="text-amber-600 dark:text-amber-400">
                          No hay periodo abierto
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ciclo de facturación */}
                  <div className="space-y-2">
                    <Label htmlFor="ciclo" className="text-muted-foreground">
                      Ciclo de facturación
                    </Label>
                    {isCiclosLoading ? (
                      <Skeleton className="h-9 w-full" />
                    ) : (
                      <Select
                        value={cicloSeleccionado}
                        onValueChange={setCicloSeleccionado}
                      >
                        <SelectTrigger id="ciclo" className="w-full">
                          <SelectValue placeholder="Selecciona un ciclo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Ciclo dia 15</SelectItem>
                          <SelectItem value="2">Ciclo dia 30</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSearch}
                      disabled={
                        isLoading || !cicloSeleccionado || !periodoFormateado
                      }
                      className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                    >
                      <SearchIcon className="h-4 w-4" />
                      {isLoading ? "Buscando..." : "Buscar"}
                    </Button>
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <Eraser className="h-4 w-4" />
                      Limpiar
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Columna derecha: Resultados */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm border border-border/60">
            <Collapsible
              open={isResultsOpen}
              onOpenChange={setIsResultsOpen}
              className="w-full"
            >
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg shadow-sm">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                        Resultados
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {estadoCierreLecturas.length > 0
                          ? `${estadoCierreLecturas.length} lecturas disponibles para cierre`
                          : "No hay lecturas disponibles para cierre"}
                      </CardDescription>
                    </div>
                  </div>
                  {isResultsOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="p-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 dark:border-sky-400"></div>
                        <span className="text-muted-foreground text-sm mt-2">
                          Buscando lecturas...
                        </span>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 my-4 text-red-600 dark:text-red-400">
                      <div className="flex items-center gap-2">
                        <AlertCircleIcon className="h-5 w-5" />
                        <p>{error}</p>
                      </div>
                    </div>
                  ) : estadoCierreLecturas.length === 0 ? (
                    <div className="rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 p-4">
                      <div className="flex items-start gap-3">
                        <SearchIcon className="h-5 w-5 text-sky-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-sky-800 dark:text-sky-300">
                            Sin resultados
                          </h3>
                          <p className="text-sm text-sky-700 dark:text-sky-300/90">
                            Utiliza los filtros para buscar lecturas disponibles
                            para cierre
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <DataTable
                        columns={columns({
                          onCerrarLecturaSuccess: handleLecturaCerrada,
                          cicloFact: cicloSeleccionado,
                          periodo: periodoFormateado,
                        })}
                        data={estadoCierreLecturas}
                      />

                      <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted-foreground">
                        <ClockIcon className="h-4 w-4" />
                        <span>
                          Total de registros: {estadoCierreLecturas.length}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </div>
  );
}
