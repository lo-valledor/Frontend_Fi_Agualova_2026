import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import api from '~/lib/api';
import type { CiclosFacturacion } from '~/types/mantencion';

const cicloFormSchema = z.object({
  descripcion: z
    .string()
    .min(1, { message: 'La descripción es requerida.' })
    .max(100, { message: 'La descripción no puede exceder 100 caracteres.' }),
  diaFacturacion: z
    .number({ message: 'El día de facturación debe ser un número válido.' })
    .int({ message: 'El día de facturación debe ser un número entero.' })
    .min(1, { message: 'El día de facturación debe ser entre 1 y 31.' })
    .max(31, { message: 'El día de facturación debe ser entre 1 y 31.' }),
  diaInicioLectura: z
    .number({
      message: 'El día de inicio de lectura debe ser un número válido.'
    })
    .int({ message: 'El día de inicio de lectura debe ser un número entero.' })
    .min(1, { message: 'El día de inicio de lectura debe ser entre 1 y 31.' })
    .max(31, { message: 'El día de inicio de lectura debe ser entre 1 y 31.' }),
  diasVencimientoFactura: z
    .number({ message: 'Los días de vencimiento deben ser un número válido.' })
    .int({ message: 'Los días de vencimiento deben ser un número entero.' })
    .min(1, { message: 'Los días de vencimiento deben ser mayor a 0.' })
    .max(365, {
      message: 'Los días de vencimiento no pueden exceder 365 días.'
    }),
  estado: z.boolean()
});

type CicloFormValues = z.infer<typeof cicloFormSchema>;

interface CicloFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ciclo: CiclosFacturacion | null;
  mode: 'add' | 'edit';
}

export default function CiclosFacturacionModalForm({
  isOpen,
  onClose,
  onSuccess,
  ciclo,
  mode
}: Readonly<CicloFormModalProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CicloFormValues>({
    resolver: zodResolver(cicloFormSchema),
    defaultValues: {
      descripcion: '',
      diaFacturacion: 1,
      diaInicioLectura: 1,
      diasVencimientoFactura: 30,
      estado: true
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && ciclo) {
        form.reset({
          descripcion: ciclo.descripcion,
          diaFacturacion: ciclo.diaFacturacion,
          diaInicioLectura: ciclo.diaInicioLectura,
          diasVencimientoFactura: ciclo.diasVencimientoFactura,
          estado: ciclo.estado
        });
      } else {
        form.reset({
          descripcion: '',
          diaFacturacion: 1,
          diaInicioLectura: 1,
          diasVencimientoFactura: 30,
          estado: true
        });
      }
    }
  }, [isOpen, mode, ciclo, form]);

  const handleSubmit = async (data: CicloFormValues) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await api.post('/crearCiclo', data);
      } else if (mode === 'edit' && ciclo) {
        await api.put('/modificarCiclo', { ...data, id: ciclo.id });
      }

      onSuccess();
    } catch (error) {
      console.error('Error al procesar ciclo de facturación:', error);
      toast.error(
        mode === 'add'
          ? 'Error al crear el ciclo de facturación'
          : 'Error al actualizar el ciclo de facturación'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? 'Agregar Nuevo Ciclo de Facturación'
              : 'Editar Ciclo de Facturación'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete la información para crear un nuevo ciclo de facturación.'
              : 'Modifique los campos que desea actualizar.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4 pt-4'
          >
            <FormField
              control={form.control}
              name='descripcion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Ciclo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ej: Ciclo Mensual Residencial'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='diaFacturacion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día de Facturación</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='1'
                      max='31'
                      placeholder='1'
                      {...field}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Día del mes en que se realiza la facturación (1-31)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='diaInicioLectura'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día de Inicio de Lectura</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='1'
                      max='31'
                      placeholder='1'
                      {...field}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Día del mes en que inicia el período de lecturas (1-31)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='diasVencimientoFactura'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días de Vencimiento</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='1'
                      max='365'
                      placeholder='30'
                      {...field}
                      onChange={e =>
                        field.onChange(parseInt(e.target.value) || 30)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Número de días para el vencimiento de la factura
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel>Estado del Ciclo</FormLabel>
                    <FormDescription>
                      {field.value ? 'Ciclo activo' : 'Ciclo inactivo'}
                    </FormDescription>
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

            <DialogFooter className='gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading} variant='default'>
                {(() => {
                  if (isLoading) {
                    return mode === 'add' ? 'Creando...' : 'Actualizando...';
                  }
                  return mode === 'add' ? 'Crear Ciclo' : 'Actualizar Ciclo';
                })()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
