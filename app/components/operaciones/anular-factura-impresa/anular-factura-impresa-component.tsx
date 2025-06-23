import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  FileX,
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Switch } from '~/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
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
        'Debe ingresar un número de factura válido para proceder con la anulación.',
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
    } catch (error) {
      console.error('Error al anular factura:', error);
      setAlertMessage(
        'Ocurrió un error al anular la factura. Por favor, intente nuevamente.',
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
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
          Anulación de Factura Impresa
        </h1>
        <p className="text-muted-foreground">
          Anula una facturas ya procesadas y emitidas
        </p>
      </div>

      {/* Alert */}
      {showAlert && (
        <Alert
          variant={
            alertMessage.includes('correctamente') ? 'default' : 'destructive'
          }
          className="border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
        >
          {alertMessage.includes('correctamente') ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {alertMessage.includes('correctamente') ? 'Completado' : 'Error'}
          </AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main Form */}
      <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-slate-800 dark:text-slate-200">
            Información de la Factura
          </CardTitle>
          <CardDescription>
            Complete los datos necesarios para procesar la anulación
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Número de Factura */}
          <div className="space-y-2">
            <Label
              htmlFor="numeroFactura"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Número de Factura
            </Label>
            <div className="relative">
              <Input
                id="numeroFactura"
                type="text"
                placeholder="Ej: FAC001234"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                className="pr-10 border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500"
              />
              {numeroFactura && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNumeroFactura('')}
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-700" />

          {/* Configuración de Anulación */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Configuración de Anulación
            </Label>

            <div className="flex items-start space-x-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
              <Switch
                id="conTomaLectura"
                checked={conTomaLectura}
                onCheckedChange={setConTomaLectura}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="conTomaLectura"
                  className="text-sm font-medium cursor-pointer"
                >
                  {conTomaLectura
                    ? 'Con nueva toma de lectura'
                    : 'Sin nueva toma de lectura'}
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {conTomaLectura
                    ? 'Se realizará una nueva lectura del medidor antes de la refacturación'
                    : 'Se mantendrá la última lectura registrada para la refacturación'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClearForm}
              className="flex-1 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpiar
            </Button>

            <Dialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <DialogTrigger asChild>
                <Button
                  disabled={!numeroFactura || isLoading}
                  className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Anular Factura
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
                    <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <DialogTitle className="text-lg font-semibold">
                    Confirmar Anulación
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    ¿Está seguro que desea anular la factura{' '}
                    <strong>{numeroFactura}</strong>? Esta acción no se puede
                    deshacer.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAnular}
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                  >
                    {isLoading ? (
                      <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
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
  );
}
