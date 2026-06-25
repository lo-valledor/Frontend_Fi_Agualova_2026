import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import {
  AlertTriangle,
  ArrowUpToLine,
  CheckCircle2,
  ChevronDown,
  FileText,
  HelpCircle,
  ListChecks,
  Play,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
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
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardTitle } from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import { Spinner } from '~/components/ui/spinner';
import { operacionesService } from '~/services/operacionesService';
import type {
  CorteReposicionBuscarRequest,
  CorteReposicionResumenResponse
} from '~/types/operaciones';

import { columns } from './columns';

interface CorteReposicionComponentProps {
  readonly resumen: CorteReposicionResumenResponse | null;
  readonly mantenedorCorteData: CorteReposicionBuscarRequest[];
  readonly error: string | null;
}

export default function CorteReposicionComponent({
  resumen: initialResumen,
  mantenedorCorteData: initialMantenedorCorteData,
  error
}: Readonly<CorteReposicionComponentProps>) {
  const [isRevisionOpen, setIsRevisionOpen] = useState(true);
  const [resumen, setResumen] = useState<CorteReposicionResumenResponse | null>(
    initialResumen
  );
  const [mantenedorCorteData, setMantenedorCorteData] = useState<
    CorteReposicionBuscarRequest[]
  >(initialMantenedorCorteData);
  const [isSearching, setIsSearching] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showFinalizarDialog, setShowFinalizarDialog] = useState(false);

  const handleBuscar = async (): Promise<void> => {
    setIsSearching(true);
    try {
      const result = await operacionesService.getCorteReposicionData();
      if (result.error || !result.data) {
        toast.error('Error al buscar datos de corte y reposición');
        return;
      }
      setResumen(result.data.resumen);
      setMantenedorCorteData(result.data.mantenedorCorteData);
      toast.success(
        `Se encontraron ${result.data.mantenedorCorteData.length} registros`
      );
    } catch (err) {
      toast.error('Error al buscar datos', { description: String(err) });
    } finally {
      setIsSearching(false);
    }
  };

  const handleActualizar = async (): Promise<void> => {
    setIsActivating(true);
    try {
      const result =
        await operacionesService.postActualizarProcesoCorteReposicion();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Proceso de revisión actualizado correctamente');
      await handleBuscar();
    } catch (err) {
      toast.error('Error al actualizar el proceso', {
        description: String(err)
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleIniciar = async (): Promise<void> => {
    setIsStarting(true);
    try {
      const result =
        await operacionesService.postIniciarProcesoCorteReposicion();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Proceso de revisión iniciado correctamente');
      await handleBuscar();
    } catch (err) {
      toast.error('Error al iniciar el proceso', {
        description: String(err)
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleConfirmarFinalizar = async (): Promise<void> => {
    setIsFinalizing(true);
    setShowFinalizarDialog(false);
    try {
      const result =
        await operacionesService.postFinalizarProcesoCorteReposicion();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Proceso de revisión finalizado correctamente');
      await handleBuscar();
    } catch (err) {
      toast.error('Error al finalizar el proceso', {
        description: String(err)
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  const tourSteps = [
    {
      element: '#panel-revision',
      popover: {
        title: '🔧 Panel de Revisión',
        description:
          'Panel principal con las herramientas de gestión y control para el proceso de corte y reposición.',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#buscar-btn',
      popover: {
        title: '🔍 Buscar Datos',
        description:
          'Actualiza y carga los datos más recientes del mantenedor de revisión de corte.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#estadisticas-rapidas',
      popover: {
        title: '📈 Estadísticas Rápidas',
        description:
          'Vista rápida de los totales por estado (pendientes, liberados, cortados, reposición solicitada).',
        side: 'top' as const,
        align: 'center' as const
      }
    },
    {
      element: '#proceso-buttons',
      popover: {
        title: '⚙️ Flujo de Trabajo',
        description:
          'Actualiza el proceso de revisión antes de iniciarlo o finalizarlo.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#tabla-datos',
      popover: {
        title: '📋 Tabla de Datos',
        description:
          'Listado detallado de registros con filtros y búsqueda por código, RUT o razón social.',
        side: 'top' as const,
        align: 'start' as const
      }
    }
  ];

  const startTour = (): void => {
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

  const renderResumen = () => {
    if (!resumen) return null;
    const items: Array<{
      key: keyof CorteReposicionResumenResponse;
      label: string;
      tone: string;
    }> = [
      { key: 'pendientes', label: 'Pendientes', tone: 'amber' },
      { key: 'liberados', label: 'Liberados', tone: 'emerald' },
      { key: 'cortados', label: 'Cortados', tone: 'red' },
      {
        key: 'reposicionSolicitada',
        label: 'Reposición Solicitada',
        tone: 'sky'
      }
    ];
    return (
      <div
        id="estadisticas-rapidas"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {items.map(item => (
          <div
            key={item.key}
            className="bg-card rounded-xl p-3 border border-border"
          >
            <div className="text-2xl font-bold">{resumen[item.key]}</div>
            <div className="text-xs text-muted-foreground font-medium">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <ModernHeader
            title="Corte y Reposición"
            description="Gestión integral de procesos de corte y reposición de servicios"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={startTour}
            className="mb-2"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            {error}
          </div>
        )}

        <Card id="panel-revision" className="border-border bg-card">
          <Collapsible open={isRevisionOpen} onOpenChange={setIsRevisionOpen}>
            <CollapsibleTrigger asChild>
              <div className="p-3 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                      <ListChecks className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">
                      Panel de Revisión
                    </CardTitle>
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
              <CardContent className="p-4">
                <div
                  id="proceso-buttons"
                  className="grid grid-cols-1 sm:grid-cols-4 gap-2"
                >
                  <Button
                    id="buscar-btn"
                    variant="outline"
                    size="sm"
                    onClick={handleBuscar}
                    disabled={isSearching}
                    className="gap-1.5 w-full"
                  >
                    {isSearching ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Buscar
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleActualizar}
                    disabled={isActivating}
                    className="gap-1.5 w-full"
                  >
                    {isActivating ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <ArrowUpToLine className="h-4 w-4" />
                    )}
                    Actualizar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleIniciar}
                    disabled={isStarting}
                    className="gap-1.5 w-full"
                  >
                    {isStarting ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Iniciar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFinalizarDialog(true)}
                    disabled={isFinalizing}
                    className="gap-1.5 w-full"
                  >
                    {isFinalizing ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Finalizar
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="border-border bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Mantenedor de Revisión de Corte
                </h3>
                <p className="text-sm text-muted-foreground">
                  Listado de registros de mantenimiento
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {renderResumen()}
            {mantenedorCorteData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted/30 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium">
                  No se encontraron registros
                </p>
                <p className="text-sm text-muted-foreground">
                  No hay datos de mantenimiento disponibles
                </p>
              </div>
            ) : (
              <div
                id="tabla-datos"
                className="border-border bg-card overflow-hidden"
              >
                <DataTable
                  columns={columns()}
                  data={mantenedorCorteData}
                  meta={{ handleBuscar }}
                  searchPlaceholder="Buscar por código, RUT o razón social..."
                  defaultPageSize={15}
                />
              </div>
            )}
          </div>
        </Card>

        <AlertDialog
          open={showFinalizarDialog}
          onOpenChange={setShowFinalizarDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <AlertDialogTitle className="text-xl">
                  ¿Confirmar Finalización?
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="space-y-3 text-base">
                <p className="font-medium text-foreground">
                  Estás a punto de{' '}
                  <span className="font-bold text-destructive">
                    eliminar el proceso de revisión actual
                  </span>
                  .
                </p>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    <strong>⚠️ Advertencia:</strong> Esta acción no se puede
                    deshacer.
                  </p>
                  <ul className="mt-2 ml-4 text-sm text-amber-800 dark:text-amber-200 list-disc space-y-1">
                    <li>Se eliminará toda la información del proceso actual</li>
                    <li>Los datos de revisión se perderán permanentemente</li>
                    <li>Deberás iniciar un nuevo proceso desde cero</li>
                  </ul>
                </div>
                <p className="text-sm">
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
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {isFinalizing ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2 text-white" />
                    <span className="text-white">Finalizando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-white" />
                    <span className="text-white">Sí, Finalizar</span>
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
