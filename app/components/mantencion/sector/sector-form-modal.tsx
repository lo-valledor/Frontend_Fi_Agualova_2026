import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import api from '~/lib/api';
import type { Sectores, Zonas } from '~/types/mantencion';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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

import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import Select from 'react-select';

const SectorFormSchema = z.object({
  nombre: z.string().min(1, { message: 'El nombre es requerido.' }),
  zona: z.string().min(1, { message: 'La zona es requerida.' }),
  estado: z.boolean(),
});

type SectorFormValues = z.infer<typeof SectorFormSchema>;

interface SectorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sector: Sectores | null;
  mode: 'add' | 'edit';
}

export default function SectorFormModal({
  isOpen,
  onClose,
  onSuccess,
  sector,
  mode,
}: SectorFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [zonas, setZonas] = useState<Zonas[]>([]);

  const form = useForm<SectorFormValues>({
    resolver: zodResolver(SectorFormSchema),
    defaultValues: {
      nombre: '',
      zona: '',
      estado: true,
    },
  });

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await api.get('/buscarZona');
        const data = response.data as any;
        if (data && Array.isArray(data.data)) {
          setZonas(data.data as Zonas[]);
        } else {
          setZonas(data as Zonas[]);
        }
      } catch (error) {
        console.error('Error al cargar las zonas:', error);
        toast.error('No se pudieron cargar las zonas.');
      }
    };

    if (isOpen) {
      fetchZonas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && sector) {
        form.reset({
          nombre: sector.nombre,
          zona: sector.zona,
          estado: sector.estado,
        });
      } else {
        form.reset({
          nombre: '',
          zona: '',
          estado: true,
        });
      }
    }
  }, [isOpen, mode, sector, form]);

  const handleSubmit = async (data: SectorFormValues) => {
    setIsLoading(true);
    try {
      if (mode === 'add') {
        await api.post('/crearSector', data);
        toast.success('Sector creado con éxito');
      } else {
        await api.put(`/modificarSector/${sector?.id}`, data);
        toast.success('Sector actualizado con éxito');
      }
      onSuccess();
    } catch (error) {
      console.error('Error al guardar sector', error);
      toast.error('No se pudo guardar el sector');
    } finally {
      setIsLoading(false);
    }
  };

  const zonaOptions = zonas.map((z) => ({
    value: z.id.toString(),
    label: z.nombre,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Sector' : 'Editar Sector'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete la información para agregar un nuevo sector.'
              : 'Actualice la información del sector.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 pt-4"
          >
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Sector Norte" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona</FormLabel>
                  <FormControl>
                    <Select
                      options={zonaOptions}
                      onChange={(option) => field.onChange(option?.value)}
                      value={zonaOptions.find(
                        (option) => option.value === field.value,
                      )}
                      placeholder="Selecciona una zona"
                      isClearable
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Estado</FormLabel>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Guardando...'
                  : mode === 'add'
                    ? 'Crear'
                    : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
