import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

import React from 'react';

import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';

import { getReactSelectStyles } from '~/components/shared/react-select-styles';
import { useTheme } from '~/components/theme-provider';
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
import { Textarea } from '~/components/ui/textarea';
import type { ConceptoAsociables, Concepto } from '~/types/mantencion';

const conceptoSchema = z.object({
  denominacion: z
    .string()
    .min(1, 'La denominación es requerida')
    .max(100, 'La denominación no debe exceder 100 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(200, 'La descripción no debe exceder 200 caracteres'),
  unidad: z
    .string()
    .min(1, 'La unidad es requerida')
    .max(20, 'La unidad no debe exceder 20 caracteres'),
  fijoVariable: z.string().min(1, 'El tipo Fijo/Variable es requerido'),
  conceptoAsociado: z.string().optional()
});

type ConceptoFormData = z.infer<typeof conceptoSchema>;

interface ConceptoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  concepto?: Concepto;
  mode: 'add' | 'edit';
  comboAsociadoConceptos: ConceptoAsociables[];
}

export default function ConceptoFormModal({
  isOpen,
  onClose,
  onSuccess,
  concepto,
  mode,
  comboAsociadoConceptos
}: ConceptoFormModalProps) {
  const form = useForm<ConceptoFormData>({
    resolver: zodResolver(conceptoSchema),
    defaultValues: {
      denominacion: concepto?.denominacion || '',
      descripcion: concepto?.descripcion || '',
      unidad: concepto?.unidad || '',
      fijoVariable: concepto?.fijoVariable || '',
      conceptoAsociado: concepto?.conceptoAsociado || undefined
    }
  });
  const { theme } = useTheme();

  // Usar estilos compartidos para react-select
  const selectStyles = getReactSelectStyles(theme);

  const isLoading = form.formState.isSubmitting;

  React.useEffect(() => {
    if (isOpen) {
      // Buscar el conceptoAsociado a partir de la descripción si no viene el ID
      let conceptoAsociadoFinal = concepto?.conceptoAsociado;

      if (!conceptoAsociadoFinal && concepto?.descripcion) {
        const asociadoEncontrado = comboAsociadoConceptos.find(
          a => a.descripcion === concepto.descripcion
        );
        if (asociadoEncontrado) {
          conceptoAsociadoFinal = asociadoEncontrado.id.toString();
        }
      }

      form.reset({
        denominacion: concepto?.denominacion || '',
        descripcion: concepto?.descripcion || '',
        unidad: concepto?.unidad || '',
        fijoVariable: concepto?.fijoVariable || '',
        conceptoAsociado: conceptoAsociadoFinal ?? undefined
      });
    }
  }, [isOpen, concepto, comboAsociadoConceptos, form]);

  const onSubmit = async (data: ConceptoFormData) => {
    try {
      const { default: api } = await import('~/lib/api');

      if (mode === 'add') {
        await api.post('/conceptos/crear', data);
      } else {
        await api.put(`/conceptos/editar`, { ...data, id: concepto?.id });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar el concepto:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nuevo Concepto' : 'Editar Concepto'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear un nuevo concepto'
              : 'Modifique los datos del concepto seleccionado'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='denominacion'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Denominación</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Ingrese la denominación' />
                    </FormControl>
                    <FormDescription>Máximo 100 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='unidad'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='Ej: kWh, m3, unidades' />
                    </FormControl>
                    <FormDescription>Máximo 20 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='descripcion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Ingrese la descripción del concepto'
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Máximo 200 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                  Tipo
                </label>
                <Controller
                  name='fijoVariable'
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={
                        field.value
                          ? {
                              value: field.value,
                              label:
                                field.value === 'FIJO' || field.value === 'F'
                                  ? 'Fijo'
                                  : 'Variable'
                            }
                          : null
                      }
                      onChange={(selectedOption: any) =>
                        field.onChange(selectedOption?.value || '')
                      }
                      options={[
                        { value: 'F', label: 'Fijo' },
                        { value: 'V', label: 'Variable' }
                      ]}
                      placeholder='Seleccione el tipo'
                      isClearable
                      className='mt-1'
                      styles={selectStyles}
                    />
                  )}
                />
                <p className='text-sm text-muted-foreground mt-1'>
                  Indica si el concepto es fijo o variable
                </p>
                {form.formState.errors.fijoVariable && (
                  <p className='text-sm font-medium text-destructive mt-1'>
                    {form.formState.errors.fijoVariable.message}
                  </p>
                )}
              </div>

              <div>
                <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                  Asociado (Opcional)
                </label>
                <Controller
                  name='conceptoAsociado'
                  control={form.control}
                  render={({ field }) => {
                    // Filtrar el elemento "Seleccione.." (id: 0)
                    const validAsociados = comboAsociadoConceptos.filter(
                      a => a.id !== 0
                    );

                    const selectedAsociado =
                      field.value != null && field.value !== '0'
                        ? validAsociados.find(
                            a => a.id.toString() === field.value
                          )
                        : null;

                    return (
                      <Select
                        value={
                          selectedAsociado
                            ? {
                                value: selectedAsociado.id,
                                label: selectedAsociado.descripcion
                              }
                            : null
                        }
                        onChange={(selectedOption: any) => {
                          const newValue = selectedOption?.value ?? undefined;
                          field.onChange(newValue);
                        }}
                        options={validAsociados.map(asociado => ({
                          value: asociado.id,
                          label: asociado.descripcion
                        }))}
                        placeholder='Seleccione el asociado'
                        isClearable
                        className='mt-1'
                        styles={selectStyles}
                      />
                    );
                  }}
                />
                <p className='text-sm text-muted-foreground mt-1'>
                  Seleccione un concepto asociado
                </p>
                {form.formState.errors.conceptoAsociado && (
                  <p className='text-sm font-medium text-destructive mt-1'>
                    {form.formState.errors.conceptoAsociado.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className='gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading} variant='default'>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'add' ? 'Crear Concepto' : 'Actualizar Concepto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
