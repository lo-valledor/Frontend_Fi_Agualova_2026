/**
 * Componente principal para Revisión de Precios de Facturación
 *
 * Funcionalidades principales:
 * - Visualización de precios aplicados ENEL vs Enerlova
 * - Validación de permisos de usuario para modificación
 * - Modificación de precios individuales por contrato
 * - Filtros por ciclo de facturación y periodo
 * - Tabs para alternar entre ENEL y Enerlova
 * - Sistema de autorización con clave maestra
 *
 * Flujo de trabajo:
 * 1. Usuario accede al componente
 * 2. Sistema valida permisos del usuario
 * 3. Usuario selecciona ciclo de facturación
 * 4. Sistema carga precios aplicados para el periodo
 * 5. Usuario puede:
 *    - Ver detalles de precios ENEL/Enerlova en tabs
 *    - Modificar precio individual (si tiene permisos)
 *    - Ingresar clave maestra para modificaciones sensibles
 * 6. Sistema actualiza precios vía API
 *
 * Sistema de autorización:
 * - Validación inicial de usuario (/validar-usuario-precio)
 * - Clave maestra requerida para modificar
 * - Diálogo modal para ingreso de clave
 * - Validación de clave antes de permitir edición
 *
 * Arquitectura:
 * - Tabs component con 2 pestañas (ENEL / Enerlova)
 * - DataTables con columnas especializadas:
 *   * TablaValoresEnel: Precios ENEL por contrato
 *   * TablaValoresEnerlova: Precios Enerlova por contrato
 * - Modal DialogModificarPrecio para ediciones
 * - Estados para validación, filtros y datos
 * - API endpoints:
 *   * GET /validar-usuario-precio
 *   * POST /consulta-precio-uno (ENEL)
 *   * POST /consulta-precio-dos (Enerlova)
 *   * PUT /modificar-precio
 *
 * @param {Object} props - Props del componente
 * @param {PeriodoAbierto[]} props.periodoAbierto - Periodo activo
 * @param {Ciclo[]} props.ciclosFacturacion - Ciclos disponibles
 * @param {RevisarPrecioUno[]} props.precioUnoData - Datos iniciales ENEL
 * @param {RevisarPrecioDos[]} props.precioDosData - Datos iniciales Enerlova
 *
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/revisar-precio.tsx
 * export default function RevisarPrecioRoute({ loaderData }) {
 *   return (
 *     <RevisarPrecioComponent
 *       periodoAbierto={loaderData.periodoAbierto}
 *       ciclosFacturacion={loaderData.ciclos}
 *       precioUnoData={loaderData.precioUno}
 *       precioDosData={loaderData.precioDos}
 *     />
 *   );
 * }
 * ```
 */
import {
  AlertCircleIcon,
  BarChartIcon,
  Building2,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDown,
  ChevronUp,
  ClockIcon,
  HelpCircle,
  KeyIcon,
  Shield,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

import React, { useMemo, useState } from 'react';

import { useAuth } from '~/context/AuthContext';

import { ModernHeader } from '~/components/shared/modern-header';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle
} from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Skeleton } from '~/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import api from '~/lib/api';
import type {
  Ciclo,
  PeriodoAbierto,
  RevisarPrecioDos,
  RevisarPrecioUno,
  ValidacionUsuarioResponse
} from '~/types/operaciones';

import { columnsEnel } from './columns-enel';
import { columnsEnerlova } from './columns-enerlova';
import { DataTableVirtualized } from './data-table-virtualized';
import DialogModificarPrecio from './dialog-modificar-precio';

interface RevisarPrecioComponentProps {
  dataPeriodoAbierto: PeriodoAbierto[];
  dataConsultarPreciosUno: RevisarPrecioUno[];
  dataConsultarPreciosDos: RevisarPrecioDos[];
  ciclosFacturacion: Ciclo[];
  cicloSeleccionado: string;
  onCicloChange: (ciclo: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onRecargarPrecios: () => Promise<void>;
  isLoadingPrecios: boolean;
}

export default function RevisarPrecioComponent({
  dataPeriodoAbierto,
  dataConsultarPreciosUno,
  dataConsultarPreciosDos,
  ciclosFacturacion,
  cicloSeleccionado,
  onCicloChange,
  isLoading,
  error,
  onRecargarPrecios,
  isLoadingPrecios
}: Readonly<RevisarPrecioComponentProps>) {
  // Estados UI
  const [contrasena, setContrasena] = useState<string>('');
  const [_isLoadingCiclo] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState<ValidacionUsuarioResponse | null>(
    null
  );

  // Estados para los paneles colapsables
  const [isValidacionOpen, setIsValidacionOpen] = useState(true);

  // Permisos
  const { canCreate } = useAuth();
  const route = '/dashboard/operaciones/revisar-precio';
  const hasCreatePermission = canCreate(route);

  // Estados para las filas seleccionadas
  const [selectedEnelRows, setSelectedEnelRows] = useState<string[]>([]);
  const [selectedEnerlovaRows, setSelectedEnerlovaRows] = useState<string[]>(
    []
  );
  const [isConfirming, setIsConfirming] = useState(false);

  // Verificamos si el periodo está cargando
  const isPeriodoLoading = isLoading;

  // Verificamos si los ciclos están cargando
  const isCiclosLoading = isLoading;

  const handleContrasenaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContrasena(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && contrasena && !isLoading) {
      e.preventDefault();
      validarUsuario();
    }
  };

  const validarUsuario = async () => {
    try {
      const data = {
        contrasena: contrasena
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      const response = await api.post<ValidacionUsuarioResponse>(
        '/validar-usuario-modificacion',
        data,
        config
      );

      if (response.data) {
        toast.success('Usuario validado correctamente');
        setIsAuthorized(true);
        setUserData(response.data as ValidacionUsuarioResponse);
      } else {
        toast.error('Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('Error al validar usuario:', error);

      // Manejo específico de errores de validación vs errores de sesión
      if (error.response?.status === 401) {
        // Verificar si es un error de contraseña incorrecta vs sesión expirada
        const errorMessage =
          error.response.data?.mensaje || error.response.data?.message || '';

        if (
          errorMessage.toLowerCase().includes('contraseña') ||
          errorMessage.toLowerCase().includes('password') ||
          errorMessage.toLowerCase().includes('clave') ||
          errorMessage.toLowerCase().includes('credenciales')
        ) {
          // Error de contraseña incorrecta - NO cerrar sesión
          toast.error('Credenciales de usuario incorrectas');
        } else {
          // Error de sesión expirada
          toast.error('Contraseña incorrecta');
        }
        return;
      }

      if (error.response?.status === 400) {
        toast.error('Credenciales de usuario incorrectas');
        return;
      }

      if (error.response?.status === 403) {
        toast.error('No tienes permisos para realizar esta acción.');
        return;
      }

      if (error.response) {
        const errorMessage =
          error.response.data?.mensaje ||
          error.response.data?.message ||
          'Error en la validación';
        toast.error(`Error ${error.response.status}: ${errorMessage}`);
      } else if (error.request) {
        toast.error(
          'No se recibió respuesta del servidor. Verifica tu conexión.'
        );
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const confirmarCambios = async () => {
    if (!userData) {
      toast.error('No se pudo obtener información del usuario');
      return;
    }

    if (selectedEnelRows.length === 0 && selectedEnerlovaRows.length === 0) {
      toast.info('Debes seleccionar al menos un registro para confirmar');
      return;
    }

    try {
      setIsConfirming(true);

      // Confirmaciones de la tabla Enel
      const confirmacionesEnel = dataConsultarPreciosUno.filter(
        item =>
          selectedEnelRows.includes(item.codigo) &&
          item.indice !== '' &&
          item.confirmacion !== 'Confirmado'
      );

      // Confirmaciones de la tabla Enerlova
      const confirmacionesEnerlova = dataConsultarPreciosDos.filter(
        item =>
          selectedEnerlovaRows.includes(item.codigo) &&
          item.indice !== '' &&
          item.confirmacion !== 'Confirmado'
      );

      // Procesar todas las confirmaciones
      let confirmacionesExitosas = 0;
      let confirmacionesFallidas = 0;

      // Procesar confirmaciones Enel
      for (const item of confirmacionesEnel) {
        try {
          const response = await api.post(
            `/ConfirmarPrecio?indice=${item.indice}&usuario=${userData.nombreCompleto}`
          );

          if (response.status === 200) {
            confirmacionesExitosas++;
          } else {
            confirmacionesFallidas++;
            console.warn(
              `Error al confirmar: ${item.codigo}, status: ${response.status}`
            );
          }
        } catch (error: any) {
          console.error(`Error al confirmar precio ${item.codigo}:`, error);

          // Manejo específico de errores de autorización
          if (error.response?.status === 401) {
            const errorMessage =
              error.response.data?.mensaje ||
              error.response.data?.message ||
              '';

            if (
              errorMessage.toLowerCase().includes('contraseña') ||
              errorMessage.toLowerCase().includes('password') ||
              errorMessage.toLowerCase().includes('clave') ||
              errorMessage.toLowerCase().includes('credenciales') ||
              errorMessage.toLowerCase().includes('autorización') ||
              errorMessage.toLowerCase().includes('permisos')
            ) {
              // Error de autorización específico - continuar con otros registros
              console.warn(
                `Sin permisos para confirmar ${item.codigo}: ${errorMessage}`
              );
            } else {
              // Error de sesión expirada - detener proceso
              toast.error(
                'Sesión expirada durante el proceso. Reinicia la página.'
              );
              setIsConfirming(false);
              return;
            }
          }

          confirmacionesFallidas++;
        }
      }

      // Procesar confirmaciones Enerlova
      for (const item of confirmacionesEnerlova) {
        try {
          const response = await api.post(
            `/ConfirmarPrecio?indice=${item.indice}&usuario=${userData.nombreCompleto}`
          );

          if (response.status === 200) {
            confirmacionesExitosas++;
          } else {
            confirmacionesFallidas++;
            console.warn(
              `Error al confirmar: ${item.codigo}, status: ${response.status}`
            );
          }
        } catch (error: any) {
          console.error(`Error al confirmar precio ${item.codigo}:`, error);

          // Manejo específico de errores de autorización
          if (error.response?.status === 401) {
            const errorMessage =
              error.response.data?.mensaje ||
              error.response.data?.message ||
              '';

            if (
              errorMessage.toLowerCase().includes('contraseña') ||
              errorMessage.toLowerCase().includes('password') ||
              errorMessage.toLowerCase().includes('clave') ||
              errorMessage.toLowerCase().includes('credenciales') ||
              errorMessage.toLowerCase().includes('autorización') ||
              errorMessage.toLowerCase().includes('permisos')
            ) {
              // Error de autorización específico - continuar con otros registros
              console.warn(
                `Sin permisos para confirmar ${item.codigo}: ${errorMessage}`
              );
            } else {
              // Error de sesión expirada - detener proceso
              toast.error(
                'Sesión expirada durante el proceso. Reinicia la página.'
              );
              setIsConfirming(false);
              return;
            }
          }

          confirmacionesFallidas++;
        }
      }

      // Actualizar datos después de confirmar
      if (confirmacionesExitosas > 0) {
        // Limpiar selecciones
        setSelectedEnelRows([]);
        setSelectedEnerlovaRows([]);

        // Recargar precios para mostrar los cambios
        await onRecargarPrecios();

        toast.success(
          `Se han confirmado ${confirmacionesExitosas} registros correctamente`
        );
      } else if (confirmacionesExitosas === 0 && confirmacionesFallidas === 0) {
        toast.info('No había registros pendientes para confirmar');
      }

      if (confirmacionesFallidas > 0) {
        console.warn(
          `Total de confirmaciones fallidas: ${confirmacionesFallidas}`
        );
        toast.error(
          `No se pudieron confirmar ${confirmacionesFallidas} registros`
        );
      }
    } catch (error) {
      console.error('Error al confirmar cambios:', error);
      toast.error('Error al confirmar cambios');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCicloChange = async (nuevoCiclo: string) => {
    try {
      // setIsLoadingCiclo(true);
      await onCicloChange(nuevoCiclo);
    } catch (error) {
      console.error('Error al cambiar el ciclo:', error);
      toast.error('Error al cambiar el ciclo');
    } finally {
      //    setIsLoadingCiclo(false);
    }
  };

  // Función para verificar si el ciclo seleccionado es válido para el mes actual
  const _esCicloValido = () => {
    if (!dataPeriodoAbierto || dataPeriodoAbierto.length === 0) return true;
    return true; // Ya no hay restricciones para febrero
  };

  // Configurar columnas con las propiedades necesarias
  const configuredColumnsEnel = useMemo(() => {
    return columnsEnel.map(col => {
      if (col.id === 'acciones') {
        return {
          ...col,
          cell: ({ row }: { row: any }) => {
            const renderActionContent = () => {
              if (row.original.confirmacion === 'Confirmado') {
                return (
                  <Badge className='bg-success/10 text-success border-success/20'>
                    Confirmado
                  </Badge>
                );
              }

              if (row.original.indice === '') {
                return (
                  <Badge className='bg-destructive/10 text-destructive border-destructive/20'>
                    Inhabilitado
                  </Badge>
                );
              }

              return (
                <DialogModificarPrecio
                  isAuthorized={isAuthorized}
                  indice={Number(row.original.indice)}
                  descripcion={row.original.descripcion}
                  valorActual={row.original.valor}
                  onSuccess={onRecargarPrecios}
                />
              );
            };

            return <div className='text-center'>{renderActionContent()}</div>;
          }
        };
      }
      return col;
    });
  }, [isAuthorized, onRecargarPrecios]);

  const configuredColumnsEnerlova = useMemo(() => {
    return columnsEnerlova.map(col => {
      if (col.id === 'acciones') {
        return {
          ...col,
          cell: ({ row }: { row: any }) => {
            return (
              <div className='text-center'>
                {row.original.confirmacion === 'Confirmado' ? (
                  <Badge className='bg-success/10 text-success border-success/20'>
                    Confirmado
                  </Badge>
                ) : (
                  <DialogModificarPrecio
                    isAuthorized={isAuthorized}
                    indice={Number(row.original.indice)}
                    descripcion={row.original.descripcion}
                    valorActual={row.original.valor}
                    onSuccess={onRecargarPrecios}
                  />
                )}
              </div>
            );
          }
        };
      }
      return col;
    });
  }, [isAuthorized, onRecargarPrecios]);

  // Pasos del tour interactivo con driver.js
  const tourSteps = [
    {
      element: '#validacion-usuario',
      popover: {
        title: '🔐 Validación de Usuario',
        description:
          'Este es el <strong>panel de autorización</strong>. Debes ingresar tu contraseña para poder modificar o confirmar precios en el sistema.',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#password-field',
      popover: {
        title: '🔑 Contraseña de Autorización',
        description:
          'Ingresa tu <strong>contraseña</strong> aquí para validar tu identidad y obtener permisos de modificación.',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#autorizar-btn',
      popover: {
        title: '✅ Autorizar',
        description:
          'Haz clic en <strong>Autorizar</strong> después de ingresar tu contraseña. Una vez autorizado, podrás modificar precios pendientes.',
        side: 'bottom' as const,
        align: 'center' as const
      }
    },
    {
      element: '#confirmar-btn',
      popover: {
        title: '📋 Confirmar Cambios',
        description:
          'Después de seleccionar los registros que deseas confirmar, usa este botón para <strong>guardar los cambios</strong> en el sistema.',
        side: 'top' as const,
        align: 'center' as const
      }
    },
    {
      element: '#tabs-precios-revision',
      popover: {
        title: '🔄 Pestañas de Precios',
        description:
          'Alterna entre <strong>Valores ENEL</strong> y <strong>Precios Enerlova</strong> según el ciclo de facturación seleccionado.',
        side: 'top' as const,
        align: 'start' as const
      }
    },
    {
      element: '#selector-ciclo',
      popover: {
        title: '⏰ Selector de Ciclo',
        description:
          'Selecciona el <strong>ciclo de facturación</strong> para ver los precios correspondientes a ese período (día 15 o día 30).',
        side: 'bottom' as const,
        align: 'start' as const
      }
    },
    {
      element: '#tabla-valores-enel',
      popover: {
        title: '💰 Tabla de Valores ENEL',
        description:
          'Aquí se muestran los <strong>precios aplicados de ENEL</strong> para cada contrato. Puedes modificar valores pendientes si estás autorizado.',
        side: 'top' as const,
        align: 'start' as const
      }
    },
    {
      element: '#tabla-precios-enerlova',
      popover: {
        title: '💼 Tabla de Precios Enerlova',
        description:
          'Esta tabla muestra los <strong>precios de Enerlova por ciclo</strong>. Revisa y confirma los valores antes de la facturación.',
        side: 'top' as const,
        align: 'start' as const
      }
    }
  ];

  // Función para iniciar el tour
  const startTour = () => {
    const driverjs = driver({
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      smoothScroll: true,
      stagePadding: 4,
      stageRadius: 6,
      animate: true,
      allowClose: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      onHighlightStarted: element => {
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    driverjs.setSteps(tourSteps);
    driverjs.drive();
  };

  // Mostrar error si existe
  if (error) {
    return (
      <div className='min-h-screen '>
        <div className='container mx-auto p-2 space-y-3'>
          <div className='text-center py-12'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-xl mb-4'>
              <AlertCircleIcon className='w-8 h-8 text-destructive' />
            </div>
            <h1 className='text-2xl font-bold mb-2'>Error al cargar datos</h1>
            <p className='text-muted-foreground'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          {/* Header */}
          <ModernHeader
            title='Revisar Precios'
            description='Gestión y validación de precios del sistema'
          />

          {/* Botón de Guía Interactiva */}
          <Button
            variant='outline'
            size='sm'
            onClick={startTour}
            className='mb-2'
          >
            <HelpCircle className='h-4 w-4' />
          </Button>
        </div>

        {/* Validación de Usuario */}
        <Card
          id='validacion-usuario'
          className='bg-card border border-border shadow-sm'
        >
          <Collapsible
            open={isValidacionOpen}
            onOpenChange={setIsValidacionOpen}
          >
            <div
              className='flex justify-between items-center p-3 cursor-pointer hover:bg-muted/50 transition-colors'
              onClick={() => setIsValidacionOpen(!isValidacionOpen)}
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center border border-border'>
                  <Shield className='w-4 h-4 text-primary' />
                </div>
                <div>
                  <CardTitle className='text-md'>
                    Validación de Usuario
                  </CardTitle>
                  <CardDescription className='mt-1 text-sm'>
                    Autorización para realizar modificaciones de precios
                  </CardDescription>
                </div>
              </div>
              <div className='flex items-center gap-3'>
                {isAuthorized && (
                  <Badge
                    variant='outline'
                    className='bg-primary/10 text-primary border-primary/20'
                  >
                    ✓ Autorizado
                  </Badge>
                )}
                <Button variant='ghost' size='icon' className='h-8 w-8'>
                  {isValidacionOpen ? (
                    <ChevronUp className='h-5 w-5 text-muted-foreground' />
                  ) : (
                    <ChevronDown className='h-5 w-5 text-muted-foreground' />
                  )}
                </Button>
              </div>
            </div>

            <CollapsibleContent>
              <CardContent className='p-3 space-y-4'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 items-end'>
                  <div
                    id='password-field'
                    className='space-y-2 w-full lg:col-span-2'
                  >
                    <Label className='text-sm font-medium flex items-center gap-2'>
                      <KeyIcon className='w-4 h-4 text-primary' />
                      <span className='hidden sm:inline'>
                        Contraseña de autorización
                      </span>
                      <span className='sm:hidden'>Contraseña</span>
                    </Label>
                    <Input
                      type='password'
                      value={contrasena}
                      onChange={handleContrasenaChange}
                      onKeyDown={handleKeyDown}
                      className='bg-background border-border h-10'
                      placeholder='Ingresa tu contraseña'
                      disabled={!hasCreatePermission}
                    />
                  </div>
                  <div className='flex gap-3 w-full'>
                    <Button
                      id='autorizar-btn'
                      onClick={validarUsuario}
                      disabled={
                        isLoading || !contrasena || !hasCreatePermission
                      }
                      title={
                        !hasCreatePermission
                          ? 'No tiene permisos para autorizar modificaciones'
                          : ''
                      }
                      className='bg-primary hover:bg-primary/90 text-primary-foreground flex-1 h-10'
                      size='sm'
                    >
                      <CheckCircleIcon className='w-4 h-4 mr-2' />
                      <span className='hidden sm:inline'>
                        {isLoading ? 'Validando...' : 'Autorizar'}
                      </span>
                      <span className='sm:hidden'>
                        {isLoading ? '...' : 'Auth'}
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Resumen de selección */}
                {isAuthorized && (
                  <div className='border-t pt-3 lg:pt-4'>
                    <div className='space-y-1'>
                      <h3 className='font-medium text-sm sm:text-base'>
                        <span className='hidden sm:inline'>
                          Estado de Autorización
                        </span>
                        <span className='sm:hidden'>Estado</span>
                      </h3>
                      <p className='text-xs sm:text-sm text-muted-foreground'>
                        <span className='hidden sm:inline'>
                          Registros seleccionados:{' '}
                        </span>
                        <span className='sm:hidden'>Seleccionados: </span>
                        {selectedEnelRows.length + selectedEnerlovaRows.length}
                      </p>
                    </div>

                    {/* Detalle de selección */}
                    {(selectedEnelRows.length > 0 ||
                      selectedEnerlovaRows.length > 0) && (
                      <div className='p-3 sm:p-4 bg-muted/50 border border-border rounded-xl mt-3'>
                        <div className='flex items-center gap-2 mb-2'>
                          <Users className='w-4 h-4 text-primary' />
                          <span className='text-xs sm:text-sm font-medium'>
                            <span className='hidden sm:inline'>
                              Resumen de selección:
                            </span>
                            <span className='sm:hidden'>Resumen:</span>
                          </span>
                        </div>
                        <div className='text-xs text-muted-foreground space-y-1'>
                          {selectedEnelRows.length > 0 && (
                            <p>
                              • {selectedEnelRows.length}
                              <span className='hidden sm:inline'>
                                {' '}
                                registros en Valores Compañía de Electricidad
                              </span>
                              <span className='sm:hidden'> valores Enel</span>
                            </p>
                          )}
                          {selectedEnerlovaRows.length > 0 && (
                            <p>
                              • {selectedEnerlovaRows.length}
                              <span className='hidden sm:inline'>
                                {' '}
                                registros en Precios por Ciclo de Facturación
                              </span>
                              <span className='sm:hidden'>
                                {' '}
                                precios Enerlova
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>

              {/* Footer de autorización */}
              {isAuthorized && userData && (
                <CardFooter className='bg-primary/10 border-t border-primary/20 text-primary py-3 px-3'>
                  <div className='flex items-center gap-2'>
                    <CheckCircleIcon className='h-4 w-4' />
                    <span className='text-sm font-medium'>
                      {userData.mensaje} - Puede modificar valores pendientes
                    </span>
                  </div>
                </CardFooter>
              )}
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Tablas de Precios con Tabs */}
        <Card className='bg-card border border-border shadow-sm'>
          <CardContent className='p-3'>
            {/* Botón de confirmación */}
            {isAuthorized && (
              <div className='mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-muted/30 rounded-lg border border-border'>
                <div className='space-y-1'>
                  <h3 className='font-medium text-sm sm:text-base'>
                    <span className='hidden sm:inline'>
                      Confirmación de Cambios
                    </span>
                    <span className='sm:hidden'>Confirmación</span>
                  </h3>
                  <p className='text-xs sm:text-sm text-muted-foreground'>
                    <span className='hidden sm:inline'>
                      Registros seleccionados:{' '}
                    </span>
                    <span className='sm:hidden'>Seleccionados: </span>
                    <span className='font-medium text-primary'>
                      {selectedEnelRows.length + selectedEnerlovaRows.length}
                    </span>
                  </p>
                </div>
                <Button
                  id='confirmar-btn'
                  onClick={confirmarCambios}
                  disabled={
                    isConfirming ||
                    !isAuthorized ||
                    (selectedEnelRows.length === 0 &&
                      selectedEnerlovaRows.length === 0)
                  }
                  className='bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto'
                  size='sm'
                >
                  <AlertCircleIcon className='w-4 h-4 mr-2' />
                  <span className='hidden sm:inline'>
                    {isConfirming ? 'Procesando...' : 'Confirmar Cambios'}
                  </span>
                  <span className='sm:hidden'>
                    {isConfirming ? '...' : 'Confirmar'}
                  </span>
                </Button>
              </div>
            )}

            <Tabs
              id='tabs-precios-revision'
              defaultValue='enel'
              className='w-full'
            >
              <TabsList className='w-full justify-start rounded-none border-b bg-transparent p-0'>
                <TabsTrigger
                  value='enel'
                  className='relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none'
                >
                  <Building2 className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='hidden sm:inline'>Valores Enel</span>
                  <span className='sm:hidden'>Enel</span>
                </TabsTrigger>
                <TabsTrigger
                  value='enerlova'
                  className='relative h-auto rounded-none border-b-2 border-transparent bg-transparent px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none'
                >
                  <BarChartIcon className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='hidden sm:inline'>Precios Enerlova</span>
                  <span className='sm:hidden'>Enerlova</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value='enel' className='space-y-4 pt-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div>
                    <h3 className='text-base sm:text-lg font-semibold'>
                      <span className='hidden sm:inline'>
                        Valores Compañía de Electricidad
                      </span>
                      <span className='sm:hidden'>Valores Enel</span>
                    </h3>
                    <p className='text-xs sm:text-sm'>
                      <span className='hidden sm:inline'>
                        Revisión de precios para el período activo
                      </span>
                      <span className='sm:hidden'>Período activo</span>
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className='bg-muted/50 border-border self-start sm:self-auto'
                  >
                    <CalendarIcon className='w-3 h-3 mr-1' />
                    {isPeriodoLoading ? (
                      <Skeleton className='h-4 w-20' />
                    ) : dataPeriodoAbierto && dataPeriodoAbierto.length > 0 ? (
                      <span className='text-xs sm:text-sm'>
                        {dataPeriodoAbierto[0].descripcion}
                      </span>
                    ) : (
                      'Sin período'
                    )}
                  </Badge>
                </div>
                <div
                  id='tabla-valores-enel'
                  className='rounded-xl border border-border overflow-hidden bg-card'
                >
                  <DataTableVirtualized
                    columns={configuredColumnsEnel}
                    data={dataConsultarPreciosUno}
                    enableSelection={isAuthorized}
                    selectedRowIds={selectedEnelRows}
                    onRowSelectionChange={setSelectedEnelRows}
                    isLoading={isLoadingPrecios}
                  />
                </div>
              </TabsContent>

              <TabsContent value='enerlova' className='space-y-4 pt-4'>
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div>
                    <h3 className='text-base sm:text-lg font-semibold'>
                      <span className='hidden sm:inline'>
                        Precios por Ciclo de Facturación
                      </span>
                      <span className='sm:hidden'>Precios Enerlova</span>
                    </h3>
                    <p className='text-xs sm:text-sm'>
                      <span className='hidden sm:inline'>
                        Precios de ENERLOVA según ciclo de facturación
                      </span>
                      <span className='sm:hidden'>
                        Según ciclo de facturación
                      </span>
                    </p>
                  </div>
                  <Badge
                    variant='outline'
                    className='bg-muted/50 border-border self-start sm:self-auto'
                  >
                    <ClockIcon className='w-3 h-3 mr-1' />
                    <span className='text-xs sm:text-sm'>
                      Ciclo {cicloSeleccionado}
                    </span>
                  </Badge>
                </div>

                {/* Selector de ciclo */}
                <div
                  id='selector-ciclo'
                  className='flex flex-col lg:flex-row gap-2 lg:gap-3 items-start lg:items-end'
                >
                  <div className='space-y-2 flex-1 w-full'>
                    <Label className='text-xs sm:text-sm font-medium flex items-center gap-2'>
                      <ClockIcon className='w-3 h-3 sm:w-4 sm:h-4 text-primary' />
                      <span className='hidden sm:inline'>
                        Ciclo de Facturación
                      </span>
                      <span className='sm:hidden'>Ciclo</span>
                    </Label>
                    {isCiclosLoading ? (
                      <Skeleton className='h-9 sm:h-10 w-full' />
                    ) : (
                      <Select
                        value={cicloSeleccionado}
                        onValueChange={handleCicloChange}
                        disabled={isPeriodoLoading}
                      >
                        <SelectTrigger className='bg-background border-border h-9 sm:h-10 text-sm'>
                          <SelectValue placeholder='Selecciona un ciclo' />
                        </SelectTrigger>
                        <SelectContent>
                          {ciclosFacturacion && ciclosFacturacion.length > 0 ? (
                            ciclosFacturacion.map(ciclo => (
                              <SelectItem
                                key={ciclo.diaFacturacion}
                                value={ciclo.diaFacturacion}
                              >
                                {ciclo.descripcion}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value='15'>Ciclo día 15</SelectItem>
                              <SelectItem value='30'>Ciclo día 30</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Tabla de precios Enerlova */}
                <div
                  id='tabla-precios-enerlova'
                  className='rounded-xl border border-border overflow-hidden bg-card'
                >
                  <DataTableVirtualized
                    columns={configuredColumnsEnerlova}
                    data={dataConsultarPreciosDos}
                    enableSelection={isAuthorized}
                    selectedRowIds={selectedEnerlovaRows}
                    onRowSelectionChange={setSelectedEnerlovaRows}
                    isLoading={isLoadingPrecios}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
