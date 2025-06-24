import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '~/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { useOperaciones } from '~/hooks/use-operaciones';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Eraser,
  SearchIcon,
  FileTextIcon,
  SettingsIcon,
  ChevronRight,
  RefreshCw,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '~/lib/api';
import { HierarchicalDataTable } from './hierarchical-data-table';
import { columns } from './columnsPrecalculo';
import {
  type CalculoPrefacturaDetalle,
  type CalculoPrefacturaCargoResponse,
  type CalculoPrefacturaCompleto,
  type PeriodoAbierto,
} from '~/types/operaciones';
import { Input } from '~/components/ui/input';

export default function RevisarCalculoFacturaComponent({
  periodoAbierto,
}: {
  periodoAbierto: PeriodoAbierto[];
}) {
  // Estados para el formulario
  const [cicloId, setCicloId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<CalculoPrefacturaCompleto[]>(
    [],
  );
  // Estados de UI
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLaunchingCalculo, setIsLaunchingCalculo] = useState(false);
  const [isAcceptingCalculo, setIsAcceptingCalculo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CalculoPrefacturaCompleto[]>([]);
  const [selectedContratos, setSelectedContratos] = useState<number[]>([]);

  // Estados para el timer de preparación
  const [isCalculoPreparado, setIsCalculoPreparado] = useState(false);
  const [timerCountdown, setTimerCountdown] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [preparacionTimestamp, setPreparacionTimestamp] = useState<
    number | null
  >(null);

  // Obtención de datos del hook useOperaciones
  const { fetchCiclosFacturacion, ciclosFacturacionActivos } = useOperaciones();

  // Estados de carga

  // Formateo del periodo para la API (MMAAAA)
  const periodoFormateado = useMemo(() => {
    if (periodoAbierto && periodoAbierto.length > 0) {
      const { mes, anio } = periodoAbierto[0];
      return `${mes.toString().padStart(2, '0')}${anio.toString()}`;
    }
    return '';
  }, [periodoAbierto]);

  // Timer effect para controlar el countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && timerCountdown > 0) {
      interval = setInterval(() => {
        setTimerCountdown((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            setPreparacionTimestamp(null);
            toast.warning(
              'Tiempo de espera expirado. Debe preparar el cálculo nuevamente.',
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerActive, timerCountdown]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchCiclosFacturacion();
  }, [fetchCiclosFacturacion]);

  // Filtrar datos en tiempo real
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
    } else {
      const filtered = data.filter((item) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.contratoId.toString().toLowerCase().includes(searchLower) ||
          item.nombreCliente.toLowerCase().includes(searchLower) ||
          item.rutCliente.toLowerCase().includes(searchLower) ||
          item.direccion.toLowerCase().includes(searchLower) ||
          item.comuna.toLowerCase().includes(searchLower) ||
          item.sector.toLowerCase().includes(searchLower)
        );
      });
      setFilteredData(filtered);
    }
  }, [data, searchTerm]);

  // Función para convertir el ciclo seleccionado al formato esperado por la API
  const obtenerCicloParaAPI = (cicloId: string): string => {
    // Si el ciclo es la cadena "1" o "2", lo devolvemos tal cual
    if (cicloId === '1' || cicloId === '2') {
      return cicloId;
    }

    // Si el ciclo contiene "15", devolvemos "1"
    if (cicloId.includes('15')) {
      return '1';
    }

    // Si el ciclo contiene "30", devolvemos "2"
    if (cicloId.includes('30')) {
      return '2';
    }

    // Por defecto, devolvemos el ciclo original
    console.warn(
      `No se pudo determinar el ciclo para API a partir de: ${cicloId}`,
    );
    return cicloId;
  };

  // Función para iniciar el timer de preparación
  const iniciarTimerPreparacion = () => {
    const tiempoEspera = Math.floor(Math.random() * 11) + 10; // 10-20 segundos
    setTimerCountdown(tiempoEspera);
    setTimerActive(true);
    setIsCalculoPreparado(true);
    setPreparacionTimestamp(Date.now());

    toast.success(
      `Cálculo preparado. Puede ver los resultados en ${tiempoEspera} segundos.`,
      {
        description:
          'Espere el tiempo indicado antes de hacer clic en "Ver Cálculo Facturas"',
        duration: 4000,
      },
    );
  };

  // Función para manejar la búsqueda/revisión
  const handleRevisarCalculo = async () => {
    if (!periodoFormateado) {
      toast.error('No hay un periodo abierto disponible');
      return;
    }

    if (!cicloId) {
      toast.error('Debe seleccionar un ciclo de facturación');
      return;
    }

    if (!isCalculoPreparado) {
      toast.error(
        'Debe preparar el cálculo primero antes de ver los resultados',
      );
      return;
    }

    if (timerActive && timerCountdown > 0) {
      toast.error(
        `Debe esperar ${timerCountdown} segundos antes de ver los resultados`,
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Convertir el cicloId al formato esperado por la API
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);

      // Construir parámetros para la API
      const requestParams: Record<string, string> = {
        cicloId: cicloParaAPI,
        periodo: periodoFormateado,
      };

      // Petición 1: Obtener encabezados
      const encabezadoResponse = await api.get(
        '/calculo-prefactura-encabezado',
        {
          params: requestParams,
        },
      );

      // Los encabezados vienen directamente como array
      const encabezados = encabezadoResponse.data as CalculoPrefacturaDetalle[];

      if (!Array.isArray(encabezados)) {
        throw new Error('La respuesta de encabezados no es un array válido');
      }

      if (encabezados.length === 0) {
        setData([]);
        toast.info(
          'No se encontraron prefacturas para el ciclo y periodo elegidos',
        );
        return;
      }

      const cargosResponse = await api.get('/calculo-prefactura-cargos', {
        params: {
          cicloId: cicloParaAPI,
          periodo: periodoFormateado,
        },
      });

      const cargosData =
        cargosResponse.data as CalculoPrefacturaCargoResponse[];

      if (!Array.isArray(cargosData)) {
        throw new Error('La respuesta de cargos no es un array válido');
      }

      // Combinar encabezados con cargos
      const datosCombinados: CalculoPrefacturaCompleto[] = encabezados.map(
        (encabezado) => {
          // Buscar los cargos correspondientes a este contrato
          const cargosContrato = cargosData.find(
            (cargo) => cargo.contratoId === encabezado.contratoId,
          );

          // Calcular el total facturado sumando todos los subtotales de los cargos
          const totalFacturado =
            cargosContrato?.cargos.reduce(
              (suma, cargo) => suma + cargo.subtotal,
              0,
            ) || 0;

          return {
            ...encabezado,
            cargos: cargosContrato?.cargos || [],
            totalFacturado,
          };
        },
      );

      setData(datosCombinados);
      toast.success(
        `Se encontraron ${datosCombinados.length} registros con sus respectivos cargos`,
      );
    } catch (error: any) {
      console.error('Error al revisar cálculo de factura:', error);

      // Manejo específico para error 404
      if (error.response && error.response.status === 404) {
        setError(
          'No se han encontrado prefacturas para el ciclo y periodo elegidos',
        );
        setData([]);
        toast.error(
          'No se han encontrado prefacturas para el ciclo y periodo elegidos',
          {
            description: 'Verifique que el ciclo y periodo sean correctos',
            duration: 5000,
          },
        );
      } else {
        setError(`Error: ${error.message || 'Error desconocido'}`);

        if (error.response) {
          toast.error(
            `Error ${error.response.status}: ${
              error.response.data?.mensaje || 'Error en la consulta'
            }`,
          );
        } else if (error.request) {
          toast.error('No se recibió respuesta del servidor');
        } else {
          toast.error(`Error: ${error.message}`);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanzarCalculoFacturas = async () => {
    if (!periodoFormateado) {
      toast.error('No hay un periodo abierto disponible');
      return;
    }

    if (!cicloId) {
      toast.error('Debe seleccionar un ciclo de facturación');
      return;
    }

    try {
      setIsLaunchingCalculo(true);
      const cicloParaAPI = obtenerCicloParaAPI(cicloId);
      const cicloInt = parseInt(cicloParaAPI);

      // Enviamos los datos como números en el body, no como params
      const requestBody = {
        cicloFacturacion: cicloInt,
        periodoFacturable: periodoFormateado,
      };

      const res = await api.post('lanzar-calculo-facturacion', requestBody);

      // Iniciar el timer después de preparar el cálculo
      iniciarTimerPreparacion();

      return res;
    } catch (error: any) {
      console.error('Error al lanzar cálculo de facturación:', error);

      if (error.response) {
        toast.error(
          `Error ${error.response.status}: ${
            error.response.data?.mensaje || 'Error al lanzar el cálculo'
          }`,
        );
      } else if (error.request) {
        toast.error('No se recibió respuesta del servidor');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLaunchingCalculo(false);
    }
  };

  const handleAceptarCalculo = async () => {
    if (!periodoFormateado) {
      toast.error('No hay un periodo abierto disponible');
      return;
    }

    if (selectedContratos.length === 0) {
      toast.error('Debe seleccionar al menos un contrato para aceptar');
      return;
    }

    try {
      setIsAcceptingCalculo(true);
      setError(null);

      // Procesar cada lecturaId individualmente
      let successCount = 0;
      let errorCount = 0;

      for (const lecturaId of selectedContratos) {
        try {
          const requestBody = {
            lecturaId: lecturaId,
            periodoId: periodoFormateado,
          };

          await api.post('generar-detalle-factura', requestBody);
          successCount++;
        } catch (error) {
          console.error(`Error procesando lecturaId ${lecturaId}:`, error);
          errorCount++;
        }
      }

      // Mostrar resultado final
      if (successCount > 0) {
        toast.success(
          `Se aceptaron ${successCount} cálculos correctamente${
            errorCount > 0 ? ` (${errorCount} con errores)` : ''
          }. Recuerde revisar la aplicación de facturación para realizar los cobros`,
          {
            description: 'Los cálculos aceptados se están procesando',
            duration: 4000,
          },
        );
      }

      if (errorCount > 0 && successCount === 0) {
        toast.error(`Error al procesar ${errorCount} cálculos`);
      }

      // Limpiar selecciones después de procesar
      setSelectedContratos([]);
    } catch (error: any) {
      console.error('Error general al aceptar cálculo de facturación:', error);
      setError(`Error: ${error.message || 'Error desconocido'}`);
      toast.error('Error al procesar los cálculos seleccionados');
    } finally {
      setIsAcceptingCalculo(false);
    }
  };

  // Función para actualizar los datos
  const handleRefreshData = async () => {
    if (!cicloId) {
      toast.error('Selecciona un ciclo antes de actualizar');
      return;
    }

    if (!isCalculoPreparado) {
      toast.error('Debe preparar el cálculo primero');
      return;
    }

    toast.info('Actualizando datos...');
    await handleRevisarCalculo();
  };

  // Función para limpiar filtros
  const handleClearFilters = () => {
    setCicloId('');
    setSearchTerm('');
    setError(null);
    setData([]);
    setFilteredData([]);
    setIsCalculoPreparado(false);
    setTimerActive(false);
    setTimerCountdown(0);
    setPreparacionTimestamp(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Encabezado con título, descripción e información */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-50">
            Revisar Cálculo Factura
          </h1>
          <p className="text-muted-foreground">
            Revisa y verifica los cálculos de facturación para los clientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          {periodoAbierto && periodoAbierto.length > 0 && (
            <Badge
              variant="outline"
              className="bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800"
            >
              Periodo: {periodoAbierto[0].mes.toString().padStart(2, '0')}/
              {periodoAbierto[0].anio}
            </Badge>
          )}
        </div>
      </div>
      {/* Indicador de estado del timer */}
      {timerActive && (
        <Card className="shadow-sm border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                    Cálculo en preparación
                  </h4>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Espere {timerCountdown} segundos antes de ver los resultados
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {timerCountdown}s
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  Tiempo restante
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Indicador de cálculo preparado */}
      {isCalculoPreparado && !timerActive && (
        <Card className="shadow-sm border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800 dark:text-emerald-200">
                  Cálculo preparado
                </h4>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Ya puede hacer clic en "Ver Cálculo Facturas" para ver los
                  resultados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Sección principal con filtros */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible
          open={isFiltersOpen}
          onOpenChange={setIsFiltersOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                  <SearchIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Listado de Precalculos
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Revisa los precalculos de facturación
                  </CardDescription>
                </div>
              </div>
              {isFiltersOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {' '}
                {/* Periodo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    Periodo actual
                  </Label>
                  {periodoAbierto && periodoAbierto.length > 0 ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 shadow-sm">
                      <div className="p-1.5 bg-sky-100 dark:bg-sky-800/50 rounded-md">
                        <CalendarIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <span className="font-semibold text-sky-800 dark:text-sky-200">
                          {periodoAbierto[0].mes.toString().padStart(2, '0')}/
                          {periodoAbierto[0].anio}
                        </span>
                        <p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
                          Periodo activo para facturación
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 shadow-sm">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-800/50 rounded-md">
                        <AlertCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <span className="font-medium text-amber-800 dark:text-amber-200">
                          No hay periodo abierto
                        </span>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          Contacta al administrador
                        </p>
                      </div>
                    </div>
                  )}
                </div>{' '}
                {/* Ciclo de facturación */}
                <div className="space-y-2">
                  <Label
                    htmlFor="ciclo"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <FileTextIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    Ciclo de facturación
                  </Label>

                  <Select value={cicloId} onValueChange={setCicloId}>
                    <SelectTrigger
                      id="ciclo"
                      className="w-full h-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                    >
                      <SelectValue placeholder="Selecciona un ciclo de facturación" />
                    </SelectTrigger>
                    <SelectContent className="border-border/60">
                      {ciclosFacturacionActivos &&
                      ciclosFacturacionActivos.length > 0 ? (
                        ciclosFacturacionActivos.map((ciclo) => {
                          // Determinar el valor correcto para el API (1 o 2)
                          let valorCiclo = '1';
                          if (
                            ciclo.diaFacturacion === '30' ||
                            ciclo.descripcion.includes('30')
                          ) {
                            valorCiclo = '2';
                          }

                          return (
                            <SelectItem
                              key={ciclo.diaFacturacion}
                              value={valorCiclo}
                              className="hover:bg-sky-50 dark:hover:bg-sky-900/20 focus:bg-sky-50 dark:focus:bg-sky-900/20"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                                <span className="font-medium">
                                  {ciclo.descripcion}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })
                      ) : (
                        <>
                          <SelectItem
                            value="1"
                            className="hover:bg-sky-50 dark:hover:bg-sky-900/20"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                              <span className="font-medium">Ciclo día 15</span>
                            </div>
                          </SelectItem>
                          <SelectItem
                            value="2"
                            className="hover:bg-sky-50 dark:hover:bg-sky-900/20"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                              <span className="font-medium">Ciclo día 30</span>
                            </div>
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>{' '}
              {/* Botones de acción */}
              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border/40 mt-4">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  disabled={isLoading}
                  className="gap-2 hover:bg-muted/50"
                >
                  <Eraser className="h-4 w-4" />
                  Limpiar
                </Button>
                <Button
                  onClick={handleRefreshData}
                  variant="outline"
                  disabled={
                    isLoading || !cicloId || !isCalculoPreparado || timerActive
                  }
                  className="gap-2 hover:bg-muted/50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Actualizar
                </Button>
                <Button
                  onClick={handleLanzarCalculoFacturas}
                  disabled={isLoading || !cicloId || timerActive}
                  className="gap-2 bg-sky-600 hover:bg-sky-700 text-white"
                >
                  {isLaunchingCalculo ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Preparando...
                    </>
                  ) : (
                    <>
                      <SearchIcon className="h-4 w-4" />
                      Preparar Cálculo
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleRevisarCalculo}
                  disabled={
                    isLaunchingCalculo ||
                    !cicloId ||
                    !isCalculoPreparado ||
                    timerActive
                  }
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <FileTextIcon className="h-4 w-4" />
                      Ver Cálculo Facturas
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleAceptarCalculo}
                  disabled={
                    isAcceptingCalculo || selectedContratos.length === 0
                  }
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                >
                  {isAcceptingCalculo ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Aceptando...
                    </>
                  ) : (
                    <>
                      <SettingsIcon className="h-4 w-4" />
                      Aceptar Cálculo ({selectedContratos.length})
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>{' '}
      {/* Resultados de la búsqueda */}
      <Card className="shadow-sm border border-border/60">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
              <FileTextIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                Resultados de la búsqueda
              </CardTitle>
              <CardDescription className="text-sm">
                Listado de contratos y sus cálculos de facturación
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-sm">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-sky-200 dark:border-sky-800"></div>
                  <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-sky-600 border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                  <p className="text-sky-700 dark:text-sky-300 font-medium">
                    Cargando resultados...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Por favor espere mientras procesamos su consulta
                  </p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 rounded-lg bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg shadow-sm">
                  <AlertCircleIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-rose-800 dark:text-rose-200">
                    {error.includes('No se han encontrado prefacturas')
                      ? 'No se encontraron prefacturas'
                      : 'Error al cargar los datos'}
                  </h4>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                    {error.includes('No se han encontrado prefacturas')
                      ? 'No se han encontrado prefacturas para el ciclo y periodo elegidos. Verifique que el ciclo y periodo sean correctos.'
                      : 'Los datos no han sido cargados completamente. Recuerde que debe hacer clic en Preparar Cálculo Factura y luego en Ver Cálculo Facturas'}
                  </p>

                  <Button
                    onClick={() => setError(null)}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-rose-200 hover:bg-rose-50 dark:border-rose-700 dark:hover:bg-rose-900/20"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-4 text-muted-foreground">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <SearchIcon className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Realizar consulta de precálculos
                </p>
                <p className="text-sm mt-1">
                  Selecciona un ciclo y haz clic en "Preparar Cálculo" para ver
                  los resultados
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estadísticas resumidas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-lg border border-sky-200 dark:border-sky-800">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sky-700 dark:text-sky-300">
                    {filteredData.length}
                  </div>
                  <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                    {searchTerm ? 'Contratos Filtrados' : 'Total Contratos'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {filteredData.reduce(
                      (sum, item) => sum + (item.cargos?.length || 0),
                      0,
                    )}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Total Cargos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                    {new Intl.NumberFormat('es-CL', {
                      style: 'currency',
                      currency: 'CLP',
                      minimumFractionDigits: 0,
                    }).format(
                      filteredData.reduce(
                        (sum, item) => sum + (item.totalFacturado || 0),
                        0,
                      ),
                    )}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    Total Facturado
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {filteredData
                      .reduce(
                        (sum, item) => sum + (item.consumoPeriodo || 0),
                        0,
                      )
                      .toLocaleString('es-CL')}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    Total Consumo m³
                  </div>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="🔍 Buscar por contrato, nombre, RUT, dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {filteredData.length} de {data.length}
                  </div>
                )}
              </div>

              {/* Mostrar lecturaId seleccionados */}
              {selectedContratos.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-800/50 rounded-md">
                      <FileTextIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-200">
                      Contratos Seleccionados ({selectedContratos.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedContratos.map((lecturaId) => (
                      <Badge
                        key={lecturaId}
                        variant="outline"
                        className="bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700"
                      >
                        Lectura ID: {lecturaId}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    💡 Estos son los IDs de lectura que has seleccionado en la
                    tabla
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                    <FileTextIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                    {filteredData.length} registros{' '}
                    {searchTerm
                      ? `encontrados de ${data.length} total`
                      : 'encontrados'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>💡 Haz clic en</span>
                    <ChevronRight className="h-3 w-3" />
                    <span>para ver el detalle de cargos</span>
                  </div>
                </div>
              </div>

              <HierarchicalDataTable
                columns={columns}
                data={filteredData}
                onSelectionChange={(selectedContratos) => {
                  setSelectedContratos(
                    selectedContratos.map((contrato) => contrato.lecturaId),
                  );
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
