import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import React from 'react';

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
import type { TiposContrato } from '~/types/mantencion';

const tipoContratoSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no debe exceder 100 caracteres'),
  estado: z.boolean()
});

type TipoContratoFormData = z.infer<typeof tipoContratoSchema>;

interface TipoContratoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipoContrato?: TiposContrato;
  mode: 'add' | 'edit';
}

export default function TipoContratoFormModal({
  isOpen,
  onClose,
  onSuccess,
  tipoContrato,
  mode
}: Readonly<TipoContratoFormModalProps>) {
  const form = useForm<TipoContratoFormData>({
    resolver: zodResolver(tipoContratoSchema),
    defaultValues: {
      nombre: tipoContrato?.nombre || '',
      estado: tipoContrato?.estado !== false
    }
  });

  const isLoading = form.formState.isSubmitting;

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        nombre: tipoContrato?.nombre || '',
        estado: tipoContrato?.estado !== false
      });
    }
  }, [isOpen, tipoContrato, form]);

  const onSubmit = async (data: TipoContratoFormData) => {
    try {
      const { default: api } = await import('~/lib/api');


      
      if (mode === 'add') {
        await api.post('/crearTipoContrato', data);
      } else {
        await api.put(`/modificarTipoContrato`, {
          ...data,
          id: tipoContrato?.id
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar el tipo de contrato:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? 'Agregar Nuevo Tipo de Contrato'
              : 'Editar Tipo de Contrato'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear un nuevo tipo de contrato'
              : 'Modifique los datos del tipo de contrato seleccionado'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Ingrese el nombre del tipo de contrato'
                    />
                  </FormControl>
                  <FormDescription>Máximo 100 caracteres</FormDescription>
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
                    <FormLabel>Estado</FormLabel>
                    <FormDescription>
                      Indica si el tipo de contrato está activo o inactivo
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
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading} variant='default'>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'add'
                  ? 'Crear Tipo de Contrato'
                  : 'Actualizar Tipo de Contrato'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
