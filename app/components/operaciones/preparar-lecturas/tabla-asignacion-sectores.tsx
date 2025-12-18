import {
  AlertCircle,
  CheckCircle2,
  FileTextIcon,
  Info,
  PlayIcon,
  ServerIcon,
  UsersIcon
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useAuth } from '~/context/AuthContext';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import api from '~/lib/api';
import {
  type ConsultarAsignacionSectores,
  type ConsultarSectores,
  type TablaAsignacionSectoresProps
} from '~/types/operaciones';

interface TablaAsignacionSectoresWithDescriptionProps extends TablaAsignacionSectoresProps {
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
  periodo = '',
  cicloFacturable = '',
  onRecargarDatos
}: Readonly<TablaAsignacionSectoresWithDescriptionProps>) {
  // Estados
  const [selectedNichos, setSelectedNichos] = useState<NichoSeleccionado[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permisos
  const { canCreate, canEdit } = useAuth();
  const route = '/dashboard/operaciones/preparar-lecturas';
  const hasPermission = canCreate(route) || canEdit(route);
  const [submitResults, setSubmitResults] = useState<{
    success: number;
    errors: number;
    messages: string[];
  }>({ success: 0, errors: 0, messages: [] });

  // Función para manejar la selección de un nicho
  const handleSelectNicho = (item: ConsultarAsignacionSectores) => {
    setSelectedNichos(prev => {
      const existingIndex = prev.findIndex(
        nicho => nicho.nichoId === item.nichoId
      );

      if (existingIndex >= 0) {
        return prev.filter(nicho => nicho.nichoId !== item.nichoId);
      } else {
        return [
          ...prev,
          {
            nichoId: item.nichoId,
            sectorId: item.sectorId,
            cantidad: item.cantidadMedidores,
            descripcion: item.descripcionNicho
          }
        ];
      }
    });
  };

  // Función para verificar si un nicho está seleccionado
  const isNichoSelected = (nichoId: number): boolean => {
    return selectedNichos.some(nicho => nicho.nichoId === nichoId);
  };

  // Función para seleccionar o deseleccionar todos
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNichos([]);
    } else {
      const allNichos = data.map(item => ({
        nichoId: item.nichoId,
        sectorId: item.sectorId,
        cantidad: item.cantidadMedidores,
        descripcion: item.descripcionNicho
      }));
      setSelectedNichos(allNichos);
    }
    setSelectAll(!selectAll);
  };

  // Helper function to extract error message
  const extractErrorMessage = (error: any): string => {
    if (error.response?.data?.mensaje) {
      return error.response.data.mensaje;
    }
    if (error.response?.data) {
      return 'Sin detalles en la respuesta';
    }
    return error.message || 'Error desconocido';
  };

  // Helper function to process a single nicho
  const procesarNicho = async (
    nicho: NichoSeleccionado
  ): Promise<{ success: boolean; message: string }> => {
    const requestData: PrepararLecturasRequest = {
      nichoId: nicho.nichoId,
      cantLecturas: nicho.cantidad,
      cicloFact: cicloFacturable,
      periodo: periodo
    };

    try {
      const response = await api.post('/generar-proceso-lecturas', requestData);

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: `Nicho ${nicho.nichoId} (${nicho.descripcion}) procesado correctamente`
        };
      }

      const errorMessage =
        (response.data &&
        typeof response.data === 'object' &&
        'mensaje' in response.data
          ? (response.data as { mensaje?: string }).mensaje
          : undefined) || 'Sin detalles en la respuesta';
      return {
        success: false,
        message: `Error al procesar nicho ${nicho.nichoId}: ${errorMessage}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error al procesar nicho ${nicho.nichoId}: ${extractErrorMessage(error)}`
      };
    }
  };

  // Helper function to show results toast
  const mostrarResultados = (results: { success: number; errors: number }) => {
    if (results.errors === 0) {
      toast.success(`${results.success} nichos procesados correctamente`);
    } else if (results.success === 0) {
      toast.error(
        `No se pudo procesar ningún nicho. ${results.errors} errores.`
      );
    } else {
      toast.warning(
        `${results.success} nichos procesados. ${results.errors} con errores.`
      );
    }
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

      const results = { success: 0, errors: 0, messages: [] as string[] };

      for (const nicho of selectedNichos) {
        const resultado = await procesarNicho(nicho);

        if (resultado.success) {
          results.success++;
        } else {
          results.errors++;
        }
        results.messages.push(resultado.message);
      }

      setSubmitResults(results);
      mostrarResultados(results);

      if (results.errors === 0) {
        setSelectedNichos([]);
        setSelectAll(false);
      }

      if (onRecargarDatos) {
        await onRecargarDatos();
      }
    } catch (error: any) {
      toast.error(
        `Error al preparar lecturas: ${error.message || 'Error desconocido'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get result type
  const getResultType = () => {
    if (submitResults.errors === 0) return 'success';
    if (submitResults.success === 0) return 'error';
    return 'warning';
  };

  // Helper function to get CSS classes based on result type
  const getResultClasses = () => {
    const resultType = getResultType();

    const classes = {
      container: {
        success:
          'bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800',
        error:
          'bg-linear-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800',
        warning:
          'bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
      },
      iconWrapper: {
        success: 'bg-green-100 dark:bg-green-800/50',
        error: 'bg-red-100 dark:bg-red-800/50',
        warning: 'bg-amber-100 dark:bg-amber-800/50'
      },
      text: {
        success: 'text-green-700 dark:text-green-300',
        error: 'text-red-700 dark:text-red-300',
        warning: 'text-amber-700 dark:text-amber-300'
      }
    };

    return {
      container: classes.container[resultType],
      iconWrapper: classes.iconWrapper[resultType],
      text: classes.text[resultType]
    };
  };

  // Helper function to get the appropriate icon
  const getResultIcon = () => {
    const resultType = getResultType();
    const iconProps = 'h-5 w-5';

    if (resultType === 'success') {
      return (
        <CheckCircle2
          className={`${iconProps} text-green-600 dark:text-green-400`}
        />
      );
    }
    if (resultType === 'error') {
      return (
        <AlertCircle
          className={`${iconProps} text-red-600 dark:text-red-400`}
        />
      );
    }
    return (
      <Info className={`${iconProps} text-amber-600 dark:text-amber-400`} />
    );
  };

  const resultClasses = getResultClasses();

  // REFACTOR: Extraer renderizado de filas de tabla
  const renderTableRows = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className='text-center h-32'>
            <div className='flex justify-center items-center flex-col gap-3'>
              <div className='relative'>
                <div className='w-12 h-12 rounded-full border-4 border-border'></div>
                <div className='absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-border border-t-transparent animate-spin'></div>
              </div>
              <span className='text-emerald-700 dark:text-emerald-300 font-medium'>
                Cargando sectores...
              </span>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className='text-center h-32 px-4'>
            <div className='flex justify-center items-center flex-col gap-2 sm:gap-3'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-background rounded-xl flex items-center justify-center'>
                <Info className='h-6 w-6 sm:h-8 sm:w-8 text-slate-400' />
              </div>
              <div className='text-center space-y-1'>
                <p className='font-medium text-sm sm:text-base'>
                  <span className='hidden sm:inline'>
                    No hay sectores disponibles
                  </span>
                  <span className='sm:hidden'>Sin sectores</span>
                </p>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  <span className='hidden sm:inline'>
                    Selecciona un ciclo y realiza una búsqueda
                  </span>
                  <span className='sm:hidden'>Realiza una búsqueda</span>
                </p>
              </div>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return data.map(item => (
      <TableRow
        key={item.nichoId}
        className={
          isNichoSelected(item.nichoId)
            ? ' hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 border-l-4 border-border'
            : 'hover:bg-muted'
        }
      >
        <TableCell className='text-center px-2 sm:px-4 py-2 sm:py-3'>
          <Checkbox
            checked={isNichoSelected(item.nichoId)}
            onCheckedChange={() => handleSelectNicho(item)}
            aria-label={`Seleccionar nicho ${item.nichoId}`}
            disabled={!hasPermission}
            title={hasPermission ? '' : 'No tiene permisos para seleccionar'}
          />
        </TableCell>
        <TableCell className='text-center px-2 sm:px-4 py-2 sm:py-3'>
          {item.descripcionSector}
        </TableCell>

        <TableCell className='px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='max-w-[250px] truncate text-sm'>
                  {item.descripcionNicho}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className='max-w-xs'>{item.descripcionNicho}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className='text-center px-2 sm:px-4 py-2 sm:py-3'>
          <div className='font-medium bg-background px-2 sm:px-3 py-1 rounded-full inline-block text-xs sm:text-sm'>
            {item.cantidadMedidores}
          </div>
        </TableCell>
        <TableCell className='text-center px-2 sm:px-4 py-2 sm:py-3'>
          {isNichoSelected(item.nichoId) ? (
            <Badge className='bg-linear-to-r from-emerald-500 to-teal-600 border-0 text-xs px-1 sm:px-2'>
              <span className='hidden sm:inline'>Seleccionado</span>
              <span className='sm:hidden'>Sel</span>
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='bg-background border-border text-xs px-1 sm:px-2'
            >
              <span className='hidden sm:inline'>Pendiente</span>
              <span className='sm:hidden'>Pend</span>
            </Badge>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className='space-y-4'>
      {/* Barra de acciones flotante (derecha inferior) */}
      <div className='fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300 flex flex-col items-end gap-3'>
        {/* Tooltip flotante para Aceptar */}
        {selectedNichos.length > 0 && (
          <div className='bg-zinc-800 dark:bg-zinc-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4' />
              <span>
                {selectedNichos.length}{' '}
                {selectedNichos.length === 1
                  ? 'nicho seleccionado'
                  : 'nichos seleccionados'}
              </span>
            </div>
          </div>
        )}

        {/* Contenedor de botones en grupo */}
        <div className='flex flex-col gap-2 bg-background border border-border rounded-lg p-2 shadow-lg'>
          {/* Preparar Lecturas */}
          <Button
            onClick={prepararLecturas}
            disabled={
              isSubmitting ||
              selectedNichos.length === 0 ||
              !periodo ||
              !cicloFacturable ||
              !hasPermission
            }
            variant='default'
            size='sm'
            className='bg-linear-to-br from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
            title={
              !hasPermission
                ? 'No tiene permisos para preparar lecturas'
                : selectedNichos.length === 0
                  ? 'Seleccione al menos un nicho'
                  : `Preparar lecturas para ${selectedNichos.length} nicho(s)`
            }
          >
            {isSubmitting ? (
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
            ) : (
              <PlayIcon className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>

      {/* Resultados del envío */}
      {submitResults.messages.length > 0 && (
        <div className={`rounded-xl p-4 border ${resultClasses.container}`}>
          <div className='flex gap-3 items-start mb-3'>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${resultClasses.iconWrapper}`}
            >
              {getResultIcon()}
            </div>
            <div className='flex-1'>
              <p className={`font-medium ${resultClasses.text}`}>
                Resultados del proceso
              </p>
              <div className='max-h-32 overflow-y-auto mt-2 space-y-1'>
                {submitResults.messages.map(message => (
                  <p key={message} className='text-sm text-muted-foreground'>
                    • {message}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className='flex gap-4 text-sm'>
            <span className='flex items-center gap-1 text-green-600 dark:text-green-400 font-medium'>
              <CheckCircle2 className='w-4 h-4' />
              {submitResults.success} correctos
            </span>
            {submitResults.errors > 0 && (
              <span className='flex items-center gap-1 text-red-600 dark:text-red-400 font-medium'>
                <AlertCircle className='w-4 h-4' />
                {submitResults.errors} errores
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabla modernizada */}
      <div className='rounded-xl border-border overflow-hidden bg-background shadow-sm'>
        <ScrollArea className='h-[calc(100vh-500px)]'>
          <Table>
            <TableHeader>
              <TableRow className='hover:from-slate-100 hover:to-emerald-100 dark:hover:from-slate-800 dark:hover:to-emerald-900/30'>
                <TableHead className='w-[50px] text-center'>
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label='Seleccionar todos'
                    disabled={!hasPermission}
                    title={
                      hasPermission ? '' : 'No tiene permisos para seleccionar'
                    }
                  />
                </TableHead>
                <TableHead className='text-center font-semibold text-xs sm:text-sm px-2 sm:px-4'>
                  <div className='flex items-center justify-center gap-1 sm:gap-2'>
                    <ServerIcon className='w-3 h-3 sm:w-4 sm:h-4 text-slate-500' />
                    <span className='hidden sm:inline'>Sector</span>
                    <span className='sm:hidden'>Sect</span>
                  </div>
                </TableHead>
                <TableHead className='font-semibold text-xs sm:text-sm px-2 sm:px-4 hidden sm:table-cell'>
                  <div className='flex items-center gap-2'>
                    <FileTextIcon className='w-4 h-4 text-teal-500' />
                    Descripción Nicho
                  </div>
                </TableHead>
                <TableHead className='text-center font-semibold text-xs sm:text-sm px-2 sm:px-4'>
                  <div className='flex items-center justify-center gap-1 sm:gap-2'>
                    <UsersIcon className='w-3 h-3 sm:w-4 sm:h-4 text-blue-500' />
                    <span className='hidden sm:inline'>Medidores</span>
                    <span className='sm:hidden'>Med</span>
                  </div>
                </TableHead>
                <TableHead className='text-center font-semibold text-xs sm:text-sm px-2 sm:px-4 w-20 sm:w-[120px]'>
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableRows()}</TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
