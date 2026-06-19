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
  Receipt,
  Repeat,
  Settings2,
  Tags,
  Text,
  Type
} from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'sonner';

import { getReactSelectStyles } from '~/components/shared/react-select-styles';
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
import api from '~/lib/api';
import type {
  CargoFacturableConceptos,
  CargoFacturableRow,
  CargoFacturableTarifas,
  CargoFacturableTiposMedidor
} from '~/types/administracion';

interface CargoFacturableModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  onSuccess: () => void;
  cargo: CargoFacturableRow | undefined;
  mode: 'add' | 'edit';
  conceptos: CargoFacturableConceptos[];
  tarifas: CargoFacturableTarifas[];
  tiposMedidor: CargoFacturableTiposMedidor[];
}

const tiposOptions = [
  { value: 'Base CH', label: 'Base CH' },
  { value: 'Cargo Fact', label: 'Cargo Fact' },
  { value: 'Condicion', label: 'Condición' }
];

const fijoVariableOptions = [
  { value: 'Fijo', label: 'Fijo' },
  { value: 'Variable', label: 'Variable' }
];

const periodicoEventualOptions = [
  { value: 'Periodico', label: 'Periódico' },
  { value: 'Eventual', label: 'Eventual' }
];

export default function CargoFacturableModalForm({
  isOpen,
  onClose,
  cargo,
  mode,
  conceptos,
  tarifas,
  tiposMedidor,
  onSuccess
}: Readonly<CargoFacturableModalFormProps>) {
  const { theme } = useTheme();
  const form = useForm({
    defaultValues: {
      cuenta: '',
      descripcion: '',
      fijoVariable: '',
      periodicoEventual: '',
      idConcepto: 0,
      idTarifa: 0,
      idTipoMedidor: 0,
      codigoEnerlova: '',
      muestraValorCero: false
    }
  });

  // Usar estilos compartidos para react-select
  const selectStyles = getReactSelectStyles(theme);

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

        const normalizeAndFind = (
          list: { id: string; descripcion: string }[],
          name: string | undefined
        ) => {
          if (!name) return 0;
          const normalizedName = name
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replaceAll(/[\u0300-\u036f]/g, '');
          const found = list.find(
            item =>
              item.descripcion
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replaceAll(/[\u0300-\u036f]/g, '') === normalizedName
          );
          return found?.id || 0;
        };

        form.reset({
          cuenta: cargo.cuenta || '',
          descripcion: cargo.descripcion || '',
          codigoEnerlova: cargo.codigoEnerlova || '',
          fijoVariable: mapearFijoVariable(cargo.fijoVariable || ''),
          periodicoEventual: mapearPeriodicoEventual(
            cargo.periodicoEventual || ''
          ),
          idConcepto: normalizeAndFind(conceptos, cargo.concepto),
          idTarifa: normalizeAndFind(tarifas, cargo.tarifa),
          idTipoMedidor: normalizeAndFind(tiposMedidor, cargo.tipoMedidor)
        });
      } else {
        form.reset({
          cuenta: '',
          descripcion: '',
          codigoEnerlova: '',
          fijoVariable: '',
          periodicoEventual: '',
          idConcepto: 0,
          idTarifa: 0,
          idTipoMedidor: 0,
          muestraValorCero: false
        });
      }
    }
  }, [isOpen, cargo, mode, form, conceptos, tarifas, tiposMedidor]);

  const onSubmitForm = async (data: any) => {
    try {
      const getTipoNumero = (tipoString: string): number => {
        switch (tipoString) {
          case 'Base CH':
            return 1;
          case 'Cargo Fact':
            return 2;
          case 'Condición':
            return 3;
          case 'Cargo Fijo mensual':
            return 4;
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
        idTipoMedidor: data.idTipoMedidor,
        tipo: getTipoNumero(data.tipo),
        codigoEnerlova: data.codigo.trim(),
        mostrarValorCero: data.muestraValorCero
      };

      if (mode === 'add') {
        await api.post('crearCargoFacturableNuevo', mappedData);
        toast.success('Cargo facturable creado exitosamente');
      } else if (cargo) {
        const updateData = { id: cargo.id, ...mappedData };
        await api.put('modificarCargoFacturable', updateData);
        toast.success('Cargo facturable actualizado exitosamente');
      }
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error('Error al guardar el cargo facturable', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Controller
                  name="idTipoMedidor"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Tipo
                      </FormLabel>
                      <Select
                        options={tiposOptions}
                        value={tiposOptions.find(
                          o => o.value === field.value.toString()
                        )}
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
                        value={fijoVariableOptions.find(
                          o => o.value === field.value
                        )}
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
                        value={periodicoEventualOptions.find(
                          o => o.value === field.value
                        )}
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
                          .find(c => c.value === field.value.toString())}
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
                          .find(t => t.value === field.value.toString())}
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
                          .find(t => t.value === field.value.toString())}
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
                  name="muestraValorCero"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4 bg-muted/30 mt-6 sm:mt-8 sm:col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value.toString() === 'true'}
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
                    <FileEdit className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />{' '}
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
