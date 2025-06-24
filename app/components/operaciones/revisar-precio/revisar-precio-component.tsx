import React, { useState, useMemo } from 'react';
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

      if (error.response?.status === 401) {
        toast.error('Usuario de la sesión no disponible.');
        return;
      }

      if (error.response) {
        toast.error(
          `Error ${error.response.status}: ${
            error.response.data?.mensaje || 'Error en la validación'
          }`,
        );
      } else if (error.request) {
        toast.error('No se recibió respuesta del servidor');
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
        } catch (error) {
          console.error(`Error al confirmar precio ${item.codigo}:`, error);
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
        } catch (error) {
          console.error(`Error al confirmar precio ${item.codigo}:`, error);
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

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
          Revisar Precio
        </h1>
        <p className="text-muted-foreground">
          Validación y revisión de precios para el periodo activo
        </p>
      </div>

      {/* Validación de Usuario */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isValidacionOpen} onOpenChange={setIsValidacionOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border shadow-sm">
                  <LockIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Validación de Usuario
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Ingresa tu contraseña para permitir modificaciones
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsValidacionOpen(!isValidacionOpen);
                }}
              >
                {isValidacionOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="sr-only">Abrir/Cerrar validación</span>
              </Button>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 md:p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <KeyIcon className="h-3.5 w-3.5" /> Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={contrasena}
                      onChange={handleContrasenaChange}
                      className="bg-background border-border/70 pl-10"
                      placeholder="Ingresa tu contraseña"
                    />
                    <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={validarUsuario}
                    disabled={isLoading || !contrasena}
                    className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                    size="sm"
                  >
                    <CheckCircleIcon className="h-4 w-4" />
                    {isLoading ? 'Validando...' : 'Permitir Modificación'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmarCambios}
                    disabled={
                      isConfirming ||
                      !isAuthorized ||
                      (selectedEnelRows.length === 0 &&
                        selectedEnerlovaRows.length === 0)
                    }
                    size="sm"
                    className="gap-2"
                  >
                    <AlertCircleIcon className="h-4 w-4" />
                    {isConfirming ? 'Procesando...' : 'Confirmar'}
                  </Button>
                </div>
              </div>

              {/* Resumen de selección */}
              {isAuthorized &&
                (selectedEnelRows.length > 0 ||
                  selectedEnerlovaRows.length > 0) && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                      Resumen de selección:
                    </p>
                    <div className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      {selectedEnelRows.length > 0 && (
                        <p>
                          - {selectedEnelRows.length} registros seleccionados en
                          Valores Compañía de Electricidad
                        </p>
                      )}
                      {selectedEnerlovaRows.length > 0 && (
                        <p>
                          - {selectedEnerlovaRows.length} registros
                          seleccionados en Precios por Ciclo de Facturación
                        </p>
                      )}
                    </div>
                  </div>
                )}
            </CardContent>
            {isAuthorized && userData && (
              <CardFooter className="bg-emerald-50 dark:bg-emerald-900/20 border-t border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 py-3 px-6 flex flex-col items-start gap-1">
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
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isEnelOpen} onOpenChange={setIsEnelOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg shadow-sm">
                  <DollarSignIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Valores Compañía de Electricidad
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Revisión de precios para el periodo activo
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-muted/50 text-muted-foreground text-sm rounded-md flex items-center gap-2 border border-border/60">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {isPeriodoLoading ? (
                    <Skeleton className="h-5 w-28" />
                  ) : (
                    <span className="font-medium">
                      {dataPeriodoAbierto && dataPeriodoAbierto.length > 0
                        ? dataPeriodoAbierto[0].descripcion
                        : 'No hay periodo activo'}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEnelOpen(!isEnelOpen);
                  }}
                >
                  {isEnelOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Abrir/Cerrar tabla</span>
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 md:p-6">
              <DataTable
                columns={configuredColumnsEnel}
                data={dataConsultarPreciosUno}
                enableSelection={isAuthorized}
                selectedRowIds={selectedEnelRows}
                onRowSelectionChange={setSelectedEnelRows}
                isLoading={isLoadingPrecios}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Precios por Ciclo de Facturación */}
      <Card className="shadow-sm border border-border/60">
        <Collapsible open={isCicloOpen} onOpenChange={setIsCicloOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg shadow-sm">
                  <BarChartIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Precios por Ciclo de Facturación
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Consulta los precios de ENERLOVA según el ciclo de
                    facturación
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-muted/50 text-muted-foreground text-sm rounded-md flex items-center gap-2 border border-border/60">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {dataPeriodoAbierto[0]?.descripcion ||
                      'No hay periodo activo'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCicloOpen(!isCicloOpen);
                  }}
                >
                  {isCicloOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Abrir/Cerrar ciclo</span>
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="p-4 md:p-6 space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-1.5 grow">
                  <Label
                    htmlFor="ciclo"
                    className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> Ciclo de Facturación
                  </Label>
                  {isCiclosLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      value={cicloSeleccionado}
                      onValueChange={handleCicloChange}
                      disabled={isPeriodoLoading}
                    >
                      <SelectTrigger
                        id="ciclo"
                        className="bg-background border-border/70"
                      >
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
              <DataTable
                columns={configuredColumnsEnerlova}
                data={dataConsultarPreciosDos}
                enableSelection={isAuthorized}
                selectedRowIds={selectedEnerlovaRows}
                onRowSelectionChange={setSelectedEnerlovaRows}
                isLoading={isLoadingPrecios}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
