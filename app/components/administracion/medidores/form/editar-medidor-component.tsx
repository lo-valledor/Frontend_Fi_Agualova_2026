import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Clock,
  CodeIcon,
  Gauge,
  Hash,
  Power,
  Save,
  Tag,
  Type
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';
import type {
  MedidorEstadoOption,
  MedidorForEdit,
  MedidorMarcaOption,
  MedidorTipoOption
} from '~/components/administracion/medidores/medidores-types';
import { getReactSelectStyles } from '~/components/shared/react-select-styles';
import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { administracionService } from '~/services/administracionService';
import type { MedidorFormValues } from '~/types/administracion';

const medidorSchema = z.object({
  idMarca: z.string().min(1, 'La marca es requerida'),
  idTipo: z.string().min(1, 'El tipo es requerido'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  serie: z.string().min(1, 'El número de serie es requerido'),
  idEstado: z.string().min(1, 'El estado es requerido'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  digitos: z.coerce.number().min(1, 'Los dígitos son requeridos'),
  multiplicador: z.coerce.number().min(1, 'El multiplicador es requerido'),
  primeraLectura: z.string().optional(),
  fechaPrimeraLectura: z.string().optional(),
  horaPrimeraLectura: z.string().optional(),
  idSubEmpalme: z.string().optional(),
  codigoMedidor: z.string().min(1, 'El código de medidor es requerido')
});

type MedidorFormData = z.infer<typeof medidorSchema>;

interface EditarMedidorComponentProps {
  readonly medidor: MedidorForEdit;
  readonly marcas: MedidorMarcaOption[];
  readonly tipos: MedidorTipoOption[];
  readonly estados: MedidorEstadoOption[];
  readonly cantidadLecturas: number;
  readonly codigoMedidor: string;
  readonly onSuccess?: (medidorId: string | number) => void;
}

const formatDateForInput = (fecha: string): string => {
  if (!fecha) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
    const [dia, mes, ano] = fecha.split('-');
    return `${ano}-${mes}-${dia}`;
  }
  return '';
};

const formatDateForBackend = (fecha: string): string => {
  if (!fecha) return '';
  const [ano, mes, dia] = fecha.split('-');
  return `${dia}-${mes}-${ano}`;
};

const splitTime = (timeValue?: string) => {
  if (!timeValue) {
    return { horaLectura: '', minutoLectura: '' };
  }

  const [horaLectura = '', minutoLectura = ''] = timeValue.split(':');
  return { horaLectura, minutoLectura };
};

const isEstadoActivo = (estadoDescripcion?: string) => {
  return estadoDescripcion?.toLowerCase().includes('activo') ?? false;
};

export default function EditarMedidorComponent({
  medidor,
  marcas,
  tipos,
  estados,
  cantidadLecturas,
  codigoMedidor,
  onSuccess
}: EditarMedidorComponentProps) {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectStyles = getReactSelectStyles(theme);

  const estadoSeleccionado = useMemo(
    () =>
      estados.find(estado => String(estado.id) === String(medidor.idEstado)) ??
      estados.find(estado => estado.descripcion === medidor.nombreEstado),
    [estados, medidor.idEstado, medidor.nombreEstado]
  );

  const form = useForm<MedidorFormData>({
    resolver: zodResolver(medidorSchema),
    defaultValues: {
      idMarca: '',
      idTipo: '',
      modelo: '',
      serie: '',
      idEstado: '',
      fechaInicio: '',
      digitos: 0,
      multiplicador: 1,
      primeraLectura: '',
      fechaPrimeraLectura: '',
      horaPrimeraLectura: '',
      idSubEmpalme: '',
      codigoMedidor: ''
    }
  });

  useEffect(() => {
    form.reset({
      idMarca: String(medidor.idMarca ?? ''),
      idTipo: String(medidor.idTipo ?? ''),
      modelo: medidor.modelo ?? '',
      serie: medidor.serie ?? '',
      idEstado: String(medidor.idEstado ?? ''),
      fechaInicio: formatDateForInput(medidor.fechaInicio ?? ''),
      digitos: medidor.digitos ?? 0,
      multiplicador: medidor.multiplicador ?? 1,
      idSubEmpalme: medidor.idSubEmpalme ?? medidor.codigoAcometida ?? '',
      primeraLectura: medidor.primeraLectura ?? '',
      fechaPrimeraLectura: '',
      horaPrimeraLectura: '',
      codigoMedidor: codigoMedidor ?? ''
    });
  }, [codigoMedidor, form, medidor]);

  const handleFormSubmit = async (data: MedidorFormData) => {
    setIsSubmitting(true);

    try {
      const { horaLectura, minutoLectura } = splitTime(data.horaPrimeraLectura);

      const submitData: MedidorFormValues = {
        idMarca: data.idMarca,
        idTipo: data.idTipo,
        modelo: data.modelo.trim(),
        serie: data.serie.trim(),
        idEstado: data.idEstado,
        fechaInicio: formatDateForBackend(data.fechaInicio),
        digitos: data.digitos,
        multiplicador: data.multiplicador,
        primeraLectura: data.primeraLectura?.trim() || '0',
        fechaLectura: data.fechaPrimeraLectura
          ? formatDateForBackend(data.fechaPrimeraLectura)
          : '',
        horaLectura,
        minutoLectura,
        idSubEmpalme: data.idSubEmpalme || '',
        codigoMedidor: data.codigoMedidor?.trim() || ''
      };

      const result = await administracionService.modificarMedidor(submitData);

      if (result.error) {
        toast.error(result.error || 'Error al modificar el medidor');
        return;
      }

      toast.success('Medidor modificado exitosamente');
      onSuccess?.(medidor.idMedidor);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error inesperado al modificar el medidor'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <Gauge className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-900 dark:text-blue-100 text-sm sm:text-base">
            Información del Medidor
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-blue-700 dark:text-blue-300">Código:</span>
            <span className="ml-2 font-mono text-blue-900 dark:text-blue-100">
              {medidor.idMedidor}
            </span>
          </div>
          <div>
            <span className="text-blue-700 dark:text-blue-300">Lecturas:</span>
            <span className="ml-2 text-blue-900 dark:text-blue-100">
              {cantidadLecturas}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-background rounded-xl shadow-sm border border-border">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="p-6 space-y-6 sm:space-y-8"
          >
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Gauge className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
                <h3 className="text-base sm:text-lg font-medium">
                  Detalles del Medidor
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <FormField
                  control={form.control}
                  name="codigoMedidor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CodeIcon className="h-4 w-4" />
                        Código Medidor
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Código del medidor"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        N° Serie
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Número de serie"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Modelo
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Modelo del medidor"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="idMarca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Marca
                      </FormLabel>
                      <Select
                        instanceId="marca-select"
                        options={marcas.map(marca => ({
                          value: String(marca.id),
                          label: marca.descripcion
                        }))}
                        value={
                          marcas
                            .map(marca => ({
                              value: String(marca.id),
                              label: marca.descripcion
                            }))
                            .find(option => option.value === field.value) ??
                          null
                        }
                        onChange={option => field.onChange(option?.value ?? '')}
                        placeholder="Seleccione una marca"
                        styles={selectStyles}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="idTipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Tipo de Medidor
                      </FormLabel>
                      <Select
                        instanceId="tipo-select"
                        options={tipos.map(tipo => ({
                          value: String(tipo.id),
                          label: tipo.descripcion
                        }))}
                        value={
                          tipos
                            .map(tipo => ({
                              value: String(tipo.id),
                              label: tipo.descripcion
                            }))
                            .find(option => option.value === field.value) ??
                          null
                        }
                        onChange={option => field.onChange(option?.value ?? '')}
                        placeholder="Selecciona el tipo"
                        styles={selectStyles}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  control={form.control}
                  name="idEstado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Power className="h-4 w-4" />
                        Estado
                      </FormLabel>
                      <Select
                        instanceId="estado-select"
                        options={estados.map(estado => ({
                          value: String(estado.id),
                          label: estado.descripcion
                        }))}
                        value={
                          estados
                            .map(estado => ({
                              value: String(estado.id),
                              label: estado.descripcion
                            }))
                            .find(option => option.value === field.value) ??
                          null
                        }
                        onChange={option => field.onChange(option?.value ?? '')}
                        placeholder="Selecciona el estado"
                        styles={selectStyles}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Power className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <h3 className="text-base sm:text-lg font-medium">
                  Configuración
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <FormField
                  control={form.control}
                  name="digitos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Dígitos
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Cantidad de dígitos"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="multiplicador"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Power className="h-4 w-4" />
                        Multiplicador
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Factor multiplicador"
                          {...field}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fechaInicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha de Inicio
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idSubEmpalme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Acometida / Subempalme
                      </FormLabel>
                      <div className="flex flex-col gap-2">
                        <FormControl>
                          <Input
                            placeholder="Sin subempalme asociado"
                            value={field.value || ''}
                            readOnly
                            disabled
                            className="h-11"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEstadoActivo(estadoSeleccionado?.descripcion) && (
                  <>
                    <FormField
                      control={form.control}
                      name="primeraLectura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Power className="h-4 w-4" />
                            Primera Lectura
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Valor de la primera lectura"
                              {...field}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fechaPrimeraLectura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fecha de Primera Lectura
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="horaPrimeraLectura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Hora de Primera Lectura
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="h-11" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <Button
                type="button"
                onClick={form.handleSubmit(handleFormSubmit)}
                disabled={isSubmitting}
                className="gap-2 px-8"
                variant="default"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
