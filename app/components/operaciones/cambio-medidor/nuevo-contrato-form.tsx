import { ArrowUpSquare, ChevronDown, ChevronUp, FileText } from 'lucide-react';

import React from 'react';

import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
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
    <Card className='shadow-sm border border-border/60 overflow-hidden'>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className='w-full'>
        <CollapsibleTrigger asChild>
          <div className='flex justify-between items-center p-3 sm:p-4 cursor-pointer hover:bg-muted/30 rounded-t-lg border-b border-border/60'>
            <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
              <div className='p-1.5 sm:p-2.5 bg-indigo-100/80 dark:bg-indigo-900/30 rounded-lg shadow-sm flex-shrink-0'>
                <FileText className='h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400' />
              </div>
              <div className='min-w-0'>
                <CardTitle className='text-sm sm:text-lg font-semibold text-sky-800 dark:text-sky-200 truncate'>
                  <span className='hidden sm:inline'>Nuevo Contrato</span>
                  <span className='sm:hidden'>Contrato</span>
                </CardTitle>
                <CardDescription className='text-xs sm:text-sm truncate'>
                  <span className='hidden sm:inline'>Activar nuevo contrato si es necesario</span>
                  <span className='sm:hidden'>Activar contrato</span>
                </CardDescription>
              </div>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 sm:h-8 sm:w-8 rounded-full hover:bg-muted flex-shrink-0'
            >
              {isOpen ? (
                <ChevronUp className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground' />
              ) : (
                <ChevronDown className='h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground' />
              )}
              <span className='sr-only'>Abrir/Cerrar panel</span>
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className='p-3 sm:p-4 md:p-6 pt-3 sm:pt-4'>
            <div className='grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start lg:items-center'>
              <div className='lg:col-span-6 space-y-1 sm:space-y-2'>
                <Label
                  htmlFor='codigo-contrato'
                  className='text-xs sm:text-sm text-muted-foreground'
                >
                  Código Contrato
                </Label>
                <Input
                  id='codigo-contrato'
                  placeholder='Ingrese código de contrato si es necesario'
                  value={codigoContrato}
                  onChange={onCodigoChange}
                  className='h-8 sm:h-9 text-sm sm:text-base'
                />
              </div>

              <div className='flex items-center gap-2 lg:col-span-6'>
                <span className='text-xs sm:text-sm text-muted-foreground'>
                  Si necesita activar un nuevo contrato ingrese el código
                </span>
              </div>
            </div>

            {/* Botón de cambio medidor */}
            <div className='flex flex-col sm:flex-row justify-between pt-3 sm:pt-6 mt-2 border-t border-border/60 gap-3 sm:gap-0'>
              <p className='text-xs sm:text-sm text-muted-foreground italic mt-0 sm:mt-2 order-2 sm:order-1'>
                Complete todos los datos requeridos para proceder con el cambio.
              </p>
              <Button
                variant='default'
                onClick={onCambioMedidor}
                disabled={isLoading || !isFormValid}
                className='gap-1 sm:gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 h-8 sm:h-10 text-sm sm:text-base order-1 sm:order-2 w-full sm:w-auto'
              >
                {isLoading ? (
                  <div className='h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                ) : (
                  <ArrowUpSquare className='h-3 w-3 sm:h-4 sm:w-4' />
                )}
                <span className='hidden sm:inline'>Cambiar Medidor</span>
                <span className='sm:hidden'>Cambiar</span>
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
