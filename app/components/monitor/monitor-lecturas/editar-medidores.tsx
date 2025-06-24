import React from 'react';
import type { MedidorNichoItem } from '~/types/monitor';
import { ReaperturaForm } from './form-sections/reapertura-form';
import { BT1BT2Form } from './form-sections/bt1-bt2-form';
import { BT43Form } from './form-sections/bt4-3-form';
interface EditarMedidoresProps {
  result: MedidorNichoItem;
  onSuccess?: () => void;
}

export default function EditarMedidores({
  result,
  onSuccess
}: EditarMedidoresProps) {
  // Renderizar el componente adecuado según el estado y tarifa del medidor
  const renderForm = () => {
    // Si el medidor está en estado 4 (cerrado), mostrar formulario de reapertura
    if (result.Estado === 4) {
      return <ReaperturaForm result={result} onSuccess={onSuccess} />;
    }

    // Si el medidor es de tarifa BT-1 o BT-2
    if (result.tarifa === 'BT-1' || result.tarifa === 'BT-2') {
      return <BT1BT2Form result={result} onSuccess={onSuccess} />;
    }

    // Si el medidor es de tarifa BT-4.3
    if (result.tarifa === 'BT-4.3') {
      return <BT43Form result={result} onSuccess={onSuccess} />;
    }

    // Si no coincide con ninguno de los anteriores
    return (
      <div className="p-4 text-center text-muted-foreground">
        No hay formulario disponible para la tarifa {result.tarifa}
      </div>
    );
  };

  return renderForm();
}
