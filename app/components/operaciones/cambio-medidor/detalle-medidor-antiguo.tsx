import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { ChevronUp, ChevronDown, Archive } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { type DetalleMedidorAntiguoProps } from '~/types/operaciones';

export default function DetalleMedidorAntiguo({
  detalleMedidorAntiguo,
}: DetalleMedidorAntiguoProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className="rounded-xl border border-amber-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-amber-800/40 dark:bg-gray-900/50 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-amber-50/50 border-b border-amber-200/40 dark:hover:bg-amber-900/20 dark:border-amber-800/40">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                <Archive className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  Detalle Antiguo Medidor
                </CardTitle>
                <CardDescription className="text-sm text-amber-700 dark:text-amber-300">
                  Información del medidor actual
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50"
            >
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
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
                    className="text-sm text-amber-800 dark:text-amber-200 font-medium"
                  >
                    Acometida
                  </Label>
                  <Input
                    id="acometida-detalle"
                    placeholder=""
                    value={detalleMedidorAntiguo.acometidaDetalle}
                    readOnly
                    className="h-9 bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="constante"
                    className="text-sm text-amber-800 dark:text-amber-200 font-medium"
                  >
                    Constante
                  </Label>
                  <Input
                    id="constante"
                    placeholder=""
                    value={detalleMedidorAntiguo.constante}
                    readOnly
                    className="h-9 bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="marca"
                    className="text-sm text-amber-800 dark:text-amber-200 font-medium"
                  >
                    Marca
                  </Label>
                  <Input
                    id="marca"
                    placeholder=""
                    value={detalleMedidorAntiguo.marca}
                    readOnly
                    className="h-9 bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="ultima-lectura"
                    className="text-sm text-amber-800 dark:text-amber-200 font-medium"
                  >
                    Última Lectura
                  </Label>
                  <Input
                    id="ultima-lectura"
                    placeholder=""
                    value={detalleMedidorAntiguo.ultimaLectura}
                    readOnly
                    className="h-9 bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="numero-medidor"
                    className="text-sm text-amber-800 dark:text-amber-200 font-medium"
                  >
                    Número de Medidor
                  </Label>
                  <Input
                    id="numero-medidor"
                    placeholder=""
                    value={detalleMedidorAntiguo.numeroMedidor}
                    readOnly
                    className="h-9 bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="tipo"
                    className="text-sm text-amber-800 dark:text-amber-200 font-medium"
                  >
                    Tipo
                  </Label>
                  <Input
                    id="tipo"
                    placeholder=""
                    value={detalleMedidorAntiguo.tipo}
                    readOnly
                    className="h-9 bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="modelo"
                    className="text-sm text-amber-800 dark:text-amber-200 font-medium"
                  >
                    Modelo
                  </Label>
                  <Input
                    id="modelo"
                    placeholder=""
                    value={detalleMedidorAntiguo.modelo}
                    readOnly
                    className="h-9 bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lectura-actual"
                    className="text-sm text-amber-800 dark:text-amber-200 font-medium"
                  >
                    Lectura Actual
                  </Label>
                  <Input
                    id="lectura-actual"
                    placeholder=""
                    value={detalleMedidorAntiguo.lecturaActual}
                    readOnly
                    className="h-9 bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
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
