import { CalendarDaysIcon, Eraser, PlusCircleIcon } from 'lucide-react';
import { toast } from 'sonner';

import React, { useState } from 'react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select';
import type { Anio } from '~/types/operaciones';

import DialogAbrirPeriodo from './dialog-abrir-periodo';

const months = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' }
];

interface DialogNuevoPeriodoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPeriodoCreated: () => void;
  years: Anio[];
}

export default function DialogNuevoPeriodo({
  open,
  onOpenChange,
  onPeriodoCreated,
  years
}: DialogNuevoPeriodoProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isOpeningPeriodo, setIsOpeningPeriodo] = useState(false);

  // No necesitamos el hook ya que years viene como prop

  const handleClearFilters = () => {
    setSelectedMonth('');
    setSelectedYear('');
    toast.success('Campos limpiados');
  };

  const handleOpenPeriodo = () => {
    if (!selectedMonth || !selectedYear) {
      toast.error('Por favor selecciona mes y año');
      return;
    }

    // Aquí llamaremos al dialog de confirmación existente
    setIsOpeningPeriodo(true);
  };

  const handleClose = () => {
    setSelectedMonth('');
    setSelectedYear('');
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className='w-[95vw] max-w-md mx-auto'>
          <DialogHeader>
            <DialogTitle className='text-base sm:text-lg font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-2'>
              <CalendarDaysIcon className='h-4 w-4 sm:h-5 sm:w-5' />
              Añadir Nuevo Periodo
            </DialogTitle>
            <DialogDescription className='text-xs sm:text-sm text-muted-foreground'>
              Selecciona el mes y año para crear un nuevo período
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-3'>
            {/* Mes de Inicio */}
            <div className='space-y-1'>
              <Label
                htmlFor='mes-inicio'
                className='text-xs sm:text-sm font-medium text-muted-foreground'
              >
                Mes de Inicio
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id='mes-inicio' className='w-full h-9'>
                  <SelectValue placeholder='Selecciona un Mes' />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Año */}
            <div className='space-y-1'>
              <Label
                htmlFor='year'
                className='text-xs sm:text-sm font-medium text-muted-foreground'
              >
                Año
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id='year' className='w-full h-9'>
                  <SelectValue placeholder='Selecciona el Año' />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.idaño} value={year.año.toString()}>
                      {year.año}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className='flex-col sm:flex-row gap-2'>
            <Button
              onClick={handleClearFilters}
              variant='outline'
              size='sm'
              className='gap-1 w-full sm:w-auto order-3 sm:order-1'
            >
              <Eraser className='h-3 w-3' />
              <span className='text-xs sm:text-sm'>Limpiar</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleClose}
              className='w-full sm:w-auto text-muted-foreground hover:text-muted-foreground hover:bg-muted order-2'
            >
              <span className='text-xs sm:text-sm'>Cancelar</span>
            </Button>
            <Button
              variant='default'
              size='sm'
              onClick={handleOpenPeriodo}
              disabled={!selectedMonth || !selectedYear}
              className='gap-1 w-full sm:w-autoorder-1 sm:order-3'
            >
              <PlusCircleIcon className='h-3 w-3' />
              <span className='text-xs sm:text-sm'>Continuar</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación existente */}
      {isOpeningPeriodo && (
        <DialogAbrirPeriodo
          open={isOpeningPeriodo}
          onOpenChange={setIsOpeningPeriodo}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onSuccess={() => {
            setIsOpeningPeriodo(false);
            handleClose();
            onPeriodoCreated();
          }}
        />
      )}
    </>
  );
}
