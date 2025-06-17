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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { Textarea } from '~/components/ui/textarea';
import type {
  ClientesFormData,
  GetClientes,
  GetGiros,
  GetRegiones,
} from '~/types/administracion';
import api from '~/lib/api';
import { toast } from 'sonner';
import { Combobox } from '~/components/ui/combobox';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientesFormData) => void;
  client?: GetClientes | null;
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

  useEffect(() => {
    if (isOpen) {
      if (client && mode === 'edit') {
        let nombre = '';
        let apellido = '';

        if (client.esEmpresa) {
          nombre = client.nombreCompleto;
        } else {
          const nameParts = client.nombreCompleto.split(' ');
          nombre = nameParts.shift() || '';
          apellido = nameParts.join(' ');
        }

        setFormData({
          rut: client.rut,
          nombre,
          apellido,
          esEmpresa: client.esEmpresa,
          direccion: client.direccion,
          codComuna: client.codigoComuna,
          contacto: client.contacto || '',
          telefono: client.telefono || '',
          correo: client.email || '',
          codigoGiro: '', // El giro debe ser seleccionado nuevamente en edición por ahora
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
                  onValueChange={(value) => {
                    setSelectedRegion(value);
                    // Reset comuna when region changes
                    handleInputChange('codComuna', '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una región" />
                  </SelectTrigger>
                  <SelectContent>
                    {regiones.map((region) => (
                      <SelectItem key={region.codigo} value={region.region}>
                        {region.region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="codComuna">Comuna</Label>
                <Select
                  value={formData.codComuna}
                  onValueChange={(value) =>
                    handleInputChange('codComuna', value)
                  }
                  disabled={!selectedRegion || isComunasLoading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isComunasLoading
                          ? 'Cargando...'
                          : 'Selecciona una comuna'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {mode === 'edit' && !selectedRegion && client?.comuna && (
                      <SelectItem
                        key={client.codigoComuna}
                        value={client.codigoComuna}
                      >
                        {client.comuna}
                      </SelectItem>
                    )}
                    {comunas.map((comuna) => (
                      <SelectItem key={comuna.codigo} value={comuna.codigo}>
                        {comuna.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Combobox
                options={giros.map((g) => ({
                  value: g.codigo,
                  label: g.codigo + ' - ' + g.actividadEconomica,
                }))}
                value={formData.codigoGiro}
                onChange={(value) => handleInputChange('codigoGiro', value)}
                placeholder="Selecciona un giro"
                searchPlaceholder="Buscar giro..."
                emptyMessage="No se encontraron giros."
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
