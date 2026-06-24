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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { mantencionService } from '~/services/mantencionService';
import type { Sector, SectorFormValues, SectorZona } from '~/types/mantencion';

const SectorFormSchema = z.object({
  id: z.number().optional(),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(50, { message: 'El nombre no puede exceder 50 caracteres.' }),
  idZona: z.coerce
    .number()
    .int()
    .min(1, { message: 'La zona es requerida.' }),
  estado: z.boolean()
});

type SectorFormInput = z.infer<typeof SectorFormSchema>;

interface SectorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sector: Sector | null;
  mode: 'add' | 'edit';
}

export default function SectorFormModal({
  isOpen,
  onClose,
  onSuccess,
  sector,
  mode
}: SectorFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [zonas, setZonas] = useState<SectorZona[]>([]);
  const [isLoadingZonas, setIsLoadingZonas] = useState(false);

  const form = useForm<SectorFormInput>({
    resolver: zodResolver(SectorFormSchema),
    defaultValues: {
      id: 0,
      nombre: '',
      idZona: 0,
      estado: true
    }
  });

  useEffect(() => {
    const fetchZonas = async () => {
      setIsLoadingZonas(true);
      try {
        const response = await mantencionService.getSectoresZonas();

        let zonasData: SectorZona[] = [];
        if (response.data && Array.isArray(response.data)) {
          zonasData = response.data;
        }

        setZonas(zonasData);
      } catch (_error) {
        toast.error('No se pudieron cargar las zonas.');
      } finally {
        setIsLoadingZonas(false);
      }
    };

    if (isOpen) {
      fetchZonas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && sector) {
      if (zonas.length > 0) {
        const idZona = Number(
          zonas.find(z => z.descripcion === sector.zona)?.id ?? 0
        );
        form.reset({
          id: sector.id,
          nombre: sector.nombre,
          idZona,
          estado: sector.estado
        });
      }
    } else {
      form.reset({
        id: 0,
        nombre: '',
        idZona: 0,
        estado: true
      });
    }
  }, [isOpen, mode, sector, form, zonas]);

  const handleSubmit = async (data: SectorFormInput) => {
    setIsLoading(true);
    try {
      const payload: SectorFormValues = {
        id: mode === 'edit' && sector ? sector.id : 0,
        nombre: data.nombre,
        idZona: data.idZona,
        estado: data.estado
      };

      if (mode === 'add') {
        await mantencionService.postSectores(payload);
      } else if (mode === 'edit' && sector) {
        await mantencionService.updateSector(payload);
      }
      onSuccess();
    } catch (error) {
      if (import.meta.env.DEV) console.error('guardarSector', error);
      toast.error(
        mode === 'add'
          ? 'Error al crear el sector'
          : 'Error al actualizar el sector'
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nuevo Sector' : 'Editar Sector'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete la información para crear un nuevo sector.'
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
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Sector Norte" {...field} />
                  </FormControl>
                  <FormDescription>Máximo 50 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idZona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zona</FormLabel>
                  <Select
                    onValueChange={value => field.onChange(Number(value))}
                    value={field.value ? String(field.value) : ''}
                    disabled={isLoadingZonas}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingZonas
                              ? 'Cargando zonas...'
                              : 'Selecciona una zona'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zonas.map(zona => (
                        <SelectItem key={zona.id} value={String(zona.id)}>
                          {zona.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleccione la zona a la que pertenece
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estado"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Estado del Sector</FormLabel>
                    <FormDescription>
                      {field.value ? 'Sector activo' : 'Sector inactivo'}
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
              <Button
                type="submit"
                disabled={isLoading || isLoadingZonas}
                variant="default"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'add' ? 'Crear Sector' : 'Actualizar Sector'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
