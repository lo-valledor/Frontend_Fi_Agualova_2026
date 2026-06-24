import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Loader2, Percent } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select, { type SingleValue } from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

import { getReactSelectStyles, type OptionType } from '~/components/shared/react-select-styles';
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
import { Switch } from '~/components/ui/switch';
import { administracionService } from '~/services/administracionService';
import type {
  CondicionContratoFormValues,
  CondicionesContratoRow
} from '~/types/administracion';
import type { Concepto } from '~/types/mantencion';

const condicionContratoFormSchema = z.object({
  id: z.number().optional(),
  descripcion: z
    .string()
    .min(1, { message: 'La descripción es requerida.' }),
  idConcepto: z.coerce
    .number()
    .int()
    .positive({ message: 'El concepto es requerido.' }),
  tipoCondicion: z.number().int(),
  valor: z.number({ message: 'El valor es requerido.' }),
  estado: z.boolean()
});

type CondicionContratoFormData = z.infer<typeof condicionContratoFormSchema>;

interface CondicionesContratoModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  condicionContrato: CondicionesContratoRow | null;
  mode: 'add' | 'edit';
  conceptos: Concepto[];
}

export default function CondicionesContratoModalForm({
  isOpen,
  onClose,
  onSuccess,
  condicionContrato,
  mode,
  conceptos
}: Readonly<CondicionesContratoModalFormProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const selectStyles = getReactSelectStyles(theme);

  const form = useForm<CondicionContratoFormData>({
    resolver: zodResolver(condicionContratoFormSchema),
    defaultValues: {
      id: 0,
      descripcion: '',
      idConcepto: 0,
      tipoCondicion: 1,
      valor: 0,
      estado: true
    }
  });

  const usaPorcentaje = form.watch('tipoCondicion') === 1;

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && condicionContrato) {
      const tipoCondicion = condicionContrato.factorPorcentual ? 1 : 0;

      let valor = 0;
      if (tipoCondicion === 1 && condicionContrato.factorPorcentual) {
        const factorStr = String(condicionContrato.factorPorcentual).replace(
          ',',
          '.'
        );
        valor = parseFloat(factorStr) * 100;
      } else if (condicionContrato.valorFijo) {
        valor =
          typeof condicionContrato.valorFijo === 'string'
            ? parseFloat(String(condicionContrato.valorFijo).replace(',', '.'))
            : condicionContrato.valorFijo;
      }

      const conceptoEncontrado = conceptos.find(
        c => c.descripcion === condicionContrato.concepto
      );
      const idConcepto = conceptoEncontrado?.id ?? 0;

      form.reset({
        id: condicionContrato.id,
        descripcion: condicionContrato.descripcion,
        idConcepto,
        tipoCondicion,
        valor,
        estado: condicionContrato.estado
      });
    } else {
      form.reset({
        id: 0,
        descripcion: '',
        idConcepto: 0,
        tipoCondicion: 1,
        valor: 0,
        estado: true
      });
    }
  }, [isOpen, mode, condicionContrato, conceptos, form]);

  const onSubmit = async (data: CondicionContratoFormData) => {
    setIsLoading(true);
    try {
      const valorParaAPI = data.tipoCondicion === 1 ? data.valor / 100 : data.valor;

      const payload: CondicionContratoFormValues = {
        id: mode === 'edit' && condicionContrato ? condicionContrato.id : 0,
        descripcion: data.descripcion,
        idConcepto: data.idConcepto,
        tipoCondicion: data.tipoCondicion,
        valor: valorParaAPI,
        estado: data.estado
      };

      let result;
      if (mode === 'add') {
        result = await administracionService.createCondicionContrato(payload);
      } else if (mode === 'edit' && condicionContrato) {
        result = await administracionService.updateCondicionContrato(payload);
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al guardar la condición de contrato';
      console.error('Error al guardar la condición de contrato:', error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? 'Agregar Nueva Condición de Contrato'
              : 'Editar Condición de Contrato'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear una nueva condición de contrato.'
              : 'Modifique los datos de la condición de contrato seleccionada.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ingrese la descripción" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              name="idConcepto"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto</FormLabel>
                  <Select
                    options={conceptos.map(concepto => ({
                      value: concepto.id,
                      label: concepto.descripcion
                    }))}
                    value={
                      field.value
                        ? {
                            value: field.value,
                            label:
                              conceptos.find(c => c.id === field.value)
                                ?.descripcion || ''
                          }
                        : null
                    }
                    onChange={(option: SingleValue<OptionType>) =>
                      field.onChange(option ? Number(option.value) : 0)
                    }
                    placeholder="Seleccione un concepto"
                    styles={selectStyles}
                    isClearable
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipoCondicion"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Tipo de Valor</FormLabel>
                      <FormDescription>
                        {field.value === 1 ? 'Porcentual' : 'Valor Fijo'}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 1}
                        onCheckedChange={checked =>
                          field.onChange(checked ? 1 : 0)
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {usaPorcentaje
                        ? 'Porcentaje (%)'
                        : 'Valor Fijo ($)'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          placeholder={usaPorcentaje ? '5' : '0'}
                          className="pl-8"
                          value={field.value}
                          onChange={event => {
                            const rawValue = event.target.value;
                            const normalizedValue = rawValue.replace(',', '.');
                            const numericValue = parseFloat(normalizedValue);

                            if (!isNaN(numericValue)) {
                              field.onChange(numericValue);
                            } else if (
                              rawValue === '' ||
                              rawValue === '0' ||
                              rawValue === '-'
                            ) {
                              field.onChange(
                                rawValue === '-' ? field.value : 0
                              );
                            }
                          }}
                        />
                        {usaPorcentaje ? (
                          <Percent className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        ) : (
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      {usaPorcentaje
                        ? 'Ingrese el porcentaje (ej: 5 para 5%, -5 para descuento de 5%)'
                        : 'Ingrese el valor fijo en pesos'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Estado</FormLabel>
                    <FormDescription>
                      Activa o desactiva la condición de contrato
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

            <DialogFooter>
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
                {mode === 'add' ? 'Crear' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
