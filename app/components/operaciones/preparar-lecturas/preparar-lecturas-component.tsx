import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Eraser,
  FileTextIcon,
  Info,
  SearchIcon,
  UsersIcon
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ModernHeader } from '~/components/shared/modern-header';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import type {
  PrepararLecturasBuscarNichosRequest,
  PrepararLecturasFiltrosCiclosResponse,
  PrepararLecturasFiltrosPeriodosResponse
} from '~/types/operaciones';
import TablaAsignacionSectores from './tabla-asignacion-sectores';

interface PrepararLecturasComponentProps {
  readonly periodoAbierto: PrepararLecturasFiltrosPeriodosResponse[];
  readonly ciclos: PrepararLecturasFiltrosCiclosResponse[];
  readonly nichos: PrepararLecturasBuscarNichosRequest[];
  readonly setNichos: React.Dispatch<
    React.SetStateAction<PrepararLecturasBuscarNichosRequest[]>
  >;
  readonly isLoadingNichos: boolean;
  readonly onRecargarNichos: (
    cicloId: number,
    periodoId: string
  ) => Promise<void>;
  readonly error: string | null;
}

export default function PrepararLecturasComponent({
  periodoAbierto,
  ciclos,
  nichos,
  setNichos,
  isLoadingNichos,
  onRecargarNichos,
  error
}: PrepararLecturasComponentProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [cicloId, setCicloId] = useState<string>('');
  const [periodoId, setPeriodoId] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const prevLoadingRef = useRef(isLoadingNichos);

  // Inicializar período/ciclo por defecto cuando llegan datos
  useEffect(() => {
    if (periodoAbierto.length > 0 && !periodoId) {
      setPeriodoId(periodoAbierto[0].id);
    }
  }, [periodoAbierto, periodoId]);

  // Toast cuando termina la carga
  useEffect(() => {
    if (prevLoadingRef.current && !isLoadingNichos) {
      if (nichos.length === 0) {
        toast.info('No se encontraron nichos pendientes');
      } else {
        toast.success(`Se encontraron ${nichos.length} nichos`);
      }
    }
    prevLoadingRef.current = isLoadingNichos;
  }, [isLoadingNichos, nichos.length]);

  const cicloIdNumero = useMemo(() => {
    const n = Number(cicloId);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [cicloId]);

  const handleBuscar = async (): Promise<void> => {
    if (!periodoId) {
      toast.error('Selecciona un período');
      return;
    }
    if (!cicloIdNumero) {
      toast.error('Selecciona un ciclo de facturación');
      return;
    }

    try {
      setErrorLocal(null);
      setHasSearched(true);
      await onRecargarNichos(cicloIdNumero, periodoId);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      setErrorLocal(mensaje);
      toast.error(`Error al buscar nichos: ${mensaje}`);
    }
  };

  const handleLimpiar = (): void => {
    setCicloId('');
    setPeriodoId(periodoAbierto[0]?.id ?? '');
    setNichos([]);
    setErrorLocal(null);
    setHasSearched(false);
    toast.success('Filtros limpiados');
  };

  const periodoActual = periodoAbierto[0];
  const renderEmptyState = () => {
    if (isLoadingNichos) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="font-medium text-sm">Buscando nichos...</p>
            <p className="text-xs text-muted-foreground">Por favor espere</p>
          </div>
        </div>
      );
    }

    if (hasSearched && nichos.length === 0) {
      return (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold">
            Sin nichos pendientes
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400 mt-2">
            No hay nichos pendientes para preparar con el ciclo y período
            seleccionados.
          </AlertDescription>
        </Alert>
      );
    }

    if (errorLocal || error) {
      return (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Error al cargar los datos</AlertTitle>
          <AlertDescription>{errorLocal || error}</AlertDescription>
        </Alert>
      );
    }

    if (!hasSearched && nichos.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <SearchIcon className="w-10 h-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-sm">Realizar búsqueda de nichos</p>
            <p className="text-xs text-muted-foreground">
              Selecciona período y ciclo, luego haz clic en Buscar.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <ModernHeader
          title="Preparación de Lecturas"
          description="Gestión de asignación de nichos para lectura"
        />

        <Card className="border border-border shadow-sm">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
                  <SearchIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-medium">
                    Criterios de Búsqueda
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Selecciona período y ciclo de facturación
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isFiltersOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </div>

            <CollapsibleContent>
              <CardContent className="p-3">
                <div className="flex flex-col gap-4 w-full">
                  <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm font-medium flex items-center gap-2 mb-1">
                        <CalendarIcon className="w-4 h-4 text-primary" />
                        Período
                      </Label>
                      {periodoAbierto.length === 0 ? (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                          <AlertCircleIcon className="w-4 h-4" />
                          <span className="font-medium text-sm">
                            No hay período abierto
                          </span>
                        </div>
                      ) : (
                        <Select value={periodoId} onValueChange={setPeriodoId}>
                          <SelectTrigger className="h-[50px] bg-background border-border w-full text-sm">
                            <SelectValue placeholder="Selecciona un período" />
                          </SelectTrigger>
                          <SelectContent>
                            {periodoAbierto.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.descripcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor="ciclo"
                        className="text-sm font-medium flex items-center gap-2 mb-1"
                      >
                        <FileTextIcon className="w-4 h-4 text-primary" />
                        Ciclo de facturación
                      </Label>
                      <Select value={cicloId} onValueChange={setCicloId}>
                        <SelectTrigger
                          id="ciclo"
                          className="h-[50px] bg-background border-border w-full text-sm"
                        >
                          <SelectValue placeholder="Selecciona un ciclo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ciclos.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:justify-end">
                    <Button
                      onClick={handleLimpiar}
                      variant="outline"
                      disabled={isLoadingNichos}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Eraser className="h-4 w-4" />
                      Limpiar
                    </Button>
                    <Button
                      onClick={handleBuscar}
                      disabled={isLoadingNichos || !cicloIdNumero || !periodoId}
                      className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                    >
                      <SearchIcon className="h-4 w-4" />
                      {isLoadingNichos ? 'Buscando...' : 'Buscar Nichos'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="p-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
                <UsersIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">
                  {nichos.length} {nichos.length === 1 ? 'nicho' : 'nichos'}{' '}
                  encontrados
                </CardTitle>
                {periodoActual && (
                  <CardDescription className="text-xs">
                    Período: {periodoActual.descripcion}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {renderEmptyState() ??
              (cicloIdNumero > 0 && periodoId ? (
                <TablaAsignacionSectores
                  data={nichos}
                  isLoading={isLoadingNichos}
                  cicloId={cicloIdNumero}
                  periodoId={periodoId}
                  onSuccess={async () => {
                    await onRecargarNichos(cicloIdNumero, periodoId);
                  }}
                />
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  Selecciona período y ciclo para ver nichos
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
