import { AlertCircle, FileText, Key, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import api from '~/lib/api';
import type { MedidorNichoItem } from '~/types/monitor';

interface ReaperturaFormProps {
  result: MedidorNichoItem;
  onSuccess?: () => void;
}

export function ReaperturaForm({ result, onSuccess }: ReaperturaFormProps) {
  const [selectedClave, setSelectedClave] = useState('0');
  const [descripcionReapertura, setDescripcionReapertura] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, _setIsOpen] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setSelectedClave('0');
      setDescripcionReapertura('');
    }
  }, [isOpen]);

  // Función para manejar la reapertura de mediciones en estado 4
  const handleReaperturaMedicion = () => {
    // Validar que se haya seleccionado una clave
    if (selectedClave === '0') {
      toast.warning('Debe seleccionar un motivo de reapertura');
      return;
    }

    // Validar que se haya ingresado una descripción
    if (!descripcionReapertura.trim()) {
      toast.warning(
        'Debe ingresar una descripción detallada del motivo de reapertura'
      );
      return;
    }

    // Validar que la descripción tenga al menos 10 caracteres
    if (descripcionReapertura.trim().length < 10) {
      toast.warning('La descripción debe tener al menos 10 caracteres');
      return;
    }

    // Preparar los datos para enviar al servidor
    const dataToSend = {
      lecturaId: result.LM_ID.toString(),
      claveId: Number.parseInt(selectedClave),
      descripcion: descripcionReapertura.trim()
    };

    reabrirMedicion(dataToSend);
  };

  // Función para reabrir mediciones
  const reabrirMedicion = async (data: any) => {
    try {
      setIsSubmitting(true);

      const response = await api.post('/habilitar-edicion-lectura', data);

      if (response.status === 200) {
        toast.success(
          'Medición reabierta correctamente. Ya puede editar los valores.'
        );

        // Llamar al callback de éxito para cerrar el diálogo principal y actualizar la lista
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(
          `Error al reabrir la medición: ${
            response.data &&
            typeof response.data === 'object' &&
            'message' in response.data
              ? response.data.message
              : 'Error desconocido'
          }`
        );
      }
    } catch (error: any) {
      // Mostrar mensaje de error más detallado
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        toast.error(
          `Error del servidor: ${
            error.response.data?.message ||
            error.response.statusText ||
            'Error desconocido'
          }`
        );
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        toast.error(
          'No se recibió respuesta del servidor. Verifique su conexión a internet.'
        );
      } else {
        // Algo ocurrió al configurar la solicitud
        toast.error(
          `Error al procesar la solicitud: ${
            error.message || 'Error desconocido'
          }`
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Alerta informativa compacta */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-xl border border-border">
        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
        <span>
          Medición cerrada. Seleccione un motivo y proporcione una descripción
          para reabrirla.
        </span>
      </div>

      {/* Formulario compacto */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="px-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-sm font-medium">
            <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
              <RotateCcw className="h-3 w-3 text-primary" />
            </div>
            <span>Reapertura de Medición</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 space-y-3">
          {/* Motivo de reapertura */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Key className="h-3 w-3" />
              Motivo de reapertura
            </Label>
            <Select value={selectedClave} onValueChange={setSelectedClave}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Seleccione un motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Seleccione un motivo</SelectItem>
                <SelectItem value="27">
                  EELD - Error en la digitación
                </SelectItem>
                <SelectItem value="28">EEEC - Error en el cierre</SelectItem>
                <SelectItem value="29">EELC - Error en la conexión</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descripción detallada */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              Descripción detallada
            </Label>
            <Textarea
              placeholder="Explique el motivo de la reapertura (mínimo 10 caracteres)"
              value={descripcionReapertura}
              onChange={e => setDescripcionReapertura(e.target.value)}
              className="min-h-20 resize-none text-sm"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mínimo 10 caracteres</span>
              <span
                className={
                  descripcionReapertura.length < 10
                    ? 'text-destructive'
                    : 'text-emerald-500'
                }
              >
                {descripcionReapertura.length}/10
              </span>
            </div>
          </div>

          {/* Botón de acción */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleReaperturaMedicion}
              disabled={isSubmitting}
              className="px-4 h-8 text-xs bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                  Procesando...
                </>
              ) : (
                <>
                  <RotateCcw className="h-3 w-3 mr-1.5" />
                  Reabrir
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
