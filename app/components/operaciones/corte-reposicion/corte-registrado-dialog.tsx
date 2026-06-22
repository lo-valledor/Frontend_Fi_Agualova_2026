import { Calendar, Clock, Scissors } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip';
import { operacionesService } from '~/services/operacionesService';
import type { CorteReposicionRegistrarCorteRequest } from '~/types/operaciones';

interface CorteRegistradoDialogProps {
  acometida: string;
  onSuccess: () => void;
}

interface FormState {
  fecha: string;
  hora: string;
}

const FORM_INICIAL: FormState = { fecha: '', hora: '' };

export function CorteRegistradoDialog({
  acometida,
  onSuccess
}: Readonly<CorteRegistradoDialogProps>) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!form.fecha || !form.hora) return;

    setIsSubmitting(true);
    try {
      const request: CorteReposicionRegistrarCorteRequest = {
        acometida,
        fecha: form.fecha,
        hora: form.hora
      };
      const result = await operacionesService.postRegistrarCorte(request);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Corte registrado correctamente');
      setOpen(false);
      setForm(FORM_INICIAL);
      onSuccess();
    } catch (err) {
      toast.error('Error al registrar el corte', {
        description: String(err)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = Boolean(form.fecha && form.hora);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-rose-500 text-rose-500 hover:bg-rose-50 hover:border-rose-600 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30 dark:hover:border-rose-600 transition-colors"
              >
                <Scissors className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Registrar Corte</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="mx-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 shrink-0">
              <Scissors className="h-3 w-3 text-white" />
            </div>
            <span className="truncate">Registrar Corte - {acometida}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Complete los datos para registrar el corte
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-muted rounded-lg p-3 border space-y-3">
            <div className="space-y-1">
              <Label
                htmlFor="fecha"
                className="flex items-center gap-1 text-xs"
              >
                <Calendar className="h-3 w-3" />
                Fecha
              </Label>
              <Input
                id="fecha"
                type="date"
                value={form.fecha}
                onChange={e => setForm(prev => ({ ...prev, fecha: e.target.value }))}
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="hora" className="flex items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                Hora
              </Label>
              <Input
                id="hora"
                type="time"
                value={form.hora}
                onChange={e => setForm(prev => ({ ...prev, hora: e.target.value }))}
                className="text-xs h-8"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="w-full text-xs h-8"
          >
            <Scissors className="h-3 w-3 mr-1" />
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}