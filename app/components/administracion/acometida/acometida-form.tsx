import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  CheckIcon,
  MapPin,
  Building,
  Gauge,
  Zap,
  Save,
  X,
  ChevronDown,
  Search,
  List,
  User,
  Hash,
  FileText,
  Building2,
} from "lucide-react";
import { cn } from "~/lib/utils";
import type {
  Acometida,
  CrearAcometidaProps,
  ActualizarAcometidaProps,
  ComboEmpalmes,
  ComboNichos,
  ContratosDisponibles,
} from "~/types/administracion";
import { ScrollArea } from "~/components/ui/scroll-area";

const acometidaSchema = z.object({
  ubicacion: z.string().min(2, "La ubicación es requerida"),
  empalmeId: z.string().min(1, "Seleccione un empalme"),
  nichoId: z.string().min(1, "Seleccione un nicho"),
  contratoId: z.string().min(1, "Seleccione un contrato"),
  codigo: z.string().min(1, "El código es requerido"),
  limitePotencia: z
    .string()
    .refine((val) => !val || !isNaN(Number(val)), "Debe ser un número válido"),
});

type FormularioAcometida = z.infer<typeof acometidaSchema>;

interface AcometidaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CrearAcometidaProps | ActualizarAcometidaProps
  ) => Promise<void>;
  acometida?: Acometida | null;
  isLoading?: boolean;
  comboEmpalmes: ComboEmpalmes[];
  comboNichos: ComboNichos[];
  contratosDisponibles: ContratosDisponibles[];
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
}: AcometidaFormProps) {
  const isEdit = !!acometida;
  const form = useForm<FormularioAcometida>({
    resolver: zodResolver(acometidaSchema),
    defaultValues: {
      ubicacion: "",
      empalmeId: "",
      nichoId: "",
      contratoId: "",
      codigo: "",
      limitePotencia: "",
    },
  });

  // Estados para los combos y modal
  const [empalmeOpen, setEmpalmeOpen] = useState(false);
  const [nichoOpen, setNichoOpen] = useState(false);
  const [contratoOpen, setContratoOpen] = useState(false);
  const [modalContratos, setModalContratos] = useState(false);
  const [busquedaContrato, setBusquedaContrato] = useState("");

  useEffect(() => {
    if (isEdit && acometida) {
      form.reset({
        ubicacion: acometida.ubicacion || "",
        empalmeId:
          comboEmpalmes.find((e) => e.nombre === acometida.empalmeDescripcion)
            ?.id || "",
        nichoId:
          comboNichos.find((n) => n.nombre === acometida.nichoDescripcion)
            ?.id || "",
        contratoId: acometida.contratoId || "",
        codigo: acometida.codigo || "",
        limitePotencia: acometida.limitePotencia?.toString() || "",
      });
    } else {
      form.reset({
        ubicacion: "",
        empalmeId: "",
        nichoId: "",
        contratoId: "",
        codigo: "",
        limitePotencia: "",
      });
    }
  }, [acometida, isEdit, form, comboEmpalmes, comboNichos]);

  const handleSubmit = async (data: FormularioAcometida) => {
    try {
      if (isEdit && acometida) {
        const submitData: ActualizarAcometidaProps = {
          acometidaId: acometida.acometidaId,
          ubicacion: data.ubicacion,
          empalmeId: Number(data.empalmeId),
          nichoId: Number(data.nichoId),
          contratoId: data.contratoId,
          limitePotencia: Number(data.limitePotencia),
        };
        await onSubmit(submitData);
      } else {
        const submitData: CrearAcometidaProps = {
          ubicacion: data.ubicacion,
          empalmeId: Number(data.empalmeId),
          nichoId: Number(data.nichoId),
          contratoId: data.contratoId,
          codigo: Number(data.codigo),
          limitePotencia: Number(data.limitePotencia),
        };
        await onSubmit(submitData);
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error al guardar acometida:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    setBusquedaContrato("");
    onClose();
  };

  // Filtro de contratos
  const contratosFiltrados = contratosDisponibles.filter((c) => {
    const texto =
      `${c.contratoId} ${c.clienteNombre} ${c.clienteApellidos} ${c.empresa} ${c.local}`.toLowerCase();
    return texto.includes(busquedaContrato.toLowerCase());
  });

  // Obtener contrato seleccionado
  const contratoSeleccionado = contratosDisponibles.find(
    (c) => c.contratoId === form.watch("contratoId")
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="min-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 rounded-xl shadow-sm">
                <Zap className="h-6 w-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-sky-800 to-blue-800 dark:from-sky-200 dark:to-blue-200 bg-clip-text text-transparent">
                  {isEdit ? "Editar Acometida" : "Registrar Nueva Acometida"}
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground mt-1">
                  {isEdit
                    ? "Modifica la información de la acometida seleccionada"
                    : "Completa los datos para registrar una nueva acometida eléctrica"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8"
            >
              {/* Información Básica */}
              <Card className="border-sky-200/50 dark:border-sky-800/50 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-sky-50/80 to-blue-50/80 dark:from-sky-900/20 dark:to-blue-900/20 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    <CardTitle className="text-lg text-sky-800 dark:text-sky-200">
                      Información Básica
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Datos identificativos de la acometida
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Hash className="h-4 w-4" />
                            Código de Acometida *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ingrese el código único"
                              className="h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500/20 transition-all"
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
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <MapPin className="h-4 w-4" />
                            Ubicación Física *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: Pasillo 2, Local 15-A"
                              className="h-11 border-slate-300 focus:border-sky-500 focus:ring-sky-500/20 transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Información de Contrato */}
              <Card className="border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/20 dark:to-green-900/20 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-lg text-emerald-800 dark:text-emerald-200">
                      Información de Contrato
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Selecciona el contrato asociado a esta acometida
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="contratoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contrato *
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setModalContratos(true)}
                                  className="h-8 gap-2 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700"
                                >
                                  <List className="h-4 w-4" />
                                  Ver Todos
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Ver lista completa de contratos
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </FormLabel>

                        <div className="space-y-3">
                          <Popover
                            open={contratoOpen}
                            onOpenChange={setContratoOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={contratoOpen}
                                className={cn(
                                  "w-full h-12 justify-between text-left font-normal border-slate-300 hover:border-sky-400 transition-all",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate">
                                    {field.value
                                      ? `${field.value} - ${contratoSeleccionado?.clienteNombre} ${contratoSeleccionado?.clienteApellidos}`
                                      : "Buscar y seleccionar contrato..."}
                                  </span>
                                </div>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                            >
                              <Command>
                                <div className="flex items-center border-b px-3">
                                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                  <CommandInput
                                    placeholder="Buscar por ID, cliente o empresa..."
                                    className="flex h-11"
                                  />
                                </div>
                                <CommandEmpty className="py-6 text-center text-sm">
                                  No se encontraron contratos.
                                </CommandEmpty>
                                <ScrollArea className="h-64">
                                  <CommandGroup>
                                    {contratosDisponibles
                                      .slice(0, 10)
                                      .map((c) => (
                                        <CommandItem
                                          key={c.contratoId}
                                          value={c.contratoId}
                                          onSelect={(currentValue) => {
                                            form.setValue(
                                              "contratoId",
                                              currentValue
                                            );
                                            setContratoOpen(false);
                                          }}
                                          className="flex items-center justify-between p-3 cursor-pointer"
                                        >
                                          <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              <Badge
                                                variant="secondary"
                                                className="font-mono text-xs"
                                              >
                                                {c.contratoId}
                                              </Badge>
                                              <span className="font-medium">
                                                {c.clienteNombre}{" "}
                                                {c.clienteApellidos}
                                              </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                              <Building2 className="h-3 w-3" />
                                              {c.empresa} • {c.local}
                                            </div>
                                          </div>
                                          {field.value === c.contratoId && (
                                            <CheckIcon className="h-4 w-4 text-emerald-600" />
                                          )}
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </Command>
                            </PopoverContent>
                          </Popover>

                          {/* Información del contrato seleccionado */}
                          {contratoSeleccionado && (
                            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                    Cliente:
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    {contratoSeleccionado.clienteNombre}{" "}
                                    {contratoSeleccionado.clienteApellidos}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                    Empresa:
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    {contratoSeleccionado.empresa}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                    Local:
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    {contratoSeleccionado.local}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium text-emerald-700 dark:text-emerald-300">
                                    Tarifa:
                                  </span>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    {contratoSeleccionado.tarifa}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Configuración Técnica */}
              <Card className="border-amber-200/50 dark:border-amber-800/50 shadow-sm">
                <CardHeader className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/20 dark:to-orange-900/20 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <CardTitle className="text-lg text-amber-800 dark:text-amber-200">
                      Configuración Técnica
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Especificaciones técnicas de la conexión eléctrica
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Empalme */}
                    <FormField
                      control={form.control}
                      name="empalmeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Zap className="h-4 w-4" />
                            Empalme *
                          </FormLabel>
                          <Popover
                            open={empalmeOpen}
                            onOpenChange={setEmpalmeOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={empalmeOpen}
                                className={cn(
                                  "w-full h-11 justify-between font-normal border-slate-300 hover:border-amber-400 transition-all",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <span>
                                  {field.value
                                    ? comboEmpalmes.find(
                                        (e) => e.id === field.value
                                      )?.nombre
                                    : "Seleccionar empalme"}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Buscar empalme..."
                                  className="h-9"
                                />
                                <CommandEmpty>
                                  No se encontraron empalmes.
                                </CommandEmpty>
                                <ScrollArea className="h-48">
                                  <CommandGroup>
                                    {comboEmpalmes.map((e) => (
                                      <CommandItem
                                        key={e.id}
                                        value={e.nombre}
                                        onSelect={() => {
                                          form.setValue("empalmeId", e.id);
                                          setEmpalmeOpen(false);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        {e.nombre}
                                        {field.value === e.id && (
                                          <CheckIcon className="ml-auto h-4 w-4 text-amber-600" />
                                        )}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Nicho */}
                    <FormField
                      control={form.control}
                      name="nichoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Building className="h-4 w-4" />
                            Nicho *
                          </FormLabel>
                          <Popover open={nichoOpen} onOpenChange={setNichoOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={nichoOpen}
                                className={cn(
                                  "w-full h-11 justify-between font-normal border-slate-300 hover:border-amber-400 transition-all",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <span>
                                  {field.value
                                    ? comboNichos.find(
                                        (n) => n.id === field.value
                                      )?.nombre
                                    : "Seleccionar nicho"}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full p-0"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Buscar nicho..."
                                  className="h-9"
                                />
                                <CommandEmpty>
                                  No se encontraron nichos.
                                </CommandEmpty>
                                <ScrollArea className="h-48">
                                  <CommandGroup>
                                    {comboNichos.map((n) => (
                                      <CommandItem
                                        key={n.id}
                                        value={n.nombre}
                                        onSelect={() => {
                                          form.setValue("nichoId", n.id);
                                          setNichoOpen(false);
                                        }}
                                        className="cursor-pointer"
                                      >
                                        {n.nombre}
                                        {field.value === n.id && (
                                          <CheckIcon className="ml-auto h-4 w-4 text-amber-600" />
                                        )}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </ScrollArea>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Límite de Potencia */}
                    <FormField
                      control={form.control}
                      name="limitePotencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Gauge className="h-4 w-4" />
                            Límite de Potencia
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="Ej: 50"
                                className="h-11 pl-10 border-slate-300 focus:border-amber-500 focus:ring-amber-500/20 transition-all"
                                {...field}
                              />
                            </FormControl>
                            <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground font-medium">
                              kW
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Botones de acción */}
              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="gap-2 h-11 px-8"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gap-2 h-11 px-8 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEdit ? "Actualizar Acometida" : "Registrar Acometida"}
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
        <DialogContent className="min-w-7xl max-h-[90vh] overflow-x-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <List className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                  Seleccionar Contrato
                </DialogTitle>
                <DialogDescription>
                  Explore y seleccione el contrato que desea asociar a esta
                  acometida
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ID de contrato, nombre del cliente, empresa o local..."
                value={busquedaContrato}
                onChange={(e) => setBusquedaContrato(e.target.value)}
                className="h-12 pl-10 text-base border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
              />
            </div>

            {/* Tabla de contratos */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-y-auto max-h-[50vh]">
                <Table>
                  <TableHeader className="bg-emerald-50 dark:bg-emerald-900/20">
                    <TableRow>
                      <TableHead className="font-semibold">
                        ID Contrato
                      </TableHead>
                      <TableHead className="font-semibold">Cliente</TableHead>
                      <TableHead className="font-semibold">Empresa</TableHead>
                      <TableHead className="font-semibold">Local</TableHead>
                      <TableHead className="font-semibold">Tarifa</TableHead>
                      <TableHead className="font-semibold text-center">
                        Acción
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contratosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 opacity-50" />
                            <p>
                              No se encontraron contratos con los criterios de
                              búsqueda.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {contratosFiltrados.map((c) => (
                      <TableRow
                        key={c.contratoId}
                        className="hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors"
                      >
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {c.contratoId}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {c.clienteNombre} {c.clienteApellidos}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            {c.empresa}
                          </div>
                        </TableCell>
                        <TableCell>{c.local}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.tarifa}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            onClick={() => {
                              form.setValue("contratoId", c.contratoId);
                              setModalContratos(false);
                              setBusquedaContrato("");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
