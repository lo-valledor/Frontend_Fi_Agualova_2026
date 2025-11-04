/**
 * Componente principal para Cambio de Medidor
 *
 * Funcionalidades principales:
 * - Búsqueda y visualización de medidor antiguo a reemplazar
 * - Configuración del medidor antiguo (lecturas actuales y finales)
 * - Búsqueda y configuración de medidor nuevo
 * - Registro del cambio de medidor en el sistema
 * - Flujo paso a paso (wizard) con 4 etapas
 *
 * Flujo de trabajo (4 pasos):
 * 1. **Medidor Antiguo**: Búsqueda por acometida o número de serie
 * 2. **Detalles Antiguo**: Revisión y ajuste de lecturas del medidor a reemplazar
 * 3. **Medidor Nuevo**: Búsqueda y configuración del medidor de reemplazo
 * 4. **Confirmar Cambio**: Revisión final y registro del cambio
 *
 * Arquitectura:
 * - Wizard con stepper visual (Progress + indicadores de paso)
 * - Componentes especializados para cada paso:
 *   * AntiguoMedidorForm: Formulario de búsqueda medidor antiguo
 *   * DetalleMedidorAntiguoComponent: Detalles y lecturas del medidor antiguo
 *   * NuevoMedidorForm: Formulario de búsqueda medidor nuevo
 *   * DetalleMedidorNuevoComponent: Detalles del medidor nuevo
 * - Estados locales para cada tipo de medidor
 * - Validaciones en cada paso antes de avanzar
 * - API calls para consultas y registro final
 *
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/cambio-medidor.tsx
 * export default function CambioMedidorRoute() {
 *   return <CambioMedidorComponent />;
 * }
 * ```
 */
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Gauge,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

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
import { useAuth } from '~/context/AuthContext';
import api from '~/lib/api';
import {
  type ConsultaMedidorAntiguoResponse,
  type ConsultaMedidorNuevoResponse,
  type DetalleMedidorAntiguo,
  type DetalleMedidorNuevo,
  type MedidorAntiguo,
  type MedidorNuevo
} from '~/types/operaciones';

import AntiguoMedidorForm from './antiguo-medidor-form';
import DetalleMedidorAntiguoComponent from './detalle-medidor-antiguo';
import DetalleMedidorNuevoComponent from './detalle-medidor-nuevo';
import NuevoMedidorForm from './nuevo-medidor-form';

export default function CambioMedidorComponent() {
  const { user, canEdit } = useAuth();

  // Permisos
  const route = '/dashboard/operaciones/cambio-medidor';
  const hasEditPermission = canEdit(route);

  // Estados para medidor antiguo
  const [medidorAntiguo, setMedidorAntiguo] = useState<MedidorAntiguo>({
    acometida: '',
    numeroSerie: ''
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
      medidorId: 0
    });

  // Estados para nuevo medidor
  const [medidorNuevo, setMedidorNuevo] = useState<MedidorNuevo>({
    numeroSerie: ''
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
      estado_medidor: 0
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
      [id === 'acometida' ? 'acometida' : 'numeroSerie']: value
    }));
  };

  const handleMedidorNuevoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMedidorNuevo({
      numeroSerie: e.target.value
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
        numero_serie: value
      }));
    } else if (id === 'nueva-constante') {
      setDetalleMedidorNuevo(prev => ({
        ...prev,
        constante_multiplicar: parseFloat(value) || 0
      }));
    } else if (id === 'nueva-marca') {
      setDetalleMedidorNuevo(prev => ({
        ...prev,
        marca: value
      }));
    } else if (id === 'nuevo-tipo') {
      setDetalleMedidorNuevo(prev => ({
        ...prev,
        tipo_medidor: value
      }));
    } else if (id === 'nuevo-modelo') {
      setDetalleMedidorNuevo(prev => ({
        ...prev,
        modelo: value
      }));
    }
  };

  const handleUltimaLecturaChange = (value: string) => {
    setDetalleMedidorAntiguo(prev => ({
      ...prev,
      ultimaLectura: value
    }));
  };

  const handleLecturaActualChange = (value: string) => {
    setDetalleMedidorAntiguo(prev => ({
      ...prev,
      lecturaActual: value
    }));
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
          medidorId: data.medidor_id
        });

        toast.success('Datos del medidor cargados correctamente');

        // Avanzar al siguiente paso si se encontró el medidor
        if (data.medidor_id) {
          setCurrentStep(2);
        }
      }
    } catch (error) {
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
          numeroSerie: medidorNuevo.numeroSerie
        }
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
          estado_medidor: data.estado_medidor
        });

        toast.success('Datos del nuevo medidor cargados correctamente');

        // Avanzar al siguiente paso si se encontró el medidor
        setCurrentStep(3);
      }
    } catch (error) {
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
        codigoContrato: codigoContrato ? parseInt(codigoContrato) : 0
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
          medidorId: 0
        });
        setMedidorNuevo({ numeroSerie: '' });
        setDetalleMedidorNuevo({
          medidor_id: 0,
          tipo_medidor: '',
          constante_multiplicar: 0,
          marca: '',
          modelo: '',
          numero_serie: '',
          estado_medidor: 0
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
          <div className='space-y-4'>
            <Card className='border-border'>
              <CardHeader className='bg-background border-b border-border'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-sky-100 dark:bg-sky-900 rounded-xl'>
                    <Gauge className='h-5 w-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>
                      Paso 1: Medidor Antiguo
                    </CardTitle>
                    <CardDescription className=''>
                      Busque el medidor que será reemplazado
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-3'>
                <AntiguoMedidorForm
                  medidorAntiguo={medidorAntiguo}
                  isLoading={isLoading}
                  onMedidorChange={handleMedidorAntiguoChange}
                  onBuscar={handleBuscarAntiguo}
                  onLimpiar={handleLimpiarMedidorAntiguo}
                  disabled={!hasEditPermission}
                />
              </CardContent>
              <CardFooter className='flex justify-end border-t border-border p-3'>
                <Button
                  onClick={nextStep}
                  disabled={!detalleMedidorAntiguo.medidorId || isLoading}
                  className='bg-primary hover:bg-primary/90'
                >
                  Siguiente <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 2:
        return (
          <div className='space-y-4'>
            <Card className='border-border'>
              <CardHeader className='bg-background border-b border-border'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-primary/10 rounded-xl'>
                    <Gauge className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>
                      Paso 2: Detalles del Medidor Antiguo
                    </CardTitle>
                    <CardDescription className=''>
                      Revise la información del medidor a reemplazar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-3'>
                <DetalleMedidorAntiguoComponent
                  detalleMedidorAntiguo={detalleMedidorAntiguo}
                  onUltimaLecturaChange={handleUltimaLecturaChange}
                  onLecturaActualChange={handleLecturaActualChange}
                />
              </CardContent>
              <CardFooter className='flex justify-between border-t border-border p-3'>
                <Button
                  variant='outline'
                  onClick={prevStep}
                  className='border-border'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' /> Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  className='bg-primary hover:bg-primary/90'
                >
                  Siguiente <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 3:
        return (
          <div className='space-y-4'>
            <Card className='border-border'>
              <CardHeader className='bg-background border-b border-border'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-primary/10 rounded-xl'>
                    <Gauge className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>
                      Paso 3: Medidor Nuevo
                    </CardTitle>
                    <CardDescription className=''>
                      Configure el nuevo medidor a instalar
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-3'>
                <div className='space-y-4'>
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
              <CardFooter className='flex justify-between border-t border-border p-3'>
                <Button
                  variant='outline'
                  onClick={prevStep}
                  className='border-border'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' /> Anterior
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!detalleMedidorNuevo.numero_serie || isLoading}
                  className='bg-primary hover:bg-primary/90'
                >
                  Siguiente <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      case 4:
        return (
          <div className='space-y-4'>
            <Card className='border-border'>
              <CardHeader className='bg-background border-b border-border'>
                <div className='flex items-center gap-3'>
                  <div className='p-2 bg-primary/10 rounded-xl'>
                    <FileText className='h-5 w-5 text-primary' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>
                      Paso 4: Confirmar Cambio
                    </CardTitle>
                    <CardDescription className=''>
                      Revise y confirme el cambio de medidor
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='p-3'>
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    <Card className='border-border'>
                      <CardHeader className='bg-background p-3'>
                        <CardTitle className='text-base'>
                          Medidor Antiguo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='p-3'>
                        <div className='space-y-3'>
                          <div className='flex justify-between'>
                            <span className='text-sm'>Acometida:</span>
                            <span className='font-medium text-sm'>
                              {detalleMedidorAntiguo.acometidaDetalle}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm'>Número de Serie:</span>
                            <span className='font-medium text-sm'>
                              {detalleMedidorAntiguo.numeroMedidor}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm'>Última Lectura:</span>
                            <span className='font-medium text-sm'>
                              {detalleMedidorAntiguo.ultimaLectura}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className='border-border'>
                      <CardHeader className='bg-background p-3'>
                        <CardTitle className='text-base'>
                          Medidor Nuevo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='p-3'>
                        <div className='space-y-3'>
                          <div className='flex justify-between'>
                            <span className='text-sm'>Número de Serie:</span>
                            <span className='font-medium text-sm'>
                              {detalleMedidorNuevo.numero_serie}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm'>Tipo de Medidor:</span>
                            <span className='font-medium text-sm'>
                              {detalleMedidorNuevo.tipo_medidor}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm'>Constante:</span>
                            <span className='font-medium text-sm'>
                              {detalleMedidorNuevo.constante_multiplicar}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm'>Marca:</span>
                            <span className='font-medium text-sm'>
                              {detalleMedidorNuevo.marca}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm'>Modelo:</span>
                            <span className='font-medium text-sm'>
                              {detalleMedidorNuevo.modelo}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-sm'>Estado:</span>
                            <span className='font-medium text-sm'>
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
                  <Card className='border-border'>
                    <CardHeader className='bg-background p-3'>
                      <CardTitle className='text-base flex items-center'>
                        <FileText className='mr-2 h-4 w-4' />
                        Información Adicional
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='p-3'>
                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='valor-primera-lectura'
                            className='text-sm'
                          >
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
                            className='bg-background'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label
                            htmlFor='fecha-primera-lectura'
                            className='text-sm'
                          >
                            Fecha de Primera Lectura
                          </Label>
                          <Input
                            id='fecha-primera-lectura'
                            type='date'
                            value={fechaPrimeraLectura}
                            onChange={e =>
                              setFechaPrimeraLectura(e.target.value)
                            }
                            className='bg-background'
                          />
                        </div>
                        <div className='space-y-2 lg:col-span-2'>
                          <Label htmlFor='codigo-contrato' className='text-sm'>
                            Código de Contrato (Opcional)
                          </Label>
                          <Input
                            id='codigo-contrato'
                            type='number'
                            placeholder='Código del contrato'
                            value={codigoContrato}
                            onChange={e => setCodigoContrato(e.target.value)}
                            className='bg-background'
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
              <CardFooter className='flex justify-between border-t border-border p-3'>
                <Button
                  variant='outline'
                  onClick={prevStep}
                  className='border-border'
                >
                  <ArrowLeft className='mr-2 h-4 w-4' /> Anterior
                </Button>
                <Button
                  onClick={handleCambioMedidor}
                  disabled={!isFormValid || isLoading || !hasEditPermission}
                  className='bg-primary hover:bg-primary/90'
                  title={
                    !hasEditPermission
                      ? 'No tiene permisos para ejecutar cambios de medidor'
                      : ''
                  }
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
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Cambio Medidor'
          description='Gestión de cambio de medidores por medidores nuevos'
        />

        {/* Stepper */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4 overflow-x-auto'>
            <div className='flex items-center min-w-0'>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 1 ? (
                  <CheckCircle2 className='h-4 w-4' />
                ) : (
                  <span className='text-sm'>1</span>
                )}
              </div>
              <div className='ml-2 text-sm font-medium'>Medidor Antiguo</div>
            </div>
            <div className='flex-1 h-0.5 mx-4 bg-border'>
              <div
                className='h-full bg-primary'
                style={{
                  width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
                }}
              ></div>
            </div>
            <div className='flex items-center min-w-0'>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 2 ? (
                  <CheckCircle2 className='h-4 w-4' />
                ) : (
                  <span className='text-sm'>2</span>
                )}
              </div>
              <div className='ml-2 text-sm font-medium'>Detalles</div>
            </div>
            <div className='flex-1 h-0.5 mx-4 bg-border'>
              <div
                className='h-full bg-primary'
                style={{
                  width: `${((currentStep - 2) / (totalSteps - 1)) * 100}%`
                }}
              ></div>
            </div>
            <div className='flex items-center min-w-0'>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 3
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > 3 ? (
                  <CheckCircle2 className='h-4 w-4' />
                ) : (
                  <span className='text-sm'>3</span>
                )}
              </div>
              <div className='ml-2 text-sm font-medium'>Medidor Nuevo</div>
            </div>
            <div className='flex-1 h-0.5 mx-4 bg-border'>
              <div
                className='h-full bg-primary'
                style={{
                  width: `${((currentStep - 3) / (totalSteps - 1)) * 100}%`
                }}
              ></div>
            </div>
            <div className='flex items-center min-w-0'>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 4
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className='text-sm'>4</span>
              </div>
              <div className='ml-2 text-sm font-medium'>Confirmar</div>
            </div>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className='h-2' />
        </div>

        {/* Contenido del paso actual */}
        {renderStep()}
      </div>
    </div>
  );
}
