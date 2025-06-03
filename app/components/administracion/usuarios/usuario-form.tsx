import React, { useEffect } from "react";
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
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  User,
  Lock,
  Shield,
  Building,
  UserCheck,
  UserX,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import type {
  Usuarios,
  CrearUsuarioProps,
  ActualizarUsuarioProps,
} from "~/types/administracion";

// Schema para crear usuario
const crearUsuarioSchema = z.object({
  nombreDeUsuario: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres"),
  contrasena: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña no puede exceder 100 caracteres"),
  perfilId: z.number().min(1, "Debe seleccionar un perfil"),
  nombres: z
    .string()
    .min(2, "Los nombres son requeridos")
    .max(100, "Los nombres no pueden exceder 100 caracteres"),
  apellidos: z
    .string()
    .min(2, "Los apellidos son requeridos")
    .max(100, "Los apellidos no pueden exceder 100 caracteres"),
  departamento: z.number().min(1, "Debe seleccionar un departamento"),
  activo: z.boolean(),
});

// Schema para actualizar usuario
const actualizarUsuarioSchema = z.object({
  nombreDeUsuario: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario no puede exceder 50 caracteres"),
  contrasena: z.string().min(1, "La contraseña actual es requerida"),
  nuevaContrasena: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6,
      "La nueva contraseña debe tener al menos 6 caracteres"
    ),
  nombres: z
    .string()
    .min(2, "Los nombres son requeridos")
    .max(100, "Los nombres no pueden exceder 100 caracteres"),
  apellidos: z
    .string()
    .min(2, "Los apellidos son requeridos")
    .max(100, "Los apellidos no pueden exceder 100 caracteres"),
  departamento: z.number().min(1, "Debe seleccionar un departamento"),
  activo: z.boolean(),
});

type FormularioData = z.infer<typeof crearUsuarioSchema>;

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearUsuarioProps | ActualizarUsuarioProps) => Promise<void>;
  usuario?: Usuarios | null;
  isLoading?: boolean;
}

// Datos para perfiles y departamentos
const perfiles = [
  {
    id: 1,
    nombre: "Administrador",
    descripcion: "Acceso completo al sistema",
    icon: "👑",
  },
  {
    id: 2,
    nombre: "Usuario",
    descripcion: "Acceso básico al sistema",
    icon: "👤",
  },
  {
    id: 3,
    nombre: "Operador",
    descripcion: "Acceso a operaciones",
    icon: "⚙️",
  },
  {
    id: 4,
    nombre: "Supervisor",
    descripcion: "Acceso de supervisión",
    icon: "👁️",
  },
];

const departamentos = [
  { id: 1, nombre: "Administración", icon: "🏢" },
  { id: 2, nombre: "Operaciones", icon: "⚡" },
  { id: 3, nombre: "Comercial", icon: "💼" },
  { id: 4, nombre: "Sistemas", icon: "💻" },
  { id: 5, nombre: "Contabilidad", icon: "📊" },
];

export function UsuarioForm({
  isOpen,
  onClose,
  onSubmit,
  usuario,
  isLoading = false,
}: UsuarioFormProps) {
  const isEdit = !!usuario;
  const [showPassword, setShowPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  const form = useForm<FormularioData>({
    resolver: zodResolver(
      isEdit ? actualizarUsuarioSchema : crearUsuarioSchema
    ),
    defaultValues: {
      nombreDeUsuario: "",
      contrasena: "",
      nuevaContrasena: "",
      perfilId: 0,
      nombres: "",
      apellidos: "",
      departamento: 0,
      activo: true,
    },
  });

  // Cargar datos del usuario cuando es edición
  useEffect(() => {
    if (isEdit && usuario) {
      form.reset({
        nombreDeUsuario: usuario.nombreDeUsuario,
        contrasena: "",
        nuevaContrasena: "",
        perfilId: usuario.perfilId,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        departamento: usuario.departamento,
        activo: usuario.activo,
      });
    } else {
      form.reset({
        nombreDeUsuario: "",
        contrasena: "",
        nuevaContrasena: "",
        perfilId: 0,
        nombres: "",
        apellidos: "",
        departamento: 0,
        activo: true,
      });
    }
  }, [usuario, isEdit, form]);

  const handleSubmit = async (data: FormularioData) => {
    try {
      if (isEdit) {
        const submitData: ActualizarUsuarioProps = {
          nombreDeUsuario: data.nombreDeUsuario,
          contrasena: data.contrasena,
          nuevaContrasena: data.nuevaContrasena,
          nombres: data.nombres,
          apellidos: data.apellidos,
          departamento: data.departamento,
          activo: data.activo,
        };
        await onSubmit(submitData);
      } else {
        const submitData: CrearUsuarioProps = {
          nombreDeUsuario: data.nombreDeUsuario,
          contrasena: data.contrasena,
          perfilId: data.perfilId,
          nombres: data.nombres,
          apellidos: data.apellidos,
          departamento: data.departamento,
          activo: data.activo,
        };
        await onSubmit(submitData);
      }
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
              <User className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-sky-800 dark:text-sky-200">
                {isEdit ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isEdit
                  ? "Modifica la información del usuario seleccionado"
                  : "Completa los datos para crear un nuevo usuario"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 pt-4"
          >
            {/* Información Personal */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <User className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                  Información Personal
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Nombres *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese los nombres"
                          className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apellidos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Apellidos *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese los apellidos"
                          className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Información de Acceso */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <Lock className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                  Información de Acceso
                </h3>
              </div>

              <FormField
                control={form.control}
                name="nombreDeUsuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Nombre de Usuario *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese el nombre de usuario"
                        className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contrasena"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {isEdit ? "Contraseña Actual *" : "Contraseña *"}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={
                              isEdit
                                ? "Contraseña actual"
                                : "Ingrese la contraseña"
                            }
                            className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEdit && (
                  <FormField
                    control={form.control}
                    name="nuevaContrasena"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Nueva Contraseña (opcional)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? "text" : "password"}
                              placeholder="Nueva contraseña"
                              className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20 pr-10"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Configuración del Sistema */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/20">
                <Shield className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">
                  Configuración del Sistema
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="perfilId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Perfil de Usuario *
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20">
                              <SelectValue placeholder="Selecciona un perfil" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {perfiles.map((perfil) => (
                              <SelectItem
                                key={perfil.id}
                                value={perfil.id.toString()}
                              >
                                <div className="flex items-center gap-2">
                                  <span>{perfil.icon}</span>
                                  <div>
                                    <div className="font-medium">
                                      {perfil.nombre}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {perfil.descripcion}
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
                )}

                <FormField
                  control={form.control}
                  name="departamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Departamento *
                      </FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="border-border/60 focus:border-sky-400 focus:ring-sky-400/20">
                            <SelectValue placeholder="Selecciona un departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departamentos.map((depto) => (
                            <SelectItem
                              key={depto.id}
                              value={depto.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <span>{depto.icon}</span>
                                <span className="font-medium">
                                  {depto.nombre}
                                </span>
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

              <FormField
                control={form.control}
                name="activo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/60 p-4 bg-muted/30">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium text-slate-700 dark:text-slate-300">
                        Estado del Usuario
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value
                          ? "El usuario puede acceder al sistema"
                          : "El usuario no puede acceder al sistema"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={field.value ? "default" : "secondary"}
                        className={`text-xs font-medium ${
                          field.value
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-rose-100 text-rose-800 border-rose-200"
                        }`}
                      >
                        {field.value ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </Badge>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
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
                    {isEdit ? "Actualizar Usuario" : "Crear Usuario"}
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
