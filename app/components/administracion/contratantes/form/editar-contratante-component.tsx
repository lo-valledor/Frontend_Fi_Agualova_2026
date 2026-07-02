import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  Info,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import Select, { type SingleValue } from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

import { ModernHeader } from '~/components/shared/modern-header';
import type { OptionType } from '~/components/shared/react-select-styles';
import { getReactSelectStyles } from '~/components/shared/react-select-styles';
import { useTheme } from '~/components/theme-provider';
import { Alert, AlertDescription } from '~/components/ui/alert';
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
import { administracionService } from '~/services/administracionService';
import type { GetContratante, NombreComuna } from '~/types/administracion';
import { formatRut, isValidRutFormat } from '~/utils/rut-utils';

const createContratanteSchema = (
  existingContratantes: string[],
  currentRut?: string
) =>
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
          return !existingContratantes.includes(rut);
        },
        {
          message: 'Este RUT ya está registrado en el sistema'
        }
      ),
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: z.string().optional(),
    esEmpresa: z.boolean(),
    direccion: z.string().min(1, 'La dirección es requerida'),
    codigoComuna: z.string().min(1, 'La comuna es requerida'),
    contacto: z.string().min(1, 'El contacto es requerido'),
    telefono: z.string().optional(),
    email: z
      .string()
      .email('Debe ser un correo válido')
      .optional()
      .or(z.literal(''))
  });

type ContratanteFormData = z.infer<ReturnType<typeof createContratanteSchema>>;

type ContratanteApiData = Record<string, unknown>;

export default function EditarContratanteComponent() {
  const navigate = useNavigate();
  const { id: rut } = useParams<{ id: string }>();
  const { theme } = useTheme();

  const [contratante, setContratante] = useState<GetContratante | null>(null);
  const [comunas, setComunas] = useState<NombreComuna[]>([]);
  const [existingContratantes, _setExistingContratantes] = useState<string[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rutValidationStatus, setRutValidationStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >('idle');

  const contratanteSchema = createContratanteSchema(
    existingContratantes,
    contratante?.rut
  );

  const parseBoolean = (
    value: boolean | string | null | undefined
  ): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      return (
        normalized === 'true' ||
        normalized === '1' ||
        normalized === 'si' ||
        normalized === 'sí' ||
        normalized === 's'
      );
    }
    return false;
  };

  const getRawValue = (value: ContratanteApiData, key: string): string => {
    if (typeof value[key] === 'string') return String(value[key]);
    return '';
  };

  const mapContratantePayloadToForm = (
    value: ContratanteApiData
  ): ContratanteFormData => {
    const comuna =
      getRawValue(value, 'codigoComuna') ||
      getRawValue(value, 'comuna') ||
      getRawValue(value, 'comunaNombre');

    return {
      rut: formatRut(getRawValue(value, 'rut')),
      nombre: getRawValue(value, 'nombre'),
      apellido: getRawValue(value, 'apellido'),
      esEmpresa: parseBoolean(
        value.esEmpresa as boolean | string | null | undefined
      ),
      direccion: getRawValue(value, 'direccion'),
      codigoComuna: comuna,
      contacto: getRawValue(value, 'contacto'),
      telefono: getRawValue(value, 'telefono'),
      email: getRawValue(value, 'email') || getRawValue(value, 'correo')
    };
  };

  const form = useForm<ContratanteFormData>({
    resolver: zodResolver(contratanteSchema),
    defaultValues: {
      rut: '',
      nombre: '',
      apellido: '',
      esEmpresa: false,
      direccion: '',
      codigoComuna: '',
      contacto: '',
      telefono: '',
      email: ''
    }
  });

  const selectStyles = getReactSelectStyles(theme);

  useEffect(() => {
    const loadData = async () => {
      if (!rut) {
        toast.error('RUT no proporcionado');
        navigate('/dashboard/administracion/contratantes');
        return;
      }

      try {
        const [contratantesResult, comunasResult, contratanteResult] =
          await Promise.all([
            administracionService.getContratantesByLimitAndOffset({
              limit: 500,
              offset: 0
            }),
            administracionService.getComunas(),
            administracionService.getContratanteByRut(rut)
          ]);

        if (contratantesResult.data) {
          _setExistingContratantes(contratantesResult.data.map(c => c.rut));
        }

        if (comunasResult.data) {
          setComunas(comunasResult.data);
        }

        if (contratanteResult.error) {
          toast.error(contratanteResult.error);
          navigate('/dashboard/administracion/contratantes');
          return;
        }

        if (contratanteResult.data) {
          const parsedData = mapContratantePayloadToForm(
            contratanteResult.data as ContratanteApiData
          );
          setContratante({
            ...(contratanteResult.data as GetContratante),
            rut: parsedData.rut
          });
          form.reset(parsedData);
        }
      } catch (error) {
        toast.error('Error al cargar datos del contratante', error as any);
        navigate('/dashboard/administracion/contratantes');
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

    // Si es el RUT actual del contratante, es válido
    if (contratante?.rut && rutValue === contratante.rut) {
      setRutValidationStatus('valid');
      return;
    }

    // Validar si ya existe
    if (existingContratantes.includes(rutValue)) {
      setRutValidationStatus('invalid');
    } else {
      setRutValidationStatus('valid');
    }
  };

  useEffect(() => {
    const rutValue = form.watch('rut');
    validateRut(rutValue);
  }, [form.watch('rut'), existingContratantes, contratante?.rut]);

  const onSubmit = async (data: ContratanteFormData) => {
    setIsSubmitting(true);
    try {
      const formattedData = {
        ...data,
        rut: formatRut(data.rut)
      };

      const result = await administracionService.modificarContratante({
        ...formattedData,
        id: contratante?.rut
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Contratante actualizado exitosamente');
      navigate('/dashboard/administracion/contratantes');
    } catch (error) {
      toast.error('Error al actualizar el contratante', error as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Cargando datos del contratante...
          </p>
        </div>
      </div>
    );
  }

  if (!contratante) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Contratante no encontrado</p>
          <Button
            onClick={() => navigate('/dashboard/administracion/contratantes')}
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
            title="Editar Contratante"
            description={`Modificación de datos del contratante ${contratante.rut}`}
            actions={
              <>
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate('/dashboard/administracion/contratantes')
                  }
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate('/dashboard/administracion/contratantes')
                  }
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  className="gap-2"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Actualizando...' : 'Actualizar Contratante'}
                </Button>
              </>
            }
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <Info className="h-4 w-4 " />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Información:</strong> Al editar el contratante, los campos
            se cargan desde la base y puedes actualizar sus datos de contacto,
            ubicación y estado.
          </AlertDescription>
        </Alert>

        <div className="bg-background rounded-xl shadow-sm border border-border">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-6 space-y-8"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <User className="h-5 w-5 text-orange-600" />
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
                            RUT <span className="text-red-500">*</span>
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
                              {rutValidationStatus === 'invalid' && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                  <XCircle className="h-5 w-5 text-red-500" />
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
                          {form.watch('esEmpresa') ? 'Razón Social' : 'Nombre'}{' '}
                          <span className="text-red-500">*</span>
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
                    name="codigoComuna"
                    render={({ field }) => {
                      const comunaOptions = comunas.map((c: NombreComuna) => {
                        if (typeof c === 'string') {
                          return { value: c, label: c };
                        }
                        return {
                          value: c.codigo,
                          label: `${c.nombre} (${c.codigo})`
                        };
                      });
                      const comunaActual = comunaOptions.find(
                        option => option.value === field.value
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
                              onChange={(option: SingleValue<OptionType>) =>
                                field.onChange(
                                  option ? String(option.value) : ''
                                )
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
                    name="email"
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
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
