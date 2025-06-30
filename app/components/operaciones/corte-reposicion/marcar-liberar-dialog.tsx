import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import api from '~/lib/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { Unlock } from 'lucide-react';

interface MarcarLiberarDialogProps {
  acometida: string;
  onSuccess: () => void;
}

export function MarcarLiberarDialog({
  acometida,
  onSuccess,
}: MarcarLiberarDialogProps) {
  const [open, setOpen] = useState(false);
  const [comentario, setComentario] = useState('');

  const handleSubmit = async () => {
    if (!comentario.trim()) {
      // Opcional: mostrar un error si el comentario está vacío
      return;
    }
    try {
      await api.post('marcar-liberar', null, {
        params: { acometida, comentario },
      });
      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error('Error al marcar como liberado:', error);
      // Opcional: manejar el error mostrando una notificación
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-emerald-500 text-emerald-500 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
              >
                <Unlock className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Marcar como Liberado</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marcar como Liberado</DialogTitle>
          <DialogDescription>
            Ingrese un comentario para la liberación de la acometida {acometida}
            .
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="comentario">Comentario</Label>
          <Textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentario obligatorio para liberación."
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!comentario.trim()}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
