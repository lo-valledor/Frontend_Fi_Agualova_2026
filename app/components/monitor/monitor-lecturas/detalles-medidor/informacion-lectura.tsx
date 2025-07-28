import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Gauge, Info, StickyNote, Zap } from 'lucide-react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import type { EtapaDos } from '~/types/monitor';

interface InformacionLecturaProps {
  data: EtapaDos[];
  error?: string;
}

export default function InformacionLectura({
  data,
  error,
}: InformacionLecturaProps) {
  const lectura = data?.[0];

  const renderInfoCard = (
    icon: React.ReactNode,
    label: string,
    value: string | number | null | undefined,
    unit?: string
  ) => (
    <div className='group p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors'>
      <div className='flex items-center gap-3 mb-2'>
        {icon}
        <span className='text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
          {label}
        </span>
      </div>
      <p className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
        {value ?? '-'}
        {value && unit && (
          <span className='text-sm font-normal text-slate-500 ml-1'>
            {unit}
          </span>
        )}
      </p>
    </div>
  );

  return (
    <Card className='border border-slate-200/50 dark:border-slate-800/50 shadow-sm'>
      <CardHeader className='pb-4'>
        <CardTitle className='flex items-center gap-3 text-slate-900 dark:text-slate-100 text-lg font-semibold'>
          <div className='p-2 bg-green-50 dark:bg-green-950/50 rounded-lg'>
            <Zap className='h-5 w-5 text-green-600 dark:text-green-400' />
          </div>
          Lectura del Periodo {lectura.LM_Periodo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant='destructive' className='mb-4'>
            <Info className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !lectura ? (
          <Alert className='mb-4'>
            <Info className='h-4 w-4' />
            <AlertDescription>
              No hay datos de la lectura del período en consulta.
            </AlertDescription>
          </Alert>
        ) : (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {renderInfoCard(
                <Calendar className='h-4 w-4 text-sky-600 dark:text-sky-400' />,
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
                <Gauge className='h-4 w-4 text-purple-600 dark:text-purple-400' />,
                'Lectura Actual',
                lectura.LM_ValorLecturaActual?.toLocaleString('es-CL')
              )}
              {renderInfoCard(
                <Zap className='h-4 w-4 text-orange-600 dark:text-orange-400' />,
                'Consumo del Período',
                lectura.LM_ConsumoPeriodo?.toLocaleString('es-CL'),
                'kWh'
              )}
            </div>
            {lectura.LM_Observaciones && (
              <div className='p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50'>
                <div className='flex items-center gap-3 mb-2'>
                  <StickyNote className='h-4 w-4 text-yellow-600 dark:text-yellow-400' />
                  <span className='text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide'>
                    Observaciones
                  </span>
                </div>
                <p className='text-sm text-slate-700 dark:text-slate-300 italic'>
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
