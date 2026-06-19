import {
  AlertCircleIcon,
  AlertTriangle,
  Ban,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDown,
  ChevronUp,
  CircleX,
  Eraser,
  FileTextIcon,
  SearchIcon
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import api from '~/lib/api';
import {
  type Ciclo,
  type EstadoCierreLecturas,
  type PeriodoAbierto
} from '~/types/operaciones';

import { DataTable } from '../../data-table/data-table';
import AlertCerrarLecturas from './alert-cerrar-lecturas';
import { columns } from './columns';

export default function CerrarLecturasComponent({
  periodoAbierto,
  ciclosFacturacion
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
  const [showSinLecturas, setShowSinLecturas] = useState(false);

  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      const formatted = `${mes.toString().padStart(2, '0')}${anio.toString()}`;

      return formatted;
    }
    return '';
  }, [periodoAbierto]);

  // Separar nichos con lecturas de los sin lecturas
  const { nichosConLecturas, nichosSinLecturas } = useMemo(() => {
    const conLecturas: EstadoCierreLecturas[] = [];
    const sinLecturas: EstadoCierreLecturas[] = [];

    estadoCierreLecturas.forEach(nicho => {
      const tieneLecturas =
        nicho.cantidadLecturasOK > 0 ||
        nicho.cantidadClaveRoja > 0 ||
        nicho.cantidadClaveNaranja > 0 ||
        nicho.cantidadCorregidas > 0;

      if (tieneLecturas) {
        conLecturas.push(nicho);
      } else {
        sinLecturas.push(nicho);
      }
    });

    return {
      nichosConLecturas: conLecturas,
      nichosSinLecturas: sinLecturas
    };
  }, [estadoCierreLecturas]);

  const obtenerCicloParaAPI = (diaFacturacion: string): string => {
    if (!ciclosFacturacion || ciclosFacturacion.length === 0) {
      return diaFacturacion;
    }

    // Buscar el ciclo por día de facturación
    const ciclo = ciclosFacturacion.find(
      (c: Ciclo) => c.diaFacturacion === diaFacturacion
    );

    if (!ciclo) {
      return diaFacturacion;
    }

    const descripcion = ciclo.descripcion.toLowerCase();

    // Ciclo 15 (o variantes como 16) → ID 1
    if (descripcion.includes('15') || descripcion.includes('16')) {
      return '1';
    }

    // Ciclo 30 (o fin de mes) → ID 2
    if (
      descripcion.includes('30') ||
      descripcion.includes('31') ||
      descripcion.includes('fin de mes')
    ) {
      return '2';
    }

    return diaFacturacion;
  };

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

      // Convertir el día de facturación al ID del ciclo
      const cicloParaAPI = obtenerCicloParaAPI(cicloSeleccionado);

      const params = new URLSearchParams();
      params.append('cicloFacturable', cicloParaAPI);
      params.append('periodo', periodoFormateado);

      const response = await api.get('/estado-cierre-lecturas', {
        params
      });

      // Guardar los datos en el estado
      if (response.data && Array.isArray(response.data)) {
        setEstadoCierreLecturas(response.data);

        if (response.data.length > 0) {
          toast.success(`Se encontraron ${response.data.length} registros`);
        } else {
          toast.info(
            'No se encontraron lecturas para cerrar en este ciclo y periodo'
          );
        }
      } else {
        setEstadoCierreLecturas([]);
        toast.info('No se encontraron registros');
      }
    } catch (error: any) {
      setError(`Error: ${error.message || 'Error desconocido'}`);

      if (error.response) {
        toast.error(
          `Error ${error.response.status}: ${
            error.response.data?.mensaje || 'Error en la consulta'
          }`
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

  // Función para verificar si hay claves críticas que bloqueen el cierre
  const checkCriticalBlockers = (rows: EstadoCierreLecturas[]) => {
    const criticalRows = rows.filter(row => row.cantidadClaveRoja > 0);
    const warningRows = rows.filter(row => row.cantidadClaveNaranja > 0);

    return {
      hasCritical: criticalRows.length > 0,
      hasWarning: warningRows.length > 0,
      criticalCount: criticalRows.reduce(
        (acc, row) => acc + row.cantidadClaveRoja,
        0
      ),
      warningCount: warningRows.reduce(
        (acc, row) => acc + row.cantidadClaveNaranja,
        0
      ),
      blockedNichos: criticalRows.map(row => row.nichoDescripcion)
    };
  };

  const handleOpenAlert = () => {
    if (selectedRows.length > 0) {
      const blockers = checkCriticalBlockers(selectedRows);

      // Bloquear si hay claves críticas
      if (blockers.hasCritical) {
        toast.error(
          `No se puede cerrar: ${blockers.criticalCount} lecturas con claves críticas en ${blockers.blockedNichos.length} nicho(s)`,
          {
            description: `Nichos bloqueados: ${blockers.blockedNichos.join(', ')}`,
            duration: 6000
          }
        );
        return;
      }

      // Advertir si hay claves de alerta pero permitir continuar
      if (blockers.hasWarning) {
        toast.warning(
          `Atención: ${blockers.warningCount} lecturas con claves de alerta en la selección`,
          {
            description: 'Se recomienda revisar antes de proceder',
            duration: 4000
          }
        );
      }

      const total = selectedRows.reduce(
        (acc, row) =>
          acc +
          row.cantidadLecturasOK +
          row.cantidadClaveRoja +
          row.cantidadClaveNaranja +
          row.cantidadCorregidas,
        0
      );
      setTotalLecturasCerrar(total);
      setIsAlertOpen(true);
    } else {
      toast.info('Debe seleccionar al menos un nicho para cerrar.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        {/* Header */}
        <ModernHeader
          title="Cierre de Lecturas"
          description="Gestión de cierre de lecturas por ciclo de facturación"
        />

        {/* Filtros de Búsqueda */}
        <Card className="border-border bg-card">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center border border-border">
                  <SearchIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium">
                    Criterios de Búsqueda
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Selecciona criterios para cerrar lecturas
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isFiltersOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            <CollapsibleContent>
              <CardContent className="p-3">
                <div className="flex flex-col gap-4 w-full">
                  {/* Campos de filtro */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    {/* Periodo */}
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        Periodo
                      </Label>
                      {periodoAbierto && periodoAbierto.length > 0 ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                          <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center shrink-0">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <span className="font-medium text-sm">
                              {periodoAbierto[0].mes
                                .toString()
                                .padStart(2, '0')}
                              /{periodoAbierto[0].anio}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                          <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center shrink-0">
                            <AlertCircleIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-medium text-sm">
                              No hay periodo abierto
                            </span>
                            <p className="text-xs mt-0.5">
                              Contacta al administrador
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ciclo de facturación */}
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor="ciclo"
                        className="text-sm font-medium flex items-center gap-2 mb-1"
                      >
                        <FileTextIcon className="w-4 h-4 text-primary" />
                        Ciclo de facturación
                      </Label>
                      <Select
                        value={cicloSeleccionado}
                        onValueChange={value => {
                          setCicloSeleccionado(value);
                        }}
                      >
                        <SelectTrigger
                          id="ciclo"
                          className="h-[50px] bg-background border-border w-full text-sm"
                        >
                          <SelectValue placeholder="Selecciona un ciclo de facturación" />
                        </SelectTrigger>
                        <SelectContent>
                          {ciclosFacturacion?.map(
                            (ciclo: Ciclo, index: number) => {
                              return (
                                <SelectItem
                                  key={index}
                                  value={ciclo.diaFacturacion}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="font-medium">
                                      {ciclo.descripcion}
                                    </span>
                                  </div>
                                </SelectItem>
                              );
                            }
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                    <Button
                      onClick={handleClearFilters}
                      variant="outline"
                      disabled={isLoading}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Eraser className="h-4 w-4" />
                      Limpiar
                    </Button>
                    <Button
                      onClick={handleSearch}
                      disabled={
                        isLoading || !cicloSeleccionado || !periodoFormateado
                      }
                      className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                    >
                      <SearchIcon className="h-4 w-4" />
                      {isLoading ? 'Buscando...' : 'Buscar Lecturas'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Resultados de la búsqueda */}
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center border border-border">
                <CheckCircleIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">
                  Estado de Cierre de Lecturas por Nichos
                </CardTitle>
                <CardDescription className="text-sm">
                  {estadoCierreLecturas.length > 0
                    ? `${estadoCierreLecturas.length} nichos disponibles para cierre`
                    : 'No hay nichos disponibles para cierre'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {(() => {
              if (isLoading) {
                return (
                  <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-border"></div>
                        <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">Buscando nichos...</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Por favor espere mientras procesamos su consulta
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (error) {
                return (
                  <div className="p-4 rounded-xl bg-background border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center">
                        <AlertCircleIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          Error al cargar los datos
                        </h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {error}
                        </p>
                        <Button
                          onClick={() => setError(null)}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          Cerrar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (estadoCierreLecturas.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="w-16 h-16 bg-background rounded-xl flex items-center justify-center">
                      <SearchIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">
                        Realizar consulta de lecturas
                      </p>
                      <p className="text-xs mt-1">
                        Selecciona un ciclo y haz clic en "Buscar Lecturas" para
                        ver los resultados
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Estadísticas generales */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                            {nichosConLecturas.length}
                          </div>
                          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Nichos con lecturas
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <AlertCircleIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <div>
                          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                            {nichosSinLecturas.length}
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Nichos sin lecturas
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <FileTextIcon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {estadoCierreLecturas.length}
                          </div>
                          <div className="text-xs font-medium text-primary">
                            Total nichos
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Encabezado y botón de acción */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircleIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <span className="font-medium text-sm">
                          Nichos disponibles para cierre
                        </span>
                        <p className="text-xs text-muted-foreground">
                          {nichosConLecturas.length} nichos con lecturas listas
                          para procesar
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const blockers = checkCriticalBlockers(selectedRows);
                        const isBlocked = blockers.hasCritical;
                        const hasWarnings = blockers.hasWarning;

                        return (
                          <>
                            {/* Indicadores de estado */}
                            {selectedRows.length > 0 && (
                              <div className="flex items-center gap-2 mr-2">
                                {isBlocked && (
                                  <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20">
                                    <AlertCircleIcon className="h-3 w-3" />
                                    <span className="text-xs font-medium">
                                      {blockers.criticalCount} Críticas
                                    </span>
                                  </div>
                                )}
                                {hasWarnings && !isBlocked && (
                                  <div className="flex items-center gap-1 text-warning bg-warning/10 px-2 py-1 rounded-md border border-warning/20">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span className="text-xs font-medium">
                                      {blockers.warningCount} Alertas
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            <Button
                              variant={isBlocked ? 'secondary' : 'destructive'}
                              size="sm"
                              onClick={handleOpenAlert}
                              disabled={selectedRows.length === 0 || isBlocked}
                              className={`gap-2 ${
                                isBlocked
                                  ? 'opacity-50 cursor-not-allowed bg-muted hover:bg-muted text-muted-foreground border border-destructive/20'
                                  : hasWarnings
                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                    : ''
                              }`}
                              title={
                                isBlocked
                                  ? `Cierre bloqueado: ${blockers.criticalCount} lecturas críticas`
                                  : hasWarnings
                                    ? `${blockers.warningCount} lecturas con alertas - Proceder con precaución`
                                    : 'Cerrar lecturas seleccionadas'
                              }
                            >
                              {isBlocked ? (
                                <>
                                  <Ban className="h-4 w-4" />
                                  Bloqueado por claves críticas (
                                  {blockers.criticalCount}) nichos (
                                  {blockers.blockedNichos.length}) )
                                </>
                              ) : (
                                <>
                                  <CircleX className="h-4 w-4" />
                                  Cerrar Nichos ({selectedRows.length})
                                </>
                              )}
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Tabla de nichos CON lecturas (virtualizada) */}
                  {nichosConLecturas.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                          Nichos con lecturas ({nichosConLecturas.length})
                        </h3>
                        <div className="text-xs text-muted-foreground">
                          Selecciona los nichos a cerrar
                        </div>
                      </div>
                      <DataTable
                        columns={columns}
                        data={nichosConLecturas}
                        onRowSelectionChange={setSelectedRows}
                        rowIdKey="nichoId"
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl bg-muted/30 border border-border text-center">
                      <CheckCircleIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium text-muted-foreground">
                        No hay nichos con lecturas para cerrar
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Todos los nichos consultados no tienen lecturas
                        registradas
                      </p>
                    </div>
                  )}

                  {/* Sección colapsable de nichos SIN lecturas */}
                  {nichosSinLecturas.length > 0 && (
                    <div className="space-y-2">
                      <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                        <Collapsible
                          open={showSinLecturas}
                          onOpenChange={setShowSinLecturas}
                        >
                          <button
                            className="w-full flex justify-between items-center p-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors text-left rounded-lg"
                            onClick={() => setShowSinLecturas(!showSinLecturas)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setShowSinLecturas(!showSinLecturas);
                              }
                            }}
                            aria-expanded={showSinLecturas}
                            aria-controls="sin-lecturas-content"
                            type="button"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                                <AlertCircleIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              </div>
                              <div>
                                <div className="font-medium text-sm text-slate-700 dark:text-slate-300">
                                  Nichos sin lecturas (
                                  {nichosSinLecturas.length})
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  Estos nichos no pueden cerrarse (sin lecturas
                                  registradas)
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {showSinLecturas ? (
                                <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                              )}
                            </div>
                          </button>

                          <CollapsibleContent>
                            <CardContent className="px-4 pb-4">
                              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-card">
                                <DataTable
                                  columns={columns}
                                  data={nichosSinLecturas}
                                  rowIdKey="nichoId"
                                  showSearch={false}
                                  meta={{
                                    allRowsDisabled: true
                                  }}
                                />
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {isAlertOpen && (
          <AlertCerrarLecturas
            isOpen={isAlertOpen}
            onOpenChange={setIsAlertOpen}
            selectedRows={selectedRows}
            cicloFact={obtenerCicloParaAPI(cicloSeleccionado)}
            periodo={periodoFormateado}
            onSuccess={handleLecturaCerrada}
            totalLecturas={totalLecturasCerrar}
          />
        )}
      </div>
    </div>
  );
}
