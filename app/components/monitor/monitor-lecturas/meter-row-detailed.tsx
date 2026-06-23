import { Eye } from 'lucide-react';

import DetallesMedidor from '~/components/monitor/monitor-lecturas/detalles-medidor';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import type { MonitorMedidores } from '~/types/monitor';
import { cn } from '~/lib/utils';
import {
  getMeterStatus,
  isImportedReading
} from '~/utils/monitor/monitor-status';

import { StatusIndicator } from './status-indicator';

interface MeterRowDetailedProps {
  medidor: MonitorMedidores;
  onRefresh: () => void;
}

export function MeterRowDetailed({ medidor, onRefresh }: MeterRowDetailedProps) {
  const status = getMeterStatus(medidor.claveHtml);
  const isImported = isImportedReading(medidor);

  return (
    <div
      className={cn(
        'group grid items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl border hover:bg-muted/50 transition-all duration-200 border-l-4',
        'grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))_auto]',
        status.borderColor,
        isImported && 'bg-pink-100/80 dark:bg-pink-950/30 shadow-pink-200/50'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <StatusIndicator status={status} size="sm" />
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{medidor.nSerie}</div>
          <div className="text-xs text-muted-foreground">ID: {medidor.id}</div>
          <div className="sm:hidden flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={cn('text-xs', status.borderColor, status.textColor)}
            >
              <span className="mr-1">{status.icon}</span>
              <span className="truncate">{medidor.clave || status.label}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="hidden sm:block text-left">
        <div className="text-xs text-muted-foreground">Lectura</div>
        <div className="font-semibold text-sm">{medidor.consumo || '-'}</div>
      </div>

      <div className="hidden sm:block text-left">
        <div className="text-xs text-muted-foreground">Consumo</div>
        <div className="font-semibold text-sm">
          {medidor.ultimaLectura || '0'}
        </div>
      </div>

      <div className="hidden sm:block min-w-0 text-left">
        <div className="text-xs text-muted-foreground">Fecha</div>
        <div className="text-sm font-medium truncate">
          {medidor.fechaLectura
            ? new Date(medidor.fechaLectura).toLocaleString('es-CL', {
                dateStyle: 'short',
                timeStyle: 'short',
                hour12: false
              })
            : 'Sin registro'}
        </div>
      </div>

      <div className="hidden sm:flex justify-start">
        <Badge
          variant="outline"
          className={cn('text-xs ', status.borderColor, status.textColor)}
        >
          <span className="mr-1">{status.icon}</span>
          <span className="truncate">{medidor.clave || status.label}</span>
        </Badge>
      </div>

      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-hidden flex flex-col">
            <DialogHeader className="shrink-0 pb-3 sm:pb-4 border-b border-border/40 px-4 sm:px-6">
              <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={cn('p-1.5 sm:p-2 rounded-xl', status.bgColor)}>
                    {status.icon}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                      Detalle de Lectura
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      ID: {medidor.id} | Medidor: {medidor.nSerie}
                    </p>
                  </div>
                </div>
                <Badge className={cn(status.bgColor, 'text-xs sm:text-sm')}>
                  {status.label}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 sm:p-6">
                <DetallesMedidor lecturaId={medidor.id} onSuccess={onRefresh} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
