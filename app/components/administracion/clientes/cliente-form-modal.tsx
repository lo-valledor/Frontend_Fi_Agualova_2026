import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  XCircle,
} from 'lucide-react';
import { z } from 'zod';

import React, { useEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';

import { getReactSelectStyles } from '~/components/shared/react-select-styles';
import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import api from '~/lib/api';
import type {
  GetClientesByRut,
  GetComunas,
  GetGiros,
} from '~/types/administracion';

// Función para crear schema dinámico con validación de RUT
const createClienteSchema = (existingClients: string[], currentRut?: string) =>
  z.object({
    rut: z
      .string()
      .min(1, 'El RUT es requerido')
      .refine(
        rut => {
          // En modo edición, permitir el RUT actual
          if (currentRut && rut === currentRut) return true;
          // En modo creación, verificar que no exista
          return !existingClients.includes(rut);
        },
        {
          message: 'Este RUT ya está registrado en el sistema',
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
    codigoGiro: z.string().min(1, 'El código de giro es requerido'),
  });

type ClienteFormData = z.infer<ReturnType<typeof createClienteSchema>>;

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clienteData: ClienteFormData, mode: 'add' | 'edit') => void;
  cliente?: GetClientesByRut;
  mode: 'add' | 'edit';
  giros: GetGiros[];
  comunas: GetComunas[];
  existingClients: string[]; // Lista de RUTs existentes para validación
}

export default function ClienteFormModal({
  isOpen,
  onClose,
  onSuccess,
  cliente,
  mode,
  giros,
  comunas,
  existingClients,
}: ClienteFormModalProps) {
  // Crear schema dinámico basado en clientes existentes
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
      codigoGiro: '',
    },
  });
  const { theme } = useTheme();
  const [rutValidationStatus, setRutValidationStatus] = useState<
    'idle' | 'checking' | 'valid' | 'invalid'
  >('idle');

  // Función para validar RUT en tiempo real
  const validateRut = (rut: string) => {
    if (!rut) {
      setRutValidationStatus('idle');
      return;
    }

    // En modo edición, permitir el RUT actual
    if (cliente?.rut && rut === cliente.rut) {
      setRutValidationStatus('valid');
      return;
    }

    // Verificar si el RUT ya existe
    if (existingClients.includes(rut)) {
      setRutValidationStatus('invalid');
    } else {
      setRutValidationStatus('valid');
    }
  };

  // Validar RUT cuando cambie el valor del campo
  useEffect(() => {
    const rutValue = form.watch('rut');
    validateRut(rutValue);
  }, [form.watch('rut'), existingClients, cliente?.rut]);

  // Usar estilos compartidos para react-select
  const selectStyles = getReactSelectStyles(theme);

  // Resetear formulario cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      if (cliente && mode === 'edit') {
        form.reset({
          rut: cliente.rut || '',
          nombre: cliente.nombre || '',
          apellido: cliente.apellido || '',
          esEmpresa: cliente.esEmpresa || false,
          direccion: cliente.direccion || '',
          codComuna: cliente.codComuna || '',
          contacto: cliente.contacto || '',
          telefono: cliente.telefono || '',
          correo: cliente.correo || '',
          codigoGiro: cliente.codigoGiro || '',
        });
      } else {
        form.reset({
          rut: '',
          nombre: '',
          apellido: '',
          esEmpresa: false,
          direccion: '',
          codComuna: '',
          contacto: '',
          telefono: '',
          correo: '',
          codigoGiro: '',
        });
      }
    }
  }, [isOpen, cliente, mode, form]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (mode === 'add') {
        await api.post('/cliente/crear', data);
      } else {
        await api.put(`/cliente/modificar`, { ...data, id: cliente?.rut });
      }
      onSuccess(data, mode);
      onClose();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-[95vw] sm:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='space-y-3'>
          <DialogTitle className='text-2xl font-semibold flex items-center gap-2'>
            {mode === 'add' ? (
              <>
                <User className='h-6 w-6 text-blue-600' />
                Agregar Cliente
              </>
            ) : (
              <>
                <User className='h-6 w-6 text-green-600' />
                Editar Cliente
              </>
            )}
          </DialogTitle>
          <DialogDescription className='text-base'>
            {mode === 'add'
              ? 'Complete el formulario para agregar un nuevo cliente al sistema.'
              : 'Modifique los datos del cliente según sea necesario.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Información Básica */}
            <div className='space-y-6'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <User className='h-5 w-5 text-blue-600' />
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
                        RUT
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            placeholder='12345678-9'
                            {...field}
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
                          Este RUT ya está registrado en el sistema
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='esEmpresa'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/30'>
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
                        {form.watch('esEmpresa') ? 'Razón Social' : 'Nombre'}
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

            {/* Información de Ubicación */}
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
                        Dirección
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

                {/* Comuna */}
                <Controller
                  control={form.control}
                  name='codComuna'
                  render={({ field }) => {
                    // Encontrar la comuna actual basada en el código
                    const comunaActual = comunas.find(
                      c => c.codigo === field.value
                    );

                    return (
                      <FormItem className='md:col-span-2'>
                        <FormLabel className='flex items-center gap-2'>
                          <MapPin className='h-4 w-4' />
                          Comuna
                        </FormLabel>
                        <FormControl>
                          <Select
                            instanceId='comuna-select'
                            options={comunas.map(comuna => ({
                              value: comuna.codigo,
                              label: `${comuna.nombre} (${comuna.codigo})`,
                            }))}
                            value={
                              comunaActual
                                ? {
                                    value: comunaActual.codigo,
                                    label: `${comunaActual.nombre} (${comunaActual.codigo})`,
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

            {/* Información de Contacto */}
            <div className='space-y-6'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <Phone className='h-5 w-5 text-purple-600' />
                <h3 className='text-lg font-medium'>Información de Contacto</h3>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
                <FormField
                  control={form.control}
                  name='contacto'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='flex items-center gap-2'>
                        <User className='h-4 w-4' />
                        Contacto
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

            {/* Información de Giro */}
            <div className='space-y-6'>
              <div className='flex items-center gap-2 pb-2 border-b'>
                <Building2 className='h-5 w-5 text-orange-600' />
                <h3 className='text-lg font-medium'>Información de Giro</h3>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:gap-6'>
                <Controller
                  control={form.control}
                  name='codigoGiro'
                  render={({ field }) => {
                    // Encontrar el giro actual basado en el código
                    const giroActual = giros.find(
                      g => g.codigo === field.value
                    );

                    return (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Building2 className='h-4 w-4' />
                          Código de Giro
                        </FormLabel>
                        <FormControl>
                          <Select
                            instanceId='giro-select'
                            options={giros.map(giro => ({
                              value: giro.codigo,
                              label: `${giro.codigo} - ${giro.actividadEconomica}`,
                            }))}
                            value={
                              giroActual
                                ? {
                                    value: giroActual.codigo,
                                    label: `${giroActual.codigo} - ${giroActual.actividadEconomica}`,
                                  }
                                : null
                            }
                            onChange={(option: any) =>
                              field.onChange(option ? option.value : '')
                            }
                            placeholder='Seleccione el giro'
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

            <DialogFooter className='pt-6 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='h-11 px-6'
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                className='h-11 px-6 flex items-center gap-2'
              >
                <CheckCircle2 className='h-4 w-4' />
                {mode === 'add' ? 'Agregar' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
