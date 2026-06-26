import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Plus,
  Save,
  Trash2,
  Zap
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Select from 'react-select';
import { toast } from 'sonner';

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
import { administracionService } from '~/services/administracionService';
import type {
  CargosFacturables,
  Conceptos,
  Condiciones,
  GuardarConfiguracionPayload,
  TiposContrato
} from '~/types/administracion';

const selectStyles = getTailwindSelectStyles<{
  value: number;
  label: string;
}>();

export default function CargoTipoContratoForm({
  mode,
  tipoContratoId: initialTipoContratoId,
  tipoContratoLabel,
  tiposContrato = [],
  conceptos = [],
  condiciones = [],
  cargosFacturables = [],
  initialValue
}: Readonly<{
  mode: 'create' | 'edit';
  tipoContratoId?: number;
  tipoContratoLabel?: string;
  tiposContrato?: TiposContrato[];
  conceptos?: Conceptos[];
  condiciones?: Condiciones[];
  cargosFacturables?: CargosFacturables[];
  initialValue?: GuardarConfiguracionPayload;
}>) {
  const [selectedTipoContrato, setSelectedTipoContrato] = useState<
    number | null
  >(initialTipoContratoId ?? null);
  const [selectedCondicion, setSelectedCondicion] = useState<number | null>(
    null
  );
  const [selectedCargoCondicion, setSelectedCargoCondicion] = useState<
    number | null
  >(null);
  const [descripcion, setDescripcion] = useState('');
  const [selectedCargoMonofasico, setSelectedCargoMonofasico] = useState<
    number | null
  >(null);
  const [selectedCargoTrifasico, setSelectedCargoTrifasico] = useState<
    number | null
  >(null);
  const [selectedCargoAmbos, setSelectedCargoAmbos] = useState<number | null>(
    null
  );
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [configuracion, setConfiguracion] =
    useState<GuardarConfiguracionPayload>(() => ({
      idTipoContrato:
        initialTipoContratoId ?? initialValue?.idTipoContrato ?? 0,
      condiciones: initialValue?.condiciones ?? [],
      idsCargosMonofasicos: initialValue?.idsCargosMonofasicos ?? [],
      idsCargosTrifasicos: initialValue?.idsCargosTrifasicos ?? [],
      idsCargosAmbos: initialValue?.idsCargosAmbos ?? []
    }));

  const cargoMap = useMemo(
    () =>
      new Map(
        cargosFacturables.map(cargo => [Number(cargo.id), cargo.descripcion])
      ),
    [cargosFacturables]
  );

  const condicionMap = useMemo(
    () =>
      new Map(
        condiciones.map(condicion => [
          Number(condicion.id),
          condicion.descripcion
        ])
      ),
    [condiciones]
  );

  const tipoContratoOptions = useMemo(
    () =>
      tiposContrato
        .map(tipo => ({
          value: Number(tipo.id),
          label: tipo.descripcion
        }))
        .filter(tipo => Number.isFinite(tipo.value)),
    [tiposContrato]
  );

  const cargoOptions = useMemo(
    () =>
      cargosFacturables
        .map(cargo => ({
          value: Number(cargo.id),
          label: cargo.descripcion
        }))
        .filter(cargo => Number.isFinite(cargo.value)),
    [cargosFacturables]
  );

  const condicionOptions = useMemo(
    () =>
      condiciones
        .map(condicion => ({
          value: Number(condicion.id),
          label: condicion.descripcion
        }))
        .filter(condicion => Number.isFinite(condicion.value)),
    [condiciones]
  );

  const resetForm = () => {
    setSelectedCondicion(null);
    setSelectedCargoCondicion(null);
    setDescripcion('');
    setSelectedCargoMonofasico(null);
    setSelectedCargoTrifasico(null);
    setSelectedCargoAmbos(null);
  };

  const agregarCondicion = () => {
    if (!selectedCargoCondicion || !selectedCondicion || !descripcion.trim()) {
      toast.error('Debes completar cargo, condición y descripción.');
      return;
    }

    setConfiguracion(prev => ({
      ...prev,
      condiciones: [
        ...prev.condiciones,
        {
          idCargo: selectedCargoCondicion,
          idCondicion: selectedCondicion,
          descripcion: descripcion.trim()
        }
      ]
    }));

    setSelectedCondicion(null);
    setSelectedCargoCondicion(null);
    setDescripcion('');
  };

  const quitarCondicion = (index: number) => {
    setConfiguracion(prev => ({
      ...prev,
      condiciones: prev.condiciones.filter(
        (_, currentIndex) => currentIndex !== index
      )
    }));
  };

  const agregarCargo = (
    key: 'idsCargosMonofasicos' | 'idsCargosTrifasicos' | 'idsCargosAmbos',
    cargoId: number | null,
    clear: () => void
  ) => {
    if (!cargoId) {
      return;
    }

    setConfiguracion(prev => ({
      ...prev,
      [key]: prev[key].includes(cargoId) ? prev[key] : [...prev[key], cargoId]
    }));
    clear();
  };

  const quitarCargo = (
    key: 'idsCargosMonofasicos' | 'idsCargosTrifasicos' | 'idsCargosAmbos',
    cargoId: number
  ) => {
    setConfiguracion(prev => ({
      ...prev,
      [key]: prev[key].filter(id => id !== cargoId)
    }));
  };

  const handleGuardar = async () => {
    if (selectedTipoContrato === null) {
      toast.error('Debes seleccionar un tipo de contrato.');
      return;
    }

    const payload: GuardarConfiguracionPayload = {
      ...configuracion,
      idTipoContrato: selectedTipoContrato
    };

    if (
      payload.condiciones.length === 0 &&
      payload.idsCargosMonofasicos.length === 0 &&
      payload.idsCargosTrifasicos.length === 0 &&
      payload.idsCargosAmbos.length === 0
    ) {
      toast.error('Debes agregar al menos una configuración.');
      return;
    }

    setIsSaving(true);

    const result =
      await administracionService.saveCargoTipoContratoConfiguration(payload);

    setIsSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(
      mode === 'create'
        ? 'Configuración creada correctamente.'
        : 'Configuración actualizada correctamente.'
    );

    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  const handleCancelar = () => {
    resetForm();
    navigate(-1);
  };

  const renderCargoList = (
    title: string,
    selectedValue: number | null,
    onChange: (value: number | null) => void,
    values: number[],
    key: 'idsCargosMonofasicos' | 'idsCargosTrifasicos' | 'idsCargosAmbos'
  ) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selecciona un cargo</Label>
          <Select
            value={
              cargoOptions.find(option => option.value === selectedValue) ??
              null
            }
            onChange={option => onChange(option ? option.value : null)}
            options={cargoOptions}
            styles={selectStyles}
            placeholder="Selecciona un cargo"
            isClearable
            isSearchable
            noOptionsMessage={() => 'No hay cargos disponibles'}
          />
        </div>
        <Button
          size="sm"
          variant="default"
          className="w-full"
          disabled={!selectedValue}
          onClick={() => agregarCargo(key, selectedValue, () => onChange(null))}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar
        </Button>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Agregadas</Label>
          <div className="h-32 overflow-y-auto rounded-md border p-2">
            <div className="space-y-1">
              {values.length > 0 ? (
                values.map(cargoId => (
                  <div
                    key={`${key}-${cargoId}`}
                    className="flex items-center justify-between rounded bg-muted p-2 text-sm"
                  >
                    <span>{cargoMap.get(cargoId) ?? `Cargo ${cargoId}`}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                      onClick={() => quitarCargo(key, cargoId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No hay cargos agregados
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <ModernHeader
            title={
              mode === 'create'
                ? 'Crear Cargo Tipo de Contrato'
                : 'Editar Cargo Tipo de Contrato'
            }
            description="Configura condiciones y cargos facturables del tipo de contrato."
            actions={
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelar}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGuardar}
                  className="gap-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </>
            }
          />
        </div>
      </div>

      <div className="container mx-auto space-y-6 px-4 py-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg font-medium">
                Tipo de Contrato
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {mode === 'create' ? (
              <div className="max-w-md space-y-2">
                <Label className="text-sm font-medium">Tipo de Contrato</Label>
                <Select
                  value={
                    tipoContratoOptions.find(
                      option => option.value === selectedTipoContrato
                    ) ?? null
                  }
                  onChange={option =>
                    setSelectedTipoContrato(option ? option.value : null)
                  }
                  options={tipoContratoOptions}
                  styles={selectStyles}
                  placeholder="Seleccione un tipo de contrato"
                  isClearable
                  isSearchable
                  noOptionsMessage={() =>
                    'No hay tipos de contrato disponibles'
                  }
                />
              </div>
            ) : (
              <div className="max-w-md space-y-2">
                <Label htmlFor="tipoContrato" className="text-sm font-medium">
                  Tipo de Contrato
                </Label>
                <Input
                  id="tipoContrato"
                  value={
                    tipoContratoLabel ??
                    `Tipo de contrato ${selectedTipoContrato ?? ''}`
                  }
                  readOnly
                  className="cursor-not-allowed bg-muted"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <CardTitle className="text-lg font-medium">
                Condiciones de Contrato
              </CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Conceptos disponibles: {conceptos.length}. La configuración
              vigente usa cargo, condición y descripción.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <div className="space-y-2 lg:col-span-2">
                <Label className="text-sm font-medium">Cargo Facturable</Label>
                <Select
                  value={
                    cargoOptions.find(
                      option => option.value === selectedCargoCondicion
                    ) ?? null
                  }
                  onChange={option =>
                    setSelectedCargoCondicion(option ? option.value : null)
                  }
                  options={cargoOptions}
                  styles={selectStyles}
                  placeholder="Selecciona un cargo"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => 'No hay cargos disponibles'}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Condición</Label>
                <Select
                  value={
                    condicionOptions.find(
                      option => option.value === selectedCondicion
                    ) ?? null
                  }
                  onChange={option =>
                    setSelectedCondicion(option ? option.value : null)
                  }
                  options={condicionOptions}
                  styles={selectStyles}
                  placeholder="Selecciona una condición"
                  isClearable
                  isSearchable
                  noOptionsMessage={() => 'No hay condiciones disponibles'}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Descripción</Label>
                <Input
                  value={descripcion}
                  onChange={event => setDescripcion(event.target.value)}
                  placeholder="Descripción de la condición"
                />
              </div>
            </div>

            <Button
              className="gap-2"
              disabled={
                !selectedCargoCondicion ||
                !selectedCondicion ||
                !descripcion.trim()
              }
              onClick={agregarCondicion}
            >
              <Plus className="h-4 w-4" />
              Agregar
            </Button>

            {configuracion.condiciones.length > 0 && (
              <div className="rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>ID Cargo</TableHead>
                      <TableHead>ID Condición</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Condición</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configuracion.condiciones.map((item, index) => (
                      <TableRow
                        key={`${item.idCargo}-${item.idCondicion}-${index}`}
                      >
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                            onClick={() => quitarCondicion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.idCargo}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.idCondicion}
                        </TableCell>
                        <TableCell className="text-sm">
                          {cargoMap.get(item.idCargo) ??
                            `Cargo ${item.idCargo}`}
                        </TableCell>
                        <TableCell className="text-sm">
                          {condicionMap.get(item.idCondicion) ??
                            `Condición ${item.idCondicion}`}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
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

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <CardTitle className="text-lg font-medium">
                Cargos Facturables
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {renderCargoList(
                'Monofásico',
                selectedCargoMonofasico,
                setSelectedCargoMonofasico,
                configuracion.idsCargosMonofasicos,
                'idsCargosMonofasicos'
              )}
              {renderCargoList(
                'Trifásico',
                selectedCargoTrifasico,
                setSelectedCargoTrifasico,
                configuracion.idsCargosTrifasicos,
                'idsCargosTrifasicos'
              )}
              {renderCargoList(
                'Ambos',
                selectedCargoAmbos,
                setSelectedCargoAmbos,
                configuracion.idsCargosAmbos,
                'idsCargosAmbos'
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
