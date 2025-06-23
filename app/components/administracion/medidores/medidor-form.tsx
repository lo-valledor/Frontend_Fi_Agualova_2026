import type React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';
import { Gauge } from 'lucide-react';
import type {
  GetMedidores,
  CrearMedidorProps,
  ActualizarMedidorProps,
} from '~/types/administracion';
import type { Marca } from '~/types/mantencion';
import Select, { type StylesConfig, type SingleValue } from 'react-select';
import { useTheme } from '~/components/theme-provider';

interface OptionType {
  value: string;
  label: string;
}

interface MedidorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CrearMedidorProps | ActualizarMedidorProps,
    mode: 'add' | 'edit',
  ) => Promise<void>;
  medidor?: GetMedidores | null;
  mode: 'add' | 'edit';
  isLoading?: boolean;
  marcas: Marca[];
}

const initialFormData: CrearMedidorProps = {
  marcaId: 0,
  tipoId: 0,
  modelo: '',
  serie: '',
  estadoId: 0,
  fechaInicio: '',
  digitos: 0,
  multiplicar: 1,
  primeraLectura: '',
  fechaPrimeraLectura: '',
};

export function MedidorFormModal({
  isOpen,
  onClose,
  onSubmit,
  medidor,
  mode,
  isLoading,
  marcas,
}: MedidorFormModalProps) {
  const [formData, setFormData] = useState<CrearMedidorProps>(initialFormData);
  const { theme } = useTheme();

  const selectStyles: StylesConfig = {
    control: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
      borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
      '&:hover': {
        borderColor: theme === 'dark' ? '#475569' : '#CBD5E1',
      },
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#020617' : '#FFFFFF',
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? theme === 'dark'
          ? '#0891B2'
          : '#06B6D4'
        : isFocused
          ? theme === 'dark'
            ? '#1E293B'
            : '#F1F5F9'
          : 'transparent',
      color: isSelected ? '#FFFFFF' : theme === 'dark' ? '#F8FAFC' : '#0F172A',
      ':active': {
        ...styles[':active'],
        backgroundColor: theme === 'dark' ? '#0891B2' : '#06B6D4',
      },
    }),
    singleValue: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    }),
    input: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#FFFFFF' : '#000000',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: theme === 'dark' ? '#334155' : '#E2E8F0',
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
      '&:hover': {
        color: theme === 'dark' ? '#CBD5E1' : '#374151',
      },
    }),
    noOptionsMessage: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
    }),
    loadingMessage: (styles) => ({
      ...styles,
      color: theme === 'dark' ? '#94A3B8' : '#6B7280',
    }),
  };

  useEffect(() => {
    if (medidor && mode === 'edit') {
      setFormData({
        ...initialFormData,
        modelo: medidor.modelo,
        serie: medidor.serie,
        fechaInicio: medidor.fechaInicio.split('T')[0],
        digitos: medidor.digitos,
        multiplicar: medidor.multiplicar,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [medidor, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'add') {
        await onSubmit(formData, 'add');
      } else if (mode === 'edit' && medidor) {
        const updatePayload: ActualizarMedidorProps = {
          codigoMedidor: medidor.codigo,
          marcaId: formData.marcaId,
          modelo: formData.modelo,
          serie: formData.serie,
          estadoId: formData.estadoId,
          fechaInicio: formData.fechaInicio,
          digitos: formData.digitos,
          multiplicar: formData.multiplicar,
          tipoId: formData.tipoId,
          subempalmeCodigo: '',
          primeraLectura: formData.primeraLectura,
          fechaPrimeraLectura: formData.fechaPrimeraLectura,
        };
        await onSubmit(updatePayload, 'edit');
      }
    } catch (error) {
      // El error se maneja en el componente padre
    }
  };

  const handleInputChange = (
    field: keyof CrearMedidorProps,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-sky-900 dark:text-sky-100">
            <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
              <Gauge className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            </div>
            {mode === 'add' ? 'Crear Nuevo Medidor' : 'Editar Medidor'}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {mode === 'add'
              ? 'Complete la información para registrar un nuevo medidor.'
              : 'Modifique la información del medidor.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serie">N° Serie</Label>
              <Input
                id="serie"
                value={formData.serie}
                onChange={(e) => handleInputChange('serie', e.target.value)}
                placeholder="N° de Serie"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                placeholder="Modelo del medidor"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marcaId">Marca</Label>
              <Select
                styles={selectStyles}
                instanceId="marca-select"
                options={marcas.map((marca) => ({
                  value: marca.codigo,
                  label: marca.nombre,
                }))}
                value={
                  marcas
                    .map((m) => ({ value: m.codigo, label: m.nombre }))
                    .find((m) => Number(m.value) === formData.marcaId) || null
                }
                onChange={(option: any) =>
                  handleInputChange(
                    'marcaId',
                    option ? Number(option.value) : 0,
                  )
                }
                placeholder="Seleccione una marca"
                noOptionsMessage={() => 'No hay marcas disponibles'}
                required
                isDisabled={isLoading}
                isClearable={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipoId">Tipo de Medidor</Label>
              {/* Select pero los tipos no vienen de una api, son hardcodeados */}
              <Select
                styles={selectStyles}
                instanceId="tipo-select"
                options={[
                  {
                    value: 1,
                    label: 'Monofásico',
                  },
                  {
                    value: 2,
                    label: 'Trifásico',
                  },
                ]}
                value={
                  [
                    { value: 1, label: 'Monofásico' },
                    { value: 2, label: 'Trifásico' },
                  ].find(
                    (t: { value: number }) =>
                      Number(t.value) === formData.tipoId,
                  ) || null
                }
                onChange={(option: any) =>
                  handleInputChange('tipoId', option ? Number(option.value) : 0)
                }
                placeholder="Seleccione un tipo"
                noOptionsMessage={() => 'No hay tipos disponibles'}
                required
                isDisabled={isLoading}
                isClearable={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="digitos">Dígitos</Label>
              <Input
                id="digitos"
                type="number"
                value={formData.digitos}
                onChange={(e) => handleInputChange('digitos', +e.target.value)}
                placeholder="Cantidad de dígitos"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="multiplicar">Cons. Multiplicar</Label>
              <Input
                id="multiplicar"
                type="number"
                value={formData.multiplicar}
                onChange={(e) =>
                  handleInputChange('multiplicar', +e.target.value)
                }
                placeholder="Factor multiplicador"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={formData.fechaInicio}
                onChange={(e) =>
                  handleInputChange('fechaInicio', e.target.value)
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estadoId">Estado</Label>
              <Select
                styles={selectStyles}
                instanceId="estado-select"
                options={[
                  {
                    value: 1,
                    label: 'Activo',
                  },
                  {
                    value: 2,
                    label: 'En Bodega',
                  },
                  {
                    value: 3,
                    label: 'En reparación',
                  },
                  {
                    value: 4,
                    label: 'Inactivo',
                  },
                ]}
                value={
                  [
                    { value: 1, label: 'Activo' },
                    { value: 2, label: 'En Bodega' },
                    { value: 3, label: 'En reparación' },
                    { value: 4, label: 'Inactivo' },
                  ].find(
                    (t: { value: number }) =>
                      Number(t.value) === formData.estadoId,
                  ) || null
                }
                onChange={(option: any) =>
                  handleInputChange(
                    'estadoId',
                    option ? Number(option.value) : 0,
                  )
                }
                placeholder="Seleccione un estado"
                noOptionsMessage={() => 'No hay estados disponibles'}
                required
                isDisabled={isLoading}
                isClearable={true}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 pt-2">
              Primera Lectura (Opcional)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primeraLectura">Valor</Label>
                <Input
                  id="primeraLectura"
                  value={formData.primeraLectura}
                  onChange={(e) =>
                    handleInputChange('primeraLectura', e.target.value)
                  }
                  placeholder="Valor de primera lectura"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaPrimeraLectura">Fecha</Label>
                <Input
                  id="fechaPrimeraLectura"
                  type="date"
                  value={formData.fechaPrimeraLectura}
                  onChange={(e) =>
                    handleInputChange('fechaPrimeraLectura', e.target.value)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700"
              disabled={isLoading}
            >
              {isLoading
                ? mode === 'add'
                  ? 'Creando...'
                  : 'Guardando...'
                : mode === 'add'
                  ? 'Crear Medidor'
                  : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
