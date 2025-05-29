import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { CalendarCheck, ChevronUp, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { type DetalleMedidorAntiguoProps } from "~/types/operaciones";

export default function DetalleMedidorAntiguo({
  detalleMedidorAntiguo,
}: DetalleMedidorAntiguoProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className="shadow-sm border border-border/60 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100/80 dark:bg-amber-900/30 rounded-lg shadow-sm">
                <CalendarCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Detalle Antiguo Medidor
                </CardTitle>
                <CardDescription className="text-sm">
                  Información del medidor actual
                </CardDescription>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="acometida-detalle"
                    className="text-sm text-muted-foreground"
                  >
                    Acometida
                  </Label>
                  <Input
                    id="acometida-detalle"
                    placeholder=""
                    value={detalleMedidorAntiguo.acometidaDetalle}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="constante"
                    className="text-sm text-muted-foreground"
                  >
                    Constante
                  </Label>
                  <Input
                    id="constante"
                    placeholder=""
                    value={detalleMedidorAntiguo.constante}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="marca"
                    className="text-sm text-muted-foreground"
                  >
                    Marca
                  </Label>
                  <Input
                    id="marca"
                    placeholder=""
                    value={detalleMedidorAntiguo.marca}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="ultima-lectura"
                    className="text-sm text-muted-foreground"
                  >
                    Última Lectura
                  </Label>
                  <Input
                    id="ultima-lectura"
                    placeholder=""
                    value={detalleMedidorAntiguo.ultimaLectura}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="numero-medidor"
                    className="text-sm text-muted-foreground"
                  >
                    Número de Medidor
                  </Label>
                  <Input
                    id="numero-medidor"
                    placeholder=""
                    value={detalleMedidorAntiguo.numeroMedidor}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="tipo"
                    className="text-sm text-muted-foreground"
                  >
                    Tipo
                  </Label>
                  <Input
                    id="tipo"
                    placeholder=""
                    value={detalleMedidorAntiguo.tipo}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="modelo"
                    className="text-sm text-muted-foreground"
                  >
                    Modelo
                  </Label>
                  <Input
                    id="modelo"
                    placeholder=""
                    value={detalleMedidorAntiguo.modelo}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lectura-actual"
                    className="text-sm text-muted-foreground"
                  >
                    Lectura Actual
                  </Label>
                  <Input
                    id="lectura-actual"
                    placeholder=""
                    value={detalleMedidorAntiguo.lecturaActual}
                    readOnly
                    className="h-9 bg-muted/40"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
