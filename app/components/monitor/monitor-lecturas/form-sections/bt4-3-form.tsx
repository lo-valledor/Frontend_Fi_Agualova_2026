import {
  Activity,
  AlertCircle,
  BarChart2,
  Calculator,
  Check,
  Gauge,
  Loader2,
  Zap
} from 'lucide-react';
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
import type { FormDataBT43, MedidorNichoItem } from '~/types/monitor';

import { ConfirmationDialog } from '../dialogs/confirmation-dialog';

interface BT43FormProps {
  result: MedidorNichoItem;
  onSuccess?: () => void;
}

export function BT43Form({ result, onSuccess }: BT43FormProps) {
  // Hook para manejar claves dinámicamente
  const {
    getClavesForGroup,
    getClaveCorrectaId,
    isLoading: clavesLoading,
    error: clavesError
  } = useClaves();

  // Valores fijos del medidor
  const digito = useMemo(() => result.ME_Digitos, [result.ME_Digitos]);
  const valorActivaAnterior = useMemo(
    () => result.LM_ValorUltimaLectura,
    [result.LM_ValorUltimaLectura]
  );
  const valorReactivaAnterior = useMemo(
    () => parseInt(result.LMC_ValorUltimaLectEnergiaReactiva1),
    [result.LMC_ValorUltimaLectEnergiaReactiva1]
  );
  const consumoAnterior = useMemo(
    () => parseInt(result.LM_ConsumoMesAnterior),
    [result.LM_ConsumoMesAnterior]
  );
  const constante = useMemo(
    () => result.ME_ConstanteMultiplicar,
    [result.ME_ConstanteMultiplicar]
  );

  const confirmedActiva = useRef(false);
  const confirmedReactiva = useRef(false);

  // Estado del formulario principal
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para energía activa
  const [inputActivaValue, setInputActivaValue] = useState('');
  const [consumoActivaCalculado, setConsumoActivaCalculado] = useState('');
  const [tipoLecturaActiva, setTipoLecturaActiva] = useState<
    'menor' | 'igual' | 'mayor' | null
  >(null);
  const [selectedClaveActiva, setSelectedClaveActiva] = useState('0');
  const [isActivaValidated, setIsActivaValidated] = useState(false);
  const [showMenorActivaDialog, setShowMenorActivaDialog] = useState(false);
  const [showIgualActivaDialog, setShowIgualActivaDialog] = useState(false);
  const [showMayorActivaDialog, setShowMayorActivaDialog] = useState(false);
  const [showConsumoExcesivoActivaDialog, setShowConsumoExcesivoActivaDialog] =
    useState(false);

  // Estados para energía reactiva
  const [inputReactivaValue, setInputReactivaValue] = useState('');
  const [consumoReactivaCalculado, setConsumoReactivaCalculado] = useState('');
  const [tipoLecturaReactiva, setTipoLecturaReactiva] = useState<
    'menor' | 'igual' | 'mayor' | null
  >(null);
  const [selectedClaveReactiva, setSelectedClaveReactiva] = useState('0');
  const [isReactivaValidated, setIsReactivaValidated] = useState(false);
  const [showMenorReactivaDialog, setShowMenorReactivaDialog] = useState(false);
  const [showIgualReactivaDialog, setShowIgualReactivaDialog] = useState(false);
  const [showMayorReactivaDialog, setShowMayorReactivaDialog] = useState(false);
  const [
    showConsumoExcesivoReactivaDialog,
    setShowConsumoExcesivoReactivaDialog
  ] = useState(false);

  // Estados para demandas
  const [demandaData, setDemandaData] = useState({
    dp: 0,
    dpFecha: '',
    dpHora: '',
    ds: 0,
    dsFecha: '',
    dsHora: ''
  });
  // Estados para inputs de demanda como strings para preservar formato
  const [dpInputValue, setDpInputValue] = useState('');
  const [dsInputValue, setDsInputValue] = useState('');
  // Estados para validaciones de coma
  const [showComaWarningDP, setShowComaWarningDP] = useState(false);
  const [showComaWarningDS, setShowComaWarningDS] = useState(false);
  const [showConsumoExcesivoDPDialog, setShowConsumoExcesivoDPDialog] =
    useState(false);
  const [showConsumoExcesivoDSDialog, setShowConsumoExcesivoDSDialog] =
    useState(false);

  // Calcular consumo de energía activa (función estable)
  const calcularConsumoActiva = useCallback(
    (value: string) => {
      if (!value || isNaN(Number(value))) {
        return { consumo: '', tipo: null, vlecturadigitos: 0 };
      }

      const valorActual = parseInt(value);
      let vlecturadigitos = valorActual;
      let tipo: 'menor' | 'igual' | 'mayor' | null = null;

      if (valorActual < valorActivaAnterior) {
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
      } else if (valorActual === valorActivaAnterior) {
        tipo = 'igual';
        vlecturadigitos = valorActual;
      } else {
        tipo = 'mayor';
        vlecturadigitos = valorActual;
      }

      const consumo =
        tipo === 'menor'
          ? (vlecturadigitos - valorActivaAnterior) * constante
          : (valorActual - valorActivaAnterior) * constante;

      return {
        consumo: consumo.toString(),
        tipo,
        vlecturadigitos
      };
    },
    [digito, valorActivaAnterior, constante]
  );

  // Calcular consumo de energía reactiva (función estable)
  const calcularConsumoReactiva = useCallback(
    (value: string) => {
      if (!value || isNaN(Number(value))) {
        return { consumo: '', tipo: null, vlecturadigitos: 0 };
      }

      const valorActual = parseInt(value);
      let vlecturadigitos = valorActual;
      let tipo: 'menor' | 'igual' | 'mayor' | null = null;

      if (valorActual < valorReactivaAnterior) {
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
      } else if (valorActual === valorReactivaAnterior) {
        tipo = 'igual';
        vlecturadigitos = valorActual;
      } else {
        tipo = 'mayor';
        vlecturadigitos = valorActual;
      }

      const consumo =
        tipo === 'menor'
          ? (vlecturadigitos - valorReactivaAnterior) * constante
          : (valorActual - valorReactivaAnterior) * constante;

      return {
        consumo: consumo.toString(),
        tipo,
        vlecturadigitos
      };
    },
    [digito, valorReactivaAnterior, constante]
  );

  // Función para convertir fecha al formato YYYY-MM-DD para input type="date"
  const formatearFechaParaInput = useCallback((fecha: string): string => {
    if (!fecha) return '';

    // Si ya está en formato YYYY-MM-DD, retornar tal cual
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha;
    }

    // Si está en formato DD-MM-YYYY o DD/MM/YYYY, convertir
    const match = fecha.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (match) {
      const [, dia, mes, anio] = match;
      return `${anio}-${mes}-${dia}`;
    }

    // Si es una fecha ISO completa (2024-12-06T10:30:00), extraer solo la fecha
    if (fecha.includes('T')) {
      return fecha.split('T')[0];
    }

    return fecha;
  }, []);

  // Pre-cargar datos existentes si ya hay una lectura registrada (incluye importados)
  useEffect(() => {
    const energiaActiva = result.LMC_EnergiaActiva;
    //const energiaReactiva = result.LMC_EnergiaReactiva;

    // Verificar si hay datos de energía activa (puede ser de lectura ingresada o importada)
    if (
      energiaActiva !== undefined &&
      energiaActiva !== null &&
      energiaActiva >= 0
    ) {
      // Pre-cargar energía activa
      const lecturaActiva = result.LMC_EnergiaActiva.toString();
      setInputActivaValue(lecturaActiva);
      const resultadoActiva = calcularConsumoActiva(lecturaActiva);
      setConsumoActivaCalculado(resultadoActiva.consumo);
      setTipoLecturaActiva(resultadoActiva.tipo);
      // Marcar como validado solo si tiene fecha de lectura (ya fue guardado)
      if (result.LM_FechaLectura) {
        setIsActivaValidated(true);
      }

      // Pre-cargar energía reactiva
      const lecturaReactiva = result.LMC_EnergiaReactiva.toString();
      setInputReactivaValue(lecturaReactiva);
      const resultadoReactiva = calcularConsumoReactiva(lecturaReactiva);
      setConsumoReactivaCalculado(resultadoReactiva.consumo);
      setTipoLecturaReactiva(resultadoReactiva.tipo);
      setIsReactivaValidated(true);

      // Pre-cargar demandas
      const dpValue = parseFloat(result.LMC_DemandaPunta || '0');
      const dsValue = parseFloat(result.LMC_DemandaSuministrada || '0');

      setDemandaData({
        dp: dpValue,
        dpFecha: formatearFechaParaInput(result.LMC_FechaDemandaPunta || ''),
        dpHora: result.LMC_HoraDemandaPunta || '',
        ds: dsValue,
        dsFecha: formatearFechaParaInput(result.LMC_FechaDemandaSuminis || ''),
        dsHora: result.LMC_HoraDemandaSuminis || ''
      });

      // Formatear los valores de demanda con coma decimal
      setDpInputValue(dpValue > 0 ? dpValue.toString().replace('.', ',') : '');
      setDsInputValue(dsValue > 0 ? dsValue.toString().replace('.', ',') : '');
    }

    setShowComaWarningDP(false);
    setShowComaWarningDS(false);
  }, [
    result,
    calcularConsumoActiva,
    calcularConsumoReactiva,
    formatearFechaParaInput
  ]);

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

  // Detectar si el usuario probablemente olvidó una coma decimal
  const detectarOlvidoComa = useCallback((value: string) => {
    if (!value || value.length < 3) return false;

    // Verificar si el valor es un número entero grande que podría necesitar coma
    const numValue = parseFloat(value.replace(',', '.'));

    // Si el valor es mayor a 99 y no tiene coma, podría ser un olvido
    // Por ejemplo: 1201 podría ser 12,01
    if (
      numValue > 99 &&
      !value.includes(',') &&
      !value.includes('.') &&
      value.length >= 3
    ) {
      return true;
    }

    return false;
  }, []);

  // Convertir valor con coma a número
  const convertirComANumero = useCallback((value: string) => {
    if (!value) return 0;
    return parseFloat(value.replace(',', '.')) || 0;
  }, []);

  // Manejar cambio en demanda punta
  const handleDemandaPuntaChange = useCallback(
    (value: string) => {
      setDpInputValue(value);

      // Validar que solo contenga números, coma o punto
      if (value && !/^[\d,.-]*$/.test(value)) {
        toast.error(
          'Solo se permiten números y comas decimales en Demanda Punta'
        );
        return;
      }

      // Detectar posible olvido de coma
      if (detectarOlvidoComa(value)) {
        setShowComaWarningDP(true);
      } else {
        setShowComaWarningDP(false);
      }

      const numeroValue = convertirComANumero(value);
      setDemandaData(prev => ({ ...prev, dp: numeroValue }));

      // Verificar si la demanda es excesiva
      if (numeroValue > 500) {
        setTimeout(() => setShowConsumoExcesivoDPDialog(true), 100);
      }
    },
    [detectarOlvidoComa, convertirComANumero]
  );

  // Manejar cambio en demanda suministrada
  const handleDemandaSuministradaChange = useCallback(
    (value: string) => {
      setDsInputValue(value);

      // Validar que solo contenga números, coma o punto
      if (value && !/^[\d,.-]*$/.test(value)) {
        toast.error(
          'Solo se permiten números y comas decimales en Demanda Suministrada'
        );
        return;
      }

      // Detectar posible olvido de coma
      if (detectarOlvidoComa(value)) {
        setShowComaWarningDS(true);
      } else {
        setShowComaWarningDS(false);
      }

      const numeroValue = convertirComANumero(value);
      setDemandaData(prev => ({ ...prev, ds: numeroValue }));

      // Verificar si la demanda es excesiva
      if (numeroValue > 500) {
        setTimeout(() => setShowConsumoExcesivoDSDialog(true), 100);
      }
    },
    [detectarOlvidoComa, convertirComANumero]
  );

  // Detectar consumos anómalos en energía activa (muy altos o negativos con muchos 9s)
  const detectarConsumoActivaAnomalo = useCallback(() => {
    if (!consumoActivaCalculado || isNaN(Number(consumoActivaCalculado))) {
      return { esAnomalo: false, tipo: '', mensaje: '' };
    }

    const consumoActual = Number(consumoActivaCalculado);

    // Caso 1: Detectar consumo con muchos 9s (probable error de decimal truncado)
    const consumoStr = consumoActivaCalculado.toString();
    const countNines = (consumoStr.match(/9/g) || []).length;
    const esPatronDe9s = countNines >= 4 && consumoStr.length >= 5;

    // Caso 2: Consumo negativo aparente (valor muy alto por rollover incorrecto)
    const maxConsumoEsperado = Math.pow(10, digito) * constante;
    const esRolloverIncorrecto = consumoActual > maxConsumoEsperado * 0.8;

    // Caso 3: Detectar si el consumo es excesivamente alto comparado con histórico
    const umbralBase = consumoAnterior > 0 ? consumoAnterior : 500;
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
        ? '⚠️ El consumo de energía activa calculado contiene muchos "9s" consecutivos. Esto puede indicar un error en los decimales de la lectura importada.'
        : esRolloverIncorrecto
          ? '⚠️ El consumo de energía activa calculado es anormalmente alto. Verifique que los valores de lectura anterior y actual sean correctos.'
          : '⚠️ El consumo de energía activa calculado es significativamente mayor al histórico. Verifique los valores ingresados.'
    };
  }, [consumoActivaCalculado, consumoAnterior, digito, constante]);

  // Detectar consumos anómalos en energía reactiva (muy altos o negativos con muchos 9s)
  const detectarConsumoReactivaAnomalo = useCallback(() => {
    if (!consumoReactivaCalculado || isNaN(Number(consumoReactivaCalculado))) {
      return { esAnomalo: false, tipo: '', mensaje: '' };
    }

    const consumoActual = Number(consumoReactivaCalculado);

    // Caso 1: Detectar consumo con muchos 9s (probable error de decimal truncado)
    const consumoStr = consumoReactivaCalculado.toString();
    const countNines = (consumoStr.match(/9/g) || []).length;
    const esPatronDe9s = countNines >= 4 && consumoStr.length >= 5;

    // Caso 2: Consumo negativo aparente (valor muy alto por rollover incorrecto)
    const maxConsumoEsperado = Math.pow(10, digito) * constante;
    const esRolloverIncorrecto = consumoActual > maxConsumoEsperado * 0.8;

    // Caso 3: Para energía reactiva, usar umbral más alto ya que suele ser menor
    const umbralBase = consumoAnterior > 0 ? consumoAnterior : 1000;
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
        ? '⚠️ El consumo de energía reactiva calculado contiene muchos "9s" consecutivos. Esto puede indicar un error en los decimales de la lectura importada.'
        : esRolloverIncorrecto
          ? '⚠️ El consumo de energía reactiva calculado es anormalmente alto. Verifique que los valores de lectura anterior y actual sean correctos.'
          : '⚠️ El consumo de energía reactiva calculado es significativamente mayor al histórico. Verifique los valores ingresados.'
    };
  }, [consumoReactivaCalculado, consumoAnterior, digito, constante]);

  // Calcular el máximo valor permitido para mostrar al usuario
  const maxValuePermitido = useMemo(() => {
    return Math.pow(10, digito) - 1;
  }, [digito]);

  // Actualizar el consumo cuando cambia el input de energía activa
  const handleActivaInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Si el valor está vacío, permitir
      if (value === '') {
        setInputActivaValue(value);
        setConsumoActivaCalculado('');
        setTipoLecturaActiva(null);
        setIsActivaValidated(false);
        return;
      }
      // Validar que sea numérico
      if (isNaN(Number(value))) {
        toast.error('Solo se permiten valores numéricos en Energía Activa');
        return;
      }
      // Validar que no sea menor a 0 (excepto 0)
      if (Number(value) < 0) {
        toast.error('No se permiten valores negativos en Energía Activa');
        return;
      }
      // Validar número de dígitos
      if (!validarDigitos(value)) {
        toast.error(
          `La lectura de Energía Activa no puede exceder ${maxValuePermitido} (${digito} dígitos máximo)`
        );
        return;
      }
      setInputActivaValue(value);
      if (value && !isNaN(Number(value))) {
        const resultado = calcularConsumoActiva(value);
        setConsumoActivaCalculado(resultado.consumo);
        setTipoLecturaActiva(resultado.tipo);
        setIsActivaValidated(false); // Resetear validación cuando cambia el input
      } else {
        setConsumoActivaCalculado('');
        setTipoLecturaActiva(null);
        setIsActivaValidated(false);
      }
    },
    [calcularConsumoActiva, validarDigitos, maxValuePermitido, digito]
  );

  // Actualizar el consumo cuando cambia el input de energía reactiva
  const handleReactivaInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // Si el valor está vacío, permitir
      if (value === '') {
        setInputReactivaValue(value);
        setConsumoReactivaCalculado('');
        setTipoLecturaReactiva(null);
        setIsReactivaValidated(false);
        return;
      }
      // Validar que sea numérico
      if (isNaN(Number(value))) {
        toast.error('Solo se permiten valores numéricos en Energía Reactiva');
        return;
      }
      // Validar que no sea menor a 0 (excepto 0)
      if (Number(value) < 0) {
        toast.error('No se permiten valores negativos en Energía Reactiva');
        return;
      }
      // Validar número de dígitos
      if (!validarDigitos(value)) {
        toast.error(
          `La lectura de Energía Reactiva no puede exceder ${maxValuePermitido} (${digito} dígitos máximo)`
        );
        return;
      }
      setInputReactivaValue(value);
      if (value && !isNaN(Number(value))) {
        const resultado = calcularConsumoReactiva(value);
        setConsumoReactivaCalculado(resultado.consumo);
        setTipoLecturaReactiva(resultado.tipo);
        setIsReactivaValidated(false); // Resetear validación cuando cambia el input
      } else {
        setConsumoReactivaCalculado('');
        setTipoLecturaReactiva(null);
        setIsReactivaValidated(false);
      }
    },
    [calcularConsumoReactiva, validarDigitos, maxValuePermitido, digito]
  );

  // Actualizar datos de demanda (solo para fecha y hora)
  const handleDemandaChange = useCallback(
    (field: 'dpFecha' | 'dpHora' | 'dsFecha' | 'dsHora', value: string) => {
      setDemandaData(prev => ({
        ...prev,
        [field]: value
      }));
    },
    []
  );

  // Validar la lectura de energía activa
  const validarLecturaActiva = useCallback(() => {
    if (!inputActivaValue || isNaN(Number(inputActivaValue))) {
      toast.error(
        'Por favor ingrese un valor numérico válido para Energía Activa'
      );
      return;
    }

    // Validar dígitos una vez más antes de continuar
    if (!validarDigitos(inputActivaValue)) {
      toast.error(
        `La lectura de Energía Activa no puede exceder ${maxValuePermitido} (${digito} dígitos máximo)`
      );
      return;
    }

    // Detectar consumos anómalos antes de continuar
    const anomalia = detectarConsumoActivaAnomalo();
    if (anomalia.esAnomalo) {
      setShowConsumoExcesivoActivaDialog(true);
      return;
    }

    if (tipoLecturaActiva === 'menor') {
      setShowMenorActivaDialog(true);
    } else if (tipoLecturaActiva === 'igual') {
      setShowIgualActivaDialog(true);
    } else if (tipoLecturaActiva === 'mayor') {
      setShowMayorActivaDialog(true);
    } else {
      toast.error('Por favor ingrese un valor válido');
    }
  }, [
    inputActivaValue,
    tipoLecturaActiva,
    validarDigitos,
    maxValuePermitido,
    digito,
    detectarConsumoActivaAnomalo
  ]);

  // Validar la lectura de energía reactiva
  const validarLecturaReactiva = useCallback(() => {
    if (!inputReactivaValue || isNaN(Number(inputReactivaValue))) {
      toast.error(
        'Por favor ingrese un valor numérico válido para Energía Reactiva'
      );
      return;
    }

    // Validar dígitos una vez más antes de continuar
    if (!validarDigitos(inputReactivaValue)) {
      toast.error(
        `La lectura de Energía Reactiva no puede exceder ${maxValuePermitido} (${digito} dígitos máximo)`
      );
      return;
    }

    // Detectar consumos anómalos antes de continuar
    const anomalia = detectarConsumoReactivaAnomalo();
    if (anomalia.esAnomalo) {
      setShowConsumoExcesivoReactivaDialog(true);
      return;
    }

    if (tipoLecturaReactiva === 'menor') {
      setShowMenorReactivaDialog(true);
    } else if (tipoLecturaReactiva === 'igual') {
      setShowIgualReactivaDialog(true);
    } else if (tipoLecturaReactiva === 'mayor') {
      setShowMayorReactivaDialog(true);
    } else {
      toast.error('Por favor ingrese un valor válido');
    }
  }, [
    inputReactivaValue,
    tipoLecturaReactiva,
    validarDigitos,
    maxValuePermitido,
    digito,
    detectarConsumoReactivaAnomalo
  ]);

  // Confirmar tipo de lectura activa y registrar la clave seleccionada
  const handleConfirmLecturaActiva = useCallback(() => {
    if (selectedClaveActiva === '0') {
      toast.info('Debe seleccionar una clave para Energía Activa');
      return;
    }
    confirmedActiva.current = true;

    // Cerrar diálogos
    setShowMenorActivaDialog(false);
    setShowIgualActivaDialog(false);

    // Marcar como validado
    setIsActivaValidated(true);
    toast.success('Lectura de Energía Activa validada correctamente');
  }, [selectedClaveActiva]);

  // Confirmar lectura mayor activa
  const handleConfirmMayorActiva = useCallback(() => {
    setShowMayorActivaDialog(false);
    setIsActivaValidated(true);
    toast.success('Lectura de Energía Activa validada correctamente');
  }, []);

  // Confirmar tipo de lectura reactiva y registrar la clave seleccionada
  const handleConfirmLecturaReactiva = useCallback(() => {
    if (selectedClaveReactiva === '0') {
      toast.info('Debe seleccionar una clave para Energía Reactiva');
      return;
    }
    confirmedReactiva.current = true;

    // Cerrar diálogos
    setShowMenorReactivaDialog(false);
    setShowIgualReactivaDialog(false);

    // Marcar como validado
    setIsReactivaValidated(true);
    toast.success('Lectura de Energía Reactiva validada correctamente');
  }, [selectedClaveReactiva]);

  // Confirmar lectura mayor reactiva
  const handleConfirmMayorReactiva = useCallback(() => {
    setShowMayorReactivaDialog(false);
    setIsReactivaValidated(true);
    toast.success('Lectura de Energía Reactiva validada correctamente');
  }, []);

  // Confirmar consumo excesivo de energía activa
  const handleConfirmConsumoExcesivoActiva = useCallback(() => {
    setShowConsumoExcesivoActivaDialog(false);

    // Continuar con la validación normal según el tipo de lectura
    if (tipoLecturaActiva === 'menor') {
      setShowMenorActivaDialog(true);
    } else if (tipoLecturaActiva === 'igual') {
      setShowIgualActivaDialog(true);
    } else if (tipoLecturaActiva === 'mayor') {
      setShowMayorActivaDialog(true);
    }
  }, [tipoLecturaActiva]);

  // Confirmar consumo excesivo de energía reactiva
  const handleConfirmConsumoExcesivoReactiva = useCallback(() => {
    setShowConsumoExcesivoReactivaDialog(false);

    // Continuar con la validación normal según el tipo de lectura
    if (tipoLecturaReactiva === 'menor') {
      setShowMenorReactivaDialog(true);
    } else if (tipoLecturaReactiva === 'igual') {
      setShowIgualReactivaDialog(true);
    } else if (tipoLecturaReactiva === 'mayor') {
      setShowMayorReactivaDialog(true);
    }
  }, [tipoLecturaReactiva]);

  // Confirmar demanda punta excesiva
  const handleConfirmDemandaPuntaExcesiva = useCallback(() => {
    setShowConsumoExcesivoDPDialog(false);
    toast.success('Demanda Punta confirmada');
  }, []);

  // Confirmar demanda suministrada excesiva
  const handleConfirmDemandaSuministradaExcesiva = useCallback(() => {
    setShowConsumoExcesivoDSDialog(false);
    toast.success('Demanda Suministrada confirmada');
  }, []);

  // Preparar datos para enviar
  const prepararDatosFormulario = useCallback(() => {
    if (
      !inputActivaValue ||
      !consumoActivaCalculado ||
      !inputReactivaValue ||
      !consumoReactivaCalculado ||
      demandaData.dp === undefined ||
      demandaData.ds === undefined
    )
      return null;

    let claveActivaId = '';
    if (tipoLecturaActiva === 'mayor') {
      claveActivaId = getClaveCorrectaId();
    } else if (selectedClaveActiva !== '0') {
      claveActivaId = selectedClaveActiva;
    } else {
      return null;
    }

    let claveReactivaId = '';
    if (tipoLecturaReactiva === 'mayor') {
      claveReactivaId = getClaveCorrectaId();
    } else if (selectedClaveReactiva !== '0') {
      claveReactivaId = selectedClaveReactiva;
    } else {
      return null;
    }

    const data: FormDataBT43 = {
      lmId: result.LM_ID,
      lecturaActiva: parseInt(inputActivaValue),
      claveActivaId,
      lecturaReactiva: parseInt(inputReactivaValue),
      claveReactivaId,
      consumoActiva: parseInt(consumoActivaCalculado),
      consumoReactiva: parseInt(consumoReactivaCalculado),
      dp: demandaData.dp,
      dpFecha: demandaData.dpFecha,
      dpHora: demandaData.dpHora,
      ds: demandaData.ds,
      dsFecha: demandaData.dsFecha,
      dsHora: demandaData.dsHora
    };

    return data;
  }, [
    inputActivaValue,
    consumoActivaCalculado,
    tipoLecturaActiva,
    selectedClaveActiva,
    inputReactivaValue,
    consumoReactivaCalculado,
    tipoLecturaReactiva,
    selectedClaveReactiva,
    demandaData,
    result.LM_ID,
    getClaveCorrectaId
  ]);

  // Guardar la lectura
  const guardarLectura = useCallback(async () => {
    if (!isActivaValidated) {
      toast.error('Por favor valide la lectura de Energía Activa primero');
      return;
    }

    if (!isReactivaValidated) {
      toast.error('Por favor valide la lectura de Energía Reactiva primero');
      return;
    }

    if (
      demandaData.dp === undefined ||
      !demandaData.dpFecha ||
      !demandaData.dpHora ||
      demandaData.ds === undefined ||
      !demandaData.dsFecha ||
      !demandaData.dsHora
    ) {
      toast.error('Por favor complete todos los datos de Demanda');
      return;
    }

    const data = prepararDatosFormulario();

    if (!data) {
      toast.error(
        'No se pueden guardar los datos. Por favor complete y valide todos los campos.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.put('/actualizar-lectura-bt-4-3', data);
      if (response.status === 200) {
        toast.success('Lectura BT-4.3 actualizada correctamente');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error('Error al actualizar la lectura BT-4.3');
      }
    } catch (error: any) {
      console.error('Error al enviar los datos BT-4.3:', error);
      toast.error(
        `Error al conectar con el servidor: ${
          error.message || 'Error desconocido'
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isActivaValidated,
    isReactivaValidated,
    demandaData,
    prepararDatosFormulario,
    onSuccess
  ]);

  // Opciones de claves dinámicas basadas en los grupos
  const clavesOptions = useMemo(() => {
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
    <div className='space-y-4'>
      {/* Energía Activa */}
      <Card className='border-0 shadow-none bg-transparent'>
        <CardHeader className='px-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-foreground text-sm font-medium'>
            <div className='h-5 w-5 rounded bg-primary/10 flex items-center justify-center'>
              <Zap className='h-3 w-3 text-primary' />
            </div>
            <span>Energía Activa</span>
            {isActivaValidated && (
              <div className='h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
                <Check className='h-2.5 w-2.5 text-emerald-500' />
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-muted-foreground flex items-center gap-1.5'>
                <Gauge className='h-3 w-3' />
                Lectura Actual
              </Label>
              <Input
                placeholder={valorActivaAnterior.toString()}
                value={inputActivaValue}
                onChange={handleActivaInputChange}
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
                {consumoActivaCalculado || '0'}
              </div>
              <div className='text-xs text-muted-foreground'>
                Ant: {consumoAnterior.toLocaleString('es-CL')}
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-muted-foreground'>
                &nbsp;
              </Label>
              <Button
                variant='outline'
                onClick={validarLecturaActiva}
                disabled={
                  !inputActivaValue || isSubmitting || isActivaValidated
                }
                className='w-full h-8 text-xs'
              >
                {isActivaValidated ? (
                  <>
                    <Check className='h-3 w-3 mr-1.5' />
                    Validado
                  </>
                ) : (
                  'Validar'
                )}
              </Button>
            </div>
          </div>

          {/* Estados compactos para Energía Activa */}
          <div className='space-y-2 mt-3'>
            {clavesError && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded'>
                <AlertCircle className='h-3 w-3' />
                Error cargando claves: usando valores por defecto
              </div>
            )}

            {(() => {
              const anomalia = detectarConsumoActivaAnomalo();
              if (anomalia.esAnomalo && consumoActivaCalculado) {
                return (
                  <div className='flex items-start gap-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0 mt-0.5' />
                    <div className='flex-1'>
                      <div className='font-semibold mb-1'>
                        Consumo anómalo detectado (Activa)
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

            {Number(consumoActivaCalculado) < 0 && (
              <div className='flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded'>
                <AlertCircle className='h-3 w-3' />
                Consumo negativo - Verifique la lectura
              </div>
            )}
            {Number(consumoActivaCalculado) === 0 && inputActivaValue && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded'>
                <AlertCircle className='h-3 w-3' />
                Consumo cero - Verifique la lectura
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Energía Reactiva */}
      <Card className='border-0 shadow-none bg-transparent'>
        <CardHeader className='px-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-foreground text-sm font-medium'>
            <div className='h-5 w-5 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
              <Activity className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
            </div>
            <span>Energía Reactiva</span>
            {isReactivaValidated && (
              <div className='h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center'>
                <Check className='h-2.5 w-2.5 text-emerald-500' />
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-muted-foreground flex items-center gap-1.5'>
                <Gauge className='h-3 w-3' />
                Lectura Actual
              </Label>
              <Input
                placeholder={valorReactivaAnterior.toString()}
                value={inputReactivaValue}
                onChange={handleReactivaInputChange}
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
                Consumo kVArh
              </Label>
              <div className='h-8 px-3 flex items-center bg-muted/50 border rounded-md text-sm font-mono'>
                {consumoReactivaCalculado || '0'}
              </div>
              <div className='text-xs text-muted-foreground'>
                Ant: {consumoAnterior.toLocaleString('es-CL')}
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-medium text-muted-foreground'>
                &nbsp;
              </Label>
              <Button
                variant='outline'
                onClick={validarLecturaReactiva}
                disabled={
                  !inputReactivaValue || isSubmitting || isReactivaValidated
                }
                className='w-full h-8 text-xs'
              >
                {isReactivaValidated ? (
                  <>
                    <Check className='h-3 w-3 mr-1.5' />
                    Validado
                  </>
                ) : (
                  'Validar'
                )}
              </Button>
            </div>
          </div>

          {/* Estados compactos para Energía Reactiva */}
          <div className='space-y-2 mt-3'>
            {(() => {
              const anomalia = detectarConsumoReactivaAnomalo();
              if (anomalia.esAnomalo && consumoReactivaCalculado) {
                return (
                  <div className='flex items-start gap-2 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0 mt-0.5' />
                    <div className='flex-1'>
                      <div className='font-semibold mb-1'>
                        Consumo anómalo detectado (Reactiva)
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

            {Number(consumoReactivaCalculado) < 0 && (
              <div className='flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-2 py-1 rounded'>
                <AlertCircle className='h-3 w-3' />
                Consumo negativo - Verifique la lectura
              </div>
            )}
            {Number(consumoReactivaCalculado) === 0 && inputReactivaValue && (
              <div className='flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded'>
                <AlertCircle className='h-3 w-3' />
                Consumo cero - Verifique la lectura
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Datos de Demanda */}
      <Card className='border-0 shadow-none bg-transparent'>
        <CardHeader className='px-0 pb-2'>
          <CardTitle className='flex items-center gap-2 text-foreground text-sm font-medium'>
            <div className='h-5 w-5 rounded bg-secondary/50 flex items-center justify-center'>
              <BarChart2 className='h-3 w-3 text-foreground' />
            </div>
            <span>Demandas kW</span>
            {(!isActivaValidated || !isReactivaValidated) && (
              <div className='text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded'>
                Requiere validación previa
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-0 space-y-3'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
            {/* Demanda Punta */}
            <div className='space-y-2'>
              <div className='flex items-center gap-1.5 text-sm font-medium text-foreground'>
                <BarChart2 className='h-3 w-3' />
                Demanda Punta
              </div>
              <div className='grid grid-cols-3 gap-2'>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Valor kW
                  </Label>
                  <Input
                    type='text'
                    placeholder='0,00'
                    value={dpInputValue}
                    onChange={e => {
                      const val = e.target.value;
                      if (val && convertirComANumero(val) < 0) {
                        return toast.error('No se permiten valores negativos');
                      }
                      handleDemandaPuntaChange(val);
                    }}
                    disabled={!isActivaValidated || !isReactivaValidated}
                    className='h-8 font-mono text-sm'
                  />
                  {showComaWarningDP && (
                    <div className='text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1'>
                      <AlertCircle className='h-3 w-3' />
                      ¿Olvidó la coma decimal? Ej: 12,01
                    </div>
                  )}
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Fecha</Label>
                  <Input
                    type='date'
                    value={demandaData.dpFecha || ''}
                    onChange={e =>
                      handleDemandaChange('dpFecha', e.target.value)
                    }
                    disabled={!isActivaValidated || !isReactivaValidated}
                    className='h-8 text-sm'
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Hora</Label>
                  <Input
                    type='time'
                    value={demandaData.dpHora || ''}
                    onChange={e =>
                      handleDemandaChange('dpHora', e.target.value)
                    }
                    disabled={!isActivaValidated || !isReactivaValidated}
                    className='h-8 font-mono text-sm'
                  />
                </div>
              </div>
            </div>

            {/* Demanda Suministrada */}
            <div className='space-y-2'>
              <div className='flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400'>
                <BarChart2 className='h-3 w-3' />
                Demanda Suministrada
              </div>
              <div className='grid grid-cols-3 gap-2'>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Valor kW
                  </Label>
                  <Input
                    type='text'
                    placeholder='0,00'
                    value={dsInputValue}
                    onChange={e => {
                      const val = e.target.value;
                      if (val && convertirComANumero(val) < 0) {
                        return toast.error('No se permiten valores negativos');
                      }
                      handleDemandaSuministradaChange(val);
                    }}
                    disabled={!isActivaValidated || !isReactivaValidated}
                    className='h-8 font-mono text-sm'
                  />
                  {showComaWarningDS && (
                    <div className='text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1'>
                      <AlertCircle className='h-3 w-3' />
                      ¿Olvidó la coma decimal? Ej: 12,01
                    </div>
                  )}
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Fecha</Label>
                  <Input
                    type='date'
                    value={demandaData.dsFecha || ''}
                    onChange={e =>
                      handleDemandaChange('dsFecha', e.target.value)
                    }
                    disabled={!isActivaValidated || !isReactivaValidated}
                    className='h-8 text-sm'
                  />
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>Hora</Label>
                  <Input
                    type='time'
                    value={demandaData.dsHora || ''}
                    onChange={e =>
                      handleDemandaChange('dsHora', e.target.value)
                    }
                    disabled={!isActivaValidated || !isReactivaValidated}
                    className='h-8 font-mono text-sm'
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className='flex justify-end pt-2'>
            <Button
              onClick={guardarLectura}
              disabled={
                !isActivaValidated ||
                !isReactivaValidated ||
                demandaData.dp === undefined ||
                !demandaData.dpFecha ||
                !demandaData.dpHora ||
                demandaData.ds === undefined ||
                !demandaData.dsFecha ||
                !demandaData.dsHora ||
                isSubmitting
              }
              className='px-6 h-8 text-xs'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-3 w-3 animate-spin' />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className='mr-2 h-3 w-3' />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogos para energía activa */}
      <ConfirmationDialog
        isOpen={showMenorActivaDialog}
        onOpenChange={open => {
          if (!open) {
            if (confirmedActiva.current) {
              confirmedActiva.current = false;
            } else {
              setSelectedClaveActiva('0');
            }
          }
          setShowMenorActivaDialog(open);
        }}
        title='Confirmar Lectura Activa Menor'
        message='La lectura activa ingresada es menor que la anterior. Por favor seleccione un motivo.'
        variant='default'
        alertColor='yellow'
        claveOptions={clavesOptions}
        selectedClave={selectedClaveActiva}
        onClaveChange={setSelectedClaveActiva}
        showClaveSelect={true}
        onConfirm={handleConfirmLecturaActiva}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showIgualActivaDialog}
        onOpenChange={open => {
          if (!open) {
            if (confirmedActiva.current) {
              confirmedActiva.current = false;
            } else {
              setSelectedClaveActiva('0');
            }
          }
          setShowIgualActivaDialog(open);
        }}
        title='Confirmar Lectura Activa Igual'
        message='La lectura activa ingresada es igual a la anterior. Por favor seleccione un motivo.'
        variant='default'
        alertColor='yellow'
        claveOptions={clavesIgualOptions}
        selectedClave={selectedClaveActiva}
        onClaveChange={setSelectedClaveActiva}
        showClaveSelect={true}
        onConfirm={handleConfirmLecturaActiva}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showMayorActivaDialog}
        onOpenChange={setShowMayorActivaDialog}
        title='Confirmar Lectura Activa'
        message='¿Está seguro de que la lectura activa es correcta?'
        alertColor='blue'
        onConfirm={handleConfirmMayorActiva}
        isSubmitting={isSubmitting}
      />

      {/* Diálogos para energía reactiva */}
      <ConfirmationDialog
        isOpen={showMenorReactivaDialog}
        onOpenChange={open => {
          if (!open) {
            if (confirmedReactiva.current) {
              confirmedReactiva.current = false;
            } else {
              setSelectedClaveReactiva('0');
            }
          }
          setShowMenorReactivaDialog(open);
        }}
        title='Confirmar Lectura Reactiva Menor'
        message='La lectura reactiva ingresada es menor que la anterior. Por favor seleccione un motivo.'
        variant='default'
        alertColor='yellow'
        claveOptions={clavesOptions}
        selectedClave={selectedClaveReactiva}
        onClaveChange={setSelectedClaveReactiva}
        showClaveSelect={true}
        onConfirm={handleConfirmLecturaReactiva}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showIgualReactivaDialog}
        onOpenChange={open => {
          if (!open) {
            if (confirmedReactiva.current) {
              confirmedReactiva.current = false;
            } else {
              setSelectedClaveReactiva('0');
            }
          }
          setShowIgualReactivaDialog(open);
        }}
        title='Confirmar Lectura Reactiva Igual'
        message='La lectura reactiva ingresada es igual a la anterior. Por favor seleccione un motivo.'
        variant='default'
        alertColor='yellow'
        claveOptions={clavesIgualOptions}
        selectedClave={selectedClaveReactiva}
        onClaveChange={setSelectedClaveReactiva}
        showClaveSelect={true}
        onConfirm={handleConfirmLecturaReactiva}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showMayorReactivaDialog}
        onOpenChange={setShowMayorReactivaDialog}
        title='Confirmar Lectura Reactiva'
        message='¿Está seguro de que la lectura reactiva es correcta?'
        alertColor='blue'
        onConfirm={handleConfirmMayorReactiva}
        isSubmitting={isSubmitting}
      />

      {/* Diálogos para consumo excesivo */}
      <ConfirmationDialog
        isOpen={showConsumoExcesivoActivaDialog}
        onOpenChange={setShowConsumoExcesivoActivaDialog}
        title='⚠️ Consumo de Energía Activa Anómalo'
        message={(() => {
          const anomalia = detectarConsumoActivaAnomalo();
          const consumoFormateado = Number(
            consumoActivaCalculado
          ).toLocaleString('es-CL');
          const consumoAnteriorFormateado =
            consumoAnterior.toLocaleString('es-CL');

          return `${anomalia.mensaje}

Consumo calculado: ${consumoFormateado} kWh
Consumo anterior: ${consumoAnteriorFormateado} kWh
Lectura actual: ${inputActivaValue}
Lectura anterior: ${valorActivaAnterior}

${
  anomalia.tipo === 'decimal_truncado'
    ? '💡 Sugerencia: Si esta lectura fue importada, verifique que los valores con decimales estén correctos. Los decimales pueden haberse perdido durante la importación.'
    : '💡 Sugerencia: Verifique los valores de lectura anterior y actual antes de continuar.'
}

¿Desea continuar de todas formas?`;
        })()}
        alertColor='red'
        onConfirm={handleConfirmConsumoExcesivoActiva}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showConsumoExcesivoReactivaDialog}
        onOpenChange={setShowConsumoExcesivoReactivaDialog}
        title='⚠️ Consumo de Energía Reactiva Anómalo'
        message={(() => {
          const anomalia = detectarConsumoReactivaAnomalo();
          const consumoFormateado = Number(
            consumoReactivaCalculado
          ).toLocaleString('es-CL');
          const consumoAnteriorFormateado =
            consumoAnterior.toLocaleString('es-CL');

          return `${anomalia.mensaje}

Consumo calculado: ${consumoFormateado} kVArh
Consumo anterior: ${consumoAnteriorFormateado} kVArh
Lectura actual: ${inputReactivaValue}
Lectura anterior: ${valorReactivaAnterior}

${
  anomalia.tipo === 'decimal_truncado'
    ? '💡 Sugerencia: Si esta lectura fue importada, verifique que los valores con decimales estén correctos. Los decimales pueden haberse perdido durante la importación.'
    : '💡 Sugerencia: Verifique los valores de lectura anterior y actual antes de continuar.'
}

¿Desea continuar de todas formas?`;
        })()}
        alertColor='red'
        onConfirm={handleConfirmConsumoExcesivoReactiva}
        isSubmitting={isSubmitting}
      />

      {/* Diálogos para demandas excesivas */}
      <ConfirmationDialog
        isOpen={showConsumoExcesivoDPDialog}
        onOpenChange={setShowConsumoExcesivoDPDialog}
        title='Advertencia: Demanda Punta Muy Alta'
        message={`La demanda punta ingresada (${demandaData.dp} kW) es considerablemente alta (superior a 500 kW). ¿Desea continuar?`}
        variant='default'
        alertColor='red'
        onConfirm={handleConfirmDemandaPuntaExcesiva}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showConsumoExcesivoDSDialog}
        onOpenChange={setShowConsumoExcesivoDSDialog}
        title='Advertencia: Demanda Suministrada Muy Alta'
        message={`La demanda suministrada ingresada (${demandaData.ds} kW) es considerablemente alta (superior a 500 kW). ¿Desea continuar?`}
        variant='default'
        alertColor='red'
        onConfirm={handleConfirmDemandaSuministradaExcesiva}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
