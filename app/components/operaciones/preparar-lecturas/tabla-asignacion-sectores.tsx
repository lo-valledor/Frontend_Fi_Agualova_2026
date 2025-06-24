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
  ClipboardListIcon,
  AlertCircle,
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
  isAuthorized,
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
      // Verificamos si ya existe este nicho en la selección
      const existingIndex = prev.findIndex(
        (nicho) => nicho.nichoId === item.nichoId,
      );

      if (existingIndex >= 0) {
        // Si existe, lo eliminamos
        return prev.filter((nicho) => nicho.nichoId !== item.nichoId);
      } else {
        // Si no existe, lo agregamos
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
      // Creamos un array de objetos NichoSeleccionado a partir de los datos
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

      // Creamos un array para almacenar los resultados
      const results = {
        success: 0,
        errors: 0,
        messages: [] as string[],
      };

      // Preparamos lecturas para cada nicho seleccionado
      for (const nicho of selectedNichos) {
        // Creamos la solicitud
        const requestData: PrepararLecturasRequest = {
          nichoId: nicho.nichoId,
          cantLecturas: nicho.cantidad,
          cicloFact: cicloFacturable,
          periodo: periodo,
        };

        try {
          // Realizamos la petición a la API
          const response = await api.post(
            '/generar-proceso-lecturas',
            requestData,
          );

          // Verificamos si la respuesta fue exitosa
          if (response.status >= 200 && response.status < 300) {
            results.success++;
            results.messages.push(
              `Nicho ${nicho.nichoId} (${nicho.descripcion}) procesado correctamente`,
            );
          } else {
            results.errors++;
            // Usamos una forma segura de acceder a la respuesta
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

      // Actualizamos los resultados
      setSubmitResults(results);

      // Mostramos un mensaje de resumen
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

      // Si todos fueron exitosos, limpiamos la selección
      if (results.errors === 0) {
        setSelectedNichos([]);
        setSelectAll(false);
      }

      // Recargamos datos después de procesar las lecturas
      if (onRecargarDatos) {
        await onRecargarDatos();
      }
    } catch (error: any) {
      console.error('Error al preparar lecturas:', error);
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
    <div className="space-y-3">
      {/* Contador de selección y botón de acción */}
      {selectedNichos.length > 0 && (
        <div className="flex justify-between items-center">
          <div>
            <Badge
              variant="outline"
              className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
            >
              {selectedNichos.length} nichos seleccionados
            </Badge>
          </div>
          <div>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
              onClick={prepararLecturas}
              disabled={
                isSubmitting ||
                selectedNichos.length === 0 ||
                !periodo ||
                !cicloFacturable
              }
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardListIcon className="h-4 w-4" />
              )}
              {isSubmitting ? 'Procesando...' : 'Preparar Lecturas'}
            </Button>
          </div>
        </div>
      )}

      {/* Resultados del envío */}
      {submitResults.messages.length > 0 && (
        <div
          className={`rounded-md p-3 mb-3 ${
            submitResults.errors === 0
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : submitResults.success === 0
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
          }`}
        >
          <div className="flex gap-2 items-start mb-2">
            {submitResults.errors === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : submitResults.success === 0 ? (
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
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
              <div className="max-h-32 overflow-y-auto mt-1 text-sm space-y-1">
                {submitResults.messages.map((message, index) => (
                  <p key={index} className="text-muted-foreground">
                    {message}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-2 text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium">
              {submitResults.success} correctos
            </span>
            {submitResults.errors > 0 && (
              <span className="text-red-600 dark:text-red-400 font-medium">
                {submitResults.errors} errores
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-lg border border-border/60 overflow-hidden shadow-sm bg-background">
        <ScrollArea className="h-[calc(100vh-500px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/60">
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                </TableHead>
                <TableHead className="text-xs text-center font-medium text-muted-foreground">
                  Sector
                </TableHead>
                <TableHead className="text-xs text-center font-medium text-muted-foreground">
                  Nicho
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">
                  Descripción Nicho
                </TableHead>
                <TableHead className="text-xs text-center font-medium text-muted-foreground">
                  Medidores
                </TableHead>
                <TableHead className="text-xs text-center font-medium text-muted-foreground w-[80px]">
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="flex justify-center items-center flex-col gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-sky-600 dark:text-sky-400" />
                      <span className="text-sm text-muted-foreground">
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
                        ? 'bg-sky-50/50 dark:bg-sky-900/10 hover:bg-sky-50/70 dark:hover:bg-sky-900/20'
                        : 'hover:bg-muted/30'
                    }
                  >
                    <TableCell>
                      <Checkbox
                        checked={isNichoSelected(item.nichoId)}
                        onCheckedChange={() => handleSelectNicho(item)}
                        aria-label={`Seleccionar nicho ${item.nichoId}`}
                      />
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>{item.sectorId}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{getSectorDescripcion(item.sectorId)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {item.nichoId}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="max-w-[200px] truncate">
                              {item.descripcionNicho}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{item.descripcionNicho}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {item.cantidadMedidores}
                    </TableCell>
                    <TableCell className="text-center">
                      {isNichoSelected(item.nichoId) ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        >
                          Seleccionado
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800"
                        >
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="flex justify-center items-center flex-col gap-2">
                      <Info className="h-6 w-6 text-muted-foreground" />
                      <div className="text-center space-y-1">
                        <p className="text-muted-foreground">
                          No hay sectores disponibles
                        </p>
                        <p className="text-xs text-muted-foreground">
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
