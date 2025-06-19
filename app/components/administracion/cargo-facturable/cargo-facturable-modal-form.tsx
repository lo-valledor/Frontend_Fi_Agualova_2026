import React, { useEffect } from 'react';
import { z } from 'zod';
import type {
  BuscarCargoFacturable,
  GeCombosConceptos,
  GetCombosTiposMedidor,
  GetCombosTarifas,
} from '~/types/administracion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '~/lib/api';
import { toast } from 'sonner';
import Select, { type StylesConfig } from 'react-select';
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
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Checkbox } from '~/components/ui/checkbox';
import { Button } from '~/components/ui/button';
import { Loader2 } from 'lucide-react';

const cargoFacturableFormSchema = z.object({
  cuenta: z.string().min(1, { message: 'La cuenta es requerida.' }),
  descripcion: z.string().min(1, { message: 'La descripción es requerida.' }),
  codigo: z.string().min(1, { message: 'El código es requerido.' }),
  tipo: z.string().min(1, { message: 'El tipo es requerido.' }),
  fijoVariable: z
    .string()
    .min(1, { message: 'Debe seleccionar si es fijo o variable.' }),
  periodicoEventual: z
    .string()
    .min(1, { message: 'Debe seleccionar si es periódico o eventual.' }),
  conceptoId: z.number().min(1, { message: 'El concepto es requerido.' }),
  tarifaId: z.number().min(1, { message: 'La tarifa es requerida.' }),
  tipoMedidorId: z
    .number()
    .min(1, { message: 'El tipo de medidor es requerido.' }),
  muestraValorEn0: z.boolean(),
});

type CargoFacturableFormValues = z.infer<typeof cargoFacturableFormSchema>;

interface CargoFacturableModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cargo: BuscarCargoFacturable | undefined;
  mode: 'add' | 'edit';
  conceptos: GeCombosConceptos[];
  tarifas: GetCombosTarifas[];
  tiposMedidor: GetCombosTiposMedidor[];
}

const tiposOptions = [
  { value: 'Base CH', label: 'Base CH' },
  { value: 'Cargo Fact.', label: 'Cargo Fact.' },
  { value: 'Condición', label: 'Condición' },
];

const fijoVariableOptions = [
  { value: 'Fijo', label: 'Fijo' },
  { value: 'Variable', label: 'Variable' },
];

const periodicoEventualOptions = [
  { value: 'Periodico', label: 'Periódico' },
  { value: 'Eventual', label: 'Eventual' },
];

export default function CargoFacturableModalForm({
  isOpen,
  onClose,
  onSuccess,
  cargo,
  mode,
  conceptos,
  tarifas,
  tiposMedidor,
}: CargoFacturableModalFormProps) {
  const { theme } = useTheme();
  const form = useForm<CargoFacturableFormValues>({
    resolver: zodResolver(cargoFacturableFormSchema),
    defaultValues: {
      cuenta: '',
      descripcion: '',
      codigo: '',
      tipo: '',
      fijoVariable: '',
      periodicoEventual: '',
      conceptoId: 0,
      tarifaId: 0,
      tipoMedidorId: 0,
      muestraValorEn0: false,
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
  };

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (isOpen && cargo) {
      form.reset({
        cuenta: cargo.cuenta || '',
        descripcion: cargo.descripcion || '',
        codigo: cargo.codigoEnerlova || '',
        tipo: cargo.tipo || '',
        fijoVariable: cargo.fijoVariable || '',
        periodicoEventual: cargo.periodicoEventual || '',
        conceptoId: conceptos.find((c) => c.nombre === cargo.concepto)?.id || 0,
        tarifaId: tarifas.find((t) => t.nombre === cargo.tarifa)?.id || 0,
        tipoMedidorId:
          tiposMedidor.find((t) => t.nombre === cargo.tipoMedidor)?.id || 0,
        muestraValorEn0: false, // Este valor deberá venir del backend
      });
    } else if (isOpen) {
      form.reset({
        cuenta: '',
        descripcion: '',
        codigo: '',
        tipo: '',
        fijoVariable: '',
        periodicoEventual: '',
        conceptoId: 0,
        tarifaId: 0,
        tipoMedidorId: 0,
        muestraValorEn0: false,
      });
    }
  }, [isOpen, cargo, form, conceptos, tarifas, tiposMedidor]);

  const onSubmit = async (data: CargoFacturableFormValues) => {
    try {
      if (mode === 'add') {
        await api.post('crearCargoFacturableNuevo', data);
      } else {
        await api.put(`modificarCargoFacturable`, data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al guardar el cargo facturable:', error);
      toast.error('Error al guardar el cargo facturable');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? 'Agregar Nuevo Cargo Facturable'
              : 'Editar Cargo Facturable'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los datos para crear un nuevo cargo facturable'
              : 'Modifique los datos del cargo facturable seleccionado'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cuenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuenta</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese la cuenta" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ingrese el código" />
                    </FormControl>
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
                    <Input {...field} placeholder="Ingrese la descripción" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Controller
              name="tipo"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    options={tiposOptions}
                    value={tiposOptions.find(
                      (option) => option.value === field.value,
                    )}
                    onChange={(option) =>
                      field.onChange((option as { value: string })?.value || '')
                    }
                    styles={selectStyles}
                    placeholder="Seleccione el tipo"
                    isClearable
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="fijoVariable"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fijo/Variable</FormLabel>
                    <Select
                      options={fijoVariableOptions}
                      value={fijoVariableOptions.find(
                        (option) => option.value === field.value,
                      )}
                      onChange={(option) =>
                        field.onChange(
                          (option as { value: string })?.value || '',
                        )
                      }
                      styles={selectStyles}
                      placeholder="Seleccione tipo"
                      isClearable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                name="periodicoEventual"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Periódico/Eventual</FormLabel>
                    <Select
                      options={periodicoEventualOptions}
                      value={periodicoEventualOptions.find(
                        (option) => option.value === field.value,
                      )}
                      onChange={(option) =>
                        field.onChange(
                          (option as { value: string })?.value || '',
                        )
                      }
                      styles={selectStyles}
                      placeholder="Seleccione tipo"
                      isClearable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="conceptoId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto</FormLabel>
                    <Select
                      options={conceptos.map((concepto) => ({
                        value: concepto.id,
                        label: concepto.nombre,
                      }))}
                      value={
                        field.value
                          ? {
                              value: field.value,
                              label:
                                conceptos.find((c) => c.id === field.value)
                                  ?.nombre || '',
                            }
                          : null
                      }
                      onChange={(option) =>
                        field.onChange(
                          (option as { value: number })?.value || 0,
                        )
                      }
                      styles={selectStyles}
                      placeholder="Seleccione concepto"
                      isClearable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                name="tarifaId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa</FormLabel>
                    <Select
                      options={tarifas.map((tarifa) => ({
                        value: tarifa.id,
                        label: tarifa.nombre,
                      }))}
                      value={
                        field.value
                          ? {
                              value: field.value,
                              label:
                                tarifas.find((t) => t.id === field.value)
                                  ?.nombre || '',
                            }
                          : null
                      }
                      onChange={(option) =>
                        field.onChange(
                          (option as { value: number })?.value || 0,
                        )
                      }
                      styles={selectStyles}
                      placeholder="Seleccione tarifa"
                      isClearable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="tipoMedidorId"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo Medidor</FormLabel>
                    <Select
                      options={tiposMedidor.map((tipo) => ({
                        value: tipo.id,
                        label: tipo.nombre,
                      }))}
                      value={
                        field.value
                          ? {
                              value: field.value,
                              label:
                                tiposMedidor.find((t) => t.id === field.value)
                                  ?.nombre || '',
                            }
                          : null
                      }
                      onChange={(option) =>
                        field.onChange(
                          (option as { value: number })?.value || 0,
                        )
                      }
                      styles={selectStyles}
                      placeholder="Seleccione tipo de medidor"
                      isClearable
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="muestraValorEn0"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Muestra valor en 0</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

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
