import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { mantencionService } from '~/services/mantencionService';
import type {
  Concepto,
  ConceptoAsociables,
  ConceptoFormValues
} from '~/types/mantencion';

const conceptoSchema = z.object({
  id: z.number().optional(),
  denominacion: z
    .string()
    .min(1, { message: 'La denominación es requerida.' })
    .max(100, { message: 'La denominación no debe exceder 100 caracteres.' }),
  descripcion: z
    .string()
    .min(1, { message: 'La descripción es requerida.' })
    .max(200, { message: 'La descripción no debe exceder 200 caracteres.' }),
  unidad: z
    .string()
    .min(1, { message: 'La unidad es requerida.' })
    .max(20, { message: 'La unidad no debe exceder 20 caracteres.' }),
  fijoVariable: z
    .string()
    .min(1, { message: 'El tipo Fijo/Variable es requerido.' }),
  conceptoAsociado: z.string()
});

type ConceptoFormData = z.infer<typeof conceptoSchema>;

interface ConceptoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  concepto: Concepto | null;
  mode: 'add' | 'edit';
  conceptoAsociables: ConceptoAsociables[];
}

export default function ConceptoFormModal({
  isOpen,
  onClose,
  onSuccess,
  concepto,
  mode,
  conceptoAsociables
}: Readonly<ConceptoFormModalProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ConceptoFormData>({
    resolver: zodResolver(conceptoSchema),
    defaultValues: {
      id: 0,
      denominacion: '',
      descripcion: '',
      unidad: '',
      fijoVariable: '',
      conceptoAsociado: ''
    }
  });

  const { theme } = useTheme();
  const selectStyles = getReactSelectStyles(theme);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && concepto) {
      let conceptoAsociadoFinal = concepto.conceptoAsociado;

      if (!conceptoAsociadoFinal && concepto.descripcion) {
        const encontrado = conceptoAsociables.find(
          a => a.descripcion === concepto.descripcion
        );
        if (encontrado) {
          conceptoAsociadoFinal = encontrado.id.toString();
        }
      }

      form.reset({
        id: concepto.id,
        denominacion: concepto.denominacion,
        descripcion: concepto.descripcion,
        unidad: concepto.unidad,
        fijoVariable: concepto.fijoVariable,
        conceptoAsociado: conceptoAsociadoFinal ?? ''
      });
    } else {
      form.reset({
        id: 0,
        denominacion: '',
        descripcion: '',
        unidad: '',
        fijoVariable: '',
        conceptoAsociado: ''
      });
    }
  }, [isOpen, mode, concepto, conceptoAsociables, form]);

  const onSubmit = async (data: ConceptoFormData) => {
    setIsLoading(true);
    try {
      const payload: ConceptoFormValues = {
        id: mode === 'edit' && concepto ? concepto.id : 0,
        denominacion: data.denominacion,
        descripcion: data.descripcion,
        unidad: data.unidad,
        fijoVariable: data.fijoVariable,
        conceptoAsociado: data.conceptoAsociado
      };

      let result;
      if (mode === 'add') {
        result = await mantencionService.createConcepto(payload);
      } else if (mode === 'edit' && concepto) {
        result = await mantencionService.updateConcepto(payload);
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar el concepto:', error);
      toast.error(
        mode === 'add'
          ? 'Error al crear el concepto'
          : 'Error al actualizar el concepto'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-137.5">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nuevo Concepto' : 'Editar Concepto'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear un nuevo concepto.'
              : 'Modifique los datos del concepto seleccionado.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="denominacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Denominación</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese la denominación" />
                    </FormControl>
                    <FormDescription>Máximo 100 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: kWh, m3, unidades" />
                    </FormControl>
                    <FormDescription>Máximo 20 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Ingrese la descripción del concepto"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Máximo 200 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Tipo
                </label>
                <Controller
                  name="fijoVariable"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      value={
                        field.value
                          ? {
                              value: field.value,
                              label:
                                field.value === 'F' ? 'Fijo' : 'Variable'
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
                      placeholder="Seleccione el tipo"
                      isClearable
                      className="mt-1"
                      styles={selectStyles}
                    />
                  )}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Indica si el concepto es fijo o variable
                </p>
                {form.formState.errors.fijoVariable && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {form.formState.errors.fijoVariable.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Asociado (Opcional)
                </label>
                <Controller
                  name="conceptoAsociado"
                  control={form.control}
                  render={({ field }) => {
                    const validAsociados = conceptoAsociables.filter(
                      a => a.id !== 0
                    );

                    const selectedAsociado =
                      field.value != null && field.value !== ''
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
                          const newValue = selectedOption
                            ? selectedOption.value.toString()
                            : '';
                          field.onChange(newValue);
                        }}
                        options={validAsociados.map(asociado => ({
                          value: asociado.id,
                          label: asociado.descripcion
                        }))}
                        placeholder="Seleccione el asociado"
                        isClearable
                        className="mt-1"
                        styles={selectStyles}
                      />
                    );
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Seleccione un concepto asociado
                </p>
                {form.formState.errors.conceptoAsociado && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {form.formState.errors.conceptoAsociado.message}
                  </p>
                )}
              </div>
            </div>

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
                {mode === 'add' ? 'Crear Concepto' : 'Actualizar Concepto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
