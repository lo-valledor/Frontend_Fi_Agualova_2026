import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertCircle, Calendar, Gauge, StickyNote, Zap } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { EtapaDos } from '~/types/monitor';

interface InformacionLecturaProps {
  data: EtapaDos[];
  error?: string;
}

export default function InformacionLectura({
  data,
  error
}: InformacionLecturaProps) {
  const lectura = data?.[0];

  const renderInfoCard = (
    icon: React.ReactNode,
    label: string,
    value: string | number | null | undefined,
    unit?: string
  ) => (
    <div className='p-3 bg-muted/30 rounded-xl border border-border/20 hover:bg-muted/50 transition-colors'>
      <div className='flex items-center gap-2 mb-1.5'>
        {icon}
        <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
          {label}
        </span>
      </div>
      <p className='text-sm font-semibold text-foreground break-words'>
        {value ?? '-'}
        {value && unit && (
          <span className='text-xs font-normal text-muted-foreground ml-1'>
            {unit}
          </span>
        )}
      </p>
    </div>
  );

  return (
    <Card className='border-0 shadow-none bg-transparent'>
      <CardHeader className='px-0 pb-2'>
        <CardTitle className='flex items-center gap-2 text-foreground text-sm font-medium'>
          <div className='h-5 w-5 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
            <Zap className='h-3 w-3 text-green-600 dark:text-green-400' />
          </div>
          <span>Lectura del Periodo {lectura?.LM_Periodo || ''}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className='px-0 space-y-3'>
        {error ? (
          <div className='flex items-start gap-2 text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800'>
            <AlertCircle className='h-3 w-3 mt-0.5 flex-shrink-0' />
            <span>{error}</span>
          </div>
        ) : !lectura ? (
          <div className='flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800'>
            <AlertCircle className='h-3 w-3 mt-0.5 flex-shrink-0' />
            <span>No hay datos de la lectura del período en consulta.</span>
          </div>
        ) : (
          <div className='space-y-3'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
              {renderInfoCard(
                <Calendar className='h-3 w-3 text-primary' />,
                'Fecha Lectura',
                lectura.LM_FechaLectura
                  ? format(
                      new Date(lectura.LM_FechaLectura),
                      "d 'de' MMMM, yyyy HH:mm",
                      { locale: es }
                    )
                  : '-'
              )}
              {renderInfoCard(
                <Gauge className='h-3 w-3 text-purple-600 dark:text-purple-400' />,
                'Lectura Actual',
                lectura.LM_ValorLecturaActual?.toLocaleString('es-CL')
              )}
              {renderInfoCard(
                <Zap className='h-3 w-3 text-orange-600 dark:text-orange-400' />,
                'Consumo del Período',
                lectura.LM_ConsumoPeriodo?.toLocaleString('es-CL'),
                'kWh'
              )}
            </div>
            {lectura.LM_Observaciones && (
              <div className='p-3 bg-muted/30 rounded-xl border border-border/20'>
                <div className='flex items-center gap-2 mb-1.5'>
                  <StickyNote className='h-3 w-3 text-yellow-600 dark:text-yellow-400' />
                  <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                    Observaciones
                  </span>
                </div>
                <p className='text-sm text-foreground italic break-words'>
                  {lectura.LM_Observaciones}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
