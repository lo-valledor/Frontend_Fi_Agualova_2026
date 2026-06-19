import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import type { Tarifa } from '~/types/mantencion';

const tarifaSchema = z.object({
  codigo: z
    .string()
    .min(1, 'El código es requerido')
    .max(20, 'El código no debe exceder 20 caracteres'),
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no debe exceder 100 caracteres')
});

type TarifaFormData = z.infer<typeof tarifaSchema>;

interface TarifaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tarifa?: Tarifa;
  mode: 'add' | 'edit';
}

export default function TarifaFormModal({
  isOpen,
  onClose,
  onSuccess,
  tarifa,
  mode
}: TarifaFormModalProps) {
  const form = useForm<TarifaFormData>({
    resolver: zodResolver(tarifaSchema),
    defaultValues: {
      codigo: tarifa?.codigo || '',
      nombre: tarifa?.nombre || ''
    }
  });

  const isLoading = form.formState.isSubmitting;

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        codigo: tarifa?.codigo || '',
        nombre: tarifa?.nombre || ''
      });
    }
  }, [isOpen, tarifa, form]);

  const onSubmit = async (data: TarifaFormData) => {
    try {
      const { default: api } = await import('~/lib/api');

      if (mode === 'add') {
        await api.post('/tarifas/crear', data);
      } else {
        await api.put(`/tarifas/editar`, { ...data, id: tarifa?.id });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar la tarifa:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nueva Tarifa' : 'Editar Tarifa'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear una nueva tarifa'
              : 'Modifique los datos de la tarifa seleccionada'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={mode === 'edit'}
                      className={mode === 'edit' ? 'bg-muted' : ''}
                      placeholder="Ingrese el código"
                    />
                  </FormControl>
                  <FormDescription>Máximo 20 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese el nombre de la tarifa"
                    />
                  </FormControl>
                  <FormDescription>Máximo 100 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} variant="default">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'add' ? 'Crear Tarifa' : 'Actualizar Tarifa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
