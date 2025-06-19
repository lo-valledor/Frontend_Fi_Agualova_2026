import React, { useEffect, useState } from 'react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import type { Zonas } from '~/types/mantencion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { toast } from 'sonner';
import api from '~/lib/api';

const zonaFormSchema = z.object({
  nombre: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(50, { message: 'El nombre no puede exceder 50 caracteres.' }),
  referencia: z
    .string()
    .min(1, { message: 'La referencia es requerida.' })
    .max(20, { message: 'La referencia no puede exceder 20 caracteres.' }),
  estado: z.boolean(),
});

type ZonaFormValues = z.infer<typeof zonaFormSchema>;

interface ZonaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zona: Zonas | null;
  mode: 'add' | 'edit';
}

export default function ZonaFormModal({
  isOpen,
  onClose,
  onSuccess,
  zona,
  mode,
}: ZonaFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ZonaFormValues>({
    resolver: zodResolver(zonaFormSchema),
    defaultValues: {
      nombre: '',
      referencia: '',
      estado: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && zona) {
        form.reset({
          nombre: zona.nombre,
          referencia: zona.referencia,
          estado: zona.estado,
        });
      } else {
        form.reset({
          nombre: '',
          referencia: '',
          estado: true,
        });
      }
    }
  }, [isOpen, mode, zona, form]);

  const handleSubmit = async (data: ZonaFormValues) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await api.post('/crearZona', data);
      } else if (mode === 'edit' && zona) {
        await api.put(`/modificarZona/${zona.id}`, data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error al procesar la zona:', error);
      toast.error(
        mode === 'add'
          ? 'Error al crear la zona'
          : 'Error al actualizar la zona',
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nueva Zona' : 'Editar Zona'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete la información para crear una nueva zona.'
              : 'Modifique los campos que desea actualizar.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Zona</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Zona Norte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: ZN-01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Estado de la Zona</FormLabel>
                    <FormDescription>
                      {field.value ? 'Zona activa' : 'Zona inactiva'}
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

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-sky-600 hover:bg-sky-700"
              >
                {isLoading
                  ? mode === 'add'
                    ? 'Creando...'
                    : 'Actualizando...'
                  : mode === 'add'
                    ? 'Crear Zona'
                    : 'Actualizar Zona'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
