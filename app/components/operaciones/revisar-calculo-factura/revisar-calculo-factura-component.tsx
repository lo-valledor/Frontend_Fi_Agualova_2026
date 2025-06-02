import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { useOperaciones } from "~/hooks/use-operaciones";
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
  InfoIcon,
  FileTextIcon,
  SettingsIcon,
} from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import api from "~/lib/api";
import { DataTable } from "./data-table";
import { columns } from "./columnsPrecalculo";
import {
  type CalculoPrefacturaDetalle,
  type CalculoPrefacturaEncabezado,
} from "~/types/operaciones";

export default function RevisarCalculoFacturaComponent() {
  // Estados para el formulario
  const [cicloId, setCicloId] = useState<string>("");
  const [modo, setModo] = useState<string>("1");
  const [rutCliente, setRutCliente] = useState<string>("");
  const [nombreCliente, setNombreCliente] = useState<string>("");
  const [local, setLocal] = useState<string>("");
  const [sector, setSector] = useState<string>("");

  // Estados de UI
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CalculoPrefacturaDetalle[]>([]);

  // Obtención de datos del hook useOperaciones
  const {
    consultarPeriodoAbierto: periodoAbierto,
    fetchPeriodoAbierto,
    fetchCiclosFacturacion,
    loadingState,
    ciclosFacturacionActivos,
  } = useOperaciones();

  // Estados de carga
  const isPeriodoLoading = loadingState.periodoAbierto.isLoading;
  const isCiclosLoading = loadingState.ciclos.isLoading;

  // Formateo del periodo para la API (MMAAAA)
  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      return `${mes.toString().padStart(2, "0")}${anio.toString()}`;
    }
    return "";
  }, [periodoAbierto]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchPeriodoAbierto();
    fetchCiclosFacturacion();
  }, [fetchPeriodoAbierto, fetchCiclosFacturacion]);

  // Función para convertir el ciclo seleccionado al formato esperado por la API
  const obtenerCicloParaAPI = (cicloId: string): string => {
    // Si el ciclo es la cadena "1" o "2", lo devolvemos tal cual
    if (cicloId === "1" || cicloId === "2") {
      return cicloId;
    }

    // Si el ciclo contiene "15", devolvemos "1"
    if (cicloId.includes("15")) {
      return "1";
    }

    // Si el ciclo contiene "30", devolvemos "2"
    if (cicloId.includes("30")) {
      return "2";
    }

    // Por defecto, devolvemos el ciclo original
    console.warn(
      `No se pudo determinar el ciclo para API a partir de: ${cicloId}`
    );
    return cicloId;
  };

  // Función para manejar la búsqueda/revisión
  const handleRevisarCalculo = async () => {
    if (!periodoFormateado) {
      toast.error("No hay un periodo abierto disponible");
      return;
    }

    if (!cicloId) {
      toast.error("Debe seleccionar un ciclo de facturación");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Construir parámetros obligatorios
      const params = new URLSearchParams();

      // Convertir el cicloId al formato esperado por la API
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);

      params.append("cicloId", cicloParaAPI);
      params.append("periodo", periodoFormateado);
      params.append("modo", modo);

      // Añadir parámetros opcionales si tienen valor
      if (rutCliente) params.append("rutCliente", rutCliente);
      if (nombreCliente) params.append("nombreCliente", nombreCliente);
      if (local) params.append("local", local);
      if (sector) params.append("sector", sector);

      const response = await api.get("/calculo-prefactura-encabezado", {
        params: {
          cicloId: cicloParaAPI,
          periodo: periodoFormateado,
          modo,
          ...(rutCliente && { rutCliente }),
          ...(nombreCliente && { nombreCliente }),
          ...(local && { local }),
          ...(sector && { sector }),
        },
      });

      // Casting de la respuesta al tipo correcto
      const data = response.data as CalculoPrefacturaEncabezado;

      if (data && data.resultados && Array.isArray(data.resultados)) {
        setData(data.resultados);
        if (data.resultados.length === 0) {
          toast.info(
            "No se encontraron resultados para los criterios seleccionados"
          );
        } else {
          toast.success(`Se encontraron ${data.resultados.length} registros`);
        }
      } else {
        setData([]);
        setError("Formato de respuesta inesperado");
        toast.error("Error al procesar la respuesta del servidor");
      }
    } catch (error: any) {
      console.error("Error al revisar cálculo de factura:", error);
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

  // Función para lanzar el cálculo
  const handleLanzarCalculo = async () => {
    console.log("Lanzando cálculo...");
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setCicloId("");
    setModo("1");
    setRutCliente("");
    setNombreCliente("");
    setLocal("");
    setSector("");
    setError(null);
    setData([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Revisar Cálculo Factura
          </h1>
          <p className="text-muted-foreground">
            Revisa y verifica los cálculos de facturación para los clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Sección principal con filtros */}
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
                    Listado de Precalculos
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Revisa los precalculos de facturación
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Periodo */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
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
                  <Label
                    htmlFor="ciclo"
                    className="text-muted-foreground flex items-center gap-2"
                  >
                    <FileTextIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    Ciclo de facturación
                  </Label>
                  {isCiclosLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <Select value={cicloId} onValueChange={setCicloId}>
                      <SelectTrigger id="ciclo" className="w-full">
                        <SelectValue placeholder="Selecciona un ciclo" />
                      </SelectTrigger>
                      <SelectContent>
                        {ciclosFacturacionActivos &&
                        ciclosFacturacionActivos.length > 0 ? (
                          ciclosFacturacionActivos.map((ciclo) => {
                            // Determinar el valor correcto para el API (1 o 2)
                            let valorCiclo = "1";
                            if (
                              ciclo.diaFacturacion === "30" ||
                              ciclo.descripcion.includes("30")
                            ) {
                              valorCiclo = "2";
                            }

                            return (
                              <SelectItem
                                key={ciclo.diaFacturacion}
                                value={valorCiclo}
                              >
                                {ciclo.descripcion}
                              </SelectItem>
                            );
                          })
                        ) : (
                          <>
                            <SelectItem value="1">Ciclo dia 15</SelectItem>
                            <SelectItem value="2">Ciclo dia 30</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Modo de facturación */}
                <div className="space-y-2">
                  <Label
                    htmlFor="modo"
                    className="text-muted-foreground flex items-center gap-2"
                  >
                    <SettingsIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    Modo de facturación
                  </Label>
                  <Select value={modo} onValueChange={setModo}>
                    <SelectTrigger id="modo" className="w-full">
                      <SelectValue placeholder="Selecciona un modo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Modo 1</SelectItem>
                      <SelectItem value="2">Modo 2</SelectItem>
                      <SelectItem value="3">Modo 3</SelectItem>
                      <SelectItem value="4">Modo 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 pt-4 border-t border-border/40 mt-4">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Eraser className="h-4 w-4" />
                  Limpiar
                </Button>
                <Button
                  onClick={handleLanzarCalculo}
                  disabled={isLoading || !cicloId || !periodoFormateado}
                  className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  <SearchIcon className="h-4 w-4" />
                  {isLoading ? "Buscando..." : "Revisar cálculo"}
                </Button>
                <Button
                  onClick={handleRevisarCalculo}
                  disabled={isLoading || !cicloId || !periodoFormateado}
                  className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  <SearchIcon className="h-4 w-4" />
                  {isLoading ? "Buscando..." : "Revisar cálculo"}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Resultados de la búsqueda */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-5 border-b border-border/60 bg-muted/40">
          <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
            Resultados de la búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-sm">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-12 w-12 rounded-full" />
                <p className="text-muted-foreground animate-pulse">
                  Cargando resultados...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-md bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400">
              <div className="flex items-start gap-2">
                <AlertCircleIcon className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-medium">Error al cargar los datos</p>
                  <p className="mt-1">{error}</p>
                </div>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
              <SearchIcon className="h-10 w-10 stroke-1" />
              <p>
                Ingresa los criterios de búsqueda y haz clic en "Revisar
                cálculo"
              </p>
            </div>
          ) : (
            <DataTable columns={columns} data={data} />
          )}
        </CardContent>
      </Card>

      {/* Tarjeta de información */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-5 border-b border-border/60 bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shadow-sm">
              <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                Información sobre modos de facturación
              </CardTitle>
              <CardDescription className="text-sm">
                Descripción de los diferentes modos disponibles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Badge
                variant="outline"
                className="mt-0.5 bg-sky-50 text-sky-600 border-sky-200"
              >
                Modo 1
              </Badge>
              <p className="text-muted-foreground">
                Cálculo estándar de facturación
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge
                variant="outline"
                className="mt-0.5 bg-green-50 text-green-600 border-green-200"
              >
                Modo 2
              </Badge>
              <p className="text-muted-foreground">
                Cálculo con tarifas especiales
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge
                variant="outline"
                className="mt-0.5 bg-amber-50 text-amber-600 border-amber-200"
              >
                Modo 3
              </Badge>
              <p className="text-muted-foreground">
                Cálculo para entidades gubernamentales
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Badge
                variant="outline"
                className="mt-0.5 bg-purple-50 text-purple-600 border-purple-200"
              >
                Modo 4
              </Badge>
              <p className="text-muted-foreground">
                Cálculo para grandes clientes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
