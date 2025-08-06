import {
  BarChart,
  Building2,
  Calendar,
  ChevronDown,
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
    } catch (error) {
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
      <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
        <div className='container mx-auto p-3 space-y-4'>
          <div className='text-center py-8'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-red-50 dark:bg-red-900/30 rounded-lg mb-3'>
              <TrendingUp className='w-6 h-6 text-red-600 dark:text-red-400' />
            </div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2'>
              Error al cargar datos
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Precios Cargo
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestión de precios de cargo para facturación
            </p>
          </div>
        </div>
        {/* Filtros */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className='p-4 border-b border-slate-200/60 dark:border-slate-700/60 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors'
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'>
                    <Calendar className='h-4 w-4' />
                  </div>
                  <div>
                    <h3 className='text-base font-medium text-slate-900 dark:text-slate-100'>
                      Período de Consulta
                    </h3>
                    <p className='text-xs text-slate-600 dark:text-slate-400'>
                      Selecciona el período para consultar los precios de cargo
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${
                    isFiltersOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Período seleccionado */}
            <div className='px-4 pb-4'>
              <div className='flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700'>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                  <span className='text-sm font-medium text-slate-900 dark:text-slate-100'>
                    Período:
                  </span>
                </div>
                <Badge variant='outline' className='text-sm'>
                  {months.find(m => m.value === mes)?.label} {anio}
                </Badge>
              </div>
            </div>

            <CollapsibleContent>
              <CardContent className='px-4 pb-4 space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {/* Mes */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Mes
                    </Label>
                    <Select value={mes} onValueChange={setMes}>
                      <SelectTrigger className='h-9 w-full'>
                        <SelectValue placeholder='Selecciona un mes' />
                      </SelectTrigger>
                      <SelectContent className='w-full'>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Año */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                      Año
                    </Label>
                    <Select value={anio} onValueChange={setAnio}>
                      <SelectTrigger className='h-9 w-full'>
                        <SelectValue placeholder='Selecciona un año' />
                      </SelectTrigger>
                      <SelectContent className='w-full'>
                        {years.map(year => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Acciones */}
                <div className='flex gap-2 justify-end pt-3 border-t border-slate-200 dark:border-slate-700'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleClearFilters}
                    className='gap-2'
                  >
                    <Eraser className='w-4 h-4' />
                    Limpiar
                  </Button>

                  <Button
                    size='sm'
                    onClick={handleSearch}
                    disabled={isLoading}
                    className='gap-2 bg-blue-600 hover:bg-blue-700 text-white'
                  >
                    {isLoading ? (
                      <>
                        <div className='w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className='w-4 h-4' />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>{' '}
        {/* Tablas de Precios */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardContent className='p-4'>
            <Tabs defaultValue='enel' className='w-full'>
              <TabsList className='grid w-full grid-cols-2 bg-slate-50 dark:bg-slate-800 h-10'>
                <TabsTrigger
                  value='enel'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100'
                >
                  <Building2 className='mr-2 h-4 w-4' />
                  Precios Enel
                </TabsTrigger>
                <TabsTrigger
                  value='enerlova'
                  className='data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100'
                >
                  <BarChart className='mr-2 h-4 w-4' />
                  Precios Enerlova
                </TabsTrigger>
              </TabsList>

              <TabsContent value='enel' className='space-y-3 pt-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div className='flex-1'>
                    <h3 className='text-base font-medium text-slate-900 dark:text-slate-100'>
                      Precios de Cargo - Enel
                    </h3>
                    <div className='text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1'>
                      <Info className='w-4 h-4 text-blue-500 dark:text-blue-300' />
                      <span>Valores vigentes publicados por Enel</span>
                      <span>-</span>
                      <a
                        href='https://www.enel.cl/es/clientes/tarifas-y-regulacion/tarifas.html'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='underline text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100'
                      >
                        enel.cl - Tarifas
                      </a>
                    </div>
                  </div>
                  <Badge variant='outline' className='text-sm'>
                    {months.find(m => m.value === mes)?.label} {anio}
                  </Badge>
                </div>
                <div className='rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden'>
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
                        className: 'bg-slate-600 text-white',
                      },
                      {
                        id: 'valores',
                        title: 'Valores Anteriores',
                        columns: ['valor', 'valor2', 'valor3'],
                        className: 'bg-orange-600 text-white',
                      },
                      {
                        id: 'valoresActuales',
                        title: 'Valores Actuales',
                        columns: [
                          'valoractual',
                          'valoractual2',
                          'valoractual3',
                        ],
                        className: 'bg-emerald-600 text-white',
                      },
                      {
                        id: 'acciones',
                        title: 'Estado',
                        columns: ['actions'],
                        className: 'bg-blue-600 text-white',
                      },
                    ]}
                  />
                </div>
              </TabsContent>

              <TabsContent value='enerlova' className='space-y-3 pt-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div className='flex-1'>
                    <h3 className='text-base font-medium text-slate-900 dark:text-slate-100'>
                      Precios de Cargo - Enerlova
                    </h3>
                    <p className='text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1'>
                      <Info className='w-4 h-4 text-emerald-500 dark:text-emerald-300' />
                      <span>
                        Precios fijados directamente por Enerlova para el
                        período consultado
                      </span>
                    </p>
                  </div>
                  <Badge variant='outline' className='text-sm'>
                    Precios actuales
                  </Badge>
                </div>
                <div className='rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden'>
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
                        className: 'bg-slate-600 text-white',
                      },
                      {
                        id: 'valores',
                        title: 'Valores',
                        columns: ['valor', 'dias'],
                        className: 'bg-emerald-600 text-white',
                      },
                      {
                        id: 'acciones',
                        title: 'Detalles',
                        columns: ['actions'],
                        className: 'bg-blue-600 text-white',
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
