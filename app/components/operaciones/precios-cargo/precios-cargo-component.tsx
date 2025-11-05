import {
  BarChart,
  Building2,
  Calendar,
  ChevronDown,
  Eraser,
  HelpCircle,
  Info,
  Search,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

import { useEffect, useState } from 'react';

import { useAuth } from '~/context/AuthContext';

import { ModernHeader } from '~/components/shared/modern-header';
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
  SelectValue
} from '~/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import api from '~/lib/api';
import type {
  PreciosCargoEnel,
  PreciosCargoEnerlova
} from '~/types/operaciones';

import { columns as columnsEnel } from './columns-enel';
import { columns } from './columns-enerlova';
import { DataTablePreciosVirtualized } from './data-table-precios-virtualized';

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
  { value: '12', label: 'Diciembre' }
];

const years = [
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' }
];

export default function PreciosCargoComponent({
  tablaEnel: initialTablaEnel,
  tablaEnerlova: initialTablaEnerlova,
  initialMes,
  initialAnio,
  error
}: Readonly<PreciosCargoComponentProps>) {
  // Estados para filtros y datos
  const [mes, setMes] = useState(initialMes);
  const [anio, setAnio] = useState(initialAnio);
  const [tablaEnel, setTablaEnel] = useState(initialTablaEnel);
  const [tablaEnerlova, setTablaEnerlova] = useState(initialTablaEnerlova);
  const [isLoading, setIsLoading] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [periodoAbierto, setPeriodoAbierto] = useState<{
    descripcion: string;
    mes: number;
    anio: number;
  } | null>(null);

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/operaciones/precios-cargo';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);

  // Consultar periodo abierto al montar el componente
  useEffect(() => {
    async function fetchPeriodoAbierto() {
      try {
        const response = await api.get(
          'http://192.168.1.139:8081/Enerlova/ConsultarPeriodoAbierto'
        );
        if (Array.isArray(response.data) && response.data.length > 0) {
          setPeriodoAbierto(response.data[0]);
          // Opcional: actualizar filtros al periodo abierto si no han sido modificados
          setMes(response.data[0].mes.toString().padStart(2, '0'));
          setAnio(response.data[0].anio.toString());
        }
      } catch (error) {
        console.error('Error al obtener el periodo abierto:', error);
      }
    }
    fetchPeriodoAbierto();
  }, []);

  // Manejo de búsqueda
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setIsFiltersOpen(false); // Cerrar filtros después de buscar

      const params = new URLSearchParams({
        mes,
        año: anio
      });

      const response = await api.get('/consulta-precio-pago', { params });
      setTablaEnel(response.data as PreciosCargoEnel[]);
      toast.success('Búsqueda completada exitosamente');
    } catch (_error) {
      toast.error('Error al buscar precios de cargo', _error as any);
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

  // Actualizar datos después de modificaciones (ENEL)
  const handleDataUpdate = async () => {
    await handleSearch();
  };

  // Actualizar datos de Enerlova
  const handleEnerlovaDataUpdate = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/consulta-precio-pago-tabla');
      setTablaEnerlova(response.data as PreciosCargoEnerlova[]);
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los datos', error as any);
    } finally {
      setIsLoading(false);
    }
  };

  // Pasos del tour interactivo con driver.js
  const tourSteps = [
    {
      element: '#filtros-periodo',
      popover: {
        title: '📅 Filtros de Período',
        description:
          'Este panel te permite <strong>seleccionar el período</strong> (mes y año) para consultar los precios de cargo históricos o actuales.',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#periodo-actual',
      popover: {
        title: '📌 Período Activo',
        description:
          'Aquí se muestra el <strong>período abierto actualmente</strong> en el sistema. Los filtros se inicializan automáticamente con este período.',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#buscar-btn',
      popover: {
        title: '🔍 Buscar Precios',
        description:
          'Una vez seleccionado el período deseado, haz clic en <strong>Buscar</strong> para cargar los precios de cargo correspondientes a ese mes y año.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#limpiar-btn',
      popover: {
        title: '🧹 Limpiar Filtros',
        description:
          'Este botón <strong>restablece los filtros</strong> al mes y año actual del sistema.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#tabs-precios',
      popover: {
        title: '🔄 Pestañas de Precios',
        description:
          'Usa estas pestañas para alternar entre <strong>Precios ENEL</strong> (distribuidora) y <strong>Precios Enerlova</strong> (propios de la empresa).',
        side: 'top' as const,
        align: 'start' as const
      }
    },
    {
      element: '#tabla-enel',
      popover: {
        title: '💰 Tabla de Precios ENEL',
        description:
          'Aquí se muestran los <strong>precios de cargo publicados por ENEL</strong>. Puedes ver valores anteriores y actuales para comparación histórica.',
        side: 'top' as const,
        align: 'start' as const
      }
    },
    {
      element: '#tabla-enerlova',
      popover: {
        title: '💼 Tabla de Precios Enerlova',
        description:
          'Esta tabla muestra los <strong>precios propios de Enerlova</strong>, fijados internamente para el período actual.',
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
      <div className='min-h-screen bg-background'>
        <div className='container mx-auto p-3 space-y-4'>
          <div className='text-center py-8'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-xl mb-3'>
              <TrendingUp className='w-6 h-6 text-destructive' />
            </div>
            <h1 className='text-xl font-semibold mb-2'>
              Error al cargar datos
            </h1>
            <p className='text-sm text-muted-foreground'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          {/* Header */}
          <ModernHeader
            title='Precios Cargo'
            description='Gestión de precios de cargo para facturación'
          />

          {/* Botón de Guía Interactiva */}
          <Button
            variant='outline'
            size='sm'
            onClick={startTour}
            className='mb-2'
          >
            <HelpCircle className='h-4 w-4' />
          </Button>
        </div>
        {/* Filtros */}
        <Card id='filtros-periodo' className='border border-border shadow-sm'>
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className='p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors'
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-muted'>
                    <Calendar className='h-4 w-4' />
                  </div>
                  <div>
                    <h3 className='text-base font-medium'>
                      Período de Consulta
                    </h3>
                    <p className='text-xs text-muted-foreground'>
                      Selecciona el período para consultar los precios de cargo
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isFiltersOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Período seleccionado */}
            <div id='periodo-actual' className='px-4 pb-4'>
              <div className='flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border'>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4 text-primary' />
                  <span className='text-sm font-medium'>Periodo abierto:</span>
                </div>
                <Badge variant='outline' className='text-sm'>
                  {periodoAbierto
                    ? periodoAbierto.descripcion
                    : `${months.find(m => m.value === mes)?.label} ${anio}`}
                </Badge>
              </div>
            </div>

            <CollapsibleContent>
              <CardContent className='px-4 pb-4 space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {/* Mes */}
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Mes</Label>
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
                    <Label className='text-sm font-medium'>Año</Label>
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
                <div className='flex gap-2 justify-end pt-3 border-t border-border'>
                  <Button
                    id='limpiar-btn'
                    variant='outline'
                    size='sm'
                    onClick={handleClearFilters}
                    className='gap-2'
                  >
                    <Eraser className='w-4 h-4' />
                    Limpiar
                  </Button>

                  <Button
                    id='buscar-btn'
                    size='sm'
                    onClick={handleSearch}
                    disabled={isLoading}
                    className='gap-2'
                  >
                    {isLoading ? (
                      <>
                        <div className='w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent' />
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
        <Card className='border border-border shadow-sm'>
          <CardContent className='p-4'>
            <Tabs id='tabs-precios' defaultValue='enel' className='w-full'>
              <TabsList className='grid w-full grid-cols-2 bg-muted h-10'>
                <TabsTrigger
                  value='enel'
                  className='data-[state=active]:bg-background'
                >
                  <Building2 className='mr-2 h-4 w-4' />
                  Precios Enel
                </TabsTrigger>
                <TabsTrigger
                  value='enerlova'
                  className='data-[state=active]:bg-background'
                >
                  <BarChart className='mr-2 h-4 w-4' />
                  Precios Enerlova
                </TabsTrigger>
              </TabsList>

              <TabsContent value='enel' className='space-y-3 pt-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div className='flex-1'>
                    <h3 className='text-base font-medium'>
                      Precios de Cargo - Enel
                    </h3>
                    <div className='text-xs text-muted-foreground flex items-center gap-2 mt-1'>
                      <Info className='w-4 h-4 text-primary' />
                      <span>Valores vigentes publicados por Enel</span>
                      <span>-</span>
                      <a
                        href='https://www.enel.cl/es/clientes/tarifas-y-regulacion/tarifas.html'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='underline text-primary hover:text-primary/80'
                      >
                        enel.cl - Tarifas
                      </a>
                    </div>
                  </div>
                  <Badge variant='outline' className='text-sm'>
                    {months.find(m => m.value === mes)?.label} {anio}
                  </Badge>
                </div>
                <div
                  id='tabla-enel'
                  className='rounded-xl border border-border overflow-hidden'
                >
                  <DataTablePreciosVirtualized
                    columns={columnsEnel(
                      mes,
                      anio,
                      handleDataUpdate,
                      hasCreatePermission
                    )}
                    data={tablaEnel}
                    searchPlaceholder='Buscar por descripción o código...'
                    showSearch={true}
                    columnGroups={[
                      {
                        id: 'identificacion',
                        title: 'Identificación',
                        columns: ['codigo', 'codigoener', 'descripcion'],
                        className: 'bg-primary text-primary-foreground'
                      },
                      {
                        id: 'valores',
                        title: 'Valores Anteriores',
                        columns: ['valor', 'valor2', 'valor3'],
                        className: 'bg-warning text-warning-foreground'
                      },
                      {
                        id: 'valoresActuales',
                        title: 'Valores Actuales',
                        columns: [
                          'valoractual',
                          'valoractual2',
                          'valoractual3'
                        ],
                        className: 'bg-success text-success-foreground'
                      },
                      {
                        id: 'acciones',
                        title: 'Estado',
                        columns: ['actions'],
                        className: 'bg-accent text-accent-foreground'
                      }
                    ]}
                  />
                </div>
              </TabsContent>

              <TabsContent value='enerlova' className='space-y-3 pt-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div className='flex-1'>
                    <h3 className='text-base font-medium'>
                      Precios de Cargo - Enerlova
                    </h3>
                    <p className='text-xs text-muted-foreground flex items-center gap-2 mt-1'>
                      <Info className='w-4 h-4 text-success' />
                      <span>
                        Precios fijados directamente por Enerlova para el mes
                        actual
                      </span>
                    </p>
                  </div>
                  <Badge variant='outline' className='text-sm'>
                    Precios actuales
                  </Badge>
                </div>
                <div
                  id='tabla-enerlova'
                  className='rounded-xl border border-border overflow-hidden'
                >
                  <DataTablePreciosVirtualized
                    columns={columns(
                      handleEnerlovaDataUpdate,
                      hasEditPermission
                    )}
                    data={tablaEnerlova}
                    searchPlaceholder='Buscar por descripción o código...'
                    showSearch={true}
                    columnGroups={[
                      {
                        id: 'informacion',
                        title: 'Información',
                        columns: [
                          'CD_ID',
                          'cd_codigoenerlova',
                          'CD_Descripcion'
                        ],
                        className: 'bg-primary text-primary-foreground'
                      },
                      {
                        id: 'valores',
                        title: 'Valores',
                        columns: ['valor', 'dias'],
                        className: 'bg-success text-success-foreground'
                      },
                      {
                        id: 'acciones',
                        title: 'Detalles',
                        columns: ['actions'],
                        className: 'bg-accent text-accent-foreground'
                      }
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
