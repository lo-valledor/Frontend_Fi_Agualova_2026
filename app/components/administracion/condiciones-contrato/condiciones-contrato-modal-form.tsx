import React, { useEffect } from 'react';
import { z } from 'zod';
import type { GetCondicionesContrato } from '~/types/administracion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '~/lib/api';
import { toast } from 'sonner';
import Select, { type StylesConfig } from 'react-select';
import type { Conceptos } from '~/types/mantencion';
import { useTheme } from '~/components/theme-provider';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { Loader2, Percent, DollarSign } from 'lucide-react';

const condicionContratoFormSchema = z.object({
  descripcion: z.string().min(1, { message: 'La descripción es requerida.' }),
  conceptoId: z.number().min(1, { message: 'El concepto es requerido.' }),
  usaPorcentaje: z.boolean(),
  valor: z.number().min(0, { message: 'El valor debe ser mayor o igual a 0.' }),
  estado: z.boolean(),
});

type CondicionContratoFormValues = z.infer<typeof condicionContratoFormSchema>;

interface CondicionesContratoModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  condicionContrato: GetCondicionesContrato | undefined;
  mode: 'add' | 'edit';
  conceptos: Conceptos[];
}

export default function CondicionesContratoModalForm({
  isOpen,
  onClose,
  onSuccess,
  condicionContrato,
  mode,
  conceptos,
}: CondicionesContratoModalFormProps) {
  const { theme } = useTheme();
  const form = useForm<CondicionContratoFormValues>({
    resolver: zodResolver(condicionContratoFormSchema),
    defaultValues: {
      descripcion: '',
      conceptoId: 0,
      usaPorcentaje: true,
      valor: 0,
      estado: true,
    },
  });

  const selectStyles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
      '&:hover': {
        borderColor: theme === 'dark' ? '#475569' : '#CBD5E1',
      },
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? theme === 'dark'
          ? '#166534'
          : '#16A34A'
        : isFocused
          ? theme === 'dark'
            ? '#1E293B'
            : '#F1F5F9'
          : 'transparent',
      color: isSelected ? '#FFFFFF' : theme === 'dark' ? '#F8FAFC' : '#0F172A',
      ':active': {
        ...styles[':active'],
        backgroundColor: theme === 'dark' ? '#166534' : '#16A34A',
      },
    }),
    singleValue: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    }),
    input: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#334155' : '#E2E8F0',
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
      '&:hover': {
        color: theme === 'dark' ? '#CBD5E1' : '#374151',
      },
    }),
    noOptionsMessage: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
    }),
    loadingMessage: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
    }),
  };

  const isLoading = form.formState.isSubmitting;

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      // Determinar si usa porcentaje basado en los datos existentes
      const usaPorcentaje = condicionContrato?.factorPorcentual ? true : false;
      const valor = usaPorcentaje
        ? parseFloat(condicionContrato?.factorPorcentual || '0')
        : condicionContrato?.valorFijo || 0;

      // Encontrar el conceptoId basado en el nombre del concepto
      const conceptoEncontrado = conceptos.find(
        (c) => c.descripcion === condicionContrato?.concepto,
      );
      const conceptoId = conceptoEncontrado?.id || 0;

      form.reset({
        descripcion: condicionContrato?.descripcion || '',
        conceptoId: conceptoId,
        usaPorcentaje: usaPorcentaje,
        valor: valor,
        estado: condicionContrato?.estado ?? true,
      });
    }
  }, [isOpen, condicionContrato, form, conceptos]);

  const onSubmit = async (data: CondicionContratoFormValues) => {
    try {
      if (mode === 'add') {
        await api.post('condicion-contrato/condicionContrato-crear', data);
      } else {
        await api.put(
          `/condicion-contrato/condicionContrato-modificar/${condicionContrato?.id}`,
          data,
        );
      }
      toast.success(
        mode === 'add'
          ? 'Condición de contrato creada exitosamente'
          : 'Condición de contrato actualizada exitosamente',
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar la condición de contrato:', error);
      toast.error('Error al guardar la condición de contrato');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? 'Agregar Nueva Condición de Contrato'
              : 'Editar Condición de Contrato'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear una nueva condición de contrato'
              : 'Modifique los datos de la condición de contrato seleccionada'}
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
              name="conceptoId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto</FormLabel>
                  <Select
                    options={conceptos.map((concepto) => ({
                      value: concepto.id,
                      label: concepto.descripcion,
                    }))}
                    value={
                      field.value
                        ? {
                            value: field.value,
                            label:
                              conceptos.find((c) => c.id === field.value)
                                ?.descripcion || '',
                          }
                        : null
                    }
                    onChange={(option: any) =>
                      field.onChange(option?.value || 0)
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
                name="usaPorcentaje"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Tipo de Valor</FormLabel>
                      <FormDescription>
                        {field.value ? 'Porcentual' : 'Valor Fijo'}
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

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch('usaPorcentaje')
                        ? 'Factor Porcentual'
                        : 'Valor Fijo'}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type="number"
                          step={form.watch('usaPorcentaje') ? '0.01' : '1'}
                          placeholder={
                            form.watch('usaPorcentaje') ? '0.00' : '0'
                          }
                          className="pl-8"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        {form.watch('usaPorcentaje') ? (
                          <Percent className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        ) : (
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      {form.watch('usaPorcentaje')
                        ? 'Ingrese el factor porcentual (ej: 0.15 para 15%)'
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-sky-600 hover:bg-sky-700"
              >
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
