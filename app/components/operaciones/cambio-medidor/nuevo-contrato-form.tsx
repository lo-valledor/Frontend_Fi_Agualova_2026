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
import { FileText, ChevronUp, ChevronDown, ArrowUpSquare } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { type NuevoContratoFormProps } from '~/types/operaciones';

export default function NuevoContratoForm({
  codigoContrato,
  onCodigoChange,
  isLoading,
  isFormValid,
  onCambioMedidor,
}: NuevoContratoFormProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className="shadow-sm border border-border/60 overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100/80 dark:bg-indigo-900/30 rounded-lg shadow-sm">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200">
                  Nuevo Contrato
                </CardTitle>
                <CardDescription className="text-sm">
                  Activar nuevo contrato si es necesario
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-6 space-y-2">
                <Label
                  htmlFor="codigo-contrato"
                  className="text-sm text-muted-foreground"
                >
                  Código Contrato
                </Label>
                <Input
                  id="codigo-contrato"
                  placeholder="Ingrese código de contrato si es necesario"
                  value={codigoContrato}
                  onChange={onCodigoChange}
                  className="h-9"
                />
              </div>

              <div className="flex items-center gap-2 md:col-span-6">
                <span className="text-sm text-muted-foreground">
                  Si necesita activar un nuevo contrato ingrese el código
                </span>
              </div>
            </div>

            {/* Botón de cambio medidor */}
            <div className="flex justify-between pt-6 mt-2 border-t border-border/60">
              <p className="text-sm text-muted-foreground italic mt-2">
                Complete todos los datos requeridos para proceder con el cambio.
              </p>
              <Button
                variant="default"
                onClick={onCambioMedidor}
                disabled={isLoading || !isFormValid}
                className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <ArrowUpSquare className="h-4 w-4" />
                )}
                Cambiar Medidor
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
