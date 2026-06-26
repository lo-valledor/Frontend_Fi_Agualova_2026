import {
  AlertCircleIcon,
  ChevronDown,
  FileTextIcon,
  Loader2,
  SearchIcon
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { reportesService } from '~/services/reportesService';
import type {
  EmpalmesDisponibles,
  PeriodosDisponibles,
  ResumenNotadeCobro
} from '~/types/reportes';

interface NotaDeCobroComponentProps {
  periodos: PeriodosDisponibles[];
  empalmes: EmpalmesDisponibles[];
  error: string | null;
}

const emptyResumen: ResumenNotadeCobro = {
  totalNotasCobroEmitidas: '0',
  detalle: []
};

type ResumenNotadeCobroResponse =
  | ResumenNotadeCobro
  | ResumenNotadeCobro[]
  | null;

const formatNumber = (value: string | number) => {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat('es-CL').format(numericValue);
};

const normalizeResumenResponse = (
  data: ResumenNotadeCobroResponse
): ResumenNotadeCobro => {
  if (!data) {
    return emptyResumen;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return emptyResumen;
    }

    return {
      totalNotasCobroEmitidas: data[0]?.totalNotasCobroEmitidas ?? '0',
      detalle: data[0]?.detalle ?? []
    };
  }

  return {
    totalNotasCobroEmitidas: data.totalNotasCobroEmitidas ?? '0',
    detalle: data.detalle ?? []
  };
};

export default function NotaDeCobroComponent({
  periodos,
  empalmes,
  error
}: Readonly<NotaDeCobroComponentProps>) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [selectedEmpalme, setSelectedEmpalme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(error);
  const [resumen, setResumen] = useState<ResumenNotadeCobro>(emptyResumen);

  const selectedPeriodoLabel = useMemo(
    () =>
      periodos.find(periodo => periodo.id === selectedPeriodo)?.descripcion ??
      'Sin período seleccionado',
    [periodos, selectedPeriodo]
  );

  const selectedEmpalmeLabel = useMemo(
    () =>
      empalmes.find(empalme => empalme.id === selectedEmpalme)?.descripcion ??
      'Sin empalme seleccionado',
    [empalmes, selectedEmpalme]
  );

  const totalNotasEmitidas = useMemo(() => {
    return resumen.totalNotasCobroEmitidas;
  }, [resumen]);

  const detalle = useMemo(() => resumen.detalle, [resumen]);

  const handleConsultar = async () => {
    if (!selectedPeriodo || !selectedEmpalme) {
      toast.error('Debes seleccionar un período y un empalme.');
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await reportesService.getGenerarNotaCobro(
        selectedPeriodo,
        Number(selectedEmpalme)
      );

      if (response.error) {
        setResumen(emptyResumen);
        setFetchError(response.error);
        toast.error('No fue posible generar la nota de cobro.');
        return;
      }

      const normalizedResumen = normalizeResumenResponse(response.data);
      setResumen(normalizedResumen);

      if (normalizedResumen.detalle.length === 0) {
        toast.info(
          'No se encontraron registros para los criterios seleccionados.'
        );
        return;
      }

      toast.success('Nota de cobro generada correctamente.');
    } catch (serviceError) {
      const errorMessage =
        serviceError instanceof Error
          ? serviceError.message
          : 'Error desconocido al consultar la nota de cobro';

      setResumen(emptyResumen);
      setFetchError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiar = () => {
    setSelectedPeriodo('');
    setSelectedEmpalme('');
    setResumen(emptyResumen);
    setFetchError(error);
    toast.success('Filtros reiniciados.');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-6 p-4 sm:p-6">
        <ModernHeader
          title="Nota de Cobro"
          description="Consulta y revisión del resumen de notas de cobro por período y empalme"
        />

        <div className="grid grid-cols-2 gap-4">
          <Card className="overflow-hidden border border-border bg-card shadow-sm">
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <div className="flex cursor-pointer items-center justify-between border-b border-border px-4 py-3 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-accent text-accent-foreground">
                      <SearchIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">
                        Criterios de búsqueda
                      </CardTitle>
                      <CardDescription>
                        Selecciona período y empalme para generar el resumen
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      isFiltersOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-4 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="periodo">Período</Label>
                      <Select
                        value={selectedPeriodo}
                        onValueChange={setSelectedPeriodo}
                      >
                        <SelectTrigger
                          id="periodo"
                          className="bg-background w-full"
                        >
                          <SelectValue placeholder="Selecciona un período" />
                        </SelectTrigger>
                        <SelectContent>
                          {periodos.map(periodo => (
                            <SelectItem key={periodo.id} value={periodo.id}>
                              {periodo.descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="empalme">Empalme</Label>
                      <Select
                        value={selectedEmpalme}
                        onValueChange={setSelectedEmpalme}
                      >
                        <SelectTrigger
                          id="empalme"
                          className="bg-background w-full"
                        >
                          <SelectValue placeholder="Selecciona un empalme" />
                        </SelectTrigger>
                        <SelectContent>
                          {empalmes.map(empalme => (
                            <SelectItem key={empalme.id} value={empalme.id}>
                              {empalme.descripcion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleConsultar} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Consultando...
                        </>
                      ) : (
                        <>
                          <SearchIcon className="mr-2 h-4 w-4" />
                          Consultar
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleLimpiar}>
                      Limpiar
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          <div className="grid gap-4">
            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
                    <FileTextIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de notas emitidas
                    </p>
                    <p className="text-2xl font-semibold">
                      {formatNumber(totalNotasEmitidas)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 pt-2 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Período
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {selectedPeriodoLabel}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Empalme
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {selectedEmpalmeLabel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {fetchError ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircleIcon className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-destructive">
                  Error al consultar nota de cobro
                </p>
                <p className="text-sm text-muted-foreground">{fetchError}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <CardTitle className="text-base">Detalle de cargos</CardTitle>
            <CardDescription>
              Comparación entre período anterior y actual para cada cargo
            </CardDescription>
          </div>

          <CardContent className="p-0">
            {detalle.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                No hay datos para mostrar todavía.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="px-4 py-3">Cargo</TableHead>
                      <TableHead className="px-4 py-3">M3 Anterior</TableHead>
                      <TableHead className="px-4 py-3">
                        Notas Anterior
                      </TableHead>
                      <TableHead className="px-4 py-3">
                        Cargos Anterior
                      </TableHead>
                      <TableHead className="px-4 py-3">M3 Actual</TableHead>
                      <TableHead className="px-4 py-3">Notas Actual</TableHead>
                      <TableHead className="px-4 py-3">Cargos Actual</TableHead>
                      <TableHead className="px-4 py-3">Diferencia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalle.map(item => (
                      <TableRow
                        key={`${item.cargoDescripcion}-${item.cantNotaCobroPeriodoActual}`}
                      >
                        <TableCell className="px-4 py-3 font-medium">
                          {item.cargoDescripcion}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatNumber(item.cantidadM3PeriodoAnterior)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatNumber(item.cantNotaCobroPeriodoAnterior)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatNumber(item.totalCargosPeriodoAnterior)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatNumber(item.cantidadM3PeriodoActual)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatNumber(item.cantNotaCobroPeriodoActual)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatNumber(item.totalCargosPeriodoActual)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {formatNumber(item.diferenciaRecuperacion)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
