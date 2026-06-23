import { Calendar, Eye } from 'lucide-react';
import { motion } from 'motion/react';

import DetallesMedidor from '~/components/monitor/monitor-lecturas/detalles-medidor';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import type { MonitorMedidores } from '~/types/monitor';
import { cn } from '~/lib/utils';
import {
  getMeterStatus,
  isImportedReading
} from '~/utils/monitor/monitor-status';

import { StatusIndicator } from './status-indicator';

interface MeterCardProps {
  medidor: MonitorMedidores;
  onRefresh: () => void;
}

export function MeterCard({ medidor, onRefresh }: MeterCardProps) {
  const status = getMeterStatus(medidor.claveHtml);
  const isImported = isImportedReading(medidor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
    >
      <Card
        className={cn(
          'overflow-hidden transition-all duration-200 hover:shadow-lg border-l-4',
          status.borderColor,
          isImported && 'bg-pink-100/80 dark:bg-pink-950/30 shadow-pink-200/50'
        )}
      >
        <CardContent className="p-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <StatusIndicator status={status} size="sm" />
              <div className="min-w-0">
                <div className="font-medium text-xs truncate">
                  {medidor.nSerie}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  ID: {medidor.id}
                </div>
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-hidden flex flex-col">
                <DialogHeader className="shrink-0 pb-3 sm:pb-4 border-b border-border/40 px-4 sm:px-6">
                  <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={`p-1.5 sm:p-2 rounded-xl ${status.bgColor}`}
                      >
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
                    <Badge className={`${status.bgColor} text-xs sm:text-sm`}>
                      {status.label}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 sm:p-6">
                    <DetallesMedidor
                      lecturaId={medidor.id}
                      onSuccess={onRefresh}
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
            <div>
              <div className="text-muted-foreground text-[10px]">Lectura</div>
              <div className="font-semibold text-xs">
                {medidor.consumo || '0'}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-[10px]">Consumo</div>
              <div className="font-semibold text-xs">
                {medidor.ultimaLectura || '-'}
              </div>
            </div>
            <div className="col-span-2">
              <div className="font-medium text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="truncate">
                  {medidor.fechaLectura
                    ? new Date(medidor.fechaLectura).toLocaleString()
                    : 'Sin registro'}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`${status.borderColor} ${status.textColor} text-[10px] px-1 py-0`}
            >
              <span className="mr-1">{status.icon}</span>
              <span className="truncate">{medidor.clave || status.label}</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
