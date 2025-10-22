/**
 * Componente para Anulación de Facturas Impresas
 *
 * Funcionalidades principales:
 * - Anulación de facturas impresas por número de folio
 * - Opción de anulación con o sin nueva toma de lectura
 * - Validación de datos antes de procesar
 * - Confirmación mediante diálogo antes de ejecutar
 * - Retroalimentación visual del resultado de la operación
 *
 * Flujo de trabajo:
 * 1. Usuario ingresa número de factura
 * 2. Usuario selecciona si requiere nueva toma de lectura (toggle)
 * 3. Sistema valida que hay número de factura
 * 4. Usuario confirma la anulación en diálogo modal
 * 5. Sistema procesa la anulación vía API
 * 6. Sistema muestra resultado (éxito o error)
 *
 * Arquitectura:
 * - Usa Shadcn/ui components (Card, Dialog, Alert, Input, Switch)
 * - Estados locales para manejo del formulario
 * - API call con axios via lib/api
 * - Feedback con sonner toast y alertas visuales
 *
 * @example
 * ```tsx
 * // Usado en app/routes/operaciones/anular-factura.tsx
 * export default function AnularFacturaRoute() {
 *   return <AnularFacturaImpresaComponent />;
 * }
 * ```
 */
import {
  AlertCircle,
  CheckCircle2,
  FileX,
  RotateCcw,
  Trash2,
  X
} from 'lucide-react';

import { useState } from 'react';

import { useAuth } from '~/context/AuthContext';
import { ModernHeader } from '~/components/shared/modern-header';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import { Switch } from '~/components/ui/switch';
import api from '~/lib/api';

export default function AnularFacturaImpresaComponent() {
  const [numeroFactura, setNumeroFactura] = useState<string>('');
  const [conTomaLectura, setConTomaLectura] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Permisos
  const { canDelete } = useAuth();
  const route = '/dashboard/operaciones/anular-factura-impresa';
  const hasDeletePermission = canDelete(route);

  const handleAnular = async () => {
    if (!numeroFactura) {
      setAlertMessage(
        'Debe ingresar un número de factura válido para proceder con la anulación.'
      );
      setShowAlert(true);
      return;
    }

    try {
      setIsLoading(true);
      setShowAlert(false);
      setShowConfirmDialog(false);

      const response = await api.post('/anular-factura-impresa', {
        numeroFolio: numeroFactura,
        alcance: conTomaLectura ? 1 : 2
      });

      if (response.status === 200) {
        setAlertMessage('Factura anulada correctamente.');
        setShowAlert(true);
        setNumeroFactura('');
        setConTomaLectura(false);
      }
    } catch (error) {
      console.error('Error al anular factura:', error);
      setAlertMessage(
        'Ocurrió un error al anular la factura. Por favor, intente nuevamente.'
      );
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearForm = () => {
    setNumeroFactura('');
    setConTomaLectura(false);
    setShowAlert(false);
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <ModernHeader
          title='Anular Factura'
          description='Gestión de anulación de facturas impresas'
        />

        {/* Alert */}
        {showAlert && (
          <Alert
            variant={
              alertMessage.includes('correctamente') ? 'default' : 'destructive'
            }
            className={`border border-border shadow-sm ${
              alertMessage.includes('correctamente')
                ? 'bg-success/10'
                : 'bg-destructive/10'
            }`}
          >
            {alertMessage.includes('correctamente') ? (
              <CheckCircle2 className='h-4 w-4 text-success' />
            ) : (
              <AlertCircle className='h-4 w-4 text-destructive' />
            )}
            <AlertTitle
              className={`text-base ${
                alertMessage.includes('correctamente')
                  ? 'text-success'
                  : 'text-destructive'
              }`}
            >
              {alertMessage.includes('correctamente') ? 'Completado' : 'Error'}
            </AlertTitle>
            <AlertDescription
              className={`text-sm ${
                alertMessage.includes('correctamente')
                  ? 'text-success'
                  : 'text-destructive'
              }`}
            >
              {alertMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <Card className='border border-border shadow-sm'>
          <CardHeader className='border-b border-border bg-background p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-background rounded-xl flex items-center justify-center'>
                <FileX className='w-4 h-4' />
              </div>
              <div>
                <CardTitle className='text-base'>
                  Información de la Factura
                </CardTitle>
                <CardDescription className='text-xs'>
                  Complete los datos necesarios para procesar la anulación
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className='p-4 space-y-4'>
            {/* Número de Factura */}
            <div className='space-y-2'>
              <Label htmlFor='numeroFactura' className='text-sm font-medium'>
                Número de Factura
              </Label>
              <div className='relative'>
                <Input
                  id='numeroFactura'
                  type='text'
                  placeholder='Ej: FAC001234'
                  value={numeroFactura}
                  onChange={e => setNumeroFactura(e.target.value)}
                  className='pr-10'
                />
                {numeroFactura && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setNumeroFactura('')}
                    className='absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Configuración de Anulación */}
            <div className='space-y-4'>
              <Label className='text-sm font-medium'>
                Configuración de Anulación
              </Label>

              <div className='flex items-start space-x-3 p-3 border-border rounded-xl bg-background'>
                <Switch
                  id='conTomaLectura'
                  checked={conTomaLectura}
                  onCheckedChange={setConTomaLectura}
                  className='mt-0.5'
                />
                <div className='space-y-1'>
                  <Label
                    htmlFor='conTomaLectura'
                    className='text-sm font-medium cursor-pointer'
                  >
                    {conTomaLectura
                      ? 'Con nueva toma de lectura'
                      : 'Sin nueva toma de lectura'}
                  </Label>
                  <p className='text-xs leading-relaxed'>
                    {conTomaLectura
                      ? 'Se realizará una nueva lectura del medidor antes de la refacturación'
                      : 'Se mantendrá la última lectura registrada para la refacturación'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='flex flex-col sm:flex-row gap-3 pt-4'>
              <Button
                variant='outline'
                onClick={handleClearForm}
                className='flex-1'
              >
                <RotateCcw className='mr-2 h-4 w-4' />
                Limpiar
              </Button>

              <Dialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    disabled={
                      !numeroFactura || isLoading || !hasDeletePermission
                    }
                    className='flex-1 bg-primary hover:bg-primary/90 text-primary-foreground'
                    title={
                      !hasDeletePermission
                        ? 'No tiene permisos para anular facturas'
                        : ''
                    }
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Anular Factura
                  </Button>
                </DialogTrigger>

                <DialogContent className='sm:max-w-md'>
                  <DialogHeader className='text-center'>
                    <div className='flex items-center justify-center w-12 h-12 mx-auto bg-background rounded-xl mb-4'>
                      <AlertCircle className='h-6 w-6' />
                    </div>
                    <DialogTitle className='text-lg font-semibold'>
                      Confirmar Anulación
                    </DialogTitle>
                    <DialogDescription className='text-sm'>
                      ¿Está seguro que desea anular la factura{' '}
                      <strong className='break-all'>{numeroFactura}</strong>?
                      Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>

                  <div className='flex flex-col-reverse sm:flex-row gap-3 mt-6'>
                    <Button
                      variant='outline'
                      onClick={() => setShowConfirmDialog(false)}
                      className='flex-1'
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAnular}
                      disabled={isLoading}
                      className='flex-1 bg-primary hover:bg-primary/90 text-primary-foreground'
                    >
                      {isLoading ? (
                        <RotateCcw className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        <Trash2 className='mr-2 h-4 w-4' />
                      )}
                      {isLoading ? 'Procesando...' : 'Confirmar Anulación'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
