import {
  Gauge,
  IdCard,
  Info,
  Key,
  PlugIcon,
  TrendingUp,
  Zap,
} from 'lucide-react';

import { Alert, AlertDescription } from '~/components/ui/alert';
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
    <Card className='border border-slate-200/50 dark:border-slate-800/50 shadow-sm'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-3 text-slate-900 dark:text-slate-100 text-lg font-semibold'>
          <div className='p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg'>
            <Gauge className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          </div>
          Información del Medidor
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant='destructive' className='mb-4'>
            <Info className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {/* Medidor */}
            <div className='group p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors'>
              <div className='flex items-center gap-3 mb-2'>
                <IdCard className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                <span className='text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
                  Medidor
                </span>
              </div>
              <p className='font-mono text-lg font-semibold text-slate-900 dark:text-slate-100'>
                {data[0]?.ME_NSerie || '-'}
              </p>
            </div>

            {/* Tipo */}
            <div className='group p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors'>
              <div className='flex items-center gap-3 mb-2'>
                <Zap className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                <span className='text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
                  Tipo
                </span>
              </div>
              <p className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                {data[0]?.TM_Descripcion || '-'}
              </p>
            </div>

            {/* Tarifa */}
            <div className='group p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-3'>
                  <Key className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                  <span className='text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
                    Tarifa
                  </span>
                </div>
                {data?.[0]?.TF_Codigo === 'BT-4.3' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-7 px-2 text-xs'
                      >
                        <TrendingUp className='h-3 w-3 mr-1' />
                        Detalle
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='min-w-[950px] max-h-[90vh] overflow-y-auto'>
                      <DialogHeader>
                        <DialogTitle>
                          <div className='flex items-center gap-3'>
                            <h1 className='text-xl font-bold text-slate-900 dark:text-slate-100'>
                              Detalle Lectura BT-4.3
                            </h1>
                            <Badge variant='outline' className='font-mono'>
                              ID: {lecturaId}
                            </Badge>
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className='h-screen overflow-y-auto'>
                        <DetalleLecturaBT43
                          lecturaId={lecturaId}
                          etapa1={data}
                        />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <p className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                {data[0]?.TF_Codigo || '-'}
              </p>
            </div>

            {/* Constante */}
            <div className='group p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors'>
              <div className='flex items-center gap-3 mb-2'>
                <Gauge className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                <span className='text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
                  Constante
                </span>
              </div>
              <p className='font-mono text-lg font-semibold text-slate-900 dark:text-slate-100'>
                {data[0]?.ME_ConstanteMultiplicar || '-'}
              </p>
            </div>

            {/* Subempalme */}
            <div className='group p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors'>
              <div className='flex items-center gap-3 mb-2'>
                <PlugIcon className='h-4 w-4 text-orange-600 dark:text-orange-400' />
                <span className='text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
                  Subempalme
                </span>
              </div>
              <p className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
                {data[0]?.SE_Codigo || '-'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
