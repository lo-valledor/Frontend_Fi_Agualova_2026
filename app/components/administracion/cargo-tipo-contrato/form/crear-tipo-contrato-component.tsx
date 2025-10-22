/* eslint-disable unused-imports/no-unused-vars */
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Plus,
  Save,
  Trash2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

import { useMemo, useState } from 'react';

import Select from 'react-select';

import { ModernHeader } from '~/components/shared/modern-header';
import { getTailwindSelectStyles } from '~/components/shared/react-select-styles';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Spinner } from '~/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '~/components/ui/table';
import api from '~/lib/api';
import type {
  BuscarCargoFacturable,
  CargoTipoDetalle,
  GeCombosConceptos,
  GetCombosTarifas,
  GetCombosTiposMedidor,
  GetCondicionesContrato
} from '~/types/administracion';
import type { TiposContrato } from '~/types/mantencion';

// Tipos para las opciones de react-select
interface CargoOption {
  value: number;
  label: string;
  data: BuscarCargoFacturable;
}

interface ConceptoOption {
  value: string;
  label: string;
}

interface CondicionOption {
  value: number;
  label: string;
}

interface CargoPorConceptoOption {
  value: number;
  label: string;
  data: BuscarCargoFacturable;
}

// Usar estilos compartidos para react-select con variables Tailwind
const selectStyles = getTailwindSelectStyles<CargoOption>();
const selectStylesConcepto = getTailwindSelectStyles<ConceptoOption>();
const selectStylesCondicion = getTailwindSelectStyles<CondicionOption>();
const selectStylesCargoPorConcepto =
  getTailwindSelectStyles<CargoPorConceptoOption>();

export default function CrearTipoContratoComponent({
  conceptos = [],
  tarifas = [],
  tiposMedidor = [],
  condicionesContrato = [],
  cargos = [],
  tiposContratos = []
}: Readonly<{
  conceptos?: GeCombosConceptos[];
  tarifas?: GetCombosTarifas[];
  tiposMedidor?: GetCombosTiposMedidor[];
  condicionesContrato?: GetCondicionesContrato[];
  cargos?: BuscarCargoFacturable[];
  tiposContratos?: TiposContrato[];
}>) {
  // Estado para el tipo de contrato seleccionado
  const [selectedTipoContrato, setSelectedTipoContrato] = useState<
    number | null
  >(null);

  const [selectedConcepto, setSelectedConcepto] =
    useState<ConceptoOption | null>(null);
  const [selectedCondicion, setSelectedCondicion] =
    useState<CondicionOption | null>(null);
  const [selectedCargo, setSelectedCargo] =
    useState<CargoPorConceptoOption | null>(null);
  const [descripcion, setDescripcion] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Estado para las condiciones agregadas
  const [condicionesAgregadas, setCondicionesAgregadas] = useState<
    CargoTipoDetalle[]
  >([]);

  // Estados para los cargos facturables
  const [selectedCargoMonofasico, setSelectedCargoMonofasico] =
    useState<CargoOption | null>(null);
  const [selectedCargoTrifasico, setSelectedCargoTrifasico] =
    useState<CargoOption | null>(null);
  const [selectedCargoAmbos, setSelectedCargoAmbos] =
    useState<CargoOption | null>(null);

  // Estados para los cargos agregados - inicializados vacíos
  const [cargosMonofasicoAgregados, setCargosMonofasicoAgregados] = useState<
    BuscarCargoFacturable[]
  >([]);

  const [cargosTrifasicoAgregados, setCargosTrifasicoAgregados] = useState<
    BuscarCargoFacturable[]
  >([]);

  const [cargosAmbosAgregados, setCargosAmbosAgregados] = useState<
    BuscarCargoFacturable[]
  >([]);

  // Función para filtrar cargos por concepto seleccionado
  const getCargosByConcepto = (conceptoNombre: string) => {
    return (cargos || []).filter(cargo => cargo.concepto === conceptoNombre);
  };

  // Función para filtrar cargos facturables por tipo de medidor
  const getCargosFacturablesByTipoMedidor = (tipoMedidorNombre: string) => {
    return (cargos || []).filter(
      cargo =>
        cargo.tipoMedidor.toLowerCase() === tipoMedidorNombre.toLowerCase()
    );
  };

  // Función para convertir cargos a opciones de react-select
  const convertCargosToOptions = (
    cargosList: BuscarCargoFacturable[]
  ): CargoOption[] => {
    return cargosList.map(cargo => ({
      value: cargo.id,
      label: cargo.descripcion,
      data: cargo
    }));
  };

  // Convertir conceptos a opciones para react-select usando useMemo
  const opcionesConceptos: ConceptoOption[] = useMemo(() => {
    return (conceptos || []).map(concepto => ({
      value: concepto.nombre,
      label: concepto.nombre
    }));
  }, [conceptos]);

  // Convertir condiciones a opciones para react-select usando useMemo
  const opcionesCondiciones: CondicionOption[] = useMemo(() => {
    return (condicionesContrato || []).map(condicion => ({
      value: condicion.id,
      label: condicion.concepto
    }));
  }, [condicionesContrato]);

  // Obtener cargos filtrados por concepto seleccionado
  const cargosFiltradosPorConcepto = selectedConcepto
    ? getCargosByConcepto(selectedConcepto.value)
    : [];

  // Convertir cargos filtrados a opciones para react-select
  const opcionesCargoPorConcepto: CargoPorConceptoOption[] =
    cargosFiltradosPorConcepto.map(cargo => ({
      value: cargo.id,
      label: cargo.descripcion,
      data: cargo
    }));

  // Obtener cargos facturables disponibles por tipo de medidor
  const cargosFacturablesAmbos = getCargosFacturablesByTipoMedidor('Ambos');
  const cargosFacturablesMonofasico =
    getCargosFacturablesByTipoMedidor('Monofasico');
  const cargosFacturablesTrifasico =
    getCargosFacturablesByTipoMedidor('Trifasico');

  // Convertir a opciones para react-select
  const opcionesCargosAmbos = convertCargosToOptions(cargosFacturablesAmbos);
  const opcionesCargosMonofasico = convertCargosToOptions(
    cargosFacturablesMonofasico
  );
  const opcionesCargosTrifasico = convertCargosToOptions(
    cargosFacturablesTrifasico
  );

  // Función para manejar el cambio de concepto
  const handleConceptoChange = (option: ConceptoOption | null) => {
    setSelectedConcepto(option);
    setSelectedCargo(null); // Resetear cargo cuando cambia el concepto
  };

  // Función para agregar condición de contrato
  const handleAgregarCondicion = () => {
    if (
      selectedConcepto &&
      selectedCargo &&
      selectedCondicion &&
      descripcion.trim()
    ) {
      const cargoSeleccionado = selectedCargo.data;
      const condicionSeleccionada = (condicionesContrato || []).find(
        c => c.id === selectedCondicion.value
      );

      if (cargoSeleccionado && condicionSeleccionada) {
        const nuevaCondicion: CargoTipoDetalle = {
          cargoId: selectedCargo.value,
          cargoDescripcion: cargoSeleccionado.descripcion,
          condicionId: selectedCondicion.value,
          condicionDescripcion: condicionSeleccionada.concepto,
          descripcion: descripcion.trim()
        };

        setCondicionesAgregadas(prev => [...prev, nuevaCondicion]);

        // Limpiar formulario
        setSelectedConcepto(null);
        setSelectedCargo(null);
        setSelectedCondicion(null);
        setDescripcion('');
      }
    }
  };

  // Función para quitar condición de contrato
  const handleQuitarCondicion = (index: number) => {
    setCondicionesAgregadas(prev => prev.filter((_, i) => i !== index));
  };

  // Funciones para agregar cargos
  const handleAgregarCargoMonofasico = () => {
    if (
      selectedCargoMonofasico &&
      !cargosMonofasicoAgregados.find(
        c => c.id === selectedCargoMonofasico.data.id
      )
    ) {
      setCargosMonofasicoAgregados(prev => [
        ...prev,
        selectedCargoMonofasico.data
      ]);
      setSelectedCargoMonofasico(null);
    }
  };

  const handleAgregarCargoTrifasico = () => {
    if (
      selectedCargoTrifasico &&
      !cargosTrifasicoAgregados.find(
        c => c.id === selectedCargoTrifasico.data.id
      )
    ) {
      setCargosTrifasicoAgregados(prev => [
        ...prev,
        selectedCargoTrifasico.data
      ]);
      setSelectedCargoTrifasico(null);
    }
  };

  const handleAgregarCargoAmbos = () => {
    if (
      selectedCargoAmbos &&
      !cargosAmbosAgregados.find(c => c.id === selectedCargoAmbos.data.id)
    ) {
      setCargosAmbosAgregados(prev => [...prev, selectedCargoAmbos.data]);
      setSelectedCargoAmbos(null);
    }
  };

  // Funciones para quitar cargos
  const handleQuitarCargoMonofasico = (cargoId: number) => {
    setCargosMonofasicoAgregados(prev => prev.filter(c => c.id !== cargoId));
  };

  const handleQuitarCargoTrifasico = (cargoId: number) => {
    setCargosTrifasicoAgregados(prev => prev.filter(c => c.id !== cargoId));
  };

  const handleQuitarCargoAmbos = (cargoId: number) => {
    setCargosAmbosAgregados(prev => prev.filter(c => c.id !== cargoId));
  };

  const handleGuardar = async () => {
    try {
      // Validar que se haya seleccionado un tipo de contrato
      if (!selectedTipoContrato) {
        toast.error('Debe seleccionar un tipo de contrato');
        return;
      }

      // Validar que haya al menos una configuración o un cargo agregado
      if (
        condicionesAgregadas.length === 0 &&
        cargosMonofasicoAgregados.length === 0 &&
        cargosTrifasicoAgregados.length === 0 &&
        cargosAmbosAgregados.length === 0
      ) {
        toast.error(
          'Debe agregar al menos una condición o un cargo facturable'
        );
        return;
      }

      setIsSaving(true);

      const payload = {
        tipoContratoId: selectedTipoContrato,
        configuraciones: condicionesAgregadas.map(item => ({
          cargoId: item.cargoId,
          tipoContratoId: selectedTipoContrato,
          condicionId: item.condicionId,
          descripcion: item.descripcion
        })),
        cargoMonofasicoIds: cargosMonofasicoAgregados.map(c => c.id),
        cargoTrifasicoIds: cargosTrifasicoAgregados.map(c => c.id),
        cargoAmbosIds: cargosAmbosAgregados.map(c => c.id)
      };

      // Llamada a la API para crear
      await api.post('cargoTipoContrato-guardarConfiguracion', payload);

      // Si la respuesta es exitosa, mostrar mensaje y redirigir
      toast.success('Cargo tipo contrato creado exitosamente');
      setTimeout(() => {
        window.history.back();
      }, 1500);
    } catch (error: any) {
      // Mostrar mensaje de error más específico si está disponible
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Error al crear el cargo tipo contrato';

      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVolver = () => {
    // Navegar de vuelta al mantenedor de Cargo Tipo Contrato
    window.history.back();
  };

  const handleCancelar = () => {
    // Limpiar estados y volver
    setSelectedTipoContrato(null);
    setCargosMonofasicoAgregados([]);
    setCargosTrifasicoAgregados([]);
    setCargosAmbosAgregados([]);
    setCondicionesAgregadas([]);
    setSelectedCargoMonofasico(null);
    setSelectedCargoTrifasico(null);
    setSelectedCargoAmbos(null);
    setSelectedConcepto(null);
    setSelectedCondicion(null);
    setSelectedCargo(null);
    setDescripcion('');
    window.history.back();
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 py-4'>
          <ModernHeader
            title='Crear Cargo Tipo de Contrato'
            description='Configura las condiciones y cargos del nuevo tipo de contrato'
            actions={
              <>
                <Button
                  variant='ghost'
                  onClick={handleVolver}
                  className='gap-2'
                >
                  <ArrowLeft className='h-4 w-4' />
                  Volver
                </Button>
                <Button
                  variant='outline'
                  onClick={handleCancelar}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGuardar}
                  className='gap-2'
                  variant='default'
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Spinner className='h-4 w-4' />
                  ) : (
                    <Save className='h-4 w-4' />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className='container mx-auto px-4 py-6 space-y-6'>
        {/* Sección 0: Tipo de Contrato */}
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              <CardTitle className='text-lg font-medium'>
                Tipo de Contrato
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className='max-w-md'>
              <Label htmlFor='tipoContrato' className='text-sm font-medium'>
                Tipo de Contrato
              </Label>
              <select
                id='tipoContrato'
                value={selectedTipoContrato || ''}
                onChange={e =>
                  setSelectedTipoContrato(Number(e.target.value) || null)
                }
                className='mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <option value=''>Seleccione un tipo de contrato...</option>
                {(tiposContratos || [])
                  .filter(
                    tipo => tipo.estado === 'Activo' || tipo.estado === true
                  )
                  .map(tipo => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Sección 1: Condiciones de Contrato */}
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5' />
              <CardTitle className='text-lg font-medium'>
                Condiciones de Contrato
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Formulario de condiciones */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Concepto</Label>
                <Select
                  value={selectedConcepto}
                  onChange={handleConceptoChange}
                  options={opcionesConceptos}
                  styles={selectStylesConcepto}
                  placeholder='Selecciona un concepto'
                  isClearable
                  isSearchable
                  noOptionsMessage={() => 'No hay conceptos disponibles'}
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Cargo</Label>
                <Select
                  value={selectedCargo}
                  onChange={setSelectedCargo}
                  options={opcionesCargoPorConcepto}
                  styles={selectStylesCargoPorConcepto}
                  placeholder={
                    selectedConcepto
                      ? 'Seleccione..'
                      : 'Primero selecciona un concepto'
                  }
                  isDisabled={!selectedConcepto}
                  isClearable
                  isSearchable
                  noOptionsMessage={() => 'No hay cargos disponibles'}
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Condición</Label>
                <Select
                  value={selectedCondicion}
                  onChange={setSelectedCondicion}
                  options={opcionesCondiciones}
                  styles={selectStylesCondicion}
                  placeholder='Selecciona una condición'
                  isClearable
                  isSearchable
                  noOptionsMessage={() => 'No hay condiciones disponibles'}
                />
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Descripción</Label>
                <Input
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  placeholder='Descripción de la condición'
                />
              </div>
            </div>

            <Button
              className='gap-2'
              variant='default'
              disabled={
                !selectedConcepto ||
                !selectedCargo ||
                !selectedCondicion ||
                !descripcion.trim()
              }
              onClick={handleAgregarCondicion}
            >
              <Plus className='h-4 w-4' />
              Agregar
            </Button>

            {/* Tabla de condiciones */}
            {condicionesAgregadas.length > 0 && (
              <div className='rounded-xl border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'></TableHead>
                      <TableHead className='text-xs font-medium text-muted-foreground'>
                        ID Cargo
                      </TableHead>
                      <TableHead className='text-xs font-medium text-muted-foreground'>
                        ID Condición
                      </TableHead>
                      <TableHead className='text-xs font-medium text-muted-foreground'>
                        Cargo
                      </TableHead>
                      <TableHead className='text-xs font-medium text-muted-foreground'>
                        Condición
                      </TableHead>
                      <TableHead className='text-xs font-medium text-muted-foreground'>
                        Descripción
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {condicionesAgregadas.map((item, index) => (
                      <TableRow
                        key={`${item.cargoId}-${item.condicionId}-${index}`}
                        className='hover:bg-muted/50'
                      >
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
                            onClick={() => handleQuitarCondicion(index)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {item.cargoId}
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {item.condicionId}
                        </TableCell>
                        <TableCell className='text-sm'>
                          {item.cargoDescripcion}
                        </TableCell>
                        <TableCell className='text-sm'>
                          {item.condicionDescripcion}
                        </TableCell>
                        <TableCell className='text-sm text-muted-foreground'>
                          {item.descripcion}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección 2: Cargos Facturables */}
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-2'>
              <Zap className='h-5 w-5' />
              <CardTitle className='text-lg font-medium'>
                Cargos Facturables
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
              {/* Monofásico */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Monofásico</h3>
                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>
                      Selecciona un cargo
                    </Label>
                    <Select
                      value={selectedCargoMonofasico}
                      onChange={setSelectedCargoMonofasico}
                      options={opcionesCargosMonofasico}
                      styles={selectStyles}
                      placeholder='Selecciona un cargo'
                      isClearable
                      isSearchable
                      noOptionsMessage={() => 'No hay cargos disponibles'}
                    />
                  </div>
                  <Button
                    size='sm'
                    variant='default'
                    className='w-full'
                    disabled={!selectedCargoMonofasico}
                    onClick={handleAgregarCargoMonofasico}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Agregar
                  </Button>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Agregadas</Label>
                    <div className='h-32 overflow-y-auto rounded-md border p-2'>
                      <div className='space-y-1'>
                        {cargosMonofasicoAgregados.length > 0 ? (
                          cargosMonofasicoAgregados.map(cargo => (
                            <div
                              key={cargo.id}
                              className='bg-muted rounded p-2 text-sm flex items-center justify-between'
                            >
                              <span>{cargo.descripcion}</span>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
                                onClick={() =>
                                  handleQuitarCargoMonofasico(cargo.id)
                                }
                              >
                                <Trash2 className='h-3 w-3' />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className='text-sm text-muted-foreground p-2 text-center'>
                            No hay cargos agregados
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trifásico */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Trifásico</h3>
                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>
                      Selecciona un cargo
                    </Label>
                    <Select
                      value={selectedCargoTrifasico}
                      onChange={setSelectedCargoTrifasico}
                      options={opcionesCargosTrifasico}
                      styles={selectStyles}
                      placeholder='Selecciona un cargo'
                      isClearable
                      isSearchable
                      noOptionsMessage={() => 'No hay cargos disponibles'}
                    />
                  </div>
                  <Button
                    size='sm'
                    variant='default'
                    className='w-full'
                    disabled={!selectedCargoTrifasico}
                    onClick={handleAgregarCargoTrifasico}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Agregar
                  </Button>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Agregadas</Label>
                    <div className='h-32 overflow-y-auto rounded-md border p-2'>
                      <div className='space-y-1'>
                        {cargosTrifasicoAgregados.length > 0 ? (
                          cargosTrifasicoAgregados.map(cargo => (
                            <div
                              key={cargo.id}
                              className='bg-muted rounded p-2 text-sm flex items-center justify-between'
                            >
                              <span>{cargo.descripcion}</span>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
                                onClick={() =>
                                  handleQuitarCargoTrifasico(cargo.id)
                                }
                              >
                                <Trash2 className='h-3 w-3' />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className='text-sm text-muted-foreground p-2 text-center'>
                            No hay cargos agregados
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ambos */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Ambos</h3>
                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>
                      Selecciona un cargo
                    </Label>
                    <Select
                      value={selectedCargoAmbos}
                      onChange={setSelectedCargoAmbos}
                      options={opcionesCargosAmbos}
                      styles={selectStyles}
                      placeholder='Selecciona un cargo'
                      isClearable
                      isSearchable
                      noOptionsMessage={() => 'No hay cargos disponibles'}
                    />
                  </div>
                  <Button
                    size='sm'
                    variant='default'
                    className='w-full'
                    disabled={!selectedCargoAmbos}
                    onClick={handleAgregarCargoAmbos}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Agregar
                  </Button>
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Agregadas</Label>
                    <div className='h-32 overflow-y-auto rounded-md border p-2'>
                      <div className='space-y-1'>
                        {cargosAmbosAgregados.length > 0 ? (
                          cargosAmbosAgregados.map(cargo => (
                            <div
                              key={cargo.id}
                              className='bg-muted rounded p-2 text-sm flex items-center justify-between'
                            >
                              <span>{cargo.descripcion}</span>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20'
                                onClick={() => handleQuitarCargoAmbos(cargo.id)}
                              >
                                <Trash2 className='h-3 w-3' />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className='text-sm text-muted-foreground p-2 text-center'>
                            No hay cargos agregados
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
