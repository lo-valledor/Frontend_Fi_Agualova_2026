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
  InfoIcon,
  RefreshCw,
  SearchIcon,
  SettingsIcon,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { useMemo, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  ciclosFacturacionActivos: _ciclosFacturacionActivos,
}: {
  periodoAbierto: PeriodoAbierto[];
  ciclosFacturacionActivos: Ciclo[];
}) {
  // Estados de UI
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
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
    setIsCalculoPreparado,
  } = useCalculoProceso({
    periodoFormateado,
    cicloId,
    onCalculoAceptado: () => {
      // Refrescar datos después de aceptar cálculo
      handleRevisarCalculo();
    },
  });

  const {
    data,
    filteredData,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    handleRevisarCalculo,
    setData,
  } = useCalculoFactura({
    periodoFormateado,
    cicloId,
    isCalculoPreparado,
  });

  // Tutorial: Función para manejar la preparación del cálculo con tutorial
  const handlePreparacionConTutorial = async () => {
    await handleLanzarCalculo();

    // Mostrar mensaje tutorial después de preparar
    if (isCalculoPreparado) {
      toast.success('¡Paso 1 completado! Cálculo preparado exitosamente', {
        description: 'Ahora haz clic en "Ver Cálculo Facturas" para continuar',
        duration: 6000,
      });
    }
  };

  // Tutorial: Función para manejar la revisión con tutorial
  const handleRevisarConTutorial = async () => {
    if (!isCalculoPreparado) {
      toast.info('Tutorial: Primero debes preparar el cálculo', {
        description: 'Haz clic en "Preparar Cálculo" para comenzar',
        duration: 5000,
      });
      return;
    }

    await handleRevisarCalculo();

    // Mostrar mensaje tutorial después de ver resultados
    if (data.length > 0) {
      toast.success('¡Paso 2 completado! Resultados cargados', {
        description:
          'Ahora puedes seleccionar contratos y hacer clic en "Aceptar Cálculo"',
        duration: 6000,
      });
    }
  };

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

  return (
    <div className='min-h-screen '>
      <div className='container mx-auto p-2 space-y-3'>
        {/* Modern Header */}
        <div className='flex items-center gap-3 py-1 border-b border-slate-200 dark:border-slate-700'>
          <div className='flex-1'>
            <div className='flex items-center gap-3 justify-between'>
              <div className='flex items-center gap-3'>
                <h1 className='text-3xl font-bold bg-clip-text text-sky-900 dark:text-sky-100'>
                  Revisar Cálculo Factura
                </h1>
              </div>
            </div>
          </div>
        </div>
        {/* Minimalist Tutorial Guide */}
        <Card className='border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'>
          <Collapsible open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
            <div
              className='flex items-center justify-between p-3 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors'
              onClick={() => setIsTutorialOpen(!isTutorialOpen)}
            >
              <div className='flex items-center gap-3'>
                <div className='w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center'>
                  <InfoIcon className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                </div>
                <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
                  📚 Tutorial: 3 pasos para gestionar cálculos
                </span>
                <div className='flex items-center gap-1 ml-2'>
                  <div
                    className={`w-2 h-2 rounded-full ${isCalculoPreparado ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full ${data.length > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                  <div
                    className={`w-2 h-2 rounded-full ${selectedContratos.length > 0 ? 'bg-amber-500' : 'bg-gray-300'}`}
                  />
                </div>
              </div>
              <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                {isTutorialOpen ? (
                  <ChevronUp className='h-4 w-4 text-blue-600' />
                ) : (
                  <ChevronDown className='h-4 w-4 text-blue-600' />
                )}
              </Button>
            </div>
            <CollapsibleContent>
              <div className='px-3 pb-3 space-y-2'>
                <div className='flex items-center gap-2 text-xs'>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${isCalculoPreparado ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}
                  >
                    1
                  </div>
                  <span className='text-blue-700 dark:text-blue-300 font-medium'>
                    Preparar Cálculo
                  </span>
                  {isCalculoPreparado && (
                    <span className='text-emerald-600 text-xs'>✓</span>
                  )}
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${data.length > 0 ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}
                  >
                    2
                  </div>
                  <span
                    className={`font-medium ${data.length > 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500'}`}
                  >
                    Ver Cálculo Facturas
                  </span>
                  {data.length > 0 && (
                    <span className='text-emerald-600 text-xs'>✓</span>
                  )}
                </div>
                <div className='flex items-center gap-2 text-xs'>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${selectedContratos.length > 0 ? 'bg-amber-500 text-white' : 'bg-gray-400 text-white'}`}
                  >
                    3
                  </div>
                  <span
                    className={`font-medium ${selectedContratos.length > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-gray-500'}`}
                  >
                    Aceptar Cálculo ({selectedContratos.length} seleccionados)
                  </span>
                  {selectedContratos.length > 0 && (
                    <span className='text-amber-600 text-xs'>✓</span>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
        {/* Filtros de Búsqueda */}
        <Card className='border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50'>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className='flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className='flex items-center gap-4'>
                <div className='w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800'>
                  <FileSpreadsheet className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <CardTitle className='text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                    Listado de Precalculos
                  </CardTitle>
                  <CardDescription className='text-slate-600 dark:text-slate-400 mt-1 text-sm'>
                    Revisa los precalculos de facturación
                  </CardDescription>
                </div>
              </div>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                {isFiltersOpen ? (
                  <ChevronUp className='h-5 w-5 text-slate-500' />
                ) : (
                  <ChevronDown className='h-5 w-5 text-slate-500' />
                )}
              </Button>
            </div>

            <CollapsibleContent>
              <CardContent className='px-4 pb-4 space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
                  {/* Periodo */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                      <CalendarIcon className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                      Periodo actual
                    </Label>
                    {periodoAbierto && periodoAbierto.length > 0 ? (
                      <div className='flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800'>
                        <div className='w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center'>
                          <CalendarIcon className='w-5 h-5 text-blue-600 dark:text-blue-400' />
                        </div>
                        <div>
                          <span className='font-semibold text-blue-800 dark:text-blue-200'>
                            {periodoAbierto[0].mes.toString().padStart(2, '0')}/
                            {periodoAbierto[0].anio}
                          </span>
                          <p className='text-xs text-blue-600 dark:text-blue-400 mt-0.5'>
                            Periodo activo para facturación
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800'>
                        <div className='w-10 h-10 bg-amber-100 dark:bg-amber-800/50 rounded-lg flex items-center justify-center'>
                          <AlertCircleIcon className='w-5 h-5 text-amber-600 dark:text-amber-400' />
                        </div>
                        <div>
                          <span className='font-medium text-amber-800 dark:text-amber-200'>
                            No hay periodo abierto
                          </span>
                          <p className='text-xs text-amber-600 dark:text-amber-400 mt-0.5'>
                            Contacta al administrador
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Ciclo de facturación fijo */}
                  <div className='space-y-2'>
                    <Label
                      htmlFor='ciclo'
                      className='text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'
                    >
                      <FileTextIcon className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                      Ciclo de facturación (normado)
                    </Label>

                    <div className='flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800'>
                      <div className='w-10 h-10 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg flex items-center justify-center'>
                        <CheckCircle className='w-5 h-5 text-emerald-600 dark:text-emerald-400' />
                      </div>
                      <div className='flex-1'>
                        <Input
                          id='ciclo'
                          value='Ciclo día 15 (Único ciclo normado)'
                          disabled
                          className='h-12 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-medium cursor-not-allowed'
                        />
                      </div>
                    </div>
                    <p className='text-xs text-emerald-600 dark:text-emerald-400 mt-1'>
                      ✅ El ciclo día 15 es el único ciclo de facturación
                      autorizado por normativa
                    </p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className='flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700'>
                  <div className='flex gap-3'>
                    <Button
                      onClick={handleClearFilters}
                      variant='outline'
                      disabled={isLoading}
                      className='gap-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                    >
                      <Eraser className='h-4 w-4' />
                      Limpiar
                    </Button>
                    <Button
                      onClick={handleRefreshData}
                      variant='outline'
                      disabled={isLoading || !isCalculoPreparado}
                      className='gap-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                    >
                      <RefreshCw className='h-4 w-4' />
                      Actualizar
                    </Button>
                  </div>
                  <div className='flex gap-3'>
                    <Button
                      onClick={handlePreparacionConTutorial}
                      disabled={isLaunching}
                      className='gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                    >
                      {isLaunching ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          Preparando...
                        </>
                      ) : (
                        <>
                          <SearchIcon className='h-4 w-4' />
                          Paso 1: Preparar Cálculo
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleRevisarConTutorial}
                      disabled={isLoading || !isCalculoPreparado}
                      className='gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                    >
                      {isLoading ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          Cargando...
                        </>
                      ) : (
                        <>
                          <FileTextIcon className='h-4 w-4' />
                          Paso 2: Ver Cálculo Facturas
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleAceptarCalculo}
                      disabled={isAccepting || selectedContratos.length === 0}
                      className='gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
                    >
                      {isAccepting ? (
                        <>
                          <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          Aceptando...
                        </>
                      ) : (
                        <>
                          <SettingsIcon className='h-4 w-4' />
                          Paso 3: Aceptar Cálculo ({selectedContratos.length})
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
        {/* Resultados de la búsqueda */}
        <Card className='border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50'>
          <CardHeader className='border-b border-slate-200 dark:border-slate-700'>
            <div className='flex items-center gap-4'>
              <div className='w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-200 dark:border-blue-800'>
                <TrendingUp className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <CardTitle className='text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2'>
                  Resultados de la búsqueda
                </CardTitle>
                <CardDescription className='text-slate-600 dark:text-slate-400 mt-1 text-sm'>
                  Listado de contratos y sus cálculos de facturación
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='p-6'>
            {isLoading ? (
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
            ) : error ? (
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
            ) : data.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground'>
                <div className='p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full'>
                  <SearchIcon className='h-8 w-8 text-sky-500 dark:text-sky-400' />
                </div>
                <div className='text-center'>
                  <p className='font-medium text-slate-700 dark:text-slate-300'>
                    Realizar consulta de precálculos
                  </p>
                  <p className='text-sm mt-1'>
                    Selecciona un ciclo y haz clic en "Preparar Cálculo" para
                    ver los resultados
                  </p>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Estadísticas resumidas */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-lg border border-sky-200 dark:border-sky-800'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-sky-700 dark:text-sky-300'>
                      {filteredData.length}
                    </div>
                    <div className='text-xs text-sky-600 dark:text-sky-400 font-medium'>
                      {searchTerm ? 'Contratos Filtrados' : 'Total Contratos'}
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-emerald-700 dark:text-emerald-300'>
                      {filteredData.reduce(
                        (sum, item) => sum + (item.cargos?.length || 0),
                        0
                      )}
                    </div>
                    <div className='text-xs text-emerald-600 dark:text-emerald-400 font-medium'>
                      Total Cargos
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-amber-700 dark:text-amber-300'>
                      {new Intl.NumberFormat('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        minimumFractionDigits: 0,
                      }).format(
                        filteredData.reduce(
                          (sum, item) => sum + (item.totalFacturado || 0),
                          0
                        )
                      )}
                    </div>
                    <div className='text-xs text-amber-600 dark:text-amber-400 font-medium'>
                      Total Facturado
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-purple-700 dark:text-purple-300'>
                      {filteredData
                        .reduce(
                          (sum, item) => sum + (item.consumoPeriodo || 0),
                          0
                        )
                        .toLocaleString('es-CL')}
                    </div>
                    <div className='text-xs text-purple-600 dark:text-purple-400 font-medium'>
                      Total Consumo m³
                    </div>
                  </div>
                </div>

                {/* Barra de búsqueda */}
                <div className='relative'>
                  <SearchIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                  <Input
                    type='text'
                    placeholder='🔍 Buscar por contrato, nombre, RUT, dirección...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20'
                  />
                  {searchTerm && (
                    <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground'>
                      {filteredData.length} de {data.length}
                    </div>
                  )}
                </div>

                {/* Mostrar lecturaId seleccionados */}
                {selectedContratos.length > 0 && (
                  <div className='p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='p-1.5 bg-amber-100 dark:bg-amber-800/50 rounded-md'>
                        <FileTextIcon className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                      </div>
                      <h4 className='font-semibold text-amber-800 dark:text-amber-200'>
                        Contratos Seleccionados ({selectedContratos.length})
                      </h4>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      {selectedContratos.map(lecturaId => (
                        <Badge
                          key={lecturaId}
                          variant='outline'
                          className='bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700'
                        >
                          Lectura ID: {lecturaId}
                        </Badge>
                      ))}
                    </div>
                    <p className='text-xs text-amber-600 dark:text-amber-400 mt-2'>
                      💡 Estos son los IDs de lectura que has seleccionado en la
                      tabla
                    </p>
                  </div>
                )}

                <div className='flex items-center justify-between pb-3 border-b'>
                  <div className='flex items-center gap-2'>
                    <div className='p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md'>
                      <FileTextIcon className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                    </div>
                    <span className='font-medium text-emerald-700 dark:text-emerald-300'>
                      {filteredData.length} registros{' '}
                      {searchTerm
                        ? `encontrados de ${data.length} total`
                        : 'encontrados'}
                    </span>
                  </div>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span>💡 Haz clic en</span>
                      <ChevronRight className='h-3 w-3' />
                      <span>para ver el detalle de cargos</span>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900'>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
