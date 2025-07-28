import {
  AlertCircle,
  CheckCircle2,
  FileX,
  Info,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';

import React, { useState } from 'react';

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
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-950 dark:to-red-950/30'>
      <div className='container mx-auto p-2 space-y-3'>
        {/* Header modernizado */}
        <div className='flex items-center gap-3 justify-between'>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl font-bold bg-clip-text text-sky-900 dark:text-sky-100'>
              Anulación de Factura Impresa
            </h1>
          </div>
          <div className='flex items-center gap-3'>
            <Dialog>
              <DialogTrigger>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-muted-foreground hover:text-foreground hover:bg-yellow-100 dark:hover:bg-yellow-800/50'
                >
                  <Info className='w-4 h-4 mr-1 text-yellow-600' />
                  <span className='text-yellow-600 text-sm'>Información</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Información</DialogTitle>
                  <DialogDescription>
                    Anula una facturas ya procesadas y emitidas
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Alert modernizado */}
        {showAlert && (
          <Alert
            variant={
              alertMessage.includes('correctamente') ? 'default' : 'destructive'
            }
            className={`rounded-xl border-l-4 shadow-sm ${
              alertMessage.includes('correctamente')
                ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/40 dark:border-emerald-800/40'
                : 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20 border-red-200/40 dark:border-red-800/40'
            }`}
          >
            {alertMessage.includes('correctamente') ? (
              <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            ) : (
              <AlertCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
            )}
            <AlertTitle
              className={
                alertMessage.includes('correctamente')
                  ? 'text-emerald-900 dark:text-emerald-100'
                  : 'text-red-900 dark:text-red-100'
              }
            >
              {alertMessage.includes('correctamente') ? 'Completado' : 'Error'}
            </AlertTitle>
            <AlertDescription
              className={
                alertMessage.includes('correctamente')
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-red-700 dark:text-red-300'
              }
            >
              {alertMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Form modernizado */}
        <Card className='border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm'>
          <CardHeader className='bg-sky-50 dark:bg-sky-950/30 border-b border-sky-200 dark:border-sky-800'>
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm'>
                <FileX className='h-4 w-4' />
              </div>
              <div>
                <CardTitle className='text-lg font-semibold text-sky-900 dark:text-sky-100'>
                  Información de la Factura
                </CardTitle>
                <CardDescription className='text-sky-700 dark:text-sky-300'>
                  Complete los datos necesarios para procesar la anulación
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className='p-6 space-y-6'>
            {/* Número de Factura */}
            <div className='space-y-2'>
              <Label
                htmlFor='numeroFactura'
                className='text-sm font-medium text-sky-800 dark:text-sky-200'
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
                  className='pr-10 border-sky-200 focus:border-sky-400 focus-visible:ring-sky-500 dark:border-sky-800 dark:focus:border-sky-500'
                />
                {numeroFactura && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => setNumeroFactura('')}
                    className='absolute right-0 top-0 h-full px-3 text-sky-400 hover:text-sky-600 dark:text-sky-500 dark:hover:text-sky-400'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            </div>

            <Separator className='bg-sky-200/60 dark:bg-sky-800/60' />

            {/* Configuración de Anulación */}
            <div className='space-y-4'>
              <Label className='text-sm font-medium text-sky-800 dark:text-sky-200'>
                Configuración de Anulación
              </Label>

              <div className='flex items-start space-x-3 p-4 border border-sky-200/40 dark:border-sky-800/40 rounded-lg bg-sky-50/30 dark:bg-sky-900/20'>
                <Switch
                  id='conTomaLectura'
                  checked={conTomaLectura}
                  onCheckedChange={setConTomaLectura}
                  className='mt-0.5'
                />
                <div className='space-y-1'>
                  <Label
                    htmlFor='conTomaLectura'
                    className='text-sm font-medium cursor-pointer text-sky-900 dark:text-sky-100'
                  >
                    {conTomaLectura
                      ? 'Con nueva toma de lectura'
                      : 'Sin nueva toma de lectura'}
                  </Label>
                  <p className='text-xs text-sky-700 dark:text-sky-300 leading-relaxed'>
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
                className='flex-1 border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/50'
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
                    className='flex-1 bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    Anular Factura
                  </Button>
                </DialogTrigger>

                <DialogContent className='sm:max-w-md rounded-xl border border-amber-200/40 bg-white/95 backdrop-blur-sm dark:border-amber-800/40 dark:bg-gray-900/95'>
                  <DialogHeader className='text-center'>
                    <div className='flex items-center justify-center w-12 h-12 mx-auto bg-sky-100 dark:bg-sky-900/30 rounded-full mb-4 border border-sky-200 dark:border-sky-800'>
                      <AlertCircle className='h-6 w-6 text-sky-600 dark:text-sky-400' />
                    </div>
                    <DialogTitle className='text-lg font-semibold text-sky-900 dark:text-sky-100'>
                      Confirmar Anulación
                    </DialogTitle>
                    <DialogDescription className='text-sky-700 dark:text-sky-300'>
                      ¿Está seguro que desea anular la factura{' '}
                      <strong className='text-sky-900 dark:text-sky-100'>
                        {numeroFactura}
                      </strong>
                      ? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>

                  <div className='flex flex-col-reverse sm:flex-row gap-3 mt-6'>
                    <Button
                      variant='outline'
                      onClick={() => setShowConfirmDialog(false)}
                      className='flex-1 border-sky-200 hover:bg-sky-50 dark:border-sky-800 dark:hover:bg-sky-900/50'
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAnular}
                      disabled={isLoading}
                      className='flex-1 bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
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
