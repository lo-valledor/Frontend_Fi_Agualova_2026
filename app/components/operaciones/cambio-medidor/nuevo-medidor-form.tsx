import { ChevronDown, ChevronUp, Search, X, Zap } from 'lucide-react';

import React from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '~/components/ui/collapsible';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { type NuevoMedidorFormProps } from '~/types/operaciones';

export default function NuevoMedidorForm({
  medidorNuevo,
  isLoading,
  onMedidorChange,
  onBuscar
}: NuevoMedidorFormProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className='rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-lg'>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className='w-full'>
        <CollapsibleTrigger asChild>
          <div className='flex justify-between items-center p-3 sm:p-4 cursor-pointer hover:bg-muted/30 rounded-t-xl'>
            <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
              <div className='flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-500 shadow-sm'>
                <Zap className='h-3 w-3 sm:h-4 sm:w-4 text-white' />
              </div>
              <div className='min-w-0'>
                <h3 className='text-base sm:text-lg font-semibold text-foreground truncate'>
                  Nuevo Medidor
                </h3>
                <p className='text-xs sm:text-sm text-muted-foreground truncate'>
                  <span className='hidden sm:inline'>
                    Buscar el nuevo medidor a instalar
                  </span>
                  <span className='sm:hidden'>Buscar nuevo medidor</span>
                </p>
              </div>
            </div>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 sm:h-8 sm:w-8 rounded-full hover:bg-muted flex-shrink-0'
            >
              {isOpen ? (
                <ChevronUp className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
              ) : (
                <ChevronDown className='h-4 w-4 sm:h-5 sm:w-5 text-primary' />
              )}
              <span className='sr-only'>Abrir/Cerrar panel</span>
            </Button>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className='p-3 sm:p-4 md:p-6 pt-3 sm:pt-4'>
            <div className='space-y-3 sm:space-y-4'>
              <div className='space-y-1 sm:space-y-2'>
                <Label
                  htmlFor='nuevo-serie'
                  className='text-xs sm:text-sm font-medium text-foreground'
                >
                  Número de Serie
                </Label>
                <div className='flex'>
                  <Input
                    id='nuevo-serie'
                    placeholder='Ingrese el número de serie del nuevo medidor'
                    value={medidorNuevo.numeroSerie}
                    onChange={onMedidorChange}
                    className='rounded-r-none focus-visible:ring-1 border-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800 text-sm sm:text-base h-9 sm:h-10'
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={() => {
                      onMedidorChange({
                        target: { id: 'nuevo-serie', value: '' }
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                    className='rounded-l-none border-l-0 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/50 h-9 sm:h-10 w-9 sm:w-10'
                  >
                    <X className='h-3 w-3 sm:h-4 sm:w-4' />
                  </Button>
                </div>
              </div>

              <div className='flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4'>
                <Button
                  variant='default'
                  size='sm'
                  onClick={onBuscar}
                  disabled={isLoading}
                  className='h-8 sm:h-9 gap-1 sm:gap-1.5 bg-emerald-500 hover:bg-emerald-600 shadow-sm text-sm sm:text-base px-3 sm:px-4'
                >
                  {isLoading ? (
                    <div className='h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  ) : (
                    <Search className='h-3 w-3 sm:h-3.5 sm:w-3.5' />
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
