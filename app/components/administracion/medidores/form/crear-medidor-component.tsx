import { ArrowLeft, CheckCircle2, Copy, Save, X } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useNavigate } from 'react-router';

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
import { administracionService } from '~/services';
import type { MedidorFormData } from '~/types/administracion';
import type { Marca } from '~/types/mantencion';

interface EstadoMedidor {
  id: number;
  nombre: string;
}

interface MedidorCreado {
  id: string | number | null;
  codigo?: string | number | null;
  fecha: string;
}

const ESTADOS_MEDIDOR: EstadoMedidor[] = [
  { id: 2, nombre: 'En Bodega' },
  { id: 3, nombre: 'Inactivo' },
  { id: 4, nombre: 'Activo' },
  { id: 5, nombre: 'En Reparación' }
];

export default function CrearMedidorComponent({
  marcas = [],
  tipoMedidor = []
}: {
  readonly marcas: Marca[];
  readonly tipoMedidor: { id: number; nombre: string }[];
}) {
  const navigate = useNavigate();

  // Estados para el formulario
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el modal de éxito
  const [modalExito, setModalExito] = useState(false);
  const [medidorCreado, setMedidorCreado] = useState<MedidorCreado | null>(
    null
  );

  const [formData, setFormData] = useState<MedidorFormData>({
    marca: '',
    tipo: '',
    modelo: '',
    serie: '',
    estado: '', // Nuevo por defecto
    fechaInicio: '',
    digitos: 5,
    multiplicar: 1,
    primeraLectura: '',
    fechaPrimeraLectura: ''
  });

  const handleInputChange = (
    field: keyof MedidorFormData,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Función para copiar código al portapapeles
  const copiarCodigoMedidor = async (codigo: string | number) => {
    try {
      await navigator.clipboard.writeText(codigo.toString());
      toast.success('ID del medidor copiado al portapapeles', {
        duration: 2000
      });
    } catch (error) {
      console.error('Error al copiar ID del medidor:', error);
      toast.error('Error al copiar. Intente seleccionar manualmente el ID.');
    }
  };

  // Validación de campos requeridos
  const validateRequiredFields = (): boolean => {
    const validations = [
      {
        field: formData.marca,
        message: 'La marca es obligatoria'
      },
      {
        field: formData.tipo,
        message: 'El tipo de medidor es obligatorio'
      },
      {
        field: formData.modelo,
        message: 'El modelo es obligatorio'
      },
      {
        field: formData.serie,
        message: 'El número de serie es obligatorio'
      },
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

  // Validación de entidades existentes
  const validateEntities = () => {
    if (!marcas || marcas.length === 0) {
      toast.error('No hay marcas disponibles. Por favor, recarga la página.');
      return null;
    }

    if (!tipoMedidor || tipoMedidor.length === 0) {
      toast.error(
        'No hay tipos de medidor disponibles. Por favor, recarga la página.'
      );
      return null;
    }

    const marcaSeleccionada = marcas.find(
      m => m.codigo?.toString() === formData.marca
    );
    if (!marcaSeleccionada) {
      toast.error('La marca seleccionada no es válida.');
      return null;
    }

    const tipoSeleccionado = tipoMedidor.find(
      t => t.id.toString() === formData.tipo
    );
    if (!tipoSeleccionado) {
      toast.error('El tipo de medidor seleccionado no es válido.');
      return null;
    }

    const estadoSeleccionado = ESTADOS_MEDIDOR.find(
      e => e.id.toString() === formData.estado
    );
    if (!estadoSeleccionado) {
      toast.error('El estado seleccionado no es válido.');
      return null;
    }

    return {
      marcaSeleccionada,
      tipoSeleccionado,
      estadoSeleccionado
    };
  };

  // Preparación de datos para envío
  const prepareSubmitData = () => {
    const formatDateForSP = (dateString: string): string => {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      return `${day}-${month}-${year}`;
    };

    return {
      marcaId: formData.marca,
      tipoId: parseInt(formData.tipo),
      modelo: formData.modelo.trim(),
      serie: formData.serie.trim(),
      estadoId: parseInt(formData.estado),
      fechaInicio: formatDateForSP(formData.fechaInicio),
      digitos: formData.digitos,
      multiplicar: formData.multiplicar,
      primeraLectura: formData.primeraLectura,
      fechaPrimeraLectura: formatDateForSP(formData.fechaPrimeraLectura)
    };
  };

  // Manejo de errores HTTP
  const handleHttpError = (error: any) => {
    console.error('❌ Error completo al crear medidor:', error);
    console.error('❌ Error response:', error.response);
    console.error('❌ Error data:', error.response?.data);

    const errorMessages: Record<number, string> = {
      500: 'Error interno del servidor. Verifica que todos los datos sean válidos.',
      400: 'Datos inválidos. Revisa la información ingresada.',
      401: 'No tienes permisos para realizar esta acción.'
    };

    const status = error.response?.status;
    const serverMessage = error.response?.data?.message || error.response?.data;
    const message =
      errorMessages[status] ||
      'Error inesperado al crear el medidor. Contacta al administrador.';

    // Mostrar mensaje del servidor si está disponible
    if (serverMessage && typeof serverMessage === 'string') {
      toast.error(`${message}\n\nDetalle: ${serverMessage}`);
    } else {
      toast.error(message);
    }
  };

  const handleSubmit = async () => {
    if (!validateRequiredFields()) return;

    setIsSubmitting(true);

    try {
      const entities = validateEntities();
      if (!entities) return;

      const submitData = prepareSubmitData();

      console.log('📤 [DEBUG] Payload enviado:', submitData);
      const result = await administracionService.crearMedidor(submitData);
      console.log('📨 [DEBUG] Respuesta del backend:', result);

      if (result.error) {
        console.error('❌ Error del servicio:', result.error);
        toast.error(result.error || 'Error al crear el medidor');
        return;
      }

      // Buscar el código/id del medidor en diferentes estructuras posibles
      let medidorId: string | number | null = null;
      let medidorCodigo: string | number | null = null;

      if ((result.data as any)?.codigoMedidor) {
        medidorCodigo = (result.data as any).codigoMedidor;
      } else if ((result.data as any)?.codigo) {
        medidorCodigo = (result.data as any).codigo;
      }
      if (result.data?.id) {
        medidorId = result.data.id;
      } else if (result.data && typeof result.data === 'number') {
        medidorId = result.data;
      } else if (result.data && typeof result.data === 'string') {
        medidorId = result.data;
      }

      // Preparar datos del medidor creado y mostrar modal
      const fechaActual = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      setMedidorCreado({
        id: medidorId,
        codigo: medidorCodigo,
        fecha: fechaActual
      });
      setModalExito(true);
    } catch (error: any) {
      console.error('❌ Error en handleSubmit:', error);
      handleHttpError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 py-4'>
          <ModernHeader
            title='Crear Nuevo Medidor'
            description='Creación de nuevo medidor para sistema'
            actions={
              <>
                <Button
                  variant='ghost'
                  onClick={() =>
                    navigate('/dashboard/administracion/medidores')
                  }
                  disabled={isSubmitting}
                  className='gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Volver
                </Button>
                <Button
                  variant='outline'
                  onClick={() =>
                    navigate('/dashboard/administracion/medidores')
                  }
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className='gap-2 bg-sky-600 hover:bg-sky-700 text-white'
                  disabled={isSubmitting}
                >
                  <Save className='h-4 w-4' />
                  {isSubmitting ? 'Creando...' : 'Crear Medidor'}
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className='container mx-auto px-4 py-6 space-y-6'>
        <div className='bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700/60'>
          <form className='p-6 space-y-6'>
            {/* Información básica del medidor */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-sky-800 dark:text-sky-200'>
                Información del Medidor
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='marca'>Marca <span className='text-red-500'>*</span></Label>
                  <Select
                    value={formData.marca}
                    onValueChange={value => handleInputChange('marca', value)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Seleccionar marca' />
                    </SelectTrigger>
                    <SelectContent>
                      {marcas
                        .filter(marca => marca.codigo != null)
                        .map(marca => (
                          <SelectItem
                            key={marca.codigo}
                            value={marca.codigo.toString()}
                          >
                            {marca.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='tipo'>Tipo de Medidor <span className='text-red-500'>*</span></Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={value => handleInputChange('tipo', value)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Seleccionar tipo' />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoMedidor
                        .filter(tipo => tipo.id != null)
                        .map(tipo => (
                          <SelectItem key={tipo.id} value={tipo.id.toString()}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='modelo'>Modelo <span className='text-red-500'>*</span></Label>
                  <Input
                    id='modelo'
                    value={formData.modelo}
                    onChange={e => handleInputChange('modelo', e.target.value)}
                    placeholder='Modelo del medidor'
                    className='w-full'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='serie'>Número de Serie <span className='text-red-500'>*</span></Label>
                  <Input
                    id='serie'
                    value={formData.serie}
                    onChange={e => handleInputChange('serie', e.target.value)}
                    placeholder='Número de serie'
                    className='w-full'
                    required
                  />
                </div>
              </div>
            </div>

            {/* Configuración técnica */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-emerald-800 dark:text-emerald-200'>
                Configuración Técnica
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='estado'>Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={value => handleInputChange('estado', value)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Seleccionar estado' />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_MEDIDOR.map(estado => (
                        <SelectItem
                          key={estado.id}
                          value={estado.id.toString()}
                        >
                          {estado.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='fechaInicio'>Fecha de Inicio <span className='text-red-500'>*</span></Label>
                  <Input
                    id='fechaInicio'
                    type='date'
                    value={formData.fechaInicio}
                    onChange={e =>
                      handleInputChange('fechaInicio', e.target.value)
                    }
                    className='w-full'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='digitos'>Dígitos</Label>
                  <Input
                    id='digitos'
                    type='number'
                    value={formData.digitos}
                    onChange={e =>
                      handleInputChange(
                        'digitos',
                        parseInt(e.target.value) || 5
                      )
                    }
                    placeholder='5'
                    className='w-full'
                    min='1'
                    max='10'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='multiplicar'>Constante Multiplicar</Label>
                  <Input
                    id='multiplicar'
                    type='number'
                    value={formData.multiplicar}
                    onChange={e =>
                      handleInputChange(
                        'multiplicar',
                        parseFloat(e.target.value) || 1
                      )
                    }
                    placeholder='1'
                    className='w-full'
                    min='0.1'
                    step='0.1'
                  />
                </div>
              </div>
            </div>

            {/* Primera lectura */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-violet-800 dark:text-violet-200'>
                Primera Lectura
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='primeraLectura'>Primera Lectura</Label>
                  <Input
                    id='primeraLectura'
                    value={formData.primeraLectura}
                    onChange={e =>
                      handleInputChange('primeraLectura', e.target.value)
                    }
                    placeholder='0'
                    className='w-full'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='fechaPrimeraLectura'>
                    Fecha Primera Lectura
                  </Label>
                  <Input
                    id='fechaPrimeraLectura'
                    type='date'
                    value={formData.fechaPrimeraLectura}
                    onChange={e =>
                      handleInputChange('fechaPrimeraLectura', e.target.value)
                    }
                    className='w-full'
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal de Éxito - Medidor Creado */}
        <Dialog open={modalExito} onOpenChange={setModalExito}>
          <DialogContent className='w-[95vw] sm:max-w-[500px] lg:max-w-[600px] max-h-[85vh] overflow-y-auto'>
            <DialogHeader className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='p-3 bg-green-100 dark:bg-green-900/30 rounded-full'>
                  <CheckCircle2 className='h-6 w-6 text-green-600 dark:text-green-400' />
                </div>
                <div className='text-left'>
                  <DialogTitle className='text-xl font-bold text-green-900 dark:text-green-100'>
                    ¡Medidor Creado Exitosamente!
                  </DialogTitle>
                  <DialogDescription className='text-sm text-green-700 dark:text-green-300 mt-1'>
                    El medidor ha sido registrado correctamente en el sistema
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-6 pt-4'>
              {/* Alert de información del medidor */}
              <Alert className='border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'>
                <CheckCircle2 className='h-4 w-4 text-green-600 dark:text-green-400' />
                <AlertTitle className='text-green-900 dark:text-green-100'>
                  Información del Medidor
                </AlertTitle>
                <AlertDescription className='text-green-800 dark:text-green-200 space-y-2'>
                  <div className='space-y-3'>
                    {medidorCreado?.codigo && (
                      <div className='flex items-center justify-between bg-white dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-700'>
                        <div>
                          <p className='font-medium'>Código del Medidor:</p>
                          <p className='font-mono text-lg font-bold text-green-700 dark:text-green-300'>
                            {medidorCreado.codigo}
                          </p>
                        </div>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            copiarCodigoMedidor(medidorCreado.codigo!)
                          }
                          className='gap-2 border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/50'
                        >
                          <Copy className='h-4 w-4' />
                          Copiar
                        </Button>
                      </div>
                    )}

                    {medidorCreado?.id && (
                      <div className='flex items-center justify-between bg-white dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-700'>
                        <div>
                          <p className='font-medium'>ID del Medidor:</p>
                          <p className='font-mono text-lg font-bold text-green-700 dark:text-green-300'>
                            {medidorCreado.id}
                          </p>
                        </div>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => copiarCodigoMedidor(medidorCreado.id!)}
                          className='gap-2 border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900/50'
                        >
                          <Copy className='h-4 w-4' />
                          Copiar
                        </Button>
                      </div>
                    )}

                    <p>
                      <strong>Fecha de creación:</strong> {medidorCreado?.fecha}
                    </p>
                    <p className='mt-2 text-green-700 dark:text-green-300'>
                      💡 <strong>Importante:</strong> Guarde este ID para
                      futuras referencias. Puede utilizarlo para buscar y
                      gestionar este medidor.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Botones de acción */}
              <div className='flex flex-col sm:flex-row gap-3 pt-4 border-t'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setModalExito(false);
                    setMedidorCreado(null);
                  }}
                  className='flex-1 gap-2'
                >
                  <X className='h-4 w-4' />
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setModalExito(false);
                    setMedidorCreado(null);
                    navigate('/dashboard/administracion/medidores');
                  }}
                  className='flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white'
                >
                  <ArrowLeft className='h-4 w-4' />
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
