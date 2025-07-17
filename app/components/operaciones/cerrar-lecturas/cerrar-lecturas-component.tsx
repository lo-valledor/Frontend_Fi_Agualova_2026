import React, { useMemo, useState } from 'react';
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
  Info,
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';

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
  const [totalLecturasCerrar, setTotalLecturasCerrar] = useState(0);

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
      const total = selectedRows.reduce(
        (acc, row) =>
          acc +
          row.cantidadLecturasOK +
          row.cantidadClaveRoja +
          row.cantidadClaveNaranja +
          row.cantidadCorregidas,
        0,
      );
      setTotalLecturasCerrar(total);
      setIsAlertOpen(true);
    } else {
      toast.info('Debe seleccionar al menos un nicho para cerrar.');
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto p-2 space-y-3">
        {/* Header modernizado */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-clip-text text-sky-900 dark:text-sky-100">
              Cerrar Lecturas
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-yellow-100 dark:hover:bg-yellow-800/50"
                >
                  <Info className="w-4 h-4 mr-1 text-yellow-600" />
                  <span className="text-yellow-600 text-sm">Información</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Información</DialogTitle>
                  <DialogDescription>
                    Cierra las lecturas de los nichos y sectores para su
                    facturación
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filtros de Búsqueda */}
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <SearchIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Criterios de Búsqueda
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                    Selecciona criterios para cerrar lecturas
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isFiltersOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </Button>
            </div>

                          <CollapsibleContent>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Periodo */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Periodo actual
                    </Label>
                    {periodoAbierto && periodoAbierto.length > 0 ? (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-blue-800 dark:text-blue-200">
                            {periodoAbierto[0].mes.toString().padStart(2, '0')}/
                            {periodoAbierto[0].anio}
                          </span>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                            Periodo activo para facturación
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-lg flex items-center justify-center">
                          <AlertCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
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
                      <FileTextIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Ciclo de facturación
                    </Label>
                    <Select
                      value={cicloSeleccionado}
                      onValueChange={setCicloSeleccionado}
                    >
                      <SelectTrigger
                        id="ciclo"
                        className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-blue-400 focus:ring-blue-400/20 w-full"
                      >
                        <SelectValue placeholder="Selecciona un ciclo de facturación" />
                      </SelectTrigger>
                      <SelectContent>
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
                                className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
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
                              className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="font-medium">
                                  Ciclo día 15
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="2"
                              className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="font-medium">
                                  Ciclo día 30
                                </span>
                              </div>
                            </SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    disabled={isLoading}
                    className="gap-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Eraser className="h-4 w-4" />
                    Limpiar
                  </Button>
                  <Button
                    onClick={handleSearch}
                    disabled={
                      isLoading || !cicloSeleccionado || !periodoFormateado
                    }
                    className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
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
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <CheckCircleIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Estado de Cierre de Lecturas
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                  {estadoCierreLecturas.length > 0
                    ? `${estadoCierreLecturas.length} lecturas disponibles para cierre`
                    : 'No hay lecturas disponibles para cierre'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-200 dark:border-emerald-800"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Buscando lecturas...
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Por favor espere mientras procesamos su consulta
                    </p>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                    <AlertCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-800 dark:text-red-200">
                      Error al cargar los datos
                    </h4>
                    <p className="mt-2 text-red-700 dark:text-red-300 text-sm leading-relaxed">
                      {error}
                    </p>
                    <Button
                      onClick={() => setError(null)}
                      variant="outline"
                      size="sm"
                      className="mt-3 border-red-200 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-900/20"
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </div>
            ) : estadoCierreLecturas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
                  <SearchIcon className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    Realizar consulta de lecturas
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecciona un ciclo y haz clic en "Buscar Lecturas" para ver
                    los resultados
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="font-medium text-teal-700 dark:text-teal-300">
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
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                  <DataTable
                    columns={columns}
                    data={estadoCierreLecturas}
                    onRowSelectionChange={setSelectedRows}
                    rowIdKey="nichoId"
                    meta={{
                      allRowsDisabled: estadoCierreLecturas.every(
                        (row) =>
                          row.cantidadLecturasOK === 0 &&
                          row.cantidadClaveRoja === 0 &&
                          row.cantidadClaveNaranja === 0 &&
                          row.cantidadCorregidas === 0,
                      ),
                    }}
                  />
                </div>
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
            totalLecturas={totalLecturasCerrar}
          />
        )}
      </div>
    </div>
  );
}
