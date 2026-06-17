import {
  AlertCircle,
  CheckCircle,
  Edit3,
  Loader2,
  PencilIcon
} from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import { useAuth } from '~/context/AuthContext';
import api from '~/lib/api';

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
  onSuccess
}: DialogModificarPrecioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [valor, setValor] = useState(valorActual);
  const [motivo, setMotivo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const canModify = isAuthorized;

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

    if (Number.isNaN(Number(valor)) || Number(valor) <= 0) {
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
        usuario: user.username
      };

      const response = await api.post(
        `/modificar-precio-cargo-correccion`,
        payload
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
            'No tienes permisos para modificar este valor. Verifica tu autorización.'
          );
          toast.error('No tienes permisos para modificar este valor.');
        } else {
          // Error de sesión expirada
          setError(
            'Sesión expirada. Recarga la página e inicia sesión nuevamente.'
          );
          toast.error('Contraseña incorrecta.');
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
          'No se recibió respuesta del servidor. Verifica tu conexión.'
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
          variant='ghost'
          size='sm'
          className='h-8 px-2 sm:px-3 text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors text-xs sm:text-sm'
          disabled={!canModify}
          title={
            !isAuthorized
              ? 'No está autorizado para esta operación'
              : ''
          }
        >
          <Edit3 className='h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1' />
          <span className='hidden sm:inline'>Modificar</span>
          <span className='sm:hidden'>Mod</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='space-y-2 sm:space-y-3'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center'>
              <PencilIcon className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
            </div>
            <div>
              <DialogTitle className='text-lg sm:text-xl font-semibold'>
                <span className='hidden sm:inline'>Modificar Precio</span>
                <span className='sm:hidden'>Modificar</span>
              </DialogTitle>
              <DialogDescription className='text-xs sm:text-sm'>
                <span className='hidden sm:inline'>
                  Modifica el valor del cargo y especifica el motivo del cambio
                </span>
                <span className='sm:hidden'>Modifica el valor y motivo</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='space-y-4 sm:space-y-6 py-2 sm:py-4'>
          {descripcion && (
            <div className='space-y-1 sm:space-y-2'>
              <Label className='text-xs sm:text-sm font-medium'>
                Descripción
              </Label>
              <div className='bg-background p-2 sm:p-3 rounded-xl text-xs sm:text-sm border-border'>
                {descripcion}
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            <div className='space-y-1 sm:space-y-2'>
              <Label className='text-xs sm:text-sm font-medium'>Índice</Label>
              <Input
                type='text'
                value={indice}
                disabled
                className='bg-background h-8 sm:h-10 text-xs sm:text-sm'
              />
            </div>

            <div className='space-y-1 sm:space-y-2'>
              <Label className='text-xs sm:text-sm font-medium'>
                Valor Actual
              </Label>
              <Input
                type='text'
                value={valorActual}
                disabled
                className='bg-background h-8 sm:h-10 text-xs sm:text-sm'
              />
            </div>
          </div>

          <div className='space-y-1 sm:space-y-2'>
            <Label htmlFor='valor' className='text-xs sm:text-sm font-medium'>
              Nuevo Valor
            </Label>
            <Input
              id='valor'
              type='number'
              placeholder='Nuevo valor'
              value={valor}
              onChange={e => setValor(e.target.value)}
              min='0'
              step='0.01'
              className='bg-background border-border h-8 sm:h-10 text-xs sm:text-sm'
            />
          </div>

          <div className='space-y-1 sm:space-y-2'>
            <Label htmlFor='motivo' className='text-xs sm:text-sm font-medium'>
              <span className='hidden sm:inline'>
                Motivo de la Modificación
              </span>
              <span className='sm:hidden'>Motivo</span>
            </Label>
            <Textarea
              id='motivo'
              placeholder='Motivo de la modificación'
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
              className='min-h-[60px] sm:min-h-[80px] bg-background border-border text-xs sm:text-sm'
            />
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription className='text-sm'>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
          <Button
            variant='outline'
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            size='sm'
            className='flex-1 order-2 sm:order-1 text-xs sm:text-sm'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={isLoading}
            size='sm'
            className='bg-primary hover:bg-primary/90 text-primary-foreground flex-1 order-1 sm:order-2 text-xs sm:text-sm'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin' />
                <span className='hidden sm:inline'>Procesando...</span>
                <span className='sm:hidden'>...</span>
              </>
            ) : (
              <>
                <CheckCircle className='mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4' />
                Actualizar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
