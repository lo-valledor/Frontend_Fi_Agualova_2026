import type { PaginationState } from '@tanstack/react-table';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  History,
  Loader2,
  PlusCircleIcon,
  X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { monitorService } from '~/services/monitorService';
import { operacionesService } from '~/services/operacionesService';
import type { MonitorPeriodos } from '~/types/monitor';
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

  // ─── Filtros server-side (mes / año) ──────────────────────────────────
  const [mesFilter, setMesFilter] = useState<string>('');
  const [anioFilter, setAnioFilter] = useState<string>('');

  // ─── Estado de paginación/búsqueda server-side de la tabla ─────────
  const DEFAULT_PAGE_SIZE = 10;
  const [tableData, setTableData] = useState<Periodos[]>(
    Array.isArray(periodos) ? periodos : []
  );
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [tablePagination, setTablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE
  });
  // Heurística: si la respuesta trae menos filas que pageSize, sabemos
  // que es la última página. Si trae la cantidad completa, asumimos más.
  const [hasMore, setHasMore] = useState(true);
  const requestIdRef = useRef(0);

  // ─── Search client-side ─────────────────────────────────────────────
  // La búsqueda libre no la pasamos al backend (no hay un parámetro
  // `descripcion` o `q` en /periodos/buscar). Filtramos en memoria sobre
  // la página actual. Si el dataset crece, conviene agregarlo al backend.
  const [searchValue, setSearchValue] = useState('');

  // ─── Periodo activo desde el monitor ─────────────────────────────────
  // El endpoint /periodos/buscar devuelve todos los periodos, pero el
  // "periodo activo" real (el que se está facturando ahora) lo expone el
  // monitor en /monitor-lecturas/filtros/periodos con formato
  // { value: "092025", text: "Septiembre 2025", ... }. Usamos esa fuente
  // para mostrar el periodo activo y poder cerrarlo.
  const [monitorPeriodo, setMonitorPeriodo] = useState<MonitorPeriodos | null>(
    null
  );
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [monitorError, setMonitorError] = useState<string | null>(null);

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Período Facturación' }
  ];

  // ─── Fetch server-side: limit + offset + filtros mes/anio ──────────
  const fetchPeriodosPage = useCallback(
    async ({
      pageIndex,
      pageSize
    }: {
      pageIndex: number;
      pageSize: number;
    }) => {
      const requestId = ++requestIdRef.current;
      setTableLoading(true);
      setTableError(null);
      const result =
        await operacionesService.getPeriodoFacturacionByLimitAndOffset(
          mesFilter || undefined,
          anioFilter || undefined,
          pageSize,
          pageIndex * pageSize
        );

      // Descartar respuesta si el usuario ya disparó otra request
      if (requestId !== requestIdRef.current) return;

      if (result.error || !result.data) {
        setTableData([]);
        setHasMore(false);
        setTableError(result.error ?? 'Error desconocido');
      } else {
        setTableData(result.data);
        setHasMore(result.data.length >= pageSize);
      }
      setTableLoading(false);
    },
    [mesFilter, anioFilter]
  );

  // Carga inicial + refetch cuando cambian filtros (resetea a página 0)
  useEffect(() => {
    setTablePagination(prev => ({ ...prev, pageIndex: 0 }));
    fetchPeriodosPage({
      pageIndex: 0,
      pageSize: tablePagination.pageSize
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesFilter, anioFilter]);

  // Refetch cuando cambia pageSize (no pageIndex — ese lo cubre el handler)
  useEffect(() => {
    fetchPeriodosPage({
      pageIndex: tablePagination.pageIndex,
      pageSize: tablePagination.pageSize
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablePagination.pageSize]);

  const handleTablePaginationChange = useCallback(
    (next: PaginationState) => {
      setTablePagination(next);
      fetchPeriodosPage({
        pageIndex: next.pageIndex,
        pageSize: next.pageSize
      });
    },
    [fetchPeriodosPage]
  );

  const handleTableSearchChange = useCallback(
    ({ value }: { field: string; value: string }) => {
      setSearchValue(value);
    },
    []
  );

  // ─── Filtrado client-side sobre la página actual ───────────────────
  const visiblePeriodos = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) return tableData;
    return tableData.filter(
      p =>
        p.codigo.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q)
    );
  }, [tableData, searchValue]);

  const hasActiveFilters = mesFilter !== '' || anioFilter !== '';

  const clearFilters = useCallback(() => {
    setMesFilter('');
    setAnioFilter('');
  }, []);

  // Refetch helper que también respeta el filtro actual (usado por
  // CerrarPeriodo y DialogNuevoPeriodo tras crear/cerrar)
  const refetchPeriodos = useCallback(() => {
    fetchPeriodosPage({
      pageIndex: tablePagination.pageIndex,
      pageSize: tablePagination.pageSize
    });
  }, [fetchPeriodosPage, tablePagination.pageIndex, tablePagination.pageSize]);

  // ─── Fetch del periodo activo desde el monitor ─────────────────────
  const fetchMonitorPeriodo = useCallback(async () => {
    setMonitorLoading(true);
    setMonitorError(null);
    const result = await monitorService.getPeriodos();
    setMonitorLoading(false);

    if (result.error) {
      // No es crítico — sólo mostramos "no hay periodos activos"
      setMonitorPeriodo(null);
      setMonitorError(result.error);
      return;
    }
    // El monitor expone un único periodo activo (o ninguno). Tomamos el
    // primero si existe.
    const first = Array.isArray(result.data) ? result.data[0] : null;
    setMonitorPeriodo(first ?? null);
  }, []);

  useEffect(() => {
    fetchMonitorPeriodo();
  }, [fetchMonitorPeriodo]);

  const refetchAll = useCallback(() => {
    refetchPeriodos();
    fetchMonitorPeriodo();
  }, [refetchPeriodos, fetchMonitorPeriodo]);

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
        {monitorLoading && !monitorPeriodo ? (
          <Card className="border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Buscando período activo…</p>
              </div>
            </CardContent>
          </Card>
        ) : monitorPeriodo ? (
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
                        {monitorPeriodo.text}
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
                          variant="outline"
                          size="sm"
                          className="gap-2 w-full sm:w-auto"
                          disabled={!!monitorPeriodo}
                        >
                          <PlusCircleIcon className="h-4 w-4" />
                          <span className="text-sm">Nuevo Período</span>
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Debe cerrar el período vigente para poder crear uno
                        nuevo.
                      </p>
                    </TooltipContent>
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
                  periodoId={monitorPeriodo.value}
                  onSuccess={refetchAll}
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
                      No hay períodos activos
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground mt-1 text-xs">
                      {monitorError
                        ? 'No se pudo consultar el período activo del monitor.'
                        : 'El sistema está disponible. Puede crear un nuevo período de facturación y todas las operaciones se registrarán en él.'}
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
              <div className="flex flex-1 flex-col gap-1 sm:max-w-45">
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
              <div className="flex flex-1 flex-col gap-1 sm:max-w-45">
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
                  onClick={refetchPeriodos}
                >
                  Reintentar
                </Button>
              </div>
            ) : visiblePeriodos.length === 0 && !tableLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                  <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-base font-medium text-foreground">
                  No se encontraron períodos
                </p>
                <p className="text-xs text-muted-foreground">
                  {searchValue.trim()
                    ? `Sin resultados para "${searchValue.trim()}"`
                    : hasActiveFilters
                      ? 'No hay períodos que coincidan con los filtros aplicados'
                      : 'No hay períodos de facturación registrados'}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <DataTable
                  columns={columns}
                  data={visiblePeriodos}
                  searchPlaceholder="Buscar por descripción o ID..."
                  manualPagination
                  manualFiltering
                  pageCount={-1}
                  onPaginationChange={handleTablePaginationChange}
                  onSearchChange={handleTableSearchChange}
                  isLoading={tableLoading}
                  hasMore={hasMore}
                  error={tableError}
                  onRetry={refetchPeriodos}
                  emptyMessage={
                    searchValue.trim()
                      ? `Sin resultados para "${searchValue.trim()}"`
                      : 'No hay períodos registrados'
                  }
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
            refetchAll();
          }}
          years={years}
        />
      </div>
    </div>
  );
}
