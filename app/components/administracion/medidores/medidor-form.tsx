import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Gauge,
  Building,
  Tag,
  Barcode,
  Calendar,
  Hash,
  X,
  Save,
  Activity,
  Zap,
  MapPin,
} from "lucide-react";
import type {
  BuscarMedidores,
  CrearMedidorProps,
  ActualizarMedidorProps,
} from "~/types/administracion";

// Schema para crear medidor
const crearMedidorSchema = z.object({
  marcaId: z.number().min(1, "Debe seleccionar una marca"),
  tipoId: z.number().min(1, "Debe seleccionar un tipo"),
  modelo: z
    .string()
    .min(1, "El modelo es requerido")
    .max(50, "El modelo no puede exceder 50 caracteres"),
  serie: z
    .string()
    .min(1, "La serie es requerida")
    .max(50, "La serie no puede exceder 50 caracteres"),
  estadoId: z.number().min(1, "Debe seleccionar un estado"),
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  digitos: z
    .number()
    .min(1, "Los dígitos deben ser mayor a 0")
    .max(10, "Los dígitos no pueden exceder 10"),
  multiplicar: z.number().min(1, "El multiplicador debe ser mayor a 0"),
  primeraLectura: z.string().min(1, "La primera lectura es requerida"),
  fechaPrimeraLectura: z
    .string()
    .min(1, "La fecha de primera lectura es requerida"),
});

// Schema para actualizar medidor
const actualizarMedidorSchema = z.object({
  codigoMedidor: z.number(),
  marcaId: z.number().min(1, "Debe seleccionar una marca"),
  modelo: z
    .string()
    .min(1, "El modelo es requerido")
    .max(50, "El modelo no puede exceder 50 caracteres"),
  serie: z
    .string()
    .min(1, "La serie es requerida")
    .max(50, "La serie no puede exceder 50 caracteres"),
  estadoId: z.number().min(1, "Debe seleccionar un estado"),
  fechaInicio: z.string().min(1, "La fecha de inicio es requerida"),
  digitos: z
    .number()
    .min(1, "Los dígitos deben ser mayor a 0")
    .max(10, "Los dígitos no pueden exceder 10"),
  multiplicar: z.number().min(1, "El multiplicador debe ser mayor a 0"),
  tipoId: z.number().min(1, "Debe seleccionar un tipo"),
  subempalmeCodigo: z.string().optional(),
  primeraLectura: z.string().min(1, "La primera lectura es requerida"),
  fechaPrimeraLectura: z
    .string()
    .min(1, "La fecha de primera lectura es requerida"),
});

type FormularioData = z.infer<typeof crearMedidorSchema> & {
  codigoMedidor?: number;
  subempalmeCodigo?: string;
};

interface MedidorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearMedidorProps | ActualizarMedidorProps) => Promise<void>;
  medidor?: BuscarMedidores | null;
  isLoading?: boolean;
}

// Datos para dropdowns (placeholder - deberían venir de API)
const marcas = [
  {
    id: 1,
    nombre: "Schneider Electric",
    descripcion: "Marca líder en gestión de energía",
  },
  { id: 2, nombre: "ABB", descripcion: "Tecnología de electrificación" },
  { id: 3, nombre: "Siemens", descripcion: "Soluciones eléctricas avanzadas" },
  { id: 4, nombre: "General Electric", descripcion: "Innovación en medición" },
];

const tipos = [
  { id: 1, nombre: "Monofásico", descripcion: "Una fase" },
  { id: 2, nombre: "Bifásico", descripcion: "Dos fases" },
  { id: 3, nombre: "Trifásico", descripcion: "Tres fases" },
];

const estados = [
  { id: 1, nombre: "Activo", descripcion: "En funcionamiento" },
  { id: 2, nombre: "Inactivo", descripcion: "Fuera de servicio" },
  { id: 3, nombre: "Mantenimiento", descripcion: "En mantenimiento" },
  { id: 4, nombre: "Averiado", descripcion: "Requiere reparación" },
];

export function MedidorForm({
  isOpen,
  onClose,
  onSubmit,
  medidor,
  isLoading = false,
}: MedidorFormProps) {
  const isEdit = !!medidor;

  const form = useForm<FormularioData>({
    resolver: zodResolver(
      isEdit ? actualizarMedidorSchema : crearMedidorSchema
    ),
    defaultValues: {
      marcaId: 0,
      tipoId: 0,
      modelo: "",
      serie: "",
      estadoId: 0,
      fechaInicio: "",
      digitos: 1,
      multiplicar: 1,
      primeraLectura: "",
      fechaPrimeraLectura: "",
      codigoMedidor: undefined,
      subempalmeCodigo: "",
    },
  });

  // Cargar datos del medidor cuando es edición
  useEffect(() => {
    if (isEdit && medidor) {
      // Como no tenemos todos los IDs, usamos valores placeholder
      form.reset({
        codigoMedidor: medidor.codigo,
        marcaId: 1, // Placeholder - debería mapear desde medidor.marca
        tipoId: 1, // Placeholder - debería mapear desde medidor.tipo
        modelo: medidor.modelo,
        serie: medidor.serie,
        estadoId: 1, // Placeholder - debería mapear desde medidor.estado
        fechaInicio: medidor.fechaInicio,
        digitos: medidor.digitos,
        multiplicar: medidor.multiplicar,
        primeraLectura: "", // No disponible en BuscarMedidores
        fechaPrimeraLectura: medidor.fechaInicio, // Usar fechaInicio como placeholder
        subempalmeCodigo: medidor.codigoAcometida || "",
      });
    } else {
      form.reset({
        marcaId: 0,
        tipoId: 0,
        modelo: "",
        serie: "",
        estadoId: 0,
        fechaInicio: "",
        digitos: 1,
        multiplicar: 1,
        primeraLectura: "",
        fechaPrimeraLectura: "",
        codigoMedidor: undefined,
        subempalmeCodigo: "",
      });
    }
  }, [medidor, isEdit, form]);

  const handleSubmit = async (data: FormularioData) => {
    try {
      if (isEdit) {
        const submitData: ActualizarMedidorProps = {
          codigoMedidor: data.codigoMedidor!,
          marcaId: data.marcaId,
          modelo: data.modelo,
          serie: data.serie,
          estadoId: data.estadoId,
          fechaInicio: data.fechaInicio,
          digitos: data.digitos,
          multiplicar: data.multiplicar,
          tipoId: data.tipoId,
          subempalmeCodigo: data.subempalmeCodigo || "",
          primeraLectura: data.primeraLectura,
          fechaPrimeraLectura: data.fechaPrimeraLectura,
        };
        await onSubmit(submitData);
      } else {
        const submitData: CrearMedidorProps = {
          marcaId: data.marcaId,
          tipoId: data.tipoId,
          modelo: data.modelo,
          serie: data.serie,
          estadoId: data.estadoId,
          fechaInicio: data.fechaInicio,
          digitos: data.digitos,
          multiplicar: data.multiplicar,
          primeraLectura: data.primeraLectura,
          fechaPrimeraLectura: data.fechaPrimeraLectura,
        };
        await onSubmit(submitData);
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error al guardar medidor:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
              <Gauge className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-sky-800 dark:text-sky-200">
                {isEdit ? "Editar Medidor" : "Crear Nuevo Medidor"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isEdit
                  ? "Modifica la información del medidor seleccionado"
                  : "Completa los datos para crear un nuevo medidor"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 pt-4"
          >
            {/* Información del Medidor */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <Gauge className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                  Información del Medidor
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="marcaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Marca *
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20">
                            <SelectValue placeholder="Selecciona una marca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {marcas.map((marca) => (
                            <SelectItem
                              key={marca.id}
                              value={marca.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-blue-600" />
                                <div>
                                  <div className="font-medium">
                                    {marca.nombre}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {marca.descripcion}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Tipo *
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20">
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipos.map((tipo) => (
                            <SelectItem
                              key={tipo.id}
                              value={tipo.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-purple-600" />
                                <div>
                                  <div className="font-medium">
                                    {tipo.nombre}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {tipo.descripcion}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Modelo *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Ingrese el modelo"
                            className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Serie *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Ingrese la serie"
                            className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estadoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Estado *
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20">
                            <SelectValue placeholder="Selecciona un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estados.map((estado) => (
                            <SelectItem
                              key={estado.id}
                              value={estado.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-emerald-600" />
                                <div>
                                  <div className="font-medium">
                                    {estado.nombre}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {estado.descripcion}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Fecha de Inicio *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Configuración Técnica */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <Hash className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                  Configuración Técnica
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="digitos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Dígitos *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            placeholder="Número de dígitos"
                            className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="multiplicar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Multiplicador *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <X className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="1"
                            placeholder="Factor multiplicador"
                            className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 1)
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEdit && (
                <FormField
                  control={form.control}
                  name="subempalmeCodigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Código Subempalme
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Código del subempalme"
                            className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Primera Lectura */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                  Primera Lectura
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primeraLectura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Valor Primera Lectura *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Valor de la primera lectura"
                            className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaPrimeraLectura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Fecha Primera Lectura *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            className="pl-10 border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
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
              <Button
                type="submit"
                disabled={isLoading}
                className="gap-2 bg-sky-600 hover:bg-sky-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEdit ? "Actualizar Medidor" : "Crear Medidor"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
