import React from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { GaugeIcon, ChevronUp, ChevronDown, Search, X } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  type NuevoMedidorFormProps,
} from "~/types/operaciones";

export default function NuevoMedidorForm({
  medidorNuevo,
  isLoading,
  onMedidorChange,
  onBuscar,
}: NuevoMedidorFormProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className="shadow-sm border border-border/60 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-100/80 dark:bg-green-900/30 rounded-lg shadow-sm">
                <GaugeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Nuevo Medidor
                </h3>
                <p className="text-sm text-muted-foreground">
                  Buscar el nuevo medidor a instalar
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted"
            >
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="sr-only">Abrir/Cerrar panel</span>
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 md:p-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nuevo-serie" className="text-sm font-medium">
                  Número de Serie
                </Label>
                <div className="flex">
                  <Input
                    id="nuevo-serie"
                    placeholder="Ingrese el número de serie del nuevo medidor"
                    value={medidorNuevo.numeroSerie}
                    onChange={onMedidorChange}
                    className="rounded-r-none focus-visible:ring-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      onMedidorChange({
                        target: { id: "nuevo-serie", value: "" },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="rounded-l-none border-l-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="default"
                  size="sm"
                  onClick={onBuscar}
                  disabled={isLoading}
                  className="h-9 gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                >
                  {isLoading ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search className="h-3.5 w-3.5" />
                  )}
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
