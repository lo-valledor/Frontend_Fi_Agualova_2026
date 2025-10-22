import {
  ArrowLeft,
  Building2,
  MapPin,
  Network,
  Save,
  Search,
  User
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useEffect, useMemo, useState, useRef } from 'react';

import { useNavigate } from 'react-router';

import { useVirtualizer } from '@tanstack/react-virtual';

import { ModernHeader } from '~/components/shared/modern-header';
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
import { Switch } from '~/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import { Textarea } from '~/components/ui/textarea';
import { administracionService, mantencionService } from '~/services';
import type {
  ContratoFormData,
  GetClienteContrato,
  GetComunas,
  GetContratoPorId,
  GetLocal,
  GetMadres,
  GetPropietario
} from '~/types/administracion';
import type { Tarifas, TiposContrato } from '~/types/mantencion';

export default function EditarContratoComponent({
  contrato,
  propietarios,
  locales,
  comunas,
  madres,
  clientes: _clientes
}: {
  readonly contrato: GetContratoPorId;
  readonly propietarios: GetPropietario[];
  readonly locales: GetLocal[];
  readonly comunas: GetComunas[];
  readonly madres: GetMadres[];
  readonly clientes: GetClienteContrato[];
}) {
  const navigate = useNavigate();

  // Estados para los modales de selección
  const [modalPropietario, setModalPropietario] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalLocal, setModalLocal] = useState(false);
  const [modalMadres, setModalMadres] = useState(false);
  const [modalComuna, setModalComuna] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para las búsquedas
  const [busquedaPropietario, setBusquedaPropietario] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const [busquedaMadres, setBusquedaMadres] = useState('');
  const [busquedaComuna, setBusquedaComuna] = useState('');

  // Refs para virtualización de modales
  const propietariosTableRef = useRef<HTMLDivElement>(null);
  const clientesTableRef = useRef<HTMLDivElement>(null);
  const localesTableRef = useRef<HTMLDivElement>(null);
  const madresTableRef = useRef<HTMLDivElement>(null);
  const comunasTableRef = useRef<HTMLDivElement>(null);

  // Estados para datos adicionales
  const [tipoContrato, setTipoContrato] = useState<TiposContrato[]>([]);
  const [tarifas, setTarifas] = useState<Tarifas[]>([]);

  // Función para mapear GetContratoPorId a ContratoFormData
  const mapContratoToFormData = (
    contratoData: GetContratoPorId
  ): ContratoFormData => {
    return {
      tipoContrato: contratoData.tipoContrato || '',
      tarifa: contratoData.tarifa || '',
      nombrePropietario: contratoData.nombrePropietario || '',
      nombreCliente: contratoData.nombreCliente || '',
      local: contratoData.localId || '',
      fechaInicio: contratoData.fechaInicio || '',
      activo: contratoData.activoTexto === 'Si',
      fechaTermino: contratoData.fechaTermino || '',
      comunaEnvio: contratoData.codigoComuna || '',
      direccionEnvio: contratoData.direccion || '',
      limiteInvierno: contratoData.limiteInvierno || 0,
      promedioAnual: '',
      cicloFacturacion: contratoData.cicloFacturacion || 'Ciclo Día 15',
      potenciaContratada: contratoData.potenciaContratada || '',
      liberadoCorte: contratoData.esMadreTexto === 'Si',
      madre: contratoData.codigoContratoMadre || ''
    };
  };

  const [formData, setFormData] = useState<ContratoFormData>(() =>
    mapContratoToFormData(contrato)
  );

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

  const clientesFiltrados = useMemo(() => {
    if (!_clientes || _clientes.length === 0) return [];

    return _clientes.filter(
      (c: any) =>
        c.nombreCompleto
          ?.toLowerCase()
          .includes(busquedaCliente.toLowerCase()) ||
        c.rut?.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
        c.nombre?.toLowerCase().includes(busquedaCliente.toLowerCase())
    );
  }, [_clientes, busquedaCliente]);

  const localesFiltrados = useMemo(() => {
    return locales.filter(
      l =>
        l.numeroLocal?.toLowerCase().includes(busquedaLocal.toLowerCase()) ||
        l.empresa?.toLowerCase().includes(busquedaLocal.toLowerCase())
    );
  }, [locales, busquedaLocal]);

  const madresFiltradas = useMemo(() => {
    return madres.filter(
      m =>
        m.nombrePropietario
          ?.toLowerCase()
          .includes(busquedaMadres.toLowerCase()) ||
        m.codigoContrato?.toLowerCase().includes(busquedaMadres.toLowerCase())
    );
  }, [madres, busquedaMadres]);

  const comunasFiltradas = useMemo(() => {
    return comunas.filter(
      c =>
        c.nombre?.toLowerCase().includes(busquedaComuna.toLowerCase()) ||
        c.codigo?.toLowerCase().includes(busquedaComuna.toLowerCase())
    );
  }, [comunas, busquedaComuna]);

  // Virtualizadores para cada modal
  const propietariosVirtualizer = useVirtualizer({
    count: propietariosFiltrados.length,
    getScrollElement: () => propietariosTableRef.current,
    estimateSize: () => 50,
    overscan: 10
  });

  const clientesVirtualizer = useVirtualizer({
    count: clientesFiltrados.length,
    getScrollElement: () => clientesTableRef.current,
    estimateSize: () => 60,
    overscan: 10
  });

  const localesVirtualizer = useVirtualizer({
    count: localesFiltrados.length,
    getScrollElement: () => localesTableRef.current,
    estimateSize: () => 50,
    overscan: 10
  });

  const madresVirtualizer = useVirtualizer({
    count: madresFiltradas.length,
    getScrollElement: () => madresTableRef.current,
    estimateSize: () => 50,
    overscan: 10
  });

  const comunasVirtualizer = useVirtualizer({
    count: comunasFiltradas.length,
    getScrollElement: () => comunasTableRef.current,
    estimateSize: () => 50,
    overscan: 10
  });

  // Forzar medición del virtualizador cuando se abren los modales
  useEffect(() => {
    if (modalPropietario) {
      // Doble requestAnimationFrame para asegurar que el modal esté completamente renderizado
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          propietariosVirtualizer.measure();
        });
      });
    }
  }, [modalPropietario, propietariosVirtualizer]);

  useEffect(() => {
    if (modalCliente) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          clientesVirtualizer.measure();
        });
      });
    }
  }, [modalCliente, clientesVirtualizer]);

  useEffect(() => {
    if (modalLocal) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          localesVirtualizer.measure();
        });
      });
    }
  }, [modalLocal, localesVirtualizer]);

  useEffect(() => {
    if (modalMadres) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          madresVirtualizer.measure();
        });
      });
    }
  }, [modalMadres, madresVirtualizer]);

  useEffect(() => {
    if (modalComuna) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          comunasVirtualizer.measure();
        });
      });
    }
  }, [modalComuna, comunasVirtualizer]);

  // Funciones de selección
  const handleSelectPropietario = (propietarioRut: string) => {
    const prop = propietarios.find(p => p.rut === propietarioRut);
    if (prop) {
      setFormData(prev => ({ ...prev, nombrePropietario: prop.nombre }));
    }
    setModalPropietario(false);
    setBusquedaPropietario('');
  };

  const handleSelectCliente = (clienteRut: string) => {
    const cliente = _clientes.find(c => c.rut === clienteRut);
    if (cliente) {
      const nombreCompleto = cliente.esEmpresa
        ? cliente.nombre
        : `${cliente.nombre.trim()}`;
      setFormData(prev => ({ ...prev, nombreCliente: nombreCompleto }));
    }
    setModalCliente(false);
    setBusquedaCliente('');
  };

  const handleSelectLocal = (localNumero: string) => {
    const loc = locales.find(l => l.numeroLocal === localNumero);
    if (loc) {
      setFormData(prev => ({ ...prev, local: loc.numeroLocal }));
    }
    setModalLocal(false);
    setBusquedaLocal('');
  };

  // Helper para obtener el RUT del propietario basándose en el nombre
  const getPropietarioRut = () => {
    const propietario = propietarios.find(
      p => p.nombre.trim() === formData.nombrePropietario.trim()
    );
    return propietario ? propietario.rut : formData.nombrePropietario;
  };

  // Helper para obtener el RUT del cliente basándose en el nombre
  const getClienteRut = () => {
    // Si hay clientes disponibles, buscar por nombre
    if (_clientes && _clientes.length > 0) {
      const cliente = _clientes.find(
        (c: any) => c.nombre.trim() === formData.nombreCliente.trim()
      );
      if (cliente) return cliente.rut;
    }

    // Si no se encuentra en clientes, buscar en propietarios
    const propietario = propietarios.find(
      p => p.nombre.trim() === formData.nombreCliente.trim()
    );
    return propietario ? propietario.rut : formData.nombreCliente;
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
      setFormData(prev => ({ ...prev, comunaEnvio: com.codigo }));
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

  // Helper para mostrar el nombre de la comuna en el input
  const getComunaDisplayName = () => {
    const comuna = comunas.find(c => c.codigo === formData.comunaEnvio);
    return comuna ? comuna.nombre : formData.comunaEnvio;
  };

  const handleSubmit = async () => {
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

    setIsSubmitting(true);

    try {
      // Obtener el ID del contrato desde la URL
      const urlPath = window.location.pathname;
      const urlParts = urlPath.split('/');
      const contratoIdFromUrl = urlParts[urlParts.length - 1]; // Último segmento de la URL

      // Preparar los datos para la API usando ModificarContratoProps
      const submitData: any = {
        codigo: contratoIdFromUrl, // Usar el ID del parámetro URL como código de contrato
        tipoContrato: parseInt(formData.tipoContrato) || 0,
        tarifa: parseInt(formData.tarifa) || 0,
        propietario: getPropietarioRut(),
        cliente: getClienteRut(),
        localId: formData.local || '',
        fechaInicio: formData.fechaInicio,
        activo: formData.activo,
        fechaTermino: formData.fechaTermino,
        direccion: formData.direccionEnvio,
        comuna: formData.comunaEnvio,
        limite: formData.limiteInvierno,
        ciclo: 1, // Valor fijo para "Ciclo Día 15"
        potencia: formData.potenciaContratada,
        madre: formData.madre || '',
        lugar: formData.local || '',
        sinCorte: formData.liberadoCorte ? 1 : 0
      };

      const result = await administracionService.modificarContrato(submitData);

      if (result.error) {
        toast.error(result.error || 'Error al actualizar el contrato');
        return;
      }

      toast.success('Contrato actualizado exitosamente');
      navigate('/dashboard/administracion/contratos');
    } catch (error) {
      console.error('Error al actualizar contrato:', error);
      toast.error('Error inesperado al actualizar el contrato');
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
            title='Editar Contrato'
            description='Modificación de contrato existente en el sistema'
            actions={
              <>
                <Button
                  variant='ghost'
                  onClick={() =>
                    navigate('/dashboard/administracion/contratos')
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
                    navigate('/dashboard/administracion/contratos')
                  }
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className='gap-2 bg-primary hover:bg-primary/90'
                  disabled={isSubmitting}
                >
                  <Save className='h-4 w-4' />
                  {isSubmitting ? 'Actualizando...' : 'Actualizar Contrato'}
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className='container mx-auto px-4 py-6 space-y-6'>
        <div className='bg-background rounded-xl shadow-sm border border-border'>
          <form className='p-6 space-y-6'>
            {/* Información básica del contrato */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-primary'>
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
              <h3 className='text-sm font-medium text-success'>
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
                  <div className='flex gap-2'>
                    <Input
                      id='nombreCliente'
                      value={formData.nombreCliente}
                      onChange={e =>
                        handleInputChange('nombreCliente', e.target.value)
                      }
                      placeholder='Nombre del cliente'
                      className='w-full'
                      required
                      readOnly
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setModalCliente(true)}
                      className='shrink-0'
                    >
                      <User className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de ubicación */}
            <div className='space-y-4'>
              <h3 className='text-sm font-medium text-secondary'>
                Información de Ubicación
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='local'>Local</Label>
                  <div className='flex gap-2'>
                    <Input
                      id='local'
                      value={formData.local}
                      onChange={e => handleInputChange('local', e.target.value)}
                      placeholder='Número del local'
                      className='w-full'
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
                      value={getComunaDisplayName()}
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
              <h3 className='text-sm font-medium text-warning'>
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
                  <Label
                    htmlFor='liberadoCorte'
                    className='text-sm font-medium'
                  >
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
          </form>
        </div>

        {/* Modal de Selección de Propietarios */}
        <Dialog open={modalPropietario} onOpenChange={setModalPropietario}>
          <DialogContent className='min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-[768px] xl:min-w-[896px] 2xl:min-w-[1024px] max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-success/10 rounded-xl'>
                  <User className='h-5 w-5 text-success' />
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

              <div
                ref={propietariosTableRef}
                className='border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto'
              >
                <div className='min-w-[500px]'>
                  <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHeader className='sticky top-0 bg-background z-10 border-b'>
                      <TableRow>
                        <TableHead
                          style={{ width: '140px', minWidth: '140px' }}
                        >
                          RUT
                        </TableHead>
                        <TableHead style={{ width: 'auto', minWidth: '200px' }}>
                          Nombre
                        </TableHead>
                        <TableHead
                          className='text-center'
                          style={{ width: '120px', minWidth: '120px' }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${propietariosVirtualizer.getTotalSize()}px`,
                        position: 'relative'
                      }}
                    >
                      {propietariosFiltrados.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className='text-center py-12 text-muted-foreground'
                          >
                            <div className='flex flex-col items-center gap-3'>
                              <div className='p-3 bg-background rounded-full'>
                                <User className='h-8 w-8 opacity-50' />
                              </div>
                              <div className='space-y-1'>
                                <p className='font-medium'>
                                  No se encontraron propietarios
                                </p>
                                <p className='text-sm'>
                                  {busquedaPropietario
                                    ? `No hay resultados para "${busquedaPropietario}"`
                                    : 'Escriba en el campo de búsqueda para filtrar'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {propietariosVirtualizer
                        .getVirtualItems()
                        .map(virtualRow => {
                          const prop = propietariosFiltrados[virtualRow.index];
                          return (
                            <TableRow
                              key={prop.rut}
                              data-index={virtualRow.index}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '50px',
                                transform: `translateY(${virtualRow.start}px)`,
                                display: 'table',
                                tableLayout: 'fixed'
                              }}
                              className='hover:bg-muted/50'
                            >
                              <TableCell
                                className='font-medium font-mono text-sm h-[50px]'
                                style={{ width: '140px', minWidth: '140px' }}
                              >
                                {prop.rut}
                              </TableCell>
                              <TableCell
                                className='font-medium h-[50px]'
                                style={{ width: 'auto', minWidth: '200px' }}
                              >
                                {prop.nombre}
                              </TableCell>
                              <TableCell
                                className='text-center h-[50px]'
                                style={{ width: '120px', minWidth: '120px' }}
                              >
                                <Button
                                  size='sm'
                                  variant='default'
                                  onClick={() =>
                                    handleSelectPropietario(prop.rut)
                                  }
                                >
                                  Seleccionar
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Locales */}
        <Dialog open={modalLocal} onOpenChange={setModalLocal}>
          <DialogContent className='min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-[768px] xl:min-w-[896px] 2xl:min-w-[1024px] max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-secondary/10 rounded-xl'>
                  <Building2 className='h-5 w-5 text-secondary' />
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

              <div
                ref={localesTableRef}
                className='border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto'
              >
                <div className='min-w-[500px]'>
                  <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHeader className='sticky top-0 bg-background z-10 border-b'>
                      <TableRow>
                        <TableHead
                          style={{ width: '120px', minWidth: '120px' }}
                        >
                          Número
                        </TableHead>
                        <TableHead style={{ width: 'auto', minWidth: '200px' }}>
                          Empresa
                        </TableHead>
                        <TableHead
                          className='text-center'
                          style={{ width: '120px', minWidth: '120px' }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${localesVirtualizer.getTotalSize()}px`,
                        position: 'relative'
                      }}
                    >
                      {localesFiltrados.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className='text-center py-12 text-muted-foreground'
                          >
                            <div className='flex flex-col items-center gap-3'>
                              <div className='p-3 bg-background rounded-full'>
                                <Building2 className='h-8 w-8 opacity-50' />
                              </div>
                              <div className='space-y-1'>
                                <p className='font-medium'>
                                  No se encontraron locales
                                </p>
                                <p className='text-sm'>
                                  {busquedaLocal
                                    ? `No hay resultados para "${busquedaLocal}"`
                                    : 'Escriba en el campo de búsqueda para filtrar'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {localesVirtualizer.getVirtualItems().map(virtualRow => {
                        const loc = localesFiltrados[virtualRow.index];
                        return (
                          <TableRow
                            key={loc.numeroLocal}
                            data-index={virtualRow.index}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '50px',
                              transform: `translateY(${virtualRow.start}px)`,
                              display: 'table',
                              tableLayout: 'fixed'
                            }}
                            className='hover:bg-muted/50'
                          >
                            <TableCell
                              className='font-medium font-mono text-sm h-[50px]'
                              style={{ width: '120px', minWidth: '120px' }}
                            >
                              {loc.numeroLocal}
                            </TableCell>
                            <TableCell
                              className='font-medium h-[50px]'
                              style={{ width: 'auto', minWidth: '200px' }}
                            >
                              {loc.empresa}
                            </TableCell>
                            <TableCell
                              className='text-center h-[50px]'
                              style={{ width: '120px', minWidth: '120px' }}
                            >
                              <Button
                                size='sm'
                                variant='default'
                                onClick={() =>
                                  handleSelectLocal(loc.numeroLocal)
                                }
                              >
                                Seleccionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Madres */}
        <Dialog open={modalMadres} onOpenChange={setModalMadres}>
          <DialogContent className='min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-[768px] xl:min-w-[896px] 2xl:min-w-[1024px] max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-warning/10 rounded-xl'>
                  <Network className='h-5 w-5 text-warning' />
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

              <div
                ref={madresTableRef}
                className='border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto'
              >
                <div className='min-w-[500px]'>
                  <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHeader className='sticky top-0 bg-background z-10 border-b'>
                      <TableRow>
                        <TableHead
                          style={{ width: '140px', minWidth: '140px' }}
                        >
                          Código
                        </TableHead>
                        <TableHead style={{ width: 'auto', minWidth: '200px' }}>
                          Propietario
                        </TableHead>
                        <TableHead
                          className='text-center'
                          style={{ width: '120px', minWidth: '120px' }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${madresVirtualizer.getTotalSize()}px`,
                        position: 'relative'
                      }}
                    >
                      {madresFiltradas.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className='text-center py-12 text-muted-foreground'
                          >
                            <div className='flex flex-col items-center gap-3'>
                              <div className='p-3 bg-background rounded-full'>
                                <Network className='h-8 w-8 opacity-50' />
                              </div>
                              <div className='space-y-1'>
                                <p className='font-medium'>
                                  No se encontraron contratos madre
                                </p>
                                <p className='text-sm'>
                                  {busquedaMadres
                                    ? `No hay resultados para "${busquedaMadres}"`
                                    : 'Escriba en el campo de búsqueda para filtrar'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {madresVirtualizer.getVirtualItems().map(virtualRow => {
                        const mad = madresFiltradas[virtualRow.index];
                        return (
                          <TableRow
                            key={mad.codigoContrato}
                            data-index={virtualRow.index}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '50px',
                              transform: `translateY(${virtualRow.start}px)`,
                              display: 'table',
                              tableLayout: 'fixed'
                            }}
                            className='hover:bg-muted/50'
                          >
                            <TableCell
                              className='font-medium font-mono text-sm h-[50px]'
                              style={{ width: '140px', minWidth: '140px' }}
                            >
                              {mad.codigoContrato}
                            </TableCell>
                            <TableCell
                              className='font-medium h-[50px]'
                              style={{ width: 'auto', minWidth: '200px' }}
                            >
                              {mad.nombrePropietario}
                            </TableCell>
                            <TableCell
                              className='text-center h-[50px]'
                              style={{ width: '120px', minWidth: '120px' }}
                            >
                              <Button
                                size='sm'
                                variant='default'
                                onClick={() =>
                                  handleSelectMadre(mad.codigoContrato)
                                }
                              >
                                Seleccionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Clientes */}
        <Dialog open={modalCliente} onOpenChange={setModalCliente}>
          <DialogContent className='min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-[768px] xl:min-w-[896px] 2xl:min-w-[1024px] max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-primary/10 rounded-xl'>
                  <User className='h-5 w-5 ' />
                </div>
                <div>
                  <DialogTitle>Seleccionar Cliente</DialogTitle>
                  <DialogDescription>
                    Selecciona un cliente de la lista
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className='space-y-4 overflow-auto'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Buscar por nombre, apellido o RUT...'
                  value={busquedaCliente}
                  onChange={e => setBusquedaCliente(e.target.value)}
                  className='h-11 pl-10'
                />
              </div>

              <div
                ref={clientesTableRef}
                className='border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto'
              >
                <div className='min-w-[600px]'>
                  <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHeader className='sticky top-0 bg-background z-10 border-b'>
                      <TableRow>
                        <TableHead
                          style={{ width: '140px', minWidth: '140px' }}
                        >
                          RUT
                        </TableHead>
                        <TableHead style={{ width: 'auto', minWidth: '200px' }}>
                          Nombre
                        </TableHead>
                        <TableHead
                          style={{ width: '100px', minWidth: '100px' }}
                        >
                          Tipo
                        </TableHead>
                        <TableHead
                          className='text-center'
                          style={{ width: '120px', minWidth: '120px' }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${clientesVirtualizer.getTotalSize()}px`,
                        position: 'relative'
                      }}
                    >
                      {clientesFiltrados.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className='text-center py-12 text-muted-foreground'
                          >
                            <div className='flex flex-col items-center gap-3'>
                              <div className='p-3 bg-background rounded-full'>
                                <User className='h-8 w-8 opacity-50' />
                              </div>
                              <div className='space-y-1'>
                                <p className='font-medium'>
                                  No se encontraron clientes
                                </p>
                                <p className='text-sm'>
                                  {busquedaCliente
                                    ? `No hay resultados para "${busquedaCliente}"`
                                    : 'Escriba en el campo de búsqueda para filtrar'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {clientesVirtualizer.getVirtualItems().map(virtualRow => {
                        const cliente = clientesFiltrados[virtualRow.index];
                        return (
                          <TableRow
                            key={cliente.rut}
                            data-index={virtualRow.index}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '60px',
                              transform: `translateY(${virtualRow.start}px)`,
                              display: 'table',
                              tableLayout: 'fixed'
                            }}
                            className='hover:bg-muted/50'
                          >
                            <TableCell
                              className='font-medium font-mono text-sm h-[60px]'
                              style={{ width: '140px', minWidth: '140px' }}
                            >
                              {cliente.rut}
                            </TableCell>
                            <TableCell
                              className='font-medium h-[60px]'
                              style={{ width: 'auto', minWidth: '200px' }}
                            >
                              {cliente.esEmpresa
                                ? cliente.nombre
                                : `${cliente.nombre.trim()}`}
                            </TableCell>
                            <TableCell
                              className='h-[60px]'
                              style={{ width: '100px', minWidth: '100px' }}
                            >
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  cliente.esEmpresa
                                    ? 'bg-secondary/10 text-secondary'
                                    : 'bg-success/10 text-success'
                                }`}
                              >
                                {cliente.esEmpresa ? 'Empresa' : 'Persona'}
                              </span>
                            </TableCell>
                            <TableCell
                              className='text-center h-[60px]'
                              style={{ width: '120px', minWidth: '120px' }}
                            >
                              <Button
                                size='sm'
                                variant='default'
                                onClick={() => handleSelectCliente(cliente.rut)}
                              >
                                Seleccionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Selección de Comunas */}
        <Dialog open={modalComuna} onOpenChange={setModalComuna}>
          <DialogContent className='min-w-[320px] sm:min-w-[480px] md:min-w-[640px] lg:min-w-[768px] xl:min-w-[896px] 2xl:min-w-[1024px] max-w-7xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden'>
            <DialogHeader>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-primary/10 rounded-xl'>
                  <MapPin className='h-5 w-5' />
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

              <div
                ref={comunasTableRef}
                className='border rounded-xl bg-background h-[45vh] sm:h-[50vh] overflow-auto'
              >
                <div className='min-w-[500px]'>
                  <Table style={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHeader className='sticky top-0 bg-background z-10 border-b'>
                      <TableRow>
                        <TableHead
                          style={{ width: '100px', minWidth: '100px' }}
                        >
                          Código
                        </TableHead>
                        <TableHead style={{ width: 'auto', minWidth: '200px' }}>
                          Nombre
                        </TableHead>
                        <TableHead
                          className='text-center'
                          style={{ width: '120px', minWidth: '120px' }}
                        >
                          Acción
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody
                      style={{
                        height: `${comunasVirtualizer.getTotalSize()}px`,
                        position: 'relative'
                      }}
                    >
                      {comunasFiltradas.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className='text-center py-12 text-muted-foreground'
                          >
                            <div className='flex flex-col items-center gap-3'>
                              <div className='p-3 bg-background rounded-full'>
                                <MapPin className='h-8 w-8 opacity-50' />
                              </div>
                              <div className='space-y-1'>
                                <p className='font-medium'>
                                  No se encontraron comunas
                                </p>
                                <p className='text-sm'>
                                  {busquedaComuna
                                    ? `No hay resultados para "${busquedaComuna}"`
                                    : 'Escriba en el campo de búsqueda para filtrar'}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {comunasVirtualizer.getVirtualItems().map(virtualRow => {
                        const com = comunasFiltradas[virtualRow.index];
                        return (
                          <TableRow
                            key={com.codigo}
                            data-index={virtualRow.index}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '50px',
                              transform: `translateY(${virtualRow.start}px)`,
                              display: 'table',
                              tableLayout: 'fixed'
                            }}
                            className='hover:bg-muted/50'
                          >
                            <TableCell
                              className='font-medium font-mono text-sm h-[50px]'
                              style={{ width: '100px', minWidth: '100px' }}
                            >
                              {com.codigo}
                            </TableCell>
                            <TableCell
                              className='font-medium h-[50px]'
                              style={{ width: 'auto', minWidth: '200px' }}
                            >
                              {com.nombre}
                            </TableCell>
                            <TableCell
                              className='text-center h-[50px]'
                              style={{ width: '120px', minWidth: '120px' }}
                            >
                              <Button
                                size='sm'
                                onClick={() => handleSelectComuna(com.codigo)}
                                className='bg-primary hover:bg-primary/90'
                              >
                                Seleccionar
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
