import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';

interface ForceReprocessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodoActivo: string;
  onConfirm: () => void;
}

const STORAGE_KEY_PREFIX = 'bt1bt2_processed_period:';

export function ForceReprocessDialog({
  open,
  onOpenChange,
  periodoActivo,
  onConfirm
}: ForceReprocessDialogProps) {
  const [confirmPeriodInput, setConfirmPeriodInput] = useState('');
  const [ackRiskChecked, setAckRiskChecked] = useState(false);

  const handleCancel = () => {
    onOpenChange(false);
    setConfirmPeriodInput('');
    setAckRiskChecked(false);
  };

  const handleConfirm = () => {
    if (periodoActivo) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${periodoActivo}`);
      toast.success('Se habilitó el reprocesamiento para este período');
    }
    onConfirm();
    handleCancel();
  };

  const isValid =
    !!periodoActivo &&
    confirmPeriodInput === periodoActivo &&
    ackRiskChecked;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forzar reprocesamiento</DialogTitle>
          <DialogDescription>
            Esta acción permitirá procesar BT1-BT2 nuevamente para el período
            actual. Úsalo solo si estás seguro de que es necesario.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Período activo:{' '}
            <code className="font-mono">{periodoActivo || 'N/D'}</code>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">
              Escribe el período activo para confirmar
            </label>
            <Input
              value={confirmPeriodInput}
              onChange={(e) => setConfirmPeriodInput(e.target.value)}
              placeholder="Ej: 102025"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={ackRiskChecked}
              onCheckedChange={(checked) =>
                setAckRiskChecked(Boolean(checked))
              }
              id="ack-risk"
            />
            <label
              htmlFor="ack-risk"
              className="text-xs text-muted-foreground"
            >
              Entiendo el riesgo de reprocesar lecturas en el mismo período.
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button disabled={!isValid} onClick={handleConfirm}>
              Habilitar reprocesar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
