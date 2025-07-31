import {
  AlertCircle,
  Gauge,
  IdCard,
  Key,
  PlugIcon,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import type { EtapaUno } from '~/types/monitor';

import DetalleLecturaBT43 from '../detalle-lectura-bt43';

interface InformacionMedidorProps {
  data: EtapaUno[];
  error?: string;
  lecturaId: number;
}

export default function InformacionMedidor({
  data,
  error,
  lecturaId,
}: InformacionMedidorProps) {
  return (
    <Card className='border-0 shadow-none bg-transparent'>
      <CardHeader className='px-0 pb-2'>
        <CardTitle className='flex items-center gap-2 text-foreground text-sm font-medium'>
          <div className='h-5 w-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
            <Gauge className='h-3 w-3 text-blue-600 dark:text-blue-400' />
          </div>
          <span>Información del Medidor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-0 space-y-3'>
        {error ? (
          <div className='flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800'>
            <AlertCircle className='h-3 w-3 mt-0.5 flex-shrink-0' />
            <span>{error}</span>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {/* Medidor */}
            <div className='p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors'>
              <div className='flex items-center gap-2 mb-1.5'>
                <IdCard className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                  Medidor
                </span>
              </div>
              <p className='font-mono text-sm font-semibold text-foreground truncate'>
                {data[0]?.ME_NSerie || '-'}
              </p>
            </div>

            {/* Tipo */}
            <div className='p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors'>
              <div className='flex items-center gap-2 mb-1.5'>
                <Zap className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                  Tipo
                </span>
              </div>
              <p className='text-sm font-semibold text-foreground truncate'>
                {data[0]?.TM_Descripcion || '-'}
              </p>
            </div>

            {/* Tarifa */}
            <div className='p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors'>
              <div className='flex items-center justify-between mb-1.5'>
                <div className='flex items-center gap-2 min-w-0'>
                  <Key className='h-3 w-3 text-amber-600 dark:text-amber-400' />
                  <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                    Tarifa
                  </span>
                </div>
                {data?.[0]?.TF_Codigo === 'BT-4.3' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-6 px-2 text-xs flex-shrink-0'
                      >
                        <TrendingUp className='h-3 w-3 mr-1' />
                        <span className='hidden sm:inline'>Detalle</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-[98vw] sm:max-w-[95vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden'>
                      <DialogHeader>
                        <DialogTitle>
                          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                            <span className='text-lg font-semibold text-foreground'>
                              Detalle Lectura BT-4.3
                            </span>
                            <Badge variant='outline' className='font-mono text-xs self-start sm:self-auto'>
                              ID: {lecturaId}
                            </Badge>
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className='flex-1 overflow-auto'>
                        <DetalleLecturaBT43
                          lecturaId={lecturaId}
                          etapa1={data}
                        />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <p className='text-sm font-semibold text-foreground truncate'>
                {data[0]?.TF_Codigo || '-'}
              </p>
            </div>

            {/* Constante */}
            <div className='p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors'>
              <div className='flex items-center gap-2 mb-1.5'>
                <Gauge className='h-3 w-3 text-purple-600 dark:text-purple-400' />
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                  Constante
                </span>
              </div>
              <p className='font-mono text-sm font-semibold text-foreground truncate'>
                {data[0]?.ME_ConstanteMultiplicar || '-'}
              </p>
            </div>

            {/* Subempalme */}
            <div className='p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors'>
              <div className='flex items-center gap-2 mb-1.5'>
                <PlugIcon className='h-3 w-3 text-orange-600 dark:text-orange-400' />
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                  Subempalme
                </span>
              </div>
              <p className='text-sm font-semibold text-foreground truncate'>
                {data[0]?.SE_Codigo || '-'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}