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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type {
  Usuarios,
  CrearUsuarioProps,
  ActualizarUsuarioProps,
} from "~/types/administracion";

// Schema unificado para el formulario
const formularioSchema = z.object({
  nombreDeUsuario: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  contrasena: z.string().min(1, "La contraseña es requerida"),
  nuevaContrasena: z.string().optional(),
  perfilId: z.number().min(1, "Debe seleccionar un perfil"),
  nombres: z.string().min(2, "Los nombres son requeridos"),
  apellidos: z.string().min(2, "Los apellidos son requeridos"),
  departamento: z.number().min(1, "Debe seleccionar un departamento"),
  activo: z.boolean(),
});

type FormularioData = z.infer<typeof formularioSchema>;

interface UsuarioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CrearUsuarioProps | ActualizarUsuarioProps) => Promise<void>;
  usuario?: Usuarios | null;
  isLoading?: boolean;
}

// Mock data para perfiles y departamentos - reemplaza con datos reales
const perfiles = [
  { id: 1, nombre: "Administrador" },
  { id: 2, nombre: "Usuario" },
  { id: 3, nombre: "Operador" },
];

const departamentos = [
  { id: 1, nombre: "Administración" },
  { id: 2, nombre: "Operaciones" },
  { id: 3, nombre: "Comercial" },
];

export function UsuarioForm({
  isOpen,
  onClose,
  onSubmit,
  usuario,
  isLoading = false,
}: UsuarioFormProps) {
  const isEdit = !!usuario;
  // Usar diferentes schemas según si es creación o edición
  const form = useForm<FormularioData>({
    resolver: zodResolver(formularioSchema),
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
        contrasena: "", // Contraseña actual vacía
        nuevaContrasena: "", // Nueva contraseña vacía
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
        // Para actualización: usar ActualizarUsuarioProps
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
        // Para creación: usar CrearUsuarioProps
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
      onClose();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar Usuario" : "Crear Usuario"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nombreDeUsuario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de Usuario</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ingrese el nombre de usuario"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />{" "}
            <FormField
              control={form.control}
              name="contrasena"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEdit ? "Contraseña Actual" : "Contraseña"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEdit
                          ? "Ingrese la contraseña actual"
                          : "Ingrese la contraseña"
                      }
                      {...field}
                    />
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
                    <FormLabel>Nueva Contraseña (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Dejar vacío para mantener actual"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="nombres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese los nombres" {...field} />
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
                  <FormLabel>Apellidos</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese los apellidos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="perfilId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfil</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un perfil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {perfiles.map((perfil) => (
                        <SelectItem
                          key={perfil.id}
                          value={perfil.id.toString()}
                        >
                          {perfil.nombre}
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
              name="departamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un departamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departamentos.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.nombre}
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
              name="activo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Usuario Activo</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
