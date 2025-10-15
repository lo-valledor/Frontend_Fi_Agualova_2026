import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Eraser,
  FileTextIcon,
  SearchIcon,
  UsersIcon
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useMemo, useState } from 'react';

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
import {
  type ConsultarAsignacionSectores,
  type ConsultarSectores,
  type OpcionesPrepararLecturas,
  type PeriodoAbierto,
  type ValidarSectoresPendientes
} from '~/types/operaciones';

import DialogLecturasPendientes from './dialog-lecturas-pendientes';
// Removido useOperaciones ya que los datos vienen como props
import TablaAsignacionSectores from './tabla-asignacion-sectores';

export default function PrepararLecturasComponent({
  periodoAbierto,
  lecturasPendientes,
  sectores,
  opcionesPreparar,
  asignacionSectores,
  setAsignacionSectores,
  isLoadingAsignacion,
  onRecargarAsignacionSectores
}: {
  readonly periodoAbierto: PeriodoAbierto[];
  readonly lecturasPendientes: ValidarSectoresPendientes | null;
  readonly sectores: ConsultarSectores[];
  readonly opcionesPreparar: OpcionesPrepararLecturas[];
  readonly asignacionSectores: ConsultarAsignacionSectores[];
  readonly setAsignacionSectores: React.Dispatch<
    React.SetStateAction<ConsultarAsignacionSectores[]>
  >;
  readonly isLoadingAsignacion: boolean;
  readonly onRecargarAsignacionSectores: (
    cicloFacturable: string,
    periodo: string
  ) => Promise<void>;
}) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cicloSeleccionado, setCicloSeleccionado] = useState<string>('');

  // Los datos vienen como props, no necesitamos el hook

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
      (opcion: OpcionesPrepararLecturas) => opcion.id.toString() === idCiclo
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
          'No se encontraron resultados para los criterios seleccionados'
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
          }`
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
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Preparación de Lecturas'
          description='Gestión de asignación de sectores para lectura'
          actions={
            <DialogLecturasPendientes
              data={lecturasPendientes || undefined}
              isLoading={false}
              onRefresh={() => Promise.resolve(undefined)}
            />
          }
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
                    Selecciona criterios para preparar lecturas
                  </CardDescription>
                </div>
              </div>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                {isFiltersOpen ? (
                  <ChevronUp className='h-5 w-5 text-muted-foreground' />
                ) : (
                  <ChevronDown className='h-5 w-5 text-muted-foreground' />
                )}
              </Button>
            </div>

            <CollapsibleContent>
              <CardContent className='p-3 space-y-4'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-full'>
                  {/* Periodo */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium flex items-center gap-2'>
                      <CalendarIcon className='w-4 h-4 text-primary' />
                      Periodo actual
                    </Label>
                    {periodoAbierto && periodoAbierto.length > 0 ? (
                      <div className='flex items-center gap-3 p-3 rounded-xl bg-background border border-border'>
                        <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center'>
                          <CalendarIcon className='w-4 h-4 text-primary' />
                        </div>
                        <div>
                          <span className='font-medium text-sm'>
                            {periodoAbierto[0].mes.toString().padStart(2, '0')}/
                            {periodoAbierto[0].anio}
                          </span>
                          <p className='text-xs'>
                            Periodo activo para facturación
                          </p>
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
                  <div className='space-y-2'>
                    <Label
                      htmlFor='ciclo'
                      className='text-sm font-medium flex items-center gap-2'
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
                        className='h-10 bg-background border-border w-full text-sm'
                      >
                        <SelectValue placeholder='Selecciona un ciclo de facturación' />
                      </SelectTrigger>
                      <SelectContent>
                        {opcionesPreparar?.map(
                          (opcion: OpcionesPrepararLecturas) => (
                            <SelectItem
                              key={opcion.id}
                              value={opcion.id.toString()}
                            >
                              {opcion.descripcion}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className='flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-border'>
                  <Button
                    onClick={handleClearFilters}
                    variant='outline'
                    disabled={isLoadingAsignacion}
                    className='gap-2'
                  >
                    <Eraser className='h-4 w-4' />
                    Limpiar
                  </Button>
                  <Button
                    onClick={handleSearch}
                    disabled={
                      isLoadingAsignacion ||
                      !cicloSeleccionado ||
                      !periodoFormateado
                    }
                    className='gap-2 bg-primary hover:bg-primary/90 text-primary-foreground'
                  >
                    <SearchIcon className='h-4 w-4' />
                    {isLoadingAsignacion ? 'Buscando...' : 'Buscar Sectores'}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Resultados de la búsqueda */}
        <Card className='border border-border shadow-sm'>
          <CardHeader className='p-3 border-b border-border'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center border border-border'>
                <UsersIcon className='w-4 h-4 text-primary' />
              </div>
              <div>
                <CardTitle className='text-base font-medium'>
                  Asignación de Sectores
                </CardTitle>
                <CardDescription className='text-sm'>
                  {asignacionSectores.length > 0
                    ? `${asignacionSectores.length} sectores encontrados`
                    : 'No hay sectores asignados'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-3'>
            {(() => {
              if (isLoadingAsignacion) {
                return (
                  <div className='flex justify-center items-center h-48'>
                    <div className='flex flex-col items-center gap-3'>
                      <div className='w-8 h-8 animate-spin rounded-full border-2 border-border border-t-primary'></div>
                      <div className='text-center'>
                        <p className='font-medium text-sm'>
                          Buscando sectores...
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Por favor espere
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (error) {
                return (
                  <div className='p-3 rounded-xl bg-destructive/10 border border-destructive/20'>
                    <div className='flex items-start gap-3'>
                      <div className='w-8 h-8 bg-destructive/20 rounded-xl flex items-center justify-center'>
                        <AlertCircleIcon className='w-4 h-4 text-destructive' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-medium text-destructive text-sm'>
                          Error al cargar los datos
                        </h4>
                        <p className='mt-1 text-destructive text-xs'>{error}</p>
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

              if (asignacionSectores.length === 0) {
                return (
                  <div className='flex flex-col items-center justify-center h-48 gap-3'>
                    <div className='w-12 h-12 bg-background rounded-xl flex items-center justify-center'>
                      <SearchIcon className='w-6 h-6' />
                    </div>
                    <div className='text-center'>
                      <p className='font-medium text-sm'>
                        Realizar consulta de sectores
                      </p>
                      <p className='text-xs'>
                        Selecciona un ciclo y haz clic en "Buscar Sectores"
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div className='space-y-4'>
                  <div className='flex items-center gap-2 pb-3 border-b border-border'>
                    <div className='w-6 h-6 bg-background rounded-xl flex items-center justify-center'>
                      <UsersIcon className='w-4 h-4 text-primary' />
                    </div>
                    <span className='font-medium text-sm'>
                      {asignacionSectores.length} sectores encontrados
                    </span>
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
                        periodoFormateado
                      )
                    }
                  />
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
