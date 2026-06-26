import { ArrowLeft, CheckCircle2, Copy, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import type {
  MedidorEstadoOption,
  MedidorFormState,
  MedidorMarcaOption,
  MedidorTipoOption
} from '~/components/administracion/medidores/medidores-types';
import { ModernHeader } from '~/components/shared/modern-header';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { administracionService } from '~/services/administracionService';
import type { MedidorProps } from '~/types/administracion';

interface MedidorCreado {
  codigo: string | number | null;
  fecha: string;
}

interface CrearMedidorComponentProps {
  readonly marcas: MedidorMarcaOption[];
  readonly tipos: MedidorTipoOption[];
  readonly estados: MedidorEstadoOption[];
}

const initialFormState: MedidorFormState = {
  idMarca: '',
  idTipo: '',
  modelo: '',
  serie: '',
  idEstado: '',
  fechaInicio: '',
  digitos: 5,
  multiplicador: 1,
  primeraLectura: '',
  fechaPrimeraLectura: '',
  horaPrimeraLectura: '',
  idSubEmpalme: ''
};

const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

const splitTime = (timeValue: string) => {
  if (!timeValue) {
    return { horaLectura: '', minutoLectura: '' };
  }

  const [horaLectura = '', minutoLectura = ''] = timeValue.split(':');
  return { horaLectura, minutoLectura };
};

export default function CrearMedidorComponent({
  marcas,
  tipos,
  estados
}: CrearMedidorComponentProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalExito, setModalExito] = useState(false);
  const [medidorCreado, setMedidorCreado] = useState<MedidorCreado | null>(
    null
  );
  const [formData, setFormData] = useState<MedidorFormState>(initialFormState);

  const handleInputChange = (
    field: keyof MedidorFormState,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copiarCodigoMedidor = async (codigo: string | number) => {
    try {
      await navigator.clipboard.writeText(codigo.toString());
      toast.success('ID del medidor copiado al portapapeles', {
        duration: 2000
      });
    } catch {
      toast.error('Error al copiar. Intente seleccionar manualmente el ID.');
    }
  };

  const validateRequiredFields = (): boolean => {
    const validations = [
      { field: formData.idMarca, message: 'La marca es obligatoria' },
      { field: formData.idTipo, message: 'El tipo de medidor es obligatorio' },
      { field: formData.modelo, message: 'El modelo es obligatorio' },
      { field: formData.serie, message: 'El número de serie es obligatorio' },
      { field: formData.idEstado, message: 'El estado es obligatorio' },
      {
        field: formData.fechaInicio,
        message: 'La fecha de inicio es obligatoria'
      }
    ];

    for (const validation of validations) {
      if (!validation.field) {
        toast.error(validation.message);
        return false;
      }
    }

    return true;
  };

  const prepareSubmitData = (): MedidorProps => {
    const { horaLectura, minutoLectura } = splitTime(
      formData.horaPrimeraLectura
    );

    return {
      idMarca: formData.idMarca,
      idTipo: formData.idTipo,
      modelo: formData.modelo.trim(),
      serie: formData.serie.trim(),
      idEstado: formData.idEstado,
      fechaInicio: formatDateForBackend(formData.fechaInicio),
      digitos: formData.digitos,
      multiplicador: formData.multiplicador,
      primeraLectura: formData.primeraLectura.trim() || '0',
      fechaLectura: formatDateForBackend(formData.fechaPrimeraLectura),
      horaLectura,
      minutoLectura,
      idSubEmpalme: formData.idSubEmpalme
    };
  };

  const handleSubmit = async () => {
    if (!validateRequiredFields()) return;

    setIsSubmitting(true);

    try {
      const submitData = prepareSubmitData();
      const result = await administracionService.crearMedidor(submitData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      setMedidorCreado({
        codigo: result.data?.id ?? null,
        fecha: fechaActual
      });
      setModalExito(true);
      setFormData(initialFormState);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Error inesperado al crear el medidor'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <ModernHeader
            title="Crear Nuevo Medidor"
            description="Creación de nuevo medidor para sistema"
            actions={
              <>
                <Button
                  variant="ghost"
                  onClick={() =>
                    navigate('/dashboard/administracion/medidores')
                  }
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate('/dashboard/administracion/medidores')
                  }
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="gap-2"
                  variant="default"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Creando...' : 'Crear Medidor'}
                </Button>
              </>
            }
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="bg-background rounded-xl shadow-sm border border-border">
          <form className="p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-sky-800 dark:text-sky-200">
                Información del Medidor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marca">
                    Marca <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.idMarca}
                    onValueChange={value => handleInputChange('idMarca', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {marcas.map(marca => (
                        <SelectItem key={marca.id} value={String(marca.id)}>
                          {marca.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">
                    Tipo de Medidor <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.idTipo}
                    onValueChange={value => handleInputChange('idTipo', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map(tipo => (
                        <SelectItem key={tipo.id} value={String(tipo.id)}>
                          {tipo.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="modelo">
                    Modelo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={e => handleInputChange('modelo', e.target.value)}
                    placeholder="Modelo del medidor"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serie">
                    Número de Serie <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="serie"
                    value={formData.serie}
                    onChange={e => handleInputChange('serie', e.target.value)}
                    placeholder="Número de serie"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Configuración Técnica
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estado">
                    Estado <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.idEstado}
                    onValueChange={value =>
                      handleInputChange('idEstado', value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map(estado => (
                        <SelectItem key={estado.id} value={String(estado.id)}>
                          {estado.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">
                    Fecha de Inicio <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={formData.fechaInicio}
                    onChange={e =>
                      handleInputChange('fechaInicio', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="digitos">Dígitos</Label>
                  <Input
                    id="digitos"
                    type="number"
                    value={formData.digitos}
                    onChange={e =>
                      handleInputChange(
                        'digitos',
                        Number.parseInt(e.target.value) || 0
                      )
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="multiplicador">Multiplicador</Label>
                  <Input
                    id="multiplicador"
                    type="number"
                    step="0.1"
                    value={formData.multiplicador}
                    onChange={e =>
                      handleInputChange(
                        'multiplicador',
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-violet-800 dark:text-violet-200">
                Primera Lectura
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primeraLectura">Primera Lectura</Label>
                  <Input
                    id="primeraLectura"
                    value={formData.primeraLectura}
                    onChange={e =>
                      handleInputChange('primeraLectura', e.target.value)
                    }
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaPrimeraLectura">
                    Fecha Primera Lectura
                  </Label>
                  <Input
                    id="fechaPrimeraLectura"
                    type="date"
                    value={formData.fechaPrimeraLectura}
                    onChange={e =>
                      handleInputChange('fechaPrimeraLectura', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horaPrimeraLectura">
                    Hora Primera Lectura
                  </Label>
                  <Input
                    id="horaPrimeraLectura"
                    type="time"
                    value={formData.horaPrimeraLectura}
                    onChange={e =>
                      handleInputChange('horaPrimeraLectura', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <Dialog open={modalExito} onOpenChange={setModalExito}>
          <DialogContent className="w-[95vw] sm:max-w-[500px] lg:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-xl font-bold text-green-900 dark:text-green-100">
                    ¡Medidor Creado Exitosamente!
                  </DialogTitle>
                  <DialogDescription className="text-sm text-green-700 dark:text-green-300 mt-1">
                    El medidor ha sido registrado correctamente en el sistema
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-900 dark:text-green-100">
                  Información del Medidor
                </AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200 space-y-2">
                  <div className="space-y-3">
                    {medidorCreado?.codigo && (
                      <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-green-200 dark:border-green-700">
                        <div>
                          <p className="font-medium">Código del Medidor:</p>
                          <p className="font-mono text-lg font-bold text-green-700 dark:text-green-300">
                            {medidorCreado.codigo}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copiarCodigoMedidor(medidorCreado.codigo!)
                          }
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copiar
                        </Button>
                      </div>
                    )}
                    <p>
                      <strong>Fecha de creación:</strong> {medidorCreado?.fecha}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setModalExito(false);
                    setMedidorCreado(null);
                  }}
                  className="flex-1 gap-2"
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setModalExito(false);
                    setMedidorCreado(null);
                    navigate('/dashboard/administracion/medidores');
                  }}
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Medidores
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
