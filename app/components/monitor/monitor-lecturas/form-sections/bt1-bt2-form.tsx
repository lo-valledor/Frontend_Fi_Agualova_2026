import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { AlertCircle, Gauge, Calculator, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { FormDataBT1y2, MedidorNichoItem } from '~/types/monitor';
import { ConfirmationDialog } from '../dialogs/confirmation-dialog';
import api from '~/lib/api';
import { useActivityEvent } from '~/components/activity-tracker-hoc';

interface BT1BT2FormProps {
  result: MedidorNichoItem;
  onSuccess?: () => void;
}

export function BT1BT2Form({ result, onSuccess }: BT1BT2FormProps) {
  // Valores fijos del medidor
  const digito = useMemo(() => result.ME_Digitos, [result.ME_Digitos]);
  const valorAnterior = useMemo(
    () => result.LM_ValorUltimaLectura,
    [result.LM_ValorUltimaLectura],
  );
  const constante = useMemo(
    () => result.ME_ConstanteMultiplicar,
    [result.ME_ConstanteMultiplicar],
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
  const { trackDataAction } = useActivityEvent();

  // Diálogos
  const [showMenorDialog, setShowMenorDialog] = useState(false);
  const [showIgualDialog, setShowIgualDialog] = useState(false);
  const [showMayorDialog, setShowMayorDialog] = useState(false);
  const confirmed = useRef(false);

  // Validar que la lectura no exceda el número de dígitos del medidor
  const validarDigitos = useCallback(
    (value: string) => {
      if (!value || isNaN(Number(value))) return false;

      const valorNumerico = parseInt(value);
      const maxValue = Math.pow(10, digito) - 1; // 10^digitos - 1

      return valorNumerico <= maxValue;
    },
    [digito],
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
        vlecturadigitos,
      };
    },
    [digito, valorAnterior, constante],
  );

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
          `La lectura no puede exceder ${maxValuePermitido.toLocaleString('es-CL')} (${digito} dígitos máximo)`,
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
    [calcularConsumo, validarDigitos, maxValuePermitido, digito],
  );

  // Validar la lectura
  const validarLectura = useCallback(() => {
    if (!inputValue || isNaN(Number(inputValue))) {
      toast.error('Por favor ingrese un valor numérico válido');
      return;
    }

    // Validar dígitos una vez más antes de continuar
    if (!validarDigitos(inputValue)) {
      toast.error(
        `La lectura no puede exceder ${maxValuePermitido.toLocaleString('es-CL')} (${digito} dígitos máximo)`,
      );
      return;
    }

    trackDataAction('Validar lectura', 'BT1-BT2 Form', `Medidor: ${result.ME_NSerie}, Valor: ${inputValue}, Tipo: ${tipoLectura}`);

    if (tipoLectura === 'menor') {
      setShowMenorDialog(true);
    } else if (tipoLectura === 'igual') {
      setShowIgualDialog(true);
    } else if (tipoLectura === 'mayor') {
      setShowMayorDialog(true);
    } else {
      toast.error('Por favor ingrese un valor válido');
    }
  }, [inputValue, tipoLectura, validarDigitos, maxValuePermitido, digito, trackDataAction, result.ME_NSerie]);

  // Preparar datos para enviar
  const prepararDatosFormulario = useCallback(() => {
    if (!inputValue || !consumoCalculado) return null;

    const data: FormDataBT1y2 = {
      lmid: result.LM_ID.toString(),
      vactual: inputValue,
      consumo: consumoCalculado,
      claid: '',
    };

    if (tipoLectura === 'mayor') {
      data.claid = '23';
    } else if (selectedClave !== '0') {
      data.claid = selectedClave;
    } else {
      return null;
    }

    return data;
  }, [inputValue, consumoCalculado, result.LM_ID, tipoLectura, selectedClave]);

  // Confirmar tipo de lectura y registrar la clave seleccionada
  const handleConfirmLectura = useCallback(
    (tipo: 'menor' | 'igual') => {
      if (selectedClave === '0') {
        toast.info('Debe seleccionar una clave');
        return;
      }
      confirmed.current = true;

      trackDataAction('Confirmar lectura', 'BT1-BT2 Form', `Medidor: ${result.ME_NSerie}, Tipo: ${tipo}, Clave: ${selectedClave}`);

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
    [selectedClave, trackDataAction, result.ME_NSerie],
  );

  // Confirmar lectura mayor
  const handleConfirmMayor = useCallback(() => {
    trackDataAction('Confirmar lectura', 'BT1-BT2 Form', `Medidor: ${result.ME_NSerie}, Tipo: mayor`);
    setShowMayorDialog(false);
    setIsValidated(true);
    toast.success('Lectura validada correctamente');
  }, [trackDataAction, result.ME_NSerie]);

  // Guardar la lectura
  const guardarLectura = useCallback(async () => {
    const data = prepararDatosFormulario();

    if (!data) {
      toast.error(
        'No se pueden guardar los datos. Por favor valide la lectura primero.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      trackDataAction('Guardar lectura', 'BT1-BT2 Form', `Medidor: ${result.ME_NSerie}, Valor: ${data.vactual}, Consumo: ${data.consumo}`);
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
      console.error('Error al enviar los datos:', error);
      toast.error(
        `Error al conectar con el servidor: ${
          error.message || 'Error desconocido'
        }`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [prepararDatosFormulario, onSuccess, trackDataAction, result.ME_NSerie]);

  const clavesMenorOptions = useMemo(
    () => [
      { value: '0', label: 'Seleccione' },
      { value: '1', label: 'CSCR - CONSUMO SUPERA CRITERIO DE RANGO' },
      { value: '19', label: 'MRST - MEDIDOR REINICIO LECTURA' },
    ],
    [],
  );

  const clavesIgualOptions = useMemo(
    () => [
      { value: '0', label: 'Seleccione' },
      { value: '3', label: 'RCER - LOCAL CERRADO' },
      { value: '5', label: 'LENR - LECTURA NO REALIZADA' },
      { value: '15', label: 'MCRT - MEDIDOR CORTADO' },
      { value: '25', label: 'SCSM - MEDIDOR NO REGISTRA CONSUMO' },
    ],
    [],
  );

  return (
    <div className="p-2 space-y-2">
      <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 text-sm font-semibold">
            <div className="p-1 bg-blue-50 dark:bg-blue-950/50 rounded-md">
              <Gauge className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Datos de Lectura y Consumo
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                Formulario para medidores BT-1 y BT-2
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Gauge className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                Lectura Actual
              </Label>
              <Input
                placeholder={valorAnterior.toString()}
                value={inputValue}
                onChange={handleInputChange}
                max={maxValuePermitido}
                className="bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 font-mono h-7"
              />
              <small className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>⚠️</span>
                Máximo: {maxValuePermitido.toLocaleString('es-CL')} ({digito}{' '}
                dígitos)
              </small>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <Calculator className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                Consumo Calculado
              </Label>
              <div className="h-7 px-2 flex items-center bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-mono text-slate-900 dark:text-slate-100">
                {consumoCalculado || '0'}
              </div>
              <small className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>📊</span>
                Anterior:{' '}
                {result.LM_ConsumoMesAnterior?.toLocaleString() || '0'} kWh
              </small>
            </div>

            <div className="flex items-center pt-4">
              <Button
                variant="outline"
                onClick={validarLectura}
                disabled={!inputValue || isSubmitting || isValidated}
                className="w-full border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 h-7 text-xs"
              >
                {isValidated ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Validado
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Validar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Alertas */}
          {Number(consumoCalculado) < 0 && (
            <Alert variant="destructive" className="py-1.5">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                El consumo es negativo, por favor verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {Number(consumoCalculado) === 0 && inputValue && (
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 py-1.5">
              <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs">
                El consumo es cero, verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {isValidated && (
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 py-1.5">
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300 text-xs">
                Lectura validada correctamente, puede proceder a guardar.
              </AlertDescription>
            </Alert>
          )}

          {/* Botón Guardar */}
          <div className="flex justify-end pt-1">
            <Button
              onClick={guardarLectura}
              disabled={!isValidated || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 px-4 h-7 text-xs text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-3 w-3" />
                  Guardar Lectura
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogos de confirmación */}
      <ConfirmationDialog
        isOpen={showMenorDialog}
        onOpenChange={(open) => {
          if (!open) {
            if (confirmed.current) {
              confirmed.current = false;
            } else {
              setSelectedClave('0');
            }
          }
          setShowMenorDialog(open);
        }}
        title="Confirmar lectura menor"
        message="La lectura ingresada es menor que la anterior. Por favor seleccione un motivo."
        variant="default"
        alertColor="yellow"
        showClaveSelect={true}
        claveOptions={clavesMenorOptions}
        selectedClave={selectedClave}
        onClaveChange={setSelectedClave}
        onConfirm={() => handleConfirmLectura('menor')}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showIgualDialog}
        onOpenChange={(open) => {
          if (!open) {
            if (confirmed.current) {
              confirmed.current = false;
            } else {
              setSelectedClave('0');
            }
          }
          setShowIgualDialog(open);
        }}
        title="Confirmación de Lectura"
        message="¿Está seguro de que la lectura es igual al mes anterior?"
        alertColor="yellow"
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
        title="Confirmación de Lectura"
        message="¿Está seguro de que la lectura es correcta?"
        alertColor="blue"
        onConfirm={handleConfirmMayor}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
