import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

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
import type { Nicho, Sectores } from '~/types/mantencion';

const nichoFormSchema = z.object({
  sectorId: z.string().min(1, { message: 'El sector es requerido.' }),
  nombre: z
    .string()
    .min(1, { message: 'El nombre es requerido.' })
    .max(50, { message: 'El nombre no puede exceder 50 caracteres.' }),
  ubicacion: z
    .string()
    .min(1, { message: 'La ubicación es requerida.' })
    .max(100, { message: 'La ubicación no puede exceder 100 caracteres.' }),
  estado: z.boolean()
});

type NichoFormValues = z.infer<typeof nichoFormSchema>;

interface NichoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  nicho: Nicho | null;
  mode: 'add' | 'edit';
}

export default function NichoFormModal({
  isOpen,
  onClose,
  onSuccess,
  nicho,
  mode
}: Readonly<NichoFormModalProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const [sectores, setSectores] = useState<Sectores[]>([]);
  const [isLoadingSectores, setIsLoadingSectores] = useState(false);

  const form = useForm<NichoFormValues>({
    resolver: zodResolver(nichoFormSchema),
    defaultValues: {
      sectorId: '',
      nombre: '',
      ubicacion: '',
      estado: true
    }
  });

  useEffect(() => {
    const fetchSectores = async () => {
      setIsLoadingSectores(true);
      try {
        const result = await mantencionService.getSectores();

        if (result.error || !result.data) {
          throw new Error(result.error || 'Error al cargar sectores');
        }

        setSectores(result.data);
      } catch (error) {
        console.error(error);
        toast.error('No se pudieron cargar los sectores.');
      } finally {
        setIsLoadingSectores(false);
      }
    };

    if (isOpen) {
      fetchSectores();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && nicho) {
        const sector = sectores.find(s => s.nombre === nicho.sectorNombre);
        const formData = {
          sectorId: sector?.id.toString() || '',
          nombre: nicho.nombre,
          ubicacion: nicho.ubicacion,
          estado: nicho.estado
        };

        form.reset(formData);
      } else {
        const formData = {
          sectorId: '',
          nombre: '',
          ubicacion: '',
          estado: true
        };

        form.reset(formData);
      }
    }
  }, [isOpen, mode, nicho, sectores, form]);

  const handleSubmit = async (data: NichoFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        sectorId: parseInt(data.sectorId, 10),
        nombre: data.nombre,
        ubicacion: data.ubicacion,
        estado: data.estado
      };

      let result;
      if (mode === 'add') {
        result = await mantencionService.createNicho(payload);
      } else if (mode === 'edit' && nicho) {
        result = await mantencionService.updateNicho(nicho.id, payload);
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success(
        mode === 'add'
          ? 'Nicho creado exitosamente'
          : 'Nicho actualizado exitosamente'
      );
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        mode === 'add'
          ? 'Error al crear el nicho'
          : 'Error al actualizar el nicho'
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
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nuevo Nicho' : 'Editar Nicho'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete la información para crear un nuevo nicho.'
              : 'Modifique los campos que desea actualizar.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='sectorId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingSectores}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingSectores
                              ? 'Cargando sectores...'
                              : 'Selecciona un sector'
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sectores.map(sector => (
                        <SelectItem
                          key={sector.id}
                          value={sector.id.toString()}
                        >
                          {sector.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Seleccione el sector al que pertenece
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Nicho Norte 1' {...field} />
                  </FormControl>
                  <FormDescription>Máximo 50 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='ubicacion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Pasaje Los Aromos 123' {...field} />
                  </FormControl>
                  <FormDescription>Máximo 100 caracteres</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel>Estado del Nicho</FormLabel>
                    <FormDescription>
                      {field.value ? 'Nicho activo' : 'Nicho inactivo'}
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

            <DialogFooter className='gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isLoading || isLoadingSectores}
                variant='default'
              >
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'add' ? 'Crear Nicho' : 'Actualizar Nicho'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
