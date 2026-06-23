import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  Save,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

import { ModernHeader } from '~/components/shared/modern-header';
import { getReactSelectStyles } from '~/components/shared/react-select-styles';
import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import api from '~/lib/api';
import { administracionService } from '~/services/administracionService';
import type {
  GetClientesByRut,
  NombreComuna,
  NombreGiro
} from '~/types/administracion';
import { formatRut, isValidRutFormat } from '~/utils/rut-utils';

const createClienteSchema = (existingClients: string[], currentRut?: string) =>
  z.object({
    rut: z
      .string()
      .min(1, 'El RUT es requerido')
      .refine(isValidRutFormat, {
        message: 'El RUT debe tener el formato 12345678-9'
      })
      .refine(
        rut => {
          if (currentRut && rut === currentRut) return true;
          return !existingClients.includes(rut);
        },
        {
          message: 'Este RUT ya está registrado en el sistema'
        }
      ),
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: z.string(),
    esEmpresa: z.boolean(),
    direccion: z.string().min(1, 'La dirección es requerida'),
    codComuna: z.string().min(1, 'La comuna es requerida'),
    contacto: z.string().min(1, 'El contacto es requerido'),
    telefono: z.string().optional(),
    correo: z.string().optional(),
    codigoGiro: z.string().min(1, 'El código de giro es requerido')
  });

type ClienteFormData = z.infer<ReturnType<typeof createClienteSchema>>;

export default function EditarClienteComponent() {
  const navigate = useNavigate();
  const { id: rut } = useParams<{ id: string }>();
  const { theme } = useTheme();

  const [cliente, setCliente] = useState<GetClientesByRut | null>(null);
  const [giros, setGiros] = useState<NombreGiro[]>([]);
  const [comunas, setComunas] = useState<NombreComuna[]>([]);
  const [existingClients, setExistingClients] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rutValidationStatus, setRutValidationStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >('idle');

  const clienteSchema = createClienteSchema(existingClients, cliente?.rut);

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      rut: '',
      nombre: '',
      apellido: '',
      esEmpresa: false,
      direccion: '',
      codComuna: '',
      contacto: '',
      telefono: '',
      correo: '',
      codigoGiro: ''
    }
  });

  const selectStyles = getReactSelectStyles(theme);

  useEffect(() => {
    const loadData = async () => {
      if (!rut) {
        toast.error('RUT no proporcionado');
        navigate('/dashboard/administracion/clientes');
        return;
      }

      try {
        const [clientesDataResult, clienteResult] = await Promise.all([
          administracionService.getClientesData(),
          administracionService.getClienteByRut(rut)
        ]);

        if (clientesDataResult.error) {
          toast.error(clientesDataResult.error);
          return;
        }

        if (clientesDataResult.data) {
          setGiros(clientesDataResult.data.giros);
          setComunas(clientesDataResult.data.comunas);
          setExistingClients(clientesDataResult.data.clientes.map(c => c.rut));
        }

        if (clienteResult.error) {
          toast.error(clienteResult.error);
          navigate('/dashboard/administracion/clientes');
          return;
        }

        if (clienteResult.data) {
          const formattedRut = formatRut(clienteResult.data.rut || '');
          setCliente({ ...clienteResult.data, rut: formattedRut });
          form.reset({
            rut: formattedRut,
            nombre: clienteResult.data.nombre || '',
            apellido: clienteResult.data.apellido || '',
            esEmpresa: clienteResult.data.esEmpresa || false,
            direccion: clienteResult.data.direccion || '',
            codComuna: clienteResult.data.codComuna || '',
            contacto: clienteResult.data.contacto || '',
            telefono: clienteResult.data.telefono || '',
            correo: clienteResult.data.correo || '',
            codigoGiro: clienteResult.data.codigoGiro || ''
          });
        }
      } catch (error) {
        toast.error('Error al cargar datos del cliente', error as any);
        navigate('/dashboard/administracion/clientes');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [rut, navigate, form]);

  const validateRut = (rutValue: string) => {
    if (!rutValue) {
      setRutValidationStatus('idle');
      return;
    }

    // Validar formato
    if (!isValidRutFormat(rutValue)) {
      setRutValidationStatus('invalid');
      return;
    }

    // Si es el RUT actual del cliente, es válido
    if (cliente?.rut && rutValue === cliente.rut) {
      setRutValidationStatus('valid');
      return;
    }

    // Validar si ya existe
    if (existingClients.includes(rutValue)) {
      setRutValidationStatus('invalid');
    } else {
      setRutValidationStatus('valid');
    }
  };

  useEffect(() => {
    const rutValue = form.watch('rut');
    validateRut(rutValue);
  }, [form.watch('rut'), existingClients, cliente?.rut]);

  const onSubmit = async (data: ClienteFormData) => {
    setIsSubmitting(true);
    try {
      // Asegurar que el RUT esté correctamente formateado antes de enviar
      const formattedData = {
        ...data,
        rut: formatRut(data.rut)
      };

      await api.put('/cliente/modificar', {
        ...formattedData,
        id: cliente?.rut
      });
      toast.success('Cliente actualizado exitosamente');
      navigate('/dashboard/administracion/clientes');
    } catch (error) {
      toast.error('Error al actualizar el cliente', error as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos del cliente...</p>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cliente no encontrado</p>
          <Button
            onClick={() => navigate('/dashboard/administracion/clientes')}
            className="mt-4"
          >
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <ModernHeader
            title="Editar Cliente"
            description={`Modificación de datos del cliente ${cliente.rut}`}
            actions={
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard/administracion/clientes')}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard/administracion/clientes')}
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
                  {isSubmitting ? 'Actualizando...' : 'Actualizar Cliente'}
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
                    render={({ field }) => {
                      const getRutInputClassName = () => {
                        if (rutValidationStatus === 'valid') {
                          return 'border-green-500 focus:border-green-500';
                        }
                        if (rutValidationStatus === 'invalid') {
                          return 'border-red-500 focus:border-red-500';
                        }
                        return '';
                      };

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            RUT
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="12345678-9"
                                {...field}
                                onBlur={e => {
                                  const formatted = formatRut(e.target.value);
                                  field.onChange(formatted);
                                }}
                                className={`h-11 pr-10 ${getRutInputClassName()}`}
                              />
                              {rutValidationStatus === 'valid' && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                          {rutValidationStatus === 'invalid' && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              {isValidRutFormat(form.watch('rut'))
                                ? 'Este RUT ya está registrado en el sistema'
                                : 'El RUT debe tener el formato 12345678-9'}
                            </p>
                          )}
                        </FormItem>
                      );
                    }}
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
                          {form.watch('esEmpresa') ? 'Razón Social' : 'Nombre'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="h-11"
                            placeholder={
                              form.watch('esEmpresa')
                                ? 'Nombre de la empresa'
                                : 'Nombre completo'
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!form.watch('esEmpresa') && (
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
                          Dirección
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
                      const comunaActual = comunas.find(
                        c => c.codigo === field.value
                      );

                      return (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Comuna
                          </FormLabel>
                          <FormControl>
                            <Select
                              instanceId="comuna-select"
                              options={comunas.map(comuna => ({
                                value: comuna.codigo,
                                label: `${comuna.nombre} (${comuna.codigo})`
                              }))}
                              value={
                                comunaActual
                                  ? {
                                      value: comunaActual.codigo,
                                      label: `${comunaActual.nombre} (${comunaActual.codigo})`
                                    }
                                  : null
                              }
                              onChange={(option: any) =>
                                field.onChange(option ? option.value : '')
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
                          Contacto
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
                      const giroActual = giros.find(
                        g => g.codigo === field.value
                      );

                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Código de Giro
                          </FormLabel>
                          <FormControl>
                            <Select
                              instanceId="giro-select"
                              options={giros.map(giro => ({
                                value: giro.codigo,
                                label: `${giro.codigo} - ${giro.actividadEconomica}`
                              }))}
                              value={
                                giroActual
                                  ? {
                                      value: giroActual.codigo,
                                      label: `${giroActual.codigo} - ${giroActual.actividadEconomica}`
                                    }
                                  : null
                              }
                              onChange={(option: any) =>
                                field.onChange(option ? option.value : '')
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
