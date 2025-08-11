import { Building2, MapPin, Network, Search, User } from 'lucide-react';
import { toast } from 'sonner';

import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router';

import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { administracionService, mantencionService } from '~/services';
import type {
  ContratoFormData,
  GetComunas,
  GetLocal,
  GetMadres,
  GetPropietario,
} from '~/types/administracion';
import type { Tarifas, TiposContrato } from '~/types/mantencion';

export default function CrearContratoComponent({
  propietarios,
  locales,
  comunas,
  madres,
}: {
  readonly propietarios: GetPropietario[];
  readonly locales: GetLocal[];
  readonly comunas: GetComunas[];
  readonly madres: GetMadres[];
}) {
  const navigate = useNavigate();

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

  // Estados para datos adicionales
  const [tipoContrato, setTipoContrato] = useState<TiposContrato[]>([]);
  const [tarifas, setTarifas] = useState<Tarifas[]>([]);

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
    cicloFacturacion: 'Ciclo Día 15',
    potenciaContratada: '',
    liberadoCorte: false,
    madre: '',
  });

  // Cargar datos adicionales al montar el componente
  useEffect(() => {
    const loadAdditionalData = async () => {
      try {
        // Cargar tipos de contrato
        const tiposResult = await mantencionService.getTiposContratos();
        if (tiposResult.data) {
          setTipoContrato(tiposResult.data);
        }

        // Cargar tarifas
        const tarifasResult = await mantencionService.getTarifas();
        if (tarifasResult.data) {
          setTarifas(tarifasResult.data);
        }
      } catch (error) {
        console.error('Error cargando datos adicionales:', error);
        toast.error('Error al cargar datos del formulario');
      }
    };

    loadAdditionalData();
  }, []);

  // Funciones de filtrado
  const propietariosFiltrados = useMemo(() => {
    return propietarios.filter(
      p =>
        p.nombre.toLowerCase().includes(busquedaPropietario.toLowerCase()) ||
        p.rut.toLowerCase().includes(busquedaPropietario.toLowerCase())
    );
  }, [propietarios, busquedaPropietario]);

  const localesFiltrados = useMemo(() => {
    return locales.filter(
      l =>
        l.numeroLocal.toLowerCase().includes(busquedaLocal.toLowerCase()) ||
        l.empresa.toLowerCase().includes(busquedaLocal.toLowerCase())
    );
  }, [locales, busquedaLocal]);

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
    return comunas.filter(
      c =>
        c.nombre.toLowerCase().includes(busquedaComuna.toLowerCase()) ||
        c.codigo.toLowerCase().includes(busquedaComuna.toLowerCase())
    );
  }, [comunas, busquedaComuna]);

  // Funciones de selección
  const handleSelectPropietario = (propietarioRut: string) => {
    const prop = propietarios.find(p => p.rut === propietarioRut);
    if (prop) {
      setFormData(prev => ({ ...prev, nombrePropietario: prop.nombre }));
    }
    setModalPropietario(false);
    setBusquedaPropietario('');
  };

  const handleSelectLocal = (localNumero: string) => {
    const loc = locales.find(l => l.numeroLocal === localNumero);
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
    const com = comunas.find(c => c.codigo === comunaCodigo);
    if (com) {
      setFormData(prev => ({ ...prev, comunaEnvio: com.nombre }));
    }
    setModalComuna(false);
    setBusquedaComuna('');
  };

  const handleInputChange = (
    field: keyof ContratoFormData,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

    try {
      // Preparar los datos para la API
      const submitData: any = {
        tipoContrato: parseInt(formData.tipoContrato) || 0,
        tarifa: parseInt(formData.tarifa) || 0,
        propietario: formData.nombrePropietario,
        cliente: formData.nombreCliente,
        guardaCliente: formData.nombreCliente,
        localId: formData.local,
        fechaInicio: formData.fechaInicio,
        activo: formData.activo,
        direccion: formData.direccionEnvio,
        comuna: formData.comunaEnvio,
        limite: formData.limiteInvierno,
        ciclo: 1, // Valor fijo para "Ciclo Día 15"
        potencia: formData.potenciaContratada,
        madre: formData.madre || '',
        lugar: formData.local,
        sinCorte: formData.liberadoCorte ? 1 : 0,
        esMadre: formData.madre ? 'S' : 'N',
      };

      const result = await administracionService.crearContrato(submitData);

      if (result.error) {
        toast.error(result.error || 'Error al crear el contrato');
        return;
      }

      toast.success('Contrato creado exitosamente');
      navigate('/dashboard/administracion/contratos');
    } catch (error) {
      console.error('Error al crear contrato:', error);
      toast.error('Error inesperado al crear el contrato');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        <ModernHeader
          title='Crear Nuevo Contrato'
          description='Creación de nuevo Contrato para sistema'
          actions={
            <Button
              variant='outline'
              onClick={() => navigate('/dashboard/administracion/contratos')}
            >
              Volver a Contratos
            </Button>
          }
        />

        <div className='bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700/60'>
          <form onSubmit={handleSubmit} className='p-6 space-y-6'>
            {/* Información básica del contrato */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-sky-800 dark:text-sky-200'>
                Información del Contrato
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='tipoContrato'>Tipo de Contrato *</Label>
                  <Select
                    value={formData.tipoContrato}
                    onValueChange={value =>
                      handleInputChange('tipoContrato', value)
                    }
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Seleccionar tipo' />
                    </SelectTrigger>
                    <SelectContent>
                      {tipoContrato.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='tarifa'>Tarifa *</Label>
                  <Select
                    value={formData.tarifa}
                    onValueChange={value => handleInputChange('tarifa', value)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Seleccionar tarifa' />
                    </SelectTrigger>
                    <SelectContent>
                      {tarifas.map(tarifa => (
                        <SelectItem
                          key={tarifa.id}
                          value={tarifa.id.toString()}
                        >
                          {tarifa.codigo} - {tarifa.nombre}
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
                  <Label htmlFor='nombrePropietario'>Propietario *</Label>
                  <div className='flex gap-2'>
                    <Input
                      id='nombrePropietario'
                      value={formData.nombrePropietario}
                      onChange={e =>
                        handleInputChange('nombrePropietario', e.target.value)
                      }
                      placeholder='Nombre del propietario'
                      className='w-full'
                      required
                      readOnly
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setModalPropietario(true)}
                      className='shrink-0'
                    >
                      <User className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='nombreCliente'>Cliente *</Label>
                  <Input
                    id='nombreCliente'
                    value={formData.nombreCliente}
                    onChange={e =>
                      handleInputChange('nombreCliente', e.target.value)
                    }
                    placeholder='Nombre del cliente'
                    className='w-full'
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
                  <Label htmlFor='local'>Local *</Label>
                  <div className='flex gap-2'>
                    <Input
                      id='local'
                      value={formData.local}
                      onChange={e => handleInputChange('local', e.target.value)}
                      placeholder='Número del local'
                      className='w-full'
                      required
                      readOnly
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setModalLocal(true)}
                      className='shrink-0'
                    >
                      <Building2 className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='comunaEnvio'>Comuna de Envío *</Label>
                  <div className='flex gap-2'>
                    <Input
                      id='comunaEnvio'
                      value={formData.comunaEnvio}
                      onChange={e =>
                        handleInputChange('comunaEnvio', e.target.value)
                      }
                      placeholder='Comuna de envío'
                      className='w-full'
                      required
                      readOnly
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setModalComuna(true)}
                      className='shrink-0'
                    >
                      <MapPin className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='direccionEnvio'>Dirección de Envío *</Label>
                <Textarea
                  id='direccionEnvio'
                  value={formData.direccionEnvio}
                  onChange={e =>
                    handleInputChange('direccionEnvio', e.target.value)
                  }
                  placeholder='Dirección completa de envío'
                  className='w-full resize-none'
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
                  <Label htmlFor='fechaInicio'>Fecha de Inicio *</Label>
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
                  <Label htmlFor='fechaTermino'>Fecha de Término</Label>
                  <Input
                    id='fechaTermino'
                    type='date'
                    value={formData.fechaTermino}
                    onChange={e =>
                      handleInputChange('fechaTermino', e.target.value)
                    }
                    className='w-full'
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='limiteInvierno'>Límite Invierno</Label>
                  <Input
                    id='limiteInvierno'
                    type='number'
                    value={formData.limiteInvierno}
                    onChange={e =>
                      handleInputChange(
                        'limiteInvierno',
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder='0'
                    className='w-full'
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
                    className='w-full'
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
                    placeholder='Potencia contratada'
                    className='w-full'
                  />
                </div>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2'>
                <div className='flex items-center space-x-3'>
                  <Switch
                    id='activo'
                    checked={formData.activo}
                    onCheckedChange={checked =>
                      handleInputChange('activo', checked)
                    }
                  />
                  <Label htmlFor='activo' className='text-sm font-medium'>
                    Contrato Activo
                  </Label>
                </div>

                <div className='flex items-center space-x-3'>
                  <Switch
                    id='liberadoCorte'
                    checked={formData.liberadoCorte}
                    onCheckedChange={checked =>
                      handleInputChange('liberadoCorte', checked)
                    }
                  />
                  <Label htmlFor='liberadoCorte' className='text-sm font-medium'>
                    Liberado de Corte
                  </Label>
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='madre'>Contrato Madre (opcional)</Label>
                <div className='flex gap-2'>
                  <Input
                    id='madre'
                    value={formData.madre}
                    onChange={e => handleInputChange('madre', e.target.value)}
                    placeholder='Contrato madre (opcional)'
                    className='w-full'
                    readOnly
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setModalMadres(true)}
                    className='shrink-0'
                  >
                    <Network className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>

            <div className='flex justify-end gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60'>
              <Button
                type='button'
                variant='outline'
                onClick={() => navigate('/dashboard/administracion/contratos')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                className='bg-sky-600 hover:bg-sky-700 text-white'
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando...' : 'Crear Contrato'}
              </Button>
            </div>
          </form>
        </div>

        {/* Modal de Selección de Propietarios */}
        <Dialog open={modalPropietario} onOpenChange={setModalPropietario}>
          <DialogContent className='w-[95vw] sm:w-[90vw] lg:w-[80vw] xl:w-[70vw] max-w-6xl max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg'>
                  <User className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                </div>
                <div>
                  <DialogTitle>Seleccionar Propietario</DialogTitle>
                  <DialogDescription>
                    Selecciona un propietario de la lista
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-4 overflow-auto'>
              {/* Barra de búsqueda */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por nombre o RUT...'
                  value={busquedaPropietario}
                  onChange={e => setBusquedaPropietario(e.target.value)}
                  className='h-11 pl-10'
                />
              </div>

              <div className='border rounded-lg bg-white dark:bg-slate-900 h-[50vh] overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>RUT</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {propietariosFiltrados.map(prop => (
                      <TableRow key={prop.rut}>
                        <TableCell className='font-medium'>
                          {prop.rut}
                        </TableCell>
                        <TableCell>{prop.nombre}</TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            onClick={() => handleSelectPropietario(prop.rut)}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Locales */}
        <Dialog open={modalLocal} onOpenChange={setModalLocal}>
          <DialogContent className='w-[95vw] sm:w-[90vw] lg:w-[80vw] xl:w-[70vw] max-w-6xl max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg'>
                  <Building2 className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                </div>
                <div>
                  <DialogTitle>Seleccionar Local</DialogTitle>
                  <DialogDescription>
                    Selecciona un local de la lista
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-4 overflow-auto'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por número de local o empresa...'
                  value={busquedaLocal}
                  onChange={e => setBusquedaLocal(e.target.value)}
                  className='h-11 pl-10'
                />
              </div>

              <div className='border rounded-lg bg-white dark:bg-slate-900 h-[50vh] overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localesFiltrados.map(loc => (
                      <TableRow key={loc.numeroLocal}>
                        <TableCell className='font-medium'>
                          {loc.numeroLocal}
                        </TableCell>
                        <TableCell>{loc.empresa}</TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            onClick={() => handleSelectLocal(loc.numeroLocal)}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Madres */}
        <Dialog open={modalMadres} onOpenChange={setModalMadres}>
          <DialogContent className='w-[95vw] sm:w-[90vw] lg:w-[80vw] xl:w-[70vw] max-w-6xl max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg'>
                  <Network className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                </div>
                <div>
                  <DialogTitle>Seleccionar Contrato Madre</DialogTitle>
                  <DialogDescription>
                    Selecciona un contrato madre de la lista
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-4 overflow-auto'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por propietario o código de contrato...'
                  value={busquedaMadres}
                  onChange={e => setBusquedaMadres(e.target.value)}
                  className='h-11 pl-10'
                />
              </div>

              <div className='border rounded-lg bg-white dark:bg-slate-900 h-[50vh] overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Propietario</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {madresFiltradas.map(mad => (
                      <TableRow key={mad.codigoContrato}>
                        <TableCell className='font-medium'>
                          {mad.codigoContrato}
                        </TableCell>
                        <TableCell>{mad.nombrePropietario}</TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            onClick={() =>
                              handleSelectMadre(mad.codigoContrato)
                            }
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Comunas */}
        <Dialog open={modalComuna} onOpenChange={setModalComuna}>
          <DialogContent className='w-[95vw] sm:w-[90vw] lg:w-[80vw] xl:w-[70vw] max-w-6xl max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg'>
                  <MapPin className='h-5 w-5 text-sky-600 dark:text-sky-400' />
                </div>
                <div>
                  <DialogTitle>Seleccionar Comuna</DialogTitle>
                  <DialogDescription>
                    Selecciona una comuna de la lista
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-4 overflow-auto'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por nombre o código de comuna...'
                  value={busquedaComuna}
                  onChange={e => setBusquedaComuna(e.target.value)}
                  className='h-11 pl-10'
                />
              </div>

              <div className='border rounded-lg bg-white dark:bg-slate-900 h-[50vh] overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comunasFiltradas.map(com => (
                      <TableRow key={com.codigo}>
                        <TableCell className='font-medium'>
                          {com.codigo}
                        </TableCell>
                        <TableCell>{com.nombre}</TableCell>
                        <TableCell>
                          <Button
                            size='sm'
                            onClick={() => handleSelectComuna(com.codigo)}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
