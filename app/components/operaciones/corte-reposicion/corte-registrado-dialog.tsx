import { Calendar, Clock, Hash, Scissors } from 'lucide-react';
import { toast } from 'sonner';

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
      <DialogContent className='mx-4 sm:max-w-md rounded-xl border border-rose-200/40 bg-white/95 backdrop-blur-sm dark:border-rose-800/40 dark:bg-gray-900/95'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-rose-900 dark:text-rose-100 text-base sm:text-lg'>
            <div className='flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white flex-shrink-0'>
              <Scissors className='h-2.5 w-2.5 sm:h-3 sm:w-3' />
            </div>
            <span className='truncate'>Registrar Corte</span>
          </DialogTitle>
          <DialogDescription className='text-rose-700 dark:text-rose-300 text-sm sm:text-base'>
            Complete los datos para registrar el corte de la acometida{' '}
            <span className='font-mono font-medium text-xs sm:text-sm break-all'>
              {acometida}
            </span>.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-3 sm:gap-4 py-3 sm:py-4'>
          <div className='grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4'>
            <Label
              htmlFor='fecha'
              className='sm:text-right flex items-center gap-1 text-sm sm:text-base'
            >
              <Calendar className='h-3 w-3' />
              Fecha
            </Label>
            <Input
              id='fecha'
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              placeholder='dd-MM-yyyy'
              className='sm:col-span-3 text-sm sm:text-base h-9 sm:h-10'
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4'>
            <Label
              htmlFor='hora'
              className='sm:text-right flex items-center gap-1 text-sm sm:text-base'
            >
              <Clock className='h-3 w-3' />
              Hora
            </Label>
            <Input
              id='hora'
              value={hora}
              onChange={e => setHora(e.target.value)}
              placeholder='HH:mm:ss'
              className='sm:col-span-3 text-sm sm:text-base h-9 sm:h-10'
            />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4'>
            <Label
              htmlFor='periodo'
              className='sm:text-right flex items-center gap-1 text-sm sm:text-base'
            >
              <Hash className='h-3 w-3' />
              Periodo
            </Label>
            <Input
              id='periodo'
              value={periodo}
              onChange={e => setPeriodo(e.target.value)}
              placeholder='MMAAAA'
              className='sm:col-span-3 text-sm sm:text-base h-9 sm:h-10'
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='submit'
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className='w-full sm:w-auto bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-sm sm:text-base'
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
