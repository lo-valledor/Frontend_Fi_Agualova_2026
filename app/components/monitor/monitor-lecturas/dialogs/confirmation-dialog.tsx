import React from 'react'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

interface ConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  isDestructive?: boolean
  variant?: 'default' | 'destructive'
  alertColor?: 'red' | 'yellow' | 'blue'
  claveOptions?: Array<{ value: string; label: string }>
  selectedClave?: string
  onClaveChange?: (value: string) => void
  showClaveSelect?: boolean
  onConfirm: () => void
  onCancel?: () => void
  isSubmitting?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  message,
  isDestructive = false,
  variant = 'default',
  alertColor = 'red',
  claveOptions = [],
  selectedClave = '0',
  onClaveChange,
  showClaveSelect = false,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: ConfirmationDialogProps) {
  // Define estilos de alerta basados en el color
  const alertStyles = {
    red: 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300',
    yellow:
      'bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300',
    blue: 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="sr-only">{message}</DialogDescription>
        </DialogHeader>
        <Alert variant={variant} className={`mb-4 ${alertStyles[alertColor]}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>

        {showClaveSelect && onClaveChange && (
          <div className="space-y-2 mb-4">
            <Label className="text-slate-900 dark:text-slate-100 font-medium">
              Seleccione un motivo:
            </Label>
            <Select value={selectedClave} onValueChange={onClaveChange}>
              <SelectTrigger className="bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                {claveOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/50"
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
                : 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500'
            }
          >
            {isSubmitting ? 'Guardando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
