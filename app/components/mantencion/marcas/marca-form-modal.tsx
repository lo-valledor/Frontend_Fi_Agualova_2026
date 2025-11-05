import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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
import api from '~/lib/api';
import type { Marca } from '~/types/mantencion';

const marcaFormSchema = z.object({
  codigo: z
    .string()
    .min(1, { message: 'El código es requerido.' })
    .max(20, { message: 'El código no puede exceder 20 caracteres.' }),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres.' })
});

type MarcaFormValues = z.infer<typeof marcaFormSchema>;

interface MarcaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  marca: Marca | null;
  mode: 'add' | 'edit';
}

export default function MarcaFormModal({
  isOpen,
  onClose,
  onSuccess,
  marca,
  mode
}: Readonly<MarcaFormModalProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MarcaFormValues>({
    resolver: zodResolver(marcaFormSchema),
    defaultValues: {
      codigo: '',
      nombre: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && marca) {
        form.reset({
          codigo: marca.codigo,
          nombre: marca.nombre
        });
      } else {
        form.reset({
          codigo: '',
          nombre: ''
        });
      }
    }
  }, [isOpen, mode, marca, form]);

  const handleSubmit = async (data: MarcaFormValues) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await api.post('/crearMarcaM', data);
      } else if (mode === 'edit' && marca) {
        await api.put('/modificarMarca', { ...data, id: marca.id });
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        mode === 'add'
          ? 'Error al crear la marca'
          : 'Error al actualizar la marca'
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
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nueva Marca' : 'Editar Marca'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete la información para crear una nueva marca.'
              : 'Modifique los campos que desea actualizar.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='codigo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Ej: ABC123'
                      {...field}
                      disabled={mode === 'edit'}
                      className={mode === 'edit' ? 'bg-muted' : ''}
                    />
                  </FormControl>
                  <FormDescription>
                    {mode === 'edit'
                      ? 'El código no se puede modificar'
                      : 'Máximo 20 caracteres'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Siemens' {...field} />
                  </FormControl>
                  <FormDescription>Máximo 100 caracteres</FormDescription>
                  <FormMessage />
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
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'add' ? 'Crear Marca' : 'Actualizar Marca'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
