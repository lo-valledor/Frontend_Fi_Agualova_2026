/**
 * Componente principal para Corte y Reposición de Servicios
 *
 * Funcionalidades principales:
 * - Visualización de estados de corte y reposición por cliente
 * - Gestión del ciclo completo: Pendiente → Liberado → Cortado → Reposición
 * - Exportación de datos a Excel (2 formatos)
 * - Control del proceso de revisión (Activar, Iniciar, Finalizar)
 * - Estadísticas rápidas de estados
 * - Tour interactivo para nuevos usuarios (driver.js)
 *
 * Flujo del proceso de corte:
 * 1. **Activar Actualización**: Prepara el sistema para revisar
 * 2. **Iniciar**: Comienza proceso de revisión de cortes
 * 3. **Buscar**: Carga datos del mantenedor de revisión
 * 4. **Gestión por estado**:
 *    - NULL/Pendiente: Cliente pendiente de revisión
 *    - 1/Liberado: Cliente liberado de corte
 *    - 2/Cortado: Cliente con servicio cortado
 *    - 3/Reposición Solicitada: Solicitud de reconexión
 * 5. **Finalizar**: Cierra el proceso de revisión
 *
 * Características especiales:
 * - **Tour Interactivo**: Guía paso a paso con driver.js (7 pasos)
 * - **Estadísticas en tiempo real**: Cards con totales por estado
 * - **Exportación dual**: Mantenedor completo y Revisión de corte
 * - **Tabla con acciones**: Marcar/Liberar, Registrar corte, Solicitar reposición
 * - **Modales especializados**: Confirmación de cada acción
 *
 * Arquitectura:
 * - Usa DataTable con columnas personalizadas
 * - Componentes modales:
 *   * CorteRegistradoDialog: Registrar corte ejecutado
 *   * MarcarLiberarDialog: Liberar cliente de corte
 *   * ReposicionSolicitadaDialog: Solicitar reconexión
 * - Estados para datos, búsqueda y selección
 * - API endpoints:
 *   * GET /consulta-mantenedor-revision-corte
 *   * POST /modificar-revision
 *   * POST /ingresar-revision
 *   * POST /eliminar-revision
 *   * GET /exportar-* (para Excel)
 *
 * @param {Object} props - Props del componente
 * @param {TotalesCorteReposicion[]} props.totalesData - Totales por estado
 * @param {ConsultarMantenedorRevisionCorte[]} props.mantenedorCorteData - Datos de revisión
 *
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/corte-reposicion.tsx
 * export default function CorteReposicionRoute({ loaderData }) {
 *   return (
 *     <CorteReposicionComponent
 *       totalesData={loaderData.totales}
 *       mantenedorCorteData={loaderData.mantenedor}
 *     />
 *   );
 * }
 * ```
 */
import {
  ArrowUpToLine,
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  ListChecks,
  Play,
  Search,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

import { useState } from 'react';

import { useAuth } from '~/context/AuthContext';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardTitle } from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import { Spinner } from '~/components/ui/spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/components/ui/alert-dialog';
import api from '~/lib/api';
import type {
  ConsultarMantenedorRevisionCorte,
  TotalesCorteReposicion
} from '~/types/operaciones';

import { columns } from './columns';

interface CorteReposicionComponentProps {
  totalesData: TotalesCorteReposicion[];
  mantenedorCorteData: ConsultarMantenedorRevisionCorte[];
}

export default function CorteReposicionComponent({
  totalesData,
  mantenedorCorteData: initialMantenedorCorteData
}: Readonly<CorteReposicionComponentProps>) {
  const [isRevisionOpen, setIsRevisionOpen] = useState(true);
  const [mantenedorCorteData, setMantenedorCorteData] = useState<
    ConsultarMantenedorRevisionCorte[]
  >(initialMantenedorCorteData);
  const [isSearching, setIsSearching] = useState(false);

  // Estados de loading para cada botón
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingCorte, setIsExportingCorte] = useState(false);
  const [isExportingFacturas, setIsExportingFacturas] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Estado para el AlertDialog de confirmación
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);

  // Permisos
  const { canCreate, canEdit, canDelete } = useAuth();
  const route = '/dashboard/operaciones/corte-reposicion';
  const hasCreatePermission = canCreate(route);
  const hasEditPermission = canEdit(route);
  const hasDeletePermission = canDelete(route);

  // Obtener cantidad por código
  const getCantidadPorCodigo = (codigo: string): number => {
    const item = totalesData.find(item => item.codigo === codigo);
    return item ? item.cantidad : 0;
  };

  const handleExportarExcel = async () => {
    setIsExportingExcel(true);
    try {
      const res = await api.get('exportar-mantenedor-revision', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data as Blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mantenedor_revision.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Archivo exportado correctamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      toast.error('Error al exportar el archivo');
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportarExcelCorte = async () => {
    setIsExportingCorte(true);
    try {
      const res = await api.get('exportar-revision-corte', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data as Blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'revision_corte.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Archivo exportado correctamente');
    } catch (error) {
      console.error('Error al exportar Excel corte:', error);
      toast.error('Error al exportar el archivo');
    } finally {
      setIsExportingCorte(false);
    }
  };

  const handleExportarFacturasImpagas = async () => {
    setIsExportingFacturas(true);
    try {
      const res = await api.get('exportar-facturas-impagas', {
        responseType: 'blob'
      });

      // El tipado de axios con responseType: 'blob' retorna response.data como "unknown"
      // así que lo forzamos a Blob de manera segura para su uso en el objeto URL.
      const blob =
        res.data instanceof Blob ? res.data : new Blob([res.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'facturas-impagas-completo.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Facturas impagas exportadas correctamente');
    } catch (error) {
      console.error('Error al exportar facturas impagas:', error);
      toast.error('Error al exportar las facturas impagas');
    } finally {
      setIsExportingFacturas(false);
    }
  };

  const handleBuscar = async () => {
    setIsSearching(true);
    try {
      const res = await api.get<ConsultarMantenedorRevisionCorte[]>(
        'consulta-mantenedor-revision-corte'
      );
      if (Array.isArray(res.data)) {
        setMantenedorCorteData(res.data);
        toast.success(`Se encontraron ${res.data.length} registros`);
      }
    } catch (error) {
      console.error('Error al buscar datos de corte y reposición:', error);
      toast.error('Error al buscar los datos de corte y reposición.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleActivarActualizacion = async () => {
    setIsActivating(true);
    try {
      const res = await api.post('modificar-revision');
      if (res.status === 200) {
        toast.success('Proceso de revisión modificado correctamente.');
        void handleBuscar();
      } else {
        toast.error('Error al activar la actualización.');
      }
    } catch (error) {
      console.error('Error al activar la actualización:', error);
      toast.error('Error al activar la actualización.');
    } finally {
      setIsActivating(false);
    }
  };

  const handleIniciar = async () => {
    setIsStarting(true);
    try {
      const res = await api.post('ingresar-revision');
      if (res.status === 200) {
        toast.success('Proceso de revisión iniciado correctamente.');
        void handleBuscar();
      } else {
        toast.error('Error al iniciar el proceso de revisión.');
      }
    } catch (error) {
      console.error('Error al iniciar el proceso de revisión:', error);
      toast.error('Error al iniciar el proceso de revisión.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleConfirmarFinalizar = async () => {
    setIsFinalizing(true);
    setShowFinalizarDialog(false);
    try {
      const res = await api.delete('eliminar-revision');
      if (res.status === 200) {
        toast.success('Proceso de revisión finalizado correctamente.');
        void handleBuscar();
      } else {
        toast.error('Error al finalizar el proceso de revisión.');
      }
    } catch (error) {
      console.error('Error al finalizar el proceso:', error);
      toast.error('Error al finalizar el proceso.');
    } finally {
      setIsFinalizing(false);
    }
  };

  // Pasos del tour interactivo con driver.js
  const tourSteps = [
    {
      element: '#panel-revision',
      popover: {
        title: '🔧 Panel de Revisión',
        description:
          'Este es el <strong>panel principal</strong> donde encontrarás todas las herramientas de gestión y control para el proceso de corte y reposición.',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#buscar-btn',
      popover: {
        title: '🔍 Buscar Datos',
        description:
          '¡Empezar aquí! Este botón <strong>actualiza y carga</strong> los datos más recientes del mantenedor de revisión de corte.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#facturas-impagas-btn',
      popover: {
        title: '📊 Exportar Facturas Impagas',
        description:
          'Exporta a Excel <strong>todas las facturas impagas</strong> del sistema. Útil para análisis y reportes financieros.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#estadisticas-rapidas',
      popover: {
        title: '📈 Estadísticas Rápidas',
        description:
          'Vista rápida de los <strong>totales por estado</strong>. Te permite entender la distribución de casos sin abrir el modal.',
        side: 'top' as const,
        align: 'center' as const
      }
    },
    {
      element: '#proceso-buttons',
      popover: {
        title: '⚙️ Activar Actualización',
        description:
          'Primer paso del <strong>flujo de trabajo</strong>: Activa la actualización del proceso de revisión antes de iniciarlo.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#export-buttons',
      popover: {
        title: '💾 Exportar Datos',
        description:
          'Descarga los datos en formato <strong>Excel</strong>. Disponible en dos versiones: Mantenedor completo y Revisión de Corte específica.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#tabla-datos',
      popover: {
        title: '📋 Tabla de Datos',
        description:
          'Listado detallado de todos los registros con <strong>filtros y búsqueda</strong>. Puedes buscar por código, RUT o razón social.',
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

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          {/* Header */}
          <ModernHeader
            title='Corte y Reposición'
            description='Gestión integral de procesos de corte y reposición de servicios'
          />

          {/* Botón de Guía Interactiva */}
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

        <div className='space-y-4'>
          {/* Panel de Revisión modernizado */}
          <Card id='panel-revision' className='border-border bg-card'>
            <Collapsible open={isRevisionOpen} onOpenChange={setIsRevisionOpen}>
              <CollapsibleTrigger asChild>
                <div className='p-3 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10'>
                        <ListChecks className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <CardTitle className='text-lg font-semibold'>
                          Panel de Revisión
                        </CardTitle>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-200 ${
                        isRevisionOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className='p-4 space-y-6'>
                  {/* Botones de Acción modernizados */}
                  <div className='grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-3'>
                    <Button
                      id='buscar-btn'
                      variant='outline'
                      size='sm'
                      onClick={handleBuscar}
                      disabled={isSearching}
                      className='gap-1.5 w-full'
                    >
                      {isSearching ? (
                        <Spinner className='h-4 w-4' />
                      ) : (
                        <Search className='h-4 w-4' />
                      )}
                      Buscar
                    </Button>
                    <Button
                      id='facturas-impagas-btn'
                      variant='outline'
                      size='sm'
                      onClick={handleExportarFacturasImpagas}
                      disabled={isExportingFacturas}
                      className='gap-1.5 w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                    >
                      {isExportingFacturas ? (
                        <Spinner className='h-4 w-4' />
                      ) : (
                        <FileSpreadsheet className='h-4 w-4' />
                      )}
                      Facturas Impagas
                    </Button>
                    <Button
                      id='export-buttons'
                      variant='default'
                      size='sm'
                      onClick={handleExportarExcel}
                      disabled={isExportingExcel}
                      className='gap-1.5 bg-emerald-500 hover:bg-emerald-600 w-full'
                    >
                      {isExportingExcel ? (
                        <Spinner className='h-4 w-4' />
                      ) : (
                        <Download className='h-4 w-4' />
                      )}
                      Exportar
                    </Button>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={handleExportarExcelCorte}
                      disabled={isExportingCorte}
                      className='gap-1.5 bg-emerald-500 hover:bg-emerald-600 w-full'
                    >
                      {isExportingCorte ? (
                        <Spinner className='h-4 w-4' />
                      ) : (
                        <Download className='h-4 w-4' />
                      )}
                      Exportar Corte
                    </Button>
                    <Button
                      id='proceso-buttons'
                      variant='link'
                      size='sm'
                      onClick={handleActivarActualizacion}
                      disabled={!hasEditPermission || isActivating}
                      title={
                        !hasEditPermission
                          ? 'No tiene permisos para actualizar'
                          : ''
                      }
                      className='bg-accent/10 hover:bg-accent/20 transition-colors text-accent-foreground hover:text-accent-foreground/90 w-full'
                    >
                      {isActivating ? (
                        <Spinner className='h-4 w-4' />
                      ) : (
                        <ArrowUpToLine className='h-4 w-4' />
                      )}
                      Actualizar
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={handleIniciar}
                      disabled={!hasCreatePermission || isStarting}
                      title={
                        !hasCreatePermission
                          ? 'No tiene permisos para iniciar'
                          : ''
                      }
                      className='gap-1.5 w-full'
                    >
                      {isStarting ? (
                        <Spinner className='h-4 w-4' />
                      ) : (
                        <Play className='h-4 w-4' />
                      )}
                      Iniciar
                    </Button>
                    <Button
                      variant='secondary'
                      size='sm'
                      onClick={() => setShowFinalizarDialog(true)}
                      disabled={!hasDeletePermission || isFinalizing}
                      title={
                        !hasDeletePermission
                          ? 'No tiene permisos para finalizar'
                          : ''
                      }
                      className='gap-1.5 w-full'
                    >
                      {isFinalizing ? (
                        <Spinner className='h-4 w-4' />
                      ) : (
                        <CheckCircle2 className='h-4 w-4' />
                      )}
                      Finalizar
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Panel de Datos de Mantenedor modernizado */}
          <Card className='border-border bg-card'>
            <div className='p-4 border-b border-border'>
              <div className='flex items-center gap-3'>
                <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10'>
                  <FileText className='h-4 w-4 text-primary' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold'>
                    Mantenedor de Revisión de Corte
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Listado de registros de mantenimiento (
                    {mantenedorCorteData.length} registros)
                  </p>
                </div>
              </div>
            </div>
            <div className='p-4'>
              {mantenedorCorteData.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-xl bg-muted/30 mb-4'>
                    <FileText className='h-8 w-8 text-muted-foreground' />
                  </div>
                  <p className='text-lg font-medium'>
                    No se encontraron registros
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    No hay datos de mantenimiento disponibles
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {/* Estadísticas rápidas */}
                  <div
                    id='estadisticas-rapidas'
                    className='grid grid-cols-2 lg:grid-cols-4 gap-3'
                  >
                    <div className='bg-card rounded-xl p-3 border border-border'>
                      <div className='text-2xl font-bold'>
                        {getCantidadPorCodigo('NULL')}
                      </div>
                      <div className='text-xs text-muted-foreground font-medium'>
                        Pendientes
                      </div>
                    </div>
                    <div className='bg-card rounded-xl p-3 border border-border'>
                      <div className='text-2xl font-bold'>
                        {getCantidadPorCodigo('1')}
                      </div>
                      <div className='text-xs text-muted-foreground font-medium'>
                        Liberados
                      </div>
                    </div>
                    <div className='bg-card rounded-xl p-3 border border-border'>
                      <div className='text-2xl font-bold'>
                        {getCantidadPorCodigo('2')}
                      </div>
                      <div className='text-xs text-muted-foreground font-medium'>
                        Cortados
                      </div>
                    </div>
                    <div className='bg-card rounded-xl p-3 border border-border'>
                      <div className='text-2xl font-bold'>
                        {getCantidadPorCodigo('3')}
                      </div>
                      <div className='text-xs text-muted-foreground font-medium'>
                        Reposición Solicitada
                      </div>
                    </div>
                  </div>

                  {/* Tabla moderna */}
                  <div
                    id='tabla-datos'
                    className='border-border bg-card overflow-hidden'
                  >
                    <DataTable
                      columns={columns(hasEditPermission)}
                      data={mantenedorCorteData}
                      meta={{ handleBuscar }}
                      searchPlaceholder='Buscar por código, RUT o razón social...'
                      defaultPageSize={15}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* AlertDialog de confirmación para finalizar */}
        <AlertDialog
          open={showFinalizarDialog}
          onOpenChange={setShowFinalizarDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full'>
                  <AlertTriangle className='h-6 w-6 text-amber-600 dark:text-amber-400' />
                </div>
                <AlertDialogTitle className='text-xl'>
                  ¿Confirmar Finalización?
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className='space-y-3 text-base'>
                <p className='font-medium text-foreground'>
                  Estás a punto de{' '}
                  <span className='font-bold text-destructive'>
                    eliminar el proceso de revisión actual
                  </span>
                  .
                </p>
                <div className='p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800'>
                  <p className='text-sm text-amber-900 dark:text-amber-100'>
                    <strong>⚠️ Advertencia:</strong> Esta acción no se puede
                    deshacer.
                  </p>
                  <ul className='mt-2 ml-4 text-sm text-amber-800 dark:text-amber-200 list-disc space-y-1'>
                    <li>Se eliminará toda la información del proceso actual</li>
                    <li>Los datos de revisión se perderán permanentemente</li>
                    <li>Deberás iniciar un nuevo proceso desde cero</li>
                  </ul>
                </div>
                <p className='text-sm'>
                  ¿Estás seguro de que deseas continuar?
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isFinalizing}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmarFinalizar}
                disabled={isFinalizing}
                className='bg-destructive hover:bg-destructive/90 text-destructive-foreground'
              >
                {isFinalizing ? (
                  <>
                    <Spinner className='h-4 w-4 mr-2 text-white' />
                    <span className='text-white'>Finalizando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className='h-4 w-4 mr-2 text-white' />
                    <span className='text-white'>Sí, Finalizar</span>
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
