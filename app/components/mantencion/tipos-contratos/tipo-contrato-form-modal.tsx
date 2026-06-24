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
import type { TipoContrato, TipoContratoFormValues } from '~/types/mantencion';

const tipoContratoSchema = z.object({
  id: z.number().optional(),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres.' }),
  estado: z.boolean()
});

type TipoContratoFormData = z.infer<typeof tipoContratoSchema>;

interface TipoContratoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipoContrato: TipoContrato | null;
  mode: 'add' | 'edit';
}

export default function TipoContratoFormModal({
  isOpen,
  onClose,
  onSuccess,
  tipoContrato,
  mode
}: Readonly<TipoContratoFormModalProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TipoContratoFormData>({
    resolver: zodResolver(tipoContratoSchema),
    defaultValues: {
      id: 0,
      nombre: '',
      estado: true
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && tipoContrato) {
        form.reset({
          id: tipoContrato.id,
          nombre: tipoContrato.nombre,
          estado: tipoContrato.estado
        });
      } else {
        form.reset({
          id: 0,
          nombre: '',
          estado: true
        });
      }
    }
  }, [isOpen, mode, tipoContrato, form]);

  const onSubmit = async (data: TipoContratoFormData) => {
    setIsLoading(true);
    try {
      const payload: TipoContratoFormValues = {
        id: mode === 'edit' && tipoContrato ? tipoContrato.id : 0,
        nombre: data.nombre,
        estado: data.estado
      };

      let result;
      if (mode === 'add') {
        result = await mantencionService.createTipoContrato(payload);
      } else if (mode === 'edit' && tipoContrato) {
        result = await mantencionService.updateTipoContrato(payload);
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar el tipo de contrato:', error);
      toast.error(
        mode === 'add'
          ? 'Error al crear el tipo de contrato'
          : 'Error al actualizar el tipo de contrato'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? 'Agregar Nuevo Tipo de Contrato'
              : 'Editar Tipo de Contrato'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear un nuevo tipo de contrato.'
              : 'Modifique los datos del tipo de contrato seleccionado.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese el nombre del tipo de contrato"
                    />
                  </FormControl>
                  <FormDescription>Máximo 100 caracteres</FormDescription>
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
