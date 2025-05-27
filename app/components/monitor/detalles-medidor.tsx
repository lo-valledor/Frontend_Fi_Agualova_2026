import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { format } from "date-fns";
import {
  AlertCircle,
  Info,
  Zap,
  Gauge,
  History,
  Key,
  BarChart3,
  Table2,
  PlugIcon,
  IdCard,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { toast } from "sonner";
import { ScrollArea } from "~/components/ui/scroll-area";
import type {
  EtapaUno,
  EtapaDos,
  EtapaTres,
  EtapaCuatro,
} from "~/types/monitor";
import {
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  BarChart,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "~/components/ui/chart";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { chartConfig } from "~/components/chart-config";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import DetalleLecturaBT43 from "./monitor-lecturas/detalle-lectura-bt43";
import api from "~/lib/api";

export default function DetallesMedidor({
  lecturaId,
  onSuccess,
}: {
  lecturaId: number;
  onSuccess?: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [etapaErrors, setEtapaErrors] = useState<Record<number, string>>({});
  const [etapa1Data, setEtapa1Data] = useState<EtapaUno[]>([]);
  const [, setEtapa2Data] = useState<EtapaDos[]>([]);
  const [etapa3Data, setEtapa3Data] = useState<EtapaTres[]>([]);
  const [etapa4Data, setEtapa4Data] = useState<EtapaCuatro[]>([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<
    "todo" | "6meses" | "3meses"
  >("todo");

  const fetchAllEtapas = async () => {
    setIsLoading(true);
    setError(null);
    setEtapaErrors({});

    try {
      // Crear un array de promesas para todas las etapas
      const etapas = [1, 2, 3, 4];
      const results = await Promise.allSettled(
        etapas.map((etapa) => {
          const params = new URLSearchParams({
            idLec: lecturaId.toString(),
            etapa: etapa.toString(),
          });
          return api.get("/datos-basicos-medidor", { params });
        })
      );

      // Procesar los resultados de cada etapa
      const newEtapaErrors: Record<number, string> = {};

      results.forEach((result, index) => {
        const etapa = index + 1;

        if (result.status === "fulfilled") {
          // La etapa se completó correctamente
          switch (etapa) {
            case 1:
              setEtapa1Data(result.value.data as EtapaUno[]);
              break;
            case 2:
              setEtapa2Data(result.value.data as EtapaDos[]);
              break;
            case 3:
              setEtapa3Data(result.value.data as EtapaTres[]);
              break;
            case 4:
              setEtapa4Data(result.value.data as EtapaCuatro[]);
              console.log(result.value.data);
              break;
          }
        } else {
          // La etapa falló
          console.warn(`Error en etapa ${etapa}:`, result.reason);

          // Si es un error 404, establecer un mensaje específico
          if (result.reason?.response?.status === 404) {
            newEtapaErrors[etapa] =
              result.reason.response.data ||
              `No hay datos disponibles para la etapa ${etapa}`;
          } else {
            newEtapaErrors[
              etapa
            ] = `Error al cargar datos de la etapa ${etapa}`;
          }

          // Inicializar con array vacío para evitar errores
          switch (etapa) {
            case 1:
              setEtapa1Data([]);
              break;
            case 2:
              setEtapa2Data([]);
              break;
            case 3:
              setEtapa3Data([]);
              break;
            case 4:
              setEtapa4Data([]);
              break;
          }
        }
      });

      setEtapaErrors(newEtapaErrors);

      // Si todas las etapas fallaron, establecer un error general
      if (Object.keys(newEtapaErrors).length === 4) {
        toast.error("No se pudieron cargar los datos del medidor");
        setError("No se pudieron cargar los datos del medidor");
      }
    } catch (error) {
      console.error("Error general al obtener datos:", error);
      toast.error("Error al obtener los datos del medidor");
      setError("Error al obtener los datos del medidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAceptarLectura = async () => {
    try {
      const response = await api.post("/aceptar-lectura-medidor", {
        idLectura: lecturaId,
      });
      if (response.status === 200) {
        toast.success("Lectura aceptada correctamente");
        fetchAllEtapas();
        // Llamar al callback onSuccess si existe
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error("Error al aceptar la lectura");
      }
    } catch (error) {
      console.error("Error al aceptar la lectura:", error);
      toast.error("Error al aceptar la lectura");
    }
  };

  const handleCopiarUltimaLectura = async () => {
    try {
      const response = await api.post("/copiar-ultima-lectura", {
        idLectura: lecturaId,
      });
      if (response.status === 200) {
        toast.success("Lectura copiada correctamente");
        fetchAllEtapas();
        // Llamar al callback onSuccess si existe
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error("Error al copiar la última lectura");
      }
    } catch (error) {
      console.error("Error al copiar la última lectura:", error);
      toast.error("Error al copiar la última lectura");
    }
  };

  useEffect(() => {
    if (lecturaId) {
      fetchAllEtapas();
    }
  }, [lecturaId]);

  // Función para obtener el número de mes de un periodo (MMAAAA)
  const getMonthNumber = (periodo: string): number => {
    return parseInt(periodo.substring(0, 2), 10);
  };

  // Función para obtener el año de un periodo (MMAAAA)
  const getYear = (periodo: string): number => {
    return parseInt(periodo.substring(2), 10);
  };

  // Función para obtener el nombre del mes basado en su número
  const getMonthName = (monthNumber: number): string => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[monthNumber - 1];
  };

  // Función para filtrar datos según el período seleccionado
  const getDatosFiltrados = (data: EtapaCuatro[]) => {
    if (periodoSeleccionado === "todo") {
      return data;
    }

    // Ordenar los datos por fecha de más reciente a más antiguo
    const datosOrdenados = [...data].sort((a, b) => {
      const fechaA = new Date(
        getYear(a.LM_Periodo),
        getMonthNumber(a.LM_Periodo) - 1,
        1
      );
      const fechaB = new Date(
        getYear(b.LM_Periodo),
        getMonthNumber(b.LM_Periodo) - 1,
        1
      );
      return fechaB.getTime() - fechaA.getTime();
    });

    // Tomar los primeros N meses según el período seleccionado
    const mesesAMostrar = periodoSeleccionado === "6meses" ? 6 : 3;
    return datosOrdenados.slice(0, mesesAMostrar);
  };

  // Función para obtener datos para la comparativa mensual
  const getMensualComparisonData = (data: EtapaCuatro[]) => {
    // Filtrar datos según el período seleccionado
    const datosFiltrados = getDatosFiltrados(data);

    // Agrupar datos por mes
    const groupedByMonth = datosFiltrados.reduce((acc, item) => {
      const month = getMonthNumber(item.LM_Periodo);
      const year = getYear(item.LM_Periodo);
      const monthName = getMonthName(month);

      if (!acc[monthName]) {
        acc[monthName] = {};
      }

      acc[monthName][year] = item.LM_ConsumoPeriodo;
      return acc;
    }, {} as Record<string, Record<number, number>>);

    // Convertir a formato para el gráfico
    const yearsInData = [
      ...new Set(data.map((item) => getYear(item.LM_Periodo))),
    ].sort((a, b) => b - a);
    const currentYear = yearsInData[0]; // Año más reciente
    const previousYear = yearsInData[1]; // Año anterior

    return Object.entries(groupedByMonth).map(([month, yearData]) => ({
      mes: month,
      consumoActual: yearData[currentYear] || null,
      consumoAnterior: yearData[previousYear] || null,
    }));
  };

  // Función para generar datos de la tabla comparativa
  const getMensualComparisonTable = (data: EtapaCuatro[]) => {
    const comparisonData = getMensualComparisonData(data);

    return comparisonData.map((item) => {
      const diferencia =
        item.consumoActual !== null && item.consumoAnterior !== null
          ? item.consumoActual - item.consumoAnterior
          : null;

      const variacionPorcentaje =
        item.consumoActual !== null &&
        item.consumoAnterior !== null &&
        item.consumoAnterior !== 0
          ? ((item.consumoActual - item.consumoAnterior) /
              item.consumoAnterior) *
            100
          : null;

      return {
        ...item,
        diferencia,
        variacionPorcentaje,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 dark:border-slate-400 mx-auto mb-2"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Cargando datos del medidor...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ScrollArea className="overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* Sección Medidor */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-lg dark:shadow-slate-900/10">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Gauge className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              Información del Medidor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {etapaErrors[1] ? (
              <Alert variant="destructive" className="mb-3">
                <Info className="h-4 w-4" />
                <AlertDescription>{etapaErrors[1]}</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-900 dark:text-slate-100 text-sm font-medium flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-slate-700 dark:text-slate-400" />
                    Medidor
                  </Label>
                  <Input
                    type="text"
                    className="bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 font-medium text-slate-900 dark:text-slate-100 text-sm"
                    value={etapa1Data[0]?.ME_NSerie || ""}
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-900 dark:text-slate-100 text-sm font-medium flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                    Tipo
                  </Label>
                  <Input
                    type="text"
                    className="bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 font-medium text-slate-900 dark:text-slate-100 text-sm"
                    value={etapa1Data[0]?.TM_Descripcion || ""}
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-900 dark:text-slate-100 text-sm font-medium flex items-center gap-2">
                    <Key className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                    Tarifa
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      className="bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 font-medium text-slate-900 dark:text-slate-100 text-sm"
                      readOnly
                      value={etapa1Data[0]?.TF_Codigo || ""}
                    />
                    {etapa1Data &&
                      etapa1Data.length > 0 &&
                      etapa1Data[0].TF_Codigo === "BT-4.3" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="default" size="sm">
                              Ver Detalle
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="min-w-[950px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                <div className="flex items-center gap-2">
                                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-slate-600 dark:from-slate-400 dark:to-slate-300 bg-clip-text text-transparent">
                                    Detalle Lectura BT-4.3
                                  </h1>
                                  <Badge
                                    variant="outline"
                                    className="bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 font-medium ml-2"
                                  >
                                    ID: {lecturaId}
                                  </Badge>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-screen overflow-y-auto">
                              <DetalleLecturaBT43
                                lecturaId={lecturaId}
                                etapa1={etapa1Data}
                              />
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-900 dark:text-slate-100 text-sm font-medium flex items-center gap-2">
                    <Gauge className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                    Constante
                  </Label>
                  <Input
                    type="text"
                    className="bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 font-medium text-slate-900 dark:text-slate-100 text-sm"
                    value={etapa1Data[0]?.ME_ConstanteMultiplicar || ""}
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-900 dark:text-slate-100 text-sm font-medium flex items-center gap-2">
                    <PlugIcon className="h-4 w-4 text-slate-700 dark:text-slate-400" />
                    Subempalme
                  </Label>
                  <Input
                    type="text"
                    className="bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 font-medium text-slate-900 dark:text-slate-100 text-sm"
                    value={etapa1Data[0]?.SE_Codigo || ""}
                    readOnly
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección Lecturas Anteriores */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <span className="font-semibold">Lecturas Anteriores</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {etapaErrors[4] ? (
              <Alert variant="destructive" className="mb-3">
                <Info className="h-4 w-4" />
                <AlertDescription>{etapaErrors[4]}</AlertDescription>
              </Alert>
            ) : (
              <Tabs defaultValue="grafica" className="w-full">
                <TabsList className="mb-6 w-full justify-start gap-4 border-b border-slate-200 dark:border-slate-800 p-0">
                  <TabsTrigger
                    value="grafica"
                    className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none pb-3 pt-1"
                  >
                    <BarChart3 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                    Gráfica
                  </TabsTrigger>
                  <TabsTrigger
                    value="tabla"
                    className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none pb-3 pt-1"
                  >
                    <Table2 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                    Tabla
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="grafica">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Histórico de Consumos
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Evolución del consumo a lo largo del tiempo
                          </p>
                        </div>
                        <div className="w-full sm:w-auto">
                          <Tabs
                            defaultValue="todo"
                            value={periodoSeleccionado}
                            onValueChange={(value) =>
                              setPeriodoSeleccionado(
                                value as "todo" | "6meses" | "3meses"
                              )
                            }
                            className="w-full"
                          >
                            <TabsList className="grid grid-cols-3 w-full">
                              <TabsTrigger value="todo">Todo</TabsTrigger>
                              <TabsTrigger value="6meses">6 Meses</TabsTrigger>
                              <TabsTrigger value="3meses">3 Meses</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </div>
                    </div>
                    <ChartContainer
                      config={chartConfig}
                      className="min-h-[300px] w-full p-4 rounded-lg"
                    >
                      <BarChart
                        data={[...getDatosFiltrados(etapa4Data)].reverse()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          className="stroke-slate-100 dark:stroke-slate-800/50"
                        />
                        <XAxis
                          dataKey="LM_Periodo"
                          tickLine={false}
                          tickMargin={12}
                          axisLine={false}
                          tick={{
                            fill: "var(--color-detallesMedidor)",
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{
                            fill: "var(--color-detallesMedidor)",
                            fontSize: 12,
                          }}
                        />
                        <Tooltip
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value) => `Periodo: ${value}`}
                            />
                          }
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          wrapperStyle={{ paddingBottom: "10px" }}
                        />
                        <Bar
                          name="Consumo"
                          dataKey="LM_ConsumoPeriodo"
                          fill="var(--color-detallesMedidor)"
                          radius={[4, 4, 0, 0]}
                          barSize={30}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </TabsContent>
                <TabsContent value="tabla">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Histórico de Lecturas
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Detalle de lecturas y consumos
                          </p>
                        </div>
                        <div className="w-full sm:w-auto">
                          <Tabs
                            defaultValue="todo"
                            value={periodoSeleccionado}
                            onValueChange={(value) =>
                              setPeriodoSeleccionado(
                                value as "todo" | "6meses" | "3meses"
                              )
                            }
                            className="w-full"
                          >
                            <TabsList className="grid grid-cols-3 w-full">
                              <TabsTrigger value="todo">Todo</TabsTrigger>
                              <TabsTrigger value="6meses">6 Meses</TabsTrigger>
                              <TabsTrigger value="3meses">3 Meses</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                          <TableHead className="font-semibold text-slate-900 dark:text-slate-200">
                            Periodo
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-slate-200">
                            Fecha Lectura
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-slate-200 text-right">
                            Lectura Actual
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-slate-200 text-right">
                            Consumo
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getDatosFiltrados(etapa4Data).map((item, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                              {item.LM_Periodo}
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                              {new Date(
                                item.LM_FechaLectura
                              ).toLocaleDateString("es-CL", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-900 dark:text-slate-200">
                              {item.LM_ValorLecturaActual?.toLocaleString(
                                "es-CL"
                              ) || ""}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="inline-flex items-center gap-1 font-medium text-slate-900 dark:text-slate-200">
                                {item.LM_ConsumoPeriodo?.toLocaleString(
                                  "es-CL"
                                ) || "0"}
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  kWh
                                </span>
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Comparativas de consumo */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
              <span className="font-semibold">Comparativas de Consumo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Comparativa Mensual
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Comparación de consumos por mes entre años
                    </p>
                  </div>
                </div>
              </div>
              {etapa4Data.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                  No hay datos disponibles para la comparativa
                </div>
              ) : (
                <div className="space-y-6 p-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-4">
                    <p className="text-slate-700 dark:text-slate-300 text-sm">
                      Esta comparativa muestra el consumo del mismo mes en
                      diferentes años. Solo se muestran los meses que tienen
                      datos disponibles en ambos años.
                    </p>
                  </div>

                  {getMensualComparisonData(etapa4Data).filter(
                    (item) =>
                      item.consumoActual !== null &&
                      item.consumoAnterior !== null
                  ).length === 0 ? (
                    <div className="p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg">
                      No hay lectura ingresada en el mes actual de comparación
                    </div>
                  ) : (
                    <>
                      <div className="mt-2">
                        <ChartContainer
                          config={chartConfig}
                          className="min-h-[300px] w-full p-4 rounded-lg"
                        >
                          <BarChart
                            data={getMensualComparisonData(etapa4Data).filter(
                              (item) =>
                                item.consumoActual !== null &&
                                item.consumoAnterior !== null
                            )}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 20,
                              bottom: 50,
                            }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              className="stroke-slate-100 dark:stroke-slate-800/50"
                            />
                            <XAxis
                              dataKey="mes"
                              tickLine={false}
                              tickMargin={12}
                              axisLine={false}
                              tick={{
                                fill: "var(--color-detallesMedidor)",
                                fontSize: 12,
                              }}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tick={{
                                fill: "var(--color-detallesMedidor)",
                                fontSize: 12,
                              }}
                            />
                            <Tooltip
                              content={
                                <ChartTooltipContent
                                  labelFormatter={(value) => `Mes: ${value}`}
                                />
                              }
                            />
                            <Legend
                              verticalAlign="top"
                              height={36}
                              wrapperStyle={{ paddingBottom: "10px" }}
                            />
                            <Bar
                              name="Año Actual"
                              dataKey="consumoActual"
                              fill="#3b82f6"
                              radius={[4, 4, 0, 0]}
                              barSize={100}
                            />
                            <Bar
                              name="Año Anterior"
                              dataKey="consumoAnterior"
                              fill="#f97316"
                              radius={[4, 4, 0, 0]}
                              barSize={100}
                            />
                          </BarChart>
                        </ChartContainer>
                      </div>

                      <div className="rounded-lg border border-slate-200 dark:border-slate-800">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                              <TableHead className="font-semibold text-slate-900 dark:text-slate-200">
                                Mes
                              </TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-slate-200 text-right">
                                Consumo Año Actual
                              </TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-slate-200 text-right">
                                Consumo Año Anterior
                              </TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-slate-200 text-right">
                                Diferencia
                              </TableHead>
                              <TableHead className="font-semibold text-slate-900 dark:text-slate-200 text-right">
                                Variación %
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getMensualComparisonTable(etapa4Data)
                              .filter((item) => item.diferencia !== null)
                              .map((item, index) => (
                                <TableRow
                                  key={index}
                                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                  <TableCell className="font-medium text-slate-900 dark:text-slate-200">
                                    {item.mes}
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                                    {item.consumoActual?.toLocaleString(
                                      "es-CL"
                                    )}
                                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                      kWh
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-orange-600 dark:text-orange-400">
                                    {item.consumoAnterior?.toLocaleString(
                                      "es-CL"
                                    )}
                                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                      kWh
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    <span
                                      className={`${
                                        item.diferencia != null &&
                                        item.diferencia > 0
                                          ? "text-red-600 dark:text-red-400"
                                          : item.diferencia != null &&
                                            item.diferencia < 0
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-slate-600 dark:text-slate-400"
                                      }`}
                                    >
                                      {(item.diferencia != null &&
                                      item.diferencia > 0
                                        ? "+"
                                        : "") +
                                        item.diferencia?.toLocaleString(
                                          "es-CL"
                                        )}
                                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                                        kWh
                                      </span>
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    <span
                                      className={`${
                                        item.variacionPorcentaje != null &&
                                        item.variacionPorcentaje > 0
                                          ? "text-red-600 dark:text-red-400"
                                          : item.variacionPorcentaje != null &&
                                            item.variacionPorcentaje < 0
                                          ? "text-green-600 dark:text-green-400"
                                          : "text-slate-600 dark:text-slate-400"
                                      }`}
                                    >
                                      {(item.variacionPorcentaje != null &&
                                      item.variacionPorcentaje > 0
                                        ? "+"
                                        : "") +
                                        item.variacionPorcentaje?.toFixed(2) +
                                        "%"}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección Claves */}
        <Card className="border-slate-100 dark:border-slate-800 shadow-lg dark:shadow-slate-900/10">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <Key className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              Claves
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {etapaErrors[3] ? (
              <Alert variant="destructive" className="mb-3">
                <Info className="h-4 w-4" />
                <AlertDescription>{etapaErrors[3]}</AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/30">
                      <TableHead className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                        Código
                      </TableHead>
                      <TableHead className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                        Descripción
                      </TableHead>
                      {/*  <TableHead className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                        Tipo
                      </TableHead> */}
                      <TableHead className="text-slate-900 dark:text-slate-100 text-sm font-medium">
                        Fecha
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {etapa3Data.length > 0 ? (
                      etapa3Data.map((item, index) => (
                        <TableRow
                          key={index}
                          className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20"
                        >
                          <TableCell className="font-mono text-slate-900 dark:text-slate-100 text-sm">
                            {item.CLA_Codigo}
                          </TableCell>
                          <TableCell className="text-slate-800 dark:text-slate-200 text-sm">
                            {item.CLA_Descripcion}
                          </TableCell>
                          {/* <TableCell className="text-slate-800 dark:text-slate-200 text-sm">
                            {item.CLA_Tipo}
                          </TableCell> */}
                          <TableCell className="text-slate-800 dark:text-slate-200 text-sm">
                            {format(
                              new Date(item.CLL_Fecha),
                              "dd-MM-yyyy HH:mm:ss"
                            ) || ""}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-slate-500 dark:text-slate-400 py-4 text-sm"
                        >
                          No hay datos disponibles
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <History className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                Resolver lectura con clave para lectura crítica
              </div>
              <div className="flex gap-2 items-center justify-end">
                <Button
                  variant="destructive"
                  onClick={handleAceptarLectura}
                  className="min-w-[150px] bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                  disabled={
                    etapa3Data.length > 0 && etapa3Data[0].CLA_Codigo === "LEOK"
                  }
                >
                  Aceptar Lectura con Clave Crítica
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

{
  /*  */
}
