import React, { useState } from 'react'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { AlertCircle, Key, FileText, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import type { MedidorNichoItem } from '~/types/monitor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import api from '~/lib/api'

interface ReaperturaFormProps {
  result: MedidorNichoItem
  onSuccess?: () => void
}

export function ReaperturaForm({ result, onSuccess }: ReaperturaFormProps) {
  const [selectedClave, setSelectedClave] = useState('0')
  const [descripcionReapertura, setDescripcionReapertura] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Función para manejar la reapertura de mediciones en estado 4
  const handleReaperturaMedicion = () => {
    // Validar que se haya seleccionado una clave
    if (selectedClave === '0') {
      toast.warning('Debe seleccionar un motivo de reapertura')
      return
    }

    // Validar que se haya ingresado una descripción
    if (!descripcionReapertura.trim()) {
      toast.warning(
        'Debe ingresar una descripción detallada del motivo de reapertura',
      )
      return
    }

    // Validar que la descripción tenga al menos 10 caracteres
    if (descripcionReapertura.trim().length < 10) {
      toast.warning('La descripción debe tener al menos 10 caracteres')
      return
    }

    // Preparar los datos para enviar al servidor
    const dataToSend = {
      lecturaId: result.LM_ID.toString(),
      claveId: parseInt(selectedClave),
      descripcion: descripcionReapertura.trim(),
    }

    reabrirMedicion(dataToSend)
  }

  // Función para reabrir mediciones
  const reabrirMedicion = async (data: any) => {
    try {
      setIsSubmitting(true)

      const response = await api.post('/habilitar-edicion-lectura', data)

      if (response.status === 200) {
        toast.success(
          'Medición reabierta correctamente. Ya puede editar los valores.',
        )

        // Llamar al callback de éxito para cerrar el diálogo principal y actualizar la lista
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(
          `Error al reabrir la medición: ${
            response.data &&
            typeof response.data === 'object' &&
            'message' in response.data
              ? response.data.message
              : 'Error desconocido'
          }`,
        )
      }
    } catch (error: any) {
      console.error('Error al reabrir la medición:', error)

      // Mostrar mensaje de error más detallado
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        toast.error(
          `Error del servidor: ${
            error.response.data?.message ||
            error.response.statusText ||
            'Error desconocido'
          }`,
        )
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        toast.error(
          'No se recibió respuesta del servidor. Verifique su conexión a internet.',
        )
      } else {
        // Algo ocurrió al configurar la solicitud
        toast.error(
          `Error al procesar la solicitud: ${
            error.message || 'Error desconocido'
          }`,
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <Alert
        variant="default"
        className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
      >
        <AlertCircle className="h-4 w-4 mb-1 mr-2" />
        <AlertDescription className="text-sm">
          Esta medición ya ha sido cerrada. Para reabrirla, debe seleccionar un
          motivo de reapertura y proporcionar una descripción detallada.
        </AlertDescription>
      </Alert>
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="p-4 pb-2 bg-muted/40 border-b border-border/40">
          <CardTitle className="text-base font-medium text-sky-800 dark:text-sky-200 flex items-center gap-1.5">
            <Key className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            Reapertura de Medición
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5" />
              Motivo de reapertura
            </Label>
            <Select value={selectedClave} onValueChange={setSelectedClave}>
              <SelectTrigger className="bg-background border-border/70">
                <SelectValue placeholder="Seleccione un motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Seleccione un motivo</SelectItem>
                <SelectItem value="27">
                  EELD - ERROR EN LA DIGITACIÓN
                </SelectItem>
                <SelectItem value="28">EEEC - ERROR EN EL CIERRE</SelectItem>
                <SelectItem value="29">EELC - ERROR EN LA CONEXIÓN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Descripción detallada
            </Label>
            <Textarea
              placeholder="Explique con detalle por qué necesita reaperturar esta medición (mínimo 10 caracteres)."
              value={descripcionReapertura}
              onChange={(e) => setDescripcionReapertura(e.target.value)}
              className="bg-background border-border/70 min-h-24 resize-none text-sm"
            />
          </div>
          <Button
            onClick={handleReaperturaMedicion}
            disabled={isSubmitting}
            className="w-full gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Reabrir Medición
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
