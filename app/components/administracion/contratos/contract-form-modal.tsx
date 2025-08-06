/* eslint-disable unused-imports/no-unused-vars */
import { Building2, List, MapPin, Search, User, Users } from 'lucide-react';
import { toast } from 'sonner';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '~/components/ui/badge';
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
import { ScrollArea } from '~/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import type {
  ContratanteProps,
  ContratoFormData,
  GetComunas,
  GetContratos,
  GetLocal,
  GetMadres,
  GetPropietario,
} from '~/types/administracion';
import type { Tarifas, TiposContrato } from '~/types/mantencion';

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContratoFormData) => void;
  contract?: GetContratos | null;
  mode: 'add' | 'edit';
  tipoContrato: TiposContrato[];
  tarifas: Tarifas[];
  contratante: ContratanteProps[];
  propietario: GetPropietario[];
  local: GetLocal[];
  madres: GetMadres[];
  comuna: GetComunas[];
}

export function ContractFormModal({
  isOpen,
  onClose,
  onSubmit,
  contract,
  mode,
  tipoContrato,
  tarifas,
  contratante,
  propietario,
  local,
  madres,
  comuna,
}: ContractFormModalProps) {
  // Estados para los modales de selección
  const [modalPropietario, setModalPropietario] = useState(false);
  const [modalLocal, setModalLocal] = useState(false);
  const [modalMadres, setModalMadres] = useState(false);
  const [modalComuna, setModalComuna] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para las búsquedas
  const [busquedaPropietario, setBusquedaPropietario] = useState('');
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const [busquedaMadres, setBusquedaMadres] = useState('');
  const [busquedaComuna, setBusquedaComuna] = useState('');

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

  // Función para formatear fechas de forma segura
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      // Si la fecha ya está en formato yyyy-MM-dd, usarla directamente
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }

      // Si es una fecha ISO, extraer solo la parte de la fecha
      if (dateString.includes('T')) {
        const datePart = dateString.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          return datePart;
        }
      }

      // Si es formato dd-MM-yyyy, convertir a yyyy-MM-dd
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        return `${year}-${month}-${day}`;
      }

      // Intentar crear una fecha válida y formatearla
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      console.warn('Formato de fecha no reconocido:', dateString);
      return '';
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return '';
    }
  };

  useEffect(() => {
    if (contract && mode === 'edit') {
      // Buscar los IDs correspondientes a los nombres de tipoContrato y tarifa
      const tipoContratoId =
        tipoContrato
          .find(t => t.nombre === contract.tipoContrato)
          ?.id.toString() || '';
      const tarifaId =
        tarifas.find(t => t.codigo === contract.tarifa)?.id.toString() || '';

      setFormData({
        tipoContrato: tipoContratoId,
        tarifa: tarifaId,
        nombrePropietario: contract.nombrePropietario,
        nombreCliente: contract.nombreCliente,
        local: contract.local,
        fechaInicio: formatDateForInput(contract.fechaInicio),
        activo: contract.activo,
        fechaTermino: formatDateForInput(contract.fechaTermino),
        comunaEnvio: contract.comunaEnvio,
        direccionEnvio: contract.direccionEnvio,
        limiteInvierno: contract.limiteInvierno,
        promedioAnual: contract.promedioAnual,
        cicloFacturacion: contract.cicloFacturacion || 'Ciclo Día 15',
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
        cicloFacturacion: 'Ciclo Día 15',
        potenciaContratada: '',
        liberadoCorte: false,
        madre: '',
      });
    }
  }, [contract, mode, isOpen, tipoContrato, tarifas]);

  // Funciones de filtrado
  const propietariosFiltrados = useMemo(() => {
    return propietario.filter(
      p =>
        p.nombre.toLowerCase().includes(busquedaPropietario.toLowerCase()) ||
        p.rut.toLowerCase().includes(busquedaPropietario.toLowerCase())
    );
  }, [propietario, busquedaPropietario]);

  const localesFiltrados = useMemo(() => {
    return local.filter(
      l =>
        l.numeroLocal.toLowerCase().includes(busquedaLocal.toLowerCase()) ||
        l.empresa.toLowerCase().includes(busquedaLocal.toLowerCase())
    );
  }, [local, busquedaLocal]);

  const madresFiltradas = useMemo(() => {
    return madres.filter(
      m =>
        m.nombrePropietario
          .toLowerCase()
          .includes(busquedaMadres.toLowerCase()) ||
        m.codigoContrato.toLowerCase().includes(busquedaMadres.toLowerCase())
    );
  }, [madres, busquedaMadres]);

  const comunasFiltradas = useMemo(() => {
    return comuna.filter(
      c =>
        c.nombre.toLowerCase().includes(busquedaComuna.toLowerCase()) ||
        c.codigo.toLowerCase().includes(busquedaComuna.toLowerCase())
    );
  }, [comuna, busquedaComuna]);

  // Funciones de selección
  const handleSelectPropietario = (propietarioRut: string) => {
    const prop = propietario.find(p => p.rut === propietarioRut);
    if (prop) {
      setFormData(prev => ({ ...prev, nombrePropietario: prop.nombre }));
    }
    setModalPropietario(false);
    setBusquedaPropietario('');
  };

  const handleSelectLocal = (localNumero: string) => {
    const loc = local.find(l => l.numeroLocal === localNumero);
    if (loc) {
      setFormData(prev => ({ ...prev, local: loc.numeroLocal }));
    }
    setModalLocal(false);
    setBusquedaLocal('');
  };

  const handleSelectMadre = (madreCodigo: string) => {
    const mad = madres.find(m => m.codigoContrato === madreCodigo);
    if (mad) {
      setFormData(prev => ({ ...prev, madre: mad.nombrePropietario }));
    }
    setModalMadres(false);
    setBusquedaMadres('');
  };

  const handleSelectComuna = (comunaCodigo: string) => {
    const com = comuna.find(c => c.codigo === comunaCodigo);
    if (com) {
      setFormData(prev => ({ ...prev, comunaEnvio: com.nombre }));
    }
    setModalComuna(false);
    setBusquedaComuna('');
  };

  // Función para formatear fecha a yyyy-MM-dd (formato requerido por el backend)
  const formatDateToBackend = (dateString: string): string => {
    if (!dateString) return '';
    // Mantener formato yyyy-MM-dd como espera el backend
    return dateString;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones de campos requeridos
    if (!formData.fechaInicio) {
      toast.error('La fecha de inicio es obligatoria');
      return;
    }

    if (!formData.tipoContrato) {
      toast.error('El tipo de contrato es obligatorio');
      return;
    }

    if (!formData.tarifa) {
      toast.error('La tarifa es obligatoria');
      return;
    }

    if (!formData.nombrePropietario) {
      toast.error('El nombre del propietario es obligatorio');
      return;
    }

    if (!formData.nombreCliente) {
      toast.error('El nombre del cliente es obligatorio');
      return;
    }

    if (!formData.local) {
      toast.error('El local es obligatorio');
      return;
    }

    setIsSubmitting(true);

    // Formatear fechas a yyyy-MM-dd (formato requerido por el backend)
    const fechaInicio = formatDateToBackend(formData.fechaInicio);
    const fechaTermino = formatDateToBackend(formData.fechaTermino);

    // Preparar los datos según el modo (crear o editar)
    const submitData = {
      // Campos base requeridos por la API
      tipoContrato: parseInt(formData.tipoContrato) || 0,
      tarifa: parseInt(formData.tarifa) || 0,
      propietario: formData.nombrePropietario,
      cliente: formData.nombreCliente,
      localId: formData.local,
      fechaInicio: fechaInicio,
      activo: formData.activo,
      direccion: formData.direccionEnvio,
      comuna: formData.comunaEnvio,
      limite: formData.limiteInvierno,
      ciclo: 1, // Valor fijo para "Ciclo Día 15"
      potencia: formData.potenciaContratada,
      madre: formData.madre,
      lugar: formData.local,
      sinCorte: formData.liberadoCorte ? 1 : 0,

      // Campos específicos para crear
      ...(mode === 'add' && {
        guardaCliente: formData.nombreCliente,
        esMadre: formData.madre ? 'S' : 'N',
      }),

      // Campos específicos para editar
      ...(mode === 'edit' && {
        codigo: contract?.codigoContrato || '',
        fechaTermino: fechaTermino,
      }),
    } as any; // Usar any temporalmente para evitar conflictos de tipos

    try {
      // Enviar los datos al componente padre para que maneje la llamada al servidor
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      toast.error('Error al procesar el formulario. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof ContratoFormData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className=' min-w-full max-h-[90vh] overflow-y-auto'>
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
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='nombrePropietario'
                    className='flex items-center justify-between'
                  >
                    Nombre Propietario
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={() => setModalPropietario(true)}
                      className='h-6 gap-1 text-xs'
                    >
                      <List className='h-3 w-3' />
                      <span className='hidden sm:inline'>Buscar</span>
                    </Button>
                  </Label>
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
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label
                    htmlFor='local'
                    className='flex items-center justify-between'
                  >
                    Local
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={() => setModalLocal(true)}
                      className='h-6 gap-1 text-xs'
                    >
                      <List className='h-3 w-3' />
                      <span className='hidden sm:inline'>Buscar</span>
                    </Button>
                  </Label>
                  <Input
                    id='local'
                    value={formData.local}
                    onChange={e => handleInputChange('local', e.target.value)}
                    placeholder='Nombre del local'
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label
                    htmlFor='comunaEnvio'
                    className='flex items-center justify-between'
                  >
                    Comuna de Envío
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      onClick={() => setModalComuna(true)}
                      className='h-6 gap-1 text-xs'
                    >
                      <List className='h-3 w-3' />
                      <span className='hidden sm:inline'>Buscar</span>
                    </Button>
                  </Label>
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
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='limiteInvierno'>Límite Invierno (kWh)</Label>
                  <Input
                    id='limiteInvierno'
                    type='number'
                    value={formData.limiteInvierno}
                    onChange={e =>
                      handleInputChange(
                        'limiteInvierno',
                        Number(e.target.value)
                      )
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
                  <Label htmlFor='potenciaContratada'>
                    Potencia Contratada
                  </Label>
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
              <div className='space-y-6'>
                {/* Ciclo de Facturación */}
                <div className='flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                      <svg
                        className='w-4 h-4 text-blue-600 dark:text-blue-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                        Ciclo de Facturación
                      </Label>
                      <p className='text-xs text-slate-500 dark:text-slate-400'>
                        Configuración estándar del sistema
                      </p>
                    </div>
                  </div>
                  <Badge variant='secondary' className='font-mono'>
                    Ciclo Día 15
                  </Badge>
                </div>

                {/* Configuraciones de Estado */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                  <div className='flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg'>
                        <svg
                          className='w-4 h-4 text-emerald-600 dark:text-emerald-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                      </div>
                      <div>
                        <Label
                          htmlFor='activo'
                          className='text-sm font-medium text-slate-700 dark:text-slate-300'
                        >
                          Estado del Contrato
                        </Label>
                      </div>
                    </div>
                    <Switch
                      id='activo'
                      checked={formData.activo}
                      onCheckedChange={(value: boolean) =>
                        handleInputChange('activo', value)
                      }
                      className='data-[state=checked]:bg-emerald-600'
                    />
                  </div>

                  <div className='flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg border'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg'>
                        <svg
                          className='w-4 h-4 text-orange-600 dark:text-orange-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                          />
                        </svg>
                      </div>
                      <div>
                        <Label
                          htmlFor='liberadoCorte'
                          className='text-sm font-medium text-slate-700 dark:text-slate-300'
                        >
                          Liberado de Corte
                        </Label>
                      </div>
                    </div>
                    <Switch
                      id='liberadoCorte'
                      checked={formData.liberadoCorte}
                      onCheckedChange={(value: boolean) =>
                        handleInputChange('liberadoCorte', value)
                      }
                      className='data-[state=checked]:bg-orange-600'
                    />
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <Label
                  htmlFor='madre'
                  className='flex items-center justify-between'
                >
                  Contrato Madre
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={() => setModalMadres(true)}
                    className='h-6 gap-1 text-xs'
                  >
                    <List className='h-3 w-3' />
                    <span className='hidden sm:inline'>Buscar</span>
                  </Button>
                </Label>
                <Input
                  id='madre'
                  value={formData.madre}
                  onChange={e => handleInputChange('madre', e.target.value)}
                  placeholder='Contrato madre (opcional)'
                />
              </div>
            </div>

            <DialogFooter className='flex-col sm:flex-row gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                disabled={isSubmitting}
                className='w-full sm:w-auto'
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                className='bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto'
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                    {mode === 'add' ? 'Creando...' : 'Actualizando...'}
                  </>
                ) : mode === 'add' ? (
                  'Crear'
                ) : (
                  'Actualizar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección de Propietarios */}
      <Dialog open={modalPropietario} onOpenChange={setModalPropietario}>
        <DialogContent className='min-w-full max-h-[80vh] overflow-hidden'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg'>
                <User className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
              </div>
              <div>
                <DialogTitle className='text-xl font-semibold'>
                  Seleccionar Propietario
                </DialogTitle>
                <DialogDescription>
                  Explore y seleccione el propietario que desea asociar
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por nombre o RUT...'
                value={busquedaPropietario}
                onChange={e => setBusquedaPropietario(e.target.value)}
                className='h-11 pl-10'
              />
            </div>

            <div className='border rounded-lg overflow-hidden'>
              <ScrollArea className='h-[50vh]'>
                <Table>
                  <TableHeader className='bg-muted/50'>
                    <TableRow>
                      <TableHead>RUT</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Comuna
                      </TableHead>
                      <TableHead className='hidden lg:table-cell'>
                        Teléfono
                      </TableHead>
                      <TableHead className='text-center'>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propietariosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className='text-center py-8 text-muted-foreground'
                        >
                          <div className='flex flex-col items-center gap-2'>
                            <Search className='h-8 w-8 opacity-50' />
                            <p>
                              No se encontraron propietarios con los criterios
                              de búsqueda.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {propietariosFiltrados.map(p => (
                      <TableRow
                        key={p.rut}
                        className='hover:bg-muted/50 transition-colors'
                      >
                        <TableCell>
                          <Badge variant='outline' className='font-mono'>
                            {p.rut}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-medium'>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-muted-foreground' />
                            {p.nombre}
                          </div>
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {p.comuna}
                        </TableCell>
                        <TableCell className='hidden lg:table-cell'>
                          {p.telefono}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Button
                            size='sm'
                            onClick={() => handleSelectPropietario(p.rut)}
                            className='bg-emerald-600 hover:bg-emerald-700 text-white'
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección de Locales */}
      <Dialog open={modalLocal} onOpenChange={setModalLocal}>
        <DialogContent className='min-w-full max-w-6xl sm:w-full max-h-[80vh] overflow-hidden'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
                <Building2 className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <DialogTitle className='text-xl font-semibold'>
                  Seleccionar Local
                </DialogTitle>
                <DialogDescription>
                  Explore y seleccione el local que desea asociar
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por número de local o empresa...'
                value={busquedaLocal}
                onChange={e => setBusquedaLocal(e.target.value)}
                className='h-11 pl-10'
              />
            </div>

            <div className='border rounded-lg overflow-hidden'>
              <ScrollArea className='h-[50vh]'>
                <Table>
                  <TableHeader className='bg-muted/50'>
                    <TableRow>
                      <TableHead>Número Local</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Propietario
                      </TableHead>
                      <TableHead className='hidden lg:table-cell'>
                        Sector
                      </TableHead>
                      <TableHead className='hidden sm:table-cell'>
                        Estado
                      </TableHead>
                      <TableHead className='text-center'>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localesFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className='text-center py-8 text-muted-foreground'
                        >
                          <div className='flex flex-col items-center gap-2'>
                            <Search className='h-8 w-8 opacity-50' />
                            <p>
                              No se encontraron locales con los criterios de
                              búsqueda.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {localesFiltrados.map(l => (
                      <TableRow
                        key={l.numeroLocal}
                        className='hover:bg-muted/50 transition-colors'
                      >
                        <TableCell>
                          <Badge variant='outline' className='font-mono'>
                            {l.numeroLocal}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Building2 className='h-4 w-4 text-muted-foreground' />
                            {l.empresa}
                          </div>
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {l.propietario}
                        </TableCell>
                        <TableCell className='hidden lg:table-cell'>
                          {l.sector}
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          <Badge
                            variant={
                              l.estadoHabilitado === 'Sí'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {l.estadoHabilitado}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Button
                            size='sm'
                            onClick={() => handleSelectLocal(l.numeroLocal)}
                            className='bg-blue-600 hover:bg-blue-700 text-white'
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección de Madres */}
      <Dialog open={modalMadres} onOpenChange={setModalMadres}>
        <DialogContent className='w-[95vw] max-w-6xl sm:w-full max-h-[80vh] overflow-hidden'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
                <Users className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              </div>
              <div>
                <DialogTitle className='text-xl font-semibold'>
                  Seleccionar Contrato Madre
                </DialogTitle>
                <DialogDescription>
                  Explore y seleccione el contrato madre que desea asociar
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por propietario o código de contrato...'
                value={busquedaMadres}
                onChange={e => setBusquedaMadres(e.target.value)}
                className='h-11 pl-10'
              />
            </div>

            <div className='border rounded-lg overflow-hidden'>
              <ScrollArea className='h-[50vh]'>
                <Table>
                  <TableHeader className='bg-muted/50'>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Propietario</TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Cliente
                      </TableHead>
                      <TableHead className='hidden lg:table-cell'>
                        Local
                      </TableHead>
                      <TableHead className='hidden sm:table-cell'>
                        Tipo
                      </TableHead>
                      <TableHead className='text-center'>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {madresFiltradas.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className='text-center py-8 text-muted-foreground'
                        >
                          <div className='flex flex-col items-center gap-2'>
                            <Search className='h-8 w-8 opacity-50' />
                            <p>
                              No se encontraron contratos madre con los
                              criterios de búsqueda.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {madresFiltradas.map(m => (
                      <TableRow
                        key={m.codigoContrato}
                        className='hover:bg-muted/50 transition-colors'
                      >
                        <TableCell>
                          <Badge variant='outline' className='font-mono'>
                            {m.codigoContrato}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-medium'>
                          <div className='flex items-center gap-2'>
                            <User className='h-4 w-4 text-muted-foreground' />
                            {m.nombrePropietario}
                          </div>
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {m.nombreCliente}
                        </TableCell>
                        <TableCell className='hidden lg:table-cell'>
                          {m.numeroLocal}
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          <Badge variant='secondary'>{m.tipoContrato}</Badge>
                        </TableCell>
                        <TableCell className='text-center'>
                          <Button
                            size='sm'
                            onClick={() => handleSelectMadre(m.codigoContrato)}
                            className='bg-purple-600 hover:bg-purple-700 text-white'
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección de Comunas */}
      <Dialog open={modalComuna} onOpenChange={setModalComuna}>
        <DialogContent className='w-[95vw] max-w-6xl sm:w-full max-h-[80vh] overflow-hidden'>
          <DialogHeader>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg'>
                <MapPin className='h-5 w-5 text-orange-600 dark:text-orange-400' />
              </div>
              <div>
                <DialogTitle className='text-xl font-semibold'>
                  Seleccionar Comuna
                </DialogTitle>
                <DialogDescription>
                  Explore y seleccione la comuna que desea asociar
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Buscar por nombre o código de comuna...'
                value={busquedaComuna}
                onChange={e => setBusquedaComuna(e.target.value)}
                className='h-11 pl-10'
              />
            </div>

            <div className='border rounded-lg overflow-hidden'>
              <ScrollArea className='h-[50vh]'>
                <Table>
                  <TableHeader className='bg-muted/50'>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className='hidden md:table-cell'>
                        Región
                      </TableHead>
                      <TableHead className='text-center'>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comunasFiltradas.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className='text-center py-8 text-muted-foreground'
                        >
                          <div className='flex flex-col items-center gap-2'>
                            <Search className='h-8 w-8 opacity-50' />
                            <p>
                              No se encontraron comunas con los criterios de
                              búsqueda.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {comunasFiltradas.map(c => (
                      <TableRow
                        key={c.codigo}
                        className='hover:bg-muted/50 transition-colors'
                      >
                        <TableCell>
                          <Badge variant='outline' className='font-mono'>
                            {c.codigo}
                          </Badge>
                        </TableCell>
                        <TableCell className='font-medium'>
                          <div className='flex items-center gap-2'>
                            <MapPin className='h-4 w-4 text-muted-foreground' />
                            {c.nombre}
                          </div>
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          {c.region}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Button
                            size='sm'
                            onClick={() => handleSelectComuna(c.codigo)}
                            className='bg-orange-600 hover:bg-orange-700 text-white'
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
