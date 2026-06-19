import { Calendar, Clock, Hash, Scissors } from 'lucide-react';
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
import api from '~/lib/api';

interface CorteRegistradoDialogProps {
  acometida: string;
  onSuccess: () => void;
}

export function CorteRegistradoDialog({
  acometida,
  onSuccess
}: Readonly<CorteRegistradoDialogProps>) {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      await api.post('corte-registrado', null, {
        params: { acometida, fecha, hora, periodo }
      });
      toast.success('Corte registrado correctamente');
      onSuccess();
      setOpen(false);
      // Limpiar formulario
      setFecha('');
      setHora('');
      setPeriodo('');
    } catch (error) {
      toast.error(
        'Error al registrar el corte. Intente nuevamente.',
        error as any
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = fecha && hora && periodo;

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
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                placeholder="dd-MM-yyyy"
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
                value={hora}
                onChange={e => setHora(e.target.value)}
                placeholder="HH:mm:ss"
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="periodo"
                className="flex items-center gap-1 text-xs"
              >
                <Hash className="h-3 w-3" />
                Periodo
              </Label>
              <Input
                id="periodo"
                value={periodo}
                onChange={e => setPeriodo(e.target.value)}
                placeholder="MMAAAA"
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
