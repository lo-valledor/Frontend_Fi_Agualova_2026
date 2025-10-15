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
import { Textarea } from '~/components/ui/textarea';
import type { Parametro } from '~/types/mantencion';

const parametroSchema = z.object({
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(200, 'La descripción no debe exceder 200 caracteres'),
  valor: z
    .string()
    .min(1, 'El valor es requerido')
    .max(100, 'El valor no debe exceder 100 caracteres'),
  sigla: z
    .string()
    .min(1, 'La sigla es requerida')
    .max(10, 'La sigla no debe exceder 10 caracteres'),
  estado: z.boolean()
});

type ParametroFormData = z.infer<typeof parametroSchema>;

interface ParametroFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parametro?: Parametro;
  mode: 'add' | 'edit';
}

export default function ParametroFormModal({
  isOpen,
  onClose,
  onSuccess,
  parametro,
  mode
}: ParametroFormModalProps) {
  const form = useForm<ParametroFormData>({
    resolver: zodResolver(parametroSchema),
    defaultValues: {
      descripcion: parametro?.descripcion || '',
      valor: parametro?.valor || '',
      sigla: parametro?.sigla || '',
      estado: parametro?.estado ?? true
    }
  });

  const isLoading = form.formState.isSubmitting;

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        descripcion: parametro?.descripcion || '',
        valor: parametro?.valor || '',
        sigla: parametro?.sigla || '',
        estado: parametro?.estado ?? true
      });
    }
  }, [isOpen, parametro, form]);

  const onSubmit = async (data: ParametroFormData) => {
    try {
      const { default: api } = await import('~/lib/api');

      if (mode === 'add') {
        await api.post('/crearParametro', data);
      } else {
        await api.put(`/modificarParametro`, { ...data, id: parametro?.id });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar el parámetro:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nuevo Parámetro' : 'Editar Parámetro'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear un nuevo parámetro'
              : 'Modifique los datos del parámetro seleccionado'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='descripcion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Ingrese la descripción del parámetro'
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Máximo 200 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='valor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Ingrese el valor' />
                    </FormControl>
                    <FormDescription>Máximo 100 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='sigla'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sigla</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Ej: PAR, CONF' />
                    </FormControl>
                    <FormDescription>Máximo 10 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel>Estado</FormLabel>
                    <FormDescription>
                      Indica si el parámetro está activo o inactivo
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

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isLoading}
                className='bg-sky-600 hover:bg-sky-700'
              >
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'add' ? 'Crear Parámetro' : 'Actualizar Parámetro'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
