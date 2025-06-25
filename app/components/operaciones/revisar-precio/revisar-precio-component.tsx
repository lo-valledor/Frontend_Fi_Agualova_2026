import React, { useState, useMemo, useEffect } from 'react';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import api from '~/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  LockIcon,
  KeyIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DollarSignIcon,
  CalendarIcon,
  BarChartIcon,
  ClockIcon,
  ChevronDown,
  ChevronUp,
  Building2,
  TrendingUp,
  Shield,
  Users,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import type {
  RevisarPrecioUno,
  RevisarPrecioDos,
  ValidacionUsuarioResponse,
  PeriodoAbierto,
} from '~/types/operaciones';
import { Skeleton } from '~/components/ui/skeleton';
import { columnsEnel } from './columns-enel';
import { DataTable } from './data-table';
import { columnsEnerlova } from './columns-enerlova';
import DialogModificarPrecio from './dialog-modificar-precio';

interface RevisarPrecioComponentProps {
  dataPeriodoAbierto: PeriodoAbierto[];
  dataConsultarPreciosUno: RevisarPrecioUno[];
  dataConsultarPreciosDos: RevisarPrecioDos[];
  ciclosFacturacion: any[];
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
  isLoadingPrecios,
}: RevisarPrecioComponentProps) {
  // Estados UI
  const [contrasena, setContrasena] = useState<string>('');
  const [isLoadingCiclo, setIsLoadingCiclo] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userData, setUserData] = useState<ValidacionUsuarioResponse | null>(
    null,
  );

  // Estados para los paneles colapsables
  const [isValidacionOpen, setIsValidacionOpen] = useState(true);
  const [isEnelOpen, setIsEnelOpen] = useState(true);
  const [isCicloOpen, setIsCicloOpen] = useState(true);

  // Estados para las filas seleccionadas
  const [selectedEnelRows, setSelectedEnelRows] = useState<string[]>([]);
  const [selectedEnerlovaRows, setSelectedEnerlovaRows] = useState<string[]>(
    [],
  );
  const [isConfirming, setIsConfirming] = useState(false);

  // Verificamos si el periodo está cargando
  const isPeriodoLoading = isLoading;

  // Verificamos si los ciclos están cargando
  const isCiclosLoading = isLoading;

  const handleContrasenaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContrasena(e.target.value);
  };

  const validarUsuario = async () => {
    try {
      const data = {
        contrasena: contrasena,
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      };

      const response = await api.post<ValidacionUsuarioResponse>(
        '/validar-usuario-modificacion',
        data,
        config,
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
          toast.error('Sesión expirada. Serás redirigido al login.');
          // Aquí podrías redirigir al login si es necesario
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
          'No se recibió respuesta del servidor. Verifica tu conexión.',
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
        (item) =>
          selectedEnelRows.includes(item.codigo) &&
          item.indice !== '' &&
          item.confirmacion !== 'Confirmado',
      );

      // Confirmaciones de la tabla Enerlova
      const confirmacionesEnerlova = dataConsultarPreciosDos.filter(
        (item) =>
          selectedEnerlovaRows.includes(item.codigo) &&
          item.indice !== '' &&
          item.confirmacion !== 'Confirmado',
      );

      // Procesar todas las confirmaciones
      let confirmacionesExitosas = 0;
      let confirmacionesFallidas = 0;

      // Procesar confirmaciones Enel
      for (const item of confirmacionesEnel) {
        try {
          const response = await api.post(
            `/ConfirmarPrecio?indice=${item.indice}&usuario=${userData.nombreCompleto}`,
          );

          if (response.status === 200) {
            confirmacionesExitosas++;
          } else {
            confirmacionesFallidas++;
            console.warn(
              `Error al confirmar: ${item.codigo}, status: ${response.status}`,
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
                `Sin permisos para confirmar ${item.codigo}: ${errorMessage}`,
              );
            } else {
              // Error de sesión expirada - detener proceso
              toast.error(
                'Sesión expirada durante el proceso. Reinicia la página.',
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
            `/ConfirmarPrecio?indice=${item.indice}&usuario=${userData.nombreCompleto}`,
          );

          if (response.status === 200) {
            confirmacionesExitosas++;
          } else {
            confirmacionesFallidas++;
            console.warn(
              `Error al confirmar: ${item.codigo}, status: ${response.status}`,
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
                `Sin permisos para confirmar ${item.codigo}: ${errorMessage}`,
              );
            } else {
              // Error de sesión expirada - detener proceso
              toast.error(
                'Sesión expirada durante el proceso. Reinicia la página.',
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
          `Se han confirmado ${confirmacionesExitosas} registros correctamente`,
        );
      } else if (confirmacionesExitosas === 0 && confirmacionesFallidas === 0) {
        toast.info('No había registros pendientes para confirmar');
      }

      if (confirmacionesFallidas > 0) {
        console.warn(
          `Total de confirmaciones fallidas: ${confirmacionesFallidas}`,
        );
        toast.error(
          `No se pudieron confirmar ${confirmacionesFallidas} registros`,
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
      setIsLoadingCiclo(true);
      await onCicloChange(nuevoCiclo);
    } catch (error) {
      console.error('Error al cambiar ciclo:', error);
      toast.error('Error al cambiar el ciclo');
    } finally {
      setIsLoadingCiclo(false);
    }
  };

  // Función para verificar si el ciclo seleccionado es válido para el mes actual
  const esCicloValido = () => {
    if (!dataPeriodoAbierto || dataPeriodoAbierto.length === 0) return true;
    return true; // Ya no hay restricciones para febrero
  };

  // Configurar columnas con las propiedades necesarias
  const configuredColumnsEnel = useMemo(() => {
    return columnsEnel.map((col) => {
      if (col.id === 'acciones') {
        return {
          ...col,
          cell: ({ row }: { row: any }) => {
            return (
              <div className="text-center">
                {row.original.confirmacion === 'Confirmado' ? (
                  <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    Confirmado
                  </Badge>
                ) : row.original.indice === '' ? (
                  <Badge className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800">
                    Inhabilitado
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
          },
        };
      }
      return col;
    });
  }, [isAuthorized, onRecargarPrecios]);

  const configuredColumnsEnerlova = useMemo(() => {
    return columnsEnerlova.map((col) => {
      if (col.id === 'acciones') {
        return {
          ...col,
          cell: ({ row }: { row: any }) => {
            return (
              <div className="text-center">
                {row.original.confirmacion === 'Confirmado' ? (
                  <Badge className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
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
          },
        };
      }
      return col;
    });
  }, [isAuthorized, onRecargarPrecios]);

  // Mostrar error si existe
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950/30">
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
              <AlertCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Error al cargar datos
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Header modernizado */}
      <div className="flex items-center gap-4 border-b border-border/40 pb-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Revisar Precio
          </h1>
          <p className="mt-1 text-muted-foreground">
            Validación y revisión de precios para el período activo
          </p>
        </div>
      </div>

      {/* Validación de Usuario */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <Collapsible open={isValidacionOpen} onOpenChange={setIsValidacionOpen}>
          <div
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsValidacionOpen(!isValidacionOpen)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                  Validación de Usuario
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Autorización para realizar modificaciones de precios
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthorized && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                >
                  ✓ Autorizado
                </Badge>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isValidacionOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <CardContent className="px-6 pb-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2 w-full md:col-span-2">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <KeyIcon className="w-4 h-4" />
                    Contraseña de autorización
                  </Label>
                  <Input
                    type="password"
                    value={contrasena}
                    onChange={handleContrasenaChange}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    placeholder="Ingresa tu contraseña"
                  />
                </div>
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={validarUsuario}
                    disabled={isLoading || !contrasena}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white flex-1"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    {isLoading ? 'Validando...' : 'Autorizar'}
                  </Button>
                </div>
              </div>

              {/* Resumen de selección y botón confirmar */}
              {isAuthorized && (
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        Confirmación de Cambios
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Registros seleccionados:{' '}
                        {selectedEnelRows.length + selectedEnerlovaRows.length}
                      </p>
                    </div>
                    <Button
                      onClick={confirmarCambios}
                      disabled={
                        isConfirming ||
                        !isAuthorized ||
                        (selectedEnelRows.length === 0 &&
                          selectedEnerlovaRows.length === 0)
                      }
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      <AlertCircleIcon className="w-4 h-4 mr-2" />
                      {isConfirming ? 'Procesando...' : 'Confirmar Cambios'}
                    </Button>
                  </div>

                  {/* Detalle de selección */}
                  {(selectedEnelRows.length > 0 ||
                    selectedEnerlovaRows.length > 0) && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          Resumen de selección:
                        </span>
                      </div>
                      <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                        {selectedEnelRows.length > 0 && (
                          <p>
                            • {selectedEnelRows.length} registros en Valores
                            Compañía de Electricidad
                          </p>
                        )}
                        {selectedEnerlovaRows.length > 0 && (
                          <p>
                            • {selectedEnerlovaRows.length} registros en Precios
                            por Ciclo de Facturación
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
              <CardFooter className="bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 py-4 px-6">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {userData.mensaje} - Puede modificar valores pendientes
                  </span>
                </div>
              </CardFooter>
            )}
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Valores Compañía de Electricidad */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <Collapsible open={isEnelOpen} onOpenChange={setIsEnelOpen}>
          <div
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsEnelOpen(!isEnelOpen)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                  Valores Compañía de Electricidad
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Revisión de precios para el período activo
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              >
                <CalendarIcon className="w-3 h-3 mr-1" />
                {isPeriodoLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : dataPeriodoAbierto && dataPeriodoAbierto.length > 0 ? (
                  dataPeriodoAbierto[0].descripcion
                ) : (
                  'Sin período'
                )}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isEnelOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <CardContent className="px-6 pb-6">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                <DataTable
                  columns={configuredColumnsEnel}
                  data={dataConsultarPreciosUno}
                  enableSelection={isAuthorized}
                  selectedRowIds={selectedEnelRows}
                  onRowSelectionChange={setSelectedEnelRows}
                  isLoading={isLoadingPrecios}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Precios por Ciclo de Facturación */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <Collapsible open={isCicloOpen} onOpenChange={setIsCicloOpen}>
          <div
            className="flex justify-between items-center p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
            onClick={() => setIsCicloOpen(!isCicloOpen)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <BarChartIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-slate-100">
                  Precios por Ciclo de Facturación
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Precios de ENERLOVA según ciclo de facturación
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              >
                <ClockIcon className="w-3 h-3 mr-1" />
                Ciclo {cicloSeleccionado}
              </Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isCicloOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500" />
                )}
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <CardContent className="px-6 pb-6 space-y-6">
              {/* Selector de ciclo */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Ciclo de Facturación
                  </Label>
                  {isCiclosLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={cicloSeleccionado}
                      onValueChange={handleCicloChange}
                      disabled={isPeriodoLoading}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Selecciona un ciclo" />
                      </SelectTrigger>
                      <SelectContent>
                        {ciclosFacturacion && ciclosFacturacion.length > 0 ? (
                          ciclosFacturacion.map((ciclo) => (
                            <SelectItem
                              key={ciclo.diaFacturacion}
                              value={ciclo.diaFacturacion}
                            >
                              {ciclo.descripcion}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="15">Ciclo día 15</SelectItem>
                            <SelectItem value="30">Ciclo día 30</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              {/* Tabla de precios Enerlova */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
                <DataTable
                  columns={configuredColumnsEnerlova}
                  data={dataConsultarPreciosDos}
                  enableSelection={isAuthorized}
                  selectedRowIds={selectedEnerlovaRows}
                  onRowSelectionChange={setSelectedEnerlovaRows}
                  isLoading={isLoadingPrecios}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
