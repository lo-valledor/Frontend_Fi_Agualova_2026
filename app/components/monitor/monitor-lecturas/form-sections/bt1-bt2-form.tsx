import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Alert, AlertDescription } from '~/components/ui/alert'
import {
  AlertCircle,
  FileText,
  Gauge,
  Calculator,
  Loader2,
  Check,
} from 'lucide-react'
import { toast } from 'sonner'
import type { FormDataBT1y2, MedidorNichoItem } from '~/types/monitor'
import { ConfirmationDialog } from '../dialogs/confirmation-dialog'
import api from '~/lib/api'

interface BT1BT2FormProps {
  result: MedidorNichoItem
  onSuccess?: () => void
}

export function BT1BT2Form({ result, onSuccess }: BT1BT2FormProps) {
  // Valores fijos del medidor
  const digito = useMemo(() => result.ME_Digitos, [result.ME_Digitos])
  const valorAnterior = useMemo(
    () => result.LM_ValorUltimaLectura,
    [result.LM_ValorUltimaLectura],
  )
  const constante = useMemo(
    () => result.ME_ConstanteMultiplicar,
    [result.ME_ConstanteMultiplicar],
  )

  // Estado del formulario
  const [inputValue, setInputValue] = useState('')
  const [consumoCalculado, setConsumoCalculado] = useState('')
  const [tipoLectura, setTipoLectura] = useState<
    'menor' | 'igual' | 'mayor' | null
  >(null)
  const [selectedClave, setSelectedClave] = useState('0')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidated, setIsValidated] = useState(false)

  // Diálogos
  const [showMenorDialog, setShowMenorDialog] = useState(false)
  const [showIgualDialog, setShowIgualDialog] = useState(false)
  const [showMayorDialog, setShowMayorDialog] = useState(false)

  // Función estable para calcular el consumo
  const calcularConsumo = useCallback(
    (value: string) => {
      if (!value || isNaN(Number(value))) {
        return { consumo: '', tipo: null, vlecturadigitos: 0 }
      }

      const valorActual = parseInt(value)
      let vlecturadigitos = valorActual
      let tipo: 'menor' | 'igual' | 'mayor' | null = null

      if (valorActual < valorAnterior) {
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
      } else if (valorActual === valorAnterior) {
        tipo = 'igual'
        vlecturadigitos = valorActual
      } else {
        tipo = 'mayor'
        vlecturadigitos = valorActual
      }

      const consumo =
        tipo === 'menor'
          ? (vlecturadigitos - valorAnterior) * constante
          : (valorActual - valorAnterior) * constante

      return {
        consumo: consumo.toString(),
        tipo,
        vlecturadigitos,
      }
    },
    [digito, valorAnterior, constante],
  )

  // Actualizar el consumo cuando cambia el input
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setInputValue(value)

      if (value && !isNaN(Number(value))) {
        const resultado = calcularConsumo(value)
        setConsumoCalculado(resultado.consumo)
        setTipoLectura(resultado.tipo)
        setIsValidated(false) // Resetear validación cuando cambia el input
      } else {
        setConsumoCalculado('')
        setTipoLectura(null)
        setIsValidated(false)
      }
    },
    [calcularConsumo],
  )

  // Validar la lectura
  const validarLectura = useCallback(() => {
    if (!inputValue || isNaN(Number(inputValue))) {
      toast.info('Por favor ingrese un valor numérico válido')
      return
    }

    if (tipoLectura === 'menor') {
      setShowMenorDialog(true)
    } else if (tipoLectura === 'igual') {
      setShowIgualDialog(true)
    } else if (tipoLectura === 'mayor') {
      setShowMayorDialog(true)
    } else {
      toast.info('Por favor ingrese un valor válido')
    }
  }, [inputValue, tipoLectura])

  // Preparar datos para enviar
  const prepararDatosFormulario = useCallback(() => {
    if (!inputValue || !consumoCalculado) return null

    const data: FormDataBT1y2 = {
      lmid: result.LM_ID.toString(),
      vactual: inputValue,
      consumo: consumoCalculado,
      claid: '',
    }

    if (tipoLectura === 'mayor') {
      data.claid = '23'
    } else if (selectedClave !== '0') {
      data.claid = selectedClave
    } else {
      return null
    }

    return data
  }, [inputValue, consumoCalculado, result.LM_ID, tipoLectura, selectedClave])

  // Confirmar tipo de lectura y registrar la clave seleccionada
  const handleConfirmLectura = useCallback(
    (tipo: 'menor' | 'igual') => {
      if (selectedClave === '0') {
        toast.info('Debe seleccionar una clave')
        return
      }

      // Cerrar el diálogo correspondiente
      if (tipo === 'menor') {
        setShowMenorDialog(false)
      } else if (tipo === 'igual') {
        setShowIgualDialog(false)
      }

      // Marcar como validado
      setIsValidated(true)
      toast.success('Lectura validada correctamente')
    },
    [selectedClave],
  )

  // Confirmar lectura mayor
  const handleConfirmMayor = useCallback(() => {
    setShowMayorDialog(false)
    setIsValidated(true)
    toast.success('Lectura validada correctamente')
  }, [])

  // Guardar la lectura
  const guardarLectura = useCallback(async () => {
    const data = prepararDatosFormulario()

    if (!data) {
      toast.error(
        'No se pueden guardar los datos. Por favor valide la lectura primero.',
      )
      return
    }

    try {
      setIsSubmitting(true)
      const response = await api.put('/actualizar-lectura-bt-1-bt-2', data)

      if (response.status === 200) {
        toast.success('Lectura actualizada correctamente')
        if (onSuccess) {
          onSuccess()
        }
      } else {
        console.log('Respuesta del servidor:', response)
        toast.error('Error al actualizar la lectura')
      }
    } catch (error: any) {
      console.error('Error al enviar los datos:', error)
      toast.error(
        `Error al conectar con el servidor: ${
          error.message || 'Error desconocido'
        }`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [prepararDatosFormulario, onSuccess])

  const clavesMenorOptions = useMemo(
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
            <Gauge className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            Datos de Lectura y Consumo BT-1/BT-2
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5" />
                Lectura Actual
              </Label>
              <Input
                type="number"
                placeholder={valorAnterior.toString()}
                value={inputValue}
                onChange={handleInputChange}
                className="bg-background border-border/70 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5" />
                Consumo Calculado
              </Label>
              <div className="h-10 px-3 flex items-center bg-muted/30 border border-border/70 rounded-md text-sm font-mono">
                {consumoCalculado || '0'}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Button
                variant="outline"
                onClick={validarLectura}
                disabled={!inputValue || isSubmitting || isValidated}
                className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                <Check className="h-4 w-4" />
                Validar
              </Button>
            </div>
          </div>

          {Number(consumoCalculado) < 0 && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                El consumo es negativo, por favor verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {Number(consumoCalculado) === 0 && inputValue && (
            <Alert
              variant="default"
              className="py-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                El consumo es cero, verifique la lectura.
              </AlertDescription>
            </Alert>
          )}

          {isValidated && (
            <Alert
              variant="default"
              className="py-2 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
            >
              <Check className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Lectura validada correctamente, puede proceder a guardar.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              onClick={guardarLectura}
              disabled={!isValidated || isSubmitting}
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
        onOpenChange={setShowMenorDialog}
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
        onOpenChange={setShowIgualDialog}
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
  )
}
