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
import { toast } from 'sonner';
import { z } from 'zod';

import React, { useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { useNavigate } from 'react-router';

import { ModernHeader } from '~/components/shared/modern-header';
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
import type { GetComunas, GetGiros } from '~/types/administracion';
import { formatRut, isValidRutFormat } from '~/utils/rut-utils';
import { administracionService } from '~/services/administracionService';

const createContratanteSchema = (existingContratantes: string[]) =>
  z.object({
    rut: z
      .string()
      .min(1, 'El RUT es requerido')
      .refine(isValidRutFormat, {
        message: 'El RUT debe tener el formato 12345678-9'
      })
      .refine(
        rut => {
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
    codComuna: z.string().min(1, 'La comuna es requerida'),
    contacto: z.string().min(1, 'El contacto es requerido'),
    telefono: z.string().optional(),
    correo: z
      .string()
      .email('Debe ser un correo válido')
      .optional()
      .or(z.literal(''))
  });

type ContratanteFormData = z.infer<ReturnType<typeof createContratanteSchema>>;

export default function CrearContratanteComponent() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [, setGiros] = useState<GetGiros[]>([]);
  const [comunas, setComunas] = useState<GetComunas[]>([]);
  const [existingContratantes, setExistingContratantes] = useState<string[]>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rutValidationStatus, setRutValidationStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >('idle');

  const contratanteSchema = createContratanteSchema(existingContratantes);

  const form = useForm<ContratanteFormData>({
    resolver: zodResolver(contratanteSchema),
    defaultValues: {
      rut: '',
      nombre: '',
      apellido: '',
      esEmpresa: false,
      direccion: '',
      codComuna: '',
      contacto: '',
      telefono: '',
      correo: ''
    }
  });

  const selectStyles = getReactSelectStyles(theme);

  useEffect(() => {
    const loadData = async () => {
      try {
        const contratantesDataResult =
          await administracionService.getContratantesData();

        if (contratantesDataResult.error) {
          toast.error(contratantesDataResult.error);
          return;
        }

        if (contratantesDataResult.data) {
          setGiros(contratantesDataResult.data.giros);
          setComunas(contratantesDataResult.data.comunas);
          setExistingContratantes(
            contratantesDataResult.data.contratantes.map(c => c.rut)
          );
        }
      } catch (error) {
        toast.error('Error al cargar datos del formulario', error as any);
      }
    };

    loadData();
  }, []);

  const validateRut = (rut: string) => {
    if (!rut) {
      setRutValidationStatus('idle');
      return;
    }

    // Validar formato
    if (!isValidRutFormat(rut)) {
      setRutValidationStatus('invalid');
      return;
    }

    // Validar si ya existe
    if (existingContratantes.includes(rut)) {
      setRutValidationStatus('invalid');
    } else {
      setRutValidationStatus('valid');
    }
  };

  useEffect(() => {
    const rutValue = form.watch('rut');
    validateRut(rutValue);
  }, [form.watch('rut'), existingContratantes]);

  const onSubmit = async (data: ContratanteFormData) => {
    setIsSubmitting(true);
    try {
      // Asegurar que el RUT esté correctamente formateado antes de enviar
      const formattedData = {
        ...data,
        rut: formatRut(data.rut)
      };

      const result =
        await administracionService.crearContratante(formattedData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Contratante creado exitosamente');
      navigate('/dashboard/administracion/contratantes');
    } catch (error) {
      toast.error('Error al crear el contratante', error as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60'>
        <div className='container mx-auto px-4 py-4'>
          <ModernHeader
            title='Crear Nuevo Contratante'
            description='Creación de nuevo contratante para el sistema'
            actions={
              <>
                <Button
                  variant='ghost'
                  onClick={() =>
                    navigate('/dashboard/administracion/contratantes')
                  }
                  disabled={isSubmitting}
                  className='gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Volver
                </Button>
                <Button
                  variant='outline'
                  onClick={() =>
                    navigate('/dashboard/administracion/contratantes')
                  }
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={form.handleSubmit(onSubmit)}
                  className='gap-2'
                  disabled={isSubmitting}
                >
                  <Save className='h-4 w-4' />
                  {isSubmitting ? 'Creando...' : 'Crear Contratante'}
                </Button>
              </>
            }
          />
        </div>
      </div>

      <div className='container mx-auto px-4 py-6 space-y-6'>
        {/* Disclaimer */}
        <Alert className='border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800'>
          <Info className='h-4 w-4 ' />
          <AlertDescription className='text-blue-800 dark:text-blue-200'>
            <strong>Información:</strong> Al crear un contratante, este
            aparecerá automáticamente en el submódulo de{' '}
            <strong>Propietarios</strong> para su consulta y gestión.
          </AlertDescription>
        </Alert>

        <div className='bg-background rounded-xl shadow-sm border border-border'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='p-6 space-y-8'
            >
              <div className='space-y-6'>
                <div className='flex items-center gap-2 pb-2 border-b'>
                  <User className='h-5 w-5 text-orange-600' />
                  <h3 className='text-lg font-medium'>Información Básica</h3>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                  <FormField
                    control={form.control}
                    name='rut'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <FileText className='h-4 w-4' />
                          RUT <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <div className='relative'>
                            <Input
                              placeholder='12345678-9'
                              {...field}
                              onBlur={e => {
                                const formatted = formatRut(e.target.value);
                                field.onChange(formatted);
                              }}
                              className={`h-11 pr-10 ${
                                rutValidationStatus === 'valid'
                                  ? 'border-green-500 focus:border-green-500'
                                  : rutValidationStatus === 'invalid'
                                    ? 'border-red-500 focus:border-red-500'
                                    : ''
                              }`}
                            />
                            {rutValidationStatus === 'valid' && (
                              <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                                <CheckCircle2 className='h-5 w-5 text-green-500' />
                              </div>
                            )}
                            {rutValidationStatus === 'invalid' && (
                              <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                                <XCircle className='h-5 w-5 text-red-500' />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                        {rutValidationStatus === 'invalid' && (
                          <p className='text-sm text-red-600 dark:text-red-400 mt-1'>
                            {!isValidRutFormat(form.watch('rut'))
                              ? 'El RUT debe tener el formato 12345678-9'
                              : 'Este RUT ya está registrado en el sistema'}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='esEmpresa'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 bg-muted/30'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className='space-y-1 leading-none'>
                          <FormLabel className='flex items-center gap-2'>
                            <Building2 className='h-4 w-4' />
                            ¿Es Empresa?
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='nombre'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <User className='h-4 w-4' />
                          {form.watch('esEmpresa')
                            ? 'Razón Social'
                            : 'Nombre'}{' '}
                          <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className='h-11'
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
                      name='apellido'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2'>
                            <User className='h-4 w-4' />
                            Apellido
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className='h-11'
                              placeholder='Apellido'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className='space-y-6'>
                <div className='flex items-center gap-2 pb-2 border-b'>
                  <MapPin className='h-5 w-5 text-green-600' />
                  <h3 className='text-lg font-medium'>
                    Información de Ubicación
                  </h3>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                  <FormField
                    control={form.control}
                    name='direccion'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel className='flex items-center gap-2'>
                          <MapPin className='h-4 w-4' />
                          Dirección <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className='h-11'
                            placeholder='Dirección completa'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name='codComuna'
                    render={({ field }) => {
                      const comunaActual = comunas.find(
                        c => c.codigo === field.value
                      );

                      return (
                        <FormItem className='md:col-span-2'>
                          <FormLabel className='flex items-center gap-2'>
                            <MapPin className='h-4 w-4' />
                            Comuna <span className='text-red-500'>*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              instanceId='comuna-select'
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
                              placeholder='Seleccione la comuna'
                              isClearable
                              styles={selectStyles}
                              classNamePrefix='react-select'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>

              <div className='space-y-6'>
                <div className='flex items-center gap-2 pb-2 border-b'>
                  <Phone className='h-5 w-5 text-purple-600' />
                  <h3 className='text-lg font-medium'>
                    Información de Contacto
                  </h3>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                  <FormField
                    control={form.control}
                    name='contacto'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <User className='h-4 w-4' />
                          Contacto <span className='text-red-500'>*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className='h-11'
                            placeholder='Nombre del contacto'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='telefono'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Phone className='h-4 w-4' />
                          Teléfono
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className='h-11'
                            placeholder='+56 9 1234 5678'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='correo'
                    render={({ field }) => (
                      <FormItem className='md:col-span-2'>
                        <FormLabel className='flex items-center gap-2'>
                          <Mail className='h-4 w-4' />
                          Correo Electrónico
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            {...field}
                            className='h-11'
                            placeholder='correo@ejemplo.com'
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
