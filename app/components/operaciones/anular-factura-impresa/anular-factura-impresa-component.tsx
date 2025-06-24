import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  RotateCcw,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  FileX,
  Info,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-950 dark:to-red-950/30">
      <div className="container mx-auto p-2 space-y-3">
        {/* Header modernizado */}
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-100 dark:to-orange-100 bg-clip-text text-transparent">
              Anulación de Factura Impresa
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-yellow-100 dark:hover:bg-yellow-800/50"
                >
                  <Info className="w-4 h-4 mr-1 text-yellow-600" />
                  <span className="text-yellow-600 text-sm">Información</span>
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
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
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
        <Card className="rounded-xl border border-orange-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-orange-800/40 dark:bg-gray-900/50">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-orange-200/40 dark:border-orange-800/40 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm">
                <FileX className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  Información de la Factura
                </CardTitle>
                <CardDescription className="text-orange-700 dark:text-orange-300">
                  Complete los datos necesarios para procesar la anulación
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Número de Factura */}
            <div className="space-y-2">
              <Label
                htmlFor="numeroFactura"
                className="text-sm font-medium text-orange-800 dark:text-orange-200"
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
                  className="pr-10 border-orange-200 focus:border-orange-400 focus-visible:ring-orange-500 dark:border-orange-800 dark:focus:border-orange-500"
                />
                {numeroFactura && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setNumeroFactura('')}
                    className="absolute right-0 top-0 h-full px-3 text-orange-400 hover:text-orange-600 dark:text-orange-500 dark:hover:text-orange-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-orange-200/60 dark:bg-orange-800/60" />

            {/* Configuración de Anulación */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Configuración de Anulación
              </Label>

              <div className="flex items-start space-x-3 p-4 border border-orange-200/40 dark:border-orange-800/40 rounded-lg bg-orange-50/30 dark:bg-orange-900/20">
                <Switch
                  id="conTomaLectura"
                  checked={conTomaLectura}
                  onCheckedChange={setConTomaLectura}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="conTomaLectura"
                    className="text-sm font-medium cursor-pointer text-orange-900 dark:text-orange-100"
                  >
                    {conTomaLectura
                      ? 'Con nueva toma de lectura'
                      : 'Sin nueva toma de lectura'}
                  </Label>
                  <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
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
                className="flex-1 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/50"
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
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Anular Factura
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md rounded-xl border border-amber-200/40 bg-white/95 backdrop-blur-sm dark:border-amber-800/40 dark:bg-gray-900/95">
                  <DialogHeader className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full mb-4 border border-amber-200 dark:border-amber-800">
                      <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <DialogTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                      Confirmar Anulación
                    </DialogTitle>
                    <DialogDescription className="text-amber-700 dark:text-amber-300">
                      ¿Está seguro que desea anular la factura{' '}
                      <strong className="text-amber-900 dark:text-amber-100">
                        {numeroFactura}
                      </strong>
                      ? Esta acción no se puede deshacer.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 border-amber-200 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-900/50"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAnular}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-sm"
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
    </div>
  );
}
