import { Checkbox } from '~/components/ui/checkbox';
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
  TableHead,
} from '~/components/ui/table';
import {
  type ConsultarSectores,
  type TablaAsignacionSectoresProps,
  type ConsultarAsignacionSectores,
} from '~/types/operaciones';
import {
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PlayIcon,
  ServerIcon,
  HashIcon,
  FileTextIcon,
  UsersIcon,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Badge } from '~/components/ui/badge';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { Button } from '~/components/ui/button';
import api from '~/lib/api';
import { toast } from 'sonner';

interface TablaAsignacionSectoresWithDescriptionProps
  extends TablaAsignacionSectoresProps {
  sectores: ConsultarSectores[];
  periodo?: string;
  cicloFacturable?: string;
  onRecargarDatos?: () => Promise<void>;
}

// Interfaz para el objeto de solicitud
interface PrepararLecturasRequest {
  nichoId: number;
  cantLecturas: number;
  cicloFact: string;
  periodo: string;
}

// Interfaz para gestionar los items seleccionados
interface NichoSeleccionado {
  nichoId: number;
  sectorId: number;
  cantidad: number;
  descripcion: string;
}

export default function TablaAsignacionSectores({
  data,
  isLoading,
  sectores = [],
  periodo = '',
  cicloFacturable = '',
  onRecargarDatos,
}: TablaAsignacionSectoresWithDescriptionProps) {
  // Estados
  const [selectedNichos, setSelectedNichos] = useState<NichoSeleccionado[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResults, setSubmitResults] = useState<{
    success: number;
    errors: number;
    messages: string[];
  }>({ success: 0, errors: 0, messages: [] });

  // Función para manejar la selección de un nicho
  const handleSelectNicho = (item: ConsultarAsignacionSectores) => {
    setSelectedNichos((prev) => {
      const existingIndex = prev.findIndex(
        (nicho) => nicho.nichoId === item.nichoId,
      );

      if (existingIndex >= 0) {
        return prev.filter((nicho) => nicho.nichoId !== item.nichoId);
      } else {
        return [
          ...prev,
          {
            nichoId: item.nichoId,
            sectorId: item.sectorId,
            cantidad: item.cantidadMedidores,
            descripcion: item.descripcionNicho,
          },
        ];
      }
    });
  };

  // Función para verificar si un nicho está seleccionado
  const isNichoSelected = (nichoId: number): boolean => {
    return selectedNichos.some((nicho) => nicho.nichoId === nichoId);
  };

  // Función para seleccionar o deseleccionar todos
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNichos([]);
    } else {
      const allNichos = data.map((item) => ({
        nichoId: item.nichoId,
        sectorId: item.sectorId,
        cantidad: item.cantidadMedidores,
        descripcion: item.descripcionNicho,
      }));
      setSelectedNichos(allNichos);
    }
    setSelectAll(!selectAll);
  };

  // Función para preparar lecturas de los nichos seleccionados
  const prepararLecturas = async () => {
    if (selectedNichos.length === 0) {
      toast.error('Debe seleccionar al menos un nicho');
      return;
    }

    if (!periodo || !cicloFacturable) {
      toast.error('Faltan datos de periodo o ciclo');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitResults({ success: 0, errors: 0, messages: [] });

      const results = {
        success: 0,
        errors: 0,
        messages: [] as string[],
      };

      for (const nicho of selectedNichos) {
        const requestData: PrepararLecturasRequest = {
          nichoId: nicho.nichoId,
          cantLecturas: nicho.cantidad,
          cicloFact: cicloFacturable,
          periodo: periodo,
        };

        try {
          const response = await api.post(
            '/generar-proceso-lecturas',
            requestData,
          );

          if (response.status >= 200 && response.status < 300) {
            results.success++;
            results.messages.push(
              `Nicho ${nicho.nichoId} (${nicho.descripcion}) procesado correctamente`,
            );
          } else {
            results.errors++;
            let errorMessage = 'Sin detalles';
            if (response.data && typeof response.data === 'object') {
              errorMessage =
                (response.data as any).mensaje ||
                'Sin detalles en la respuesta';
            }
            results.messages.push(
              `Error al procesar nicho ${nicho.nichoId}: ${errorMessage}`,
            );
          }
        } catch (error: any) {
          results.errors++;
          let errorMessage = 'Error desconocido';

          if (error.response && typeof error.response === 'object') {
            if (
              error.response.data &&
              typeof error.response.data === 'object'
            ) {
              errorMessage =
                (error.response.data as any).mensaje ||
                error.message ||
                'Error en la respuesta';
            } else {
              errorMessage = error.message || 'Error en la solicitud';
            }
          } else {
            errorMessage = error.message || 'Error al procesar la solicitud';
          }

          results.messages.push(
            `Error al procesar nicho ${nicho.nichoId}: ${errorMessage}`,
          );
        }
      }

      setSubmitResults(results);

      if (results.errors === 0) {
        toast.success(`${results.success} nichos procesados correctamente`);
      } else if (results.success === 0) {
        toast.error(
          `No se pudo procesar ningún nicho. ${results.errors} errores.`,
        );
      } else {
        toast.warning(
          `${results.success} nichos procesados. ${results.errors} con errores.`,
        );
      }

      if (results.errors === 0) {
        setSelectedNichos([]);
        setSelectAll(false);
      }

      if (onRecargarDatos) {
        await onRecargarDatos();
      }
    } catch (error: any) {
      toast.error(
        `Error al preparar lecturas: ${error.message || 'Error desconocido'}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Crear un mapa de sectores para búsqueda rápida por ID
  const sectoresMap = useMemo(() => {
    const map = new Map<number, ConsultarSectores>();
    sectores.forEach((sector) => {
      map.set(sector.secId, sector);
    });
    return map;
  }, [sectores]);

  // Función para obtener la descripción del sector
  const getSectorDescripcion = (sectorId: number): string => {
    const sector = sectoresMap.get(sectorId);
    return sector ? sector.secDescripcion : `Sector ${sectorId}`;
  };

  return (
    <div className="space-y-4">
      {/* Contador de selección y botón de acción */}
      {selectedNichos.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-emerald-800 dark:text-emerald-200">
                {selectedNichos.length} nichos seleccionados
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Listos para preparar lecturas
              </p>
            </div>
          </div>
          <Button
            onClick={prepararLecturas}
            disabled={
              isSubmitting ||
              selectedNichos.length === 0 ||
              !periodo ||
              !cicloFacturable
            }
            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            {isSubmitting ? 'Procesando...' : 'Preparar Lecturas'}
          </Button>
        </div>
      )}

      {/* Resultados del envío */}
      {submitResults.messages.length > 0 && (
        <div
          className={`rounded-xl p-4 border ${
            submitResults.errors === 0
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
              : submitResults.success === 0
                ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
                : 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="flex gap-3 items-start mb-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                submitResults.errors === 0
                  ? 'bg-green-100 dark:bg-green-800/50'
                  : submitResults.success === 0
                    ? 'bg-red-100 dark:bg-red-800/50'
                    : 'bg-amber-100 dark:bg-amber-800/50'
              }`}
            >
              {submitResults.errors === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : submitResults.success === 0 ? (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`font-medium ${
                  submitResults.errors === 0
                    ? 'text-green-700 dark:text-green-300'
                    : submitResults.success === 0
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-amber-700 dark:text-amber-300'
                }`}
              >
                Resultados del proceso
              </p>
              <div className="max-h-32 overflow-y-auto mt-2 space-y-1">
                {submitResults.messages.map((message, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    • {message}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {submitResults.success} correctos
            </span>
            {submitResults.errors > 0 && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                <AlertCircle className="w-4 h-4" />
                {submitResults.errors} errores
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabla modernizada */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <ScrollArea className="h-[calc(100vh-500px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-slate-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-900/20 hover:from-slate-100 hover:to-emerald-100 dark:hover:from-slate-800 dark:hover:to-emerald-900/30">
                <TableHead className="w-[50px] text-center">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
                <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-center gap-2">
                    <ServerIcon className="w-4 h-4 text-slate-500" />
                    Sector
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-center gap-2">
                    <HashIcon className="w-4 h-4 text-emerald-500" />
                    Nicho
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4 text-teal-500" />
                    Descripción Nicho
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-center gap-2">
                    <UsersIcon className="w-4 h-4 text-blue-500" />
                    Medidores
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-slate-700 dark:text-slate-300 w-[120px]">
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32">
                    <div className="flex justify-center items-center flex-col gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 dark:border-emerald-800"></div>
                        <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
                      </div>
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                        Cargando sectores...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow
                    key={index}
                    className={
                      isNichoSelected(item.nichoId)
                        ? 'bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 border-l-4 border-emerald-400'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                    }
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isNichoSelected(item.nichoId)}
                        onCheckedChange={() => handleSelectNicho(item)}
                        aria-label={`Seleccionar nicho ${item.nichoId}`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md inline-block">
                              {item.sectorId}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getSectorDescripcion(item.sectorId)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-mono text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-md inline-block">
                        {item.nichoId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[250px] truncate text-slate-700 dark:text-slate-300">
                              {item.descripcionNicho}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{item.descripcionNicho}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full inline-block">
                        {item.cantidadMedidores}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isNichoSelected(item.nichoId) ? (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                          Seleccionado
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        >
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-32">
                    <div className="flex justify-center items-center flex-col gap-3">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/20 rounded-2xl flex items-center justify-center">
                        <Info className="h-8 w-8 text-slate-400" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-slate-600 dark:text-slate-400 font-medium">
                          No hay sectores disponibles
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Selecciona un ciclo y realiza una búsqueda
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
