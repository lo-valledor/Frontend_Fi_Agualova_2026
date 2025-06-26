import React, { useState } from 'react';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { AlertCircle, Key, FileText, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { MedidorNichoItem } from '~/types/monitor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import api from '~/lib/api';

interface ReaperturaFormProps {
  result: MedidorNichoItem;
  onSuccess?: () => void;
}

export function ReaperturaForm({ result, onSuccess }: ReaperturaFormProps) {
  const [selectedClave, setSelectedClave] = useState('0');
  const [descripcionReapertura, setDescripcionReapertura] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        'Debe ingresar una descripción detallada del motivo de reapertura',
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
      claveId: parseInt(selectedClave),
      descripcion: descripcionReapertura.trim(),
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
          'Medición reabierta correctamente. Ya puede editar los valores.',
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
          }`,
        );
      }
    } catch (error: any) {
      console.error('Error al reabrir la medición:', error);

      // Mostrar mensaje de error más detallado
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        toast.error(
          `Error del servidor: ${
            error.response.data?.message ||
            error.response.statusText ||
            'Error desconocido'
          }`,
        );
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        toast.error(
          'No se recibió respuesta del servidor. Verifique su conexión a internet.',
        );
      } else {
        // Algo ocurrió al configurar la solicitud
        toast.error(
          `Error al procesar la solicitud: ${
            error.message || 'Error desconocido'
          }`,
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Alerta informativa */}
      <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Esta medición ya ha sido cerrada. Para reabrirla, debe seleccionar un
          motivo de reapertura y proporcionar una descripción detallada.
        </AlertDescription>
      </Alert>

      {/* Card principal */}
      <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100 text-lg font-semibold">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/50 rounded-lg">
              <RotateCcw className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-lg font-semibold">Reapertura de Medición</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                Seleccione motivo y proporcione descripción
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Motivo de reapertura */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <Key className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Motivo de reapertura
            </Label>
            <Select value={selectedClave} onValueChange={setSelectedClave}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800">
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

          {/* Descripción detallada */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Descripción detallada
            </Label>
            <Textarea
              placeholder="Explique con detalle por qué necesita reaperturar esta medición (mínimo 10 caracteres)."
              value={descripcionReapertura}
              onChange={(e) => setDescripcionReapertura(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 min-h-24 resize-none"
            />
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Mínimo 10 caracteres</span>
              <span
                className={
                  descripcionReapertura.length < 10
                    ? 'text-red-500'
                    : 'text-green-600'
                }
              >
                {descripcionReapertura.length}/10
              </span>
            </div>
          </div>

          {/* Botón de acción */}
          <div className="pt-4">
            <Button
              onClick={handleReaperturaMedicion}
              disabled={isSubmitting}
              className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reabrir Medición
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
