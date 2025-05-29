/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { columns } from "./columns";
import { DataTable } from "~/components/operaciones/periodo-facturacion/data-table";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import {
  PlusCircleIcon,
  CalendarDaysIcon,
  CalendarRangeIcon,
  Eraser,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import DialogAbrirPeriodo from "./dialog-abrir-periodo";
import type { Periodos } from "~/types/operaciones";
import { useOperaciones } from "~/hooks/use-operaciones";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ScrollArea } from "~/components/ui/scroll-area";
import DialogInformacion from "./dialog-informacion";
export default function AbrirPeriodoFacturacion() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPeriodos, setFilteredPeriodos] = useState<Periodos[]>([]);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isResultsOpen, setIsResultsOpen] = useState(true);

  // Usar el hook optimizado
  const {
    consultaAnio,
    periodosFacturacion,
    fetchAnios,
    fetchPeriodosFacturacion,
    isLoading,
  } = useOperaciones();

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

  // Cargar los datos iniciales usando el hook
  useEffect(() => {
    fetchAnios();
    fetchPeriodosFacturacion();
  }, [fetchAnios, fetchPeriodosFacturacion]);

  const handleClearFilters = () => {
    setSelectedMonth("");
    setSelectedYear("");
    setData(null);
    setSearchTerm("");
    fetchPeriodosFacturacion();
    setIsFiltersOpen(true);
    toast.success("Filtros limpiados");
  };

  // Nueva función para filtrar periodos
  const filterPeriodos = (data: Periodos[]) => {
    if (!searchTerm) return data;

    return data.filter(
      (periodo) =>
        periodo.pf_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        periodo.pf_descripcion
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        periodo.Column1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        periodo.Column2.toLowerCase().includes(searchTerm.toLowerCase()) ||
        periodo.epf_descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Efecto para actualizar los periodos filtrados
  useEffect(() => {
    const dataToFilter = data || periodosFacturacion;
    setFilteredPeriodos(filterPeriodos(dataToFilter));
  }, [searchTerm, data, periodosFacturacion, filterPeriodos]);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
            Periodos de Facturación
          </h1>
          <DialogInformacion />
        </div>
        <p className="text-muted-foreground">
          Gestiona los periodos de facturación del sistema
        </p>
      </div>

      {/* Sección principal dividida en dos bloques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Filtros y acciones */}
        <div className="lg:col-span-1 space-y-6">
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
                      <CalendarDaysIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                        Añadir Nuevo Periodo
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Selecciona criterios para añadir un nuevo periodo
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
                  {/* Mes de Inicio */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="mes-inicio"
                      className="text-muted-foreground"
                    >
                      Mes de Inicio
                    </Label>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger id="mes-inicio" className="w-full">
                        <SelectValue placeholder="Selecciona un Mes" />
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
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-muted-foreground">
                      Año
                    </Label>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger id="year" className="w-full">
                        <SelectValue placeholder="Selecciona el Año" />
                      </SelectTrigger>
                      <SelectContent>
                        {consultaAnio && consultaAnio.length > 0 ? (
                          consultaAnio.map((year) => (
                            <SelectItem
                              key={year.idaño}
                              value={year.año.toString()}
                            >
                              {year.año}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="2023">2023</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-2 justify-between">
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
                      variant="default"
                      onClick={() => setIsOpenDialog(true)}
                      disabled={isLoading || !selectedMonth || !selectedYear}
                      className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                    >
                      <PlusCircleIcon className="h-4 w-4" />
                      Abrir Periodo
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Columna derecha: Tabla de resultados */}
        <div className="lg:col-span-2">
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
                      <CalendarRangeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                        Periodos de Facturación
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {filteredPeriodos.length > 0
                          ? `${filteredPeriodos.length} periodos`
                          : "No hay periodos"}
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
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    <DataTable columns={columns} data={filteredPeriodos} />
                  </ScrollArea>
                </CardContent>

                {filteredPeriodos.length > 0 && (
                  <CardFooter className="border-t border-border/60 p-4 bg-muted/30 flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {filteredPeriodos.length} periodos
                    </div>
                  </CardFooter>
                )}
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>

      {/* Dialog para abrir periodo */}
      <DialogAbrirPeriodo
        open={isOpenDialog}
        onOpenChange={setIsOpenDialog}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSuccess={fetchPeriodosFacturacion}
      />
    </div>
  );
}
