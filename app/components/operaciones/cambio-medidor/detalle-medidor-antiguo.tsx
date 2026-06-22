import { Archive } from 'lucide-react';
import React from 'react';

import { Card, CardContent } from '~/components/ui/card';
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible';
import type { CambioMedidorBuscarAntiguoRequest } from '~/types/operaciones';

import CollapsibleHeader from './collapsible-header';
import MedidorFieldsGroup from './medidor-fields-group';

interface DetalleMedidorAntiguoProps {
  detalleMedidorAntiguo: CambioMedidorBuscarAntiguoRequest;
  lecturaFinalValue: string;
  onLecturaFinalChange: (value: string) => void;
}

export default function DetalleMedidorAntiguo({
  detalleMedidorAntiguo,
  lecturaFinalValue,
  onLecturaFinalChange
}: Readonly<DetalleMedidorAntiguoProps>) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Card className="rounded-xl border border-border bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleHeader
          isOpen={isOpen}
          icon={<Archive className="h-4 w-4" />}
          title="Detalle Antiguo Medidor"
          description="Información del medidor actual"
          colorScheme="amber"
        />

        <CollapsibleContent>
          <CardContent className="p-3 sm:p-4 md:p-6 pt-3 sm:pt-4">
            <MedidorFieldsGroup
              data={detalleMedidorAntiguo}
              lecturaFinalValue={lecturaFinalValue}
              colorScheme="amber"
              onLecturaFinalChange={onLecturaFinalChange}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}