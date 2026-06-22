import { EyeIcon, InfoIcon, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '~/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import api from '~/lib/api';

import DialogNuevoValorAgualova from './dialog-nuevo-valor-enerlova';

interface DetallePreciosCargoAgualova {
  id: number;
  codigo: number;
  descripcion: string;
  valor: string;
  fecha_inicio: string;
  fecha_fin: string;
}

type PeriodoTiempo = 'todo' | '1año' | '6meses' | '3meses';

const chartConfig = {
  desktop: {
    label: 'Valor',
    color: 'hsl(210, 100%, 50%)'
  }
} satisfies ChartConfig;

const normalizarValor = (valor: string | number | undefined): number => {
  if (valor === undefined || valor === null) return 0;
  if (typeof valor === 'number') return valor;
  if (typeof valor === 'string') {
    if (valor.includes('.') && valor.includes(',')) {
      const limpio = valor.replace(/\./g, '').replace(',', '.');
      const numero = parseFloat(limpio);
      return Number.isNaN(numero) ? 0 : numero;
    }
    if (valor.includes(',') && !valor.includes('.')) {
      const numero = parseFloat(valor.replace(',', '.'));
      return Number.isNaN(numero) ? 0 : numero;
    }
    const puntoIndex = valor.indexOf('.');
    if (puntoIndex > 0 && valor.length - puntoIndex - 1 === 3) {
      const limpio = valor.replace(/\./g, '');
      const numero = parseFloat(limpio);
      return Number.isNaN(numero) ? 0 : numero;
    }
    const numero = parseFloat(valor);
    return Number.isNaN(numero) ? 0 : numero;
  }
  return 0;
};

const formatearValor = (valor: number | string): string =>
  normalizarValor(valor).toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const obtenerNuevaFechaInicio = (
  ultimaFechaFin: string | undefined
): string => {
  if (!ultimaFechaFin) return '';

  const partes = ultimaFechaFin.split('-');
  if (
    partes.length !== 3 ||
    partes[0].length !== 2 ||
    partes[1].length !== 2 ||
    partes[2].length !== 4
  ) {
    return '';
  }
  const [day, month, year] = partes;

  try {
    const fechaFinDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    if (Number.isNaN(fechaFinDate.getTime())) return '';

    fechaFinDate.setUTCDate(fechaFinDate.getUTCDate() + 1);

    const paddedDay = String(fechaFinDate.getUTCDate()).padStart(2, '0');
    const paddedMonth = String(fechaFinDate.getUTCMonth() + 1).padStart(2, '0');

    return `${paddedDay}-${paddedMonth}-${fechaFinDate.getUTCFullYear()}`;
  } catch {
    return '';
  }
};

const parsearFechaInicioADate = (fechaInicio: string): Date | null => {
  const partes = fechaInicio.split('-');
  if (partes.length !== 3) return null;
  const fecha = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
};

interface DetallePreciosAgualovaProps {
  codigo: number;
  onDataUpdate?: () => void;
}

export default function DetallePreciosAgualova({
  codigo,
  onDataUpdate
}: Readonly<DetallePreciosAgualovaProps>) {
  const [data, setData] = useState<DetallePreciosCargoAgualova[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] =
    useState<PeriodoTiempo>('todo');

  const fetchData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.get<DetallePreciosCargoAgualova[]>(
        `/modificar/${codigo}`
      );
      const payload = response.data;
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as { data?: unknown })?.data)
          ? ((payload as { data: DetallePreciosCargoAgualova[] }).data ?? [])
          : [];
      setData(list);
    } catch (error) {
      toast.error('Error al cargar los precios del cargo', {
        description: String(error)
      });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, codigo]);

  const ultimoValor = data.length > 0 ? data[data.length - 1] : null;
  const nuevaFechaInicio = obtenerNuevaFechaInicio(ultimoValor?.fecha_fin);

  const datosFiltrados = useMemo(() => {
    if (!data.length || periodoSeleccionado === 'todo') {
      return data;
    }

    const hoy = new Date();
    const fechaLimite = new Date();

    switch (periodoSeleccionado) {
      case '1año':
        fechaLimite.setFullYear(hoy.getFullYear() - 1);
        break;
      case '6meses':
        fechaLimite.setMonth(hoy.getMonth() - 6);
        break;
      case '3meses':
        fechaLimite.setMonth(hoy.getMonth() - 3);
        break;
    }

    return data.filter(item => {
      const fechaItem = parsearFechaInicioADate(item.fecha_inicio);
      return fechaItem && fechaItem >= fechaLimite;
    });
  }, [data, periodoSeleccionado]);

  const datosGrafico = useMemo(
    () =>
      datosFiltrados.map(item => ({
        ...item,
        valor: normalizarValor(item.valor)
      })),
    [datosFiltrados]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 sm:gap-1.5 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-800/40 text-xs sm:text-sm px-2 sm:px-3"
        >
          <EyeIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden sm:inline">Ver Detalle</span>
          <span className="sm:hidden">Ver</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[900px] lg:max-w-[1100px] h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-border/60 bg-muted/30">
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <InfoIcon className="h-5 w-5" />
            Detalle de Precios de Cargo
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-60 sm:h-96">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              </div>
            ) : data.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-muted/30 rounded-xl p-4 sm:p-5 border border-border/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Cargo
                      </p>
                      <p className="font-semibold text-sm sm:text-base truncate">
                        {ultimoValor?.descripcion}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Valor Actual
                      </p>
                      <p className="font-bold text-lg text-sky-700 dark:text-sky-300">
                        ${formatearValor(ultimoValor?.valor ?? 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Vigencia Desde
                      </p>
                      <p className="font-mono text-sm">
                        {ultimoValor?.fecha_inicio}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Vigencia Hasta
                      </p>
                      <p className="font-mono text-sm">
                        {ultimoValor?.fecha_fin}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg text-sky-800 dark:text-sky-200">
                          Histórico de Precios
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Evolución de precios del cargo a lo largo del tiempo
                        </CardDescription>
                      </div>
                      <Tabs
                        defaultValue="todo"
                        value={periodoSeleccionado}
                        onValueChange={value =>
                          setPeriodoSeleccionado(value as PeriodoTiempo)
                        }
                        className="w-full sm:w-auto"
                      >
                        <TabsList className="grid grid-cols-4 w-full sm:w-auto h-9">
                          <TabsTrigger value="todo" className="text-xs px-3">
                            Todo
                          </TabsTrigger>
                          <TabsTrigger value="1año" className="text-xs px-3">
                            1 Año
                          </TabsTrigger>
                          <TabsTrigger
                            value="6meses"
                            className="text-xs px-2.5"
                          >
                            6M
                          </TabsTrigger>
                          <TabsTrigger
                            value="3meses"
                            className="text-xs px-2.5"
                          >
                            3M
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-4">
                    <div className="h-[300px] sm:h-[450px]">
                      {datosGrafico.length > 0 ? (
                        <ChartContainer config={chartConfig}>
                          <LineChart
                            accessibilityLayer
                            data={datosGrafico}
                            margin={{
                              top: 10,
                              right: 10,
                              left: 0,
                              bottom: 20
                            }}
                          >
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 3"
                              stroke="var(--border)"
                            />
                            <XAxis
                              dataKey="fecha_inicio"
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{ fontSize: 11 }}
                              tickFormatter={value => {
                                const partes = value.split('-');
                                if (partes.length === 3) {
                                  return `${partes[1]}/${partes[2].substring(2)}`;
                                }
                                return value;
                              }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{ fontSize: 11 }}
                              tickFormatter={value =>
                                value.toLocaleString('es-CL')
                              }
                            />
                            <ChartTooltip
                              cursor={{
                                stroke: 'var(--border)',
                                strokeWidth: 1
                              }}
                              content={
                                <ChartTooltipContent
                                  hideLabel
                                  formatter={value =>
                                    formatearValor(Number(value))
                                  }
                                />
                              }
                            />
                            <Line
                              dataKey="valor"
                              type="monotone"
                              stroke="var(--color-desktop)"
                              strokeWidth={3}
                              dot={{
                                fill: 'var(--color-desktop)',
                                r: 5,
                                strokeWidth: 0
                              }}
                              activeDot={{
                                r: 7,
                                fill: 'var(--color-desktop)',
                                stroke: 'var(--background)',
                                strokeWidth: 3
                              }}
                            />
                          </LineChart>
                        </ChartContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center px-4">
                          No hay datos disponibles para el período seleccionado
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                No hay datos disponibles para este cargo
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 justify-between px-4 sm:px-6 py-4 border-t border-border/60 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            size="default"
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
          {nuevaFechaInicio && ultimoValor && (
            <DialogNuevoValorAgualova
              codigo={codigo.toString()}
              descripcion={data[0]?.descripcion ?? ''}
              fecha_inicio={nuevaFechaInicio}
              fecha_fin=""
              valor={normalizarValor(ultimoValor.valor)}
              onSuccess={() => {
                fetchData();
                onDataUpdate?.();
              }}
              id={ultimoValor.id.toString()}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
