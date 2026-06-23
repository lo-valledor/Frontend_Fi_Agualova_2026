import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import Select from "react-select";
import { toast } from "sonner";
import { z } from "zod";

import { ModernHeader } from "~/components/shared/modern-header";
import { getReactSelectStyles } from "~/components/shared/react-select-styles";
import { useTheme } from "~/components/theme-provider";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import api from "~/lib/api";
import { administracionService } from "~/services/administracionService";
import type { NombreComuna, NombreGiro } from "~/types/administracion";
import { formatRut, isValidRut, isValidRutFormat } from "~/utils/rut-utils";

const createClienteSchema = (existingClients: string[]) =>
  z.object({
    rut: z
      .string()
      .min(1, "El RUT es requerido")
      .refine(isValidRutFormat, {
        message: "El RUT debe tener el formato 12345678-9",
      })
      .refine(isValidRut, {
        message: "El dígito verificador del RUT no corresponde",
      })
      .refine(
        (rut) => {
          return !existingClients.includes(rut);
        },
        {
          message: "Este RUT ya está registrado en el sistema",
        },
      ),
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().optional(),
    esEmpresa: z.boolean(),
    direccion: z.string().min(1, "La dirección es requerida"),
    codComuna: z.string().min(1, "La comuna es requerida"),
    contacto: z.string().min(1, "El contacto es requerido"),
    telefono: z.string().optional(),
    correo: z
      .string()
      .email("Debe ser un correo válido")
      .optional()
      .or(z.literal("")),
    codigoGiro: z.string().min(1, "El código de giro es requerido"),
  });

type ClienteFormData = z.infer<ReturnType<typeof createClienteSchema>>;

export default function CrearClienteComponent() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [giros, setGiros] = useState<NombreGiro[]>([]);
  const [comunas, setComunas] = useState<NombreComuna[]>([]);
  const [existingClients, setExistingClients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rutValidationStatus, setRutValidationStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");

  const clienteSchema = createClienteSchema(existingClients);

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      rut: "",
      nombre: "",
      apellido: "",
      esEmpresa: false,
      direccion: "",
      codComuna: "",
      contacto: "",
      telefono: "",
      correo: "",
      codigoGiro: "",
    },
  });

  const selectStyles = getReactSelectStyles(theme);

  useEffect(() => {
    const loadData = async () => {
      try {
        const clientesDataResult =
          await administracionService.getClientesData();

        if (clientesDataResult.error) {
          toast.error(clientesDataResult.error);
          return;
        }

        if (clientesDataResult.data) {
          setGiros(clientesDataResult.data.giros);
          setComunas(clientesDataResult.data.comunas);
          setExistingClients(
            clientesDataResult.data.clientes.map((c) => c.rut),
          );
        }
      } catch (error) {
        toast.error("Error al cargar datos del formulario", error as any);
      }
    };

    loadData();
  }, []);

  const validateRut = (rut: string) => {
    if (!rut) {
      setRutValidationStatus("idle");
      return;
    }

    // Validar formato
    if (!isValidRutFormat(rut)) {
      setRutValidationStatus("invalid");
      return;
    }

    // Validar dígito verificador
    if (!isValidRut(rut)) {
      setRutValidationStatus("invalid");
      return;
    }

    // Validar si ya existe
    if (existingClients.includes(rut)) {
      setRutValidationStatus("invalid");
    } else {
      setRutValidationStatus("valid");
    }
  };

  useEffect(() => {
    const rutValue = form.watch("rut");
    validateRut(rutValue);
  }, [form.watch("rut"), existingClients]);

  const onSubmit = async (data: ClienteFormData) => {
    setIsSubmitting(true);
    try {
      // Asegurar que el RUT esté correctamente formateado antes de enviar
      const formattedData = {
        ...data,
        rut: formatRut(data.rut),
      };

      await api.post("/cliente/crear", formattedData);
      toast.success("Cliente creado exitosamente");
      navigate("/dashboard/administracion/clientes");
    } catch (error) {
      toast.error("Error al crear el cliente", error as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <ModernHeader
            title="Crear Nuevo Cliente"
            description="Creación de nuevo cliente para el sistema"
            actions={
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard/administracion/clientes")}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/administracion/clientes")}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  className="gap-2"
                  variant="default"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Creando..." : "Crear Cliente"}
                </Button>
              </>
            }
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="bg-background rounded-xl shadow-sm border border-border">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 space-y-8"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">Información Básica</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="rut"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          RUT <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="12345678-9"
                              {...field}
                              onBlur={(e) => {
                                const formatted = formatRut(e.target.value);
                                field.onChange(formatted);
                              }}
                              className={`h-11 pr-10 ${(() => {
                                if (rutValidationStatus === "valid") {
                                  return "border-green-500 focus:border-green-500";
                                }
                                if (rutValidationStatus === "invalid") {
                                  return "border-red-500 focus:border-red-500";
                                }
                                return "";
                              })()}`}
                            />
                            {rutValidationStatus === "valid" && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </div>
                            )}
                            {rutValidationStatus === "invalid" && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <XCircle className="h-5 w-5 text-red-500" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                        {rutValidationStatus === "invalid" && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {(() => {
                              const currentRut = form.watch("rut");
                              if (!isValidRutFormat(currentRut)) {
                                return "El RUT debe tener el formato 12345678-9";
                              }
                              if (existingClients.includes(currentRut)) {
                                return "Este RUT ya está registrado en el sistema";
                              }
                              return "El dígito verificador no corresponde";
                            })()}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="esEmpresa"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            ¿Es Empresa?
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {form.watch("esEmpresa")
                            ? "Razón Social"
                            : "Nombre"}{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11"
                            placeholder={
                              form.watch("esEmpresa")
                                ? "Nombre de la empresa"
                                : "Nombre completo"
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!form.watch("esEmpresa") && (
                    <FormField
                      control={form.control}
                      name="apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Apellido
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="h-11"
                              placeholder="Apellido"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-medium">
                    Información de Ubicación
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="direccion"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Dirección <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11"
                            placeholder="Dirección completa"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="codComuna"
                    render={({ field }) => {
                      const comunaOptions = comunas.map((c) => {
                        if (typeof c === "string") {
                          return { value: c, label: c };
                        }
                        return { value: c.codigo, label: `${c.nombre} (${c.codigo})` };
                      });
                      const comunaActual = comunaOptions.find(
                        (option) => option.value === field.value,
                      );

                      return (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Comuna <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              instanceId="comuna-select"
                              options={comunaOptions}
                              value={comunaActual ?? null}
                              onChange={(option: any) =>
                                field.onChange(option ? option.value : "")
                              }
                              placeholder="Seleccione la comuna"
                              isClearable
                              styles={selectStyles}
                              classNamePrefix="react-select"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Phone className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-medium">
                    Información de Contacto
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="contacto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Contacto <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11"
                            placeholder="Nombre del contacto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Teléfono
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11"
                            placeholder="+56 9 1234 5678"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="correo"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Correo Electrónico
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            {...field}
                            className="h-11"
                            placeholder="correo@ejemplo.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-medium">Información de Giro</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <Controller
                    control={form.control}
                    name="codigoGiro"
                    render={({ field }) => {
                      const giroOptions = giros.map((g) => {
                        if (typeof g === "string") {
                          return { value: g, label: g };
                        }
                        return { value: g.codigo, label: `${g.codigo} - ${g.actividad}` };
                      });
                      const giroActual = giroOptions.find(
                        (option) => option.value === field.value,
                      );

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Código de Giro{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              instanceId="giro-select"
                              options={giroOptions}
                              value={giroActual ?? null}
                              onChange={(option: any) =>
                                field.onChange(option ? option.value : "")
                              }
                              placeholder="Seleccione el giro"
                              isClearable
                              styles={selectStyles}
                              classNamePrefix="react-select"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
