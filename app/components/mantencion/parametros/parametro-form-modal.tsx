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
import { Textarea } from '~/components/ui/textarea';
import { mantencionService } from '~/services/mantencionService';
import type { Parametro, ParametroFormValues } from '~/types/mantencion';

const parametroSchema = z.object({
  id: z.number().optional(),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(200, { message: 'El nombre no debe exceder 200 caracteres.' }),
  valor: z
    .string()
    .min(1, { message: 'El valor es requerido.' })
    .max(100, { message: 'El valor no debe exceder 100 caracteres.' }),
  sigla: z
    .string()
    .min(1, { message: 'La sigla es requerida.' })
    .max(10, { message: 'La sigla no debe exceder 10 caracteres.' }),
  estado: z.boolean()
});

type ParametroFormData = z.infer<typeof parametroSchema>;

interface ParametroFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parametro: Parametro | null;
  mode: 'add' | 'edit';
}

export default function ParametroFormModal({
  isOpen,
  onClose,
  onSuccess,
  parametro,
  mode
}: Readonly<ParametroFormModalProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ParametroFormData>({
    resolver: zodResolver(parametroSchema),
    defaultValues: {
      id: 0,
      nombre: '',
      valor: '',
      sigla: '',
      estado: true
    }
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && parametro) {
      form.reset({
        id: parametro.id,
        nombre: parametro.nombre,
        valor: parametro.valor,
        sigla: parametro.sigla,
        estado: parametro.estado
      });
    } else {
      form.reset({
        id: 0,
        nombre: '',
        valor: '',
        sigla: '',
        estado: true
      });
    }
  }, [isOpen, mode, parametro, form]);

  const onSubmit = async (data: ParametroFormData) => {
    setIsLoading(true);
    try {
      const payload: ParametroFormValues = {
        id: mode === 'edit' && parametro ? parametro.id : 0,
        nombre: data.nombre,
        valor: data.valor,
        sigla: data.sigla,
        estado: data.estado
      };

      let result;
      if (mode === 'add') {
        result = await mantencionService.createParametro(payload);
      } else if (mode === 'edit' && parametro) {
        result = await mantencionService.updateParametro(payload);
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar el parámetro:', error);
      toast.error(
        mode === 'add'
          ? 'Error al crear el parámetro'
          : 'Error al actualizar el parámetro'
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
            {mode === 'add' ? 'Agregar Nuevo Parámetro' : 'Editar Parámetro'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear un nuevo parámetro.'
              : 'Modifique los datos del parámetro seleccionado.'}
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
                    <Textarea
                      {...field}
                      placeholder="Ingrese el nombre del parámetro"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Máximo 200 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el valor" />
                    </FormControl>
                    <FormDescription>Máximo 100 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sigla"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sigla</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: PAR, CONF" />
                    </FormControl>
                    <FormDescription>Máximo 10 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm">
                  <div className="space-y-0.5">
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
                {mode === 'add' ? 'Crear Parámetro' : 'Actualizar Parámetro'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
