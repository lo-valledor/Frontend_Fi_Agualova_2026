import {
  AlertCircleIcon,
  ChevronDown,
  Loader2,
  SearchIcon
} from 'lucide-react';
import { animate, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

const isNegativeValue = (value: string) => {
  const normalized = value.replace(/\./g, '').replace(/,/g, '.');
  const numericValue = Number(normalized.replace(/[^\d.-]/g, ''));

  return !Number.isNaN(numericValue) && numericValue < 0;
};

const renderCellValue = (value: string) => {
  if (value === undefined || value === null || value.trim() === '') {
    return <span className="text-muted-foreground">—</span>;
  }

  return value;
};

const parseFormattedValue = (
  value: string
): { numericValue: number; prefix: string } => {
  const trimmed = value.trim();
  const prefix = trimmed.startsWith('$') ? '$' : '';
  const withoutPrefix = prefix ? trimmed.slice(1) : trimmed;
  const normalized = withoutPrefix.replace(/\./g, '').replace(/,/g, '.');
  const numericValue = Number(normalized);

  return {
    numericValue: Number.isNaN(numericValue) ? 0 : numericValue,
    prefix
  };
};

const formatAnimatedValue = (value: number, prefix: string) => {
  const formatted = Math.round(value).toLocaleString('es-CL');
  return prefix ? `${prefix}${formatted}` : formatted;
};

const AnimatedNumber = ({
  value,
  className
}: Readonly<{
  value: string;
  className?: string;
}>) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (!value.trim()) {
      setDisplay(value);
      return;
    }

    const { numericValue, prefix } = parseFormattedValue(value);
    const controls = animate(0, numericValue, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: latest => {
        setDisplay(formatAnimatedValue(latest, prefix));
      }
    });

    return () => controls.stop();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
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

        <div className="grid gap-4">
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

        {detalle.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border bg-card">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Notas de cobro emitidas
                </p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  <AnimatedNumber value={String(totalNotasEmitidas)} />
                </p>
              </CardContent>
            </Card>
          </div>
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
                      <TableHead rowSpan={2} className="px-4 py-3 align-bottom">
                        Cargo
                      </TableHead>
                      <TableHead
                        colSpan={3}
                        className="px-4 py-3 text-center border-b border-border"
                      >
                        Período anterior
                      </TableHead>
                      <TableHead
                        colSpan={3}
                        className="px-4 py-3 text-center border-b border-border"
                      >
                        Período actual
                      </TableHead>
                      <TableHead
                        rowSpan={2}
                        className="px-4 py-3 text-right align-bottom"
                      >
                        Diferencia
                      </TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="px-4 py-3 text-right">M3</TableHead>
                      <TableHead className="px-4 py-3 text-right">
                        Notas
                      </TableHead>
                      <TableHead className="px-4 py-3 text-right">
                        Cargos
                      </TableHead>
                      <TableHead className="px-4 py-3 text-right">M3</TableHead>
                      <TableHead className="px-4 py-3 text-right">
                        Notas
                      </TableHead>
                      <TableHead className="px-4 py-3 text-right">
                        Cargos
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detalle.map((item, index) => {
                      const isTotalRow =
                        item.cargoDescripcion.trim().toUpperCase() ===
                        'TOTALES';

                      return (
                        <motion.tr
                          key={`${item.cargoDescripcion}-${index}`}
                          className={`border-b transition-colors ${
                            isTotalRow
                              ? 'bg-muted/50 font-semibold'
                              : 'hover:bg-muted/30'
                          }`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.25,
                            delay: index * 0.05,
                            ease: [0.25, 0.1, 0.25, 1]
                          }}
                        >
                          <TableCell className="px-4 py-3 font-medium">
                            {item.cargoDescripcion}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right tabular-nums">
                            {item.cantidadM3PeriodoAnterior.trim() ? (
                              <AnimatedNumber
                                value={item.cantidadM3PeriodoAnterior}
                              />
                            ) : (
                              renderCellValue(item.cantidadM3PeriodoAnterior)
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right tabular-nums">
                            {item.cantNotaCobroPeriodoAnterior.trim() ? (
                              <AnimatedNumber
                                value={item.cantNotaCobroPeriodoAnterior}
                              />
                            ) : (
                              renderCellValue(item.cantNotaCobroPeriodoAnterior)
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right tabular-nums">
                            {item.totalCargosPeriodoAnterior.trim() ? (
                              <AnimatedNumber
                                value={item.totalCargosPeriodoAnterior}
                              />
                            ) : (
                              renderCellValue(item.totalCargosPeriodoAnterior)
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right tabular-nums">
                            {item.cantidadM3PeriodoActual.trim() ? (
                              <AnimatedNumber
                                value={item.cantidadM3PeriodoActual}
                              />
                            ) : (
                              renderCellValue(item.cantidadM3PeriodoActual)
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right tabular-nums">
                            {item.cantNotaCobroPeriodoActual.trim() ? (
                              <AnimatedNumber
                                value={item.cantNotaCobroPeriodoActual}
                              />
                            ) : (
                              renderCellValue(item.cantNotaCobroPeriodoActual)
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right tabular-nums">
                            {item.totalCargosPeriodoActual.trim() ? (
                              <AnimatedNumber
                                value={item.totalCargosPeriodoActual}
                              />
                            ) : (
                              renderCellValue(item.totalCargosPeriodoActual)
                            )}
                          </TableCell>
                          <TableCell
                            className={`px-4 py-3 text-right tabular-nums font-medium ${
                              isNegativeValue(item.diferenciaRecuperacion)
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}
                          >
                            {item.diferenciaRecuperacion.trim() ? (
                              <AnimatedNumber
                                value={item.diferenciaRecuperacion}
                              />
                            ) : (
                              renderCellValue(item.diferenciaRecuperacion)
                            )}
                          </TableCell>
                        </motion.tr>
                      );
                    })}
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
