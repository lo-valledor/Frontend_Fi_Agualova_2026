import {
  AlertCircleIcon,
  CalendarIcon,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileSpreadsheet,
  FileTextIcon,
  HelpCircle,
  SearchIcon,
  TrendingUp,
  Info,
  Plus,
  RefreshCcwIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

import { useMemo, useState, useCallback } from 'react';

import { useAuth } from '~/context/AuthContext';
import { ModernHeader } from '~/components/shared/modern-header';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useCalculoFactura } from '~/hooks/operaciones/use-calculo-factura';
import { useCalculoProceso } from '~/hooks/operaciones/use-calculo-proceso';
import { useValidacionPrecios } from '~/hooks/operaciones/use-validacion-precios';
import {
  type Ciclo,
  type EstadoCierreLecturas,
  type PeriodoAbierto
} from '~/types/operaciones';

import { columns } from './columnsPrecalculo';
import { HierarchicalDataTable } from './hierarchical-data-table';

export default function RevisarCalculoFacturaComponent({
  periodoAbierto,
  ciclosFacturacionActivos: _ciclosFacturacionActivos,
  estadoCierreLecturas: _estadoCierreLecturas
}: Readonly<{
  periodoAbierto: PeriodoAbierto[];
  ciclosFacturacionActivos: Ciclo[];
  estadoCierreLecturas: EstadoCierreLecturas[] | null;
}>) {
  // Estados de UI
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const cicloId = '1';

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/operaciones/revisar-calculo-factura';
  const hasPermission = canCreate(route) || canEdit(route);

  // Memoizar periodo formateado
  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      return `${mes.toString().padStart(2, '0')}${anio.toString()}`;
    }
    return '';
  }, [periodoAbierto]);

  // Validar que los precios estén confirmados
  const {
    preciosConfirmados,
    isLoading: isLoadingValidacion,
    preciosConfirmadosCount,
    preciosPendientesCount,
    totalPrecios
  } = useValidacionPrecios({
    periodoFormateado,
    cicloId
  });

  // Usar los hooks personalizados
  const {
    isLaunching,
    isAccepting,
    selectedContratos,
    setSelectedContratos,
    handleLanzarCalculo,
    handleAceptarCalculo
  } = useCalculoProceso({
    periodoFormateado,
    cicloId,
    onCalculoAceptado: useCallback(() => {
      handleRevisarCalculo();
    }, [])
  });

  const {
    data,
    filteredData,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    handleRevisarCalculo,
    setData
  } = useCalculoFactura({
    periodoFormateado,
    cicloId
  });

  // Estadísticas calculadas (memoizadas)
  const estadisticas = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalRegistros: 0,
        totalFacturado: 0,
        totalConsumo: 0
      };
    }

    return {
      totalRegistros: filteredData.length,
      totalFacturado: filteredData.reduce(
        (sum, item) => sum + (item.totalFacturado || 0),
        0
      ),
      totalConsumo: filteredData.reduce(
        (sum, item) => sum + (item.consumoPeriodo || 0),
        0
      )
    };
  }, [filteredData]);

  // Handler para cambio de selección (memoizado)
  const handleSelectionChange = useCallback(
    (selectedItems: any[]) => {
      setSelectedContratos(selectedItems.map(item => item.lecturaId));
    },
    [setSelectedContratos]
  );

  // Pasos del tour interactivo (memoizados)
  const tourSteps = useMemo(
    () => [
      {
        element: '#periodo-info',
        popover: {
          title: '📅 Período de Facturación',
          description:
            'Aquí se muestra el período activo para facturación. Solo se puede trabajar con períodos abiertos.',
          side: 'bottom' as const,
          align: 'start' as const
        }
      },
      {
        element: '#preparar-calculo-btn',
        popover: {
          title: '🔄 Preparar Cálculo',
          description:
            '¡Empezar aquí! Este botón <strong>inicia el procesamiento</strong> de facturación.<br/><br/><strong>Requisito:</strong> Confirmar todos los precios en "Revisar Precios".<br/><br/><strong>⏱️ Proceso automático:</strong> El sistema verificará cada 4 segundos si los datos están listos y te notificará cuando puedas ver los resultados.',
          side: 'bottom' as const,
          align: 'center' as const
        }
      },
      {
        element: '#ver-calculo-btn',
        popover: {
          title: '👁️ Ver Cálculos',
          description:
            'Este botón se <strong>habilitará automáticamente</strong> cuando el sistema termine de procesar los cálculos.<br/><br/>📊 Recibirás una notificación indicando el tiempo de procesamiento y la cantidad de registros listos.',
          side: 'bottom' as const,
          align: 'center' as const
        }
      },
      {
        element: '#aceptar-calculo-btn',
        popover: {
          title: '✅ Aceptar Cálculo',
          description:
            'Finaliza el proceso <strong>aceptando</strong> los cálculos seleccionados. Solo funciona con contratos marcados.',
          side: 'bottom' as const,
          align: 'center' as const
        }
      },
      {
        element: '#actualizar-btn',
        popover: {
          title: '🔄 Actualizar Datos',
          description:
            'Refresca los datos mostrados sin perder el estado de preparación del cálculo.',
          side: 'bottom' as const,
          align: 'center' as const
        }
      },
      {
        element: '#limpiar-btn',
        popover: {
          title: '🧹 Limpiar Todo',
          description:
            'Reinicia completamente el proceso: limpia filtros, datos y estados para empezar de nuevo.',
          side: 'bottom' as const,
          align: 'center' as const
        }
      },
      {
        element: '#exportar-btn',
        popover: {
          title: '📥 Exportar Resultados',
          description:
            'Descarga los resultados del cálculo en formato <strong>Excel (.xlsx)</strong> o <strong>CSV (.csv)</strong> con todos los detalles de cargos.',
          side: 'bottom' as const,
          align: 'center' as const
        }
      }
    ],
    []
  );

  // Función para iniciar el tour (memoizada)
  const startTour = useCallback(() => {
    setIsMenuOpen(true);
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
  }, [tourSteps]);

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-[1880px] mx-auto p-3 space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <ModernHeader
            title='Revisar Cálculo de Factura'
            description='Gestión y revisión de cálculos de facturación por periodo'
          />

          <Button
            variant='outline'
            size='sm'
            onClick={startTour}
            className='mb-2'
          >
            <HelpCircle className='h-4 w-4' />
          </Button>
        </div>

        {/* Panel de Control */}
        <Card className='border border-border shadow-sm'>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <Button
              variant='ghost'
              size='sm'
              className='w-full flex justify-between items-center px-4 py-3 h-auto cursor-pointer hover:bg-muted/40 transition-colors rounded-b-none'
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFiltersOpen(!isFiltersOpen);
                }
              }}
              aria-expanded={isFiltersOpen}
              aria-controls='filters-content'
              type='button'
            >
              <div className='flex items-center gap-2.5'>
                <FileSpreadsheet className='w-4 h-4 text-muted-foreground' />
                <div className='text-left'>
                  <p className='text-sm font-medium leading-none'>
                    Configuración de Búsqueda
                  </p>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Configure periodo y parámetros de consulta
                  </p>
                </div>
              </div>
              {isFiltersOpen ? (
                <ChevronUp className='h-4 w-4 text-muted-foreground shrink-0' />
              ) : (
                <ChevronDown className='h-4 w-4 text-muted-foreground shrink-0' />
              )}
            </Button>

            <CollapsibleContent>
              <CardContent className='px-4 pt-3 pb-4 border-t border-border space-y-3'>
                {/* Campos de filtro */}
                <div className='flex flex-col sm:flex-row gap-3'>
                  {/* Periodo */}
                  <div className='flex-1 min-w-0'>
                    <Label className='text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5'>
                      <CalendarIcon className='w-3.5 h-3.5' />
                      Periodo
                    </Label>
                    {periodoAbierto && periodoAbierto.length > 0 ? (
                      <div
                        id='periodo-info'
                        className='h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center gap-2'
                      >
                        <CalendarIcon className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
                        <span className='font-medium text-sm'>
                          {periodoAbierto[0].mes.toString().padStart(2, '0')}/
                          {periodoAbierto[0].anio}
                        </span>
                      </div>
                    ) : (
                      <div className='h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center gap-2'>
                        <AlertCircleIcon className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
                        <span className='text-sm text-muted-foreground'>
                          Sin periodo abierto
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Ciclo de facturación */}
                  <div className='flex-1 min-w-0'>
                    <Label className='text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5'>
                      <FileTextIcon className='w-3.5 h-3.5' />
                      Ciclo de Facturación
                    </Label>
                    <div className='h-9 px-3 rounded-md bg-muted/40 border border-border flex items-center gap-2'>
                      <CheckCircle className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
                      <span className='text-sm truncate'>Ciclo día 15</span>
                    </div>
                  </div>
                </div>

                {/* Estado de precios */}
                {!isLoadingValidacion && !preciosConfirmados && (
                  <div className='flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400'>
                    <AlertCircleIcon className='h-4 w-4 mt-0.5 shrink-0' />
                    <div>
                      <p className='text-sm font-medium'>
                        Precios pendientes de confirmación
                      </p>
                      <p className='text-xs mt-0.5 opacity-80'>
                        Confirma {preciosPendientesCount} de {totalPrecios}{' '}
                        precios en <strong>Revisar Precios</strong> antes de
                        continuar. ({preciosConfirmadosCount}/{totalPrecios}{' '}
                        confirmados)
                      </p>
                    </div>
                  </div>
                )}

                {!isLoadingValidacion && preciosConfirmados && (
                  <div className='flex items-center gap-2 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400'>
                    <CheckCircle className='h-4 w-4 shrink-0' />
                    <div>
                      <p className='text-sm font-medium'>
                        {totalPrecios} precios confirmados — listo para procesar
                      </p>
                      <p className='text-xs mt-0.5 opacity-80'>
                        El proceso puede tardar varios minutos. Use "Ver Cálculo
                        Facturas" para consultar los resultados.
                      </p>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className='flex gap-2 pt-1 border-t border-border'>
                  <Button
                    id='preparar-calculo-btn'
                    onClick={handleLanzarCalculo}
                    disabled={
                      isLaunching || !preciosConfirmados || isLoadingValidacion
                    }
                    variant='default'
                    size='sm'
                    title={
                      !preciosConfirmados
                        ? 'Debes confirmar todos los precios primero'
                        : 'Preparar cálculo de facturación'
                    }
                  >
                    {isLaunching ? (
                      <>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                        <span className='hidden sm:inline'>Preparando...</span>
                      </>
                    ) : (
                      <>
                        <SearchIcon className='h-4 w-4' />
                        <span className='hidden sm:inline'>
                          Preparar Cálculo
                        </span>
                        <span className='sm:hidden'>Preparar</span>
                      </>
                    )}
                  </Button>

                  <Button
                    id='ver-calculo-btn'
                    onClick={handleRevisarCalculo}
                    disabled={
                      isLoading || !preciosConfirmados || isLoadingValidacion
                    }
                    variant='secondary'
                    size='sm'
                    title={
                      !preciosConfirmados
                        ? 'Debes confirmar todos los precios primero'
                        : 'Ver cálculos de facturación'
                    }
                  >
                    {isLoading ? (
                      <>
                        <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                        <span className='hidden sm:inline'>Cargando...</span>
                      </>
                    ) : (
                      <>
                        <FileTextIcon className='h-4 w-4' />
                        <span className='hidden sm:inline'>
                          Ver Cálculo Facturas
                        </span>
                        <span className='sm:hidden'>Ver Cálculo</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Resultados */}
        <Card className='border border-border shadow-sm'>
          <CardHeader className='border-b border-border px-4 py-3'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-4 h-4 text-muted-foreground' />
              <div>
                <CardTitle className='text-sm font-medium'>
                  Resultados de Consulta
                </CardTitle>
                <CardDescription className='text-xs'>
                  Contratos y cálculos de facturación
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-4'>
            {(() => {
              if (isLoading) {
                return (
                  <div className='flex justify-center items-center h-40'>
                    <div className='flex flex-col items-center gap-4'>
                      <div className='relative'>
                        <div className='w-12 h-12 rounded-full border-4 border-primary/20'></div>
                        <div className='absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin'></div>
                      </div>
                      <div className='text-center'>
                        <p className='text-foreground font-medium'>
                          Cargando resultados...
                        </p>
                        <p className='text-xs text-muted-foreground mt-1'>
                          Por favor espere mientras procesamos su consulta
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }

              if (error) {
                // Caso especial: No hay lecturas cerradas (404)
                if (error === 'NO_LECTURAS_CERRADAS') {
                  return (
                    <Alert className='border-emerald-300 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 dark:border-emerald-800 shadow-sm'>
                      <CheckCircle className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                      <AlertTitle className='text-emerald-900 dark:text-emerald-100 font-bold text-lg'>
                        ✓ Sistema al día - No hay lecturas pendientes de
                        facturar
                      </AlertTitle>
                      <AlertDescription className='text-emerald-800 dark:text-emerald-200 mt-3'>
                        <div className='p-4 bg-white/60 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 mb-3'>
                          <p className='font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2'>
                            <CheckCircle className='h-4 w-4' />
                            Estado actual
                          </p>
                          <p className='text-sm mt-2'>
                            Todas las lecturas cerradas del periodo{' '}
                            <strong>
                              {periodoAbierto?.[0]?.mes
                                ?.toString()
                                .padStart(2, '0')}
                              /{periodoAbierto?.[0]?.anio}
                            </strong>{' '}
                            ya han sido procesadas y facturadas correctamente.
                          </p>
                        </div>

                        <div className='p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800'>
                          <p className='text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2'>
                            <Info className='h-4 w-4' />
                            ¿Necesitas procesar nuevas facturas?
                          </p>
                          <ol className='list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-200 ml-2'>
                            <li>
                              Ve a{' '}
                              <strong>
                                "Operaciones → Cierre de Lecturas"
                              </strong>
                            </li>
                            <li>
                              Cierra las lecturas pendientes del periodo actual
                            </li>
                            <li>
                              Regresa aquí y haz clic en{' '}
                              <strong>"Preparar Cálculo"</strong>
                            </li>
                            <li>
                              Espera el procesamiento y luego{' '}
                              <strong>"Ver Cálculo Facturas"</strong>
                            </li>
                          </ol>
                        </div>
                      </AlertDescription>
                    </Alert>
                  );
                }

                // Otros errores
                return (
                  <div className='p-6 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 shadow-sm'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl shadow-sm'>
                        <AlertCircleIcon className='h-5 w-5 text-rose-600 dark:text-rose-400' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-semibold text-rose-800 dark:text-rose-200'>
                          Error al cargar los datos
                        </h4>
                        <p className='text-sm text-rose-600 dark:text-rose-400 mt-1'>
                          {error}
                        </p>

                        <Button
                          onClick={() => globalThis.location.reload()}
                          variant='outline'
                          size='sm'
                          className='mt-3 border-rose-200 hover:bg-rose-50 dark:border-rose-700 dark:hover:bg-rose-900/20'
                        >
                          Cerrar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }

              if (data.length === 0) {
                return (
                  <div className='flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground'>
                    <div className='p-4 bg-primary/10 rounded-full'>
                      <SearchIcon className='h-8 w-8 text-primary' />
                    </div>
                    <div className='text-center'>
                      <p className='font-medium text-sm sm:text-base'>
                        <span className='hidden sm:inline'>
                          Realizar consulta de precálculos
                        </span>
                        <span className='sm:hidden'>Realizar consulta</span>
                      </p>
                      <p className='text-xs sm:text-sm mt-1'>
                        <span className='hidden sm:inline'>
                          Selecciona un ciclo y haz clic en "Preparar Cálculo"
                          para ver los resultados
                        </span>
                        <span className='sm:hidden'>
                          Haz clic en "Preparar Cálculo"
                        </span>
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div className='space-y-4'>
                  {/* Resumen estadístico */}
                  <div className='grid grid-cols-3 divide-x divide-border border border-border rounded-md'>
                    <div className='px-4 py-3 text-center'>
                      <div className='text-xl font-semibold tabular-nums'>
                        {estadisticas.totalRegistros}
                      </div>
                      <div className='text-xs text-muted-foreground mt-0.5'>
                        Lecturas Cerradas
                      </div>
                    </div>
                    <div className='px-4 py-3 text-center'>
                      <div className='text-lg font-semibold tabular-nums'>
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(estadisticas.totalFacturado)}
                      </div>
                      <div className='text-xs text-muted-foreground mt-0.5'>
                        Total Facturado
                      </div>
                    </div>
                    <div className='px-4 py-3 text-center'>
                      <div className='text-xl font-semibold tabular-nums'>
                        {estadisticas.totalConsumo.toLocaleString('es-CL')}
                      </div>
                      <div className='text-xs text-muted-foreground mt-0.5'>
                        Consumo kWh
                      </div>
                    </div>
                  </div>

                  {/* Barra de búsqueda */}
                  <div className='relative'>
                    <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      type='text'
                      placeholder='Buscar por contrato, nombre, RUT, dirección...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='pl-10'
                    />
                    {searchTerm && (
                      <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                        {filteredData.length}/{data.length}
                      </span>
                    )}
                  </div>

                  {/* Contratos seleccionados */}
                  {selectedContratos.length > 0 && (
                    <div className='px-3 py-2.5 bg-muted/40 border border-border rounded-md'>
                      <div className='flex items-center gap-1.5 mb-2'>
                        <FileTextIcon className='h-3.5 w-3.5 text-muted-foreground' />
                        <span className='text-xs font-medium text-muted-foreground'>
                          {selectedContratos.length} seleccionados
                        </span>
                      </div>
                      <div className='flex flex-wrap gap-1.5'>
                        {selectedContratos.slice(0, 20).map(lecturaId => (
                          <Badge
                            key={lecturaId}
                            variant='outline'
                            className='text-xs h-5'
                          >
                            {lecturaId}
                          </Badge>
                        ))}
                        {selectedContratos.length > 20 && (
                          <Badge variant='secondary' className='text-xs h-5'>
                            +{selectedContratos.length - 20}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Info tabla */}
                  <div className='flex items-center justify-between text-xs text-muted-foreground'>
                    <span>
                      {filteredData.length} registros
                      {searchTerm && ` de ${data.length}`}
                    </span>
                    <span className='flex items-center gap-1'>
                      <ChevronRight className='h-3 w-3' />
                      Expandir fila para ver detalles
                    </span>
                  </div>

                  {/* Tabla de datos */}
                  <HierarchicalDataTable
                    columns={columns}
                    data={filteredData}
                    onSelectionChange={handleSelectionChange}
                  />
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* Barra de acciones flotante (drawer desde la derecha) */}
        <div
          className={`fixed top-1/3 right-0 z-50 flex items-start transition-transform
                         duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-[calc(100%-2.5rem)]'}`}
        >
          {/* Botón de control del menú (siempre visible en el borde) */}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant='default'
            size='icon'
            className='h-20 w-10 rounded-l-full rounded-r-none shadow-lg hover:bg-primary/40 border-r-0'
            title={
              isMenuOpen
                ? 'Ocultar menú de acciones'
                : 'Mostrar menú de acciones'
            }
          >
            {isMenuOpen ? (
              <ChevronRight className='h-5 w-5' />
            ) : (
              <ChevronDown className='h-5 w-5 -rotate-90' />
            )}
          </Button>

          {/* Contenedor del menú que se desliza */}
          <div className='flex flex-col gap-1.5 bg-background border border-border rounded-l-lg p-2 shadow-lg'>
            {/* Indicador de selección */}
            {selectedContratos.length > 0 && isMenuOpen && (
              <div className='absolute -left-36 top-0 bg-popover border border-border text-popover-foreground px-3 py-1.5 rounded-md shadow-md text-xs font-medium whitespace-nowrap'>
                {selectedContratos.length}{' '}
                {selectedContratos.length === 1 ? 'cálculo' : 'cálculos'}
              </div>
            )}

            {/* Aceptar Cálculo */}
            <Button
              id='aceptar-calculo-btn'
              onClick={handleAceptarCalculo}
              disabled={
                isAccepting || selectedContratos.length === 0 || !hasPermission
              }
              variant='default'
              size='sm'
              title={
                !hasPermission
                  ? 'No tiene permisos para aceptar cálculos'
                  : selectedContratos.length === 0
                    ? 'Seleccione al menos un contrato'
                    : `Aceptar ${selectedContratos.length} ${selectedContratos.length === 1 ? 'cálculo' : 'cálculos'} seleccionado(s)`
              }
            >
              {isAccepting ? (
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
              ) : (
                <CheckCircle className='h-4 w-4' />
              )}
            </Button>

            {/* Actualizar */}
            <Button
              id='actualizar-btn'
              onClick={handleRevisarCalculo}
              disabled={isLoading}
              variant='outline'
              size='sm'
              title='Actualizar datos'
            >
              <RefreshCcwIcon className='h-4 w-4' />
            </Button>

            {/* Limpiar */}
            <Button
              id='limpiar-btn'
              onClick={() => {
                setSearchTerm('');
                setSelectedContratos([]);
              }}
              disabled={isLoading}
              variant='outline'
              size='sm'
              title='Limpiar filtros y selecciones'
            >
              <Plus className='h-4 w-4 rotate-45' />
            </Button>

            {/* Exportar */}
            <Button
              id='exportar-btn'
              onClick={() => {
                if (filteredData.length === 0) {
                  toast.error('No hay datos para exportar');
                  return;
                }
                toast.success(`Exportando ${filteredData.length} registros...`);
              }}
              disabled={filteredData.length === 0 || isLoading}
              variant='outline'
              size='sm'
              title='Exportar datos'
            >
              <FileSpreadsheet className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
