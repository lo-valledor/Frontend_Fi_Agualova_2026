import { ChevronDown, Gauge, Search, X } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface AntiguoMedidorFormProps {
  acometida: string;
  numeroSerie: string;
  isLoading: boolean;
  onAcometidaChange: (value: string) => void;
  onNumeroSerieChange: (value: string) => void;
  onBuscar: () => void;
  onLimpiar: () => void;
}

export default function AntiguoMedidorForm({
  acometida,
  numeroSerie,
  isLoading,
  onAcometidaChange,
  onNumeroSerieChange,
  onBuscar,
  onLimpiar
}: Readonly<AntiguoMedidorFormProps>) {
  return (
    <Collapsible
      defaultOpen
      className="rounded-xl border border-border bg-background backdrop-blur-sm shadow-lg"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-background shadow-sm">
            <Gauge className="h-3 w-3 sm:h-4 sm:h-4" />
          </div>
          <span className="font-semibold text-sm sm:text-base truncate">
            <span className="hidden sm:inline">Buscar Medidor Antiguo</span>
            <span className="sm:hidden">Medidor Antiguo</span>
          </span>
        </div>
        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 transition-all ui-open:rotate-180 dark:text-purple-400 shrink-0" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="acometida"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Acometida
              </Label>
              <div className="flex">
                <Input
                  id="acometida"
                  type="text"
                  placeholder="Ingrese el código de acometida"
                  className="rounded-r-none focus-visible:ring-1 border-border focus-visible:ring-ring text-sm sm:text-base h-9 sm:h-10"
                  value={acometida}
                  onChange={e => onAcometidaChange(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onAcometidaChange('')}
                  className="rounded-l-none border-l-0 border-border hover:bg-muted h-9 sm:h-10 w-9 sm:w-10"
                  disabled={!acometida}
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label
                htmlFor="numeroSerie"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Número de Serie
              </Label>
              <div className="flex">
                <Input
                  id="numeroSerie"
                  type="text"
                  placeholder="Ingrese el número de serie"
                  className="rounded-r-none focus-visible:ring-1 border-border focus-visible:ring-ring text-sm sm:text-base h-9 sm:h-10"
                  value={numeroSerie}
                  onChange={e => onNumeroSerieChange(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onNumeroSerieChange('')}
                  className="rounded-l-none border-l-0 border-border hover:bg-muted h-9 sm:h-10 w-9 sm:w-10"
                  disabled={!numeroSerie}
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-3 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              type="button"
              onClick={onBuscar}
              disabled={isLoading}
              className="h-8 sm:h-9 space-x-1 sm:space-x-1.5 bg-primary hover:bg-primary/90 shadow-sm text-sm sm:text-base flex-1 sm:flex-none"
            >
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Buscar</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onLimpiar}
              disabled={isLoading}
              className="h-8 sm:h-9 space-x-1 sm:space-x-1.5 border-border hover:bg-muted text-sm sm:text-base flex-1 sm:flex-none"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Limpiar</span>
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
