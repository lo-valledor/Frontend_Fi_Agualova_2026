import React, { useEffect } from 'react';
import { z } from 'zod';
import type {
  BuscarCargoFacturable,
  GeCombosConceptos,
  GetCombosTiposMedidor,
  GetCombosTarifas,
} from '~/types/administracion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '~/lib/api';
import { toast } from 'sonner';
import Select, { type StylesConfig } from 'react-select';
import { useTheme } from '~/components/theme-provider';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
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
import { Checkbox } from '~/components/ui/checkbox';
import { Button } from '~/components/ui/button';
import {
  FilePlus2,
  FileEdit,
  Info,
  Hash,
  Type,
  Text,
  Repeat,
  CalendarClock,
  Tags,
  Receipt,
  DollarSign,
  Gauge,
  CheckCircle2,
  FileText,
  Link2,
  Settings2,
} from 'lucide-react';

const cargoFacturableFormSchema = z.object({
  cuenta: z.string().min(1, { message: 'La cuenta es requerida.' }),
  descripcion: z.string().min(1, { message: 'La descripción es requerida.' }),
  codigo: z.string().min(1, { message: 'El código es requerido.' }),
  tipo: z.string().min(1, { message: 'El tipo es requerido.' }),
  fijoVariable: z
    .string()
    .min(1, { message: 'Debe seleccionar si es fijo o variable.' }),
  periodicoEventual: z
    .string()
    .min(1, { message: 'Debe seleccionar si es periódico o eventual.' }),
  conceptoId: z.number().min(1, { message: 'El concepto es requerido.' }),
  tarifaId: z.number().min(1, { message: 'La tarifa es requerida.' }),
  tipoMedidorId: z
    .number()
    .min(1, { message: 'El tipo de medidor es requerido.' }),
  muestraValorEn0: z.boolean(),
});

type CargoFacturableFormValues = z.infer<typeof cargoFacturableFormSchema>;

interface CargoFacturableModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cargo: BuscarCargoFacturable | undefined;
  mode: 'add' | 'edit';
  conceptos: GeCombosConceptos[];
  tarifas: GetCombosTarifas[];
  tiposMedidor: GetCombosTiposMedidor[];
}

const tiposOptions = [
  { value: 'Base CH', label: 'Base CH' },
  { value: 'Cargo Fact.', label: 'Cargo Fact.' },
  { value: 'Condición', label: 'Condición' },
];

const fijoVariableOptions = [
  { value: 'Fijo', label: 'Fijo' },
  { value: 'Variable', label: 'Variable' },
];

const periodicoEventualOptions = [
  { value: 'Periodico', label: 'Periódico' },
  { value: 'Eventual', label: 'Eventual' },
];

export default function CargoFacturableModalForm({
  isOpen,
  onClose,
  onSuccess,
  cargo,
  mode,
  conceptos,
  tarifas,
  tiposMedidor,
}: CargoFacturableModalFormProps) {
  const { theme } = useTheme();
  const form = useForm<CargoFacturableFormValues>({
    resolver: zodResolver(cargoFacturableFormSchema),
    defaultValues: {
      cuenta: '',
      descripcion: '',
      codigo: '',
      tipo: '',
      fijoVariable: '',
      periodicoEventual: '',
      conceptoId: 0,
      tarifaId: 0,
      tipoMedidorId: 0,
      muestraValorEn0: false,
    },
  });

  const selectStyles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
      minHeight: '44px',
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? theme === 'dark'
          ? '#166534'
          : '#16A34A'
        : isFocused
          ? theme === 'dark'
            ? '#1E293B'
            : '#F1F5F9'
          : 'transparent',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    }),
  };

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (isOpen) {
      if (cargo && mode === 'edit') {
        const mapearFijoVariable = (valor: string) => {
          if (valor === 'F') return 'Fijo';
          if (valor === 'V') return 'Variable';
          return valor;
        };

        const mapearPeriodicoEventual = (valor: string) => {
          if (valor === 'P') return 'Periodico';
          if (valor === 'E') return 'Eventual';
          return valor;
        };

        const mapearTipo = (valorApi: string): string => {
          if (!valorApi) return '';
          const valorTrimmed = String(valorApi).trim().toLowerCase();

          if (valorTrimmed === '1' || valorTrimmed === 'base ch') return 'Base CH';
          if (valorTrimmed === '2' || valorTrimmed === 'cargo fact.') return 'Cargo Fact.';
          if (valorTrimmed === '3' || valorTrimmed === 'condición') return 'Condición';

          const foundOption = tiposOptions.find(
            (option) => option.label.toLowerCase() === valorTrimmed,
          );
          return foundOption ? foundOption.value : '';
        };

        const normalizeAndFind = (
          list: { id: number; nombre: string }[],
          name: string | undefined,
        ) => {
          if (!name) return 0;
          const normalizedName = name
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
          const found = list.find(
            (item) =>
              item.nombre
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') === normalizedName,
          );
          return found?.id || 0;
        };

        form.reset({
          cuenta: cargo.cuenta || '',
          descripcion: cargo.descripcion || '',
          codigo: cargo.codigoEnerlova || '',
          tipo: mapearTipo(cargo.tipo || ''),
          fijoVariable: mapearFijoVariable(cargo.fijoVariable || ''),
          periodicoEventual: mapearPeriodicoEventual(
            cargo.periodicoEventual || '',
          ),
          conceptoId: normalizeAndFind(conceptos, cargo.concepto),
          tarifaId: normalizeAndFind(tarifas, cargo.tarifa),
          tipoMedidorId: normalizeAndFind(tiposMedidor, cargo.tipoMedidor),
          muestraValorEn0: false, // Este valor deberá venir del backend
        });
      } else {
        form.reset({
          cuenta: '',
          descripcion: '',
          codigo: '',
          tipo: '',
          fijoVariable: '',
          periodicoEventual: '',
          conceptoId: 0,
          tarifaId: 0,
          tipoMedidorId: 0,
          muestraValorEn0: false,
        });
      }
    }
  }, [isOpen, cargo, mode, form, conceptos, tarifas, tiposMedidor]);

  const onSubmit = async (data: CargoFacturableFormValues) => {
    try {
      const getTipoNumero = (tipoString: string): number => {
        switch (tipoString) {
          case 'Base CH':
            return 1;
          case 'Cargo Fact.':
            return 2;
          case 'Condición':
            return 3;
          default:
            return 1;
        }
      };

      const mappedData = {
        cuenta: data.cuenta.trim(),
        descripcion: data.descripcion.trim(),
        fijoVariable: data.fijoVariable,
        periodicoEventual: data.periodicoEventual,
        conceptoId: data.conceptoId,
        tarifaId: data.tarifaId,
        tipoMedidorId: data.tipoMedidorId,
        tipo: getTipoNumero(data.tipo),
        codigoEnerlova: data.codigo.trim(),
        mostrarValorCero: data.muestraValorEn0,
      };

      if (mode === 'add') {
        await api.post('crearCargoFacturableNuevo', mappedData);
        toast.success('Cargo facturable creado exitosamente');
      } else if (cargo) {
        const updateData = { id: cargo.id, ...mappedData };
        await api.put('modificarCargoFacturable', updateData);
        toast.success('Cargo facturable actualizado exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar el cargo facturable:', error);
      toast.error('Error al guardar el cargo facturable');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-4">
            {/* Información Básica */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Información Básica</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <Input {...field} placeholder="cta001" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Código
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Código del cargo" className="h-11" />
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
                      <Input {...field} placeholder="Descripción detallada" className="h-11" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Controller
                  name="tipo"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Tipo
                      </FormLabel>
                      <Select
                        options={tiposOptions}
                        value={tiposOptions.find(o => o.value === field.value)}
                        onChange={(o: any) => field.onChange(o ? o.value : '')}
                        styles={selectStyles}
                        placeholder="Seleccione..."
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                        options={fijoVariableOptions}
                        value={fijoVariableOptions.find(o => o.value === field.value)}
                        onChange={(o: any) => field.onChange(o ? o.value : '')}
                        styles={selectStyles}
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
                        <CalendarClock className="h-4 w-4" />
                        Periódico/Eventual
                      </FormLabel>
                      <Select
                        options={periodicoEventualOptions}
                        value={periodicoEventualOptions.find(o => o.value === field.value)}
                        onChange={(o: any) => field.onChange(o ? o.value : '')}
                        styles={selectStyles}
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
                <h3 className="text-lg font-medium">Asociaciones y Configuración</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="conceptoId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Receipt className="h-4 w-4" />
                        Concepto
                      </FormLabel>
                      <Select
                        options={conceptos.map(c => ({ value: c.id, label: c.nombre }))}
                        value={conceptos.map(c => ({ value: c.id, label: c.nombre })).find(c => c.value === field.value)}
                        onChange={(o: any) => field.onChange(o ? o.value : 0)}
                        styles={selectStyles}
                        placeholder="Seleccione..."
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  name="tarifaId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Tarifa
                      </FormLabel>
                      <Select
                        options={tarifas.map(t => ({ value: t.id, label: t.nombre }))}
                        value={tarifas.map(t => ({ value: t.id, label: t.nombre })).find(t => t.value === field.value)}
                        onChange={(o: any) => field.onChange(o ? o.value : 0)}
                        styles={selectStyles}
                        placeholder="Seleccione..."
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Controller
                  name="tipoMedidorId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        Tipo Medidor
                      </FormLabel>
                      <Select
                        options={tiposMedidor.map(t => ({ value: t.id, label: t.nombre }))}
                        value={tiposMedidor.map(t => ({ value: t.id, label: t.nombre })).find(t => t.value === field.value)}
                        onChange={(o: any) => field.onChange(o ? o.value : 0)}
                        styles={selectStyles}
                        placeholder="Seleccione..."
                        isClearable
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="muestraValorEn0"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30 mt-8">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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

            <DialogFooter className="pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="h-11 px-6"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="h-11 px-6 flex items-center gap-2">
                {isLoading ? (
                  <><FileEdit className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> {mode === 'add' ? 'Crear' : 'Actualizar'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
