import React, { useState, useMemo } from "react";
import type { ContratosDisponibles, GetContratos } from "~/types/administracion";
import { DataTable } from "../../data-table/data-table";
import { columns } from "./columns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  FileText,
  UserCheck,
  UserX,
  RefreshCw,
  SearchIcon,
  Building,
  Filter,
  X,
  Download,
  Calendar,
  Zap,
  Shield,
} from "lucide-react";

export default function ContratosComponent({
  contratos,
}: {
  contratos: GetContratos[];
}) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCiclo, setSelectedCiclo] = useState<string>("todos");
  const [selectedTarifa, setSelectedTarifa] = useState<string>("todos");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Obtener valores únicos para filtros
  const ciclosUnicos = [...new Set(contratos.map((c) => c.cicloFacturacion))].filter(Boolean).sort();
  const tarifasUnicas = [...new Set(contratos.map((c) => c.tarifa))].filter(Boolean).sort();

  // Filtrar contratos en tiempo real
  const filteredContratos = useMemo(() => {
    return contratos.filter((contrato) => {
      // Filtro de búsqueda por texto
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || (
        contrato.codigoContrato.toLowerCase().includes(searchLower) ||
        contrato.acometida.toLowerCase().includes(searchLower) ||
        contrato.tipoContrato.toLowerCase().includes(searchLower) ||
        contrato.tarifa.toLowerCase().includes(searchLower) ||
        contrato.nombrePropietario.toLowerCase().includes(searchLower) ||
        contrato.nombreCliente.toLowerCase().includes(searchLower) ||
        contrato.local.toLowerCase().includes(searchLower) ||
        contrato.fechaInicio.toLowerCase().includes(searchLower) ||
        contrato.fechaTermino.toLowerCase().includes(searchLower) ||
        contrato.comunaEnvio.toLowerCase().includes(searchLower) ||
        contrato.direccionEnvio.toLowerCase().includes(searchLower) ||
        contrato.promedioAnual.toLowerCase().includes(searchLower) ||
        contrato.cicloFacturacion.toLowerCase().includes(searchLower) ||
        contrato.potenciaContratada.toLowerCase().includes(searchLower)
      );

      // Filtro por ciclo de facturación
      const matchesCiclo = selectedCiclo === "todos" || contrato.cicloFacturacion === selectedCiclo;

      // Filtro por tarifa
      const matchesTarifa = selectedTarifa === "todos" || contrato.tarifa === selectedTarifa;

      // Filtro por estado
      const matchesEstado = selectedEstado === "todos" ||
        (selectedEstado === "activo" && contrato.activo) ||
        (selectedEstado === "inactivo" && !contrato.activo);

      return matchesSearch && matchesCiclo && matchesTarifa && matchesEstado;
    });
  }, [contratos, searchTerm, selectedCiclo, selectedTarifa, selectedEstado]);

  // Estadísticas de contratos
  const contratosActivos = contratos.filter((c) => c.activo).length;
  const contratosInactivos = contratos.filter((c) => !c.activo).length;
  const totalContratos = contratos.length;
  const tiposContrato = [...new Set(contratos.map((c) => c.tipoContrato))].length;

  // Funciones de manejo
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular refresh - en una app real esto triggearía el refetch
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // Aquí iría la lógica de exportación
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Simular descarga
      console.log("Exportando contratos a Excel...");
    } finally {
      setIsExporting(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCiclo("todos");
    setSelectedTarifa("todos");
    setSelectedEstado("todos");
  };

  const hasActiveFilters = searchTerm || selectedCiclo !== "todos" || selectedTarifa !== "todos" || selectedEstado !== "todos";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Gestión de Contratos
          </h1>
          <p className="text-muted-foreground">
            Administra contratos, clientes y propiedades del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
          >
            Total: {totalContratos} contratos
          </Badge>
        </div>
      </div>
      {/* Tabla de contratos */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Lista de Contratos
                </CardTitle>
                <CardDescription className="text-sm">
                  {filteredContratos.length > 0
                    ? `${filteredContratos.length} contratos ${
                        hasActiveFilters ? "filtrados" : "registrados"
                      } en el sistema`
                    : "No hay contratos registrados"}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                disabled={isExporting}
                className="gap-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
              >
                {isExporting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Excel
              </Button>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="gap-2 hover:bg-muted/50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {contratos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <FileText className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  No hay contratos disponibles
                </p>
                <p className="text-sm mt-1">
                  Los contratos aparecerán aquí cuando estén disponibles
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sección de filtros y búsqueda */}
              <div className="space-y-4">
                {/* Barra de búsqueda */}
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="🔍 Buscar por contrato, cliente, propietario, dirección..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                  />
                  {searchTerm && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                      {filteredContratos.length} de {contratos.length}
                    </div>
                  )}
                </div>

                {/* Filtros avanzados */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Filtros Avanzados
                      </span>
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="text-xs">
                          {[searchTerm, selectedCiclo !== "todos", selectedTarifa !== "todos", selectedEstado !== "todos"].filter(Boolean).length} activos
                        </Badge>
                      )}
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <X className="h-3 w-3" />
                        Limpiar filtros
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Filtro por estado */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        Estado
                      </label>
                      <Select value={selectedEstado} onValueChange={setSelectedEstado}>
                        <SelectTrigger className="h-9 text-sm border-slate-300 focus:border-sky-400 focus:ring-sky-400/20">
                          <SelectValue placeholder="Estado..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-400" />
                              Todos los estados
                            </div>
                          </SelectItem>
                          <SelectItem value="activo">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500" />
                              Activos ({contratosActivos})
                            </div>
                          </SelectItem>
                          <SelectItem value="inactivo">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-rose-500" />
                              Inactivos ({contratosInactivos})
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por ciclo de facturación */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Ciclo Facturación
                      </label>
                      <Select value={selectedCiclo} onValueChange={setSelectedCiclo}>
                        <SelectTrigger className="h-9 text-sm border-slate-300 focus:border-sky-400 focus:ring-sky-400/20">
                          <SelectValue placeholder="Ciclo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-slate-500" />
                              Todos los ciclos
                            </div>
                          </SelectItem>
                          {ciclosUnicos.map((ciclo) => (
                            <SelectItem key={ciclo} value={ciclo}>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-blue-500" />
                                {ciclo} ({contratos.filter(c => c.cicloFacturacion === ciclo).length})
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por tarifa */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Tarifa
                      </label>
                      <Select value={selectedTarifa} onValueChange={setSelectedTarifa}>
                        <SelectTrigger className="h-9 text-sm border-slate-300 focus:border-sky-400 focus:ring-sky-400/20">
                          <SelectValue placeholder="Tarifa..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">
                            <div className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-slate-500" />
                              Todas las tarifas
                            </div>
                          </SelectItem>
                          {tarifasUnicas.map((tarifa) => {
                            const count = contratos.filter(c => c.tarifa === tarifa).length;
                            const colorClass = tarifa === "BT-1" ? "text-purple-500" :
                                             tarifa === "BT-2" ? "text-red-500" : "text-green-500";
                            return (
                              <SelectItem key={tarifa} value={tarifa}>
                                <div className="flex items-center gap-2">
                                  <Shield className={`h-3 w-3 ${colorClass}`} />
                                  {tarifa} ({count})
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Estadísticas de filtrado */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Resultados
                      </label>
                      <div className="h-9 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {filteredContratos.length} contratos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de resultados */}
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                    <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    {filteredContratos.length} contratos{" "}
                    {hasActiveFilters
                      ? `encontrados de ${contratos.length} total`
                      : "disponibles"}
                  </span>
                  {hasActiveFilters && (
                    <Badge variant="outline" className="text-xs">
                      Filtrado
                    </Badge>
                  )}
                </div>
              </div>

              <DataTable columns={columns} data={filteredContratos} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
