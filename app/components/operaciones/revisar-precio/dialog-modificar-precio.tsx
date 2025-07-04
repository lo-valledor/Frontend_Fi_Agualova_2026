import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  PencilIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Edit3,
} from 'lucide-react';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { Alert, AlertDescription } from '~/components/ui/alert';
import api from '~/lib/api';
import { toast } from 'sonner';
import { useAuth } from '~/context/AuthContext';

interface DialogModificarPrecioProps {
  isAuthorized: boolean;
  indice: number;
  descripcion?: string;
  valorActual?: string;
  onSuccess?: () => void;
}

export default function DialogModificarPrecio({
  isAuthorized,
  indice,
  descripcion = '',
  valorActual = '',
  onSuccess,
}: DialogModificarPrecioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [valor, setValor] = useState(valorActual);
  const [motivo, setMotivo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const resetForm = () => {
    setValor(valorActual);
    setMotivo('');
    setError('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const validateForm = (): boolean => {
    if (!valor.trim()) {
      setError('El valor es obligatorio');
      return false;
    }

    if (isNaN(Number(valor)) || Number(valor) <= 0) {
      setError('El valor debe ser un número positivo');
      return false;
    }

    if (!motivo.trim()) {
      setError('El motivo es obligatorio');
      return false;
    }

    if (motivo.length < 5) {
      setError('El motivo debe tener al menos 5 caracteres');
      return false;
    }

    return true;
  };

  const handleConfirmar = async () => {
    if (!user) {
      toast.error('No se pudo obtener información del usuario');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        indice: indice,
        valor: valor,
        motivo: motivo,
        usuario: user.username,
      };

      const response = await api.post(
        `/modificar-precio-cargo-correccion`,
        payload,
      );

      if (response.status === 200) {
        toast.success('Precio modificado correctamente');
        setIsOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('No se pudo modificar el precio');
        toast.error('No se pudo modificar el precio');
      }
    } catch (error: any) {
      console.error('Error al modificar precio:', error);

      // Manejo específico de errores de autorización vs errores de sesión
      if (error.response?.status === 401) {
        const errorMessage =
          error.response.data?.mensaje || error.response.data?.message || '';

        if (
          errorMessage.toLowerCase().includes('contraseña') ||
          errorMessage.toLowerCase().includes('password') ||
          errorMessage.toLowerCase().includes('clave') ||
          errorMessage.toLowerCase().includes('credenciales') ||
          errorMessage.toLowerCase().includes('autorización') ||
          errorMessage.toLowerCase().includes('permisos')
        ) {
          // Error de autorización específico - NO cerrar sesión
          setError(
            'No tienes permisos para modificar este valor. Verifica tu autorización.',
          );
          toast.error('No tienes permisos para modificar este valor.');
        } else {
          // Error de sesión expirada
          setError(
            'Sesión expirada. Recarga la página e inicia sesión nuevamente.',
          );
          toast.error('Sesión expirada. Serás redirigido al login.');
        }
        return;
      }

      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data?.mensaje || 'Datos incorrectos';
        setError(`Error en los datos: ${errorMessage}`);
        toast.error(`Error en los datos: ${errorMessage}`);
        return;
      }

      if (error.response?.status === 403) {
        setError('No tienes permisos para realizar esta modificación.');
        toast.error('No tienes permisos para realizar esta modificación.');
        return;
      }

      if (error.response?.status === 422) {
        const errorMessage =
          error.response.data?.mensaje || 'Datos de validación incorrectos';
        setError(`Error de validación: ${errorMessage}`);
        toast.error(`Error de validación: ${errorMessage}`);
        return;
      }

      if (error.response) {
        const errorMessage =
          error.response.data?.mensaje ||
          error.response.data?.message ||
          'Error al procesar la solicitud';
        setError(`Error ${error.response.status}: ${errorMessage}`);
        toast.error(`Error ${error.response.status}: ${errorMessage}`);
      } else if (error.request) {
        setError('No se recibió respuesta del servidor. Verifica tu conexión.');
        toast.error(
          'No se recibió respuesta del servidor. Verifica tu conexión.',
        );
      } else {
        setError(`Error: ${error.message}`);
        toast.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          disabled={!isAuthorized}
        >
          <Edit3 className="h-4 w-4 mr-1" />
          Modificar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <PencilIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Modificar Precio
              </DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Modifica el valor del cargo y especifica el motivo del cambio
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {descripcion && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Descripción
              </Label>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm border border-slate-200 dark:border-slate-700">
                {descripcion}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Índice
              </Label>
              <Input
                type="text"
                value={indice}
                disabled
                className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Valor Actual
              </Label>
              <Input
                type="text"
                value={valorActual}
                disabled
                className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="valor"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Nuevo Valor
            </Label>
            <Input
              id="valor"
              type="number"
              placeholder="Ingrese el nuevo valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              min="0"
              step="0.01"
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="motivo"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Motivo de la Modificación
            </Label>
            <Textarea
              id="motivo"
              placeholder="Especifique el motivo de la modificación"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="min-h-[80px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="border-red-200 dark:border-red-800"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Actualizar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
