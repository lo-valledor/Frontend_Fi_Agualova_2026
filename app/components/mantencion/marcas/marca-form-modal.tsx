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
import { mantencionService } from '~/services/mantencionService';
import type { Marca, MarcaFormValues } from '~/types/mantencion';

const createMarcaSchema = (existingCodes: string[], currentCode?: string) =>
  z.object({
    id: z
      .string()
      .min(1, { message: 'El código es requerido.' })
      .max(20, { message: 'El código no puede exceder 20 caracteres.' })
      .regex(/^[A-Z0-9]+$/, {
        message: 'Solo se permiten letras mayúsculas y números.'
      })
      .refine(
        codigo => {
          if (currentCode && codigo === currentCode) return true;
          return !existingCodes.includes(codigo);
        },
        {
          message: 'Este código ya está registrado en el sistema'
        }
      ),
    nombre: z
      .string()
      .min(1, { message: 'El nombre es requerido.' })
      .max(100, { message: 'El nombre no puede exceder 100 caracteres.' })
  });

type MarcaFormSchemaValues = z.infer<ReturnType<typeof createMarcaSchema>>;

interface MarcaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  marca: Marca | null;
  mode: 'add' | 'edit';
  existingCodes: string[];
}

export default function MarcaFormModal({
  isOpen,
  onClose,
  onSuccess,
  marca,
  mode,
  existingCodes
}: Readonly<MarcaFormModalProps>) {
  const [isLoading, setIsLoading] = useState(false);

  const marcaSchema = createMarcaSchema(existingCodes, marca?.id);
  const form = useForm<MarcaFormSchemaValues>({
    resolver: zodResolver(marcaSchema),
    defaultValues: {
      id: '',
      nombre: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && marca) {
        form.reset({
          id: marca.id,
          nombre: marca.nombre
        });
      } else {
        form.reset({
          id: '',
          nombre: ''
        });
      }
    }
  }, [isOpen, mode, marca, form]);

  const handleGenerateSigla = () => {
    const nombre = form.getValues('nombre').trim();
    if (!nombre) {
      toast.error('Ingrese un nombre para generar la sigla.');
      return;
    }
    const palabras = nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .split(/\s+/)
      .filter(Boolean);
    const sigla =
      palabras.length === 1
        ? palabras[0].slice(0, 4).toUpperCase()
        : palabras
            .slice(0, 4)
            .map(p => p.charAt(0))
            .join('')
            .toUpperCase();
    form.setValue('id', sigla, { shouldValidate: true, shouldDirty: true });
  };

  const handleSubmit = async (data: MarcaFormSchemaValues) => {
    setIsLoading(true);
    try {
      const payload: MarcaFormValues = {
        id: data.id,
        nombre: data.nombre
      };

      let result;
      if (mode === 'add') {
        result = await mantencionService.createMarca(payload);
      } else if (mode === 'edit' && marca) {
        result = await mantencionService.updateMarca(payload);
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(
        mode === 'add'
          ? 'Error al crear la marca'
          : 'Error al actualizar la marca'
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
            {mode === 'add' ? 'Agregar Nueva Marca' : 'Editar Marca'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete la información para crear una nueva marca.'
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
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        placeholder="Ej: AGRE"
                        disabled={mode === 'edit'}
                        value={field.value ?? ''}
                        onChange={event =>
                          field.onChange(
                            event.target.value.toUpperCase().replace(/\s/g, '')
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        maxLength={20}
                      />
                    </FormControl>
                    {mode !== 'edit' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateSigla}
                        disabled={isLoading}
                      >
                        Generar sigla
                      </Button>
                    )}
                  </div>
                  <FormDescription>
                    {mode === 'edit'
                      ? 'El código no se puede modificar'
                      : 'Ingrese un código alfabético en mayúsculas o genere la sigla desde el nombre'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Siemens" {...field} />
                  </FormControl>
                  <FormDescription>Máximo 100 caracteres</FormDescription>
                  <FormMessage />
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
                {mode === 'add' ? 'Crear Marca' : 'Actualizar Marca'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
