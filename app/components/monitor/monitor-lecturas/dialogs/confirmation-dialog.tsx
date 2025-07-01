import React from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  isDestructive?: boolean;
  variant?: 'default' | 'destructive';
  alertColor?: 'red' | 'yellow' | 'blue';
  claveOptions?: Array<{ value: string; label: string }>;
  selectedClave?: string;
  onClaveChange?: (value: string) => void;
  showClaveSelect?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  message,
  isDestructive = false,
  alertColor = 'red',
  claveOptions = [],
  selectedClave = '0',
  onClaveChange,
  showClaveSelect = false,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: ConfirmationDialogProps) {
  // Define estilos de alerta basados en el color con diseño más suave
  const alertStyles = {
    red: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800',
    yellow:
      'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800',
  };

  const iconStyles = {
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    blue: 'text-blue-600 dark:text-blue-400',
  };

  const textStyles = {
    red: 'text-red-700 dark:text-red-300',
    yellow: 'text-amber-700 dark:text-amber-300',
    blue: 'text-blue-700 dark:text-blue-300',
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">{message}</DialogDescription>
        </DialogHeader>

        {/* Alerta principal */}
        <Alert className={`${alertStyles[alertColor]} border-l-4`}>
          <AlertCircle className={`h-4 w-4 ${iconStyles[alertColor]}`} />
          <AlertDescription className={`${textStyles[alertColor]} font-medium`}>
            {message}
          </AlertDescription>
        </Alert>

        {/* Selector de clave si es necesario */}
        {showClaveSelect && onClaveChange && (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Seleccione un motivo:
            </Label>
            <Select value={selectedClave} onValueChange={onClaveChange}>
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 w-full">
                <SelectValue placeholder="Seleccione un motivo" />
              </SelectTrigger>
              <SelectContent>
                {claveOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClave === '0' && (
              <span className="text-xs text-amber-600">
                Debe seleccionar un motivo para continuar.
              </span>
            )}
          </div>
        )}

        <DialogFooter className="gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={
              isSubmitting || (showClaveSelect && selectedClave === '0')
            }
            className={
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                : alertColor === 'blue'
                  ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                  : 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500'
            }
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
