import React, { useEffect, useState } from "react";
import { columns } from "./columns-enerlova";
import api from "~/lib/api";
import { Button } from "~/components/ui/button";
import {
  CalendarIcon,
  SearchIcon,
  DollarSignIcon,
  BarChartIcon,
  Eraser,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { columns as columnsEnel } from "./columns-enel";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type {
  PreciosCargoEnel,
  PreciosCargoEnerlova,
} from "~/types/operaciones";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { toast } from "sonner";
import { DataTable } from "./data-table";

export default function PreciosCargoComponent() {
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // +1 porque getMonth() devuelve 0-11
  const currentYear = currentDate.getFullYear().toString();

  const [dataEnel, setDataEnel] = useState<PreciosCargoEnel[]>([]);
  const [dataEnerlova, setDataEnerlova] = useState<PreciosCargoEnerlova[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mes, setMes] = useState(currentMonth);
  const [anio, setAnio] = useState(currentYear);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isEnelOpen, setIsEnelOpen] = useState(true);
  const [isEnerlovaOpen, setIsEnerlovaOpen] = useState(true);

  const months = [
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  useEffect(() => {
    // Cargar datos de Enerlova
    fetchData();

    // Realizar búsqueda inicial con mes y año actual
    handleInitialSearch();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/consulta-precio-pago-tabla");
      setDataEnerlova(response.data as PreciosCargoEnerlova[]);
    } catch (error) {
      console.error("Error al obtener datos de Enerlova:", error);
      toast.error("Error al cargar datos de Enerlova");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para la búsqueda inicial automática
  const handleInitialSearch = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        mes: currentMonth,
        año: currentYear,
      });
      const response = await api.get("/consulta-precio-pago", {
        params,
      });
      setDataEnel(response.data as PreciosCargoEnel[]);
    } catch (error) {
      console.error("Error al realizar búsqueda inicial:", error);
      toast.error("Error al cargar datos iniciales");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        mes: mes,
        año: anio,
      });
      const response = await api.get("/consulta-precio-pago", {
        params,
      });
      setDataEnel(response.data as PreciosCargoEnel[]);
      toast.success("Búsqueda completada");
    } catch (error) {
      console.error("Error al buscar precios de cargo:", error);
      toast.error("Error al buscar precios de cargo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setMes(currentMonth);
    setAnio(currentYear);
    handleInitialSearch();
    toast.success("Filtros reiniciados");
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
          Precios de Cargo
        </h1>
        <p className="text-muted-foreground">
          Gestión de precios de cargo desde compañías de electricidad
        </p>
      </div>

      {/* Filtros */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border shadow-sm">
                  <SearchIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Filtros de búsqueda
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Selecciona el periodo para consultar los precios de cargo de
                    Enel
                  </CardDescription>
                </div>
              </div>
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
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 md:p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-5">
                {/* Mes */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="mes"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" /> Mes
                  </Label>
                  <Select value={mes} onValueChange={setMes}>
                    <SelectTrigger
                      id="mes"
                      className="w-full bg-background border-border/70"
                    >
                      <SelectValue placeholder="Selecciona un mes" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Año */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="anio"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <CalendarIcon className="h-3.5 w-3.5" /> Año
                  </Label>
                  <Select value={anio} onValueChange={setAnio}>
                    <SelectTrigger
                      id="anio"
                      className="w-full bg-background border-border/70"
                    >
                      <SelectValue placeholder="Selecciona un año" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  size="sm"
                >
                  <Eraser className="h-4 w-4" />
                  Limpiar filtros
                </Button>
                <Button
                  variant="default"
                  onClick={handleSearch}
                  disabled={isLoading}
                  size="sm"
                  className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  <SearchIcon className="h-4 w-4" />
                  {isLoading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Precios de Cargo - Enel */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isEnelOpen} onOpenChange={setIsEnelOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg shadow-sm">
                  <DollarSignIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="space-y-0.5">
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Precios de Cargo - Enel
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Precios de cargo desde compañía de electricidad Enel
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                >
                  {months.find((m) => m.value === mes)?.label || "Mes"} {anio}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevenir que el evento se propague al CollapsibleTrigger
                    setIsEnelOpen(!isEnelOpen);
                  }}
                >
                  {isEnelOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Abrir/Cerrar sección Enel</span>
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4 md:p-6">
              <div className="rounded-lg border border-border/60 overflow-hidden shadow-sm bg-background">
                <DataTable
                  columns={columnsEnel(mes, anio, () => {
                    handleSearch();
                  })}
                  data={dataEnel}
                  columnGroups={[
                    {
                      id: "identificacion",
                      title: "Identificación",
                      columns: ["codigo", "codigoener", "descripcion"],
                      className: "bg-zinc-700 text-white",
                    },
                    {
                      id: "valores",
                      title: "Valores Anteriores",
                      columns: ["valor", "valor2", "valor3"],
                      className: "bg-sky-700 text-white",
                    },
                    {
                      id: "valoresActuales",
                      title: "Valores Actuales",
                      columns: ["valoractual", "valoractual2", "valoractual3"],
                      className: "bg-green-700 text-white",
                    },
                  ]}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Precios de Cargo - Enerlova */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isEnerlovaOpen} onOpenChange={setIsEnerlovaOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shadow-sm">
                  <BarChartIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Precios de Cargo - Enerlova
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Precios de cargo desde Enerlova
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                >
                  Precios actuales
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevenir que el evento se propague al CollapsibleTrigger
                    setIsEnerlovaOpen(!isEnerlovaOpen);
                  }}
                >
                  {isEnerlovaOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Abrir/Cerrar sección Enerlova</span>
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="p-4 md:p-6">
              <div className="rounded-lg border border-border/60 overflow-hidden shadow-sm bg-background">
                <DataTable
                  columns={columns}
                  data={dataEnerlova}
                  columnGroups={[
                    {
                      id: "informacion",
                      title: "Información",
                      columns: ["CD_ID", "cd_codigoenerlova", "CD_Descripcion"],
                      className: "bg-zinc-700 text-white",
                    },
                    {
                      id: "valores",
                      title: "Valores",
                      columns: ["valor", "dias"],
                      className: "bg-emerald-700 text-white",
                    },
                    {
                      id: "acciones",
                      title: "Acciones",
                      columns: ["pc_confirmacion"],
                      className: "bg-purple-700 text-white",
                    },
                  ]}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
