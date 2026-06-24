import {
  CalendarClock,
  CheckCircle2,
  DollarSign,
  FileEdit,
  FilePlus2,
  FileText,
  Gauge,
  Hash,
  Info,
  Link2,
  Loader2,
  Receipt,
  Repeat,
  Settings2,
  Tags,
  Text,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  getReactSelectStyles,
  type OptionType
} from '~/components/shared/react-select-styles';
import { useTheme } from '~/components/theme-provider';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { administracionService } from '~/services/administracionService';
import type {
  CargoFacturableConceptos,
  CargoFacturableFormValues,
  CargoFacturableProps,
  CargoFacturableRow,
  CargoFacturableTarifas,
  CargoFacturableTiposMedidor
} from '~/types/administracion';

interface CargoFacturableModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cargo: CargoFacturableRow | null;
  mode: 'add' | 'edit';
  conceptos: CargoFacturableConceptos[];
  tarifas: CargoFacturableTarifas[];
  tiposMedidor: CargoFacturableTiposMedidor[];
}


const fijoVariableOptions: OptionType[] = [
  { value: 'F', label: 'Fijo' },
  { value: 'V', label: 'Variable' }
];

const periodicoEventualOptions: OptionType[] = [
  { value: 'P', label: 'Periódico' },
  { value: 'E', label: 'Eventual' }
];

const cargoFacturableSchema = z.object({
  id: z.number().optional(),
  cuenta: z
    .string()
    .min(1, { message: 'La cuenta es requerida.' })
    .max(50, { message: 'La cuenta no debe exceder 50 caracteres.' }),
  descripcion: z
    .string()
    .min(1, { message: 'La descripción es requerida.' })
    .max(200, { message: 'La descripción no debe exceder 200 caracteres.' }),
  fijoVariable: z
    .string()
    .min(1, { message: 'Indique si es fijo o variable.' }),
  periodicoEventual: z
    .string()
    .min(1, { message: 'Indique si es periódico o eventual.' }),
  idConcepto: z.coerce
    .number()
    .int()
    .positive({ message: 'El concepto es requerido.' }),
  idTarifa: z.coerce
    .number()
    .int()
    .positive({ message: 'La tarifa es requerida.' }),
  idTipoMedidor: z.coerce
    .number()
    .int()
    .positive({ message: 'El tipo de medidor es requerido.' }),
  tipoCargo: z.coerce
    .number()
    .int()
    .positive({ message: 'El tipo de cargo es requerido.' }),
  codigoEnerlova: z
    .string()
    .min(1, { message: 'El código es requerido.' })
    .max(50, { message: 'El código no debe exceder 50 caracteres.' }),
  muestraValorCero: z.boolean()
});

type CargoFacturableFormData = z.infer<typeof cargoFacturableSchema>;

export default function CargoFacturableModalForm({
  isOpen,
  onClose,
  onSuccess,
  cargo,
  mode,
  conceptos,
  tarifas,
  tiposMedidor
}: Readonly<CargoFacturableModalFormProps>) {
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const selectStyles = getReactSelectStyles(theme);

  const form = useForm<CargoFacturableFormData>({
    resolver: zodResolver(cargoFacturableSchema),
    defaultValues: {
      id: 0,
      cuenta: '',
      descripcion: '',
      fijoVariable: '',
      periodicoEventual: '',
      idConcepto: 0,
      idTarifa: 0,
      idTipoMedidor: 0,
      tipoCargo: 1,
      codigoEnerlova: '',
      muestraValorCero: false
    }
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && cargo) {
      const normalizeAndFind = (
        list: { id: string; descripcion: string }[],
        name: string | undefined
      ): number => {
        if (!name) return 0;
        const normalizedName = name
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const found = list.find(
          item =>
            item.descripcion
              .trim()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') === normalizedName
        );
        return found ? Number(found.id) : 0;
      };

      const tipoCargoMap: Record<string, number> = {
        'Base CH': 1,
        'Cargo Fact': 2,
        Condicion: 3,
        Condición: 3,
        'Cargo Fijo mensual': 4
      };

      form.reset({
        id: cargo.id,
        cuenta: cargo.cuenta || '',
        descripcion: cargo.descripcion || '',
        fijoVariable: cargo.fijoVariable || '',
        periodicoEventual: cargo.periodicoEventual || '',
        idConcepto: normalizeAndFind(conceptos, cargo.concepto),
        idTarifa: normalizeAndFind(tarifas, cargo.tarifa),
        idTipoMedidor: normalizeAndFind(tiposMedidor, cargo.tipoMedidor),
        tipoCargo: tipoCargoMap[cargo.tipoCargo] ?? 1,
        codigoEnerlova: cargo.codigoEnerlova || '',
        muestraValorCero: false
      });
    } else {
      form.reset({
        id: 0,
        cuenta: '',
        descripcion: '',
        fijoVariable: '',
        periodicoEventual: '',
        idConcepto: 0,
        idTarifa: 0,
        idTipoMedidor: 0,
        tipoCargo: 1,
        codigoEnerlova: '',
        muestraValorCero: false
      });
    }
  }, [isOpen, mode, cargo, conceptos, tarifas, tiposMedidor, form]);

  const onSubmitForm = async (data: CargoFacturableFormData) => {
    setIsLoading(true);
    try {
      const basePayload = {
        cuenta: data.cuenta.trim(),
        descripcion: data.descripcion.trim(),
        fijoVariable: data.fijoVariable,
        periodicoEventual: data.periodicoEventual,
        idConcepto: data.idConcepto,
        idTarifa: data.idTarifa,
        idTipoMedidor: data.idTipoMedidor,
        tipoCargo: data.tipoCargo,
        codigoEnerlova: data.codigoEnerlova.trim(),
        muestraValorCero: data.muestraValorCero
      };

      let result;
      if (mode === 'add') {
        const payload: CargoFacturableProps = basePayload;
        result = await administracionService.createCargoFacturable(payload);
      } else if (mode === 'edit' && cargo) {
        const payload: CargoFacturableFormValues = {
          ...basePayload,
          id: cargo.id
        };
        result = await administracionService.updateCargoFacturable(payload);
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      onSuccess();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Error al guardar el cargo facturable';
      console.error('Error al guardar el cargo facturable:', error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-175 lg:max-w-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            {mode === 'add' ? (
              <>
                <FilePlus2 className="h-6 w-6 text-green-600" />
                Agregar Cargo Facturable
              </>
            ) : (
              <>
                <FileEdit className="h-6 w-6 text-blue-600" />
                Editar Cargo Facturable
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {mode === 'add'
              ? 'Complete el formulario para crear un nuevo cargo.'
              : 'Modifique la información del cargo seleccionado.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitForm)}
            className="space-y-8 pt-4"
          >
            {/* Información Básica */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Información Básica</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="cuenta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Cuenta
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="cta001"
                          className="h-10 sm:h-11 text-sm sm:text-base"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="codigoEnerlova"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Código
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Código del cargo"
                          className="h-10 sm:h-11 text-sm sm:text-base"
                        />
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
                    <FormLabel className="flex items-center gap-2">
                      <Text className="h-4 w-4" />
                      Descripción
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Descripción detallada"
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Clasificación */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Tags className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-medium">Clasificación</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Controller
                  name="fijoVariable"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Repeat className="h-4 w-4" />
                        Fijo/Variable
                      </FormLabel>
                      <Select
                        options={fijoVariableOptions as OptionType[]}
                        value={fijoVariableOptions.find(
                          o => o.value === field.value
                        )}
                        onChange={(o: OptionType | null) =>
                          field.onChange(o ? o.value : '')
                        }
                        styles={selectStyles as never}
                        placeholder="Seleccione..."
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
                      <FormLabel className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5" />
                        Periódico/Eventual
                      </FormLabel>
                      <Select
                        options={periodicoEventualOptions as OptionType[]}
                        value={periodicoEventualOptions.find(
                          o => o.value === field.value
                        )}
                        onChange={(o: OptionType | null) =>
                          field.onChange(o ? o.value : '')
                        }
                        styles={selectStyles as never}
                        placeholder="Seleccione..."
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Asociaciones y Configuración */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Link2 className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-medium">
                  Asociaciones y Configuración
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Controller
                  name="idConcepto"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Concepto
                      </FormLabel>
                      <Select
                        options={conceptos.map(c => ({
                          value: c.id,
                          label: c.descripcion
                        }))}
                        value={conceptos
                          .map(c => ({ value: c.id, label: c.descripcion }))
                          .find(
                            c => Number(c.value) === Number(field.value)
                          )}
                        onChange={(o: { value: string } | null) =>
                          field.onChange(o ? Number(o.value) : 0)
                        }
                        styles={selectStyles as never}
                        placeholder="Seleccione..."
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  name="idTarifa"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Tarifa
                      </FormLabel>
                      <Select
                        options={tarifas.map(t => ({
                          value: t.id,
                          label: t.descripcion
                        }))}
                        value={tarifas
                          .map(t => ({ value: t.id, label: t.descripcion }))
                          .find(t => Number(t.value) === Number(field.value))}
                        onChange={(o: { value: string } | null) =>
                          field.onChange(o ? Number(o.value) : 0)
                        }
                        styles={selectStyles as never}
                        placeholder="Seleccione..."
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  name="idTipoMedidor"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Tipo Medidor
                      </FormLabel>
                      <Select
                        options={tiposMedidor.map(t => ({
                          value: t.id,
                          label: t.descripcion
                        }))}
                        value={tiposMedidor
                          .map(t => ({ value: t.id, label: t.descripcion }))
                          .find(t => Number(t.value) === Number(field.value))}
                        onChange={(o: { value: string } | null) =>
                          field.onChange(o ? Number(o.value) : 0)
                        }
                        styles={selectStyles as never}
                        placeholder="Seleccione..."
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="muestraValorCero"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4 bg-muted/30 mt-6 sm:mt-8 sm:col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="flex items-center gap-2">
                          <Settings2 className="h-4 w-4" />
                          ¿Mostrar valor en 0?
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4 sm:pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="h-10 sm:h-11 px-4 sm:px-6 w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 sm:h-11 px-4 sm:px-6 flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {mode === 'add' ? 'Crear' : 'Actualizar'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
