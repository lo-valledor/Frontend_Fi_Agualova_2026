import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Gauge,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Progress } from '~/components/ui/progress';
import { useAuth } from '~/context/AuthContext';
import api from '~/lib/api';
import {
  type ConsultaMedidorAntiguoResponse,
  type ConsultaMedidorNuevoResponse,
  type DetalleMedidorAntiguo,
  type DetalleMedidorNuevo,
  type MedidorAntiguo,
  type MedidorNuevo,
} from '~/types/operaciones';

import AntiguoMedidorForm from './antiguo-medidor-form';
import DetalleMedidorAntiguoComponent from './detalle-medidor-antiguo';
import DetalleMedidorNuevoComponent from './detalle-medidor-nuevo';
import NuevoMedidorForm from './nuevo-medidor-form';

export default function CambioMedidorComponent() {
  const { user } = useAuth();

  // Estados para medidor antiguo
  const [medidorAntiguo, setMedidorAntiguo] = useState<MedidorAntiguo>({
    acometida: '',
    numeroSerie: '',
  });

  // Estados para detalles de medidor antiguo
  const [detalleMedidorAntiguo, setDetalleMedidorAntiguo] =
    useState<DetalleMedidorAntiguo>({
      acometidaDetalle: '',
      constante: '',
      marca: '',
      ultimaLectura: '',
      numeroMedidor: '',
      tipo: '',
      modelo: '',
      lecturaActual: '',
      medidorId: 0,
    });

  // Estados para nuevo medidor
  const [medidorNuevo, setMedidorNuevo] = useState<MedidorNuevo>({
    numeroSerie: '',
  });

  // Estados para detalle nuevo medidor
  const [detalleMedidorNuevo, setDetalleMedidorNuevo] =
    useState<DetalleMedidorNuevo>({
      medidor_id: 0,
      tipo_medidor: '',
      constante_multiplicar: 0,
      marca: '',
      modelo: '',
      numero_serie: '',
      estado_medidor: 0,
    });
  // Estado para nuevo contrato
  const [codigoContrato, setCodigoContrato] = useState<string>('');
  // Estados adicionales para la API
  const [valorPrimeraLectura, setValorPrimeraLectura] = useState<string>('');
  const [fechaPrimeraLectura, setFechaPrimeraLectura] = useState<string>('');

  // Estado para manejar carga
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el paso actual
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Manejadores de cambio de formularios
  const handleMedidorAntiguoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setMedidorAntiguo(prev => ({
      ...prev,
      [id === 'acometida' ? 'acometida' : 'numeroSerie']: value,
    }));
  };

  const handleMedidorNuevoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedidorNuevo({
      numeroSerie: e.target.value,
    });
  };

  const handleDetalleMedidorNuevoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;

    // Actualizar el estado con los campos correctos según la interfaz DetalleMedidorNuevo
    if (id === 'nuevo-numero-medidor') {
      setDetalleMedidorNuevo(prev => ({
        ...prev,
        numero_serie: value,
      }));
    } else if (id === 'nueva-constante') {
      setDetalleMedidorNuevo(prev => ({
        ...prev,
        constante_multiplicar: parseFloat(value) || 0,
      }));
    } else if (id === 'nueva-marca') {
      setDetalleMedidorNuevo(prev => ({
        ...prev,
        marca: value,
      }));
    } else if (id === 'nuevo-tipo') {
      setDetalleMedidorNuevo(prev => ({
        ...prev,
        tipo_medidor: value,
      }));
    } else if (id === 'nuevo-modelo') {
      setDetalleMedidorNuevo(prev => ({
        ...prev,
        modelo: value,
      }));
    }
  };

  const handleBuscarAntiguo = async () => {
    try {
      setIsLoading(true);

      // Validar que se haya ingresado al menos un campo
      if (!medidorAntiguo.acometida && !medidorAntiguo.numeroSerie) {
        toast.error('Debe ingresar la acometida o el número de serie');
        return;
      }

      // Construir parámetros
      const params = new URLSearchParams();
      if (medidorAntiguo.acometida) {
        params.append('acometida', medidorAntiguo.acometida);
      }
      if (medidorAntiguo.numeroSerie) {
        params.append('numeroSerie', medidorAntiguo.numeroSerie);
      }

      const response = await api.get('/consulta-medidor-antiguo', { params });

      if (response.status === 200) {
        // Asegurarse de acceder al primer elemento [0] si la respuesta es un array
        const responseData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        const data = responseData as ConsultaMedidorAntiguoResponse;

        setDetalleMedidorAntiguo({
          acometidaDetalle: data.codigo_acometida,
          constante: data.constante_multiplicar.toString(),
          marca: data.marca,
          ultimaLectura: data.ultima_lectura.toString(),
          numeroMedidor: data.numero_serie,
          tipo: data.tipo_medidor,
          modelo: data.modelo,
          lecturaActual: data.lectura_actual?.toString() || '',
          medidorId: data.medidor_id,
        });

        toast.success('Datos del medidor cargados correctamente');

        // Avanzar al siguiente paso si se encontró el medidor
        if (data.medidor_id) {
          setCurrentStep(2);
        }
      }
    } catch (_error) {
      toast.error('No se pudo obtener la información del medidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuscarNuevo = async () => {
    try {
      setIsLoading(true);

      // Validar que se haya ingresado el número de serie
      if (!medidorNuevo.numeroSerie) {
        toast.error('Debe ingresar el número de serie del nuevo medidor');
        return;
      }

      const response = await api.get('/consulta-medidor-nuevo', {
        params: {
          numeroSerie: medidorNuevo.numeroSerie,
        },
      });

      if (response.status === 200) {
        // Asegurarse de acceder al primer elemento [0] si la respuesta es un array
        const responseData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;

        if (!responseData) {
          toast.error('No se encontró información del medidor');
          return;
        }

        const data = responseData as ConsultaMedidorNuevoResponse;

        setDetalleMedidorNuevo({
          medidor_id: data.medidor_id,
          tipo_medidor: data.tipo_medidor,
          constante_multiplicar: data.constante_multiplicar,
          marca: data.marca,
          modelo: data.modelo,
          numero_serie: data.numero_serie,
          estado_medidor: data.estado_medidor,
        });

        toast.success('Datos del nuevo medidor cargados correctamente');

        // Avanzar al siguiente paso si se encontró el medidor
        setCurrentStep(3);
      }
    } catch (_error) {
      toast.error('No se pudo obtener la información del nuevo medidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiarMedidorAntiguo = () => {
    setMedidorAntiguo({ acometida: '', numeroSerie: '' });
  };
  const handleCambioMedidor = async () => {
    try {
      setIsLoading(true);

      // Validaciones
      if (!detalleMedidorAntiguo.medidorId) {
        toast.error('Debe buscar y seleccionar un medidor antiguo');
        return;
      }

      if (!detalleMedidorNuevo.numero_serie) {
        toast.error('Debe configurar el nuevo medidor');
        return;
      }
      if (!valorPrimeraLectura) {
        toast.error('Debe ingresar el valor de la primera lectura');
        return;
      }

      if (!fechaPrimeraLectura) {
        toast.error('Debe ingresar la fecha de primera lectura');
        return;
      }

      if (!user?.username) {
        toast.error('No se pudo obtener la información del usuario');
        return;
      }

      // Preparar datos para la API
      const requestData = {
        medidorAntiguoID: detalleMedidorAntiguo.medidorId,
        medidorNuevoID: detalleMedidorNuevo.medidor_id,
        valorUltimo: parseFloat(detalleMedidorAntiguo.ultimaLectura) || 0,
        valorLecturaActual:
          parseFloat(detalleMedidorAntiguo.lecturaActual) || 0,
        valorPrimeraLectura: parseFloat(valorPrimeraLectura) || 0,
        acometidaCodigo: detalleMedidorAntiguo.acometidaDetalle,
        usuario: user.username,
        fechaCierre: fechaPrimeraLectura, // Usamos la misma fecha para ambos campos
        codigoContrato: codigoContrato ? parseInt(codigoContrato) : 0,
      };

      const response = await api.post(
        '/cambio-medidor-antiguo-nuevo',
        requestData
      );

      if (response.status === 200) {
        toast.success('Cambio de medidor registrado correctamente');

        // Reiniciar formularios
        setMedidorAntiguo({ acometida: '', numeroSerie: '' });
        setDetalleMedidorAntiguo({
          acometidaDetalle: '',
          constante: '',
          marca: '',
          ultimaLectura: '',
          numeroMedidor: '',
          tipo: '',
          modelo: '',
          lecturaActual: '',
          medidorId: 0,
        });
        setMedidorNuevo({ numeroSerie: '' });
        setDetalleMedidorNuevo({
          medidor_id: 0,
          tipo_medidor: '',
          constante_multiplicar: 0,
          marca: '',
          modelo: '',
          numero_serie: '',
          estado_medidor: 0,
        });
        setCodigoContrato('');
        setValorPrimeraLectura('');
        setFechaPrimeraLectura('');

        // Volver al primer paso
        setCurrentStep(1);
      } else {
        throw new Error('Error al registrar el cambio de medidor');
      }
    } catch (error: any) {
      let errorMessage = 'No se pudo registrar el cambio de medidor';

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Datos inválidos. Verifique la información ingresada';
        } else if (error.response.status === 404) {
          errorMessage = 'La ruta de la API no está disponible';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }; // Verificar si el formulario es válido para habilitar botón de cambio
  const isFormValid =
    detalleMedidorAntiguo.medidorId > 0 &&
    detalleMedidorNuevo.numero_serie !== '' &&
    valorPrimeraLectura !== '' &&
    fechaPrimeraLectura !== '';

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Función para retroceder al paso anterior
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para renderizar el paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-6'>
            <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
              <CardHeader className='bg-purple-50 dark:bg-purple-950/30 border-b border-purple-200 dark:border-purple-800'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-full'>
                    <Gauge className='h-5 w-5 text-purple-600 dark:text-purple-400' />
                  </div>
                  <div>
                    <CardTitle className='text-xl text-purple-800 dark:text-purple-200'>
                      Paso 1: Medidor Antiguo
                    </CardTitle>
                    <CardDescription>
                      Busque el medidor que será reemplazado
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <AntiguoMedidorForm
                  medidorAntiguo={medidorAntiguo}
                  isLoading={isLoading}
                  onMedidorChange={handleMedidorAntiguoChange}
                  onBuscar={handleBuscarAntiguo}
                  onLimpiar={handleLimpiarMedidorAntiguo}
                />
              </CardContent>
              <CardFooter className='flex justify-end border-t border-sky-100 dark:border-sky-900 pt-4'>
                <Button
                  onClick={nextStep}
                  disabled={!detalleMedidorAntiguo.medidorId || isLoading}
                  className='bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-sm sm:text-base py-2 sm:py-3'
                >
                  Siguiente <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 2:
        return (
          <div className='space-y-6'>
            <Card className='border-amber-200 dark:border-amber-800 shadow-md'>
              <CardHeader className='bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-amber-100 dark:bg-amber-900 rounded-full'>
                    <Gauge className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                  </div>
                  <div>
                    <CardTitle className='text-xl text-amber-800 dark:text-amber-200'>
                      Paso 2: Detalles del Medidor Antiguo
                    </CardTitle>
                    <CardDescription>
                      Revise la información del medidor a reemplazar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <DetalleMedidorAntiguoComponent
                  detalleMedidorAntiguo={detalleMedidorAntiguo}
                />
              </CardContent>
              <CardFooter className='flex justify-between border-t border-amber-100 dark:border-amber-900 pt-4'>
                <Button
                  variant='outline'
                  onClick={prevStep}
                  className='border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm sm:text-base py-2 sm:py-3'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' /> Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  className='bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-sm sm:text-base py-2 sm:py-3'
                >
                  Siguiente <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className='space-y-6'>
            <Card className='border-emerald-200 dark:border-emerald-800 shadow-md'>
              <CardHeader className='bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-emerald-100 dark:bg-emerald-900 rounded-full'>
                    <Gauge className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                  </div>
                  <div>
                    <CardTitle className='text-xl text-emerald-800 dark:text-emerald-200'>
                      Paso 3: Medidor Nuevo
                    </CardTitle>
                    <CardDescription>
                      Configure el nuevo medidor a instalar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='space-y-6'>
                  <NuevoMedidorForm
                    medidorNuevo={medidorNuevo}
                    isLoading={isLoading}
                    onMedidorChange={handleMedidorNuevoChange}
                    onBuscar={handleBuscarNuevo}
                  />

                  {detalleMedidorNuevo.numero_serie && (
                    <DetalleMedidorNuevoComponent
                      detalleMedidorNuevo={detalleMedidorNuevo}
                      onDetalleMedidorChange={handleDetalleMedidorNuevoChange}
                    />
                  )}
                </div>
              </CardContent>
              <CardFooter className='flex justify-between border-t border-emerald-100 dark:border-emerald-900 pt-4'>
                <Button
                  variant='outline'
                  onClick={prevStep}
                  className='border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm sm:text-base py-2 sm:py-3'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' /> Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!detalleMedidorNuevo.numero_serie || isLoading}
                  className='bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-sm sm:text-base py-2 sm:py-3'
                >
                  Siguiente <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className='space-y-6'>
            <Card className='border-indigo-200 dark:border-indigo-800 shadow-md'>
              <CardHeader className='bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-200 dark:border-indigo-800'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full'>
                    <FileText className='h-5 w-5 text-indigo-600 dark:text-indigo-400' />
                  </div>
                  <div>
                    <CardTitle className='text-xl text-indigo-800 dark:text-indigo-200'>
                      Paso 4: Confirmar Cambio
                    </CardTitle>
                    <CardDescription>
                      Revise y confirme el cambio de medidor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6'>
                    <Card className='border-amber-200 dark:border-amber-800'>
                      <CardHeader className='bg-amber-50 dark:bg-amber-950/30 p-3 sm:p-6'>
                        <CardTitle className='text-amber-800 dark:text-amber-200 text-base sm:text-lg'>
                          Medidor Antiguo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='pt-3 sm:pt-4 p-3 sm:p-6'>
                        <div className='space-y-2 sm:space-y-3'>
                          <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                            <span className='text-muted-foreground text-xs sm:text-sm'>
                              Acometida:
                            </span>
                            <span className='font-medium text-sm sm:text-base break-words'>
                              {detalleMedidorAntiguo.acometidaDetalle}
                            </span>
                          </div>
                          <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                            <span className='text-muted-foreground text-xs sm:text-sm'>
                              Número de Serie:
                            </span>
                            <span className='font-medium text-sm sm:text-base break-words'>
                              {detalleMedidorAntiguo.numeroMedidor}
                            </span>
                          </div>
                          <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                            <span className='text-muted-foreground text-xs sm:text-sm'>
                              Última Lectura:
                            </span>
                            <span className='font-medium text-sm sm:text-base break-words'>
                              {detalleMedidorAntiguo.ultimaLectura}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className='border-emerald-200 dark:border-emerald-800'>
                      <CardHeader className='bg-emerald-50 dark:bg-emerald-950/30 p-3 sm:p-6'>
                        <CardTitle className='text-emerald-800 dark:text-emerald-200 text-base sm:text-lg'>
                          Medidor Nuevo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='pt-3 sm:pt-4 p-3 sm:p-6'>
                        <div className='space-y-2 sm:space-y-3'>
                          <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                            <span className='text-muted-foreground text-xs sm:text-sm'>
                              Número de Serie:
                            </span>
                            <span className='font-medium text-sm sm:text-base break-words'>
                              {detalleMedidorNuevo.numero_serie}
                            </span>
                          </div>
                          <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                            <span className='text-muted-foreground text-xs sm:text-sm'>
                              Tipo de Medidor:
                            </span>
                            <span className='font-medium text-sm sm:text-base break-words'>
                              {detalleMedidorNuevo.tipo_medidor}
                            </span>
                          </div>
                          <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                            <span className='text-muted-foreground text-xs sm:text-sm'>
                              Constante:
                            </span>
                            <span className='font-medium text-sm sm:text-base break-words'>
                              {detalleMedidorNuevo.constante_multiplicar}
                            </span>
                          </div>
                          <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                            <span className='text-muted-foreground text-xs sm:text-sm'>
                              Marca:
                            </span>
                            <span className='font-medium text-sm sm:text-base break-words'>
                              {detalleMedidorNuevo.marca}
                            </span>
                          </div>
                          <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                            <span className='text-muted-foreground text-xs sm:text-sm'>
                              Modelo:
                            </span>
                            <span className='font-medium text-sm sm:text-base break-words'>
                              {detalleMedidorNuevo.modelo}
                            </span>
                          </div>
                          <div className='flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0'>
                            <span className='text-muted-foreground text-xs sm:text-sm'>
                              Estado:
                            </span>
                            <span className='font-medium text-sm sm:text-base break-words'>
                              {detalleMedidorNuevo.estado_medidor === 1
                                ? 'Activo'
                                : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>{' '}
                  </div>

                  {/* Campos adicionales para la API */}
                  <Card className='border-blue-200 dark:border-blue-800'>
                    <CardHeader className='bg-blue-50 dark:bg-blue-950/30 p-3 sm:p-6'>
                      <CardTitle className='text-blue-800 dark:text-blue-200 text-base sm:text-lg flex items-center'>
                        <FileText className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
                        Información Adicional
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-3 sm:pt-6 p-3 sm:p-6'>
                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4'>
                        <div className='space-y-1 sm:space-y-2'>
                          <Label htmlFor='valor-primera-lectura' className='text-xs sm:text-sm'>
                            Valor Primera Lectura
                          </Label>
                          <Input
                            id='valor-primera-lectura'
                            type='number'
                            step='0.01'
                            placeholder='0.00'
                            value={valorPrimeraLectura}
                            onChange={e =>
                              setValorPrimeraLectura(e.target.value)
                            }
                            className='bg-background text-sm sm:text-base h-9 sm:h-10'
                          />
                        </div>
                        <div className='space-y-1 sm:space-y-2'>
                          <Label htmlFor='fecha-primera-lectura' className='text-xs sm:text-sm'>
                            Fecha de Primera Lectura
                          </Label>
                          <Input
                            id='fecha-primera-lectura'
                            type='date'
                            value={fechaPrimeraLectura}
                            onChange={e =>
                              setFechaPrimeraLectura(e.target.value)
                            }
                            className='bg-background text-sm sm:text-base h-9 sm:h-10'
                          />
                        </div>
                        <div className='space-y-1 sm:space-y-2 lg:col-span-2'>
                          <Label htmlFor='codigo-contrato' className='text-xs sm:text-sm'>
                            Código de Contrato (Opcional)
                          </Label>
                          <Input
                            id='codigo-contrato'
                            type='number'
                            placeholder='Código del contrato'
                            value={codigoContrato}
                            onChange={e => setCodigoContrato(e.target.value)}
                            className='bg-background text-sm sm:text-base h-9 sm:h-10'
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className='flex justify-between border-t border-indigo-100 dark:border-indigo-900 pt-4'>
                <Button
                  variant='outline'
                  onClick={prevStep}
                  className='border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-sm sm:text-base py-2 sm:py-3'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' /> Anterior
                </Button>
                <Button
                  onClick={handleCambioMedidor}
                  disabled={!isFormValid || isLoading}
                  className='bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-sm sm:text-base py-2 sm:py-3'
                >
                  {isLoading ? (
                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <CheckCircle2 className='mr-2 h-4 w-4' />
                  )}
                  Confirmar Cambio
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950/30'>
      <div className='container mx-auto p-2 sm:p-4 space-y-3 sm:space-y-6'>
        {/* Modern Header */}
        <div className='flex items-center gap-2 sm:gap-3 py-2 sm:py-4 border-b border-slate-200 dark:border-slate-700'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 sm:gap-3 justify-between'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold bg-clip-text text-sky-900 dark:text-sky-100'>
                  <span className='hidden sm:inline'>Cambio Medidor</span>
                  <span className='sm:hidden'>Cambio Med.</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className='mb-4 sm:mb-8'>
          <div className='flex items-center justify-between mb-3 sm:mb-4 overflow-x-auto'>
            <div className='flex items-center min-w-0'>
              <div
                className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                  currentStep >= 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 1 ? (
                  <CheckCircle2 className='h-3 w-3 sm:h-5 sm:w-5' />
                ) : (
                  <span className='text-xs sm:text-sm'>1</span>
                )}
              </div>
              <div className='ml-1 sm:ml-2 text-xs sm:text-sm font-medium truncate'>
                <span className='hidden sm:inline'>Medidor Antiguo</span>
                <span className='sm:hidden'>Antiguo</span>
              </div>
            </div>
            <div className='flex-1 h-0.5 mx-2 sm:mx-4 bg-muted min-w-[20px]'>
              <div
                className='h-full bg-sky-600'
                style={{
                  width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                }}
              ></div>
            </div>
            <div className='flex items-center min-w-0'>
              <div
                className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                  currentStep >= 2
                    ? 'bg-amber-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 2 ? (
                  <CheckCircle2 className='h-3 w-3 sm:h-5 sm:w-5' />
                ) : (
                  <span className='text-xs sm:text-sm'>2</span>
                )}
              </div>
              <div className='ml-1 sm:ml-2 text-xs sm:text-sm font-medium truncate'>
                <span className='hidden sm:inline'>Detalles Antiguo</span>
                <span className='sm:hidden'>Detalles</span>
              </div>
            </div>
            <div className='flex-1 h-0.5 mx-2 sm:mx-4 bg-muted min-w-[20px]'>
              <div
                className='h-full bg-amber-600'
                style={{
                  width: `${((currentStep - 2) / (totalSteps - 1)) * 100}%`,
                }}
              ></div>
            </div>
            <div className='flex items-center min-w-0'>
              <div
                className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                  currentStep >= 3
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 3 ? (
                  <CheckCircle2 className='h-3 w-3 sm:h-5 sm:w-5' />
                ) : (
                  <span className='text-xs sm:text-sm'>3</span>
                )}
              </div>
              <div className='ml-1 sm:ml-2 text-xs sm:text-sm font-medium truncate'>
                <span className='hidden sm:inline'>Medidor Nuevo</span>
                <span className='sm:hidden'>Nuevo</span>
              </div>
            </div>
            <div className='flex-1 h-0.5 mx-2 sm:mx-4 bg-muted min-w-[20px]'>
              <div
                className='h-full bg-emerald-600'
                style={{
                  width: `${((currentStep - 3) / (totalSteps - 1)) * 100}%`,
                }}
              ></div>
            </div>
            <div className='flex items-center min-w-0'>
              <div
                className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                  currentStep >= 4
                    ? 'bg-indigo-600 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className='text-xs sm:text-sm'>4</span>
              </div>
              <div className='ml-1 sm:ml-2 text-xs sm:text-sm font-medium truncate'>
                <span className='hidden sm:inline'>Confirmar</span>
                <span className='sm:hidden'>Conf.</span>
              </div>
            </div>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className='h-1.5 sm:h-2' />
        </div>

        {/* Contenido del paso actual */}
        {renderStep()}
      </div>
    </div>
  );
}
