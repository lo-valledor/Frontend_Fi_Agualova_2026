import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { Switch } from '~/components/ui/switch';
import { mantencionService } from '~/services/mantencionService';
import type { Zona, ZonaFormValues, ZonaProps } from '~/types/mantencion';

const zonaFormSchema = z.object({
  nombre: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(50, { message: 'El nombre no puede exceder 50 caracteres.' }),
  referencia: z
    .string()
    .min(1, { message: 'La referencia es requerida.' })
    .max(20, { message: 'La referencia no puede exceder 20 caracteres.' }),
  estado: z.boolean()
});

type ZonaFormInput = z.infer<typeof zonaFormSchema>;

interface ZonaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  zona: Zona | null;
  mode: 'add' | 'edit';
}

export default function ZonaFormModal({
  isOpen,
  onClose,
  onSuccess,
  zona,
  mode
}: ZonaFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ZonaFormInput>({
    resolver: zodResolver(zonaFormSchema),
    defaultValues: {
      nombre: '',
      referencia: '',
      estado: true
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && zona) {
        form.reset({
          nombre: zona.nombre,
          referencia: zona.referencia,
          estado: zona.estado
        });
      } else {
        form.reset({
          nombre: '',
          referencia: '',
          estado: true
        });
      }
    }
  }, [isOpen, mode, zona, form]);

  const handleSubmit = async (data: ZonaFormInput) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        const payload: ZonaProps = {
          nombre: data.nombre,
          referencia: data.referencia,
          estado: data.estado
        };
        await mantencionService.createZona(payload);
      } else if (mode === 'edit' && zona) {
        const payload: ZonaFormValues = {
          id: zona.id,
          nombre: data.nombre,
          referencia: data.referencia,
          estado: data.estado
        };
        await mantencionService.updateZona(payload);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        mode === 'add'
          ? 'Error al crear la zona'
          : 'Error al actualizar la zona'
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
      <DialogContent className="sm:max-w-md">
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
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Zona Norte" {...field} />
                  </FormControl>
                  <FormDescription>Máximo 50 caracteres</FormDescription>
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
                  <FormDescription>Máximo 20 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm">
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
              <Button type="submit" disabled={isLoading} variant="default">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'add' ? 'Crear Zona' : 'Actualizar Zona'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
