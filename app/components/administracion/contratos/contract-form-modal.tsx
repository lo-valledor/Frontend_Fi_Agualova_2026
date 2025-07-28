import type React from 'react';
import { useEffect, useState } from 'react';

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
import { Textarea } from '~/components/ui/textarea';
import type { ContratoFormData, GetContratos } from '~/types/administracion';
import type { Tarifas, TiposContrato } from '~/types/mantencion';

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContratoFormData) => void;
  contract?: GetContratos | null;
  mode: 'add' | 'edit';
  tipoContrato: TiposContrato[];
  tarifas: Tarifas[];
}

export function ContractFormModal({
  isOpen,
  onClose,
  onSubmit,
  contract,
  mode,
  tipoContrato,
  tarifas,
}: ContractFormModalProps) {
  const [formData, setFormData] = useState<ContratoFormData>({
    tipoContrato: '',
    tarifa: '',
    nombrePropietario: '',
    nombreCliente: '',
    local: '',
    fechaInicio: '',
    activo: true,
    fechaTermino: '',
    comunaEnvio: '',
    direccionEnvio: '',
    limiteInvierno: 0,
    promedioAnual: '',
    cicloFacturacion: '',
    potenciaContratada: '',
    liberadoCorte: false,
    madre: '',
  });

  useEffect(() => {
    if (contract && mode === 'edit') {
      setFormData({
        tipoContrato: contract.tipoContrato,
        tarifa: contract.tarifa,
        nombrePropietario: contract.nombrePropietario,
        nombreCliente: contract.nombreCliente,
        local: contract.local,
        fechaInicio: contract.fechaInicio.split('T')[0], // Format for date input
        activo: contract.activo,
        fechaTermino: contract.fechaTermino
          ? contract.fechaTermino.split('T')[0]
          : '',
        comunaEnvio: contract.comunaEnvio,
        direccionEnvio: contract.direccionEnvio,
        limiteInvierno: contract.limiteInvierno,
        promedioAnual: contract.promedioAnual,
        cicloFacturacion: contract.cicloFacturacion,
        potenciaContratada: contract.potenciaContratada,
        liberadoCorte: contract.liberadoCorte,
        madre: contract.madre || '',
      });
    } else {
      setFormData({
        tipoContrato: '',
        tarifa: '',
        nombrePropietario: '',
        nombreCliente: '',
        local: '',
        fechaInicio: '',
        activo: true,
        fechaTermino: '',
        comunaEnvio: '',
        direccionEnvio: '',
        limiteInvierno: 0,
        promedioAnual: '',
        cicloFacturacion: '',
        potenciaContratada: '',
        liberadoCorte: false,
        madre: '',
      });
    }
  }, [contract, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (
    field: keyof ContratoFormData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold'>
            {mode === 'add' ? 'Agregar Contrato' : 'Editar Contrato'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Completa la información para crear un nuevo contrato.'
              : 'Modifica la información del contrato seleccionado.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Información básica del contrato */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-sky-800 dark:text-sky-200'>
              Información del Contrato
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='tipoContrato'>Tipo de Contrato</Label>
                <Select
                  value={formData.tipoContrato}
                  onValueChange={value =>
                    handleInputChange('tipoContrato', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecciona tipo' />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoContrato.map(tipo => (
                      <SelectItem
                        key={tipo.id}
                        value={tipo.id.toString()}
                        className='capitalize'
                      >
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='tarifa'>Tarifa</Label>
                <Select
                  value={formData.tarifa}
                  onValueChange={value => handleInputChange('tarifa', value)}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecciona tarifa' />
                  </SelectTrigger>
                  <SelectContent>
                    {tarifas.map(tarifa => (
                      <SelectItem
                        key={tarifa.id}
                        value={tarifa.id.toString()}
                        className='capitalize'
                      >
                        {tarifa.codigo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Información de personas */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-emerald-800 dark:text-emerald-200'>
              Información de Personas
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='nombrePropietario'>Nombre Propietario</Label>
                <Input
                  id='nombrePropietario'
                  value={formData.nombrePropietario}
                  onChange={e =>
                    handleInputChange('nombrePropietario', e.target.value)
                  }
                  placeholder='Nombre del propietario'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='nombreCliente'>Nombre Cliente</Label>
                <Input
                  id='nombreCliente'
                  value={formData.nombreCliente}
                  onChange={e =>
                    handleInputChange('nombreCliente', e.target.value)
                  }
                  placeholder='Nombre del cliente'
                  required
                />
              </div>
            </div>
          </div>

          {/* Información de ubicación */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-violet-800 dark:text-violet-200'>
              Información de Ubicación
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='local'>Local</Label>
                <Input
                  id='local'
                  value={formData.local}
                  onChange={e => handleInputChange('local', e.target.value)}
                  placeholder='Nombre del local'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='comunaEnvio'>Comuna de Envío</Label>
                <Input
                  id='comunaEnvio'
                  value={formData.comunaEnvio}
                  onChange={e =>
                    handleInputChange('comunaEnvio', e.target.value)
                  }
                  placeholder='Comuna de envío'
                  required
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='direccionEnvio'>Dirección de Envío</Label>
              <Textarea
                id='direccionEnvio'
                value={formData.direccionEnvio}
                onChange={e =>
                  handleInputChange('direccionEnvio', e.target.value)
                }
                placeholder='Dirección completa de envío'
                rows={2}
                required
              />
            </div>
          </div>

          {/* Fechas y configuración */}
          <div className='space-y-4'>
            <h3 className='text-sm font-medium text-amber-800 dark:text-amber-200'>
              Fechas y Configuración
            </h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='fechaInicio'>Fecha de Inicio</Label>
                <Input
                  id='fechaInicio'
                  type='date'
                  value={formData.fechaInicio}
                  onChange={e =>
                    handleInputChange('fechaInicio', e.target.value)
                  }
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='fechaTermino'>Fecha de Término</Label>
                <Input
                  id='fechaTermino'
                  type='date'
                  value={formData.fechaTermino}
                  onChange={e =>
                    handleInputChange('fechaTermino', e.target.value)
                  }
                />
              </div>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='limiteInvierno'>Límite Invierno (kWh)</Label>
                <Input
                  id='limiteInvierno'
                  type='number'
                  value={formData.limiteInvierno}
                  onChange={e =>
                    handleInputChange('limiteInvierno', Number(e.target.value))
                  }
                  placeholder='0'
                  min='0'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='promedioAnual'>Promedio Anual</Label>
                <Input
                  id='promedioAnual'
                  value={formData.promedioAnual}
                  onChange={e =>
                    handleInputChange('promedioAnual', e.target.value)
                  }
                  placeholder='Promedio anual'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='potenciaContratada'>Potencia Contratada</Label>
                <Input
                  id='potenciaContratada'
                  value={formData.potenciaContratada}
                  onChange={e =>
                    handleInputChange('potenciaContratada', e.target.value)
                  }
                  placeholder='kW'
                />
              </div>
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='cicloFacturacion'>Ciclo de Facturación</Label>
                <Select
                  value={formData.cicloFacturacion}
                  onValueChange={value =>
                    handleInputChange('cicloFacturacion', value)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Selecciona ciclo' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Mensual'>Mensual</SelectItem>
                    <SelectItem value='Bimestral'>Bimestral</SelectItem>
                    <SelectItem value='Trimestral'>Trimestral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='activo'>Estado</Label>
                <Select
                  value={formData.activo.toString()}
                  onValueChange={value =>
                    handleInputChange('activo', value === 'true')
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='true'>Activo</SelectItem>
                    <SelectItem value='false'>Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='liberadoCorte'>Liberado de Corte</Label>
                <Select
                  value={formData.liberadoCorte.toString()}
                  onValueChange={value =>
                    handleInputChange('liberadoCorte', value === 'true')
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='true'>Sí</SelectItem>
                    <SelectItem value='false'>No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 pt-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type='submit'
              className='bg-sky-600 hover:bg-sky-700 text-white'
            >
              {mode === 'add' ? 'Crear' : 'Actualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
