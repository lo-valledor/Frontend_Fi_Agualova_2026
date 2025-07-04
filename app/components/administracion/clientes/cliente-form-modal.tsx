import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
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
import type {
  GetClientesByRut,
  GetRegiones,
  GetGiros,
  GetComunas,
} from '~/types/administracion';
import Select, { type StylesConfig } from 'react-select';
import { useTheme } from '~/components/theme-provider';
import api from '~/lib/api';
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
} from 'lucide-react';

const clienteSchema = z
  .object({
    rut: z.string().min(1, 'El RUT es requerido'),
    nombre: z.string().min(1, 'El nombre es requerido'),
    apellido: z.string(),
    esEmpresa: z.boolean(),
    direccion: z.string().min(1, 'La dirección es requerida'),
    region: z.string().optional(),
    codComuna: z.string().optional(),
    contacto: z.string().min(1, 'El contacto es requerido'),
    telefono: z.string().min(1, 'El teléfono es requerido'),
    correo: z.string().email('Correo electrónico inválido'),
    codigoGiro: z.string(),
  })
  .refine(
    (data) => {
      // Si se proporciona una comuna, la región es requerida
      if (data.codComuna && !data.region) {
        return false;
      }
      // Si se proporciona una región, la comuna es requerida
      if (data.region && !data.codComuna) {
        return false;
      }
      return true;
    },
    {
      message:
        'Si selecciona una comuna debe seleccionar una región y viceversa',
      path: ['region'], // esto hará que el error aparezca en el campo región
    },
  );

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cliente?: GetClientesByRut;
  mode: 'add' | 'edit';
  giros: GetGiros[];
  regiones: GetRegiones[];
}

export default function ClienteFormModal({
  isOpen,
  onClose,
  onSuccess,
  cliente,
  mode,
  giros,
  regiones,
}: ClienteFormModalProps) {
  const [comunas, setComunas] = useState<GetComunas[]>([]);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      rut: '',
      nombre: '',
      apellido: '',
      esEmpresa: false,
      direccion: '',
      region: '',
      codComuna: '',
      contacto: '',
      telefono: '',
      correo: '',
      codigoGiro: '',
    },
  });
  const { theme } = useTheme();

  const selectStyles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
      '&:hover': {
        borderColor: theme === 'dark' ? '#475569' : '#CBD5E1',
      },
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? theme === 'dark'
          ? '#166534'
          : '#16A34A'
        : isFocused
          ? theme === 'dark'
            ? '#1E293B'
            : '#F1F5F9'
          : 'transparent',
      color: isSelected ? '#FFFFFF' : theme === 'dark' ? '#F8FAFC' : '#0F172A',
      ':active': {
        ...styles[':active'],
        backgroundColor: theme === 'dark' ? '#166534' : '#16A34A',
      },
    }),
    singleValue: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    }),
    input: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#334155' : '#E2E8F0',
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
      '&:hover': {
        color: theme === 'dark' ? '#CBD5E1' : '#374151',
      },
    }),
    noOptionsMessage: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
    }),
    loadingMessage: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
    }),
  };

  // Cargar comunas cuando cambia la región
  const loadComunas = async (regionCodigo: string) => {
    if (!regionCodigo) {
      setComunas([]);
      return;
    }

    setLoadingComunas(true);
    try {
      const response = await api.get(`comuna/por-region/${regionCodigo}`);
      const data = response.data as GetComunas[];
      console.log('data', data);
      console.log('comunas', regionCodigo);
      setComunas(data);
    } catch (error) {
      console.error('Error al cargar comunas:', error);
      setComunas([]);
    } finally {
      setLoadingComunas(false);
    }
  };

  // Resetear formulario cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      setInitialLoad(true);
      if (cliente && mode === 'edit') {
        const regionCliente = regiones.find(
          (r) => r.codigo === cliente.codComuna?.substring(0, 2),
        );

        form.reset({
          rut: cliente.rut || '',
          nombre: cliente.nombre || '',
          apellido: cliente.apellido || '',
          esEmpresa: cliente.esEmpresa || false,
          direccion: cliente.direccion || '',
          region: regionCliente?.codigo || '',
          codComuna: cliente.codComuna || '',
          contacto: cliente.contacto || '',
          telefono: cliente.telefono || '',
          correo: cliente.correo || '',
          codigoGiro: cliente.codigoGiro || '',
        });

        // Solo cargamos las comunas si hay una región
        if (regionCliente) {
          loadComunas(regionCliente.region);
        }
      } else {
        form.reset({
          rut: '',
          nombre: '',
          apellido: '',
          esEmpresa: false,
          direccion: '',
          region: '',
          codComuna: '',
          contacto: '',
          telefono: '',
          correo: '',
          codigoGiro: '',
        });
        setComunas([]);
      }
      setInitialLoad(false);
    }
  }, [isOpen, cliente, mode, form, regiones]);

  // Manejar cambios en la región
  useEffect(() => {
    const regionCode = form.watch('region');
    if (!initialLoad && regionCode) {
      const regionData = regiones.find((r) => r.codigo === regionCode);
      if (regionData) {
        loadComunas(regionData.region);
      }

      const currentRegion = cliente?.codComuna?.substring(0, 2);
      if (mode === 'add' || (mode === 'edit' && regionCode !== currentRegion)) {
        form.setValue('codComuna', '');
      }
    }
  }, [form.watch('region'), initialLoad, mode, cliente, regiones]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      if (mode === 'add') {
        await api.post('/cliente/crear', data);
      } else {
        await api.put(`/cliente/modificar`, { ...data, id: cliente?.rut });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            {mode === 'add' ? (
              <>
                <User className="h-6 w-6 text-blue-600" />
                Agregar Cliente
              </>
            ) : (
              <>
                <User className="h-6 w-6 text-green-600" />
                Editar Cliente
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === 'add'
              ? 'Complete el formulario para agregar un nuevo cliente al sistema.'
              : 'Modifique los datos del cliente según sea necesario.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Información Básica */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Información Básica</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="rut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        RUT
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="12345678-9"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="esEmpresa"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 bg-muted/30">
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

            {/* Información de Ubicación */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium">
                  Información de Ubicación
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Región */}
                <Controller
                  control={form.control}
                  name="region"
                  render={({ field }) => {
                    // Encontrar la región actual basada en el código
                    const regionActual = regiones.find(
                      (r) => r.codigo === field.value,
                    );

                    return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Región
                        </FormLabel>
                        <FormControl>
                          <Select
                            instanceId="region-select"
                            options={regiones.map((region) => ({
                              value: region.codigo,
                              label: region.region,
                            }))}
                            value={
                              regionActual
                                ? {
                                    value: regionActual.codigo,
                                    label: regionActual.region,
                                  }
                                : null
                            }
                            onChange={(option: any) =>
                              field.onChange(option ? option.value : '')
                            }
                            placeholder="Seleccione la región"
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

                {/* Comuna */}
                <Controller
                  control={form.control}
                  name="codComuna"
                  render={({ field }) => {
                    // Encontrar la comuna actual basada en el código
                    const comunaActual = comunas.find(
                      (c) => c.codigo === field.value,
                    );

                    return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Comuna
                        </FormLabel>
                        <FormControl>
                          <Select
                            instanceId="comuna-select"
                            options={comunas.map((comuna) => ({
                              value: comuna.codigo,
                              label: comuna.nombre,
                            }))}
                            value={
                              comunaActual
                                ? {
                                    value: comunaActual.codigo,
                                    label: comunaActual.nombre,
                                  }
                                : null
                            }
                            onChange={(option: any) =>
                              field.onChange(option ? option.value : '')
                            }
                            placeholder={
                              loadingComunas
                                ? 'Cargando comunas...'
                                : 'Seleccione la comuna'
                            }
                            isDisabled={!form.watch('region') || loadingComunas}
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

            {/* Información de Contacto */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Phone className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-medium">Información de Contacto</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Información de Giro */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Building2 className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-medium">Información de Giro</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Controller
                  control={form.control}
                  name="codigoGiro"
                  render={({ field }) => {
                    // Encontrar el giro actual basado en el código
                    const giroActual = giros.find(
                      (g) => g.codigo === field.value,
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
                            options={giros.map((giro) => ({
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

            <DialogFooter className="pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-11 px-6"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-11 px-6 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                {mode === 'add' ? 'Agregar' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
