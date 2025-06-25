import React from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
  GaugeIcon,
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Zap,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { type NuevoMedidorFormProps } from '~/types/operaciones';

export default function NuevoMedidorForm({
  medidorNuevo,
  isLoading,
  onMedidorChange,
  onBuscar,
}: NuevoMedidorFormProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className="rounded-xl border border-emerald-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-emerald-800/40 dark:bg-gray-900/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-emerald-50/50 rounded-t-xl dark:hover:bg-emerald-900/20">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                  Nuevo Medidor
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Buscar el nuevo medidor a instalar
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
            >
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              )}
              <span className="sr-only">Abrir/Cerrar panel</span>
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="p-4 md:p-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="nuevo-serie"
                  className="text-sm font-medium text-emerald-800 dark:text-emerald-200"
                >
                  Número de Serie
                </Label>
                <div className="flex">
                  <Input
                    id="nuevo-serie"
                    placeholder="Ingrese el número de serie del nuevo medidor"
                    value={medidorNuevo.numeroSerie}
                    onChange={onMedidorChange}
                    className="rounded-r-none focus-visible:ring-1 border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      onMedidorChange({
                        target: { id: 'nuevo-serie', value: '' },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className="rounded-l-none border-l-0 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/50"
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
                  className="h-9 gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-sm"
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
