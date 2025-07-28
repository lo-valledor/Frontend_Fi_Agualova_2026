import { Calendar, Clock, Hash, Scissors } from 'lucide-react';
import { toast } from 'sonner';

import { useState } from 'react';

import { useActivityEvent } from '~/components/activity-tracker-hoc';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import api from '~/lib/api';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { trackDataAction } = useActivityEvent();

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      trackDataAction(
        'Registrar',
        'Corte y Reposición',
        `Corte registrado para acometida ${acometida}`
      );
      await api.post('corte-registrado', null, {
        params: { acometida, fecha, hora, periodo },
      });
      toast.success('Corte registrado correctamente');
      onSuccess();
      setOpen(false);
      // Limpiar formulario
      setFecha('');
      setHora('');
      setPeriodo('');
    } catch (error) {
      console.error('Error al registrar el corte:', error);
      toast.error('Error al registrar el corte. Intente nuevamente.');
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
                variant='outline'
                size='icon'
                className='h-8 w-8 border-rose-500 text-rose-500 hover:bg-rose-50 hover:border-rose-600 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30 dark:hover:border-rose-600 transition-colors'
              >
                <Scissors className='h-4 w-4' />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Registrar Corte</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className='sm:max-w-md rounded-xl border border-rose-200/40 bg-white/95 backdrop-blur-sm dark:border-rose-800/40 dark:bg-gray-900/95'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-rose-900 dark:text-rose-100'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white'>
              <Scissors className='h-3 w-3' />
            </div>
            Registrar Corte
          </DialogTitle>
          <DialogDescription className='text-rose-700 dark:text-rose-300'>
            Complete los datos para registrar el corte de la acometida{' '}
            <span className='font-mono font-medium'>{acometida}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label
              htmlFor='fecha'
              className='text-right flex items-center gap-1'
            >
              <Calendar className='h-3 w-3' />
              Fecha
            </Label>
            <Input
              id='fecha'
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              placeholder='dd-MM-yyyy'
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label
              htmlFor='hora'
              className='text-right flex items-center gap-1'
            >
              <Clock className='h-3 w-3' />
              Hora
            </Label>
            <Input
              id='hora'
              value={hora}
              onChange={e => setHora(e.target.value)}
              placeholder='HH:mm:ss'
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label
              htmlFor='periodo'
              className='text-right flex items-center gap-1'
            >
              <Hash className='h-3 w-3' />
              Periodo
            </Label>
            <Input
              id='periodo'
              value={periodo}
              onChange={e => setPeriodo(e.target.value)}
              placeholder='MMAAAA'
              className='col-span-3'
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='submit'
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className='bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white'
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
