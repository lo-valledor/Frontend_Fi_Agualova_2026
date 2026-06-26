import { CalendarIcon, CalendarRange, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { operacionesService } from '~/services/operacionesService';

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

  const handleAbrirPeriodo = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error('Por favor seleccione mes y año');
      return;
    }

    try {
      setIsLoading(true);

      const result = await operacionesService.postCrearPeriodoFacturacion({
        mes: selectedMonth,
        anio: selectedYear,
        nombreMes: meses[parseInt(selectedMonth) - 1]
      });

      if (result.error) {
        toast.error(
          result.error.includes('ya existe')
            ? 'El periodo ya existe, por favor seleccione otro o reabra el periodo'
            : result.error
        );
        return;
      }

      toast.success('El periodo se ha creado correctamente');
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error('Error inesperado al crear el periodo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold text-sky-800 dark:text-sky-200 flex items-center gap-2">
            <CalendarRange className="h-4 w-4 sm:h-5 sm:w-5" />
            Confirmar Apertura
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            ¿Está seguro que desea crear el periodo para el mes y año
            seleccionado?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3">
          <div className="space-y-1">
            <Label
              htmlFor="mes-inicio"
              className="text-xs font-medium text-muted-foreground flex items-center gap-1"
            >
              <CalendarIcon className="h-3 w-3" /> Mes
            </Label>
            <Input
              id="mes-inicio"
              value={meses[parseInt(selectedMonth) - 1]}
              disabled
              className="bg-muted/50 border-border/70 text-muted-foreground h-9 text-xs sm:text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="anio-inicio"
              className="text-xs font-medium text-muted-foreground flex items-center gap-1"
            >
              <CalendarRange className="h-3 w-3" /> Año
            </Label>
            <Input
              id="anio-inicio"
              value={selectedYear}
              disabled
              className="bg-muted/50 border-border/70 text-muted-foreground h-9 text-xs sm:text-sm"
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="sm"
            className="w-full sm:w-auto h-9 text-xs sm:text-sm rounded-md border-border/60 text-muted-foreground hover:bg-muted/60 transition-colors order-2 sm:order-1 gap-1"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Cancelar</span>
          </Button>
          <Button
            onClick={handleAbrirPeriodo}
            disabled={isLoading || !selectedMonth || !selectedYear}
            size="sm"
            variant="default"
            className="w-full sm:w-auto h-9 text-xs sm:text-sm rounded-md gap-1 order-1 sm:order-2 shadow-sm hover:shadow transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <span className="text-xs sm:text-sm">Procesando...</span>
              </>
            ) : (
              <>
                <CalendarRange className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Crear</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
