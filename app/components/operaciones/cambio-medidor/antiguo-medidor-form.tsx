import React from 'react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Search, X, ChevronDown, Gauge } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { type AntiguoMedidorFormProps } from '~/types/operaciones';

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
      className="rounded-xl border border-purple-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-purple-800/40 dark:bg-gray-900/50"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm">
            <Gauge className="h-4 w-4" />
          </div>
          <span className="font-semibold text-purple-900 dark:text-purple-100">
            Búsqueda de Medidor Antiguo
          </span>
        </div>
        <ChevronDown className="h-5 w-5 text-purple-600 transition-all ui-open:rotate-180 dark:text-purple-400" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="acometida"
                className="text-sm font-medium text-purple-800 dark:text-purple-200"
              >
                Acometida
              </Label>
              <div className="flex">
                <Input
                  id="acometida"
                  type="text"
                  placeholder="Ingrese el código de acometida"
                  className="rounded-r-none focus-visible:ring-1 border-purple-200 focus-visible:ring-purple-500 dark:border-purple-800"
                  value={medidorAntiguo.acometida}
                  onChange={onMedidorChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const inputElement = document.getElementById(
                      'acometida',
                    ) as HTMLInputElement;
                    if (inputElement) {
                      inputElement.value = '';
                      onMedidorChange({
                        target: { id: 'acometida', value: '' },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  className="rounded-l-none border-l-0 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="numeroSerie"
                className="text-sm font-medium text-purple-800 dark:text-purple-200"
              >
                Número de Serie
              </Label>
              <div className="flex">
                <Input
                  id="numeroSerie"
                  type="text"
                  placeholder="Ingrese el número de serie"
                  className="rounded-r-none focus-visible:ring-1 border-purple-200 focus-visible:ring-purple-500 dark:border-purple-800"
                  value={medidorAntiguo.numeroSerie}
                  onChange={onMedidorChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const inputElement = document.getElementById(
                      'numeroSerie',
                    ) as HTMLInputElement;
                    if (inputElement) {
                      inputElement.value = '';
                      onMedidorChange({
                        target: { id: 'numeroSerie', value: '' },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                  className="rounded-l-none border-l-0 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/50"
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
              className="h-9 space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-sm"
            >
              <Search className="h-4 w-4" />
              <span>Buscar</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onLimpiar}
              disabled={isLoading}
              className="h-9 space-x-1.5 border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-900/50"
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
