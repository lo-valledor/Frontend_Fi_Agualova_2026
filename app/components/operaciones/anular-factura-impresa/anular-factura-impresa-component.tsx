import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "~/components/ui/card";
import {
  FileX2,
  Eraser,
  ChevronUp,
  ChevronDown,
  X,
  AlertCircle,
  InfoIcon,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import api from "~/lib/api";

export default function AnularFacturaImpresaComponent() {
  const [numeroFactura, setNumeroFactura] = useState<string>("");
  const [conTomaLectura, setConTomaLectura] = useState<boolean>(false);
  const [isAnulacionOpen, setIsAnulacionOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const handleAnular = async () => {
    if (!numeroFactura) {
      setAlertMessage(
        "Debe ingresar un número de factura válido para proceder con la anulación."
      );
      setShowAlert(true);
      return;
    }

    try {
      setIsLoading(true);
      setShowAlert(false);

      const response = await api.post("/anular-factura-impresa", {
        numeroFolio: numeroFactura,
        alcance: conTomaLectura ? 1 : 2, // 1 para con toma de lectura, 2 para sin toma de lectura
      });

      if (response.status === 200) {
        // Mostrar mensaje de éxito
        setAlertMessage("Factura anulada correctamente.");
        setShowAlert(true);

        // Limpiar el formulario después de una anulación exitosa
        setNumeroFactura("");
        setConTomaLectura(false);
      }
    } catch (error) {
      console.error("Error al anular factura:", error);
      setAlertMessage(
        "Ocurrió un error al anular la factura. Por favor, intente nuevamente."
      );
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setNumeroFactura("");
    setConTomaLectura(false);
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Anular Factura Impresa
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestión de anulaciones de facturas ya impresas
          </p>
        </div>
      </div>

      {/* Alertas */}
      {showAlert && (
        <Alert
          variant={
            alertMessage.includes("correctamente") ? "default" : "destructive"
          }
          className={
            alertMessage.includes("correctamente")
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
          }
        >
          {alertMessage.includes("correctamente") ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          )}
          <AlertTitle
            className={
              alertMessage.includes("correctamente")
                ? "text-emerald-800 dark:text-emerald-200"
                : "text-rose-800 dark:text-rose-200"
            }
          >
            {alertMessage.includes("correctamente") ? "Éxito" : "Error"}
          </AlertTitle>
          <AlertDescription
            className={
              alertMessage.includes("correctamente")
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300"
            }
          >
            {alertMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Sección Principal */}
      <div className="grid grid-cols-1 gap-6">
        {/* Panel de Anulación */}
        <Card className="shadow-md border-rose-200 dark:border-rose-800 overflow-hidden">
          <Collapsible
            open={isAnulacionOpen}
            onOpenChange={setIsAnulacionOpen}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg shadow-sm">
                    <FileX2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                      Anular Factura Impresa
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Ingresa los datos de la factura a anular
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  {isAnulacionOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="sr-only">Abrir/Cerrar panel</span>
                </Button>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="p-6 space-y-6">
                {/* Número de Factura */}
                <div className="space-y-2">
                  <Label htmlFor="factura" className="text-sm font-medium">
                    Número de Factura
                  </Label>
                  <div className="flex">
                    <Input
                      id="factura"
                      placeholder="Ingrese el número de factura a anular"
                      className="rounded-r-none focus-visible:ring-1"
                      value={numeroFactura}
                      onChange={(e) => setNumeroFactura(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNumeroFactura("")}
                      className="rounded-l-none border-l-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Con Toma de Lectura */}
                <div className="space-y-2">
                  <Label htmlFor="toma-lectura" className="text-sm font-medium">
                    Modo de Anulación
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="toma-lectura"
                      checked={conTomaLectura}
                      onCheckedChange={() => setConTomaLectura(!conTomaLectura)}
                      className="data-[state=checked]:bg-rose-600"
                    />
                    <Label htmlFor="toma-lectura" className="text-sm">
                      {conTomaLectura
                        ? "Retomar lectura y refacturar"
                        : "Usar lectura pero refacturar"}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conTomaLectura
                      ? "La anulación incluirá una nueva toma de lectura del medidor. Se registrará el valor actual del medidor."
                      : "La anulación se realizará sin registrar una nueva lectura. Se mantendrá la última lectura registrada."}
                  </p>
                </div>

                {/* Separador */}
                <Separator className="my-4" />
              </CardContent>

              <CardFooter className="flex justify-between border-t border-rose-100 dark:border-rose-900 pt-4 px-6 pb-6">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                >
                  <Eraser className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleAnular}
                  disabled={isLoading || !numeroFactura}
                  className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Anular Factura
                </Button>
              </CardFooter>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
