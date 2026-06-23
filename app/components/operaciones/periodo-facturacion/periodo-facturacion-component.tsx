import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  History,
  PlusCircleIcon,
  X
} from 'lucide-react';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { DataTable } from '~/components/data-table/data-table';
import { ModernHeader } from '~/components/shared/modern-header';
import { AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import { operacionesService } from '~/services/operacionesService';
import type { Anio, Periodos } from '~/types/operaciones';
import CerrarPeriodo from './cerrar-periodo';
import { columns } from './columns';
import DialogNuevoPeriodo from './dialog-nuevo-periodo';

const MESES = [
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

// Ordena cronológicamente ASC por fechaInicio (formato DD-MM-YYYY).
// Centralizado acá porque el backend de periodos no garantiza el orden
// en sus respuestas y el sortFn del cliente no aplica cuando hay filtro.
const sortPeriodosAsc = (data: Periodos[]): Periodos[] =>
  [...data].sort((a, b) => {
    // fechaInicio viene como "DD-MM-YYYY" — convertir a comparable
    const parseDate = (s: string): number => {
      const [d, m, y] = s.split('-').map(Number);
      return new Date(y, m - 1, d).getTime();
    };
    return parseDate(a.fechaInicio) - parseDate(b.fechaInicio);
  });

export default function AbrirPeriodoFacturacion({
  years,
  periodos,
  error
}: Readonly<{
  years: Anio[];
  periodos: Periodos[];
  error: string | null;
}>) {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [periodosData, setPeriodosData] = useState<Periodos[]>(
    Array.isArray(periodos) ? periodos : [],
  );

  // ─── Filtros server-side ─────────────────────────────────────────────
  const [mesFilter, setMesFilter] = useState<string>('');
  const [anioFilter, setAnioFilter] = useState<string>('');
  const [tableError, setTableError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Período Facturación' },
  ];

  // ─── Fetch server-side (filter por mes/anio, sin paginación) ────────
  const fetchPeriodos = useCallback(async () => {
    setIsFetching(true);
    setTableError(null);
    const result = await operacionesService.getPeriodoFacturacionData(
      mesFilter || undefined,
      anioFilter || undefined,
    );
    setIsFetching(false);

    if (result.error) {
      setTableError(result.error);
      setPeriodosData([]);
      return;
    }
    const raw = Array.isArray(result.data) ? result.data : [];
    // Orden ASC siempre — el backend no lo garantiza y la paginación
    // client-side necesita datos estables para el sort.
    setPeriodosData(sortPeriodosAsc(raw));
  }, [mesFilter, anioFilter]);

  useEffect(() => {
    fetchPeriodos();
  }, [fetchPeriodos]);

  // Encontrar período abierto dentro de la data cargada
  const periodoAbierto = useMemo(() => {
    return Array.isArray(periodosData)
      ? periodosData.find(p => p.estado === 'Abierto')
      : undefined;
  }, [periodosData]);

  const hasActiveFilters = mesFilter !== '' || anioFilter !== '';

  const clearFilters = useCallback(() => {
    setMesFilter('');
    setAnioFilter('');
  }, []);

  // Early return para error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-3 space-y-4">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-xl mb-3">
              <AlertTriangle className="w-6 h-6 text-destructive" />
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
        <BreadcrumbSetter items={pageBreadcrumbs} />

        {/* Header */}
        <ModernHeader
          title="Período Facturación"
          description="Gestión de períodos de facturación activos"
        />

        {/* Status Card */}
        {periodoAbierto ? (
          <Card className="border border-border shadow-sm">
            <CardHeader className="">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Período Activo</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      <span className="font-medium text-primary">
                        {periodoAbierto.descripcion}
                      </span>{' '}
                      está abierto
                    </CardDescription>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <div className="inline-block w-full sm:w-auto">
                        <Button
                          onClick={() => setIsOpenDialog(true)}
                          disabled={!!periodoAbierto}
                          variant="outline"
                          size="sm"
                          className="gap-2 w-full sm:w-auto"
                        >
                          <PlusCircleIcon className="h-4 w-4" />
                          <span className="text-sm">Nuevo Período</span>
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {periodoAbierto && (
                      <TooltipContent>
                        <p>
                          Debe cerrar el período vigente para poder crear uno
                          nuevo.
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="pt-0 p-4">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                <div className="flex-1 space-y-1">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground">
                      Para crear un nuevo período de facturación, primero debe
                      cerrar el actual.
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Esta acción es irreversible a menos que un administrador lo
                    reabra posteriormente.
                  </p>
                </div>
                <CerrarPeriodo
                  periodoId={periodoAbierto.codigo}
                  onSuccess={fetchPeriodos}
                  className="w-full lg:w-auto min-w-32"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <AlertTitle className="text-base text-foreground font-medium">
                      Sistema Disponible
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground mt-1 text-xs">
                      No hay períodos abiertos. Puede crear un nuevo período de
                      facturación. Todas las operaciones se registrarán en el
                      nuevo período.
                    </AlertDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpenDialog(true)}
                  size="sm"
                  variant="default"
                >
                  <PlusCircleIcon className="h-4 w-4" />
                  <span className="text-sm">Crear Período</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Table */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="border-b border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-background rounded-xl flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base">
                  Historial de Períodos
                </CardTitle>
                <CardDescription className="text-xs">
                  Gestión completa de períodos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* ─── Filtros server-side (mes / año) ─── */}
            <div className="flex flex-col gap-3 rounded-lg border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-900/30 px-3 py-2.5 shadow-sm sm:flex-row sm:items-end">
              <div className="flex items-center gap-2 text-muted-foreground sm:mr-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtros</span>
              </div>
              <div className="flex flex-1 flex-col gap-1 sm:max-w-[180px]">
                <Label htmlFor="mes-filter" className="text-xs">
                  Mes
                </Label>
                <Select value={mesFilter} onValueChange={setMesFilter}>
                  <SelectTrigger id="mes-filter" className="h-9 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map(m => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-1 flex-col gap-1 sm:max-w-[180px]">
                <Label htmlFor="anio-filter" className="text-xs">
                  Año
                </Label>
                <Select value={anioFilter} onValueChange={setAnioFilter}>
                  <SelectTrigger id="anio-filter" className="h-9 text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y.idAnio} value={String(y.anio)}>
                        {y.anio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9"
                >
                  <X className="mr-1 h-3 w-3" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* ─── Tabla ─── */}
            {tableError ? (
              <div className="flex flex-col items-center justify-center py-8 text-destructive">
                <AlertTriangle className="h-6 w-6 mb-2" />
                <p className="text-sm font-medium">{tableError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={fetchPeriodos}
                >
                  Reintentar
                </Button>
              </div>
            ) : periodosData.length === 0 && !isFetching ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                  <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">
                  No se encontraron períodos
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasActiveFilters
                    ? 'No hay períodos que coincidan con los filtros aplicados'
                    : 'No hay períodos de facturación registrados'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <DataTable
                  columns={columns}
                  data={periodosData}
                  // Orden inicial ASC — coincide con el orden del array.
                  // El sortFn de las columnas de fecha mantiene el formato DD-MM-YYYY.
                  initialSorting={[{ id: 'fechaInicio', desc: false }]}
                  searchPlaceholder="Buscar por descripción o ID..."
                  defaultPageSize={10}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog para crear nuevo periodo */}
        <DialogNuevoPeriodo
          open={isOpenDialog}
          onOpenChange={setIsOpenDialog}
          onPeriodoCreated={() => {
            setIsOpenDialog(false);
            fetchPeriodos();
          }}
          years={years}
        />
      </div>
    </div>
  );
}
