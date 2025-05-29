import React from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Search, X, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { type AntiguoMedidorFormProps } from "~/types/operaciones";

export default function AntiguoMedidorForm({
  medidorAntiguo,
  isLoading,
  onMedidorChange,
  onBuscar,
  onLimpiar,
}: AntiguoMedidorFormProps) {
  return (
    <Collapsible
      defaultOpen
      className="rounded-lg border border-border/40 bg-card shadow-sm"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-primary">
            Búsqueda de Medidor Antiguo
          </span>
        </div>
        <ChevronDown className="h-5 w-5 text-muted-foreground transition-all ui-open:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="acometida" className="text-sm font-medium">
                Acometida
              </Label>
              <div className="flex">
                <Input
                  id="acometida"
                  type="text"
                  placeholder="Ingrese el código de acometida"
                  className="rounded-r-none focus-visible:ring-1"
                  value={medidorAntiguo.acometida}
                  onChange={onMedidorChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const inputElement = document.getElementById(
                      "acometida"
                    ) as HTMLInputElement;
                    if (inputElement) {
                      inputElement.value = "";
                      onMedidorChange({
                        target: { id: "acometida", value: "" },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  className="rounded-l-none border-l-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroSerie" className="text-sm font-medium">
                Número de Serie
              </Label>
              <div className="flex">
                <Input
                  id="numeroSerie"
                  type="text"
                  placeholder="Ingrese el número de serie"
                  className="rounded-r-none focus-visible:ring-1"
                  value={medidorAntiguo.numeroSerie}
                  onChange={onMedidorChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const inputElement = document.getElementById(
                      "numeroSerie"
                    ) as HTMLInputElement;
                    if (inputElement) {
                      inputElement.value = "";
                      onMedidorChange({
                        target: { id: "numeroSerie", value: "" },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  className="rounded-l-none border-l-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={onBuscar}
              disabled={isLoading}
              className="h-9 space-x-1.5"
            >
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onLimpiar}
              disabled={isLoading}
              className="h-9 space-x-1.5 border-muted-foreground/20"
            >
              <X className="h-4 w-4" />
              <span>Limpiar</span>
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
