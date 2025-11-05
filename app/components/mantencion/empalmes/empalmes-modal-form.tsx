import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { Combobox } from '~/components/ui/combobox';
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
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { useTarifas } from '~/hooks/use-mantencion';
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
  const [isManualTarifa, setIsManualTarifa] = useState(false);

  // Cargar tarifas disponibles
  const { data: tarifas, loading: loadingTarifas } = useTarifas();

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
        // Verificar si la tarifa del empalme existe en el listado
        const tarifaExiste = tarifas.some(t => t.codigo === empalme.tarifa);
        setIsManualTarifa(!tarifaExiste);
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
        setIsManualTarifa(false);
      }
    }
  }, [isOpen, mode, empalme, existingCodes, tarifas, form]);

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
      console.error(error);
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
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Empalme' : 'Editar Empalme'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear un nuevo empalme.'
              : 'Modifique los datos del empalme seleccionado.'}
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
                      {...field}
                      disabled={true}
                      placeholder='Generado automáticamente'
                      className='bg-muted'
                    />
                  </FormControl>
                  <FormDescription>
                    Código numérico auto-generado
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
                    <Input
                      {...field}
                      placeholder='Ingrese el nombre del empalme'
                    />
                  </FormControl>
                  <FormDescription>Máximo 100 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='codigoCliente'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Cliente</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Código del cliente' />
                    </FormControl>
                    <FormDescription>Máx. 20 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='potenciaContratada'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potencia (kW)</FormLabel>
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
                    <FormDescription>En kW</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='tarifa'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between mb-2'>
                    <FormLabel>Tarifa</FormLabel>
                    <div className='flex items-center gap-2'>
                      <Label
                        htmlFor='manual-tarifa-switch'
                        className='text-sm text-muted-foreground cursor-pointer'
                      >
                        Entrada manual
                      </Label>
                      <Switch
                        id='manual-tarifa-switch'
                        checked={isManualTarifa}
                        onCheckedChange={setIsManualTarifa}
                        disabled={loadingTarifas || isLoading}
                      />
                    </div>
                  </div>
                  <FormControl>
                    {isManualTarifa ? (
                      <Input
                        {...field}
                        placeholder='Ingrese el código de tarifa'
                        disabled={isLoading}
                        maxLength={50}
                      />
                    ) : (
                      <Combobox
                        options={tarifas.map(t => ({
                          value: t.codigo,
                          label: `${t.codigo} - ${t.nombre}`
                        }))}
                        value={field.value}
                        onChange={value => field.onChange(value)}
                        placeholder='Seleccione una tarifa'
                        searchPlaceholder='Buscar tarifa...'
                        emptyMessage='No se encontraron tarifas disponibles'
                        disabled={loadingTarifas || isLoading}
                      />
                    )}
                  </FormControl>
                  <FormDescription>
                    {loadingTarifas
                      ? 'Cargando tarifas...'
                      : isManualTarifa
                        ? 'Ingrese manualmente el código de tarifa (no se agregará al mantenedor)'
                        : 'Seleccione de las tarifas existentes o active entrada manual'}
                  </FormDescription>
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
              <Button
                type='submit'
                disabled={isLoading || loadingTarifas}
                variant='default'
              >
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'add' ? 'Crear Empalme' : 'Actualizar Empalme'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
