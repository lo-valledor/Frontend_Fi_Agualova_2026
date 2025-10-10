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

import { useMemo, useState } from 'react';

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
// Removido useOperaciones ya que los datos vienen como props
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
// Import hooks
import { useCalculoFactura } from '~/hooks/operaciones/use-calculo-factura';
import { useCalculoProceso } from '~/hooks/operaciones/use-calculo-proceso';
import { type Ciclo, type PeriodoAbierto } from '~/types/operaciones';

import { columns } from './columnsPrecalculo';
import { HierarchicalDataTable } from './hierarchical-data-table';

export default function RevisarCalculoFacturaComponent({
  periodoAbierto,
  ciclosFacturacionActivos: _ciclosFacturacionActivos
}: Readonly<{
  periodoAbierto: PeriodoAbierto[];
  ciclosFacturacionActivos: Ciclo[];
}>) {
  // Estados de UI
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  // Fijamos el ciclo como día 15 (valor '1' para la API)
  const cicloId = '1';

  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      return `${mes.toString().padStart(2, '0')}${anio.toString()}`;
    }
    return '';
  }, [periodoAbierto]);

  // Usar los hooks personalizados
  const {
    isLaunching,
    isAccepting,
    selectedContratos,
    setSelectedContratos,
    isCalculoPreparado,
    handleLanzarCalculo,
    handleAceptarCalculo,
    setIsCalculoPreparado
  } = useCalculoProceso({
    periodoFormateado,
    cicloId,
    onCalculoAceptado: () => {
      // Refrescar datos después de aceptar cálculo
      handleRevisarCalculo();
    }
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

  // Función para actualizar los datos
  const handleRefreshData = async () => {
    if (!isCalculoPreparado) {
      toast.error('Debe preparar el cálculo primero');
      return;
    }

    toast.info('Actualizando datos...');
    await handleRevisarCalculo();
  };

  // Función para limpiar filtros y reiniciar
  const handleClearFilters = () => {
    setSearchTerm('');
    setData([]);
    setIsCalculoPreparado(false);
    setSelectedContratos([]);
  };

  // Pasos del tour interactivo con driver.js
  const tourSteps = [
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
          '¡Empezar aquí! Este botón <strong>prepara</strong> los datos necesarios para el cálculo de facturación. Es el primer paso obligatorio.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#ver-calculo-btn',
      popover: {
        title: '👁️ Ver Cálculos',
        description:
          'Después de preparar, usa este botón para <strong>visualizar</strong> los cálculos generados y revisar los contratos.',
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

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='max-w-[1880px] mx-auto p-3 space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          {/* Header */}
          <ModernHeader
            title='Revisar Cálculo de Factura'
            description='Gestión y revisión de cálculos de facturación por periodo'
          />

          {/* Botón para iniciar el tour interactivo */}
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
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <button
              className='w-full flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors text-left'
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFiltersOpen(!isFiltersOpen);
                }
              }}
              aria-expanded={isFiltersOpen}
              aria-controls='filters-content'
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center'>
                  <FileSpreadsheet className='w-4 h-4 text-slate-600 dark:text-slate-400' />
                </div>
                <div>
                  <CardTitle className='text-base text-slate-900 dark:text-slate-100'>
                    Configuración de Búsqueda
                  </CardTitle>
                  <CardDescription className='text-slate-600 dark:text-slate-400 text-xs'>
                    Configure periodo y parámetros de consulta
                  </CardDescription>
                </div>
              </div>
              <div className='flex items-center'>
                {isFiltersOpen ? (
                  <ChevronUp className='h-4 w-4 text-slate-500' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-slate-500' />
                )}
              </div>
            </button>

            <CollapsibleContent>
              <CardContent className='px-4 pb-4 space-y-4'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                  {/* Periodo */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                      <CalendarIcon className='w-4 h-4' />
                      Periodo Actual
                    </Label>
                    {periodoAbierto && periodoAbierto.length > 0 ? (
                      <div
                        id='periodo-info'
                        className='p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                            <CalendarIcon className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                          </div>
                          <div>
                            <div className='font-semibold text-slate-900 dark:text-slate-100'>
                              {periodoAbierto[0].mes
                                .toString()
                                .padStart(2, '0')}
                              /{periodoAbierto[0].anio}
                            </div>
                            <p className='text-xs text-slate-600 dark:text-slate-400'>
                              Periodo activo para facturación
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-amber-100 dark:bg-amber-800/50 rounded-lg flex items-center justify-center'>
                            <AlertCircleIcon className='w-4 h-4 text-amber-600 dark:text-amber-400' />
                          </div>
                          <div>
                            <div className='font-medium text-amber-800 dark:text-amber-200'>
                              No hay periodo abierto
                            </div>
                            <p className='text-xs text-amber-600 dark:text-amber-400'>
                              Contacte al administrador del sistema
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ciclo de facturación */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                      <FileTextIcon className='w-4 h-4' />
                      Ciclo de Facturación
                    </Label>
                    <div className='p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'>
                      <div className='flex items-center gap-3'>
                        <div className='w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center'>
                          <CheckCircle className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                        </div>
                        <div className='flex-1'>
                          <Input
                            value='Ciclo día 15 (Único ciclo normado)'
                            disabled
                            className='bg-transparent border-0 text-slate-900 dark:text-slate-100 font-medium p-0 h-auto cursor-default'
                          />
                          <p className='text-xs text-slate-600 dark:text-slate-400'>
                            ✓ Ciclo autorizado por normativa vigente
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className='pt-4 border-t border-slate-200 dark:border-slate-700'>
                  {/* Todos los botones en una sola fila responsive */}
                  <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2'>
                    {/* Botón principal de preparar cálculo */}
                    <Button
                      id='preparar-calculo-btn'
                      onClick={handleLanzarCalculo}
                      disabled={isLaunching}
                      className='flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white col-span-2 sm:col-span-1'
                      size='sm'
                    >
                      {isLaunching ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          <span className='hidden sm:inline'>
                            Preparando...
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
                      disabled={isLoading}
                      className='flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white'
                      size='sm'
                    >
                      {isLoading ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          <span className='hidden sm:inline'>Cargando...</span>
                        </>
                      ) : (
                        <>
                          <FileTextIcon className='h-4 w-4' />
                          <span className='hidden sm:inline'>Ver</span>
                          <span className='sm:hidden'>Ver Cálculos</span>
                        </>
                      )}
                    </Button>

                    {/* Aceptar cálculo */}
                    <Button
                      id='aceptar-calculo-btn'
                      onClick={handleAceptarCalculo}
                      disabled={isAccepting || selectedContratos.length === 0}
                      className='flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white'
                      size='sm'
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
                      variant='outline'
                      disabled={isLoading || !isCalculoPreparado}
                      size='sm'
                      className='flex items-center justify-center gap-2'
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
                      className='flex items-center justify-center gap-2'
                    >
                      <Eraser className='h-4 w-4' />
                      <span className='hidden lg:inline'>Limpiar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Resultados */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardHeader className='border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center'>
                <TrendingUp className='w-4 h-4 text-slate-600 dark:text-slate-400' />
              </div>
              <div>
                <CardTitle className='text-base text-slate-900 dark:text-slate-100'>
                  Resultados de Consulta
                </CardTitle>
                <CardDescription className='text-slate-600 dark:text-slate-400 text-xs'>
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
                        <div className='w-12 h-12 rounded-full border-4 border-sky-200 dark:border-sky-800'></div>
                        <div className='absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-sky-600 border-t-transparent animate-spin'></div>
                      </div>
                      <div className='text-center'>
                        <p className='text-sky-700 dark:text-sky-300 font-medium'>
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
                  <div className='p-6 rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 shadow-sm'>
                    <div className='flex items-start gap-3'>
                      <div className='p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg shadow-sm'>
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
                            : 'Los datos no han sido cargados completamente. Recuerde que debe hacer clic en Preparar Cálculo Factura y luego en Ver Cálculo Facturas'}
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
                    <div className='p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full'>
                      <SearchIcon className='h-8 w-8 text-sky-500 dark:text-sky-400' />
                    </div>
                    <div className='text-center'>
                      <p className='font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-base'>
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
                  {/* Resumen estadístico */}
                  <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700'>
                    <div className='text-center'>
                      <div className='text-2xl font-semibold text-slate-900 dark:text-slate-100'>
                        {filteredData.length}
                      </div>
                      <div className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                        Lecturas Cerradas
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-semibold text-slate-900 dark:text-slate-100'>
                        {filteredData.reduce(
                          (sum, item) => sum + (item.cargos?.length || 0),
                          0
                        )}
                      </div>
                      <div className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                        Cargos Detallados
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
                        {new Intl.NumberFormat('es-CL', {
                          style: 'currency',
                          currency: 'CLP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(
                          filteredData.reduce(
                            (sum, item) => sum + (item.totalFacturado || 0),
                            0
                          )
                        )}
                      </div>
                      <div className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                        Total Facturado
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-semibold text-slate-900 dark:text-slate-100'>
                        {filteredData
                          .reduce(
                            (sum, item) => sum + (item.consumoPeriodo || 0),
                            0
                          )
                          .toLocaleString('es-CL')}
                      </div>
                      <div className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                        Consumo Kwh
                      </div>
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
                      <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500'>
                        {filteredData.length} de {data.length}
                      </div>
                    )}
                  </div>

                  {/* Contratos seleccionados */}
                  {selectedContratos.length > 0 && (
                    <div className='p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg'>
                      <div className='flex items-center gap-2 mb-3'>
                        <FileTextIcon className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                        <h4 className='font-medium text-amber-800 dark:text-amber-200'>
                          Contratos Seleccionados ({selectedContratos.length})
                        </h4>
                      </div>
                      <div className='flex flex-wrap gap-2'>
                        {selectedContratos.map(lecturaId => (
                          <Badge
                            key={lecturaId}
                            variant='outline'
                            className='bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-800/50 dark:text-amber-300 dark:border-amber-600'
                          >
                            Lectura: {lecturaId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Encabezado de tabla */}
                  <div className='flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700'>
                    <div className='flex items-center gap-2'>
                      <FileTextIcon className='h-4 w-4 text-slate-600 dark:text-slate-400' />
                      <span className='font-medium text-slate-900 dark:text-slate-100'>
                        {filteredData.length} registros
                        {searchTerm && ` (de ${data.length} total)`}
                      </span>
                    </div>
                    <div className='flex items-center gap-2 text-xs text-slate-500'>
                      <ChevronRight className='h-3 w-3' />
                      <span>Expandir para ver detalles</span>
                    </div>
                  </div>

                  {/* Tabla de datos */}
                  <div className=''>
                    <HierarchicalDataTable
                      columns={columns}
                      data={filteredData}
                      onSelectionChange={selectedItems => {
                        setSelectedContratos(
                          selectedItems.map(item => item.lecturaId)
                        );
                      }}
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
