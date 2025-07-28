import { zodResolver } from '@hookform/resolvers/zod';
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
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import api from '~/lib/api';
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
  estado: z.boolean(),
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
  mode,
}: NichoFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sectores, setSectores] = useState<Sectores[]>([]);
  const [isLoadingSectores, setIsLoadingSectores] = useState(false);

  const form = useForm<NichoFormValues>({
    resolver: zodResolver(nichoFormSchema),
    defaultValues: {
      sectorId: '',
      nombre: '',
      ubicacion: '',
      estado: true,
    },
  });

  useEffect(() => {
    const fetchSectores = async () => {
      setIsLoadingSectores(true);
      try {
        const response = await api.get('/buscarSector');

        // Manejar diferentes formatos de respuesta de la API
        let sectoresData: Sectores[] = [];
        if (
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data &&
          Array.isArray((response.data as any).data)
        ) {
          sectoresData = (response.data as { data: Sectores[] }).data;
        } else if (Array.isArray(response.data)) {
          sectoresData = response.data;
        }

        setSectores(sectoresData);
      } catch (error) {
        console.error('Error al cargar los sectores:', error);
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
        form.reset({
          sectorId: sector?.id.toString() || '',
          nombre: nicho.nombre,
          ubicacion: nicho.ubicacion,
          estado: nicho.estado,
        });
      } else {
        form.reset({
          sectorId: '',
          nombre: '',
          ubicacion: '',
          estado: true,
        });
      }
    }
  }, [isOpen, mode, nicho, sectores, form]);

  const handleSubmit = async (data: NichoFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        sectorId: parseInt(data.sectorId, 10),
      };

      if (mode === 'add') {
        await api.post('/crearNichoM', payload);
      } else if (mode === 'edit' && nicho) {
        await api.put(`/modificarNicho/${nicho.id}`, payload);
      }

      onSuccess();
    } catch (error) {
      console.error('Error al procesar nicho:', error);
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
      <DialogContent className='sm:max-w-[425px]'>
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
            className='space-y-4 pt-4'
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Nicho</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Nicho Norte 1' {...field} />
                  </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
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
                className='bg-sky-600 hover:bg-sky-700'
              >
                {isLoading
                  ? mode === 'add'
                    ? 'Creando...'
                    : 'Actualizando...'
                  : mode === 'add'
                    ? 'Crear Nicho'
                    : 'Actualizar Nicho'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
