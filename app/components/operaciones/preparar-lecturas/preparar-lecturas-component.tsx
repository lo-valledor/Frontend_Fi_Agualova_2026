import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  ChevronDown,
  SearchIcon,
  CalendarIcon,
  Eraser,
  ChevronUp,
  AlertCircleIcon,
  UsersIcon,
  FileTextIcon,
  Info,
} from 'lucide-react';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import {
  type ConsultarAsignacionSectores,
  type OpcionesPrepararLecturas,
  type ValidarSectoresPendientes,
  type PeriodoAbierto,
  type ConsultarSectores,
} from '~/types/operaciones';
import { toast } from 'sonner';
import { useOperaciones } from '~/hooks/use-operaciones';
import TablaAsignacionSectores from './tabla-asignacion-sectores';
import DialogLecturasPendientes from './dialog-lecturas-pendientes';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';

export default function PrepararLecturasComponent({
  periodoAbierto,
  lecturasPendientes,
  sectores,
  opcionesPreparar,
  asignacionSectores,
  setAsignacionSectores,
  isLoadingAsignacion,
  onRecargarAsignacionSectores,
}: {
  periodoAbierto: PeriodoAbierto[];
  lecturasPendientes: ValidarSectoresPendientes | null;
  sectores: ConsultarSectores[];
  opcionesPreparar: OpcionesPrepararLecturas[];
  asignacionSectores: ConsultarAsignacionSectores[];
  setAsignacionSectores: React.Dispatch<
    React.SetStateAction<ConsultarAsignacionSectores[]>
  >;
  isLoadingAsignacion: boolean;
  onRecargarAsignacionSectores: (
    cicloFacturable: string,
    periodo: string,
  ) => Promise<void>;
}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cicloSeleccionado, setCicloSeleccionado] = useState<string>('');

  // Solo necesitamos fetchLecturasPendientes para el refresh del dialog
  const { fetchLecturasPendientes, loadingState } = useOperaciones();
  const isLecturasPendientesLoading = loadingState.lecturasPendientes.isLoading;

  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      return `${mes.toString().padStart(2, '0')}${anio.toString()}`;
    }
    return '';
  }, [periodoAbierto]);

  const obtenerCicloParaAPI = (idCiclo: string): string => {
    if (!opcionesPreparar || opcionesPreparar.length === 0) {
      return idCiclo === '1' ? '1' : '2';
    }

    const opcionSeleccionada = opcionesPreparar.find(
      (opcion: OpcionesPrepararLecturas) => opcion.id.toString() === idCiclo,
    );

    if (!opcionSeleccionada) {
      return idCiclo;
    }

    const descripcion = opcionSeleccionada.descripcion.toLowerCase();

    if (descripcion.includes('15') || opcionSeleccionada.id === 1) {
      return '1';
    } else if (
      descripcion.includes('30') ||
      descripcion.includes('fin de mes') ||
      opcionSeleccionada.id === 2 ||
      opcionSeleccionada.id === 3
    ) {
      return '2';
    }

    return opcionSeleccionada.id.toString();
  };

  // Función para realizar la búsqueda
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
      setError(null);
      const cicloParaAPI = obtenerCicloParaAPI(cicloSeleccionado);
      await onRecargarAsignacionSectores(cicloParaAPI, periodoFormateado);

      if (asignacionSectores.length === 0) {
        toast.info(
          'No se encontraron resultados para los criterios seleccionados',
        );
      } else {
        toast.success(`Se encontraron ${asignacionSectores.length} sectores`);
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
    }
  };

  const handleClearFilters = () => {
    setCicloSeleccionado('');
    setAsignacionSectores([]);
    setError(null);
    toast.success('Filtros limpiados');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950/30">
      <div className="container mx-auto p-2 space-y-3">
        {/* Header modernizado */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-100 dark:to-teal-100 bg-clip-text text-transparent">
              Preparar Lecturas
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
                    Preparación y asignación de lecturas para el periodo actual
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <DialogLecturasPendientes
              data={lecturasPendientes || undefined}
              isLoading={isLecturasPendientesLoading}
              onRefresh={fetchLecturasPendientes}
            />
          </div>
        </div>

        {/* Filtros de Búsqueda */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className="flex justify-between items-center p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <SearchIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                    Criterios de Búsqueda
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Selecciona criterios para preparar lecturas
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
              <CardContent className="px-6 pb-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  {/* Periodo */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Periodo actual
                    </Label>
                    {periodoAbierto && periodoAbierto.length > 0 ? (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                            {periodoAbierto[0].mes.toString().padStart(2, '0')}/
                            {periodoAbierto[0].anio}
                          </span>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
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
                      <FileTextIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Ciclo de facturación
                    </Label>
                    <Select
                      value={cicloSeleccionado}
                      onValueChange={setCicloSeleccionado}
                    >
                      <SelectTrigger
                        id="ciclo"
                        className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-emerald-400 focus:ring-emerald-400/20 w-full"
                      >
                        <SelectValue placeholder="Selecciona un ciclo de facturación" />
                      </SelectTrigger>
                      <SelectContent>
                        {opcionesPreparar &&
                          opcionesPreparar.map(
                            (opcion: OpcionesPrepararLecturas) => (
                              <SelectItem
                                key={opcion.id}
                                value={opcion.id.toString()}
                                className="hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                  <span className="font-medium">
                                    {opcion.descripcion}
                                  </span>
                                </div>
                              </SelectItem>
                            ),
                          )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-wrap justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    disabled={isLoadingAsignacion}
                    className="gap-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <Eraser className="h-4 w-4" />
                    Limpiar
                  </Button>
                  <Button
                    onClick={handleSearch}
                    disabled={
                      isLoadingAsignacion ||
                      !cicloSeleccionado ||
                      !periodoFormateado
                    }
                    className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  >
                    <SearchIcon className="h-4 w-4" />
                    {isLoadingAsignacion ? 'Buscando...' : 'Buscar Sectores'}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Resultados de la búsqueda */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                  Asignación de Sectores
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  {asignacionSectores.length > 0
                    ? `${asignacionSectores.length} sectores encontrados`
                    : 'No hay sectores asignados'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingAsignacion ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-emerald-200 dark:border-emerald-800"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                      Buscando sectores...
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
            ) : asignacionSectores.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center">
                  <SearchIcon className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    Realizar consulta de sectores
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecciona un ciclo y haz clic en "Buscar Sectores" para ver
                    los resultados
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                      <UsersIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <span className="font-medium text-teal-700 dark:text-teal-300">
                      {asignacionSectores.length} sectores encontrados
                    </span>
                  </div>
                </div>
                <TablaAsignacionSectores
                  data={asignacionSectores}
                  isLoading={isLoadingAsignacion}
                  isAuthorized={true}
                  sectores={sectores}
                  periodo={periodoFormateado}
                  cicloFacturable={obtenerCicloParaAPI(cicloSeleccionado)}
                  onRecargarDatos={() =>
                    onRecargarAsignacionSectores(
                      obtenerCicloParaAPI(cicloSeleccionado),
                      periodoFormateado,
                    )
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
