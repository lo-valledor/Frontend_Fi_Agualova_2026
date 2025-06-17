import React, { useState, useMemo } from 'react';
import type { GetCondicionesContrato } from '~/types/administracion';
import { DataTable } from '../../data-table/data-table';
import { columns } from './columns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  FileText,
  UserCheck,
  RefreshCw,
  SearchIcon,
  Building,
  Filter,
  X,
  Download,
  Calculator,
  DollarSign,
} from 'lucide-react';

export default function CondicionesContratoComponent({
  condicionesContrato,
}: {
  condicionesContrato: GetCondicionesContrato[];
}) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedConcepto, setSelectedConcepto] = useState<string>('todos');
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');
  const [selectedTipoValor, setSelectedTipoValor] = useState<string>('todos');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Obtener valores únicos para filtros
  const conceptosUnicos = [
    ...new Set(condicionesContrato.map((c) => c.concepto)),
  ]
    .filter(Boolean)
    .sort();

  // Filtrar condiciones de contrato en tiempo real
  const filteredCondiciones = useMemo(() => {
    return condicionesContrato.filter((condicion) => {
      // Filtro de búsqueda por texto
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        condicion.descripcion.toLowerCase().includes(searchLower) ||
        condicion.concepto.toLowerCase().includes(searchLower) ||
        condicion.factorPorcentual.toLowerCase().includes(searchLower) ||
        (condicion.valorFijo &&
          condicion.valorFijo.toString().includes(searchLower));

      // Filtro por concepto
      const matchesConcepto =
        selectedConcepto === 'todos' || condicion.concepto === selectedConcepto;

      // Filtro por estado
      const matchesEstado =
        selectedEstado === 'todos' ||
        (selectedEstado === 'activo' && condicion.estado) ||
        (selectedEstado === 'inactivo' && !condicion.estado);

      // Filtro por tipo de valor
      const matchesTipoValor =
        selectedTipoValor === 'todos' ||
        (selectedTipoValor === 'porcentual' &&
          condicion.factorPorcentual !== '0') ||
        (selectedTipoValor === 'fijo' &&
          condicion.valorFijo !== null &&
          condicion.valorFijo > 0) ||
        (selectedTipoValor === 'sin_valor' &&
          (condicion.valorFijo === null || condicion.valorFijo === 0) &&
          condicion.factorPorcentual === '0');

      return (
        matchesSearch && matchesConcepto && matchesEstado && matchesTipoValor
      );
    });
  }, [
    condicionesContrato,
    searchTerm,
    selectedConcepto,
    selectedEstado,
    selectedTipoValor,
  ]);

  // Estadísticas de condiciones de contrato
  const condicionesActivas = condicionesContrato.filter((c) => c.estado).length;
  const condicionesInactivas = condicionesContrato.filter(
    (c) => !c.estado,
  ).length;
  const totalCondiciones = condicionesContrato.length;
  const condicionesPorcentuales = condicionesContrato.filter(
    (c) => c.factorPorcentual !== '0',
  ).length;
  const condicionesFijas = condicionesContrato.filter(
    (c) => c.valorFijo !== null && c.valorFijo > 0,
  ).length;

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
      console.log('Exportando condiciones de contrato a Excel...');
    } finally {
      setIsExporting(false);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedConcepto('todos');
    setSelectedEstado('todos');
    setSelectedTipoValor('todos');
  };

  const hasActiveFilters =
    searchTerm ||
    selectedConcepto !== 'todos' ||
    selectedEstado !== 'todos' ||
    selectedTipoValor !== 'todos';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Condiciones de Contrato
          </h1>
          <p className="text-muted-foreground">
            Gestión de condiciones y parámetros de facturación del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
          >
            Total: {totalCondiciones} condiciones
          </Badge>
        </div>
      </div>

      {/* Tabla de condiciones de contrato */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                <FileText className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Lista de Condiciones de Contrato
                </CardTitle>
                <CardDescription className="text-sm">
                  {filteredCondiciones.length > 0
                    ? `${filteredCondiciones.length} condiciones ${
                        hasActiveFilters ? 'filtradas' : 'registradas'
                      } en el sistema`
                    : 'No hay condiciones de contrato registradas'}
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
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {condicionesContrato.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <FileText className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  No hay condiciones de contrato disponibles
                </p>
                <p className="text-sm mt-1">
                  Las condiciones aparecerán aquí cuando estén disponibles
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
                    placeholder="🔍 Buscar por descripción, concepto, factor o valor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                  />
                  {searchTerm && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                      {filteredCondiciones.length} de{' '}
                      {condicionesContrato.length}
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
                          {
                            [
                              searchTerm,
                              selectedConcepto !== 'todos',
                              selectedEstado !== 'todos',
                              selectedTipoValor !== 'todos',
                            ].filter(Boolean).length
                          }{' '}
                          activos
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
                      <Select
                        value={selectedEstado}
                        onValueChange={setSelectedEstado}
                      >
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
                              Activos ({condicionesActivas})
                            </div>
                          </SelectItem>
                          <SelectItem value="inactivo">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-rose-500" />
                              Inactivos ({condicionesInactivas})
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por concepto */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        Concepto
                      </label>
                      <Select
                        value={selectedConcepto}
                        onValueChange={setSelectedConcepto}
                      >
                        <SelectTrigger className="h-9 text-sm border-slate-300 focus:border-sky-400 focus:ring-sky-400/20">
                          <SelectValue placeholder="Concepto..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">
                            <div className="flex items-center gap-2">
                              <Building className="h-3 w-3 text-slate-500" />
                              Todos los conceptos
                            </div>
                          </SelectItem>
                          {conceptosUnicos.map((concepto) => (
                            <SelectItem key={concepto} value={concepto}>
                              <div className="flex items-center gap-2">
                                <Building className="h-3 w-3 text-amber-500" />
                                {concepto} (
                                {
                                  condicionesContrato.filter(
                                    (c) => c.concepto === concepto,
                                  ).length
                                }
                                )
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por tipo de valor */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Calculator className="h-3 w-3" />
                        Tipo de Valor
                      </label>
                      <Select
                        value={selectedTipoValor}
                        onValueChange={setSelectedTipoValor}
                      >
                        <SelectTrigger className="h-9 text-sm border-slate-300 focus:border-sky-400 focus:ring-sky-400/20">
                          <SelectValue placeholder="Tipo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">
                            <div className="flex items-center gap-2">
                              <Calculator className="h-3 w-3 text-slate-500" />
                              Todos los tipos
                            </div>
                          </SelectItem>
                          <SelectItem value="porcentual">
                            <div className="flex items-center gap-2">
                              <Calculator className="h-3 w-3 text-purple-500" />
                              Porcentual ({condicionesPorcentuales})
                            </div>
                          </SelectItem>
                          <SelectItem value="fijo">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-emerald-500" />
                              Valor Fijo ({condicionesFijas})
                            </div>
                          </SelectItem>
                          <SelectItem value="sin_valor">
                            <div className="flex items-center gap-2">
                              <X className="h-3 w-3 text-slate-500" />
                              Sin Valor (
                              {totalCondiciones -
                                condicionesPorcentuales -
                                condicionesFijas}
                              )
                            </div>
                          </SelectItem>
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
                          {filteredCondiciones.length} condiciones
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
                    {filteredCondiciones.length} condiciones{' '}
                    {hasActiveFilters
                      ? `encontradas de ${condicionesContrato.length} total`
                      : 'disponibles'}
                  </span>
                  {hasActiveFilters && (
                    <Badge variant="outline" className="text-xs">
                      Filtrado
                    </Badge>
                  )}
                </div>
              </div>

              <DataTable columns={columns} data={filteredCondiciones} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
