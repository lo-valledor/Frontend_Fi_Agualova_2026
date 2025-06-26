import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { toast } from 'sonner';
import { CalendarDaysIcon, PlusCircleIcon, Eraser } from 'lucide-react';
import { useOperaciones } from '~/hooks/use-operaciones';
import DialogAbrirPeriodo from './dialog-abrir-periodo';
import type { Anio } from '~/types/operaciones';
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
  { value: '12', label: 'Diciembre' },
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
  years,
}: DialogNuevoPeriodoProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [isOpeningPeriodo, setIsOpeningPeriodo] = useState(false);

  const { consultaAnio, isLoading } = useOperaciones();

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg shadow-sm">
                <CalendarDaysIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              Añadir Nuevo Periodo
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Selecciona el mes y año para crear un nuevo período de facturación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Mes de Inicio */}
            <div className="space-y-2">
              <Label
                htmlFor="mes-inicio"
                className="text-sm font-medium text-muted-foreground"
              >
                Mes de Inicio
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger id="mes-inicio" className="w-full">
                  <SelectValue placeholder="Selecciona un Mes" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Año */}
            <div className="space-y-2">
              <Label
                htmlFor="year"
                className="text-sm font-medium text-muted-foreground"
              >
                Año
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year" className="w-full">
                  <SelectValue placeholder="Selecciona el Año" />
                </SelectTrigger>
                <SelectContent>
                  {consultaAnio && consultaAnio.length > 0
                    ? consultaAnio.map((year) => (
                        <SelectItem
                          key={year.idaño}
                          value={year.año.toString()}
                        >
                          {year.año}
                        </SelectItem>
                      ))
                    : years.map((year) => (
                        <SelectItem
                          key={year.idaño}
                          value={year.año.toString()}
                        >
                          {year.año}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={handleClearFilters}
              variant="outline"
              disabled={isLoading}
              className="gap-2"
            >
              <Eraser className="h-4 w-4" />
              Limpiar
            </Button>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-muted-foreground hover:text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleOpenPeriodo}
              disabled={isLoading || !selectedMonth || !selectedYear}
              className="gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              <PlusCircleIcon className="h-4 w-4" />
              Continuar
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
