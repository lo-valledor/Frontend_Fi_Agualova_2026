import React, { useState, useMemo } from 'react';
import { DataTable } from '~/components/data-table/data-table';
import type {
  Acometida,
  ComboSectores,
  ComboNichos,
  ComboEmpalmes,
  ContratosDisponibles,
} from '~/types/administracion';
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
  Zap,
  RefreshCw,
  SearchIcon,
  Gauge,
  Network,
  FileText,
  Download,
  Plus,
  X,
  Filter,
  UserCheck,
  UserX,
  Building,
} from 'lucide-react';
import { AcometidaForm } from './acometida-form';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

export default function AcometidaComponent({
  acometidas,
  comboEmpalmes,
  comboNichos,
  comboSectores,
  contratosDisponibles,
}: {
  acometidas: Acometida[];
  comboEmpalmes: ComboEmpalmes[];
  comboNichos: ComboNichos[];
  comboSectores: ComboSectores[];
  contratosDisponibles: ContratosDisponibles[];
}) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [selectedEstado, setSelectedEstado] = useState<string>('todos');
  const [selectedComuna, setSelectedComuna] = useState<string>('todos');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [acometidaSeleccionada, setAcometidaSeleccionada] =
    useState<Acometida | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtrar acometidas en tiempo real
  const filteredAcometidas = useMemo(() => {
    return acometidas.filter((acometida) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        acometida.codigo.toString().includes(searchLower) ||
        acometida.ubicacion.toLowerCase().includes(searchLower) ||
        acometida.sectorDescripcion.toLowerCase().includes(searchLower) ||
        acometida.nichoDescripcion.toLowerCase().includes(searchLower) ||
        acometida.empalmeDescripcion.toLowerCase().includes(searchLower);

      const matchesTipo =
        selectedTipo === 'todos' ||
        acometida.sectorDescripcion.toLowerCase() ===
          selectedTipo.toLowerCase();
      const matchesEstado =
        selectedEstado === 'todos' ||
        (selectedEstado === 'activo' && acometida.limitePotencia !== null) ||
        (selectedEstado === 'inactivo' && acometida.limitePotencia === null);

      return matchesSearch && matchesTipo && matchesEstado;
    });
  }, [acometidas, searchTerm, selectedTipo, selectedEstado, selectedComuna]);

  // Obtener valores únicos para los filtros
  const tiposUnicos = useMemo(() => {
    return [...new Set(acometidas.map((a) => a.sectorDescripcion))]
      .filter(Boolean)
      .sort();
  }, [acometidas]);

  const estadosUnicos = useMemo(() => {
    return [...new Set(acometidas.map((a) => a.limitePotencia))].sort();
  }, [acometidas]);

  const comunasUnicas = useMemo(() => {
    return [...new Set(acometidas.map((a) => a.ubicacion))]
      .filter(Boolean)
      .sort();
  }, [acometidas]);

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTipo('todos');
    setSelectedEstado('todos');
    setSelectedComuna('todos');
  };

  // Contar filtros activos
  const activeFiltersCount = [
    searchTerm,
    selectedTipo,
    selectedEstado,
    selectedComuna,
  ].filter(Boolean).length;

  // Estadísticas de acometidas
  const totalAcometidas = acometidas.length;
  const acometidasActivas = acometidas.filter(
    (a) => a.limitePotencia !== null,
  ).length;
  const acometidasInactivas = acometidas.length - acometidasActivas;

  // Handlers para abrir/cerrar modal
  const handleOpenForm = (acometida?: Acometida) => {
    setAcometidaSeleccionada(acometida || null);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setAcometidaSeleccionada(null);
    setIsFormOpen(false);
  };

  // Handler para submit (simulación, reemplazar por lógica real)
  const handleSubmitForm = async (data: any) => {
    setIsLoading(true);
    try {
      // Aquí deberías llamar a tu lógica de crear/editar acometida
      console.log('Datos enviados:', data);
      toast.success('La acometida ha sido guardada correctamente.');
      handleCloseForm();
    } catch (error) {
      console.error('Error al guardar acometida:', error);
      toast.error('Ha ocurrido un error al guardar la acometida.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.info('Actualizando acometidas...');
    // Simular refresh - en una app real esto triggearía el refetch
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Función para exportar Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      toast.info('Generando archivo Excel...');

      // Llamada a la API para exportar
      const response = await fetch('/api/exportar-acometidas', {
        method: 'GET',
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      if (!response.ok) {
        throw new Error('Error al exportar acometidas');
      }

      // Descargar el archivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `acometidas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Archivo Excel descargado correctamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar acometidas a Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Gestión de Acometidas
          </h1>
          <p className="text-muted-foreground">
            Administra acometidas eléctricas, empalmes y ubicaciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
          >
            Total: {totalAcometidas} acometidas
          </Badge>
        </div>
      </div>

      {/* Botón para registrar acometida */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => handleOpenForm()}
          className="gap-2 bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-900/20 dark:hover:bg-sky-800/20"
        >
          <Zap className="h-4 w-4" /> Registrar acometida
        </Button>
      </div>
      {/* Modal de registro/edición */}
      <AcometidaForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        acometida={acometidaSeleccionada}
        isLoading={isLoading}
        comboEmpalmes={comboEmpalmes}
        comboNichos={comboNichos}
        contratosDisponibles={contratosDisponibles}
      />

      {/* Tabla de acometidas */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                <Gauge className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Lista de Acometidas
                </CardTitle>
                <CardDescription className="text-sm">
                  {filteredAcometidas.length > 0
                    ? `${filteredAcometidas.length} acometidas ${
                        activeFiltersCount > 0 ? 'filtradas' : 'registradas'
                      } en el sistema`
                    : 'No hay acometidas registradas'}
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
              <Button
                onClick={() => handleOpenForm()}
                size="sm"
                className="gap-2 bg-sky-600 hover:bg-sky-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Nueva Acometida
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {acometidas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <Gauge className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  No hay acometidas disponibles
                </p>
                <p className="text-sm mt-1">
                  Haz clic en "Nueva Acometida" para agregar la primera
                  acometida
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
                    placeholder="🔍 Buscar por código, tipo, dirección, comuna..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                  />
                  {searchTerm && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                      {filteredAcometidas.length} de {acometidas.length}
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
                      {activeFiltersCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {activeFiltersCount} filtro activo
                        </Badge>
                      )}
                    </div>
                    {activeFiltersCount > 0 && (
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
                              Activas ({acometidasActivas})
                            </div>
                          </SelectItem>
                          <SelectItem value="inactivo">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-rose-500" />
                              Inactivas ({acometidasInactivas})
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por tipo */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Tipo
                      </label>
                      <Select
                        value={selectedTipo}
                        onValueChange={setSelectedTipo}
                      >
                        <SelectTrigger className="h-9 text-sm border-slate-300 focus:border-sky-400 focus:ring-sky-400/20">
                          <SelectValue placeholder="Tipo..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">
                            <div className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-slate-500" />
                              Todos los tipos
                            </div>
                          </SelectItem>
                          {tiposUnicos.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              <div className="flex items-center gap-2">
                                <Zap className="h-3 w-3 text-violet-500" />
                                {tipo} (
                                {
                                  acometidas.filter(
                                    (a) => a.sectorDescripcion === tipo,
                                  ).length
                                }
                                )
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Filtro por comuna */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        Comuna
                      </label>
                      <Select
                        value={selectedComuna}
                        onValueChange={setSelectedComuna}
                      >
                        <SelectTrigger className="h-9 text-sm border-slate-300 focus:border-sky-400 focus:ring-sky-400/20">
                          <SelectValue placeholder="Comuna..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">
                            <div className="flex items-center gap-2">
                              <Building className="h-3 w-3 text-slate-500" />
                              Todas las comunas
                            </div>
                          </SelectItem>
                          {comunasUnicas.map((comuna) => (
                            <SelectItem key={comuna} value={comuna}>
                              <div className="flex items-center gap-2">
                                <Building className="h-3 w-3 text-blue-500" />
                                {comuna} (
                                {
                                  acometidas.filter(
                                    (a) => a.ubicacion === comuna,
                                  ).length
                                }
                                )
                              </div>
                            </SelectItem>
                          ))}
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
                          {filteredAcometidas.length} acometidas
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
                    <Gauge className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    {filteredAcometidas.length} acometidas{' '}
                    {activeFiltersCount > 0
                      ? `encontradas de ${acometidas.length} total`
                      : 'disponibles'}
                  </span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Filtrado
                    </Badge>
                  )}
                </div>
              </div>

              <DataTable columns={columns} data={filteredAcometidas} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
