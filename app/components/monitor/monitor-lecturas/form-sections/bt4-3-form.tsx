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
      console.log('Respuesta del servidor:', response)
      if (response.status === 200) {
        toast.success('Lectura BT-4.3 actualizada correctamente')
        if (onSuccess) {
          onSuccess()
        }
      } else {
        console.log('Respuesta del servidor:', response)
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
    <div className="p-4 space-y-4">
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="p-4 pb-2 bg-muted/40 border-b border-border/40">
          <CardTitle className="text-base font-medium text-sky-800 dark:text-sky-200 flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            Energía Activa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                Lectura Actual
              </Label>
              <Input
                type="number"
                placeholder={valorActivaAnterior.toString()}
                value={inputActivaValue}
                onChange={handleActivaInputChange}
                className="bg-background border-border/70 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5" />
                Consumo Calculado
              </Label>
              <div className="h-10 px-3 flex items-center bg-muted/30 border border-border/70 rounded-md text-sm font-mono">
                {consumoActivaCalculado || '0'}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                onClick={validarLecturaActiva}
                disabled={
                  !inputActivaValue || isSubmitting || isActivaValidated
                }
                className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                <Check className="h-4 w-4" />
                Validar
              </Button>
            </div>
          </div>

          {Number(consumoActivaCalculado) < 0 && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                El consumo de energía activa es negativo, por favor verifique la
                lectura.
              </AlertDescription>
            </Alert>
          )}

          {Number(consumoActivaCalculado) === 0 && inputActivaValue && (
            <Alert
              variant="default"
              className="py-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                El consumo de energía activa es cero, verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {isActivaValidated && (
            <Alert
              variant="default"
              className="py-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
            >
              <Check className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Lectura de energía activa validada correctamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-sm">
        <CardHeader className="p-4 pb-2 bg-muted/40 border-b border-border/40">
          <CardTitle className="text-base font-medium text-sky-800 dark:text-sky-200 flex items-center gap-1.5">
            <BarChart className="h-4 w-4 text-green-600 dark:text-green-400" />
            Energía Reactiva
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                Lectura Actual
              </Label>
              <Input
                type="number"
                placeholder={valorReactivaAnterior.toString()}
                value={inputReactivaValue}
                onChange={handleReactivaInputChange}
                className="bg-background border-border/70 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5" />
                Consumo Calculado
              </Label>
              <div className="h-10 px-3 flex items-center bg-muted/30 border border-border/70 rounded-md text-sm font-mono">
                {consumoReactivaCalculado || '0'}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                onClick={validarLecturaReactiva}
                disabled={
                  !inputReactivaValue || isSubmitting || isReactivaValidated
                }
                className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                <Check className="h-4 w-4" />
                Validar
              </Button>
            </div>
          </div>

          {Number(consumoReactivaCalculado) < 0 && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                El consumo de energía reactiva es negativo, por favor verifique
                la lectura.
              </AlertDescription>
            </Alert>
          )}

          {Number(consumoReactivaCalculado) === 0 && inputReactivaValue && (
            <Alert
              variant="default"
              className="py-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                El consumo de energía reactiva es cero, verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {isReactivaValidated && (
            <Alert
              variant="default"
              className="py-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
            >
              <Check className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Lectura de energía reactiva validada correctamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40 shadow-sm">
        <CardHeader className="p-4 pb-2 bg-muted/40 border-b border-border/40">
          <CardTitle className="text-base font-medium text-sky-800 dark:text-sky-200 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Datos de Demanda
          </CardTitle>
          {!isActivaValidated && !isReactivaValidated && (
            <CardDescription className="text-sm mt-2">
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Los datos de demanda se habilitarán una vez validadas las lecturas de energía activa y reactiva.
                </AlertDescription>
              </Alert>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5" />
                Demanda Punta
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Demanda Punta"
                value={demandaData.dp.toString()}
                onChange={(e) =>
                  handleDemandaChange('dp', parseFloat(e.target.value) || 0)
                }
                disabled={!isActivaValidated || !isReactivaValidated}
              />
              
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                Fecha
              </Label>
              <Input
                type="date"
                value={demandaData.dpFecha || ''}
                onChange={(e) => handleDemandaChange('dpFecha', e.target.value)}
                className="bg-background border-border/70 text-sm"
                disabled={!isActivaValidated || !isReactivaValidated}
                />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Hora
              </Label>
              <Input
                type="time"
                value={demandaData.dpHora || ''}
                onChange={(e) => handleDemandaChange('dpHora', e.target.value)}
                className="bg-background border-border/70 text-sm"
                disabled={!isActivaValidated || !isReactivaValidated}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <BarChart2 className="h-3.5 w-3.5" />
                Demanda Suministrada
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Demanda Suministrada"
                value={demandaData.ds.toString()}
                onChange={(e) =>
                  handleDemandaChange('ds', parseFloat(e.target.value) || 0)
                }
                className="bg-background border-border/70 text-sm"
                disabled={!isActivaValidated || !isReactivaValidated} 
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                Fecha
              </Label>
              <Input
                type="date"
                value={demandaData.dsFecha || ''}
                onChange={(e) => handleDemandaChange('dsFecha', e.target.value)}
                className="bg-background border-border/70 text-sm"
                disabled={!isActivaValidated || !isReactivaValidated}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Hora
              </Label>
              <Input
                type="time"
                value={demandaData.dsHora || ''}
                onChange={(e) => handleDemandaChange('dsHora', e.target.value)}
                className="bg-background border-border/70 text-sm"
                disabled={!isActivaValidated || !isReactivaValidated}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
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
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
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
