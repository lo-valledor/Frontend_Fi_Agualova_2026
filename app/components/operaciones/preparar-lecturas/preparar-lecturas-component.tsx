import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  ChevronDown,
  SearchIcon,
  CalendarIcon,
  Eraser,
  ChevronUp,
  AlertCircleIcon,
  UsersIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import {
  type ConsultarAsignacionSectores,
  type OpcionesPrepararLecturas,
} from "~/types/operaciones";
import { toast } from "sonner";
import api from "~/lib/api";
import { useOperaciones } from "~/hooks/use-operaciones";
import TablaAsignacionSectores from "./tabla-asignacion-sectores";
import { Skeleton } from "~/components/ui/skeleton";
import DialogLecturasPendientes from "./dialog-lecturas-pendientes";

export default function PrepararLecturasComponent() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isResultsOpen, setIsResultsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [asignacionSectores, setAsignacionSectores] = useState<
    ConsultarAsignacionSectores[]
  >([]);
  const [opcionesPrepararLecturas, setOpcionesPrepararLecturas] = useState<
    OpcionesPrepararLecturas[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const {
    consultarPeriodoAbierto: periodoAbierto,
    fetchPeriodoAbierto,
    fetchCiclosFacturacion,
    loadingState,
    consultarSectores,
    fetchConsultarSectores,
    fetchLecturasPendientes,
    lecturasPendientes,
  } = useOperaciones();

  const [cicloSeleccionado, setCicloSeleccionado] = useState<string>("");
  const isPeriodoLoading = loadingState.periodoAbierto.isLoading;
  const isCiclosLoading = loadingState.ciclos.isLoading;
  const _isSectoresLoading = loadingState.consultarSectores.isLoading;
  const isLecturasPendientesLoading = loadingState.lecturasPendientes.isLoading;
  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      return `${mes.toString().padStart(2, "0")}${anio.toString()}`;
    }
    return "";
  }, [periodoAbierto]);

  const fetchOpcionesPrepararLecturas = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append("control", "1");
      const response = await api.get("/opciones-preparar-lecturas", {
        params,
      });
      setOpcionesPrepararLecturas(response.data as OpcionesPrepararLecturas[]);
    } catch (error: any) {
      console.error(
        "Error al consultar opciones de preparación de lecturas:",
        error
      );
      toast.error("Error al consultar opciones de preparación de lecturas");
    }
  }, []);

  // Cargar datos al inicio
  useEffect(() => {
    // Cargamos periodos, ciclos y sectores
    fetchPeriodoAbierto();
    fetchCiclosFacturacion();
    fetchOpcionesPrepararLecturas();
    fetchConsultarSectores();
    fetchLecturasPendientes();
  }, [
    fetchPeriodoAbierto,
    fetchCiclosFacturacion,
    fetchConsultarSectores,
    fetchLecturasPendientes,
    fetchOpcionesPrepararLecturas,
  ]);

  // Función para verificar si el ciclo seleccionado es válido para el mes actual
  const esCicloValido = useMemo(() => {
    if (!periodoAbierto || periodoAbierto.length === 0) return true;
    const mes = periodoAbierto[0].mes;

    // Convertimos el cicloSeleccionado a un valor numérico para comparación
    const cicloNum = parseInt(cicloSeleccionado, 10);

    // Si es febrero y el ciclo corresponde al día 30, no es válido
    return !(mes === 2 && (cicloNum === 2 || cicloNum === 3));
  }, [periodoAbierto, cicloSeleccionado]);

  const obtenerCicloParaAPI = (idCiclo: string): string => {
    if (!opcionesPrepararLecturas || opcionesPrepararLecturas.length === 0) {
      return idCiclo === "1" ? "1" : "2";
    }

    const opcionSeleccionada = opcionesPrepararLecturas.find(
      (opcion) => opcion.id.toString() === idCiclo
    );

    if (!opcionSeleccionada) {
      console.warn(`No se encontró la opción con ID ${idCiclo}`);
      return idCiclo;
    }

    const descripcion = opcionSeleccionada.descripcion.toLowerCase();

    if (descripcion.includes("15") || opcionSeleccionada.id === 1) {
      return "1";
    } else if (
      descripcion.includes("30") ||
      descripcion.includes("fin de mes") ||
      opcionSeleccionada.id === 2 ||
      opcionSeleccionada.id === 3
    ) {
      return "2";
    }

    console.warn(
      `No se pudo determinar el ciclo para API a partir de: ${descripcion}`
    );
    return opcionSeleccionada.id.toString();
  };

  // Función para realizar la búsqueda
  const handleSearch = async () => {
    if (!periodoFormateado) {
      toast.error("No hay un periodo abierto disponible");
      return;
    }

    if (!cicloSeleccionado) {
      toast.error("Debe seleccionar un ciclo de facturación");
      return;
    }

    /* if (!esCicloValido) {
      toast.error('El ciclo seleccionado no es válido para este mes')
      return
    } */

    try {
      setIsLoading(true);
      setError(null);

      // Obtenemos el valor del ciclo para la API
      const cicloParaAPI = obtenerCicloParaAPI(cicloSeleccionado);

      const params = new URLSearchParams();
      params.append("cicloFacturable", cicloParaAPI);
      params.append("periodo", periodoFormateado);

      const response = await api.get("/consultar-asignacion-sectores", {
        params,
      });

      if (response.data && Array.isArray(response.data)) {
        setAsignacionSectores(response.data as ConsultarAsignacionSectores[]);
        if (response.data.length === 0) {
          toast.info(
            "No se encontraron resultados para los criterios seleccionados"
          );
        } else {
          toast.success(`Se encontraron ${response.data.length} sectores`);
          // Aseguramos que el panel de resultados esté abierto
          setIsResultsOpen(true);
        }
      } else {
        setAsignacionSectores([]);
        setError("Formato de respuesta inesperado");
        toast.error("Error al procesar la respuesta del servidor");
      }
    } catch (error: any) {
      console.error("Error al consultar asignación de sectores:", error);
      setAsignacionSectores([]);

      if (error.response) {
        setError(
          `Error ${error.response.status}: ${
            error.response.data?.mensaje || "Error en la consulta"
          }`
        );
        toast.error(
          `Error ${error.response.status}: ${
            error.response.data?.mensaje || "Error en la consulta"
          }`
        );
      } else if (error.request) {
        setError("No se recibió respuesta del servidor");
        toast.error("No se recibió respuesta del servidor");
      } else {
        setError(`Error: ${error.message}`);
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCicloSeleccionado("");
    setAsignacionSectores([]);
    setError(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Preparar Lecturas
          </h1>
          <p className="text-muted-foreground">
            Preparación y asignación de lecturas para el periodo actual
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DialogLecturasPendientes
            data={lecturasPendientes || undefined}
            isLoading={isLecturasPendientesLoading}
            onRefresh={fetchLecturasPendientes}
          />
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
                        Selecciona criterios para preparar lecturas
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
                          {opcionesPrepararLecturas &&
                            opcionesPrepararLecturas.map((opcion) => (
                              <SelectItem
                                key={opcion.id}
                                value={opcion.id.toString()}
                              >
                                {opcion.descripcion}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                    {/* {!esCicloValido && cicloSeleccionado && (
                      <p className="text-xs text-red-500 mt-1">
                        Este ciclo no es válido para el mes actual
                      </p>
                    )} */}
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

        {/* Columna derecha: Resultados de la búsqueda */}
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
                      <UsersIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                        Asignación de Sectores
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {asignacionSectores.length > 0
                          ? `${asignacionSectores.length} sectores encontrados`
                          : "No hay sectores asignados"}
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
                          Buscando sectores...
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
                  ) : (
                    <TablaAsignacionSectores
                      data={asignacionSectores}
                      isLoading={isLoading}
                      isAuthorized={true}
                      sectores={consultarSectores}
                      periodo={periodoFormateado}
                      cicloFacturable={obtenerCicloParaAPI(cicloSeleccionado)}
                    />
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
