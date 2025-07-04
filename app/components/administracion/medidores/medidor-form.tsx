import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Gauge, Tag, Type, Hash, Calendar, Power, CheckCircle2 } from 'lucide-react';
import type {
  GetMedidores,
  CrearMedidorProps,
  ActualizarMedidorProps,
} from '~/types/administracion';
import type { Marca } from '~/types/mantencion';
import Select, { type StylesConfig } from 'react-select';
import { useTheme } from '~/components/theme-provider';

// Zod schema for form validation
const medidorSchema = z.object({
  marcaCodigo: z.string().min(1, 'La marca es requerida'),
  tipoId: z.number().min(1, 'El tipo es requerido'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  serie: z.string().min(1, 'El número de serie es requerido'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  digitos: z.coerce.number().min(1, 'Los dígitos deben ser mayor a 0'),
  multiplicar: z.coerce.number().min(1, 'El multiplicador debe ser mayor a 0'),
});

const getEstadoIdFromString = (estado: string): number => {
  switch (estado.toLowerCase()) {
    case 'activo':
      return 1;
    case 'en bodega':
      return 2;
    case 'en reparación':
      return 3;
    case 'inactivo':
      return 4;
    default:
      return 1; // Default to 'Activo'
  }
};

type MedidorFormData = z.infer<typeof medidorSchema>;

// Tipo local para los tipos de medidores, ya que no existe en los tipos globales.
interface TiposMedidores {
    id: number;
    nombre: string;
}

interface MedidorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CrearMedidorProps | ActualizarMedidorProps,
    mode: 'add' | 'edit',
  ) => Promise<void>;
  medidor?: GetMedidores | null;
  mode: 'add' | 'edit';
  isLoading?: boolean;
  marcas: Marca[];
  tipos: TiposMedidores[];
}

export function MedidorFormModal({
  isOpen,
  onClose,
  onSubmit,
  medidor,
  mode,
  isLoading,
  marcas,
  tipos,
}: MedidorFormModalProps) {
  const { theme } = useTheme();
  const form = useForm<MedidorFormData>({
    resolver: zodResolver(medidorSchema),
    defaultValues: {
      marcaCodigo: '',
      tipoId: 0,
      modelo: '',
      serie: '',
      fechaInicio: '',
      digitos: 0,
      multiplicar: 1,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && medidor) {
        const marcaSeleccionada = marcas.find(m => m.nombre === medidor.marca);
        const tipoSeleccionado = tipos.find(t => t.nombre === medidor.tipo);

        form.reset({
          marcaCodigo: marcaSeleccionada?.codigo ?? '',
          tipoId: tipoSeleccionado?.id ?? 0,
          modelo: medidor.modelo,
          serie: medidor.serie,
          fechaInicio: new Date(medidor.fechaInicio).toISOString().split('T')[0],
          digitos: medidor.digitos,
          multiplicar: medidor.multiplicar,
        });
      } else {
        form.reset({
          marcaCodigo: '',
          tipoId: 0,
          modelo: '',
          serie: '',
          fechaInicio: '',
          digitos: 0,
          multiplicar: 1,
        });
      }
    }
  }, [isOpen, medidor, mode, form, marcas, tipos]);

  const handleFormSubmit = (data: MedidorFormData) => {
    if (mode === 'edit' && medidor) {
      const marcaId = marcas.find(m => m.codigo === data.marcaCodigo)?.id ?? 0;
      const estadoId = getEstadoIdFromString(medidor.estado);
      const payload = { ...data, marcaId, estadoId, primeraLectura: '', fechaPrimeraLectura: '' };
      delete (payload as any).marcaCodigo;
      onSubmit({ ...payload, codigoMedidor: medidor.codigo, subempalmeCodigo: '' }, 'edit');
    } else {
      const marcaId = marcas.find(m => m.codigo === data.marcaCodigo)?.id ?? 0;
      const payload = { ...data, marcaId, estadoId: 1, primeraLectura: '', fechaPrimeraLectura: '' };
      delete (payload as any).marcaCodigo;
      onSubmit(payload, 'add');
    }
  };

  const selectStyles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
      minHeight: '44px',
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? (theme === 'dark' ? '#0891B2' : '#06B6D4') : isFocused ? (theme === 'dark' ? '#1E293B' : '#F1F5F9') : 'transparent',
    }),
    singleValue: (styles) => ({ ...styles, color: theme === 'dark' ? '#FFFFFF' : '#000000' }),
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
              <Gauge className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            {mode === 'add' ? 'Crear Nuevo Medidor' : 'Editar Medidor'}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {mode === 'add'
              ? 'Complete la información para registrar un nuevo medidor.'
              : 'Modifique la información del medidor.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8 pt-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Gauge className="h-5 w-5 text-sky-600" />
                <h3 className="text-lg font-medium">Detalles del Medidor</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="serie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        N° Serie
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Número de serie" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Modelo
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Modelo del medidor" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="marcaCodigo"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Marca
                        </FormLabel>
                        <Select
                          {...field}
                          instanceId="marca-select"
                          options={marcas.map(m => ({ value: m.codigo, label: m.nombre }))}
                          value={marcas.map(m => ({ value: m.codigo, label: m.nombre })).find(m => m.value === field.value)}
                          onChange={option => field.onChange(option ? (option as any).value : '')}
                          placeholder="Seleccione una marca"
                          styles={selectStyles}
                        />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <Controller
                  control={form.control}
                  name="tipoId"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Tipo
                        </FormLabel>
                        <Select
                           {...field}
                           instanceId="tipo-select"
                           options={tipos.map(t => ({ value: t.id, label: t.nombre }))}
                           value={tipos.map(t => ({ value: t.id, label: t.nombre })).find(t => t.value === field.value)}
                           onChange={option => field.onChange(option ? (option as any).value : null)}
                           placeholder="Seleccione un tipo"
                           styles={selectStyles}
                        />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex items-center gap-2 pb-2 border-b">
                <Power className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-medium">Configuración</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="digitos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Dígitos
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Cantidad de dígitos" {...field} className="h-11" />
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
                      <FormLabel className="flex items-center gap-2">
                        <Power className="h-4 w-4" />
                        Multiplicador
                      </FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Factor multiplicador" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fechaInicio"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha de Inicio
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-6 border-t">
              <Button type="button" variant="outline" onClick={onClose} className="h-11 px-6" disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" className="h-11 px-6 flex items-center gap-2" disabled={isLoading}>
                <CheckCircle2 className="h-4 w-4" />
                {isLoading ? 'Guardando...' : (mode === 'add' ? 'Crear Medidor' : 'Guardar Cambios')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
