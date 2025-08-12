/* eslint-disable unused-imports/no-unused-vars */
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Plus,
  Save,
  Trash2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import Select from 'react-select';

import { ModernHeader } from '~/components/shared/modern-header';
import { getTailwindSelectStyles } from '~/components/shared/react-select-styles';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  SelectContent,
  SelectItem,
  Select as SelectPrimitive,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import api from '~/lib/api';
import type {
  BuscarCargoFacturable,
  CargoTipoContratoEditor,
  CargoTipoDetalle,
  CargoTipoListbox,
  GeCombosConceptos,
  GetCombosTarifas,
  GetCombosTiposMedidor,
  GetCondicionesContrato,
} from '~/types/administracion';

// Tipos para las opciones de react-select
interface CargoOption {
  value: number;
  label: string;
  data: BuscarCargoFacturable;
}

// Usar estilos compartidos para react-select con variables Tailwind
const selectStyles = getTailwindSelectStyles<CargoOption>();

export default function EditarTipoContrato({
  cargoTipoContrato,
  detalle,
  listbox,
  conceptos,
  tarifas,
  tiposMedidor,
  condicionesContrato,
  cargos,
  tipoContratoId,
}: Readonly<{
  cargoTipoContrato: CargoTipoContratoEditor;
  detalle: CargoTipoDetalle[];
  listbox: CargoTipoListbox[];
  conceptos: GeCombosConceptos[];
  tarifas: GetCombosTarifas[];
  tiposMedidor: GetCombosTiposMedidor[];
  condicionesContrato: GetCondicionesContrato[];
  cargos: BuscarCargoFacturable[];
  tipoContratoId: number;
}>) {
  const [tipoContrato] = useState(`Tipo de Contrato ID: ${tipoContratoId}`);
  const [selectedConcepto, setSelectedConcepto] = useState('');
  const [selectedCondicion, setSelectedCondicion] = useState('');
  const [selectedCargo, setSelectedCargo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Estado para las condiciones agregadas
  const [condicionesAgregadas, setCondicionesAgregadas] =
    useState<CargoTipoDetalle[]>(detalle);

  // Estados para los cargos facturables
  const [selectedCargoMonofasico, setSelectedCargoMonofasico] =
    useState<CargoOption | null>(null);
  const [selectedCargoTrifasico, setSelectedCargoTrifasico] =
    useState<CargoOption | null>(null);
  const [selectedCargoAmbos, setSelectedCargoAmbos] =
    useState<CargoOption | null>(null);

  // Estados para los cargos agregados - inicializados con datos existentes
  const [cargosMonofasicoAgregados, setCargosMonofasicoAgregados] = useState<
    BuscarCargoFacturable[]
  >(() => {
    // Convertir los cargos ya configurados de tipoMedidor = 1 (Monofásico)
    return listbox
      .filter(item => item.tipoMedidor === 1)
      .map(item => {
        // Buscar el cargo completo en la lista de cargos disponibles
        const cargoCompleto = cargos.find(c => c.id === item.cargoId);
        return (
          cargoCompleto || {
            id: item.cargoId,
            descripcion: item.cargoDescripcion,
            cuenta: '',
            fijoVariable: '',
            periodicoEventual: '',
            concepto: '',
            tarifa: '',
            tipoMedidor: 'Monofasico',
            tipo: '',
            codigoEnerlova: '',
            mostrarValorCero: false,
          }
        );
      });
  });

  const [cargosTrifasicoAgregados, setCargosTrifasicoAgregados] = useState<
    BuscarCargoFacturable[]
  >(() => {
    // Convertir los cargos ya configurados de tipoMedidor = 2 (Trifásico)
    return listbox
      .filter(item => item.tipoMedidor === 2)
      .map(item => {
        // Buscar el cargo completo en la lista de cargos disponibles
        const cargoCompleto = cargos.find(c => c.id === item.cargoId);
        return (
          cargoCompleto || {
            id: item.cargoId,
            descripcion: item.cargoDescripcion,
            cuenta: '',
            fijoVariable: '',
            periodicoEventual: '',
            concepto: '',
            tarifa: '',
            tipoMedidor: 'Trifasico',
            tipo: '',
            codigoEnerlova: '',
            mostrarValorCero: false,
          }
        );
      });
  });

  const [cargosAmbosAgregados, setCargosAmbosAgregados] = useState<
    BuscarCargoFacturable[]
  >(() => {
    // Convertir los cargos ya configurados de tipoMedidor = 0 (Ambos)
    return listbox
      .filter(item => item.tipoMedidor === 0)
      .map(item => {
        // Buscar el cargo completo en la lista de cargos disponibles
        const cargoCompleto = cargos.find(c => c.id === item.cargoId);
        return (
          cargoCompleto || {
            id: item.cargoId,
            descripcion: item.cargoDescripcion,
            cuenta: '',
            fijoVariable: '',
            periodicoEventual: '',
            concepto: '',
            tarifa: '',
            tipoMedidor: 'Ambos',
            tipo: '',
            codigoEnerlova: '',
            mostrarValorCero: false,
          }
        );
      });
  });

  // Función para filtrar cargos ya agregados por tipo de medidor
  const getCargosAgregadosByTipoMedidor = (tipoMedidor: number) => {
    return listbox.filter(cargo => cargo.tipoMedidor === tipoMedidor);
  };

  // Función para filtrar cargos por concepto seleccionado
  const getCargosByConcepto = (conceptoNombre: string) => {
    return cargos.filter(cargo => cargo.concepto === conceptoNombre);
  };

  // Función para filtrar cargos facturables por tipo de medidor
  const getCargosFacturablesByTipoMedidor = (tipoMedidorNombre: string) => {
    return cargos.filter(
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
      data: cargo,
    }));
  };

  // Obtener cargos filtrados por concepto seleccionado
  const cargosFiltradosPorConcepto = selectedConcepto
    ? getCargosByConcepto(selectedConcepto)
    : [];

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
  const handleConceptoChange = (value: string) => {
    setSelectedConcepto(value);
    setSelectedCargo(''); // Resetear cargo cuando cambia el concepto
  };

  // Función para agregar condición de contrato
  const handleAgregarCondicion = () => {
    if (
      selectedConcepto &&
      selectedCargo &&
      selectedCondicion &&
      descripcion.trim()
    ) {
      const cargoSeleccionado = cargos.find(
        c => c.id.toString() === selectedCargo
      );
      const condicionSeleccionada = condicionesContrato.find(
        c => c.id.toString() === selectedCondicion
      );

      if (cargoSeleccionado && condicionSeleccionada) {
        const nuevaCondicion: CargoTipoDetalle = {
          cargoId: parseInt(selectedCargo),
          cargoDescripcion: cargoSeleccionado.descripcion,
          condicionId: parseInt(selectedCondicion),
          condicionDescripcion: condicionSeleccionada.concepto,
          descripcion: descripcion.trim(),
        };

        setCondicionesAgregadas(prev => [...prev, nuevaCondicion]);

        // Limpiar formulario
        setSelectedConcepto('');
        setSelectedCargo('');
        setSelectedCondicion('');
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
        selectedCargoMonofasico.data,
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
        selectedCargoTrifasico.data,
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
      const payload = {
        tipoContratoId: tipoContratoId,
        configuraciones: condicionesAgregadas.map(item => ({
          cargoId: item.cargoId,
          tipoContratoId: tipoContratoId,
          condicionId: item.condicionId,
          descripcion: item.descripcion,
        })),
        cargoMonofasicoIds: cargosMonofasicoAgregados.map(c => c.id),
        cargoTrifasicoIds: cargosTrifasicoAgregados.map(c => c.id),
        cargoAmbosIds: cargosAmbosAgregados.map(c => c.id),
      };

      // Llamada real a la API
      const response = await api.post(
        '/cargoTipoContrato-guardarConfiguracion',
        payload
      );

      console.log('Respuesta del servidor:', response.data);

      // Si la respuesta es exitosa, mostrar mensaje y redirigir
      toast.success('Configuración guardada exitosamente');
      setTimeout(() => {
        window.history.back();
      }, 1500);
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar la configuración');
    }
  };

  const handleVolver = () => {
    // Navegar de vuelta al mantenedor de Cargo Tipo Contrato
    window.history.back();
  };

  const handleCancelar = () => {
    // Limpiar estados y volver
    setCargosMonofasicoAgregados([]);
    setCargosTrifasicoAgregados([]);
    setCargosAmbosAgregados([]);
    setSelectedCargoMonofasico(null);
    setSelectedCargoTrifasico(null);
    setSelectedCargoAmbos(null);
    window.history.back();
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 py-4'>
          <ModernHeader
            title='Modificar Cargo Tipo de Contrato'
            description='Gestiona las condiciones y cargos del tipo de contrato'
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
                <Button variant='outline' onClick={handleCancelar}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleGuardar}
                  className='gap-2 bg-sky-600 hover:bg-sky-700 text-white'
                >
                  <Save className='h-4 w-4' />
                  Guardar
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className='container mx-auto px-4 py-6 space-y-6'>
        {/* Sección 1: Tipo de Contrato */}
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-2'>
              <FileText className='h-5 w-5 text-sky-600 dark:text-sky-400' />
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
              <Input
                id='tipoContrato'
                value={tipoContrato}
                readOnly
                className='mt-2 bg-muted cursor-not-allowed'
              />
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Condiciones de Contrato */}
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-5 w-5 text-sky-600 dark:text-sky-400' />
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
                <SelectPrimitive
                  value={selectedConcepto}
                  onValueChange={handleConceptoChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona un concepto' />
                  </SelectTrigger>
                  <SelectContent>
                    {conceptos.map(concepto => (
                      <SelectItem key={concepto.id} value={concepto.nombre}>
                        {concepto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectPrimitive>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Cargo</Label>
                <SelectPrimitive
                  value={selectedCargo}
                  onValueChange={setSelectedCargo}
                  disabled={!selectedConcepto}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedConcepto
                          ? 'Seleccione..'
                          : 'Primero selecciona un concepto'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {cargosFiltradosPorConcepto.map(cargo => (
                      <SelectItem key={cargo.id} value={cargo.id.toString()}>
                        {cargo.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectPrimitive>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Condición</Label>
                <SelectPrimitive
                  value={selectedCondicion}
                  onValueChange={setSelectedCondicion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Selecciona una condición' />
                  </SelectTrigger>
                  <SelectContent>
                    {condicionesContrato.map(condicion => (
                      <SelectItem
                        key={condicion.id}
                        value={condicion.id.toString()}
                      >
                        {condicion.concepto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </SelectPrimitive>
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
              className='gap-2 bg-sky-600 hover:bg-sky-700 text-white'
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
              <div className='rounded-lg border'>
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
                      <TableRow key={index} className='hover:bg-muted/50'>
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

        {/* Sección 3: Cargos Facturables */}
        <Card className='border-0 shadow-sm'>
          <CardHeader className='pb-4'>
            <div className='flex items-center gap-2'>
              <Zap className='h-5 w-5 text-sky-600 dark:text-sky-400' />
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
                    className='w-full bg-sky-600 text-white hover:bg-sky-700'
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
                    className='w-full bg-sky-600 text-white hover:bg-sky-700'
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
                    className='w-full bg-sky-600 text-white hover:bg-sky-700'
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
