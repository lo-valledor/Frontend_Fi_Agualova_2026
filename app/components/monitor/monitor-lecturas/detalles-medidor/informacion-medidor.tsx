import {
  AlertCircle,
  ChevronRight,
  Gauge,
  IdCard,
  Key,
  PlugIcon,
  Zap
} from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog';
import { ScrollArea } from '~/components/ui/scroll-area';
import type { EtapaUno } from '~/types/monitor';

import DetalleLecturaBT43 from '../detalle-lectura-bt43';

interface InformacionMedidorProps {
  data: EtapaUno[];
  error?: string;
  lecturaId: number;
}

// Info field component for DRY principle
interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  colorClass?: string;
  children?: React.ReactNode;
}

const InfoField = ({
  icon,
  label,
  value,
  colorClass = 'bg-background dark:bg-background border-sky-500 focus-within:bg-ring',
  children
}: InfoFieldProps) => (
  <div
    className={`p-3 rounded-xl border border-border transition-colors ${colorClass}`}
  >
    <div className='flex items-center gap-2 mb-1.5'>
      {icon}
      <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
        {label}
      </span>
    </div>
    {children || (
      <p className='font-mono text-sm font-semibold text-foreground truncate'>
        {value || '-'}
      </p>
    )}
  </div>
);

export default function InformacionMedidor({
  data,
  error,
  lecturaId
}: InformacionMedidorProps) {
  const meterData = data[0]; // Simplify access to first element

  return (
    <Card className='border-0 shadow-none bg-transparent'>
      <CardHeader className='px-0 pb-2'>
        <CardTitle className='flex items-center gap-2 text-foreground text-sm font-medium'>
          <div className='h-5 w-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
            <Gauge className='h-3 w-3 ' />
          </div>
          <span>Información del Medidor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-0 space-y-3'>
        {/* Early return for error state */}
        {error ? (
          <div className='flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800'>
            <AlertCircle className='h-3 w-3 mt-0.5 shrink-0' />
            <span>{error}</span>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {/* Medidor */}
            <InfoField
              icon={<IdCard className='h-3 w-3 ' />}
              label='Medidor'
              value={meterData?.ME_NSerie}
            />

            {/* Tipo */}
            <InfoField
              icon={
                <Zap className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
              }
              label='Tipo'
              value={meterData?.TM_Descripcion}
            >
              <p className='text-sm font-semibold text-foreground truncate'>
                {meterData?.TM_Descripcion || '-'}
              </p>
            </InfoField>

            {/* Tarifa with conditional dialog */}
            <InfoField
              icon={
                <Key className='h-3 w-3 text-amber-600 dark:text-amber-400' />
              }
              label='Tarifa'
              value={meterData?.TF_Codigo}
            >
              <div className='flex items-center justify-between gap-2'>
                <p className='text-sm font-semibold text-foreground truncate'>
                  {meterData?.TF_Codigo || '-'}
                </p>
                {meterData?.TF_Codigo === 'BT-4.3' && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 px-2 text-xs shrink-0 hover:bg-primary/10'
                      >
                        <span>Ver detalle</span>
                        <ChevronRight className='h-3.5 w-3.5 ml-1' />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-[98vw] sm:max-w-[95vw] md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden'>
                      <DialogHeader>
                        <DialogTitle>
                          <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                            <span className='text-lg font-semibold text-foreground'>
                              Detalle Lectura BT-4.3
                            </span>
                            <Badge
                              variant='outline'
                              className='font-mono text-xs self-start sm:self-auto'
                            >
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
            </InfoField>

            {/* Constante */}
            <InfoField
              icon={
                <Gauge className='h-3 w-3 text-purple-600 dark:text-purple-400' />
              }
              label='Constante'
              value={meterData?.ME_ConstanteMultiplicar}
            />

            {/* Subempalme */}
            <InfoField
              icon={
                <PlugIcon className='h-3 w-3 text-orange-600 dark:text-orange-400' />
              }
              label='Subempalme'
              value={meterData?.SE_Codigo}
            >
              <p className='text-sm font-semibold text-foreground truncate'>
                {meterData?.SE_Codigo || '-'}
              </p>
            </InfoField>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
