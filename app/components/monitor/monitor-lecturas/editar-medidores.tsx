import React from 'react';
import { BT1BT2Form } from './form-sections/bt1-bt2-form';
import { BT43Form } from './form-sections/bt4-3-form';
import { ReaperturaForm } from './form-sections/reapertura-form';
import { useActivityEvent } from '~/components/activity-tracker-hoc';
import type { MedidorNichoItem } from '~/types/monitor';
interface EditarMedidoresProps {
  result: MedidorNichoItem;
  onSuccess?: () => void;
}

export default function EditarMedidores({
  result,
  onSuccess,
}: EditarMedidoresProps) {
  const { trackDataAction } = useActivityEvent();

  // Renderizar el componente adecuado según el estado y tarifa del medidor
  const renderForm = () => {
    // Si el medidor está en estado 4 (cerrado), mostrar formulario de reapertura
    if (result.Estado === 4) {
      trackDataAction('Abrir formulario', 'Editar Medidores', `Reapertura - Medidor: ${result.ME_NSerie} (${result.tarifa})`);
      return <ReaperturaForm result={result} onSuccess={onSuccess} />;
    }

    // Si el medidor es de tarifa BT-1 o BT-2
    if (result.tarifa === 'BT-1' || result.tarifa === 'BT-2') {
      trackDataAction('Abrir formulario', 'Editar Medidores', `BT-1/BT-2 - Medidor: ${result.ME_NSerie} (${result.tarifa})`);
      return <BT1BT2Form result={result} onSuccess={onSuccess} />;
    }

    // Si el medidor es de tarifa BT-4.3
    if (result.tarifa === 'BT-4.3') {
      trackDataAction('Abrir formulario', 'Editar Medidores', `BT-4.3 - Medidor: ${result.ME_NSerie} (${result.tarifa})`);
      return <BT43Form result={result} onSuccess={onSuccess} />;
    }

    // Si no coincide con ninguno de los anteriores
    trackDataAction('Error formulario', 'Editar Medidores', `Tarifa no soportada: ${result.tarifa}`);
    return (
      <div className="p-4 text-center text-muted-foreground">
        No hay formulario disponible para la tarifa {result.tarifa}
      </div>
    );
  };

  return renderForm();
}
