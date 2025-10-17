import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';

import React, { useEffect, useState } from 'react';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import api from '~/lib/api';
import type { Empalme } from '~/types/mantencion';
import { generateNextCode } from '~/utils/auto-increment-utils';

const empalmeFormSchema = z.object({
  codigo: z
    .string()
    .min(1, { message: 'El código es requerido.' })
    .max(20, { message: 'El código no puede exceder 20 caracteres.' }),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres.' }),
  codigoCliente: z
    .string()
    .min(1, { message: 'El código del cliente es requerido.' })
    .max(20, {
      message: 'El código del cliente no puede exceder 20 caracteres.'
    }),
  potenciaContratada: z
    .number({ message: 'La potencia contratada debe ser un número válido.' })
    .positive({ message: 'La potencia contratada debe ser mayor a 0.' }),
  tarifa: z
    .string()
    .min(1, { message: 'La tarifa es requerida.' })
    .max(50, { message: 'La tarifa no puede exceder 50 caracteres.' })
});

type EmpalmeFormValues = z.infer<typeof empalmeFormSchema>;

interface EmpalmeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empalme: Empalme | null;
  mode: 'add' | 'edit';
  existingCodes: string[];
}

export default function EmpalmesModalForm({
  isOpen,
  onClose,
  onSuccess,
  empalme,
  mode,
  existingCodes
}: Readonly<EmpalmeFormModalProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmpalmeFormValues>({
    resolver: zodResolver(empalmeFormSchema),
    defaultValues: {
      codigo: '',
      nombre: '',
      codigoCliente: '',
      potenciaContratada: 0,
      tarifa: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && empalme) {
        form.reset({
          codigo: empalme.codigo,
          nombre: empalme.nombre,
          codigoCliente: empalme.codigoCliente,
          potenciaContratada: empalme.potenciaContratada,
          tarifa: empalme.tarifa
        });
      } else {
        // Generar el próximo código disponible para modo agregar
        const nextCode = generateNextCode(existingCodes, false);
        form.reset({
          codigo: String(nextCode),
          nombre: '',
          codigoCliente: '',
          potenciaContratada: 0,
          tarifa: ''
        });
      }
    }
  }, [isOpen, mode, empalme, existingCodes, form]);

  const handleSubmit = async (data: EmpalmeFormValues) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await api.post('/crearEmpalmes', data);
      } else if (mode === 'edit' && empalme) {
        await api.put('/modificarEmpalmes', {
          ...data,
          codigo: empalme.codigo
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error al procesar el empalme:', error);
      toast.error(
        mode === 'add'
          ? 'Error al crear el empalme'
          : 'Error al actualizar el empalme'
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
            {mode === 'add' ? 'Agregar Empalme' : 'Editar Empalme'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Completa los datos para crear un nuevo empalme.'
              : 'Modifica los datos del empalme seleccionado.'}
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
                  <FormLabel>Código del Empalme</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={true}
                      placeholder='Código numérico generado automáticamente'
                      className='bg-muted'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Empalme</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Ingrese el nombre del empalme'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='codigoCliente'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código del Cliente</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Ingrese el código del cliente'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='potenciaContratada'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potencia Contratada (kW)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='0.00'
                      onChange={e =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='tarifa'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarifa</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Ingrese la tarifa' />
                  </FormControl>
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
                {isLoading
                  ? mode === 'add'
                    ? 'Creando...'
                    : 'Actualizando...'
                  : mode === 'add'
                    ? 'Crear Empalme'
                    : 'Actualizar Empalme'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
