import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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
import { mantencionService } from '~/services/mantencionService';
import type { CicloFacturacion } from '~/types/mantencion';

const cicloFormSchema = z.object({
  id: z
    .number({ message: 'El ID debe ser un número válido.' })
    .int({ message: 'El ID debe ser un número entero.' }),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres.' }),
  diaFacturacion: z
    .number({ message: 'El día de facturación debe ser un número válido.' })
    .int({ message: 'El día de facturación debe ser un número entero.' })
    .min(1, { message: 'El día de facturación debe ser entre 1 y 31.' })
    .max(31, { message: 'El día de facturación debe ser entre 1 y 31.' }),
  diaInicioLectura: z
    .number({
      message: 'El día de inicio de lectura debe ser un número válido.'
    })
    .int({ message: 'El día de inicio de lectura debe ser un número entero.' })
    .min(1, { message: 'El día de inicio de lectura debe ser entre 1 y 31.' })
    .max(31, { message: 'El día de inicio de lectura debe ser entre 1 y 31.' }),
  diasVencimientoFactura: z
    .number({ message: 'Los días de vencimiento deben ser un número válido.' })
    .int({ message: 'Los días de vencimiento deben ser un número entero.' })
    .min(1, { message: 'Los días de vencimiento deben ser mayor a 0.' })
    .max(365, {
      message: 'Los días de vencimiento no pueden exceder 365 días.'
    }),
  estado: z.boolean()
});

type CicloFormValues = z.infer<typeof cicloFormSchema>;

interface CicloFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ciclo: CicloFacturacion | null;
  mode: 'add' | 'edit';
}

export default function CiclosFacturacionModalForm({
  isOpen,
  onClose,
  onSuccess,
  ciclo,
  mode
}: Readonly<CicloFormModalProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CicloFormValues>({
    resolver: zodResolver(cicloFormSchema),
    defaultValues: {
      id: 0,
      nombre: '',
      diaFacturacion: 1,
      diaInicioLectura: 1,
      diasVencimientoFactura: 30,
      estado: true
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && ciclo) {
        form.reset({
          id: ciclo.id,
          nombre: ciclo.nombre,
          diaFacturacion: ciclo.diaFacturacion,
          diaInicioLectura: ciclo.diaInicioLectura,
          diasVencimientoFactura: ciclo.diasVencimientoFactura,
          estado: ciclo.estado
        });
      } else {
        form.reset({
          id: 0,
          nombre: '',
          diaFacturacion: 1,
          diaInicioLectura: 1,
          diasVencimientoFactura: 30,
          estado: true
        });
      }
    }
  }, [isOpen, mode, ciclo, form]);

  const handleSubmit = async (data: CicloFormValues) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await mantencionService.createCicloFacturacion(data)
      } else if (mode === 'edit' && ciclo) {
        await mantencionService.updateCicloFacturacion(data);
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        mode === 'add'
          ? 'Error al crear el ciclo de facturación'
          : 'Error al actualizar el ciclo de facturación'
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
      <DialogContent className="sm:max-w-137.5">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? 'Agregar Nuevo Ciclo de Facturación'
              : 'Editar Ciclo de Facturación'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete la información para crear un nuevo ciclo de facturación.'
              : 'Modifique los campos que desea actualizar.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Ciclo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Ciclo Mensual Residencial"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="diaFacturacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día Facturación</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="1"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormDescription>1-31</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diaInicioLectura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día Inicio Lectura</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="31"
                        placeholder="1"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormDescription>1-31</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diasVencimientoFactura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Días Vencimiento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        placeholder="30"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value) || 30)
                        }
                      />
                    </FormControl>
                    <FormDescription>Días</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Estado del Ciclo</FormLabel>
                    <FormDescription>
                      {field.value ? 'Ciclo activo' : 'Ciclo inactivo'}
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

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} variant="default">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'add' ? 'Crear Ciclo' : 'Actualizar Ciclo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
