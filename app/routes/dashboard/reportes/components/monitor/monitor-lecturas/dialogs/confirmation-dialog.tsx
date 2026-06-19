import { AlertCircle, Check, Key, Loader2 } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  isDestructive?: boolean;
  variant?: 'default' | 'destructive';
  alertColor?: 'red' | 'yellow' | 'blue' | 'orange';
  claveOptions?: Array<{ value: string; label: string }>;
  selectedClave?: string;
  onClaveChange?: (value: string) => void;
  showClaveSelect?: boolean;
  onConfirm: () => void;
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
  isSubmitting = false
}: Readonly<ConfirmationDialogProps>) {
  // Define estilos compactos basados en el color
  const alertStyles = {
    red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
    yellow:
      'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800',
    blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    orange:
      'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800'
  };

  const iconStyles = {
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    blue: '',
    orange: 'text-orange-600 dark:text-orange-400'
  };

  const textStyles = {
    red: 'text-red-700 dark:text-red-300',
    yellow: 'text-amber-700 dark:text-amber-300',
    blue: 'text-blue-700 dark:text-blue-300',
    orange: 'text-orange-700 dark:text-orange-300'
  };

  const getConfirmButtonClass = () => {
    if (isDestructive) {
      return 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500';
    }
    if (alertColor === 'blue') {
      return 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500';
    }
    if (alertColor === 'orange') {
      return 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500';
    }
    return 'bg-primary hover:bg-primary/90';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 shadow-sm bg-background/95 backdrop-blur-sm">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2 text-foreground text-base font-medium">
            <div
              className={`h-5 w-5 rounded flex items-center justify-center ${alertStyles[alertColor]}`}
            >
              <AlertCircle className={`h-3 w-3 ${iconStyles[alertColor]}`} />
            </div>
            <span>{title}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">{message}</DialogDescription>
        </DialogHeader>

        {/* Mensaje compacto */}
        <div
          className={`flex items-start gap-2 text-xs px-3 py-2 rounded-xl border ${alertStyles[alertColor]}`}
        >
          <AlertCircle
            className={`h-3 w-3 mt-0.5 shrink-0 ${iconStyles[alertColor]}`}
          />
          <span className={textStyles[alertColor]}>{message}</span>
        </div>

        {/* Selector de clave compacto */}
        {showClaveSelect && onClaveChange && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Key className="h-3 w-3" />
              Seleccione un motivo
            </Label>
            <Select value={selectedClave} onValueChange={onClaveChange}>
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue placeholder="Seleccione un motivo" />
              </SelectTrigger>
              <SelectContent>
                {claveOptions.map(option => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-xs"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClave === '0' && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-3 w-3" />
                <span>Debe seleccionar un motivo para continuar</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 pt-3">
          <Button
            className={`h-8 px-3 text-xs ${getConfirmButtonClass()}`}
            onClick={onConfirm}
            disabled={
              isSubmitting || (showClaveSelect && selectedClave === '0')
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                Procesando...
              </>
            ) : (
              <>
                <Check className="h-3 w-3 mr-1.5" />
                Confirmar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
