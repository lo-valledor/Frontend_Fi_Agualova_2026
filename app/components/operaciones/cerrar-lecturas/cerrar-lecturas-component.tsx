import React, { useMemo, useState } from 'react';
import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  type EstadoCierreLecturas,
  type PeriodoAbierto,
  type Ciclo,
} from '~/types/operaciones';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Eraser,
  SearchIcon,
  CheckCircleIcon,
  FileTextIcon,
  CircleX,
} from 'lucide-react';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';
import api from '~/lib/api';
import { DataTable } from '../../data-table/data-table';
import { columns } from './columns';
import AlertCerrarLecturas from './alert-cerrar-lecturas';

export default function CerrarLecturasComponent({
  periodoAbierto,
  ciclosFacturacion,
}: {
  periodoAbierto: PeriodoAbierto[];
  ciclosFacturacion: Ciclo[];
}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cicloSeleccionado, setCicloSeleccionado] = useState<string>('');
  const [estadoCierreLecturas, setEstadoCierreLecturas] = useState<
    EstadoCierreLecturas[]
  >([]);
  const [selectedRows, setSelectedRows] = useState<EstadoCierreLecturas[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      return `${mes.toString().padStart(2, '0')}${anio.toString()}`;
    }
    return '';
  }, [periodoAbierto]);


  const handleSearch = async () => {
    if (!periodoFormateado) {
      toast.error('No hay un periodo abierto disponible');
      return;
    }

    if (!cicloSeleccionado) {
      toast.error('Debe seleccionar un ciclo de facturación');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSelectedRows([]); // Limpiar selección en nueva búsqueda

      const params = new URLSearchParams();
      params.append('cicloFacturable', cicloSeleccionado);
      params.append('periodo', periodoFormateado);

      const response = await api.get('/estado-cierre-lecturas', {
        params,
      });

      if (response.status === 200) {
        const data = response.data as EstadoCierreLecturas[];
        setEstadoCierreLecturas(data);
        if (data.length === 0) {
          toast.info(
            'No se encontraron resultados para los criterios seleccionados',
          );
        } else {
          toast.success(`Se encontraron ${data.length} registros`);
        }
      } else {
        setError('Error al buscar lecturas');
        toast.error('Error al buscar lecturas');
      }
    } catch (error: any) {
      console.error('Error al buscar lecturas:', error);
      setError(`Error: ${error.message || 'Error desconocido'}`);

      if (error.response) {
        toast.error(
          `Error ${error.response.status}: ${
            error.response.data?.mensaje || 'Error en la consulta'
          }`,
        );
      } else if (error.request) {
        toast.error('No se recibió respuesta del servidor');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCicloSeleccionado('');
    setEstadoCierreLecturas([]);
    setSelectedRows([]);
    setError(null);
    toast.success('Filtros limpiados');
  };

  // Función para manejar la actualización después de cerrar lecturas
  const handleLecturaCerrada = () => {
    // Volvemos a buscar para actualizar la lista
    if (cicloSeleccionado && periodoFormateado) {
      handleSearch();
    }
  };

  const handleOpenAlert = () => {
    if (selectedRows.length > 0) {
      setIsAlertOpen(true);
    } else {
      toast.info('Debe seleccionar al menos un nicho para cerrar.');
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
          {periodoAbierto && periodoAbierto.length > 0 && (
            <Badge
              variant="outline"
              className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
            >
              Periodo: {periodoAbierto[0].mes.toString().padStart(2, '0')}/
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
                    Criterios de Búsqueda
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Periodo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    Periodo actual
                  </Label>
                  {periodoAbierto && periodoAbierto.length > 0 ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 shadow-sm">
                      <div className="p-1.5 bg-sky-100 dark:bg-sky-800/50 rounded-md">
                        <CalendarIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-sky-800 dark:text-sky-200">
                          {periodoAbierto[0].mes.toString().padStart(2, '0')}/
                          {periodoAbierto[0].anio}
                        </span>
                        <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
                          Periodo activo para facturación
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 shadow-sm">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-800/50 rounded-md">
                        <AlertCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <span className="font-medium text-amber-800 dark:text-amber-200">
                          No hay periodo abierto
                        </span>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          Contacta al administrador
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ciclo de facturación */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ciclo"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <FileTextIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    Ciclo de facturación
                  </Label>
                  <Select
                    value={cicloSeleccionado}
                    onValueChange={setCicloSeleccionado}
                  >
                    <SelectTrigger
                      id="ciclo"
                      className="w-full h-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                    >
                      <SelectValue placeholder="Selecciona un ciclo de facturación" />
                    </SelectTrigger>
                    <SelectContent className="border-border/60">
                      {ciclosFacturacion && ciclosFacturacion.length > 0 ? (
                        ciclosFacturacion.map((ciclo) => {
                          // Determinar el valor correcto para el API (1 o 2)
                          let valorCiclo = '1';
                          if (
                            ciclo.diaFacturacion === '30' ||
                            ciclo.descripcion.includes('30')
                          ) {
                            valorCiclo = '2';
                          }

                          return (
                            <SelectItem
                              key={ciclo.diaFacturacion}
                              value={valorCiclo}
                              className="hover:bg-sky-50 dark:hover:bg-sky-900/20"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                                <span className="font-medium">
                                  {ciclo.descripcion}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })
                      ) : (
                        <>
                          <SelectItem
                            value="1"
                            className="hover:bg-sky-50 dark:hover:bg-sky-900/20"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                              <span className="font-medium">Ciclo día 15</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="2"
                            className="hover:bg-sky-50 dark:hover:bg-sky-900/20"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                              <span className="font-medium">Ciclo día 30</span>
                            </div>
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border/40 mt-4">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  disabled={isLoading}
                  className="gap-2 hover:bg-muted/50"
                >
                  <Eraser className="h-4 w-4" />
                  Limpiar
                </Button>
                <Button
                  onClick={handleSearch}
                  disabled={
                    isLoading || !cicloSeleccionado || !periodoFormateado
                  }
                  className="gap-2 bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <SearchIcon className="h-4 w-4" />
                  {isLoading ? 'Buscando...' : 'Buscar Lecturas'}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Resultados de la búsqueda */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shadow-sm">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                Estado de Cierre de Lecturas
              </CardTitle>
              <CardDescription className="text-sm">
                {estadoCierreLecturas.length > 0
                  ? `${estadoCierreLecturas.length} lecturas disponibles para cierre`
                  : 'No hay lecturas disponibles para cierre'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-sky-200 dark:border-sky-800"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-sky-600 border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-sky-700 dark:text-sky-300 font-medium">
                    Buscando lecturas...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por favor espere mientras procesamos su consulta
                  </p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg shadow-sm">
                  <AlertCircleIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-rose-800 dark:text-rose-200">
                    Error al cargar los datos
                  </h4>
                  <p className="mt-2 text-rose-700 dark:text-rose-300 text-sm leading-relaxed">
                    {error}
                  </p>
                  <Button
                    onClick={() => setError(null)}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-rose-200 hover:bg-rose-50 dark:border-rose-700 dark:hover:bg-rose-900/20"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          ) : estadoCierreLecturas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <SearchIcon className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Realizar consulta de lecturas
                </p>
                <p className="text-sm mt-1">
                  Selecciona un ciclo y haz clic en "Buscar Lecturas" para ver
                  los resultados
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    {estadoCierreLecturas.length} registros encontrados
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleOpenAlert}
                    disabled={selectedRows.length === 0}
                    className="gap-2"
                  >
                    <CircleX className="h-4 w-4" />
                    Cerrar Lecturas ({selectedRows.length})
                  </Button>
                </div>
              </div>
              <DataTable
                columns={columns}
                data={estadoCierreLecturas}
                onRowSelectionChange={(selected) => {
                  setSelectedRows(selected);
                }}
                rowIdKey="nichoId"
              />
            </div>
          )}
        </CardContent>
      </Card>
      {isAlertOpen && (
        <AlertCerrarLecturas
          isOpen={isAlertOpen}
          onOpenChange={setIsAlertOpen}
          selectedRows={selectedRows}
          cicloFact={cicloSeleccionado}
          periodo={periodoFormateado}
          onSuccess={handleLecturaCerrada}
        />
      )}
    </div>
  );
}
