import {
  AlertCircle,
  CheckCircle2,
  FileX,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';

import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
        alcance: conTomaLectura ? 1 : 2,
      });

      if (response.status === 200) {
        setAlertMessage('Factura anulada correctamente.');
        setShowAlert(true);
        setNumeroFactura('');
        setConTomaLectura(false);
      }
    } catch (_error) {
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
    <div className='min-h-screen bg-slate-50/30 dark:bg-slate-950/30'>
      <div className='container mx-auto p-3 space-y-4'>
        {/* Header */}
        <div className='flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60'>
          <div>
            <h1 className='text-xl font-semibold text-slate-900 dark:text-slate-100'>
              Anular Factura
            </h1>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Gestión de anulación de facturas impresas
            </p>
          </div>
        </div>

        {/* Alert */}
        {showAlert && (
          <Alert
            variant={
              alertMessage.includes('correctamente') ? 'default' : 'destructive'
            }
            className={`border border-slate-200/60 dark:border-slate-700/60 shadow-sm ${
              alertMessage.includes('correctamente')
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'bg-red-50/50 dark:bg-red-950/20'
            }`}
          >
            {alertMessage.includes('correctamente') ? (
              <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            ) : (
              <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
            )}
            <AlertTitle
              className={`text-base ${
                alertMessage.includes('correctamente')
                  ? 'text-emerald-900 dark:text-emerald-100'
                  : 'text-red-900 dark:text-red-100'
              }`}
            >
              {alertMessage.includes('correctamente') ? 'Completado' : 'Error'}
            </AlertTitle>
            <AlertDescription
              className={`text-sm ${
                alertMessage.includes('correctamente')
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300'
              }`}
            >
              {alertMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <Card className='border border-slate-200/60 dark:border-slate-700/60 shadow-sm'>
          <CardHeader className='border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50 p-4'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center'>
                <FileX className='w-4 h-4 text-slate-600 dark:text-slate-400' />
              </div>
              <div>
                <CardTitle className='text-base text-slate-900 dark:text-slate-100'>
                  Información de la Factura
                </CardTitle>
                <CardDescription className='text-slate-600 dark:text-slate-400 text-xs'>
                  Complete los datos necesarios para procesar la anulación
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className='p-4 space-y-4'>
            {/* Número de Factura */}
            <div className='space-y-2'>
              <Label
                htmlFor='numeroFactura'
                className='text-sm font-medium text-slate-700 dark:text-slate-300'
              >
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
                    className='absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>

            <Separator className='bg-slate-200/60 dark:bg-slate-700/60' />

            {/* Configuración de Anulación */}
            <div className='space-y-4'>
              <Label className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                Configuración de Anulación
              </Label>

              <div className='flex items-start space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50'>
                <Switch
                  id='conTomaLectura'
                  checked={conTomaLectura}
                  onCheckedChange={setConTomaLectura}
                  className='mt-0.5'
                />
                <div className='space-y-1'>
                  <Label
                    htmlFor='conTomaLectura'
                    className='text-sm font-medium cursor-pointer text-slate-900 dark:text-slate-100'
                  >
                    {conTomaLectura
                      ? 'Con nueva toma de lectura'
                      : 'Sin nueva toma de lectura'}
                  </Label>
                  <p className='text-xs text-slate-600 dark:text-slate-400 leading-relaxed'>
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
                    disabled={!numeroFactura || isLoading}
                    className='flex-1 bg-sky-600 hover:bg-sky-700 text-white'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Anular Factura
                  </Button>
                </DialogTrigger>

                <DialogContent className='sm:max-w-md'>
                  <DialogHeader className='text-center'>
                    <div className='flex items-center justify-center w-12 h-12 mx-auto bg-slate-100 dark:bg-slate-800 rounded-lg mb-4'>
                      <AlertCircle className='h-6 w-6 text-slate-600 dark:text-slate-400' />
                    </div>
                    <DialogTitle className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                      Confirmar Anulación
                    </DialogTitle>
                    <DialogDescription className='text-sm text-slate-600 dark:text-slate-400'>
                      ¿Está seguro que desea anular la factura{' '}
                      <strong className='text-slate-900 dark:text-slate-100 break-all'>
                        {numeroFactura}
                      </strong>
                      ? Esta acción no se puede deshacer.
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
                      className='flex-1 bg-sky-600 hover:bg-sky-700 text-white'
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
