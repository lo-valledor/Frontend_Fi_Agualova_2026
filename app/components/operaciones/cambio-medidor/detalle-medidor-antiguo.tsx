import { Archive } from 'lucide-react';

import React from 'react';

import { Card, CardContent } from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import { type DetalleMedidorAntiguoProps } from '~/types/operaciones';

import CollapsibleHeader from './collapsible-header';
import MedidorFieldsGroup from './medidor-fields-group';

export default function DetalleMedidorAntiguo({
  detalleMedidorAntiguo,
  onUltimaLecturaChange,
  onLecturaActualChange
}: Readonly<DetalleMedidorAntiguoProps>) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className='rounded-xl border border-amber-200/40 bg-white/50 backdrop-blur-sm shadow-lg dark:border-amber-800/40 dark:bg-gray-900/50 overflow-hidden'>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className='w-full'>
        <CollapsibleHeader
          isOpen={isOpen}
          icon={<Archive className='h-4 w-4' />}
          title='Detalle Antiguo Medidor'
          description='Información del medidor actual'
          colorScheme='amber'
        />

        <CollapsibleContent>
          <CardContent className='p-3 sm:p-4 md:p-6 pt-3 sm:pt-4'>
            <MedidorFieldsGroup
              data={detalleMedidorAntiguo}
              colorScheme='amber'
              onUltimaLecturaChange={onUltimaLecturaChange}
              onLecturaActualChange={onLecturaActualChange}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
