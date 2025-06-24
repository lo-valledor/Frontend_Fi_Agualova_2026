import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Alert, AlertDescription } from '~/components/ui/alert'
import {
  AlertCircle,
  Gauge,
  Calculator,
  Loader2,
  Activity,
  BarChart,
  Zap,
  BarChart2,
  CalendarIcon,
  Clock,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import type { FormDataBT43, MedidorNichoItem } from '~/types/monitor'
import { ConfirmationDialog } from '../dialogs/confirmation-dialog'
import api from '~/lib/api'

interface BT43FormProps {
  result: MedidorNichoItem
  onSuccess?: () => void
}

export function BT43Form({ result, onSuccess }: BT43FormProps) {
  // Valores fijos del medidor
  const digito = useMemo(() => result.ME_Digitos, [result.ME_Digitos])
  const valorActivaAnterior = useMemo(
    () => result.LM_ValorUltimaLectura,
    [result.LM_ValorUltimaLectura],
  )
  const valorReactivaAnterior = useMemo(
    () => parseInt(result.LMC_ValorUltimaLectEnergiaReactiva1),
    [result.LMC_ValorUltimaLectEnergiaReactiva1],
  )
  const constante = useMemo(
    () => result.ME_ConstanteMultiplicar,
    [result.ME_ConstanteMultiplicar],
  )

  // Estado del formulario principal
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados para energía activa
  const [inputActivaValue, setInputActivaValue] = useState('')
  const [consumoActivaCalculado, setConsumoActivaCalculado] = useState('')
  const [tipoLecturaActiva, setTipoLecturaActiva] = useState<
    'menor' | 'igual' | 'mayor' | null
  >(null)
  const [selectedClaveActiva, setSelectedClaveActiva] = useState('0')
  const [isActivaValidated, setIsActivaValidated] = useState(false)
  const [showMenorActivaDialog, setShowMenorActivaDialog] = useState(false)
  const [showIgualActivaDialog, setShowIgualActivaDialog] = useState(false)
  const [showMayorActivaDialog, setShowMayorActivaDialog] = useState(false)

  // Estados para energía reactiva
  const [inputReactivaValue, setInputReactivaValue] = useState('')
  const [consumoReactivaCalculado, setConsumoReactivaCalculado] = useState('')
  const [tipoLecturaReactiva, setTipoLecturaReactiva] = useState<
    'menor' | 'igual' | 'mayor' | null
  >(null)
  const [selectedClaveReactiva, setSelectedClaveReactiva] = useState('0')
  const [isReactivaValidated, setIsReactivaValidated] = useState(false)
  const [showMenorReactivaDialog, setShowMenorReactivaDialog] = useState(false)
  const [showIgualReactivaDialog, setShowIgualReactivaDialog] = useState(false)
  const [showMayorReactivaDialog, setShowMayorReactivaDialog] = useState(false)

  // Estados para demandas
  const [demandaData, setDemandaData] = useState({
    dp: 0,
    dpFecha: '',
    dpHora: '',
    ds: 0,
    dsFecha: '',
    dsHora: '',
  })

  // Establecer fechas y horas por defecto al iniciar
  useEffect(() => {

    setDemandaData({
      dp: 0,
      dpFecha: '',
      dpHora: '',
      ds: 0,
      dsFecha: '',
      dsHora: '',
    })
  }, [])

  // Calcular consumo de energía activa (función estable)
  const calcularConsumoActiva = useCallback(
    (value: string) => {
      if (!value || isNaN(Number(value))) {
        return { consumo: '', tipo: null, vlecturadigitos: 0 }
      }

      const valorActual = parseInt(value)
      let vlecturadigitos = valorActual
      let tipo: 'menor' | 'igual' | 'mayor' | null = null

      if (valorActual < valorActivaAnterior) {
        tipo = 'menor'
        switch (digito) {
          case 1:
            vlecturadigitos = valorActual
            break
          case 4:
            vlecturadigitos = valorActual + 10000
            break
          case 5:
            vlecturadigitos = valorActual + 100000
            break
          case 6:
            vlecturadigitos = valorActual + 1000000
            break
          case 7:
            vlecturadigitos = valorActual + 10000000
            break
          case 8:
            vlecturadigitos = valorActual + 100000000
            break
          case 10:
            vlecturadigitos = valorActual + 10000000000
            break
        }
      } else if (valorActual === valorActivaAnterior) {
        tipo = 'igual'
        vlecturadigitos = valorActual
      } else {
        tipo = 'mayor'
        vlecturadigitos = valorActual
      }

      const consumo =
        tipo === 'menor'
          ? (vlecturadigitos - valorActivaAnterior) * constante
          : (valorActual - valorActivaAnterior) * constante

      return {
        consumo: consumo.toString(),
        tipo,
        vlecturadigitos,
      }
    },
    [digito, valorActivaAnterior, constante],
  )

  // Calcular consumo de energía reactiva (función estable)
  const calcularConsumoReactiva = useCallback(
    (value: string) => {
      if (!value || isNaN(Number(value))) {
        return { consumo: '', tipo: null, vlecturadigitos: 0 }
      }

      const valorActual = parseInt(value)
      let vlecturadigitos = valorActual
      let tipo: 'menor' | 'igual' | 'mayor' | null = null

      if (valorActual < valorReactivaAnterior) {
        tipo = 'menor'
        switch (digito) {
          case 1:
            vlecturadigitos = valorActual
            break
          case 4:
            vlecturadigitos = valorActual + 10000
            break
          case 5:
            vlecturadigitos = valorActual + 100000
            break
          case 6:
            vlecturadigitos = valorActual + 1000000
            break
          case 7:
            vlecturadigitos = valorActual + 10000000
            break
          case 8:
            vlecturadigitos = valorActual + 100000000
            break
          case 10:
            vlecturadigitos = valorActual + 10000000000
            break
        }
      } else if (valorActual === valorReactivaAnterior) {
        tipo = 'igual'
        vlecturadigitos = valorActual
      } else {
        tipo = 'mayor'
        vlecturadigitos = valorActual
      }

      const consumo =
        tipo === 'menor'
          ? (vlecturadigitos - valorReactivaAnterior) * constante
          : (valorActual - valorReactivaAnterior) * constante

      return {
        consumo: consumo.toString(),
        tipo,
        vlecturadigitos,
      }
    },
    [digito, valorReactivaAnterior, constante],
  )

  // Actualizar el consumo cuando cambia el input de energía activa
  const handleActivaInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputActivaValue(value)

      if (value && !isNaN(Number(value))) {
        const resultado = calcularConsumoActiva(value)
        setConsumoActivaCalculado(resultado.consumo)
        setTipoLecturaActiva(resultado.tipo)
        setIsActivaValidated(false) // Resetear validación cuando cambia el input
      } else {
        setConsumoActivaCalculado('')
        setTipoLecturaActiva(null)
        setIsActivaValidated(false)
      }
    },
    [calcularConsumoActiva],
  )

  // Actualizar el consumo cuando cambia el input de energía reactiva
  const handleReactivaInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputReactivaValue(value)

      if (value && !isNaN(Number(value))) {
        const resultado = calcularConsumoReactiva(value)
        setConsumoReactivaCalculado(resultado.consumo)
        setTipoLecturaReactiva(resultado.tipo)
        setIsReactivaValidated(false) // Resetear validación cuando cambia el input
      } else {
        setConsumoReactivaCalculado('')
        setTipoLecturaReactiva(null)
        setIsReactivaValidated(false)
      }
    },
    [calcularConsumoReactiva],
  )

  // Actualizar datos de demanda
  const handleDemandaChange = useCallback(
    (field: keyof typeof demandaData, value: string | number) => {
      setDemandaData((prev) => ({
        ...prev,
        [field]: value,
      }))
    },
    [],
  )

  // Validar la lectura de energía activa
  const validarLecturaActiva = useCallback(() => {
    if (!inputActivaValue || isNaN(Number(inputActivaValue))) {
      toast.info(
        'Por favor ingrese un valor numérico válido para Energía Activa',
      )
      return
    }

    if (tipoLecturaActiva === 'menor') {
      setShowMenorActivaDialog(true)
    } else if (tipoLecturaActiva === 'igual') {
      setShowIgualActivaDialog(true)
    } else if (tipoLecturaActiva === 'mayor') {
      setShowMayorActivaDialog(true)
    } else {
      toast.info('Por favor ingrese un valor válido')
    }
  }, [inputActivaValue, tipoLecturaActiva])

  // Validar la lectura de energía reactiva
  const validarLecturaReactiva = useCallback(() => {
    if (!inputReactivaValue || isNaN(Number(inputReactivaValue))) {
      toast.info(
        'Por favor ingrese un valor numérico válido para Energía Reactiva',
      )
      return
    }

    if (tipoLecturaReactiva === 'menor') {
      setShowMenorReactivaDialog(true)
    } else if (tipoLecturaReactiva === 'igual') {
      setShowIgualReactivaDialog(true)
    } else if (tipoLecturaReactiva === 'mayor') {
      setShowMayorReactivaDialog(true)
    } else {
      toast.info('Por favor ingrese un valor válido')
    }
  }, [inputReactivaValue, tipoLecturaReactiva])

  // Confirmar tipo de lectura activa y registrar la clave seleccionada
  const handleConfirmLecturaActiva = useCallback(() => {
    if (selectedClaveActiva === '0') {
      toast.info('Debe seleccionar una clave para Energía Activa')
      return
    }

    // Cerrar diálogos
    setShowMenorActivaDialog(false)
    setShowIgualActivaDialog(false)

    // Marcar como validado
    setIsActivaValidated(true)
    toast.success('Lectura de Energía Activa validada correctamente')
  }, [selectedClaveActiva])

  // Confirmar lectura mayor activa
  const handleConfirmMayorActiva = useCallback(() => {
    setShowMayorActivaDialog(false)
    setIsActivaValidated(true)
    toast.success('Lectura de Energía Activa validada correctamente')
  }, [])

  // Confirmar tipo de lectura reactiva y registrar la clave seleccionada
  const handleConfirmLecturaReactiva = useCallback(() => {
    if (selectedClaveReactiva === '0') {
      toast.info('Debe seleccionar una clave para Energía Reactiva')
      return
    }

    // Cerrar diálogos
    setShowMenorReactivaDialog(false)
    setShowIgualReactivaDialog(false)

    // Marcar como validado
    setIsReactivaValidated(true)
    toast.success('Lectura de Energía Reactiva validada correctamente')
  }, [selectedClaveReactiva])

  // Confirmar lectura mayor reactiva
  const handleConfirmMayorReactiva = useCallback(() => {
    setShowMayorReactivaDialog(false)
    setIsReactivaValidated(true)
    toast.success('Lectura de Energía Reactiva validada correctamente')
  }, [])

  // Preparar datos para enviar
  const prepararDatosFormulario = useCallback(() => {
    if (
      !inputActivaValue ||
      !consumoActivaCalculado ||
      !inputReactivaValue ||
      !consumoReactivaCalculado ||
      !demandaData.dp ||
      !demandaData.ds
    )
      return null

    let claveActivaId = ''
    if (tipoLecturaActiva === 'mayor') {
      claveActivaId = '23'
    } else if (selectedClaveActiva !== '0') {
      claveActivaId = selectedClaveActiva
    } else {
      return null
    }

    let claveReactivaId = ''
    if (tipoLecturaReactiva === 'mayor') {
      claveReactivaId = '23'
    } else if (selectedClaveReactiva !== '0') {
      claveReactivaId = selectedClaveReactiva
    } else {
      return null
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
      dsHora: demandaData.dsHora,
    }

    return data
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
  ])

  // Guardar la lectura
  const guardarLectura = useCallback(async () => {
    if (!isActivaValidated) {
      toast.error('Por favor valide la lectura de Energía Activa primero')
      return
    }

    if (!isReactivaValidated) {
      toast.error('Por favor valide la lectura de Energía Reactiva primero')
      return
    }

    if (
      demandaData.dp === undefined ||
      !demandaData.dpFecha ||
      !demandaData.dpHora ||
      demandaData.ds === undefined ||
      !demandaData.dsFecha ||
      !demandaData.dsHora
    ) {
      toast.error('Por favor complete todos los datos de Demanda')
      return
    }

    const data = prepararDatosFormulario()

    if (!data) {
      toast.error(
        'No se pueden guardar los datos. Por favor complete y valide todos los campos.',
      )
      return
    }

    try {
      setIsSubmitting(true)
      const response = await api.put('/actualizar-lectura-bt-4-3', data)
      if (response.status === 200) {
        toast.success('Lectura BT-4.3 actualizada correctamente')
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error('Error al actualizar la lectura BT-4.3')
      }
    } catch (error: any) {
      console.error('Error al enviar los datos BT-4.3:', error)
      toast.error(
        `Error al conectar con el servidor: ${
          error.message || 'Error desconocido'
        }`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [
    isActivaValidated,
    isReactivaValidated,
    demandaData,
    prepararDatosFormulario,
    onSuccess,
  ])

  const clavesOptions = useMemo(
    () => [
      { value: '0', label: 'Seleccione' },
      { value: '1', label: 'CSCR - CONSUMO SUPERA CRITERIO DE RANGO' },
      { value: '19', label: 'MRST - MEDIDOR REINICIO LECTURA' },
    ],
    [],
  )

  const clavesIgualOptions = useMemo(
    () => [
      { value: '0', label: 'Seleccione' },
      { value: '3', label: 'RCER - LOCAL CERRADO' },
      { value: '5', label: 'LENR - LECTURA NO REALIZADA' },
      { value: '15', label: 'MCRT - MEDIDOR CORTADO' },
      { value: '25', label: 'SCSM - MEDIDOR NO REGISTRA CONSUMO' },
    ],
    [],
  )

  return (
    <div className="p-6 space-y-6">
      {/* Energía Activa */}
      <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100 text-lg font-semibold">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg font-semibold">Energía Activa</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                Lectura y validación del consumo activo
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Lectura Actual
              </Label>
              <Input
                type="number"
                placeholder={valorActivaAnterior.toString()}
                value={inputActivaValue}
                onChange={handleActivaInputChange}
                className="bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Consumo Calculado
              </Label>
              <div className="h-10 px-3 flex items-center bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-mono text-slate-900 dark:text-slate-100">
                {consumoActivaCalculado || '0'}
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={validarLecturaActiva}
                disabled={!inputActivaValue || isSubmitting || isActivaValidated}
                className="w-full border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              >
                {isActivaValidated ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Validado
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Validar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Alertas para Energía Activa */}
          {Number(consumoActivaCalculado) < 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El consumo de energía activa es negativo, por favor verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {Number(consumoActivaCalculado) === 0 && inputActivaValue && (
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                El consumo de energía activa es cero, verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {isActivaValidated && (
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Lectura de energía activa validada correctamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Energía Reactiva */}
      <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100 text-lg font-semibold">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
              <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-semibold">Energía Reactiva</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                Lectura y validación del consumo reactivo
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <Gauge className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Lectura Actual
              </Label>
              <Input
                type="number"
                placeholder={valorReactivaAnterior.toString()}
                value={inputReactivaValue}
                onChange={handleReactivaInputChange}
                className="bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Consumo Calculado
              </Label>
              <div className="h-10 px-3 flex items-center bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-mono text-slate-900 dark:text-slate-100">
                {consumoReactivaCalculado || '0'}
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={validarLecturaReactiva}
                disabled={!inputReactivaValue || isSubmitting || isReactivaValidated}
                className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                {isReactivaValidated ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Validado
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Validar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Alertas para Energía Reactiva */}
          {Number(consumoReactivaCalculado) < 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                El consumo de energía reactiva es negativo, por favor verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {Number(consumoReactivaCalculado) === 0 && inputReactivaValue && (
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                El consumo de energía reactiva es cero, verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {isReactivaValidated && (
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Lectura de energía reactiva validada correctamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Datos de Demanda */}
      <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100 text-lg font-semibold">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg">
              <BarChart2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-lg font-semibold">Datos de Demanda</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                Configuración de demandas punta y suministrada
              </p>
            </div>
          </CardTitle>
          {!isActivaValidated || !isReactivaValidated ? (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Los datos de demanda se habilitarán una vez validadas las lecturas de energía activa y reactiva.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Demanda Punta */}
          <div className="p-4 bg-blue-50/30 dark:bg-blue-950/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Demanda Punta
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Valor (kW)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={demandaData.dp.toString()}
                  onChange={(e) => handleDemandaChange('dp', parseFloat(e.target.value) || 0)}
                  disabled={!isActivaValidated || !isReactivaValidated}
                  className="bg-white dark:bg-slate-900/30 border-blue-200 dark:border-blue-800 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Fecha
                </Label>
                <Input
                  type="date"
                  value={demandaData.dpFecha || ''}
                  onChange={(e) => handleDemandaChange('dpFecha', e.target.value)}
                  disabled={!isActivaValidated || !isReactivaValidated}
                  className="bg-white dark:bg-slate-900/30 border-blue-200 dark:border-blue-800"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Hora
                </Label>
                <Input
                  type="time"
                  value={demandaData.dpHora || ''}
                  onChange={(e) => handleDemandaChange('dpHora', e.target.value)}
                  disabled={!isActivaValidated || !isReactivaValidated}
                  className="bg-white dark:bg-slate-900/30 border-blue-200 dark:border-blue-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Demanda Suministrada */}
          <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/30 dark:border-emerald-800/30">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Demanda Suministrada
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Valor (kW)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={demandaData.ds.toString()}
                  onChange={(e) => handleDemandaChange('ds', parseFloat(e.target.value) || 0)}
                  disabled={!isActivaValidated || !isReactivaValidated}
                  className="bg-white dark:bg-slate-900/30 border-emerald-200 dark:border-emerald-800 font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Fecha
                </Label>
                <Input
                  type="date"
                  value={demandaData.dsFecha || ''}
                  onChange={(e) => handleDemandaChange('dsFecha', e.target.value)}
                  disabled={!isActivaValidated || !isReactivaValidated}
                  className="bg-white dark:bg-slate-900/30 border-emerald-200 dark:border-emerald-800"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Hora
                </Label>
                <Input
                  type="time"
                  value={demandaData.dsHora || ''}
                  onChange={(e) => handleDemandaChange('dsHora', e.target.value)}
                  disabled={!isActivaValidated || !isReactivaValidated}
                  className="bg-white dark:bg-slate-900/30 border-emerald-200 dark:border-emerald-800 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end pt-4">
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
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Guardar Lecturas
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diálogos para energía activa */}
      <ConfirmationDialog
        isOpen={showMenorActivaDialog}
        onOpenChange={setShowMenorActivaDialog}
        title="Confirmar lectura activa menor"
        message="La lectura activa ingresada es menor que la anterior. Por favor seleccione un motivo."
        variant="default"
        alertColor="yellow"
        claveOptions={clavesOptions}
        selectedClave={selectedClaveActiva}
        onClaveChange={setSelectedClaveActiva}
        showClaveSelect={true}
        onConfirm={handleConfirmLecturaActiva}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showIgualActivaDialog}
        onOpenChange={setShowIgualActivaDialog}
        title="Confirmar lectura activa igual"
        message="La lectura activa ingresada es igual a la anterior. Por favor seleccione un motivo."
        variant="default"
        alertColor="yellow"
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
        title="Confirmar lectura activa"
        message="¿Está seguro de que la lectura activa es correcta?"
        alertColor="blue"
        onConfirm={handleConfirmMayorActiva}
        isSubmitting={isSubmitting}
      />

      {/* Diálogos para energía reactiva */}
      <ConfirmationDialog
        isOpen={showMenorReactivaDialog}
        onOpenChange={setShowMenorReactivaDialog}
        title="Confirmar lectura reactiva menor"
        message="La lectura reactiva ingresada es menor que la anterior. Por favor seleccione un motivo."
        variant="default"
        alertColor="yellow"
        claveOptions={clavesOptions}
        selectedClave={selectedClaveReactiva}
        onClaveChange={setSelectedClaveReactiva}
        showClaveSelect={true}
        onConfirm={handleConfirmLecturaReactiva}
        isSubmitting={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={showIgualReactivaDialog}
        onOpenChange={setShowIgualReactivaDialog}
        title="Confirmar lectura reactiva igual"
        message="La lectura reactiva ingresada es igual a la anterior. Por favor seleccione un motivo."
        variant="default"
        alertColor="yellow"
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
        title="Confirmar lectura reactiva"
        message="¿Está seguro de que la lectura reactiva es correcta?"
        alertColor="blue"
        onConfirm={handleConfirmMayorReactiva}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}
