/**
 * Componente principal para Revisión de Cálculo de Facturas (OPTIMIZADO)
 *
 * Optimizaciones implementadas:
 * - useCallback para funciones que se pasan como props
 * - useMemo para cálculos pesados
 * - Lazy loading de componentes pesados
 * - Virtualización de lista (preparado para React Window)
 * - Reducción de re-renders innecesarios
 */
import {
  AlertCircleIcon,
  CalendarIcon,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eraser,
  FileSpreadsheet,
  FileTextIcon,
  HelpCircle,
  RefreshCw,
  SearchIcon,
  SettingsIcon,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

import { useMemo, useState, useCallback } from 'react';

import { useAuth } from '~/context/AuthContext';
import { ExportButton } from '~/components/shared/export-button';
import { ModernHeader } from '~/components/shared/modern-header';
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
import { HierarchicalDataTableVirtualized } from './hierarchical-data-table-virtualized';

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
    isCalculoPreparado,
    isProcesando,
    tiempoTranscurrido,
    intentosPolling,
    isCheckingInitialData,
    handleLanzarCalculo,
    handleAceptarCalculo,
    setIsCalculoPreparado
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
    cicloId,
    isCalculoPreparado
  });

  // Función para actualizar los datos (memoizada)
  const handleRefreshData = useCallback(async () => {
    if (!isCalculoPreparado) {
      toast.error('Debe preparar el cálculo primero');
      return;
    }
    toast.info('Actualizando datos...');
    await handleRevisarCalculo();
  }, [isCalculoPreparado, handleRevisarCalculo]);

  // Función para limpiar filtros y reiniciar (memoizada)
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setData([]);
    setIsCalculoPreparado(false);
    setSelectedContratos([]);
  }, [setSearchTerm, setData, setIsCalculoPreparado, setSelectedContratos]);

  // Columnas para exportación (memoizadas)
  const exportColumns = useMemo(
    () => [
      { header: 'Sector', key: 'sector' },
      { header: 'Contrato ID', key: 'contratoId' },
      { header: 'Código Tarifa', key: 'codigoTarifa' },
      { header: 'RUT Cliente', key: 'rutCliente' },
      { header: 'Nombre Cliente', key: 'nombreCliente' },
      { header: 'Local ID', key: 'localId' },
      { header: 'Dirección', key: 'direccion' },
      { header: 'Comuna', key: 'comuna' },
      { header: 'Número Serie', key: 'numeroSerie' },
      { header: 'Fecha Lectura', key: 'fechaLectura' },
      { header: 'Consumo Periodo', key: 'consumoPeriodo' },
      { header: 'Lectura ID', key: 'lecturaId' },
      { header: 'Total Facturado', key: 'totalFacturado' }
    ],
    []
  );

  // Preparar datos para exportación con cargos detallados (optimizado)
  const dataParaExportar = useMemo(() => {
    if (filteredData.length === 0) return [];

    return filteredData.map(item => {
      const cargosPorLinea = item.cargos
        .map(
          (cargo, idx) =>
            `Cargo ${idx + 1}: ${cargo.descripcion} (${cargo.codigoEnerlova}) - Cant: ${cargo.cantidad} - Precio: $${cargo.precioUnitario.toLocaleString()} - Subtotal: $${cargo.subtotal.toLocaleString()}`
        )
        .join(' | ');

      return {
        ...item,
        cargosDetalle: cargosPorLinea
      };
    });
  }, [filteredData]);

  // Columnas de exportación con detalle de cargos (memoizadas)
  const exportColumnsConCargos = useMemo(
    () => [
      ...exportColumns,
      { header: 'Detalle de Cargos', key: 'cargosDetalle' }
    ],
    [exportColumns]
  );

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
            <button
              className='w-full flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 transition-colors text-left'
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
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center'>
                  <FileSpreadsheet className='w-4 h-4' />
                </div>
                <div>
                  <CardTitle className='text-base'>
                    Configuración de Búsqueda
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Configure periodo y parámetros de consulta
                  </CardDescription>
                </div>
              </div>
              <div className='flex items-center'>
                {isFiltersOpen ? (
                  <ChevronUp className='h-4 w-4 text-muted-foreground' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-muted-foreground' />
                )}
              </div>
            </button>

            <CollapsibleContent>
              <CardContent className='px-4 pb-4'>
                <div className='flex flex-col gap-4 w-full'>
                  {/* Campos de filtro */}
                  <div className='flex flex-col sm:flex-row gap-4 w-full'>
                    {/* Periodo */}
                    <div className='flex-1 min-w-0'>
                      <Label className='text-sm font-medium flex items-center gap-2 mb-1'>
                        <CalendarIcon className='w-4 h-4' />
                        Periodo
                      </Label>
                      {periodoAbierto && periodoAbierto.length > 0 ? (
                        <div
                          id='periodo-info'
                          className='p-3 rounded-xl bg-background border border-border'
                        >
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0'>
                              <CalendarIcon className='w-4 h-4 text-primary' />
                            </div>
                            <div>
                              <div className='font-semibold text-sm'>
                                {periodoAbierto[0].mes
                                  .toString()
                                  .padStart(2, '0')}
                                /{periodoAbierto[0].anio}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className='p-3 rounded-xl bg-muted/50 border border-border'>
                          <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 bg-muted rounded-xl flex items-center justify-center flex-shrink-0'>
                              <AlertCircleIcon className='w-4 h-4 text-muted-foreground' />
                            </div>
                            <div>
                              <div className='font-medium text-sm'>
                                No hay periodo abierto
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                Contacte al administrador del sistema
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ciclo de facturación */}
                    <div className='flex-1 min-w-0'>
                      <Label className='text-sm font-medium flex items-center gap-2 mb-1'>
                        <FileTextIcon className='w-4 h-4' />
                        Ciclo de Facturación
                      </Label>
                      <div className='p-3 rounded-xl bg-background border border-border'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0'>
                            <CheckCircle className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <Input
                              value='Ciclo día 15 (Único ciclo normado)'
                              disabled
                              className='bg-transparent border-0 font-medium p-0 h-auto cursor-default text-sm'
                            />
                            <p className='text-xs'>
                              ✓ Ciclo autorizado por normativa vigente
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advertencia de precios no confirmados */}
                {!isLoadingValidacion && !preciosConfirmados && (
                  <div className='p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'>
                    <div className='flex items-start gap-2'>
                      <AlertCircleIcon className='h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0' />
                      <div className='flex-1'>
                        <p className='text-sm font-medium text-amber-900 dark:text-amber-100'>
                          Precios pendientes de confirmación
                        </p>
                        <p className='text-xs text-amber-700 dark:text-amber-300 mt-1'>
                          Debes confirmar {preciosPendientesCount} de{' '}
                          {totalPrecios} precios en{' '}
                          <strong>Revisar Precios</strong> antes de procesar
                          facturas.
                        </p>
                        <p className='text-xs text-amber-600 dark:text-amber-400 mt-1'>
                          ✓ Confirmados: {preciosConfirmadosCount}/
                          {totalPrecios}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje de precios confirmados */}
                {!isLoadingValidacion &&
                  preciosConfirmados &&
                  !isProcesando &&
                  !isCalculoPreparado && (
                    <div className='p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm'>
                      <div className='flex items-start gap-3'>
                        <div className='flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center'>
                          <CheckCircle className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                        </div>
                        <div className='flex-1'>
                          <p className='text-sm font-semibold text-emerald-900 dark:text-emerald-100 flex items-center gap-2'>
                            ✓ Sistema listo para procesar
                          </p>
                          <p className='text-xs text-emerald-700 dark:text-emerald-300 mt-1.5'>
                            {totalPrecios} precios confirmados. Haz clic en{' '}
                            <span className='font-semibold'>
                              "Preparar Cálculo"
                            </span>{' '}
                            para iniciar el procesamiento de facturación.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Indicador de procesamiento */}
                {isProcesando && (
                  <div className='p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-pulse'>
                    <div className='flex items-start gap-3'>
                      <div className='relative flex-shrink-0'>
                        <div className='h-8 w-8 rounded-full border-4 border-blue-200 dark:border-blue-800'></div>
                        <div className='absolute top-0 left-0 h-8 w-8 rounded-full border-4 border-blue-600 dark:border-blue-400 border-t-transparent animate-spin'></div>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-semibold text-blue-900 dark:text-blue-100'>
                          🔄 Procesando cálculos de facturación
                        </p>
                        <p className='text-xs text-blue-700 dark:text-blue-300 mt-1'>
                          El sistema está generando las prefacturas. Este
                          proceso puede tomar varios minutos dependiendo de la
                          cantidad de lecturas cerradas.
                        </p>
                        <div className='mt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-blue-600 dark:text-blue-400'>
                          <div className='flex items-center gap-1'>
                            <div className='h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse'></div>
                            <span>
                              Tiempo: {Math.floor(tiempoTranscurrido / 60)}:
                              {(tiempoTranscurrido % 60)
                                .toString()
                                .padStart(2, '0')}{' '}
                              min
                            </span>
                          </div>
                          <div className='hidden sm:block'>•</div>
                          <div>Verificaciones: {intentosPolling}/10</div>
                        </div>
                        <div className='mt-2'>
                          <div className='w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5'>
                            <div
                              className='bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300'
                              style={{
                                width: `${Math.min((intentosPolling / 150) * 100, 100)}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Indicador de cálculo listo */}
                {isCalculoPreparado &&
                  !isProcesando &&
                  !isCheckingInitialData && (
                    <div className='p-4 rounded-xl bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-2 border-sky-400 dark:border-sky-600 shadow-md animate-pulse'>
                      <div className='flex items-start gap-3'>
                        <div className='flex-shrink-0 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-800 flex items-center justify-center ring-2 ring-sky-400 dark:ring-sky-600 ring-offset-2'>
                          <CheckCircle className='h-5 w-5 text-sky-600 dark:text-sky-400' />
                        </div>
                        <div className='flex-1'>
                          <p className='text-sm font-semibold text-sky-900 dark:text-sky-100 flex items-center gap-2'>
                            ✓ Cálculos disponibles
                            <span className='inline-flex h-2 w-2 rounded-full bg-sky-600 dark:bg-sky-400 animate-ping'></span>
                          </p>
                          <p className='text-xs text-sky-700 dark:text-sky-300 mt-1.5'>
                            Hay cálculos procesados disponibles. Haz clic en el
                            botón{' '}
                            <span className='font-semibold'>
                              "Ver Cálculo Facturas"
                            </span>{' '}
                            para revisarlos.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Indicador de verificación inicial */}
                {isCheckingInitialData && (
                  <div className='p-4 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-2 border-slate-300 dark:border-slate-700 shadow-sm'>
                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center'>
                        <div className='h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-transparent dark:border-slate-400' />
                      </div>
                      <div className='flex-1'>
                        <p className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                          Verificando datos disponibles...
                        </p>
                        <p className='text-xs text-slate-700 dark:text-slate-300 mt-1.5'>
                          Comprobando si hay cálculos procesados previamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className='pt-4 border-t border-border'>
                  <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2'>
                    {/* Botón principal de preparar cálculo */}
                    <Button
                      id='preparar-calculo-btn'
                      onClick={handleLanzarCalculo}
                      disabled={
                        isLaunching ||
                        !preciosConfirmados ||
                        isLoadingValidacion ||
                        isProcesando
                      }
                      variant='default'
                      size='sm'
                      title={
                        isProcesando
                          ? 'Proceso en curso, por favor espere...'
                          : !preciosConfirmados
                            ? 'Debes confirmar todos los precios primero'
                            : 'Preparar cálculo de facturación'
                      }
                      className='bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md'
                    >
                      {isLaunching || isProcesando ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          <span className='hidden sm:inline'>
                            {isProcesando ? 'Procesando...' : 'Preparando...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <SearchIcon className='h-4 w-4' />
                          <span className='hidden sm:inline'>Preparar</span>
                          <span className='sm:hidden'>Preparar Cálculo</span>
                        </>
                      )}
                    </Button>

                    {/* Ver cálculos */}
                    <Button
                      id='ver-calculo-btn'
                      onClick={handleRevisarCalculo}
                      disabled={
                        isLoading ||
                        !preciosConfirmados ||
                        isLoadingValidacion ||
                        isProcesando ||
                        isCheckingInitialData ||
                        !isCalculoPreparado
                      }
                      variant={
                        isCalculoPreparado &&
                        !isProcesando &&
                        !isCheckingInitialData
                          ? 'default'
                          : 'secondary'
                      }
                      size='sm'
                      title={
                        isCheckingInitialData
                          ? 'Verificando datos disponibles...'
                          : isProcesando
                            ? 'Esperando finalización del proceso...'
                            : !isCalculoPreparado
                              ? 'Primero debes preparar el cálculo o espera la verificación inicial'
                              : !preciosConfirmados
                                ? 'Debes confirmar todos los precios primero'
                                : 'Ver cálculos de facturación'
                      }
                      className={
                        isCalculoPreparado &&
                        !isProcesando &&
                        !isCheckingInitialData
                          ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/50 ring-2 ring-sky-400 ring-offset-2 animate-pulse'
                          : ''
                      }
                    >
                      {isLoading ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          <span className='hidden sm:inline'>Cargando...</span>
                        </>
                      ) : (
                        <>
                          <FileTextIcon className='h-4 w-4' />
                          <span className='hidden sm:inline'>
                            {isCalculoPreparado && !isProcesando
                              ? 'Ver Cálculos'
                              : 'Ver'}
                          </span>
                          <span className='sm:hidden'>
                            {isCalculoPreparado && !isProcesando
                              ? 'Ver'
                              : 'Ver'}
                          </span>
                        </>
                      )}
                    </Button>

                    {/* Aceptar cálculo */}
                    <Button
                      id='aceptar-calculo-btn'
                      onClick={handleAceptarCalculo}
                      disabled={
                        isAccepting ||
                        selectedContratos.length === 0 ||
                        !hasPermission
                      }
                      variant='outline'
                      size='sm'
                      title={
                        !hasPermission
                          ? 'No tiene permisos para aceptar cálculos'
                          : selectedContratos.length === 0
                            ? 'Seleccione al menos un contrato'
                            : 'Aceptar cálculos seleccionados'
                      }
                    >
                      {isAccepting ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          <span className='hidden sm:inline'>Aceptando...</span>
                        </>
                      ) : (
                        <>
                          <SettingsIcon className='h-4 w-4' />
                          <span className='hidden sm:inline'>Aceptar</span>
                          <span className='sm:hidden'>Aceptar</span>
                          <span className='ml-1'>
                            ({selectedContratos.length})
                          </span>
                        </>
                      )}
                    </Button>

                    {/* Actualizar */}
                    <Button
                      id='actualizar-btn'
                      onClick={handleRefreshData}
                      variant='link'
                      disabled={isLoading || !isCalculoPreparado}
                      size='sm'
                      className='bg-accent/10 hover:bg-accent/20 transition-colors text-accent-foreground hover:text-accent-foreground/90'
                    >
                      <RefreshCw className='h-4 w-4' />
                      <span className='hidden lg:inline'>Actualizar</span>
                    </Button>

                    {/* Limpiar */}
                    <Button
                      id='limpiar-btn'
                      onClick={handleClearFilters}
                      variant='outline'
                      disabled={isLoading}
                      size='sm'
                      className='border-rose-300 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-700 dark:hover:bg-rose-900/20 dark:hover:text-rose-400'
                    >
                      <Eraser className='h-4 w-4' />
                      <span className='hidden lg:inline'>Limpiar</span>
                    </Button>

                    {/* Exportar */}
                    <div id='exportar-btn' className='flex items-stretch'>
                      <ExportButton
                        data={dataParaExportar}
                        columns={exportColumnsConCargos}
                        filename={`calculo_factura_${periodoFormateado}`}
                        size='sm'
                        showDropdown={true}
                        variant='outline'
                        className='border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 w-full'
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Resultados */}
        <Card className='border border-border shadow-sm'>
          <CardHeader className='border-b border-border bg-background p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center'>
                <TrendingUp className='w-4 h-4' />
              </div>
              <div>
                <CardTitle className='text-base'>
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
                return (
                  <div className='p-6 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 shadow-sm'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl shadow-sm'>
                        <AlertCircleIcon className='h-5 w-5 text-rose-600 dark:text-rose-400' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-semibold text-rose-800 dark:text-rose-200'>
                          {error.includes('No se han encontrado prefacturas')
                            ? 'No se encontraron prefacturas'
                            : 'Error al cargar los datos'}
                        </h4>
                        <p className='text-sm text-rose-600 dark:text-rose-400 mt-1'>
                          {error.includes('No se han encontrado prefacturas')
                            ? 'No se han encontrado prefacturas para el ciclo y periodo elegidos. Verifique que el ciclo y periodo sean correctos.'
                            : 'Los datos no han sido cargados completamente. Recuerde que primero debe tener lecturas en estado Cerradas, con ello cumplido debe hacer clic en Preparar Cálculo Factura y luego en Ver Cálculo Facturas'}
                        </p>

                        <Button
                          onClick={() => window.location.reload()}
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
                <div className='space-y-6'>
                  {/* Resumen estadístico (optimizado con useMemo) */}
                  <div className='grid grid-cols-3 lg:grid-cols-3 gap-4 p-4 bg-background rounded-xl border-border'>
                    <div className='text-center'>
                      <div className='text-2xl font-semibold'>
                        {estadisticas.totalRegistros}
                      </div>
                      <div className='text-xs font-medium'>
                        Lecturas Cerradas
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xl font-semibold'>
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(estadisticas.totalFacturado)}
                      </div>
                      <div className='text-xs font-medium'>Total Facturado</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-semibold'>
                        {estadisticas.totalConsumo.toLocaleString('es-CL')}
                      </div>
                      <div className='text-xs font-medium'>Consumo Kwh</div>
                    </div>
                  </div>

                  {/* Barra de búsqueda */}
                  <div className='relative'>
                    <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
                    <Input
                      type='text'
                      placeholder='Buscar por contrato, nombre, RUT, dirección...'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='pl-10'
                    />
                    {searchTerm && (
                      <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground'>
                        {filteredData.length} de {data.length}
                      </div>
                    )}
                  </div>

                  {/* Contratos seleccionados */}
                  {selectedContratos.length > 0 && (
                    <div className='p-4 bg-muted/50 border border-border rounded-xl'>
                      <div className='flex items-center gap-2 mb-3'>
                        <FileTextIcon className='h-4 w-4 text-primary' />
                        <h4 className='font-medium text-foreground'>
                          Contratos Seleccionados ({selectedContratos.length})
                        </h4>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {selectedContratos.slice(0, 20).map(lecturaId => (
                          <Badge
                            key={lecturaId}
                            variant='outline'
                            className='bg-primary/10 text-primary border-primary/20'
                          >
                            Lectura: {lecturaId}
                          </Badge>
                        ))}
                        {selectedContratos.length > 20 && (
                          <Badge variant='secondary'>
                            +{selectedContratos.length - 20} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Encabezado de tabla */}
                  <div className='flex items-center justify-between py-3 border-b border-border'>
                    <div className='flex items-center gap-2'>
                      <FileTextIcon className='h-4 w-4' />
                      <span className='font-medium'>
                        {filteredData.length} registros
                        {searchTerm && ` (de ${data.length} total)`}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <ChevronRight className='h-3 w-3' />
                      <span>Expandir para ver detalles</span>
                    </div>
                  </div>

                  {/* Tabla de datos */}
                  <div>
                    <HierarchicalDataTableVirtualized
                      columns={columns}
                      data={filteredData}
                      onSelectionChange={handleSelectionChange}
                    />
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
