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
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import api from '~/lib/api';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { Scissors } from 'lucide-react';

interface CorteRegistradoDialogProps {
  acometida: string;
  onSuccess: () => void;
}

export function CorteRegistradoDialog({
  acometida,
  onSuccess,
}: CorteRegistradoDialogProps) {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [periodo, setPeriodo] = useState('');

  const handleSubmit = async () => {
    try {
      await api.post('corte-registrado', null, {
        params: { acometida, fecha, hora, periodo },
      });
      onSuccess();
      setOpen(false);
    } catch (error) {
      console.error('Error al registrar el corte:', error);
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
                className="h-8 w-8 border-rose-500 text-rose-500 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30"
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Corte</DialogTitle>
          <DialogDescription>
            Complete los datos para registrar el corte de la acometida{' '}
            {acometida}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fecha" className="text-right">
              Fecha
            </Label>
            <Input
              id="fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              placeholder="dd-MM-yyyy"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hora" className="text-right">
              Hora
            </Label>
            <Input
              id="hora"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              placeholder="HH:mm:ss"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="periodo" className="text-right">
              Periodo
            </Label>
            <Input
              id="periodo"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              placeholder="MMAAAA"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={!isFormValid}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
