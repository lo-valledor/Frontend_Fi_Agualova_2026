import { CalendarIcon, CalendarRange, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { useNavigate } from 'react-router';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import api from '~/lib/api';

const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

interface DialogAbrirPeriodoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMonth?: string;
  selectedYear?: string;
  onSuccess?: () => void;
}

export default function DialogAbrirPeriodo({
  open,
  onOpenChange,
  selectedMonth = '',
  selectedYear = '',
  onSuccess
}: DialogAbrirPeriodoProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAbrirPeriodo = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error('Por favor seleccione mes y año');
      return;
    }

    try {
      setIsLoading(true);

      // Primer paso: Enviar datos con el nombre del periodo
      const nombreMes = meses[parseInt(selectedMonth) - 1];
      const params = {
        nombre: `${nombreMes} ${selectedYear}`,
        mesi: selectedMonth,
        añoi: selectedYear
      };
      const response = await api.post('/ingresa-periodo', params);

      if (response.status === 200) {
        toast.success('El periodo se ha abierto correctamente');
        onOpenChange(false);

        // Llamar a onSuccess si existe
        if (onSuccess) {
          onSuccess();
        } else {
          // Recargar la página si no hay onSuccess
          navigate(0);
        }
      } else {
        toast.error(
          'El periodo ya existe, por favor seleccione otro o reabra el periodo'
        );
      }
    } catch (error: any) {
      console.error('Error:', error);
      let errorMessage = error.response.data;

      if (error.response) {
        // Error de respuesta del servidor
        if (error.response.status === 404) {
          errorMessage = 'La ruta de la API no está disponible';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Error de conexión
        errorMessage = 'No se pudo conectar con el servidor';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='w-[95vw] max-w-md mx-auto'>
        <DialogHeader>
          <DialogTitle className='text-base sm:text-lg font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-2'>
            <CalendarRange className='h-4 w-4 sm:h-5 sm:w-5' />
            Confirmar Apertura
          </DialogTitle>
          <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
            ¿Está seguro que desea abrir el periodo para el mes y año
            seleccionado?
          </DialogDescription>
        </DialogHeader>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 py-3'>
          <div className='space-y-1'>
            <Label
              htmlFor='mes-inicio'
              className='text-xs font-medium text-muted-foreground flex items-center gap-1'
            >
              <CalendarIcon className='h-3 w-3' /> Mes
            </Label>
            <Input
              id='mes-inicio'
              value={meses[parseInt(selectedMonth) - 1]}
              disabled
              className='bg-muted/50 border-border/70 text-muted-foreground h-9 text-xs sm:text-sm'
            />
          </div>
          <div className='space-y-1'>
            <Label
              htmlFor='anio-inicio'
              className='text-xs font-medium text-muted-foreground flex items-center gap-1'
            >
              <CalendarRange className='h-3 w-3' /> Año
            </Label>
            <Input
              id='anio-inicio'
              value={selectedYear}
              disabled
              className='bg-muted/50 border-border/70 text-muted-foreground h-9 text-xs sm:text-sm'
            />
          </div>
        </div>
        <DialogFooter className='flex-col sm:flex-row gap-2'>
          <Button
            variant='ghost'
            onClick={() => onOpenChange(false)}
            size='sm'
            className='text-muted-foreground hover:text-muted-foreground hover:bg-muted order-2 sm:order-1'
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAbrirPeriodo}
            disabled={isLoading || !selectedMonth || !selectedYear}
            size='sm'
            variant='default'
            className='gap-1order-1 sm:order-2'
          >
            {isLoading ? (
              <>
                <Loader2 className='w-3 h-3 sm:w-4 sm:h-4 animate-spin' />
                <span className='text-xs sm:text-sm'>Procesando...</span>
              </>
            ) : (
              <>
                <CalendarRange className='w-3 h-3 sm:w-4 sm:h-4' />
                <span className='text-xs sm:text-sm'>Abrir</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
