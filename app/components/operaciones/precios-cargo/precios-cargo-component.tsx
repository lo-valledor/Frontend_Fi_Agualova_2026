import {
  BarChart,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eraser,
  Info,
  Search,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import api from '~/lib/api';
import type {
  PreciosCargoEnel,
  PreciosCargoEnerlova,
} from '~/types/operaciones';

import { columns as columnsEnel } from './columns-enel';
import { columns } from './columns-enerlova';
import { DataTablePrecios } from './data-table-precios';

interface PreciosCargoComponentProps {
  tablaEnel: PreciosCargoEnel[];
  tablaEnerlova: PreciosCargoEnerlova[];
  initialMes: string;
  initialAnio: string;
  error: string | null;
}

const currentDate = new Date();
const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const currentYear = currentDate.getFullYear().toString();

const months = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const years = [
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
];

export default function PreciosCargoComponent({
  tablaEnel: initialTablaEnel,
  tablaEnerlova,
  initialMes,
  initialAnio,
  error,
}: PreciosCargoComponentProps) {
  // Estados para filtros y datos
  const [mes, setMes] = useState(initialMes);
  const [anio, setAnio] = useState(initialAnio);
  const [tablaEnel, setTablaEnel] = useState(initialTablaEnel);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Manejo de búsqueda
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setIsFiltersOpen(false); // Cerrar filtros después de buscar

      const params = new URLSearchParams({
        mes,
        año: anio,
      });

      const response = await api.get('/consulta-precio-pago', { params });
      setTablaEnel(response.data as PreciosCargoEnel[]);
      toast.success('Búsqueda completada exitosamente');
    } catch (_error) {
      toast.error('Error al buscar precios de cargo');
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setMes(currentMonth);
    setAnio(currentYear);
    toast.success('Filtros reiniciados');
  };

  // Actualizar datos después de modificaciones
  const handleDataUpdate = async () => {
    await handleSearch();
  };

  // Mostrar error si existe
  if (error) {
    return (
      <div className='min-h-screen '>
        <div className='container mx-auto p-2 space-y-3'>
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4'>
              <TrendingUp className='w-8 h-8 text-red-600 dark:text-red-400' />
            </div>
            <h1 className='text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2'>
              Error al cargar datos
            </h1>
            <p className='text-slate-600 dark:text-slate-400'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <div className='container mx-auto p-2 space-y-2'>
        {/* Modern Header */}
        <div className='flex items-center gap-2 py-1 border-b border-slate-200 dark:border-slate-700'>
          <div className='flex-1'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-sky-900 dark:text-sky-100'>
              Precios Cargo
            </h1>
          </div>
        </div>

        {/* Filtros */}
        <Card className='border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50'>
          <CardContent className='p-3 sm:pb-3'>
            {/* Filtros principales */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400' />
                <div className='flex-1'>
                  <h3 className='font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100'>
                    Período de Consulta
                  </h3>
                  <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block'>
                    Selecciona el período para consultar los precios de cargo
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className='text-muted-foreground hover:text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20'
                >
                  <Search className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                  <span className='text-xs sm:text-sm'>Filtros</span>
                  {isFiltersOpen ? (
                    <ChevronUp className='w-3 h-3 sm:w-4 sm:h-4 ml-1' />
                  ) : (
                    <ChevronDown className='w-3 h-3 sm:w-4 sm:h-4 ml-1' />
                  )}
                </Button>
              </div>

              {/* Período seleccionado visible */}
              <div className='flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400' />
                  <span className='text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300'>
                    Período:
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className='bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs sm:text-sm'
                >
                  {months.find(m => m.value === mes)?.label} {anio}
                </Badge>
              </div>
            </div>

            {/* Filtros expandibles */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleContent>
                <div className='border-t pt-3'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    {/* Mes */}
                    <div className='space-y-1 w-full'>
                      <Label className='text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300'>
                        Mes
                      </Label>
                      <div className='w-full'>
                        <Select value={mes} onValueChange={setMes}>
                          <SelectTrigger className='h-9 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-xs sm:text-sm'>
                            <SelectValue placeholder='Selecciona un mes' />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map(month => (
                              <SelectItem
                                key={month.value}
                                value={month.value}
                                className='truncate'
                              >
                                {month.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Año */}
                    <div className='space-y-1 w-full'>
                      <Label className='text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300'>
                        Año
                      </Label>
                      <div className='w-full'>
                        <Select value={anio} onValueChange={setAnio}>
                          <SelectTrigger className='h-9 w-full bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 text-xs sm:text-sm'>
                            <SelectValue placeholder='Selecciona un año' />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem
                                key={year.value}
                                value={year.value}
                                className='truncate'
                              >
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className='flex flex-col sm:flex-row gap-2 items-center justify-between pt-3 border-t'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleClearFilters}
                      className='text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/20 w-full sm:w-auto'
                    >
                      <Eraser className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                      <span className='text-xs sm:text-sm'>Limpiar</span>
                    </Button>

                    <Button
                      size='sm'
                      onClick={handleSearch}
                      disabled={isLoading}
                      className='bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto'
                    >
                      {isLoading ? (
                        <>
                          <div className='w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent' />
                          <span className='text-xs sm:text-sm'>Buscando...</span>
                        </>
                      ) : (
                        <>
                          <Search className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                          <span className='text-xs sm:text-sm'>Buscar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Tablas de Precios con Tabs */}
        <Card className='border-0 shadow-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50'>
          <CardContent className='p-2 sm:p-3 pb-3'>
            <Tabs defaultValue='enel' className='w-full'>
              <TabsList className='w-full justify-start rounded-none border-b bg-transparent p-0 overflow-x-auto'>
                <TabsTrigger
                  value='enel'
                  className='relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-blue-500 data-[state=active]:text-foreground data-[state=active]:shadow-none whitespace-nowrap'
                >
                  <Building2 className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='hidden sm:inline'>Precios </span>Enel
                </TabsTrigger>
                <TabsTrigger
                  value='enerlova'
                  className='relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-muted-foreground shadow-none transition-none data-[state=active]:border-emerald-500 data-[state=active]:text-foreground data-[state=active]:shadow-none whitespace-nowrap'
                >
                  <BarChart className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='hidden sm:inline'>Precios </span>Enerlova
                </TabsTrigger>
              </TabsList>

              <TabsContent value='enel' className='space-y-3 sm:space-y-4 pt-4 sm:pt-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div className='flex-1'>
                    <h3 className='text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100'>
                      Precios de Cargo - Enel
                    </h3>
                    <div className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1'>
                      <div className='flex items-center gap-1 sm:gap-2'>
                        <Info className='w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-300 flex-shrink-0' />
                        <span>Valores vigentes publicados por Enel</span>
                      </div>
                      <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 ml-4 sm:ml-0'>
                        <span className='hidden sm:inline'>-</span>
                        <span>Fuente oficial:</span>
                        <a
                          href='https://www.enel.cl/es/clientes/tarifas-y-regulacion/tarifas.html'
                          target='_blank'
                          rel='noopener noreferrer'
                          className='underline text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 break-all sm:break-normal'
                        >
                          enel.cl - Tarifas
                        </a>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant='outline'
                    className='bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-xs sm:text-sm self-start sm:self-auto'
                  >
                    {months.find(m => m.value === mes)?.label} {anio}
                  </Badge>
                </div>
                <div className='rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900'>
                  <DataTablePrecios
                    columns={columnsEnel(mes, anio, handleDataUpdate)}
                    data={tablaEnel}
                    searchPlaceholder='Buscar por descripción o código...'
                    showSearch={true}
                    defaultPageSize={10}
                    pageSizeOptions={[5, 10, 20, 50]}
                    columnGroups={[
                      {
                        id: 'identificacion',
                        title: 'Identificación',
                        columns: ['codigo', 'codigoener', 'descripcion'],
                        className:
                          'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg',
                      },
                      {
                        id: 'valores',
                        title: 'Valores Anteriores',
                        columns: ['valor', 'valor2', 'valor3'],
                        className:
                          'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg',
                      },
                      {
                        id: 'valoresActuales',
                        title: 'Valores Actuales',
                        columns: [
                          'valoractual',
                          'valoractual2',
                          'valoractual3',
                        ],
                        className:
                          'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg',
                      },
                      {
                        id: 'acciones',
                        title: 'Estado',
                        columns: ['actions'],
                        className:
                          'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
                      },
                    ]}
                  />
                </div>
              </TabsContent>

              <TabsContent value='enerlova' className='space-y-3 sm:space-y-4 pt-4 sm:pt-6'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div className='flex-1'>
                    <h3 className='text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100'>
                      Precios de Cargo - Enerlova
                    </h3>
                    <p className='text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start sm:items-center gap-1 sm:gap-2 mt-1'>
                      <Info className='w-3 h-3 sm:w-4 sm:h-4 text-emerald-500 dark:text-emerald-300 flex-shrink-0 mt-0.5 sm:mt-0' />
                      <span>Precios fijados directamente por Enerlova para el período consultado</span>
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className='bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm self-start sm:self-auto'
                  >
                    Precios actuales
                  </Badge>
                </div>
                <div className='rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900'>
                  <DataTablePrecios
                    columns={columns}
                    data={tablaEnerlova}
                    searchPlaceholder='Buscar por descripción o código...'
                    showSearch={true}
                    defaultPageSize={10}
                    pageSizeOptions={[5, 10, 20, 50]}
                    columnGroups={[
                      {
                        id: 'informacion',
                        title: 'Información',
                        columns: [
                          'CD_ID',
                          'cd_codigoenerlova',
                          'CD_Descripcion',
                        ],
                        className:
                          'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg',
                      },
                      {
                        id: 'valores',
                        title: 'Valores',
                        columns: ['valor', 'dias'],
                        className:
                          'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg',
                      },
                      {
                        id: 'acciones',
                        title: 'Detalles',
                        columns: ['actions'],
                        className:
                          'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg',
                      },
                    ]}
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
