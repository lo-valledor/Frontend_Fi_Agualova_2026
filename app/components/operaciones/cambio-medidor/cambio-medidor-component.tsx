import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Gauge,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { ModernHeader } from '~/components/shared/modern-header';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Progress } from '~/components/ui/progress';
import { operacionesService } from '~/services/operacionesService';
import type {
  CambioMedidorBuscarAntiguoRequest,
  CambioMedidorBuscarNuevoRequest
} from '~/types/operaciones';

import AntiguoMedidorForm from './antiguo-medidor-form';
import DetalleMedidorAntiguo from './detalle-medidor-antiguo';
import DetalleMedidorNuevo from './detalle-medidor-nuevo';
import NuevoMedidorForm from './nuevo-medidor-form';

const MEDIDOR_ANTIGUO_INICIAL: CambioMedidorBuscarAntiguoRequest = {
  idMedidor: 0,
  acometida: '',
  numeroSerie: '',
  tipo: '',
  constante: 0,
  marca: '',
  modelo: '',
  ultimaLectura: 0
};

const MEDIDOR_NUEVO_INICIAL: CambioMedidorBuscarNuevoRequest = {
  idMedidor: 0,
  tipo: '',
  constante: 0,
  marca: '',
  modelo: '',
  numeroSerie: ''
};

export default function CambioMedidorComponent() {
  const [acometidaInput, setAcometidaInput] = useState('');
  const [numeroSerieAntiguoInput, setNumeroSerieAntiguoInput] = useState('');
  const [detalleAntiguo, setDetalleAntiguo] =
    useState<CambioMedidorBuscarAntiguoRequest | null>(null);

  const [lecturaFinalAntiguo, setLecturaFinalAntiguo] = useState('');

  const [numeroSerieNuevoInput, setNumeroSerieNuevoInput] = useState('');
  const [detalleNuevo, setDetalleNuevo] =
    useState<CambioMedidorBuscarNuevoRequest | null>(null);

  const [fechaCambio, setFechaCambio] = useState('');
  const [primeraLecturaNuevo, setPrimeraLecturaNuevo] = useState('');
  const [nuevoContratoIdInput, setNuevoContratoIdInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleBuscarAntiguo = async (): Promise<void> => {
    if (!acometidaInput && !numeroSerieAntiguoInput) {
      toast.error('Ingresa la acometida o el número de serie');
      return;
    }

    setIsLoading(true);
    try {
      const result = await operacionesService.getBuscarMedidorAntiguo(
        acometidaInput || undefined,
        numeroSerieAntiguoInput || undefined
      );
      if (result.error || !result.data) {
        toast.error(result.error ?? 'No se encontró el medidor antiguo');
        return;
      }
      setDetalleAntiguo(result.data);
      toast.success('Datos del medidor antiguo cargados');
      setCurrentStep(2);
    } catch (err) {
      toast.error('Error al buscar medidor antiguo', {
        description: String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiarAntiguo = (): void => {
    setAcometidaInput('');
    setNumeroSerieAntiguoInput('');
    setDetalleAntiguo(null);
    setLecturaFinalAntiguo('');
  };

  const handleBuscarNuevo = async (): Promise<void> => {
    if (!numeroSerieNuevoInput) {
      toast.error('Ingresa el número de serie del nuevo medidor');
      return;
    }

    setIsLoading(true);
    try {
      const result = await operacionesService.getBuscarMedidorNuevo(
        numeroSerieNuevoInput
      );
      if (result.error || !result.data) {
        toast.error(result.error ?? 'No se encontró el medidor nuevo');
        return;
      }
      setDetalleNuevo(result.data);
      toast.success('Datos del medidor nuevo cargados');
      setCurrentStep(4);
    } catch (err) {
      toast.error('Error al buscar medidor nuevo', {
        description: String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmarCambio = async (): Promise<void> => {
    if (!detalleAntiguo || !detalleNuevo) {
      toast.error('Faltan datos del medidor antiguo o nuevo');
      return;
    }

    const lecturaFinalNum = parseFloat(lecturaFinalAntiguo);
    const primeraLecturaNum = parseFloat(primeraLecturaNuevo);

    if (Number.isNaN(lecturaFinalNum) || lecturaFinalNum <= 0) {
      toast.error('La lectura final del medidor antiguo debe ser válida');
      return;
    }
    if (Number.isNaN(primeraLecturaNum) || primeraLecturaNum < 0) {
      toast.error('La primera lectura del medidor nuevo debe ser válida');
      return;
    }
    if (!fechaCambio) {
      toast.error('Selecciona la fecha de cambio');
      return;
    }

    setIsLoading(true);
    try {
      const result = await operacionesService.postEjecutarCambioMedidor({
        idMedidorAntiguo: detalleAntiguo.idMedidor,
        acometida: detalleAntiguo.acometida,
        ultimaLecturaAntiguo: detalleAntiguo.ultimaLectura,
        lecturaFinalAntiguo: lecturaFinalNum,
        fechaCambio,
        idMedidorNuevo: detalleNuevo.idMedidor,
        primeraLecturaNuevo: primeraLecturaNum,
        nuevoContratoId: nuevoContratoIdInput
          ? Number.parseInt(nuevoContratoIdInput, 10)
          : 0
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Cambio de medidor registrado correctamente');
      handleLimpiarTodo();
      setCurrentStep(1);
    } catch (err) {
      toast.error('Error al registrar el cambio de medidor', {
        description: String(err)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiarTodo = (): void => {
    handleLimpiarAntiguo();
    setNumeroSerieNuevoInput('');
    setDetalleNuevo(null);
    setFechaCambio('');
    setPrimeraLecturaNuevo('');
    setNuevoContratoIdInput('');
  };

  const siguienteHabilitado = (): boolean => {
    switch (currentStep) {
      case 1:
        return Boolean(detalleAntiguo?.idMedidor);
      case 2:
        return Boolean(detalleAntiguo?.idMedidor);
      case 3:
        return Boolean(detalleNuevo?.idMedidor);
      default:
        return false;
    }
  };

  const formValido = Boolean(
    detalleAntiguo?.idMedidor &&
      detalleNuevo?.idMedidor &&
      lecturaFinalAntiguo.trim() !== '' &&
      primeraLecturaNuevo.trim() !== '' &&
      fechaCambio !== ''
  );

  const renderPaso = () => {
    if (currentStep === 1) {
      return (
        <Card className="border-border">
          <CardHeader className="bg-background border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900 rounded-xl">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Paso 1: Buscar medidor antiguo</CardTitle>
                <CardDescription>
                  Busca el medidor que será reemplazado
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <AntiguoMedidorForm
              acometida={acometidaInput}
              numeroSerie={numeroSerieAntiguoInput}
              isLoading={isLoading}
              onAcometidaChange={setAcometidaInput}
              onNumeroSerieChange={setNumeroSerieAntiguoInput}
              onBuscar={handleBuscarAntiguo}
              onLimpiar={handleLimpiarAntiguo}
            />
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border p-3">
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!siguienteHabilitado() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      );
    }

    if (currentStep === 2 && detalleAntiguo) {
      return (
        <Card className="border-border">
          <CardHeader className="bg-background border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Gauge className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Paso 2: Detalles del medidor antiguo
                </CardTitle>
                <CardDescription>
                  Revisa la información e ingresa la lectura final
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            <DetalleMedidorAntiguo
              detalleMedidorAntiguo={detalleAntiguo}
              lecturaFinalValue={lecturaFinalAntiguo}
              onLecturaFinalChange={setLecturaFinalAntiguo}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border p-3">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button
              onClick={() => setCurrentStep(3)}
              disabled={!lecturaFinalAntiguo.trim() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      );
    }

    if (currentStep === 3) {
      return (
        <Card className="border-border">
          <CardHeader className="bg-background border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Gauge className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Paso 3: Buscar medidor nuevo
                </CardTitle>
                <CardDescription>
                  Busca el medidor nuevo a instalar
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-4">
            <NuevoMedidorForm
              numeroSerie={numeroSerieNuevoInput}
              isLoading={isLoading}
              onNumeroSerieChange={setNumeroSerieNuevoInput}
              onBuscar={handleBuscarNuevo}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border p-3">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button
              onClick={() => setCurrentStep(4)}
              disabled={!siguienteHabilitado() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              Siguiente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      );
    }

    if (currentStep === 4 && detalleAntiguo && detalleNuevo) {
      return (
        <Card className="border-border">
          <CardHeader className="bg-background border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Paso 4: Confirmar Cambio</CardTitle>
                <CardDescription>
                  Revisa los datos y confirma el cambio de medidor
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-border">
                <CardHeader className="bg-background p-3">
                  <CardTitle className="text-base">Medidor Antiguo</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Acometida:</span>
                    <span className="font-medium">{detalleAntiguo.acometida}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>N° Serie:</span>
                    <span className="font-medium">{detalleAntiguo.numeroSerie}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última lectura:</span>
                    <span className="font-medium">{detalleAntiguo.ultimaLectura}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lectura final:</span>
                    <span className="font-medium text-primary">
                      {lecturaFinalAntiguo}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="bg-background p-3">
                  <CardTitle className="text-base">Medidor Nuevo</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>N° Serie:</span>
                    <span className="font-medium">{detalleNuevo.numeroSerie}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="font-medium">{detalleNuevo.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marca:</span>
                    <span className="font-medium">{detalleNuevo.marca}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modelo:</span>
                    <span className="font-medium">{detalleNuevo.modelo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primera lectura:</span>
                    <span className="font-medium text-primary">
                      {primeraLecturaNuevo || '-'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader className="bg-background p-3">
                <CardTitle className="text-base flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Datos del Cambio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha-cambio" className="text-sm">
                      Fecha de Cambio
                    </Label>
                    <Input
                      id="fecha-cambio"
                      type="date"
                      value={fechaCambio}
                      onChange={e => setFechaCambio(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="primera-lectura-nuevo"
                      className="text-sm"
                    >
                      Primera Lectura (Nuevo)
                    </Label>
                    <Input
                      id="primera-lectura-nuevo"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={primeraLecturaNuevo}
                      onChange={e => setPrimeraLecturaNuevo(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-contrato-id" className="text-sm">
                      Nuevo Contrato ID (Opcional)
                    </Label>
                    <Input
                      id="nuevo-contrato-id"
                      type="number"
                      placeholder="0"
                      value={nuevoContratoIdInput}
                      onChange={e => setNuevoContratoIdInput(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-border p-3">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            <Button
              onClick={handleConfirmarCambio}
              disabled={!formValido || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Confirmar Cambio
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return null;
  };

  const pasos = [
    { num: 1, label: 'Antiguo' },
    { num: 2, label: 'Detalles' },
    { num: 3, label: 'Nuevo' },
    { num: 4, label: 'Confirmar' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 space-y-4">
        <ModernHeader
          title="Cambio de Medidor"
          description="Gestión de cambio de medidores"
        />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4 overflow-x-auto">
            {pasos.map((paso, idx) => (
              <div key={paso.num} className="flex items-center min-w-0 flex-1">
                <div className="flex items-center min-w-0">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                      currentStep >= paso.num
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {currentStep > paso.num ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-sm">{paso.num}</span>
                    )}
                  </div>
                  <div className="ml-2 text-sm font-medium truncate">
                    {paso.label}
                  </div>
                </div>
                {idx < pasos.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 bg-border min-w-[20px]">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${((currentStep - 1) / (pasos.length - 1)) * 100}%`
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 4) * 100} className="h-2" />
        </div>

        {renderPaso()}
      </div>
    </div>
  );
}