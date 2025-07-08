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
import { Unlock, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comentario.trim()) {
      toast.error('El comentario es obligatorio');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('marcar-liberar', null, {
        params: { acometida, comentario },
      });
      toast.success('Liberación registrada correctamente');
      onSuccess();
      setOpen(false);
      // Limpiar formulario
      setComentario('');
    } catch (error) {
      console.error('Error al marcar como liberado:', error);
      toast.error('Error al registrar la liberación. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
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
                className="h-8 w-8 border-emerald-500 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-600 dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:hover:border-emerald-600 transition-colors"
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
      <DialogContent className="sm:max-w-md rounded-xl border border-emerald-200/40 bg-white/95 backdrop-blur-sm dark:border-emerald-800/40 dark:bg-gray-900/95">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-900 dark:text-emerald-100">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 text-white">
              <Unlock className="h-3 w-3" />
            </div>
            Marcar como Liberado
          </DialogTitle>
          <DialogDescription className="text-emerald-700 dark:text-emerald-300">
            Ingrese un comentario para la liberación de la acometida{' '}
            <span className="font-mono font-medium">{acometida}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="comentario" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Comentario
            </Label>
            <Textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentario obligatorio para liberación..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
              {comentario.length}/500
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!comentario.trim() || isSubmitting}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
