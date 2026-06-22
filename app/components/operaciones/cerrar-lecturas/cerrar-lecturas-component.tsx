import {
  AlertCircleIcon,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eraser,
  Info,
  Loader2,
  Lock,
  Search,
  UsersIcon
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ModernHeader } from '~/components/shared/modern-header';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Separator } from '~/components/ui/separator';
import { operacionesService } from '~/services/operacionesService';
import type {
  CerrarLecturasFiltrosCiclosResponse,
  CerrarLecturasFiltrosPeriodosResponse,
  PrepararLecturasBuscarNichosRequest
} from '~/types/operaciones';

import AlertCerrarLecturas from './alert-cerrar-lecturas';
import DialogInformacion from './dialog-informacion';

interface CerrarLecturasComponentProps {
  readonly periodos: CerrarLecturasFiltrosPeriodosResponse;
  readonly ciclos: CerrarLecturasFiltrosCiclosResponse;
  readonly error: string | null;
}

export default function CerrarLecturasComponent({
  periodos,
  ciclos,
  error
}: CerrarLecturasComponentProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [periodoId, setPeriodoId] = useState<string>(
    () => periodos[0]?.id ?? ''
  );
  const [cicloId, setCicloId] = useState<string>('');
  const [nichos, setNichos] = useState<PrepararLecturasBuscarNichosRequest[]>(
    []
  );
  const [selectedIdsNichos, setSelectedIdsNichos] = useState<number[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Si llegan más periodos desde el loader, mantener selección si sigue válida
  useEffect(() => {
    if (periodos.length > 0 && !periodos.some(p => p.id === periodoId)) {
      setPeriodoId(periodos[0].id);
    }
  }, [periodos, periodoId]);

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
      setIsLoading(true);
      setHasSearched(true);
      setSelectedIdsNichos([]);

      const result = await operacionesService.getBuscarNichos(
        cicloIdNumero,
        periodoId
      );

      if (result.error || !result.data) {
        setNichos([]);
        toast.info('No se encontraron nichos para los criterios seleccionados');
        return;
      }

      const data = Array.isArray(result.data)
        ? (result.data as PrepararLecturasBuscarNichosRequest[])
        : [];

      setNichos(data);
      if (data.length === 0) {
        toast.info('No se encontraron nichos para los criterios seleccionados');
      } else {
        toast.success(`Se encontraron ${data.length} nichos`);
      }
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'Error al buscar nichos';
      toast.error(mensaje);
      setNichos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiar = (): void => {
    setPeriodoId(periodos[0]?.id ?? '');
    setCicloId('');
    setNichos([]);
    setSelectedIdsNichos([]);
    setHasSearched(false);
    toast.success('Filtros limpiados');
  };

  const toggleNicho = (idNicho: number): void => {
    setSelectedIdsNichos(prev =>
      prev.includes(idNicho)
        ? prev.filter(id => id !== idNicho)
        : [...prev, idNicho]
    );
  };

  const toggleSeleccionarTodo = (): void => {
    if (selectedIdsNichos.length === nichos.length) {
      setSelectedIdsNichos([]);
    } else {
      setSelectedIdsNichos(nichos.map(n => n.idNicho));
    }
  };

  const handleAbrirCerrar = (): void => {
    if (selectedIdsNichos.length === 0) {
      toast.info('Selecciona al menos un nicho para cerrar');
      return;
    }
    if (!cicloIdNumero || !periodoId) {
      toast.error('Faltan datos de ciclo o período');
      return;
    }
    setIsAlertOpen(true);
  };

  const handleCerrado = async (): Promise<void> => {
    setIsAlertOpen(false);
    setSelectedIdsNichos([]);
    await handleBuscar();
  };

  const renderResultados = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-medium text-sm">Buscando nichos...</p>
            <p className="text-xs text-muted-foreground">Por favor espere</p>
          </div>
        </div>
      );
    }

    if (!hasSearched) {
      return (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <Search className="w-10 h-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-sm">Realizar búsqueda de nichos</p>
            <p className="text-xs text-muted-foreground">
              Selecciona período y ciclo, luego haz clic en Buscar.
            </p>
          </div>
        </div>
      );
    }

    if (nichos.length === 0) {
      return (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold">
            Sin nichos pendientes
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400 mt-2">
            No hay nichos disponibles para el ciclo y período seleccionados.
          </AlertDescription>
        </Alert>
      );
    }

    const todosSeleccionados =
      nichos.length > 0 && selectedIdsNichos.length === nichos.length;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={todosSeleccionados}
              onCheckedChange={toggleSeleccionarTodo}
              aria-label="Seleccionar todos"
            />
            <span>
              {selectedIdsNichos.length === 0
                ? 'Selecciona los nichos a cerrar'
                : `${selectedIdsNichos.length} de ${nichos.length} nichos seleccionados`}
            </span>
          </div>
          <Button
            onClick={handleAbrirCerrar}
            disabled={selectedIdsNichos.length === 0}
            size="sm"
            className="gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
            Cerrar lecturas ({selectedIdsNichos.length})
          </Button>
        </div>

        <div className="space-y-2">
          {nichos.map(nicho => (
            <div
              key={nicho.idNicho}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                selectedIdsNichos.includes(nicho.idNicho)
                  ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                  : 'bg-card border-border hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Checkbox
                  checked={selectedIdsNichos.includes(nicho.idNicho)}
                  onCheckedChange={() => toggleNicho(nicho.idNicho)}
                  aria-label={`Seleccionar nicho ${nicho.idNicho}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {nicho.nombreNicho}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {nicho.nombreSector} · {nicho.cantidadMedidores} medidores
                  </div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                #{nicho.idNicho}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-3 space-y-4">
          <ModernHeader
            title="Cierre de Lecturas"
            description="Cerrar lecturas de medidores por ciclo y período"
          />
          <Alert variant="destructive">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Error al cargar datos</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <ModernHeader
            title="Cierre de Lecturas"
            description="Cerrar lecturas de medidores por ciclo y período"
          />
          <DialogInformacion />
        </div>

        <Card id="filtros-periodo" className="border border-border shadow-sm">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
                  <Search className="w-4 h-4 text-primary" />
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
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            <CollapsibleContent>
              <CardContent className="p-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Período
                    </Label>
                    <Select
                      value={periodoId}
                      onValueChange={setPeriodoId}
                      disabled={periodos.length === 0}
                    >
                      <SelectTrigger className="h-9 w-full bg-background border-border">
                        <SelectValue placeholder="Selecciona un período" />
                      </SelectTrigger>
                      <SelectContent>
                        {periodos.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Ciclo de Facturación
                    </Label>
                    <Select value={cicloId} onValueChange={setCicloId}>
                      <SelectTrigger className="h-9 w-full bg-background border-border">
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

                <Separator />

                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <Button
                    onClick={handleLimpiar}
                    variant="outline"
                    disabled={isLoading}
                    size="sm"
                    className="gap-2"
                  >
                    <Eraser className="h-4 w-4" />
                    Limpiar
                  </Button>
                  <Button
                    onClick={handleBuscar}
                    disabled={isLoading || !cicloIdNumero || !periodoId}
                    size="sm"
                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Search className="h-4 w-4" />
                    {isLoading ? 'Buscando...' : 'Buscar Nichos'}
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="border-b border-border p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center">
                <UsersIcon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-medium">
                  {nichos.length === 0
                    ? 'Resultados de búsqueda'
                    : `${nichos.length} nicho${nichos.length === 1 ? '' : 's'} encontrado${nichos.length === 1 ? '' : 's'}`}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedIdsNichos.length > 0
                    ? `${selectedIdsNichos.length} seleccionado${selectedIdsNichos.length === 1 ? '' : 's'}`
                    : 'Selecciona los nichos a cerrar'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">{renderResultados()}</CardContent>
        </Card>

        {isAlertOpen && cicloIdNumero > 0 && periodoId && (
          <AlertCerrarLecturas
            isOpen={isAlertOpen}
            onOpenChange={setIsAlertOpen}
            idsNichos={selectedIdsNichos}
            cicloId={cicloIdNumero}
            periodoId={periodoId}
            onSuccess={handleCerrado}
          />
        )}
      </div>
    </div>
  );
}