import { driver } from 'driver.js';
import {
  AlertCircleIcon,
  BarChartIcon,
  Building2,
  CalendarIcon,
  ClockIcon,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import 'driver.js/dist/driver.css';

import { useMemo, useState } from 'react';
import { ModernHeader } from '~/components/shared/modern-header';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { useAuth } from '~/context/AuthContext';
import type {
  Ciclo,
  PeriodoAbierto,
  RevisarPrecioDos,
  RevisarPrecioUno
} from '~/types/operaciones';
import {
  filterPendingConfirmations,
  processConfirmations
} from '~/utils/operaciones/confirmation-helpers';
import { columnsAgualova } from './columns-agualova';
import { columnsEnel } from './columns-enel';
import { DataTableVirtualized } from './data-table-virtualized';
import DialogModificarPrecio from './dialog-modificar-precio';

interface RevisarPrecioComponentProps {
  dataPeriodoAbierto: PeriodoAbierto[];
  dataConsultarPreciosUno: RevisarPrecioUno[];
  dataConsultarPreciosDos: RevisarPrecioDos[];
  ciclosFacturacion: Ciclo[];
  cicloSeleccionado: string;
  onCicloChange: (ciclo: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onRecargarPrecios: () => Promise<void>;
  isLoadingPrecios: boolean;
}

export default function RevisarPrecioComponent({
  dataPeriodoAbierto,
  dataConsultarPreciosUno,
  dataConsultarPreciosDos,
  ciclosFacturacion,
  cicloSeleccionado,
  onCicloChange,
  isLoading,
  error,
  onRecargarPrecios,
  isLoadingPrecios
}: Readonly<RevisarPrecioComponentProps>) {
  const { user } = useAuth();

  // Estados para las filas seleccionadas
  const [selectedEnelRows, setSelectedEnelRows] = useState<string[]>([]);
  const [selectedAgualovaRows, setSelectedAgualovaRows] = useState<string[]>(
    []
  );
  const [isConfirming, setIsConfirming] = useState(false);

  // Verificamos si el periodo está cargando
  const isPeriodoLoading = isLoading;

  // Verificamos si los ciclos están cargando
  const isCiclosLoading = isLoading;

  const confirmarCambios = async () => {
    if (!user?.fullName) {
      toast.error('No se pudo obtener información del usuario');
      return;
    }

    if (selectedEnelRows.length === 0 && selectedAgualovaRows.length === 0) {
      toast.info('Debes seleccionar al menos un registro para confirmar');
      return;
    }

    try {
      setIsConfirming(true);

      // Filtrar registros pendientes
      const confirmacionesEnel = filterPendingConfirmations(
        dataConsultarPreciosUno,
        selectedEnelRows,
        'codigo'
      );

      const confirmacionesAgualova = filterPendingConfirmations(
        dataConsultarPreciosDos,
        selectedAgualovaRows,
        'codigo'
      );

      // Procesar confirmaciones Enel
      const resultEnel = await processConfirmations(
        confirmacionesEnel,
        user.fullName,
        toast
      );

      // Early return si debemos detener (sesión expirada)
      if (resultEnel.shouldStop) {
        setIsConfirming(false);
        return;
      }

      // Procesar confirmaciones Agualova
      const resultAgualova = await processConfirmations(
        confirmacionesAgualova,
        user.fullName,
        toast
      );

      // Early return si debemos detener
      if (resultAgualova.shouldStop) {
        setIsConfirming(false);
        return;
      }

      // Calcular totales
      const totalExitosas = resultEnel.exitosas + resultAgualova.exitosas;
      const totalFallidas = resultEnel.fallidas + resultAgualova.fallidas;

      // Actualizar UI si hubo confirmaciones exitosas
      if (totalExitosas > 0) {
        setSelectedEnelRows([]);
        setSelectedAgualovaRows([]);
        await onRecargarPrecios();
        toast.success(
          `Se han confirmado ${totalExitosas} registros correctamente`
        );
      } else if (totalExitosas === 0 && totalFallidas === 0) {
        toast.info('No había registros pendientes para confirmar');
      }

      if (totalFallidas > 0) {
        toast.error(`No se pudieron confirmar ${totalFallidas} registros`);
      }
    } catch (error) {
      console.error('Error al confirmar cambios:', error);
      toast.error('Error al confirmar cambios');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCicloChange = async (nuevoCiclo: string) => {
    try {
      await onCicloChange(nuevoCiclo);
    } catch (error) {
      toast.error('Error al cambiar el ciclo', error as any);
    }
  };

  // Configurar columnas con las propiedades necesarias
  const configuredColumnsEnel = useMemo(() => {
    return columnsEnel.map(col => {
      if (col.id === 'acciones') {
        return {
          ...col,
          cell: ({ row }: { row: any }) => {
            const renderActionContent = () => {
              if (row.original.confirmacion === 'Confirmado') {
                return (
                  <Badge className="bg-success/10 text-success border-success/20">
                    Confirmado
                  </Badge>
                );
              }

              if (row.original.indice === '') {
                return (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                    Inhabilitado
                  </Badge>
                );
              }

              return (
                <DialogModificarPrecio
                  indice={Number(row.original.indice)}
                  descripcion={row.original.descripcion}
                  valorActual={row.original.valor}
                  onSuccess={onRecargarPrecios}
                />
              );
            };

            return <div className="text-center">{renderActionContent()}</div>;
          }
        };
      }
      return col;
    });
  }, [onRecargarPrecios]);

  const configuredColumnsAgualova = useMemo(() => {
    return columnsAgualova.map(col => {
      if (col.id === 'acciones') {
        return {
          ...col,
          cell: ({ row }: { row: any }) => {
            return (
              <div className="text-center">
                {row.original.confirmacion === 'Confirmado' ? (
                  <Badge className="bg-success/10 text-success border-success/20">
                    Confirmado
                  </Badge>
                ) : (
                  <DialogModificarPrecio
                    indice={Number(row.original.indice)}
                    descripcion={row.original.descripcion}
                    valorActual={row.original.valor}
                    onSuccess={onRecargarPrecios}
                  />
                )}
              </div>
            );
          }
        };
      }
      return col;
    });
  }, [onRecargarPrecios]);

  // Pasos del tour interactivo con driver.js
  const tourSteps = [
    {
      element: '#confirmar-btn',
      popover: {
        title: '📋 Confirmar Cambios',
        description:
          'Después de seleccionar los registros que deseas confirmar, usa este botón para <strong>guardar los cambios</strong> en el sistema.',
        side: 'top' as const,
        align: 'center' as const
      }
    },
    {
      element: '#tabs-precios-revision',
      popover: {
        title: '🔄 Pestañas de Precios',
        description:
          'Alterna entre <strong>Valores ENEL</strong> y <strong>Precios Agualova</strong> según el ciclo de facturación seleccionado.',
        side: 'top' as const,
        align: 'start' as const
      }
    },
    {
      element: '#selector-ciclo',
      popover: {
        title: '⏰ Selector de Ciclo',
        description:
          'Selecciona el <strong>ciclo de facturación</strong> para ver los precios correspondientes a ese período (día 15 o día 30).',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#tabla-valores-enel',
      popover: {
        title: '💰 Tabla de Valores ENEL',
        description:
          'Aquí se muestran los <strong>precios aplicados de ENEL</strong> para cada contrato. Puedes modificar valores pendientes.',
        side: 'top' as const,
        align: 'start' as const
      }
    },
    {
      element: '#tabla-precios-agualova',
      popover: {
        title: '💼 Tabla de Precios Agualova',
        description:
          'Esta tabla muestra los <strong>precios de Agualova por ciclo</strong>. Revisa y confirma los valores antes de la facturación.',
        side: 'top' as const,
        align: 'start' as const
      }
    }
  ];

  // Función para iniciar el tour
  const startTour = () => {
    const driverjs = driver({
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      smoothScroll: true,
      stagePadding: 4,
      stageRadius: 6,
      animate: true,
      allowClose: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      onHighlightStarted: element => {
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    driverjs.setSteps(tourSteps);
    driverjs.drive();
  };

  // Mostrar error si existe
  if (error) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto p-2 space-y-3">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-xl mb-4">
              <AlertCircleIcon className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Error al cargar datos</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Header */}
          <ModernHeader
            title="Revisar Precios"
            description="Gestión y validación de precios del sistema"
          />

          {/* Botón de Guía Interactiva */}
          <Button
            variant="outline"
            size="sm"
            onClick={startTour}
            className="mb-2"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-1">
                <h3 className="font-medium text-sm sm:text-base">
                  <span className="hidden sm:inline">
                    Confirmación de Cambios
                  </span>
                  <span className="sm:hidden">Confirmación</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  <span className="hidden sm:inline">
                    Registros seleccionados:{' '}
                  </span>
                  <span className="sm:hidden">Seleccionados: </span>
                  <span className="font-medium text-primary">
                    {selectedEnelRows.length + selectedAgualovaRows.length}
                  </span>
                </p>
              </div>
              <Button
                id="confirmar-btn"
                onClick={confirmarCambios}
                disabled={
                  isConfirming ||
                  (selectedEnelRows.length === 0 &&
                    selectedAgualovaRows.length === 0)
                }
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                size="sm"
              >
                <AlertCircleIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {isConfirming ? 'Procesando...' : 'Confirmar Cambios'}
                </span>
                <span className="sm:hidden">
                  {isConfirming ? '...' : 'Confirmar'}
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tablas de Precios con Tabs */}
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-3">
            <Tabs
              id="tabs-precios-revision"
              defaultValue="enel"
              className="w-full"
            >
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="enel"
                  className="relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  <Building2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Valores Enel</span>
                  <span className="sm:hidden">Enel</span>
                </TabsTrigger>
                <TabsTrigger
                  value="agualova"
                  className="relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                >
                  <BarChartIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Precios Agualova</span>
                  <span className="sm:hidden">Agualova</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="enel" className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      <span className="hidden sm:inline">
                        Valores Compañía de Electricidad
                      </span>
                      <span className="sm:hidden">Valores Enel</span>
                    </h3>
                    <p className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">
                        Revisión de precios para el período activo
                      </span>
                      <span className="sm:hidden">Período activo</span>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-muted/50 border-border self-start sm:self-auto"
                  >
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {isPeriodoLoading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : dataPeriodoAbierto && dataPeriodoAbierto.length > 0 ? (
                      <span className="text-xs sm:text-sm">
                        {dataPeriodoAbierto[0].descripcion}
                      </span>
                    ) : (
                      'Sin período'
                    )}
                  </Badge>
                </div>
                <div
                  id="tabla-valores-enel"
                  className="rounded-xl border border-border overflow-hidden bg-card"
                >
                  <DataTableVirtualized
                    columns={configuredColumnsEnel}
                    data={dataConsultarPreciosUno}
                    enableSelection={true}
                    selectedRowIds={selectedEnelRows}
                    onRowSelectionChange={setSelectedEnelRows}
                    isLoading={isLoadingPrecios}
                  />
                </div>
              </TabsContent>

              <TabsContent value="agualova" className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      <span className="hidden sm:inline">
                        Precios por Ciclo de Facturación
                      </span>
                      <span className="sm:hidden">Precios Agualova</span>
                    </h3>
                    <p className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">
                        Precios de ENERLOVA según ciclo de facturación
                      </span>
                      <span className="sm:hidden">
                        Según ciclo de facturación
                      </span>
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-muted/50 border-border self-start sm:self-auto"
                  >
                    <ClockIcon className="w-3 h-3 mr-1" />
                    <span className="text-xs sm:text-sm">
                      Ciclo {cicloSeleccionado}
                    </span>
                  </Badge>
                </div>

                {/* Selector de ciclo */}
                <div
                  id="selector-ciclo"
                  className="flex flex-col lg:flex-row gap-2 lg:gap-3 items-start lg:items-end"
                >
                  <div className="space-y-2 flex-1 w-full">
                    <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                      <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span className="hidden sm:inline">
                        Ciclo de Facturación
                      </span>
                      <span className="sm:hidden">Ciclo</span>
                    </Label>
                    {isCiclosLoading ? (
                      <Skeleton className="h-9 sm:h-10 w-full" />
                    ) : (
                      <Select
                        value={cicloSeleccionado}
                        onValueChange={handleCicloChange}
                        disabled={isPeriodoLoading}
                      >
                        <SelectTrigger className="bg-background border-border h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="Selecciona un ciclo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ciclosFacturacion && ciclosFacturacion.length > 0 ? (
                            ciclosFacturacion.map(ciclo => (
                              <SelectItem
                                key={ciclo.diaFacturacion}
                                value={ciclo.diaFacturacion}
                              >
                                {ciclo.descripcion}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="15">Ciclo día 15</SelectItem>
                              <SelectItem value="30">Ciclo día 30</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Tabla de precios Agualova */}
                <div
                  id="tabla-precios-agualova"
                  className="rounded-xl border border-border overflow-hidden bg-card"
                >
                  <DataTableVirtualized
                    columns={configuredColumnsAgualova}
                    data={dataConsultarPreciosDos}
                    enableSelection={true}
                    selectedRowIds={selectedAgualovaRows}
                    onRowSelectionChange={setSelectedAgualovaRows}
                    isLoading={isLoadingPrecios}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
