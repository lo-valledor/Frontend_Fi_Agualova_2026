import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  FileCheck,
  Search,
  ChevronUp,
  ChevronDown,
  Check,
  Eraser,
  AlertCircle,
  InfoIcon,
  RefreshCw,
  Receipt,
} from "lucide-react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export default function FacturaAnticipadaComponent() {
  // Estados para búsqueda
  const [rutCliente, setRutCliente] = useState<string>("");
  const [acometida, setAcometida] = useState<string>("");
  const [medidor, setMedidor] = useState<string>("");

  // Estados para selección
  const [acometidaSeleccionada, setAcometidaSeleccionada] =
    useState<string>("");
  const [pdaSeleccionada, setPdaSeleccionada] = useState<string>("");
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>("");

  // Estados para controlar la visibilidad de paneles
  const [isBusquedaOpen, setIsBusquedaOpen] = useState(true);
  const [isSeleccionOpen, setIsSeleccionOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleSearch = () => {
    if (!rutCliente && !acometida && !medidor) {
      setShowAlert(true);
      return;
    }

    setIsLoading(true);

    // Simulación de proceso de búsqueda
    setTimeout(() => {
      setIsLoading(false);
      // Aquí iría la lógica real de búsqueda
    }, 1500);
  };

  const handleConfirmar = () => {
    if (!acometidaSeleccionada || !pdaSeleccionada || !periodoSeleccionado) {
      setShowAlert(true);
      return;
    }

    setIsLoading(true);

    // Simulación de proceso de confirmación
    setTimeout(() => {
      setIsLoading(false);
      // Aquí iría la lógica real de confirmación
    }, 1500);
  };

  const handleClearFilters = () => {
    setRutCliente("");
    setAcometida("");
    setMedidor("");
  };

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100">
              Factura Anticipada
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gestión de facturas anticipadas para clientes
          </p>
        </div>
        <div className="hidden md:block">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800"
              >
                <InfoIcon className="h-4 w-4" />
                <span className="ml-2">Información</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Información sobre factura anticipada</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                <p className="mb-2">
                  Este proceso permite generar facturas anticipadas para
                  clientes.
                </p>
                <p className="mb-2">
                  Primero debe buscar la acometida del cliente y luego
                  seleccionar los datos para la facturación.
                </p>
                <p>
                  <strong>Importante:</strong> La factura anticipada se generará
                  para el periodo seleccionado. Asegúrese de verificar los datos
                  antes de confirmar.
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alertas */}
      {showAlert && (
        <Alert
          variant="destructive"
          className="bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800"
        >
          <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <AlertTitle className="text-rose-800 dark:text-rose-200">
            Error
          </AlertTitle>
          <AlertDescription className="text-rose-700 dark:text-rose-300">
            {!rutCliente && !acometida && !medidor
              ? "Debe ingresar al menos un criterio de búsqueda."
              : "Debe seleccionar todos los campos requeridos para la facturación."}
          </AlertDescription>
        </Alert>
      )}

      {/* Panel de Búsqueda */}
      <Card className="shadow-md border-blue-200 dark:border-blue-800 overflow-hidden">
        <Collapsible
          open={isBusquedaOpen}
          onOpenChange={setIsBusquedaOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg shadow-sm">
                  <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Búsqueda Acometida para Facturación Anticipada
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Ingresa los datos para buscar la acometida del cliente
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                {isBusquedaOpen ? (
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rut-cliente" className="text-sm font-medium">
                    RUT Cliente
                  </Label>
                  <Input
                    id="rut-cliente"
                    placeholder="Ingrese el RUT del cliente"
                    value={rutCliente}
                    onChange={(e) => setRutCliente(e.target.value)}
                    className="focus-visible:ring-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acometida" className="text-sm font-medium">
                    Acometida
                  </Label>
                  <Input
                    id="acometida"
                    placeholder="Ingrese el número de acometida"
                    value={acometida}
                    onChange={(e) => setAcometida(e.target.value)}
                    className="focus-visible:ring-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medidor" className="text-sm font-medium">
                    Medidor
                  </Label>
                  <Input
                    id="medidor"
                    placeholder="Ingrese el número de medidor"
                    value={medidor}
                    onChange={(e) => setMedidor(e.target.value)}
                    className="focus-visible:ring-1"
                  />
                </div>
              </div>

              {/* Separador */}
              <Separator className="my-4" />

              {/* Información adicional */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Información importante:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Puede buscar por RUT, acometida o medidor.</li>
                  <li>Ingrese al menos un criterio de búsqueda.</li>
                  <li>Los resultados se mostrarán en el panel de selección.</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t border-blue-100 dark:border-blue-900 pt-4 px-6 pb-6">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
              >
                <Eraser className="mr-2 h-4 w-4" />
                Limpiar
              </Button>
              <Button
                variant="default"
                onClick={handleSearch}
                disabled={isLoading || (!rutCliente && !acometida && !medidor)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Buscar
              </Button>
            </CardFooter>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Panel de Selección */}
      <Card className="shadow-md border-blue-200 dark:border-blue-800 overflow-hidden">
        <Collapsible
          open={isSeleccionOpen}
          onOpenChange={setIsSeleccionOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg shadow-sm">
                  <FileCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                    Selección de Acometida para Facturar
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Selecciona los datos para generar la factura anticipada
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-muted"
              >
                {isSeleccionOpen ? (
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
              {/* Selección de valores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="acometida-select"
                    className="text-sm font-medium"
                  >
                    Acometida
                  </Label>
                  <Select
                    value={acometidaSeleccionada}
                    onValueChange={setAcometidaSeleccionada}
                  >
                    <SelectTrigger id="acometida-select" className="w-full">
                      <SelectValue placeholder="Seleccione una acometida..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acometida1">Acometida 1</SelectItem>
                      <SelectItem value="acometida2">Acometida 2</SelectItem>
                      <SelectItem value="acometida3">Acometida 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pda-select" className="text-sm font-medium">
                    PDA
                  </Label>
                  <Select
                    value={pdaSeleccionada}
                    onValueChange={setPdaSeleccionada}
                  >
                    <SelectTrigger id="pda-select" className="w-full">
                      <SelectValue placeholder="Seleccione un PDA..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pda1">PDA 1</SelectItem>
                      <SelectItem value="pda2">PDA 2</SelectItem>
                      <SelectItem value="pda3">PDA 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="periodo-select"
                    className="text-sm font-medium"
                  >
                    Periodo
                  </Label>
                  <Select
                    value={periodoSeleccionado}
                    onValueChange={setPeriodoSeleccionado}
                  >
                    <SelectTrigger id="periodo-select" className="w-full">
                      <SelectValue placeholder="Seleccione un periodo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="202401">Enero 2024</SelectItem>
                      <SelectItem value="202402">Febrero 2024</SelectItem>
                      <SelectItem value="202403">Marzo 2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Separador */}
              <Separator className="my-4" />

              {/* Información adicional */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Información importante:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>
                    Seleccione todos los campos requeridos para generar la
                    factura.
                  </li>
                  <li>La factura se generará para el periodo seleccionado.</li>
                  <li>
                    Verifique los datos antes de confirmar la facturación.
                  </li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center border-t border-blue-100 dark:border-blue-900 pt-4 px-6 pb-6">
              <Button
                variant="default"
                onClick={handleConfirmar}
                disabled={
                  isLoading ||
                  !acometidaSeleccionada ||
                  !pdaSeleccionada ||
                  !periodoSeleccionado
                }
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isLoading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Confirmar Facturación
              </Button>
            </CardFooter>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
