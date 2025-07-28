import { EyeIcon, InfoIcon, Loader2 } from 'lucide-react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

import React, { useEffect, useMemo, useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import api from '~/lib/api';
import type { DetallepreciosCargoEnerlova } from '~/types/operaciones';

import DialogNuevoValorEnerlova from './dialog-nuevo-valor-enerlova';

// Modificamos la configuración del gráfico para usar un color personalizado
const chartConfig = {
  desktop: {
    label: 'Valor',
    // Cambiamos el color a un tono de azul más vibrante
    color: 'hsl(210, 100%, 50%)', // Puedes usar cualquier color CSS válido aquí
  },
} satisfies ChartConfig;

// Función auxiliar para normalizar valores numéricos
const normalizarValor = (valor: string | number | undefined): number => {
  if (valor === undefined || valor === null) return 0;

  if (typeof valor === 'number') return valor;

  // Si es string, intentamos convertirlo a número
  if (typeof valor === 'string') {
    // Reemplazamos coma por punto para manejar formatos como "1,234.56" o "1.234,56"
    const valorNormalizado = valor.replace(',', '.');
    const numero = parseFloat(valorNormalizado);
    return isNaN(numero) ? 0 : numero;
  }

  return 0;
};

// Función para formatear valores numéricos para mostrar
const formatearValor = (valor: number | string): string => {
  const numero = normalizarValor(valor);
  // Formateamos con 2 decimales y separador de miles
  return numero.toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Tipos para los filtros de tiempo
type PeriodoTiempo = 'todo' | '1año' | '6meses' | '3meses';

export default function DetallePreciosEnerlova({ codigo }: { codigo: number }) {
  const [data, setData] = useState<DetallepreciosCargoEnerlova[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] =
    useState<PeriodoTiempo>('todo');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/modificar/${codigo}`);

      // Normalizamos los datos al recibirlos
      const datosNormalizados = (
        response.data as DetallepreciosCargoEnerlova[]
      ).map(item => ({
        ...item,
        // Aseguramos que valor sea un número para operaciones
        valorNumerico: normalizarValor(item.valor),
      }));

      setData(datosNormalizados);
    } catch (error) {
      console.error('Error al obtener datos:', error);
      toast.error('Error al cargar los precios del cargo');
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, codigo]);

  // Obtenemos el ultimo valor del cargo
  const ultimoValor = data && data.length > 0 ? data[data.length - 1] : null;

  /**
   * Calcula la fecha siguiente a la fecha dada y la devuelve en formato DD-MM-YYYY.
   * Asume que la fecha de entrada está en formato DD-MM-YYYY.
   * @param ultimaFechaFin - La última fecha de fin en formato DD-MM-YYYY (ej: "31-01-2025").
   * @returns La fecha siguiente en formato DD-MM-YYYY (ej: "01-02-2025") o una cadena vacía si hay error.
   */
  const obtenerNuevaFechaInicio = (
    ultimaFechaFin: string | undefined
  ): string => {
    if (!ultimaFechaFin) {
      return '';
    }

    // 1. Parsear de DD-MM-YYYY a partes [day, month, year]
    const dateParts = ultimaFechaFin.split('-');
    if (
      dateParts.length !== 3 ||
      dateParts[0].length !== 2 ||
      dateParts[1].length !== 2 ||
      dateParts[2].length !== 4
    ) {
      console.error(
        'Formato de fecha de entrada inesperado:',
        ultimaFechaFin,
        'Se esperaba DD-MM-YYYY.'
      );
      return '';
    }
    const day = dateParts[0];
    const month = dateParts[1];
    const year = dateParts[2];

    // 2. Construir formato YYYY-MM-DD para new Date() (más fiable)
    //    Usamos UTC ('Z') para evitar problemas de zona horaria al sumar días.
    const fechaFormatoISO = `${year}-${month}-${day}`;

    try {
      // 3. Crear objeto Date en UTC
      const fechaFinDate = new Date(fechaFormatoISO + 'T00:00:00Z');

      if (isNaN(fechaFinDate.getTime())) {
        console.error('Error: Invalid Date al crear objeto Date.');
        return '';
      }

      // 4. Sumar un día usando métodos UTC
      fechaFinDate.setUTCDate(fechaFinDate.getUTCDate() + 1);

      // 5. Extraer componentes de la nueva fecha (UTC)
      const finalDay = fechaFinDate.getUTCDate();
      const finalMonth = fechaFinDate.getUTCMonth() + 1; // getUTCMonth es 0-indexed (0-11)
      const finalYear = fechaFinDate.getUTCFullYear();

      // 6. Formatear a DD-MM-YYYY con padding (ceros a la izquierda)
      const paddedDay = String(finalDay).padStart(2, '0');
      const paddedMonth = String(finalMonth).padStart(2, '0');

      const nuevaFechaInicioStringDDMMYYYY = `${paddedDay}-${paddedMonth}-${finalYear}`;

      return nuevaFechaInicioStringDDMMYYYY;
    } catch (error) {
      console.error('Error al procesar la fecha:', error);
      return '';
    }
  };

  const nuevaFechaInicio = obtenerNuevaFechaInicio(ultimoValor?.fecha_fin);

  // Función para convertir formato DD-MM-YYYY a Date (para filtrado)
  const parsearFechaInicioADate = (
    fechaInicio: string | undefined
  ): Date | null => {
    if (!fechaInicio) return null;

    const partes = fechaInicio.split('-');
    if (partes.length !== 3) return null;

    // Formato para new Date(): YYYY-MM-DD
    const fechaISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
    const fecha = new Date(fechaISO);

    return isNaN(fecha.getTime()) ? null : fecha;
  };

  // Filtrar datos según el período seleccionado
  const datosFiltrados = useMemo(() => {
    if (!data.length || periodoSeleccionado === 'todo') {
      return data;
    }

    const hoy = new Date();
    const fechaLimite = new Date();

    // Establecer la fecha límite según el período
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

    // Filtrar los datos que estén dentro del rango
    return data.filter(item => {
      const fechaItem = parsearFechaInicioADate(item.fecha_inicio);
      return fechaItem && fechaItem >= fechaLimite;
    });
  }, [data, periodoSeleccionado]);

  // Preparamos los datos para el gráfico asegurándonos que valor sea numérico
  const datosGrafico = useMemo(() => {
    return datosFiltrados.map(item => ({
      ...item,
      // Aseguramos que valor sea un número para el gráfico
      valor: normalizarValor(item.valor),
    }));
  }, [datosFiltrados]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='gap-1.5 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-800/40'
        >
          <EyeIcon className='h-3.5 w-3.5' />
          Ver Detalle
        </Button>
      </SheetTrigger>
      <SheetContent className='sm:max-w-[800px] p-0'>
        <SheetHeader className='px-6 py-4 border-b border-border/60 bg-muted/40'>
          <SheetTitle className='text-lg font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-2'>
            <InfoIcon className='h-5 w-5 text-sky-600 dark:text-sky-400' />
            Detalle de Precios de Cargo
          </SheetTitle>
        </SheetHeader>

        <div className='px-6 py-4'>
          <ScrollArea className='h-[calc(100vh-200px)] pr-4 -mr-4'>
            {isLoading ? (
              <div className='flex justify-center items-center h-60'>
                <Loader2 className='h-8 w-8 animate-spin text-sky-600 dark:text-sky-400' />
              </div>
            ) : data && data.length > 0 ? (
              <div className='space-y-6'>
                <Card>
                  <CardHeader className='pb-2'>
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2'>
                      <div>
                        <CardTitle className='text-lg text-sky-800 dark:text-sky-200'>
                          Histórico de Precios
                        </CardTitle>
                        <CardDescription>
                          Evolución de precios del cargo a lo largo del tiempo
                        </CardDescription>
                      </div>
                      <div className='w-full sm:w-auto'>
                        <Tabs
                          defaultValue='todo'
                          value={periodoSeleccionado}
                          onValueChange={value =>
                            setPeriodoSeleccionado(value as PeriodoTiempo)
                          }
                          className='w-full'
                        >
                          <TabsList className='grid grid-cols-4 w-full'>
                            <TabsTrigger value='todo'>Todo</TabsTrigger>
                            <TabsTrigger value='1año'>1 Año</TabsTrigger>
                            <TabsTrigger value='6meses'>6 Meses</TabsTrigger>
                            <TabsTrigger value='3meses'>3 Meses</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='h-auto'>
                    {/* Información del último valor */}
                    <div className='mb-4 p-3 bg-muted/30 rounded-md border border-border/40'>
                      <div className='flex flex-col sm:flex-row sm:justify-between gap-2'>
                        <div>
                          <p className='text-xs text-muted-foreground'>
                            Cargo actual
                          </p>
                          <p className='font-medium'>
                            {ultimoValor?.descripcion}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>
                            Último valor
                          </p>
                          <p className='font-semibold text-lg text-sky-700 dark:text-sky-300'>
                            {formatearValor(ultimoValor?.valor || 0)}
                          </p>
                        </div>
                      </div>
                      <div className='flex flex-col sm:flex-row sm:justify-between gap-2 mt-2'>
                        <div>
                          <p className='text-xs text-muted-foreground'>
                            Vigencia desde
                          </p>
                          <p className='font-mono text-sm'>
                            {ultimoValor?.fecha_inicio}
                          </p>
                        </div>
                        <div>
                          <p className='text-xs text-muted-foreground'>
                            Vigencia hasta
                          </p>
                          <p className='font-mono text-sm'>
                            {ultimoValor?.fecha_fin}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Gráfico */}
                    <div className='h-[400px]'>
                      {datosGrafico.length > 0 ? (
                        <ChartContainer config={chartConfig}>
                          <LineChart
                            accessibilityLayer
                            data={datosGrafico}
                            margin={{
                              top: 10,
                              right: 10,
                              left: 10,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid
                              vertical={false}
                              strokeDasharray='3 3'
                              stroke='var(--border)'
                            />
                            <XAxis
                              dataKey='fecha_inicio'
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{ fontSize: 12 }}
                              tickFormatter={value => {
                                // Simplificar la fecha para el eje X (solo mostrar mes-año)
                                const partes = value.split('-');
                                if (partes.length === 3) {
                                  return `${partes[1]}/${partes[2].substring(
                                    2
                                  )}`;
                                }
                                return value;
                              }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{ fontSize: 12 }}
                              tickFormatter={value =>
                                value.toLocaleString('es-CL')
                              }
                            />
                            <ChartTooltip
                              cursor={{
                                stroke: 'var(--border)',
                                strokeWidth: 1,
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
                              dataKey='valor'
                              type='monotone' // Cambiado a monotone para una curva más suave
                              stroke='var(--color-desktop)' // Usa el color de la configuración
                              strokeWidth={2.5}
                              dot={{
                                fill: 'var(--color-desktop)',
                                r: 4,
                                strokeWidth: 0,
                              }}
                              activeDot={{
                                r: 6,
                                fill: 'var(--color-desktop)',
                                stroke: 'var(--background)',
                                strokeWidth: 2,
                              }}
                            />
                          </LineChart>
                        </ChartContainer>
                      ) : (
                        <div className='flex items-center justify-center h-full text-muted-foreground'>
                          No hay datos disponibles para el período seleccionado
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className='text-center py-12 text-muted-foreground'>
                No hay datos disponibles para este cargo
              </div>
            )}
          </ScrollArea>
        </div>

        <div className='flex gap-2 justify-end px-6 py-4 border-t border-border/60 bg-muted/20'>
          <div className=''>
            {nuevaFechaInicio && ultimoValor && (
              <DialogNuevoValorEnerlova
                codigo={codigo.toString()}
                descripcion={data[0]?.descripcion || ''}
                fecha_inicio={nuevaFechaInicio}
                fecha_fin={''}
                valor={normalizarValor(ultimoValor.valor)}
                onSuccess={() => {
                  fetchData();
                }}
                id={ultimoValor.id.toString() || ''}
              />
            )}
          </div>
          <Button
            variant='ghost'
            onClick={() => setIsOpen(false)}
            className='text-muted-foreground hover:text-muted-foreground hover:bg-muted'
          >
            Cerrar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
