import { Building2, List, Save, Search, User, X, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { toast } from "sonner";

import { getReactSelectStyles } from "~/components/shared/react-select-styles";
import { useTheme } from "~/components/theme-provider";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type {
  AcometidaProps,
  AcometidaRow,
  BuscarContratosLibres,
  Empalmes,
  Nichos,
  Sectores,
} from "~/types/administracion";

// Tipos para las opciones de react-select
interface SelectOption {
  value: string;
  label: string;
}

// Interface principal del componente
interface AcometidaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AcometidaProps | AcometidaProps) => Promise<void>;
  acometida?: AcometidaRow | null;
  isLoading?: boolean;
  comboEmpalmes: Empalmes[];
  comboNichos: Nichos[];
  contratosDisponibles: BuscarContratosLibres[];
  comboSectores: Sectores[];
}

export function AcometidaForm({
  isOpen,
  onClose,
  onSubmit,
  acometida,
  isLoading = false,
  comboEmpalmes,
  comboNichos,
  contratosDisponibles,
}: Readonly<AcometidaFormProps>) {
  // Hooks
  const { theme } = useTheme();
  const isEdit = !!acometida;

  // Estados
  const [modalContratos, setModalContratos] = useState(false);
  const [busquedaContrato, setBusquedaContrato] = useState("");

  // Formulario
  const form = useForm({
    defaultValues: {
      ubicacion: "",
      empalmeId: "",
      nichoId: "",
      contratoId: "",
      codigo: "",
      limitePotencia: "",
    },
  });

  // Preparar opciones para react-select
  const empalmeOptions: SelectOption[] = comboEmpalmes.map((empalme) => ({
    value: empalme.id,
    label: empalme.descripcion,
  }));

  const nichoOptions: SelectOption[] = comboNichos.map((nicho) => ({
    value: nicho.id,
    label: nicho.descripcion,
  }));

  // Verificar si el contrato actual está disponible
  const contratoActualDisponible = useMemo(() => {
    if (!isEdit || !acometida?.contratoId) return null;

    return contratosDisponibles.find(
      (c) => c.idContrato === acometida.contratoId,
    );
  }, [isEdit, acometida, contratosDisponibles]);

  // Usar estilos compartidos para react-select
  const selectStyles = getReactSelectStyles(theme);

  // Datos derivados
  const contratosFiltrados = contratosDisponibles.filter((c) => {
    const texto =
      `${c.idContrato} ${c.cliente} ${c.apellido} ${c.empresa} ${c.local}`.toLowerCase();
    return texto.includes(busquedaContrato.toLowerCase());
  });

  const empalmeSeleccionado = comboEmpalmes.find(
    (e) => e.id === form.watch("empalmeId"),
  );

  // Effect para valores por defecto
  useEffect(() => {
    if (isEdit && acometida) {
      const empalmeId =
        comboEmpalmes.find((e) => e.descripcion === acometida.empalme)?.id ||
        "";
      const nichoId =
        comboNichos.find((n) => n.descripcion === acometida.nicho)?.id || "";

      // Siempre establecer el contratoId original, independientemente de si está en la lista
      const contratoId = acometida.contratoId || "";

      form.reset({
        ubicacion: acometida.ubicacion || "",
        empalmeId,
        nichoId,
        contratoId,
        codigo: acometida.codigo || "",
        limitePotencia: acometida.limitePotencia || "0",
      });
    } else {
      form.reset({
        ubicacion: "",
        empalmeId: "",
        nichoId: "",
        contratoId: "",
        codigo: "",
        limitePotencia: "0",
      });
    }
  }, [
    acometida,
    isEdit,
    form,
    comboEmpalmes,
    comboNichos,
    contratosDisponibles,
  ]);

  // Helper functions
  const validateFormData = (data: any) => {
    const empalmeId = Number(data.empalmeId);
    const nichoId = Number(data.nichoId);
    const codigo = data.codigo.trim();
    const limitePotencia = data.limitePotencia
      ? Number(data.limitePotencia)
      : 0;
    const contratoId = data.contratoId.trim();

    if (Number.isNaN(empalmeId) || empalmeId <= 0) {
      toast.error("Empalme no válido");
      return null;
    }
    if (Number.isNaN(nichoId) || nichoId <= 0) {
      toast.error("Nicho no válido");
      return null;
    }
    if (codigo.length === 0) {
      toast.error("Código de acometida no válido");
      return null;
    }
    if (Number.isNaN(limitePotencia) || limitePotencia < 0) {
      toast.error("Límite de potencia no válido");
      return null;
    }
    // El contrato es opcional para nuevas acometidas

    const contratoIdFinal = isEdit
      ? contratoId || acometida?.contratoId || ""
      : contratoId;

    return { empalmeId, nichoId, codigo, limitePotencia, contratoIdFinal };
  };

  const handleError = (error: any) => {
    if (error.response?.status === 400) {
      const errorMessage =
        error.response?.data?.message || "Datos inválidos enviados al servidor";
      toast.error(`Error de validación: ${errorMessage}`);
    } else if (error.response?.status === 500) {
      toast.error("Error interno del servidor");
    } else {
      toast.error("Error al guardar la acometida");
    }
  };

  // Handlers
  const handleSubmit = async (data: any) => {
    try {
      const validated = validateFormData(data);
      if (!validated) return;

      const { empalmeId, nichoId, codigo, limitePotencia, contratoIdFinal } =
        validated;

      if (isEdit && acometida) {
        const submitData: AcometidaProps = {
          codigo: acometida.idAcometida.toString(), // Mantener el código original en modo edición
          ubicacion: data.ubicacion.trim(),
          idEmpalme: empalmeId,
          idNicho: nichoId,
          idContrato: contratoIdFinal,
          limitePotencia: String(limitePotencia),
        };
        await onSubmit(submitData);
      } else {
        const submitData: AcometidaProps = {
          ubicacion: data.ubicacion.trim(),
          idEmpalme: empalmeId,
          idNicho: nichoId,
          idContrato: contratoIdFinal,
          codigo,
          limitePotencia: String(limitePotencia),
        };
        await onSubmit(submitData);
      }

      form.reset();
      onClose();
    } catch (error: any) {
      handleError(error);
    }
  };

  const handleClose = () => {
    form.reset();
    setBusquedaContrato("");
    onClose();
  };

  const handleSelectContrato = (contratoId: string) => {
    form.setValue("contratoId", contratoId);
    setModalContratos(false);
    setBusquedaContrato("");

    // Mostrar mensaje de confirmación
    const contrato = contratosDisponibles.find(
      (c) => c.idContrato === contratoId,
    );
    if (contrato) {
      toast.success("Contrato seleccionado correctamente", {
        description: `${contrato.cliente} ${contrato.apellido} - ${contrato.empresa}`,
        duration: 4200,
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="min-w-[70vw] max-h-[95vh] min-h-[80vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {isEdit ? "Editar Acometida" : "Nueva Acometida"}
                </DialogTitle>
                <DialogDescription>
                  {isEdit
                    ? "Modifica la información de la acometida"
                    : "Completa los datos para registrar una nueva acometida"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold pb-3 border-b border-slate-200 dark:border-slate-600">
                  📋 Información Básica
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Código de Acometida *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Código único"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ubicacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Ubicación Física *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Pasillo 2, Local 15-A"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contrato */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold pb-3 border-b border-slate-200 dark:border-slate-600">
                  📄 Contrato Asociado
                </h3>

                {/* Campo de contrato mejorado */}
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="contratoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Contrato
                        </FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              placeholder="ID del contrato (ej: CON-12345)"
                              className="h-12 text-base flex-1"
                              value={field.value}
                              onChange={field.onChange}
                              readOnly={
                                isEdit &&
                                !contratoActualDisponible &&
                                form.getValues("contratoId") ===
                                  acometida?.contratoId
                              }
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setModalContratos(true)}
                              className="h-12 px-4 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            >
                              <Search className="h-4 w-4" />
                              Buscar
                            </Button>
                          </div>
                        </FormControl>
                        <p className="text-xs">
                          💡 Escriba el ID del contrato o use "Buscar" para
                          explorar la lista completa
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEdit &&
                    !contratoActualDisponible &&
                    form.watch("contratoId") === acometida?.contratoId && (
                      <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                        <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded-full mt-0.5">
                          <svg
                            className="h-3 w-3 text-amber-600 dark:text-amber-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                            Contrato actual no visible en lista de disponibles
                          </p>
                          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                            El contrato "{acometida?.contratoId}" está asignado
                            actualmente. Si lo cambia, no podrá volver a
                            seleccionarlo desde la lista.
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                {/* Información del contrato seleccionado - buscar por ID */}
                {(() => {
                  const contratoEncontrado = contratosDisponibles.find(
                    (c) => c.idContrato === form.watch("contratoId"),
                  );
                  if (!contratoEncontrado) return null;

                  return (
                    <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-900/10 border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          Contrato verificado
                        </span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {contratoEncontrado.idContrato}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                        <div>
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">
                            Cliente:
                          </span>
                          <p className="">
                            {contratoEncontrado.cliente || "No disponible"}{" "}
                            {contratoEncontrado.apellido || ""}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">
                            Empresa:
                          </span>
                          <p className="">
                            {contratoEncontrado.empresa || "No disponible"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">
                            Local:
                          </span>
                          <p className="">
                            {contratoEncontrado.local || "No disponible"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">
                            Tarifa:
                          </span>
                          <p className="">
                            {contratoEncontrado.tarifa || "No disponible"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Configuración Técnica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold pb-3 border-b border-slate-200 dark:border-slate-600">
                  ⚡ Configuración Técnica
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="empalmeId"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Empalme *
                        </FormLabel>
                        <Select
                          {...field}
                          options={empalmeOptions}
                          styles={selectStyles}
                          placeholder="Seleccionar empalme"
                          isSearchable
                          value={
                            empalmeOptions.find(
                              (option) => option.value === value,
                            ) || null
                          }
                          onChange={(option) => onChange(option?.value || "")}
                          noOptionsMessage={() => "No se encontraron empalmes"}
                          menuPlacement="auto"
                          maxMenuHeight={280}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nichoId"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Nicho *
                        </FormLabel>
                        <Select
                          {...field}
                          options={nichoOptions}
                          styles={selectStyles}
                          placeholder="Seleccionar nicho"
                          isSearchable
                          value={
                            nichoOptions.find(
                              (option) => option.value === value,
                            ) || null
                          }
                          onChange={(option) => onChange(option?.value || "")}
                          noOptionsMessage={() => "No se encontraron nichos"}
                          menuPlacement="auto"
                          maxMenuHeight={280}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="limitePotencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Límite Potencia (kW)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: 50"
                            className="h-12 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Información del empalme seleccionado */}
                {empalmeSeleccionado && (
                  <div className="p-3 bg-sky-50 dark:bg-sky-900/10 rounded-xl border">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium text-sky-700 dark:text-sky-300">
                        Empalme seleccionado:
                      </span>
                      <Badge
                        variant="outline"
                        className="text-sky-700 dark:text-sky-300"
                      >
                        {empalmeSeleccionado.descripcion}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-600">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-xl border-2 border-white border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEdit ? "Actualizar Acometida" : "Crear Acometida"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección de Contratos */}
      <Dialog open={modalContratos} onOpenChange={setModalContratos}>
        <DialogContent className="min-w-[95vw] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <List className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Seleccionar Contrato
                </DialogTitle>
                <DialogDescription>
                  Explore y seleccione el contrato que desea asociar
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 overflow-auto">
            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID, cliente, empresa o local..."
                value={busquedaContrato}
                onChange={(e) => setBusquedaContrato(e.target.value)}
                className="h-11 pl-10"
              />
            </div>

            {/* Tabla de contratos con scroll horizontal */}
            <div className="border rounded-xl bg-background h-[50vh] overflow-hidden">
              <div className="h-full overflow-auto">
                <Table className="min-w-[800px] relative">
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="min-w-[140px]">
                        ID Contrato
                      </TableHead>
                      <TableHead className="min-w-[200px]">Cliente</TableHead>
                      <TableHead className="min-w-[180px]">Empresa</TableHead>
                      <TableHead className="min-w-[120px]">Local</TableHead>
                      <TableHead className="min-w-[100px]">Tarifa</TableHead>
                      <TableHead className="text-center min-w-[120px] sticky right-0 bg-muted/50 z-20">
                        Acción
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contratosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-12 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-background rounded-full">
                              <Search className="h-8 w-8 opacity-50" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium">
                                No se encontraron contratos
                              </p>
                              <p className="text-sm">
                                {busquedaContrato
                                  ? `No hay resultados para "${busquedaContrato}"`
                                  : "Escriba en el campo de búsqueda para filtrar contratos"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {contratosFiltrados.map((c) => (
                      <TableRow
                        key={c.idContrato}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {c.idContrato}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="truncate">
                                {c.cliente} {c.apellido}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            <p className="truncate">{c.empresa}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="truncate">{c.local}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {c.tarifa}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center sticky right-0 bg-background z-20">
                          <Button
                            size="sm"
                            onClick={() => handleSelectContrato(c.idContrato)}
                            className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3 text-xs"
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Información de resultados */}
              {contratosFiltrados.length > 0 && (
                <div className="px-4 py-2 bg-background border-t text-xs text-muted-foreground flex justify-between items-center">
                  <span>
                    Mostrando {contratosFiltrados.length} de{" "}
                    {contratosDisponibles.length} contratos
                  </span>
                  <span className="hidden sm:inline">
                    💡 Desplácese horizontalmente para ver más columnas
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
