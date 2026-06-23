import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Clock,
  Gauge,
  Hash,
  Link2,
  Power,
  Save,
  Tag,
  Type,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';
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
import type {
  ActualizarMedidorProps,
  GetCombosTiposMedidor,
  GetMedidorByCodigo,
  GetMedidores
} from '~/types/administracion';
import type { Marca } from '~/types/mantencion';
import { AsociarSubempalmeModal } from '../asociar-subempalme-modal';

// Zod schema for form validation
const medidorSchema = z.object({
  marcaCodigo: z.string().min(1, 'La marca es requerida'),
  tipoId: z.coerce.number().min(1, 'El tipo es requerido'),
  modelo: z.string().min(1, 'El modelo es requerido'),
  serie: z.string().min(1, 'El número de serie es requerido'),
  estadoId: z.coerce.number().min(1, 'El estado es requerido'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  digitos: z.coerce.number().min(1, 'Los dígitos son requeridos'),
  multiplicar: z.coerce.number().min(1, 'El multiplicador es requerido'),
  primeraLectura: z.string().optional(),
  fechaPrimeraLectura: z.string().optional(),
  horaPrimeraLectura: z.string().optional(),
  subempalmeCodigo: z.string().optional()
});

type MedidorFormData = z.infer<typeof medidorSchema>;

interface EditarMedidorComponentProps {
  readonly medidor: GetMedidorByCodigo;
  readonly marca: Marca[];
  readonly tipoMedidor: GetCombosTiposMedidor[];
  readonly medidorDetalle: any;
  readonly cantidadLecturas: number;
  readonly codigoMedidor: string;
  readonly onSuccess?: (medidorId: string | number) => void;
  readonly onCancel?: () => void;
}

export default function EditarMedidorComponent({
  medidor,
  marca,
  tipoMedidor,
  cantidadLecturas,
  codigoMedidor,
  onSuccess
}: EditarMedidorComponentProps) {
  const { theme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAsociarModalOpen, setIsAsociarModalOpen] = useState(false);

  const form = useForm<MedidorFormData>({
    resolver: zodResolver(medidorSchema),
    defaultValues: {
      marcaCodigo: '',
      tipoId: 0,
      modelo: '',
      serie: '',
      estadoId: 1,
      fechaInicio: '',
      digitos: 0,
      multiplicar: 1,
      primeraLectura: '',
      fechaPrimeraLectura: '',
      horaPrimeraLectura: '',
      subempalmeCodigo: ''
    }
  });

  // Usar estilos compartidos para react-select
  const selectStyles = getReactSelectStyles(theme);

  // Función para determinar si los campos de lectura están habilitados
  const isEstadoActivo = (estadoId: number) => {
    // Estado "Activo" tiene ID 1
    return estadoId === 1;
  };

  // Función para convertir fecha de dd-MM-yyyy a yyyy-MM-dd
  const convertirFechaDDMMAAAAToAAAAMMDD = (fecha: string): string => {
    if (!fecha) return '';

    // Si ya está en formato yyyy-MM-dd, devolverla como está
    if (new RegExp(/^\d{4}-\d{2}-\d{2}$/).exec(fecha)) {
      return fecha;
    }

    // Si está en formato dd-MM-yyyy, convertir a yyyy-MM-dd
    if (new RegExp(/^\d{2}-\d{2}-\d{4}$/).exec(fecha)) {
      const [dia, mes, ano] = fecha.split('-');
      return `${ano}-${mes}-${dia}`;
    }

    return '';
  };

  // Inicializar el formulario con los datos del medidor
  useEffect(() => {
    if (medidor && marca && tipoMedidor) {
      // Encontrar la marca por código
      const marcaSeleccionada = marca.find(
        m => m.id?.toString() === medidor.mM_ID
      );

      // Búsqueda más flexible del tipo
      const tipoSeleccionado = tipoMedidor.find(t => t.id === medidor.tM_ID);

      // Reset del formulario con los datos actuales
      setTimeout(() => {
        form.reset({
          marcaCodigo: (marcaSeleccionada?.codigo ?? medidor.mM_ID) || '',
          tipoId: tipoSeleccionado?.id ?? medidor.tM_ID,
          modelo: medidor.modelo || '',
          serie: medidor.numeroSerie || '',
          estadoId: medidor.estadoId || 2,
          fechaInicio: convertirFechaDDMMAAAAToAAAAMMDD(
            medidor.fechaInicio || ''
          ),
          digitos: medidor.digitos || 0,
          multiplicar: medidor.constanteMultiplicar || 1,
          subempalmeCodigo: medidor.codigoSubEmpalme || '',
          primeraLectura: '',
          fechaPrimeraLectura: '',
          horaPrimeraLectura: ''
        });
      }, 100);
    }
  }, [medidor, marca, tipoMedidor, form]);

  const handleFormSubmit = async (data: MedidorFormData) => {
    // Validaciones de campos requeridos
    if (!data.marcaCodigo) {
      toast.error('La marca es obligatoria');
      return;
    }

    if (!data.tipoId) {
      toast.error('El tipo es obligatorio');
      return;
    }

    if (!data.modelo) {
      toast.error('El modelo es obligatorio');
      return;
    }

    if (!data.serie) {
      toast.error('El número de serie es obligatorio');
      return;
    }

    if (!data.fechaInicio) {
      toast.error('La fecha de inicio es obligatoria');
      return;
    }

    if (!data.digitos || data.digitos <= 0) {
      toast.error('Los dígitos deben ser mayor a 0');
      return;
    }

    if (!data.multiplicar || data.multiplicar <= 0) {
      toast.error('El multiplicador debe ser mayor a 0');
      return;
    }

    setIsSubmitting(true);
    try {
      // Intentar diferentes campos para encontrar la marca
      const marcaEncontrada = marca.find(
        m => m.codigo === data.marcaCodigo || m.nombre === data.marcaCodigo
      );
      console.log('🏷️ DEBUG: Marca encontrada:', marcaEncontrada);
      console.log('🏷️ DEBUG: data.marcaCodigo:', data.marcaCodigo);
      // El backend espera el código de la marca, no el ID
      const marcaId = marcaEncontrada?.codigo ?? data.marcaCodigo;
      console.log('🏷️ DEBUG: marcaId final:', marcaId);

      // Función para convertir fecha de yyyy-MM-dd a dd-MM-yyyy
      const convertirFechaAAAAMMDDToDDMMAA = (fecha: string): string => {
        if (!fecha) return '';

        // Si está en formato yyyy-MM-dd, convertir a dd-MM-yyyy
        if (new RegExp(/^\d{4}-\d{2}-\d{2}$/).exec(fecha)) {
          const [ano, mes, dia] = fecha.split('-');
          return `${dia}-${mes}-${ano}`;
        }

        return fecha;
      };

      // Preparar datos para envío
      const submitData: ActualizarMedidorProps = {
        codigoMedidor: Number(codigoMedidor),
        marcaId: String(marcaId),
        modelo: data.modelo,
        serie: data.serie,
        estadoId: data.estadoId,
        fechaInicio: convertirFechaAAAAMMDDToDDMMAA(data.fechaInicio),
        digitos: data.digitos,
        multiplicar: data.multiplicar,
        tipoId: data.tipoId,
        subempalmeCodigo: data.subempalmeCodigo || null,
        primeraLectura: data.primeraLectura || '0',
        fechaPrimeraLectura: data.fechaPrimeraLectura
          ? convertirFechaAAAAMMDDToDDMMAA(data.fechaPrimeraLectura)
          : ''
      };
      console.log('📦 DEBUG: submitData preparado:', submitData);
      // ADICIÓN: Debug del JSON enviado a la API (en el mismo orden solicitado)
      const payloadForLog = {
        codigoMedidor: submitData.codigoMedidor,
        marcaId: submitData.marcaId,
        modelo: submitData.modelo,
        serie: submitData.serie,
        estadoId: submitData.estadoId,
        fechaInicio: submitData.fechaInicio,
        digitos: submitData.digitos,
        multiplicar: submitData.multiplicar,
        tipoId: submitData.tipoId,
        subempalmeCodigo: submitData.subempalmeCodigo,
        primeraLectura: submitData.primeraLectura,
        fechaPrimeraLectura: submitData.fechaPrimeraLectura
      };
      console.log(
        '📤 DEBUG: Payload que se enviará a la API:',
        JSON.stringify(payloadForLog, null, 2)
      );
      console.log(
        '🌐 DEBUG: Llamando a administracionService.modificarMedidor...'
      );
      const result = await administracionService.modificarMedidor(submitData);
      console.log('📥 DEBUG: Respuesta recibida del backend:', result);

      // Debug: log para verificar qué se está recibiendo del backend
      if (result.error) {
        console.log('❌ DEBUG: Error retornado por el backend:', result.error);
        toast.error(result.error || 'Error al modificar el medidor');
        return;
      }

      console.log('✅ DEBUG: Modificación exitosa');
      // Notificar éxito al componente padre
      toast.success('Medidor modificado exitosamente');
      if (onSuccess) {
        const medidorId = Number.parseInt(medidor.mM_ID) || 0;
        onSuccess(medidorId);
      }
    } catch (error: any) {
      console.log('💥 DEBUG: Error capturado en catch:', error);
      console.log('💥 DEBUG: error.response:', error?.response);
      console.log('💥 DEBUG: error.response.data:', error?.response?.data);
      console.log('💥 DEBUG: error.message:', error?.message);

      // Determinar el mensaje de error apropiado
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        'Error inesperado al modificar el medidor';

      console.log('💥 DEBUG: Mensaje de error final:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Información adicional del medidor */}
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
              {medidor.mM_ID}
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
            {/* Información básica del medidor */}
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
                  name="marcaCodigo"
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Marca
                        </FormLabel>
                        <Select
                          {...field}
                          instanceId="marca-select"
                          options={marca.map(m => ({
                            value: m.codigo,
                            label: m.nombre
                          }))}
                          value={marca
                            .map(m => ({ value: m.codigo, label: m.nombre }))
                            .find(m => m.value === field.value)}
                          onChange={option =>
                            field.onChange(option ? option.value : '')
                          }
                          placeholder="Seleccione una marca"
                          styles={selectStyles}
                        />
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="tipoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Tipo de Medidor
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          value={
                            tipoMedidor
                              .map(t => ({ value: t.id, label: t.nombre }))
                              .find(t => t.value === field.value) || null
                          }
                          onChange={(option: any) => {
                            field.onChange(option?.value || 0);
                          }}
                          options={tipoMedidor.map(t => ({
                            value: t.id,
                            label: t.nombre
                          }))}
                          placeholder="Selecciona el tipo"
                          isClearable={false}
                          isSearchable={false}
                          styles={selectStyles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estadoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Power className="h-4 w-4" />
                        Estado
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          value={
                            [
                              { value: 1, label: 'En Bodega' },
                              { value: 2, label: 'Inactivo' },
                              { value: 3, label: 'Activo' },
                              { value: 4, label: 'En reparación' }
                            ].find(t => t.value === field.value) || null
                          }
                          onChange={(option: any) => {
                            field.onChange(option?.value || 1);
                          }}
                          options={[
                            { value: 1, label: 'En Bodega' },
                            { value: 2, label: 'Inactivo' },
                            { value: 3, label: 'Activo' },
                            { value: 4, label: 'En reparación' }
                          ]}
                          placeholder="Selecciona el estado"
                          isClearable={false}
                          isSearchable={false}
                          styles={selectStyles}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Configuración técnica */}
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
                  name="multiplicar"
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
                  name="subempalmeCodigo"
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
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={() => setIsAsociarModalOpen(true)}
                          >
                            <Link2 className="h-4 w-4" />
                            Asociar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
                            onClick={() => {
                              field.onChange('');
                              toast.success(
                                'Acometida removida del medidor. Para guardar el cambio debe hacer clic en Guardar Cambios '
                              );
                            }}
                          >
                            <X className="h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campos de primera lectura - solo visibles cuando el estado es "Activo" */}
                {isEstadoActivo(form.watch('estadoId')) && (
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

            {/* Botón de envío */}
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
        {isAsociarModalOpen && (
          <AsociarSubempalmeModal
            isOpen={isAsociarModalOpen}
            onClose={() => setIsAsociarModalOpen(false)}
            medidor={
              {
                codigo: Number(codigoMedidor),
                marca: '',
                tipo: '',
                modelo: medidor.modelo || '',
                serie: medidor.numeroSerie || '',
                fechaInicio: medidor.fechaInicio || '',
                digitos: medidor.digitos || 0,
                multiplicar: medidor.constanteMultiplicar || 1,
                ubicacion: '',
                estado: medidor.estadoNombre || '',
                codigoAcometida: medidor.codigoSubEmpalme || ''
              } as GetMedidores
            }
            onSuccess={async codigo => {
              if (codigo) {
                form.setValue('subempalmeCodigo', codigo, {
                  shouldDirty: true,
                  shouldValidate: true
                });
                await form.trigger('subempalmeCodigo');
                toast.success('Acometida asociada al medidor');
                setIsAsociarModalOpen(false);
                return;
              }
              const res = await administracionService.getMedidoresByCodigo({
                codigo: String(codigoMedidor)
              });
              const nuevoCodigo = res.data?.medidor?.[0]?.codigoAcometida || '';
              form.setValue('subempalmeCodigo', nuevoCodigo, {
                shouldDirty: true,
                shouldValidate: true
              });
              await form.trigger('subempalmeCodigo');
              toast.success('Acometida asociada al medidor');
              setIsAsociarModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
