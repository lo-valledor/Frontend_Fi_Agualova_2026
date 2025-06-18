'use client';

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
import { Switch } from '~/components/ui/switch';
import { Textarea } from '~/components/ui/textarea';
import type {
  ClientesFormData,
  GetClientesByRut,
  GetGiros,
  GetRegiones,
} from '~/types/administracion';
import api from '~/lib/api';
import { toast } from 'sonner';
import Select, { type StylesConfig } from 'react-select';
import { useTheme } from '~/components/theme-provider';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientesFormData) => void;
  client?: GetClientesByRut | null;
  mode: 'add' | 'edit';
  giros: GetGiros[];
  regiones: GetRegiones[];
}

const initialFormData: ClientesFormData = {
  rut: '',
  nombre: '',
  apellido: '',
  esEmpresa: false,
  direccion: '',
  codComuna: '',
  contacto: '',
  telefono: '',
  correo: '',
  codigoGiro: '',
};

interface Comuna {
  nombre: string;
  codigo: string;
}

export function ClientFormModal({
  isOpen,
  onClose,
  onSubmit,
  client,
  mode,
  giros,
  regiones,
}: ClientFormModalProps) {
  const [formData, setFormData] = useState<ClientesFormData>(initialFormData);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [comunas, setComunas] = useState<Comuna[]>([]);
  const [isComunasLoading, setIsComunasLoading] = useState(false);
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
          ? '#166534'
          : '#16A34A'
        : isFocused
          ? theme === 'dark'
            ? '#1E293B'
            : '#F1F5F9'
          : 'transparent',
      color: isSelected ? '#FFFFFF' : theme === 'dark' ? '#F8FAFC' : '#0F172A',
      ':active': {
        ...styles[':active'],
        backgroundColor: theme === 'dark' ? '#166534' : '#16A34A',
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
    if (isOpen) {
      if (client && mode === 'edit') {
        setFormData({
          rut: client.rut,
          nombre: client.nombre,
          apellido: client.apellido,
          esEmpresa: client.esEmpresa,
          direccion: client.direccion,
          codComuna: client.codComuna,
          contacto: client.contacto || '',
          telefono: client.telefono || '',
          correo: client.correo || '',
          codigoGiro: client.codigoGiro || '',
        });
      } else {
        setFormData(initialFormData);
      }
      // Reset region and communes when modal opens/changes
      setSelectedRegion('');
      setComunas([]);
    }
  }, [client, mode, isOpen]);

  useEffect(() => {
    const fetchComunas = async () => {
      if (!selectedRegion) {
        setComunas([]);
        return;
      }

      setIsComunasLoading(true);
      try {
        const response = await api.get<Comuna[]>(
          `/comuna/por-region/${selectedRegion}`,
        );
        setComunas(response.data as Comuna[]);
      } catch (error) {
        console.error('Error fetching comunas:', error);
        setComunas([]);
        toast.error(
          'No se pudieron cargar las comunas para la región seleccionada.',
        );
      } finally {
        setIsComunasLoading(false);
      }
    };

    if (isOpen) {
      fetchComunas();
    }
  }, [selectedRegion, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (
    field: keyof ClientesFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const regionOptions = regiones.map((r) => ({
    value: r.region,
    label: r.region,
  }));
  const selectedRegionObject =
    regionOptions.find((o) => o.value === selectedRegion) || null;

  const comunaOptions = comunas.map((c) => ({
    value: c.codigo,
    label: c.nombre,
  }));
  if (
    mode === 'edit' &&
    client?.comuna &&
    !comunaOptions.some((c) => c.value === client.codComuna)
  ) {
    comunaOptions.unshift({ value: client.codComuna, label: client.comuna });
  }
  const selectedComunaObject =
    comunaOptions.find((o) => o.value === formData.codComuna) || null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-emerald-800 dark:text-emerald-200">
            {mode === 'add' ? 'Agregar Cliente' : 'Editar Cliente'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Completa la información para crear un nuevo cliente.'
              : 'Modifica la información del cliente seleccionado.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Información Principal */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Información Principal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) => handleInputChange('rut', e.target.value)}
                  placeholder="12.345.678-9"
                  required
                  disabled={mode === 'edit'}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="esEmpresa"
                  checked={formData.esEmpresa}
                  onCheckedChange={(checked) =>
                    handleInputChange('esEmpresa', checked)
                  }
                />
                <Label htmlFor="esEmpresa">¿Es una empresa?</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  {formData.esEmpresa ? 'Razón Social' : 'Nombres'}
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder={
                    formData.esEmpresa ? 'Nombre de la empresa' : 'Juan'
                  }
                  required
                />
              </div>
              {!formData.esEmpresa && (
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellidos</Label>
                  <Input
                    id="apellido"
                    value={formData.apellido}
                    onChange={(e) =>
                      handleInputChange('apellido', e.target.value)
                    }
                    placeholder="Pérez"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Información de Ubicación */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-violet-700 dark:text-violet-300">
              Información de Ubicación
            </h3>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Textarea
                id="direccion"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                placeholder="Av. Siempre Viva 742"
                rows={2}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Región</Label>
                <Select
                  styles={selectStyles}
                  instanceId="region-select"
                  options={regionOptions}
                  value={selectedRegionObject}
                  onChange={(option) => {
                    const value = option
                      ? (option as { value: string }).value
                      : '';
                    setSelectedRegion(value);
                    handleInputChange('codComuna', '');
                  }}
                  placeholder="Selecciona una región"
                  isClearable
                  noOptionsMessage={() => 'No se encontraron regiones.'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codComuna">Comuna</Label>
                <Select
                  styles={selectStyles}
                  instanceId="comuna-select"
                  options={comunaOptions}
                  value={selectedComunaObject}
                  onChange={(option) => {
                    handleInputChange(
                      'codComuna',
                      option ? (option as { value: string }).value : '',
                    );
                  }}
                  isDisabled={!selectedRegion || isComunasLoading}
                  isLoading={isComunasLoading}
                  placeholder={
                    isComunasLoading ? 'Cargando...' : 'Selecciona una comuna'
                  }
                  noOptionsMessage={() =>
                    selectedRegion
                      ? 'No hay comunas'
                      : 'Selecciona una región primero'
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Información de Contacto
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contacto">Nombre de Contacto</Label>
                <Input
                  id="contacto"
                  value={formData.contacto}
                  onChange={(e) =>
                    handleInputChange('contacto', e.target.value)
                  }
                  placeholder="Persona de contacto (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) =>
                    handleInputChange('telefono', e.target.value)
                  }
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="correo">Correo Electrónico</Label>
                <Input
                  id="correo"
                  type="email"
                  value={formData.correo}
                  onChange={(e) => handleInputChange('correo', e.target.value)}
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>
            </div>
          </div>

          {/* Información Comercial */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Información Comercial
            </h3>
            <div className="space-y-2">
              <Label htmlFor="codigoGiro">Giro Económico</Label>
              <Select
                styles={selectStyles}
                options={giros.map((g) => ({
                  value: g.codigo,
                  label: g.actividadEconomica,
                }))}
                value={
                  giros
                    .map((g) => ({
                      value: g.codigo,
                      label: g.actividadEconomica,
                    }))
                    .find((g) => g.value === formData.codigoGiro) || null
                }
                onChange={(option) => {
                  handleInputChange(
                    'codigoGiro',
                    option ? (option as { value: string }).value : '',
                  );
                }}
                placeholder="Buscar y seleccionar un giro..."
                isClearable
                noOptionsMessage={() => 'No se encontraron giros.'}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {mode === 'add' ? 'Crear Cliente' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
