import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Loader2, Percent } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select, { type SingleValue } from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  getReactSelectStyles,
  type OptionType
} from '~/components/shared/react-select-styles';
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
  CondicionContrato,
  CondicionContratoConcepto,
  CondicionContratoFormValues
} from '~/types/administracion';

const condicionContratoFormSchema = z.object({
  id: z.number().optional(),
  descripcion: z.string().min(1, { message: 'La descripción es requerida.' }),
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
  condicionContrato: CondicionContrato | null;
  mode: 'add' | 'edit';
  conceptos: CondicionContratoConcepto[];
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
      const tipoCondicion = condicionContrato.tipoCondicion;
      const valor =
        tipoCondicion === 1
          ? condicionContrato.valor * 100
          : condicionContrato.valor;

      form.reset({
        id: condicionContrato.id,
        descripcion: condicionContrato.descripcion,
        idConcepto: condicionContrato.idConcepto,
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
  }, [isOpen, mode, condicionContrato, form]);

  const onSubmit = async (data: CondicionContratoFormData) => {
    setIsLoading(true);
    try {
      const valorParaAPI = Math.round(data.valor);

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
              render={({ field }) => {
                const numericValue = Number(field.value) || 0;
                const conceptoOptions = conceptos.map(concepto => ({
                  value: Number(concepto.id),
                  label: concepto.descripcion
                }));
                const selectedOption =
                  conceptoOptions.find(
                    option => option.value === numericValue
                  ) ?? null;

                return (
                  <FormItem>
                    <FormLabel>Concepto</FormLabel>
                    <Select
                      options={conceptoOptions}
                      value={selectedOption}
                      onChange={(option: SingleValue<OptionType>) =>
                        field.onChange(option ? Number(option.value) : 0)
                      }
                      placeholder="Seleccione un concepto"
                      styles={selectStyles}
                      isClearable
                    />
                    <FormMessage />
                  </FormItem>
                );
              }}
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
                          field.onChange(checked ? 1 : 2)
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
                      {usaPorcentaje ? 'Porcentaje (%)' : 'Valor Fijo ($)'}
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
