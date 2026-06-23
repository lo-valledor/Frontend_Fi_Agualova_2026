import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import {
  AlertCircleIcon,
  Calendar,
  CheckCircle,
  ChevronDown,
  Eraser,
  HelpCircle,
  Lock,
  Search,
  TrendingUp
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ModernHeader } from '~/components/shared/modern-header';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { operacionesService } from '~/services/operacionesService';
import type { RevisionPreciosBuscarRequest } from '~/types/operaciones';
import {
  getCurrentMonth,
  getCurrentYear,
  getMonthLabel,
  getYearsRange,
  MONTHS,
  validatePeriod
} from '~/utils/operaciones';
import {
  filterPendingConfirmations,
  processConfirmations
} from '~/utils/operaciones/confirmation-helpers';

import { columns } from './columns';
import { DataTableVirtualized } from './data-table-virtualized';

interface RevisarPrecioComponentProps {
  precios: RevisionPreciosBuscarRequest[];
  initialMes: string;
  initialAnio: string;
  error: string | null;
}

export default function RevisarPrecioComponent({
  precios: initialPrecios,
  initialMes,
  initialAnio,
  error
}: Readonly<RevisarPrecioComponentProps>) {
  const [mes, setMes] = useState(initialMes);
  const [anio, setAnio] = useState(initialAnio);
  const [precios, setPrecios] =
    useState<RevisionPreciosBuscarRequest[]>(initialPrecios);
  const [selectedCodigosCargo, setSelectedCodigosCargo] = useState<number[]>(
    []
  );
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleSearch = async (): Promise<void> => {
    const validation = validatePeriod(mes, anio);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      setIsLoading(true);
      setIsFiltersOpen(false);
      const result = await operacionesService.getRevisarPreciosData(mes, anio);

      if (result.error || !result.data) {
        toast.error(result.error || 'Error al buscar precios de revisión');
        return;
      }

      setPrecios(result.data);
      setSelectedCodigosCargo([]);
      toast.success('Búsqueda completada');
    } catch (err) {
      toast.error('Error al buscar precios de revisión', {
        description: String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = (): void => {
    setMes(getCurrentMonth());
    setAnio(getCurrentYear());
    setSelectedCodigosCargo([]);
    toast.success('Filtros reiniciados');
  };

  const refreshData = async (): Promise<void> => {
    const result = await operacionesService.getRevisarPreciosData(mes, anio);
    if (result.error || !result.data) return;
    setPrecios(result.data);
  };

  const pendientes = useMemo(
    () => filterPendingConfirmations(precios, selectedCodigosCargo),
    [precios, selectedCodigosCargo]
  );

  const handleOpenConfirmDialog = (): void => {
    if (selectedCodigosCargo.length === 0) {
      toast.info('Selecciona al menos un registro pendiente para confirmar');
      return;
    }
    setPasswordConfirmacion('');
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmar = async (): Promise<void> => {
    if (!passwordConfirmacion) {
      toast.error('Debes ingresar tu contraseña para confirmar');
      return;
    }

    setIsConfirming(true);
    try {
      const resultado = await processConfirmations(
        pendientes,
        passwordConfirmacion
      );

      if (resultado.shouldStop) {
        setIsConfirmDialogOpen(false);
        return;
      }

      setIsConfirmDialogOpen(false);

      if (resultado.exitosas > 0) {
        toast.success(
          `Se han confirmado ${resultado.exitosas} registros correctamente`
        );
        setSelectedCodigosCargo([]);
        await refreshData();
      } else {
        toast.error('No se pudo confirmar los registros');
      }
    } catch (err) {
      toast.error('Error al confirmar', { description: String(err) });
    } finally {
      setIsConfirming(false);
    }
  };

  const totalPendientesGlobal = useMemo(
    () => precios.filter(p => p.indice > 0 && !p.estaConfirmado).length,
    [precios]
  );

  const tourSteps = [
    {
      element: '#filtros-periodo',
      popover: {
        title: 'Filtros de Período',
        description:
          'Selecciona el <strong>mes y año</strong> para consultar los precios de revisión.',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#buscar-btn',
      popover: {
        title: 'Buscar Precios',
        description:
          'Carga los precios de revisión para el período seleccionado.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#tabla-precios',
      popover: {
        title: 'Tabla de Precios',
        description:
          'Revisa los precios, selecciona los pendientes y modifícalos o confírmalos.',
        side: 'top' as const,
        align: 'start' as const
      }
    },
    {
      element: '#confirmar-btn',
      popover: {
        title: 'Confirmar Cambios',
        description:
          'Confirma los registros seleccionados con tu contraseña de usuario.',
        side: 'top' as const,
        align: 'center' as const
      }
    }
  ];

  useEffect(() => {
    return () => {
      const driverEl = document.querySelector('.driver-active');
      if (driverEl) driverEl.remove();
    };
  }, []);

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
        if (element)
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    driverjs.setSteps(tourSteps);
    driverjs.drive();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-3 space-y-4">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-xl mb-3">
              <TrendingUp className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold mb-2">
              Error al cargar datos
            </h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <ModernHeader
            title="Revisar Precios"
            description="Validación y confirmación de precios de revisión"
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

        <Card id="filtros-periodo" className="border border-border shadow-sm">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className="p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium">
                      Período de Consulta
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Selecciona mes y año para revisar los precios
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

            <CollapsibleContent>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mes</Label>
                    <select
                      value={mes}
                      onChange={e => setMes(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {MONTHS.map(m => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Año</Label>
                    <select
                      value={anio}
                      onChange={e => setAnio(e.target.value)}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {getYearsRange().map(y => (
                        <option key={y.value} value={y.value}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3 border-t border-border">
                  <Button
                    id="limpiar-btn"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="gap-2"
                  >
                    <Eraser className="w-4 h-4" />
                    Limpiar
                  </Button>
                  <Button
                    id="buscar-btn"
                    size="sm"
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Buscar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/30 rounded-lg border border-border">
              <div className="space-y-1">
                <h3 className="font-medium text-sm sm:text-base">
                  Confirmación de Cambios
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Registros seleccionados:{' '}
                  <span className="font-medium text-primary">
                    {selectedCodigosCargo.length}
                  </span>{' '}
                  / Pendientes totales:{' '}
                  <span className="font-medium">{totalPendientesGlobal}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {getMonthLabel(mes)} {anio}
                </Badge>
                <Button
                  id="confirmar-btn"
                  onClick={handleOpenConfirmDialog}
                  disabled={isConfirming || selectedCodigosCargo.length === 0}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    {isConfirming ? 'Procesando...' : 'Confirmar'}
                  </span>
                  <span className="sm:hidden">Confirmar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-3">
            <div
              id="tabla-precios"
              className="rounded-xl border border-border overflow-hidden bg-card"
            >
              <DataTableVirtualized
                columns={columns(refreshData)}
                data={precios}
                enableSelection
                selectedRowIds={selectedCodigosCargo.map(String)}
                onRowSelectionChange={ids =>
                  setSelectedCodigosCargo(ids.map(Number))
                }
                rowId="codigoCargo"
                isLoading={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Lock className="h-4 w-4" />
              Confirmar {selectedCodigosCargo.length} registro
              {selectedCodigosCargo.length === 1 ? '' : 's'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Ingresa tu contraseña para confirmar la selección de{' '}
              <strong>{pendientes.length}</strong> registro
              {pendientes.length === 1 ? '' : 's'} pendiente
              {pendientes.length === 1 ? '' : 's'}.
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={passwordConfirmacion}
                onChange={e => setPasswordConfirmacion(e.target.value)}
                placeholder="Tu contraseña"
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isConfirming}
              size="sm"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmar}
              disabled={isConfirming || !passwordConfirmacion}
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                  Confirmando...
                </>
              ) : (
                <>
                  <AlertCircleIcon className="w-4 h-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
