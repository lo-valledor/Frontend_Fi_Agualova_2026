import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  FileEdit,
  FilePlus2,
  Grid,
  Link2,
  ListChecks,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import React, { useEffect } from 'react';

import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Select as UiSelect,
} from '~/components/ui/select';
import type {
  BuscarCargoFacturable,
  CargoTipoContratoEditor,
  GetCargoTipoContrato,
  GetCondicionesContrato,
} from '~/types/administracion';
import type { TiposContrato } from '~/types/mantencion';

const formSchema = z.object({
  tipoContratoId: z.number().min(1, 'Debe seleccionar un tipo de contrato'),
  cargoMonofasicoIds: z.array(z.number()),
  cargoTrifasicoIds: z.array(z.number()),
  cargoAmbosIds: z.array(z.number()),
  grilla: z.array(
    z.object({
      cargoId: z.number().min(1, 'El cargo es requerido'),
      condicionId: z.number().min(1, 'La condición es requerida'),
      descripcion: z.string().min(1, 'La descripción es requerida'),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  mode: 'add' | 'edit';
  tiposContrato: TiposContrato[];
  cargos: BuscarCargoFacturable[];
  condiciones: GetCondicionesContrato[];
  initialData?: CargoTipoContratoEditor | null;
  selectedItem?: GetCargoTipoContrato | null;
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  tiposContrato,
  cargos,
  condiciones,
  initialData,
  selectedItem,
}: FormModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipoContratoId: 0,
      cargoMonofasicoIds: [],
      cargoTrifasicoIds: [],
      cargoAmbosIds: [],
      grilla: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'grilla',
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData && selectedItem) {
        form.reset({
          tipoContratoId: selectedItem.tipoContratoId,
          cargoMonofasicoIds: initialData.cargoMonofasico.map(c => c.cargoId),
          cargoTrifasicoIds: initialData.cargoTrifasico.map(c => c.cargoId),
          cargoAmbosIds: initialData.cargoAmbos.map(c => c.cargoId),
          grilla: initialData.grilla.map(g => ({
            cargoId: g.cargoId,
            condicionId: g.condicionId,
            descripcion: g.descripcion,
          })),
        });
      } else {
        form.reset({
          tipoContratoId: 0,
          cargoMonofasicoIds: [],
          cargoTrifasicoIds: [],
          cargoAmbosIds: [],
          grilla: [],
        });
      }
    }
  }, [isOpen, mode, initialData, selectedItem, form]);

  const handleFormSubmit = (data: FormValues) => {
    const payload = {
      tipoContratoId: data.tipoContratoId,
      configuraciones: data.grilla.map(g => ({
        ...g,
        tipoContratoId: data.tipoContratoId,
      })),
      cargoMonofasicoIds: data.cargoMonofasicoIds,
      cargoTrifasicoIds: data.cargoTrifasicoIds,
      cargoAmbosIds: data.cargoAmbosIds,
    };
    toast.promise(onSubmit(payload), {
      loading: 'Guardando configuración...',
      success: 'Configuración guardada exitosamente',
      error: 'Error al guardar la configuración',
    });
    onClose();
  };

  const renderCheckboxList = (
    name: 'cargoMonofasicoIds' | 'cargoTrifasicoIds' | 'cargoAmbosIds',
    title: string
  ) => (
    <div className='space-y-3 sm:space-y-4 rounded-lg border p-3 sm:p-4'>
      <h4 className='text-sm sm:text-md font-medium'>{title}</h4>
      <ScrollArea className='h-36 sm:h-48'>
        <div className='space-y-1 sm:space-y-2 pr-2 sm:pr-4'>
          {cargos.map(cargo => (
            <FormField
              key={cargo.id}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(cargo.id)}
                      onCheckedChange={checked => {
                        return checked
                          ? field.onChange([...field.value, cargo.id])
                          : field.onChange(
                              field.value?.filter(value => value !== cargo.id)
                            );
                      }}
                    />
                  </FormControl>
                  <FormLabel className='font-normal w-full cursor-pointer text-xs sm:text-sm truncate'>
                    <span title={cargo.descripcion}>{cargo.descripcion}</span>
                  </FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='w-[95vw] sm:max-w-4xl lg:max-w-5xl max-h-[90vh]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold flex items-center gap-2'>
            {mode === 'add' ? (
              <>
                <FilePlus2 className='h-6 w-6 text-green-600' />
                Crear Configuración
              </>
            ) : (
              <>
                <FileEdit className='h-6 w-6 text-blue-600' />
                Editar Configuración
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Defina las relaciones entre cargos, condiciones y tipos de contrato.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className='max-h-[70vh] p-1'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className='space-y-8 p-4'
            >
              <div className='space-y-6'>
                <div className='flex items-center gap-2 pb-2 border-b'>
                  <Link2 className='h-5 w-5 text-blue-600' />
                  <h3 className='text-lg font-medium'>Tipo de Contrato</h3>
                </div>
                <FormField
                  control={form.control}
                  name='tipoContratoId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleccione el Tipo de Contrato</FormLabel>
                      <UiSelect
                        onValueChange={value => field.onChange(Number(value))}
                        value={String(field.value)}
                        disabled={mode === 'edit'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Seleccione un tipo de contrato...' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposContrato.map(tc => (
                            <SelectItem key={tc.id} value={String(tc.id)}>
                              {tc.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </UiSelect>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='space-y-6'>
                <div className='flex items-center gap-2 pb-2 border-b'>
                  <ListChecks className='h-5 w-5 text-purple-600' />
                  <h3 className='text-lg font-medium'>
                    Cargos por Tipo de Medidor
                  </h3>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                  {renderCheckboxList(
                    'cargoMonofasicoIds',
                    'Cargos Monofásicos'
                  )}
                  {renderCheckboxList('cargoTrifasicoIds', 'Cargos Trifásicos')}
                  {renderCheckboxList('cargoAmbosIds', 'Cargos para Ambos')}
                </div>
              </div>

              <div className='space-y-6'>
                <div className='flex items-center justify-between pb-2 border-b'>
                  <div className='flex items-center gap-2'>
                    <Grid className='h-5 w-5 text-orange-600' />
                    <h3 className='text-lg font-medium'>
                      Grilla de Condiciones y Cargos
                    </h3>
                  </div>
                  <Button
                    type='button'
                    size='sm'
                    onClick={() =>
                      append({ cargoId: 0, condicionId: 0, descripcion: '' })
                    }
                  >
                    <PlusCircle className='h-4 w-4 mr-2' />
                    Añadir Fila
                  </Button>
                </div>
                <div className='space-y-4'>
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className='grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 sm:gap-4 items-start p-3 border rounded-lg'
                    >
                      <FormField
                        control={form.control}
                        name={`grilla.${index}.cargoId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo</FormLabel>
                            <UiSelect
                              onValueChange={value =>
                                field.onChange(Number(value))
                              }
                              value={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Seleccione...' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cargos.map(c => (
                                  <SelectItem key={c.id} value={String(c.id)}>
                                    {c.descripcion}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </UiSelect>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`grilla.${index}.condicionId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condición</FormLabel>
                            <UiSelect
                              onValueChange={value =>
                                field.onChange(Number(value))
                              }
                              value={String(field.value)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder='Seleccione...' />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {condiciones.map(c => (
                                  <SelectItem key={c.id} value={String(c.id)}>
                                    {c.descripcion}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </UiSelect>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`grilla.${index}.descripcion`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder='Descripción...' />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type='button'
                        variant='destructive'
                        size='sm'
                        onClick={() => remove(index)}
                        className='mt-0 sm:mt-8 w-full sm:w-auto'
                      >
                        <Trash2 className='h-3 w-3 sm:h-4 sm:w-4' />
                        <span className='ml-1 sm:hidden'>Eliminar</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className='flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4 sm:pt-6 border-t'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  className='h-10 sm:h-11 px-4 sm:px-6 w-full sm:w-auto order-2 sm:order-1'
                >
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  className='h-10 sm:h-11 px-4 sm:px-6 flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2'
                >
                  <CheckCircle2 className='h-3 w-3 sm:h-4 sm:w-4' />
                  <span className='text-xs sm:text-sm'>
                    Guardar Configuración
                  </span>
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
