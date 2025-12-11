import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, Loader2, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import React, { useEffect } from 'react';

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
import { Switch } from '~/components/ui/switch';
import api from '~/lib/api';
import type { GetCondicionesContrato } from '~/types/administracion';
import type { Conceptos } from '~/types/mantencion';

const condicionContratoFormSchema = z.object({
  descripcion: z.string().min(1, { message: 'La descripción es requerida.' }),
  conceptoId: z.number().min(1, { message: 'El concepto es requerido.' }),
  usaPorcentaje: z.boolean(),
  valor: z.number({ message: 'El valor es requerido.' }),
  estado: z.boolean()
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
  conceptos
}: Readonly<CondicionesContratoModalFormProps>) {
  const { theme } = useTheme();
  const form = useForm<CondicionContratoFormValues>({
    resolver: zodResolver(condicionContratoFormSchema),
    defaultValues: {
      descripcion: '',
      conceptoId: 0,
      usaPorcentaje: true,
      valor: 0,
      estado: true
    }
  });

  // Usar estilos compartidos para react-select
  const selectStyles = getReactSelectStyles(theme);

  const isLoading = form.formState.isSubmitting;

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      // DEBUG: Ver qué datos vienen del backend
      console.log('=== DEBUG: Cargando datos en formulario ===');
      console.log('condicionContrato completo:', condicionContrato);
      console.log(
        'factorPorcentual (raw):',
        condicionContrato?.factorPorcentual,
        typeof condicionContrato?.factorPorcentual
      );
      console.log(
        'valorFijo (raw):',
        condicionContrato?.valorFijo,
        typeof condicionContrato?.valorFijo
      );

      // Determinar si usa porcentaje basado en los datos existentes
      const usaPorcentaje = !!condicionContrato?.factorPorcentual;

      // Parsear el valor según el tipo
      let valor = 0;
      if (usaPorcentaje && condicionContrato?.factorPorcentual) {
        // Si es string con coma, reemplazar por punto
        const factorStr = String(condicionContrato.factorPorcentual).replace(
          ',',
          '.'
        );
        // El backend guarda como decimal (0.05), mostramos como porcentaje (5)
        valor = parseFloat(factorStr) * 100;
      } else if (condicionContrato?.valorFijo) {
        valor =
          typeof condicionContrato.valorFijo === 'string'
            ? parseFloat(String(condicionContrato.valorFijo).replace(',', '.'))
            : condicionContrato.valorFijo;
      }

      console.log('usaPorcentaje calculado:', usaPorcentaje);
      console.log('valor calculado (para mostrar):', valor);

      // Encontrar el conceptoId basado en el nombre del concepto
      const conceptoEncontrado = conceptos.find(
        c => c.descripcion === condicionContrato?.concepto
      );
      const conceptoId = conceptoEncontrado?.id || 0;

      const formValues = {
        descripcion: condicionContrato?.nombre || '',
        conceptoId: conceptoId,
        usaPorcentaje: usaPorcentaje,
        valor: valor,
        estado: condicionContrato?.estado ?? true
      };

      console.log('Form values a establecer:', formValues);
      console.log('===========================================');

      form.reset(formValues);
    }
  }, [isOpen, condicionContrato, form, conceptos]);

  const onSubmit = async (data: CondicionContratoFormValues) => {
    try {
      // Calcular el valor a enviar a la API
      // Si usa porcentaje: el usuario ingresa 5 (para 5%), lo convertimos a 0.05
      // Si es valor fijo: se envía tal cual
      const valorParaAPI = data.usaPorcentaje ? data.valor / 100 : data.valor;

      // Mapear los datos del formulario al formato esperado por la API
      const apiPayload = {
        codigo: condicionContrato?.id || 0, // Para edición, usar el código existente
        nombre: data.descripcion, // La API espera "nombre", no "descripcion"
        conceptoId: data.conceptoId,
        usaPorcentaje: data.usaPorcentaje,
        valor: valorParaAPI,
        estado: data.estado
      };

      // DEBUG: Mostrar datos que se envían
      console.log('=== DEBUG: Condición Contrato Submit ===');
      console.log('Mode:', mode);
      console.log('Condición ID:', condicionContrato?.id);
      console.log('Form Data (raw):', data);
      console.log('API Payload:', apiPayload);
      console.log(
        'Endpoint:',
        mode === 'add'
          ? 'condicion-contrato/condicionContrato-crear'
          : `/condicion-contrato/condicionContrato-modificar/${condicionContrato?.id}`
      );
      // JSON para copiar y pegar en Swagger
      console.log('📋 JSON para Swagger (copia esto):');
      console.log(JSON.stringify(apiPayload, null, 2));
      console.log('========================================');

      if (mode === 'add') {
        const response = await api.post(
          'condicion-contrato/condicionContrato-crear',
          apiPayload
        );
        console.log('CREATE Response:', response);
      } else {
        const response = await api.put(
          `/condicion-contrato/condicionContrato-modificar/${condicionContrato?.id}`,
          apiPayload
        );
        console.log('UPDATE Response:', response);
      }
      toast.success(
        mode === 'add'
          ? 'Condición de contrato creada exitosamente'
          : 'Condición de contrato actualizada exitosamente'
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('=== DEBUG: Error en Submit ===');
      console.error('Error completo:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('==============================');

      const errorMessage =
        error.response?.data?.message ||
        'Error al guardar la condición de contrato';
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='descripcion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Ingrese la descripción' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              name='conceptoId'
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
                    onChange={(option: any) =>
                      field.onChange(option?.value || 0)
                    }
                    placeholder='Seleccione un concepto'
                    styles={selectStyles}
                    isClearable
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='usaPorcentaje'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-xl border p-4'>
                    <div className='space-y-0.5'>
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
                name='valor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch('usaPorcentaje')
                        ? 'Porcentaje (%)'
                        : 'Valor Fijo ($)'}
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          {...field}
                          type='number'
                          step='any'
                          placeholder={form.watch('usaPorcentaje') ? '5' : '0'}
                          className='pl-8'
                          value={field.value}
                          onChange={e => {
                            // Manejar tanto coma como punto como separador decimal
                            const rawValue = e.target.value;
                            const normalizedValue = rawValue.replace(',', '.');
                            const numericValue = parseFloat(normalizedValue);

                            // DEBUG
                            console.log('Input valor:', {
                              rawValue,
                              normalizedValue,
                              numericValue
                            });

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
                        {form.watch('usaPorcentaje') ? (
                          <Percent className='absolute left-2 top-2.5 h-4 w-4 text-gray-500' />
                        ) : (
                          <DollarSign className='absolute left-2 top-2.5 h-4 w-4 text-gray-500' />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      {form.watch('usaPorcentaje')
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
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-xl border p-4'>
                  <div className='space-y-0.5'>
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
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isLoading} variant='default'>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'add' ? 'Crear' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
