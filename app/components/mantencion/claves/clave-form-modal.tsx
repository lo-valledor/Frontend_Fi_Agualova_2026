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
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { Textarea } from '~/components/ui/textarea';
import type { Claves } from '~/types/mantencion';

const claveSchema = z.object({
  codigo: z
    .string()
    .min(1, 'El código es requerido')
    .max(20, 'El código no debe exceder 20 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(100, 'La descripción no debe exceder 100 caracteres'),
  tipo: z
    .string()
    .min(1, 'El tipo es requerido')
    .max(50, 'El tipo no debe exceder 50 caracteres'),
  estado: z.boolean(),
});

type ClaveFormData = z.infer<typeof claveSchema>;

interface ClaveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clave?: Claves;
  mode: 'add' | 'edit';
}

export default function ClaveFormModal({
  isOpen,
  onClose,
  onSuccess,
  clave,
  mode,
}: ClaveFormModalProps) {
  const form = useForm<ClaveFormData>({
    resolver: zodResolver(claveSchema),
    defaultValues: {
      codigo: clave?.codigo || '',
      descripcion: clave?.descripcion || '',
      tipo: clave?.tipo || '',
      estado: clave?.estado ?? true,
    },
  });

  const isLoading = form.formState.isSubmitting;

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        codigo: clave?.codigo || '',
        descripcion: clave?.descripcion || '',
        tipo: clave?.tipo || '',
        estado: clave?.estado ?? true,
      });
    }
  }, [isOpen, clave, form]);

  const onSubmit = async (data: ClaveFormData) => {
    try {
      const { default: api } = await import('~/lib/api');

      if (mode === 'add') {
        await api.post('/crearClaves', data);
      } else {
        await api.put(`/modificarClaves`, { ...data, id: clave?.id });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar la clave:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nueva Clave' : 'Editar Clave'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear una nueva clave'
              : 'Modifique los datos de la clave seleccionada'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='codigo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={mode === 'edit'}
                      className={mode === 'edit' ? 'bg-muted' : ''}
                      placeholder='Ingrese el código'
                    />
                  </FormControl>
                  <FormDescription>Máximo 20 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='descripcion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Ingrese la descripción'
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Máximo 100 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tipo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Ingrese el tipo' />
                  </FormControl>
                  <FormDescription>Máximo 50 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel>Estado</FormLabel>
                    <FormDescription>
                      Indica si la clave está activa o inactiva
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
                {mode === 'add' ? 'Crear' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
