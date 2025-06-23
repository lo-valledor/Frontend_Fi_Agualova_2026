import type React from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
}

export function FormModal({ isOpen, onClose, mode }: FormModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Funcionalidad de guardado no implementada.');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add'
              ? 'Crear Relación Cargo-Contrato'
              : 'Editar Relación'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Complete los campos para crear una nueva relación.'
              : 'Edite los campos de la relación seleccionada.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="text-center p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/30">
            <Label className="text-yellow-700 dark:text-yellow-300">
              Formulario no implementado. La creación y edición no están
              disponibles por el momento.
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled>
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
