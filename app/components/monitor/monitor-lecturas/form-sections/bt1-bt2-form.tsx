import { AlertCircle, Calculator, Check, Gauge, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useClaves } from '~/hooks/use-claves';
import api from '~/lib/api';
import type { FormDataBT1y2, MedidorNichoItem } from '~/types/monitor';

import { ConfirmationDialog } from '../dialogs/confirmation-dialog';

interface BT1BT2FormProps {
  result: MedidorNichoItem;
  onSuccess?: () => void;
}

export function BT1BT2Form({ result, onSuccess }: Readonly<BT1BT2FormProps>) {
  // Hook para manejar claves dinámicamente
  const {
    getClavesForGroup,
    getClaveCorrectaId,
    isLoading: clavesLoading,
    error: clavesError
  } = useClaves();

  // Valores fijos del medidor
  const digito = useMemo(() => result.ME_Digitos, [result.ME_Digitos]);
  const valorAnterior = useMemo(
    () => result.LM_ValorUltimaLectura,
    [result.LM_ValorUltimaLectura]
  );
  const constante = useMemo(
    () => result.ME_ConstanteMultiplicar,
    [result.ME_ConstanteMultiplicar]
  );

  // Estado del formulario
  const [inputValue, setInputValue] = useState('');
  const [consumoCalculado, setConsumoCalculado] = useState('');
  const [tipoLectura, setTipoLectura] = useState<
    'menor' | 'igual' | 'mayor' | null
  >(null);
  const [selectedClave, setSelectedClave] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  // Diálogos
  const [showMenorDialog, setShowMenorDialog] = useState(false);
  const [showIgualDialog, setShowIgualDialog] = useState(false);
  const [showMayorDialog, setShowMayorDialog] = useState(false);
  const [showConsumoExcesivoDialog, setShowConsumoExcesivoDialog] =
    useState(false);
  const confirmed = useRef(false);

  // Validar que la lectura no exceda el número de dígitos del medidor
  const validarDigitos = useCallback(
    (value: string) => {
      if (!value || isNaN(Number(value))) return false;

      const valorNumerico = parseInt(value);
      const maxValue = Math.pow(10, digito) - 1; // 10^digitos - 1

      return valorNumerico <= maxValue;
    },
    [digito]
  );

  // Calcular el máximo valor permitido para mostrar al usuario
  const maxValuePermitido = useMemo(() => {
    return Math.pow(10, digito) - 1;
  }, [digito]);

  // Función estable para calcular el consumo
  const calcularConsumo = useCallback(
    (value: string) => {
      if (!value || isNaN(Number(value))) {
        return { consumo: '', tipo: null, vlecturadigitos: 0 };
      }

      const valorActual = parseInt(value);
      let vlecturadigitos = valorActual;
      let tipo: 'menor' | 'igual' | 'mayor' | null = null;

      if (valorActual < valorAnterior) {
        tipo = 'menor';
        switch (digito) {
          case 1:
            vlecturadigitos = valorActual;
            break;
          case 4:
            vlecturadigitos = valorActual + 10000;
            break;
          case 5:
            vlecturadigitos = valorActual + 100000;
            break;
          case 6:
            vlecturadigitos = valorActual + 1000000;
            break;
          case 7:
            vlecturadigitos = valorActual + 10000000;
            break;
          case 8:
            vlecturadigitos = valorActual + 100000000;
            break;
          case 10:
            vlecturadigitos = valorActual + 10000000000;
            break;
        }
      } else if (valorActual === valorAnterior) {
        tipo = 'igual';
        vlecturadigitos = valorActual;
      } else {
        tipo = 'mayor';
        vlecturadigitos = valorActual;
      }

      const consumo =
        tipo === 'menor'
          ? (vlecturadigitos - valorAnterior) * constante
          : (valorActual - valorAnterior) * constante;

      return {
        consumo: consumo.toString(),
        tipo,
        vlecturadigitos
      };
    },
    [digito, valorAnterior, constante]
  );

  // Pre-cargar datos existentes si los hay (incluye datos importados)
  useEffect(() => {
    // Verificar si hay datos de energía activa (puede ser de lectura ingresada o importada)
    const energiaActiva = result.LMC_EnergiaActiva;

    // Si existe un valor de energía activa válido (mayor o igual a 0)
    if (
      energiaActiva !== undefined &&
      energiaActiva !== null &&
      energiaActiva >= 0
    ) {
      const lecturaActual = energiaActiva.toString();
      setInputValue(lecturaActual);

      // Calcular el consumo con los datos existentes
      const resultado = calcularConsumo(lecturaActual);
      setConsumoCalculado(resultado.consumo);
      setTipoLectura(resultado.tipo);

      // Marcar como validado solo si tiene fecha de lectura (ya fue guardado)
      // Si NO tiene fecha, es un dato importado pendiente de guardar
      if (result.LM_FechaLectura) {
        setIsValidated(true);
      }
    }
  }, [result, calcularConsumo]);

  // Actualizar el consumo cuando cambia el input
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Si el valor está vacío, permitir
      if (value === '') {
        setInputValue(value);
        setConsumoCalculado('');
        setTipoLectura(null);
        setIsValidated(false);
        return;
      }
      // Validar que sea numérico
      if (isNaN(Number(value))) {
        toast.error('Solo se permiten valores numéricos');
        return;
      }
      // Validar que no sea menor a 0 (excepto 0)
      if (Number(value) < 0) {
        toast.error('No se permiten valores negativos');
        return;
      }
      // Validar número de dígitos
      if (!validarDigitos(value)) {
        toast.error(
          `La lectura no puede exceder ${maxValuePermitido.toLocaleString('es-CL')} (${digito} dígitos máximo)`
        );
        return;
      }
      setInputValue(value);
      if (value && !isNaN(Number(value))) {
        const resultado = calcularConsumo(value);
        setConsumoCalculado(resultado.consumo);
        setTipoLectura(resultado.tipo);
        setIsValidated(false); // Resetear validación cuando cambia el input
      } else {
        setConsumoCalculado('');
        setTipoLectura(null);
        setIsValidated(false);
      }
    },
    [calcularConsumo, validarDigitos, maxValuePermitido, digito]
  );

  // Detectar consumos anómalos (muy altos o negativos con muchos 9s)
  const detectarConsumoAnomalo = useCallback(() => {
    const consumoActual = Number(consumoCalculado);

    // Caso 1: Detectar consumo con muchos 9s (probable error de decimal truncado)
    const consumoStr = consumoCalculado.toString();
    const countNines = (consumoStr.match(/9/g) || []).length;
    const esPatronDe9s = countNines >= 4 && consumoStr.length >= 5;

    // Caso 2: Consumo negativo aparente (valor muy alto por rollover incorrecto)
    const maxConsumoEsperado = Math.pow(10, digito) * constante;
    const esRolloverIncorrecto = consumoActual > maxConsumoEsperado * 0.8;

    // Caso 3: Detectar si el consumo es excesivamente alto comparado con histórico
    const consumoAnterior = result.LM_ConsumoMesAnterior || 0;
    const umbralBase =
      Number(consumoAnterior) > 0 ? Number(consumoAnterior) : 500;
    const factorMultiplicador = 3;
    const umbralMaximo = Math.max(umbralBase * factorMultiplicador, 2000);
    const esConsumoExcesivo = consumoActual > umbralMaximo;

    return {
      esAnomalo: esPatronDe9s || esRolloverIncorrecto || esConsumoExcesivo,
      tipo: esPatronDe9s
        ? 'decimal_truncado'
        : esRolloverIncorrecto
          ? 'rollover_incorrecto'
          : 'excesivo',
      mensaje: esPatronDe9s
        ? '⚠️ El consumo calculado contiene muchos "9s" consecutivos. Esto puede indicar un error en los decimales de la lectura importada.'
        : esRolloverIncorrecto
          ? '⚠️ El consumo calculado es anormalmente alto. Verifique que los valores de lectura anterior y actual sean correctos.'
          : '⚠️ El consumo calculado es significativamente mayor al histórico. Verifique los valores ingresados.'
    };
  }, [consumoCalculado, result.LM_ConsumoMesAnterior, digito, constante]);

  // Validar la lectura
  const validarLectura = useCallback(() => {
    if (!inputValue || isNaN(Number(inputValue))) {
      toast.error('Por favor ingrese un valor numérico válido');
      return;
    }

    // Validar dígitos una vez más antes de continuar
    if (!validarDigitos(inputValue)) {
      toast.error(
        `La lectura no puede exceder ${maxValuePermitido.toLocaleString('es-CL')} (${digito} dígitos máximo)`
      );
      return;
    }

    // Detectar consumos anómalos antes de continuar
    const anomalia = detectarConsumoAnomalo();
    if (anomalia.esAnomalo) {
      setShowConsumoExcesivoDialog(true);
      return;
    }

    if (tipoLectura === 'menor') {
      setShowMenorDialog(true);
    } else if (tipoLectura === 'igual') {
      setShowIgualDialog(true);
    } else if (tipoLectura === 'mayor') {
      setShowMayorDialog(true);
    } else {
      toast.error('Por favor ingrese un valor válido');
    }
  }, [
    inputValue,
    tipoLectura,
    validarDigitos,
    maxValuePermitido,
    digito,
    detectarConsumoAnomalo
  ]);

  // Preparar datos para enviar
  const prepararDatosFormulario = useCallback(() => {
    if (!inputValue || !consumoCalculado) return null;

    const data: FormDataBT1y2 = {
      lmid: result.LM_ID.toString(),
      vactual: inputValue,
      consumo: consumoCalculado,
      claid: ''
    };

    if (tipoLectura === 'mayor') {
      // Usar clave dinámica para lectura correcta
      data.claid = getClaveCorrectaId();
    } else if (selectedClave !== '0') {
      data.claid = selectedClave;
    } else {
      return null;
    }

    return data;
  }, [
    inputValue,
    consumoCalculado,
    result.LM_ID,
    tipoLectura,
    selectedClave,
    getClaveCorrectaId
  ]);

  // Confirmar tipo de lectura y registrar la clave seleccionada
  const handleConfirmLectura = useCallback(
    (tipo: 'menor' | 'igual') => {
      if (selectedClave === '0') {
        toast.info('Debe seleccionar una clave');
        return;
      }
      confirmed.current = true;

      // Cerrar el diálogo correspondiente
      if (tipo === 'menor') {
        setShowMenorDialog(false);
      } else if (tipo === 'igual') {
        setShowIgualDialog(false);
      }

      // Marcar como validado
      setIsValidated(true);
      toast.success('Lectura validada correctamente');
    },
    [selectedClave, result.ME_NSerie]
  );

  // Confirmar lectura mayor
  const handleConfirmMayor = useCallback(() => {
    setShowMayorDialog(false);
    setIsValidated(true);
    toast.success('Lectura validada correctamente');
  }, [result.ME_NSerie]);

  // Confirmar consumo excesivo y continuar con validación normal
  const handleConfirmConsumoExcesivo = useCallback(() => {
    setShowConsumoExcesivoDialog(false);

    // Continuar con la validación normal según el tipo de lectura
    if (tipoLectura === 'menor') {
      setShowMenorDialog(true);
    } else if (tipoLectura === 'igual') {
      setShowIgualDialog(true);
    } else if (tipoLectura === 'mayor') {
      setShowMayorDialog(true);
    }
  }, [result.ME_NSerie, consumoCalculado, tipoLectura]);

  // Guardar la lectura
  const guardarLectura = useCallback(async () => {
    const data = prepararDatosFormulario();

    if (!data) {
      toast.error(
        'No se pueden guardar los datos. Por favor valide la lectura primero.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.put('/actualizar-lectura-bt-1-bt-2', data);

      if (response.status === 200) {
        toast.success('Lectura actualizada correctamente');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error('Error al actualizar la lectura');
      }
    } catch (error: any) {
      toast.error(
        `Error al conectar con el servidor: ${
          error.message || 'Error desconocido'
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [prepararDatosFormulario, onSuccess, result.ME_NSerie]);

  // Opciones de claves dinámicas basadas en los grupos
  const clavesMenorOptions = useMemo(() => {
    if (clavesLoading) {
      return [{ value: '0', label: 'Cargando claves...' }];
    }
    if (clavesError) {
      return [
        { value: '0', label: 'Seleccione' },
        { value: '1', label: 'CSCR - CONSUMO SUPERA CRITERIO DE RANGO' },
        { value: '19', label: 'MRST - MEDIDOR REINICIO LECTURA' }
      ];
    }
    return getClavesForGroup('100');
  }, [getClavesForGroup, clavesLoading, clavesError]);

  const clavesIgualOptions = useMemo(() => {
    if (clavesLoading) {
      return [{ value: '0', label: 'Cargando claves...' }];
    }
    if (clavesError) {
      return [
        { value: '0', label: 'Seleccione' },
        { value: '3', label: 'RCER - LOCAL CERRADO' },
        { value: '5', label: 'LENR - LECTURA NO REALIZADA' },
        { value: '15', label: 'MCRT - MEDIDOR CORTADO' },
        { value: '25', label: 'SCSM - MEDIDOR NO REGISTRA CONSUMO' }
      ];
    }
    return getClavesForGroup('200');
  }, [getClavesForGroup, clavesLoading, clavesError]);

  return (
    <div className='space-y-3'>
      <Card className='border-0 shadow-none bg-transparent'>
        <CardHeader className='px-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-foreground text-sm font-medium'>
            <div className='h-5 w-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
              <Gauge className='h-3 w-3 ' />
            </div>
            <span>Lectura BT-1/BT-2</span>
            <div className='text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded'>
              {digito} dígitos
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0 space-y-3'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-muted-foreground flex items-center gap-1.5'>
                <Gauge className='h-3 w-3' />
                Lectura Actual
              </Label>
              <Input
                placeholder={valorAnterior.toString()}
                value={inputValue}
                onChange={handleInputChange}
                max={maxValuePermitido}
                className='h-8 font-mono text-sm'
              />
              <div className='text-xs text-muted-foreground'>
                Máx: {maxValuePermitido.toLocaleString('es-CL')}
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-muted-foreground flex items-center gap-1.5'>
                <Calculator className='h-3 w-3' />
                Consumo kWh
              </Label>
              <div className='h-8 px-3 flex items-center bg-muted/50 border rounded-md text-sm font-mono'>
                {consumoCalculado || '0'}
              </div>
              <div className='text-xs text-muted-foreground'>
                Ant: {result.LM_ConsumoMesAnterior?.toLocaleString() || '0'}
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-muted-foreground'>
                &nbsp;
              </Label>
              <Button
                variant='outline'
                onClick={validarLectura}
                disabled={!inputValue || isSubmitting || isValidated}
                className='w-full h-8 text-xs'
              >
                {isValidated ? (
                  <>
                    <Check className='h-3 w-3 mr-1.5' />
                    Validado
                  </>
                ) : (
                  'Validar'
                )}
              </Button>
              <div className='text-xs text-transparent'>&nbsp;</div>
            </div>
          </div>

          {/* Estados y alertas compactas */}
          <div className='space-y-2'>
            {clavesError && (
              <div className='flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded'>
                <AlertCircle className='h-3 w-3' />
                Error cargando claves: usando valores por defecto
              </div>
            )}

            {(() => {
              const anomalia = detectarConsumoAnomalo();
              if (anomalia.esAnomalo && consumoCalculado) {
                return (
                  <div className='flex items-start gap-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0 mt-0.5' />
                    <div className='flex-1'>
                      <div className='font-semibold mb-1'>
                        Consumo anómalo detectado
                      </div>
                      <div className='text-xs leading-relaxed'>
                        {anomalia.tipo === 'decimal_truncado'
                          ? 'El consumo contiene patrón de 9s (posible error de decimales en importación). Verifique la lectura antes de validar.'
                          : anomalia.tipo === 'rollover_incorrecto'
                            ? 'Consumo anormalmente alto. Verifique que los valores sean correctos.'
                            : 'El consumo supera significativamente el promedio histórico.'}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {Number(consumoCalculado) < 0 && (
              <div className='flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded'>
                <AlertCircle className='h-3 w-3' />
                Consumo negativo - Verifique la lectura
              </div>
            )}

            {Number(consumoCalculado) === 0 && inputValue && (
              <div className='flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2 py-1 rounded'>
                <AlertCircle className='h-3 w-3' />
                Consumo cero - Verifique la lectura
              </div>
            )}

            {isValidated && (
              <div className='flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded'>
                <Check className='h-3 w-3' />
                Lectura validada - Puede guardar
              </div>
            )}
          </div>

          {/* Botón Guardar */}
          <div className='flex justify-end'>
            <Button
              onClick={guardarLectura}
              disabled={!isValidated || isSubmitting}
              className='px-4 h-8 text-xs'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-1.5 h-3 w-3 animate-spin' />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className='mr-1.5 h-3 w-3' />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogos de confirmación */}
      <ConfirmationDialog
        isOpen={showMenorDialog}
        onOpenChange={open => {
          if (!open) {
            if (confirmed.current) {
              confirmed.current = false;
            } else {
              setSelectedClave('0');
            }
          }
          setShowMenorDialog(open);
        }}
        title='Confirmar lectura menor'
        message='La lectura ingresada es menor que la anterior. Por favor seleccione un motivo.'
        variant='default'
        alertColor='yellow'
        showClaveSelect={true}
        claveOptions={clavesMenorOptions}
        selectedClave={selectedClave}
        onClaveChange={setSelectedClave}
        onConfirm={() => handleConfirmLectura('menor')}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showIgualDialog}
        onOpenChange={open => {
          if (!open) {
            if (confirmed.current) {
              confirmed.current = false;
            } else {
              setSelectedClave('0');
            }
          }
          setShowIgualDialog(open);
        }}
        title='Confirmación de Lectura'
        message='¿Está seguro de que la lectura es igual al mes anterior?'
        alertColor='yellow'
        claveOptions={clavesIgualOptions}
        selectedClave={selectedClave}
        onClaveChange={setSelectedClave}
        showClaveSelect={true}
        onConfirm={() => handleConfirmLectura('igual')}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showMayorDialog}
        onOpenChange={setShowMayorDialog}
        title='Confirmación de Lectura'
        message='¿Está seguro de que la lectura es correcta?'
        alertColor='blue'
        onConfirm={handleConfirmMayor}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showConsumoExcesivoDialog}
        onOpenChange={setShowConsumoExcesivoDialog}
        title='⚠️ Consumo Anómalo Detectado'
        message={(() => {
          const anomalia = detectarConsumoAnomalo();
          const consumoFormateado =
            Number(consumoCalculado).toLocaleString('es-CL');
          const consumoAnteriorFormateado = (
            result.LM_ConsumoMesAnterior || 0
          ).toLocaleString('es-CL');

          return `${anomalia.mensaje}

Consumo calculado: ${consumoFormateado} kWh
Consumo anterior: ${consumoAnteriorFormateado} kWh
Lectura actual: ${inputValue}
Lectura anterior: ${valorAnterior}

${
  anomalia.tipo === 'decimal_truncado'
    ? '💡 Sugerencia: Si esta lectura fue importada, verifique que los valores con decimales estén correctos. Los decimales pueden haberse perdido durante la importación.'
    : '💡 Sugerencia: Verifique los valores de lectura anterior y actual antes de continuar.'
}

¿Desea continuar de todas formas?`;
        })()}
        alertColor='red'
        onConfirm={handleConfirmConsumoExcesivo}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
