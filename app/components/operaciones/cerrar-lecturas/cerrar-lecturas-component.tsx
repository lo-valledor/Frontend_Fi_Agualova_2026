/**
 * Componente principal para Cierre de Lecturas
 *
 * Funcionalidades principales:
 * - Consulta de estado de cierre de lecturas por ciclo de facturación
 * - Visualización de lecturas OK, con claves (rojas/naranjas) y corregidas
 * - Selección múltiple de nichos para cerrar lecturas
 * - Validación de claves críticas que bloquean el cierre
 * - Advertencias de claves de alerta antes de proceder
 * - Cierre masivo de lecturas seleccionadas
 *
 * Flujo de trabajo:
 * 1. Usuario selecciona ciclo de facturación (15 o 30)
 * 2. Sistema carga lecturas pendientes de cierre para ese ciclo
 * 3. Sistema muestra tabla con estado por nicho:
 * - Lecturas OK (sin problemas)
 * - Claves Rojas (críticas - bloquean cierre)
 * - Claves Naranjas (alertas - permiten cierre con advertencia)
 * - Lecturas Corregidas
 * 4. Usuario selecciona nichos a cerrar (checkboxes en tabla)
 * 5. Sistema valida que no haya claves críticas
 * 6. Usuario confirma cierre en diálogo
 * 7. Sistema procesa cierre y actualiza estado
 *
 * Validaciones de seguridad:
 * - **Claves Rojas (Críticas)**: Bloquean completamente el cierre
 * - **Claves Naranjas (Alertas)**: Permiten cierre pero muestran advertencia
 * - Sistema muestra contador de lecturas críticas y de alerta
 * - Botón de cierre se deshabilita si hay claves críticas
 *
 * Arquitectura:
 * - Usa DataTable con selección múltiple (checkboxes)
 * - Componente AlertCerrarLecturas para confirmación
 * - Validación checkCriticalBlockers antes de permitir cierre
 * - Estados para periodo, ciclo, lecturas y selección
 * - API endpoints: /estado-cierre-lecturas
 *
 * @param {Object} props - Props del componente
 * @param {PeriodoAbierto[]} props.periodoAbierto - Periodo activo de facturación
 * @param {Ciclo[]} props.ciclosFacturacion - Ciclos disponibles (15/30)
 *
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/cerrar-lecturas.tsx
 * export default function CerrarLecturasRoute({ loaderData }) {
 *   return (
 *     <CerrarLecturasComponent
 *       periodoAbierto={loaderData.periodoAbierto}
 *       ciclosFacturacion={loaderData.ciclosFacturacion}
 *     />
 *   );
 * }
 * ```
 */
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
import { toast } from 'sonner';

import { useMemo, useState } from 'react';

import { useAuth } from '~/context/AuthContext';
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

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/operaciones/cerrar-lecturas';
  const hasPermission = canCreate(route) || canEdit(route);

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
        params
      });

      if (response.status === 200) {
        const data = response.data as EstadoCierreLecturas[];
        setEstadoCierreLecturas(data);
        console.log(data);
        if (data.length === 0) {
          toast.info(
            'No se encontraron resultados para los criterios seleccionados'
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
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Cierre de Lecturas'
          description='Gestión de cierre de lecturas por ciclo de facturación'
        />

        {/* Filtros de Búsqueda */}
        <Card className='border-border bg-card'>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className='flex justify-between items-center p-3 cursor-pointer hover:bg-muted/50 transition-colors'
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center border border-border'>
                  <SearchIcon className='w-4 h-4 text-primary' />
                </div>
                <div>
                  <CardTitle className='text-base font-medium'>
                    Criterios de Búsqueda
                  </CardTitle>
                  <CardDescription className='text-sm'>
                    Selecciona criterios para cerrar lecturas
                  </CardDescription>
                </div>
              </div>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                {isFiltersOpen ? (
                  <ChevronUp className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-muted-foreground' />
                )}
              </Button>
            </div>

            <CollapsibleContent>
              <CardContent className='p-3'>
                <div className='flex flex-col gap-4 w-full'>
                  {/* Campos de filtro */}
                  <div className='flex flex-col sm:flex-row gap-4 w-full'>
                    {/* Periodo */}
                    <div className='flex-1 min-w-0'>
                      <Label className='text-sm font-medium flex items-center gap-2 mb-1'>
                        <CalendarIcon className='w-4 h-4 text-primary' />
                        Periodo
                      </Label>
                      {periodoAbierto && periodoAbierto.length > 0 ? (
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-background border border-border'>
                          <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center flex-shrink-0'>
                            <CalendarIcon className='w-4 h-4 text-primary' />
                          </div>
                          <div>
                            <span className='font-medium text-sm'>
                              {periodoAbierto[0].mes
                                .toString()
                                .padStart(2, '0')}
                              /{periodoAbierto[0].anio}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className='flex items-center gap-3 p-3 rounded-xl bg-background border border-border'>
                          <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center flex-shrink-0'>
                            <AlertCircleIcon className='w-4 h-4' />
                          </div>
                          <div>
                            <span className='font-medium text-sm'>
                              No hay periodo abierto
                            </span>
                            <p className='text-xs mt-0.5'>
                              Contacta al administrador
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ciclo de facturación */}
                    <div className='flex-1 min-w-0'>
                      <Label
                        htmlFor='ciclo'
                        className='text-sm font-medium flex items-center gap-2 mb-1'
                      >
                        <FileTextIcon className='w-4 h-4 text-primary' />
                        Ciclo de facturación
                      </Label>
                      <Select
                        value={cicloSeleccionado}
                        onValueChange={setCicloSeleccionado}
                      >
                        <SelectTrigger
                          id='ciclo'
                          className='h-[50px] bg-background border-border w-full text-sm'
                        >
                          <SelectValue placeholder='Selecciona un ciclo de facturación' />
                        </SelectTrigger>
                        <SelectContent>
                          {ciclosFacturacion?.map(
                            (ciclo: Ciclo, index: number) => (
                              <SelectItem
                                key={index}
                                value={ciclo.diaFacturacion}
                              >
                                <div className='flex items-center gap-2'>
                                  <div className='w-2 h-2 rounded-full bg-primary'></div>
                                  <span className='font-medium'>
                                    {ciclo.descripcion}
                                  </span>
                                </div>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className='flex flex-col sm:flex-row gap-2 w-full sm:justify-end'>
                    <Button
                      onClick={handleClearFilters}
                      variant='outline'
                      disabled={isLoading}
                      className='gap-2 w-full sm:w-auto'
                    >
                      <Eraser className='h-4 w-4' />
                      Limpiar
                    </Button>
                    <Button
                      onClick={handleSearch}
                      disabled={
                        isLoading || !cicloSeleccionado || !periodoFormateado
                      }
                      className='gap-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto'
                    >
                      <SearchIcon className='h-4 w-4' />
                      {isLoading ? 'Buscando...' : 'Buscar Lecturas'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Resultados de la búsqueda */}
        <Card className='border-border bg-card'>
          <CardHeader className='border-b border-border p-3'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center border border-border'>
                <CheckCircleIcon className='w-4 h-4 text-primary' />
              </div>
              <div>
                <CardTitle className='text-base font-medium'>
                  Estado de Cierre de Lecturas
                </CardTitle>
                <CardDescription className='text-sm'>
                  {estadoCierreLecturas.length > 0
                    ? `${estadoCierreLecturas.length} lecturas disponibles para cierre`
                    : 'No hay lecturas disponibles para cierre'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-3'>
            {(() => {
              if (isLoading) {
                return (
                  <div className='flex justify-center items-center h-64'>
                    <div className='flex flex-col items-center gap-4'>
                      <div className='relative'>
                        <div className='w-16 h-16 rounded-full border-4 border-border'></div>
                        <div className='absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin'></div>
                      </div>
                      <div className='text-center'>
                        <p className='font-medium'>Buscando lecturas...</p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Por favor espere mientras procesamos su consulta
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (error) {
                return (
                  <div className='p-4 rounded-xl bg-background border border-border'>
                    <div className='flex items-start gap-3'>
                      <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center'>
                        <AlertCircleIcon className='w-4 h-4' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-medium'>
                          Error al cargar los datos
                        </h4>
                        <p className='mt-1 text-sm text-muted-foreground'>
                          {error}
                        </p>
                        <Button
                          onClick={() => setError(null)}
                          variant='outline'
                          size='sm'
                          className='mt-2'
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
                  <div className='flex flex-col items-center justify-center h-64 gap-4'>
                    <div className='w-16 h-16 bg-background rounded-xl flex items-center justify-center'>
                      <SearchIcon className='w-8 h-8 text-primary' />
                    </div>
                    <div className='text-center'>
                      <p className='font-medium text-sm'>
                        Realizar consulta de lecturas
                      </p>
                      <p className='text-xs mt-1'>
                        Selecciona un ciclo y haz clic en "Buscar Lecturas" para
                        ver los resultados
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div className='space-y-4'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center flex-shrink-0'>
                        <CheckCircleIcon className='w-4 h-4 text-primary' />
                      </div>
                      <span className='font-medium text-sm'>
                        {estadoCierreLecturas.length} registros encontrados
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      {(() => {
                        const blockers = checkCriticalBlockers(selectedRows);
                        const isBlocked = blockers.hasCritical;
                        const hasWarnings = blockers.hasWarning;

                        return (
                          <>
                            {/* Indicadores de estado */}
                            {selectedRows.length > 0 && (
                              <div className='flex items-center gap-2 mr-2'>
                                {isBlocked && (
                                  <div className='flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-1 rounded-md border border-destructive/20'>
                                    <AlertCircleIcon className='h-3 w-3' />
                                    <span className='text-xs font-medium'>
                                      {blockers.criticalCount} Críticas
                                    </span>
                                  </div>
                                )}
                                {hasWarnings && !isBlocked && (
                                  <div className='flex items-center gap-1 text-warning bg-warning/10 px-2 py-1 rounded-md border border-warning/20'>
                                    <AlertTriangle className='h-3 w-3' />
                                    <span className='text-xs font-medium'>
                                      {blockers.warningCount} Alertas
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            <Button
                              variant={isBlocked ? 'secondary' : 'destructive'}
                              size='sm'
                              onClick={handleOpenAlert}
                              disabled={selectedRows.length === 0 || isBlocked}
                              className={`gap-2 ${
                                isBlocked
                                  ? 'opacity-50 cursor-not-allowed bg-muted hover:bg-muted text-muted-foreground border border-destructive/20'
                                  : hasWarnings
                                    ? 'bg-warning hover:bg-warning/90 text-warning-foreground'
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
                                  <Ban className='h-4 w-4' />
                                  Bloqueado ({selectedRows.length})
                                </>
                              ) : (
                                <>
                                  <CircleX className='h-4 w-4' />
                                  Cerrar Lecturas ({selectedRows.length})
                                </>
                              )}
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div className='rounded-xl border border-border overflow-hidden bg-card'>
                    <DataTable
                      columns={columns}
                      data={estadoCierreLecturas}
                      onRowSelectionChange={setSelectedRows}
                      rowIdKey='nichoId'
                      meta={{
                        allRowsDisabled: estadoCierreLecturas.every(
                          row =>
                            row.cantidadLecturasOK === 0 &&
                            row.cantidadClaveRoja === 0 &&
                            row.cantidadClaveNaranja === 0 &&
                            row.cantidadCorregidas === 0
                        )
                      }}
                    />
                  </div>
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
            cicloFact={cicloSeleccionado}
            periodo={periodoFormateado}
            onSuccess={handleLecturaCerrada}
            totalLecturas={totalLecturasCerrar}
            disabled={!hasPermission}
          />
        )}
      </div>
    </div>
  );
}
