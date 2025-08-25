import { format } from 'date-fns';
import {
  ActivityIcon,
  CalendarIcon,
  Gauge,
  GaugeIcon,
  IdCard,
  InfoIcon,
  PlugIcon,
  ZapIcon
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';
import api from '~/lib/api';
import type { EtapaUno, LecturaBT43 } from '~/types/monitor';

// Helper para formatear fechas de forma segura
const formatSafeDate = (date: string | null, formatString: string) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return 'Sin registro';
  }
  return format(new Date(date), formatString);
};

export default function DetalleLecturaBT43({
  lecturaId,
  etapa1
}: {
  lecturaId: number;
  etapa1: EtapaUno[];
}) {
  const [lectura, setLectura] = useState<LecturaBT43[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLectura = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/detalle-tabla-bt-4-3/${lecturaId}`);
        setLectura(response.data as LecturaBT43[]);
      } catch (error) {
        console.error('Error al obtener datos de lectura:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectura();
  }, [lecturaId]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!lectura || lectura.length === 0) {
    return (
      <Card className='mt-4'>
        <CardContent className='flex items-center justify-center p-8'>
          <p className='text-gray-500'>No se encontraron datos de lectura</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className='h-[calc(100vh-200px)]'>
      <div className='space-y-3 pr-4'>
        {lectura.map(item => (
          <div key={item.LM_ID} className='space-y-3'>
            {/* Card Principal - Información General */}
            <Card className='border-0 shadow-none bg-transparent'>
              <CardHeader className='px-0 pb-2'>
                <CardTitle className='flex items-center gap-2 text-foreground text-sm font-medium'>
                  <div className='h-5 w-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                    <InfoIcon className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                  </div>
                  <span>Información General</span>
                </CardTitle>
              </CardHeader>
              <CardContent className='px-0 space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                  {/* Fecha Lectura */}
                  <div className='p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors'>
                    <div className='flex items-center gap-2 mb-1.5'>
                      <CalendarIcon className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                      <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Fecha
                      </span>
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-foreground truncate'>
                        {formatSafeDate(item.LM_FechaLectura, 'dd-MM-yyyy')}
                      </p>
                      <p className='text-xs text-muted-foreground font-mono truncate'>
                        {formatSafeDate(item.LM_FechaLectura, 'HH:mm:ss')}
                      </p>
                    </div>
                  </div>

                  {/* Medidor */}
                  <div className='p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors'>
                    <div className='flex items-center gap-2 mb-1.5'>
                      <IdCard className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                      <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Medidor
                      </span>
                    </div>
                    <p className='font-mono text-sm font-semibold text-foreground truncate'>
                      {etapa1[0].ME_NSerie}
                    </p>
                  </div>

                  {/* Tipo Empalme */}
                  <div className='p-3 bg-muted/30 rounded-lg border border-border/20 hover:bg-muted/50 transition-colors'>
                    <div className='flex items-center gap-2 mb-1.5'>
                      <PlugIcon className='h-3 w-3 text-amber-600 dark:text-amber-400' />
                      <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                        Tipo
                      </span>
                    </div>
                    <p className='text-sm font-semibold text-foreground truncate'>
                      {etapa1[0].TM_Descripcion}
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
                      {etapa1[0].ME_ConstanteMultiplicar}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Métricas Principales */}
            <Card className='border-0 shadow-none bg-transparent'>
              <CardContent className='px-0 space-y-3'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                  {/* Demanda Punta */}
                  <div className='p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-lg border border-blue-200/30 dark:border-blue-800/30 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 transition-colors'>
                    <div className='flex items-center gap-2 mb-1.5'>
                      <GaugeIcon className='h-3 w-3 text-blue-600 dark:text-blue-400' />
                      <span className='text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide'>
                        D. Punta
                      </span>
                    </div>
                    <div className='mb-2'>
                      <div className='flex items-baseline gap-1'>
                        <span className='text-lg font-bold text-blue-900 dark:text-blue-100'>
                          {item.LMC_DemandaPunta || 0}
                        </span>
                        <span className='text-xs font-medium text-blue-700 dark:text-blue-300'>
                          kW
                        </span>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>Fecha:</span>
                        <span className='font-medium text-foreground truncate ml-1'>
                          {formatSafeDate(
                            item.LMC_FechaDemandaPunta,
                            'dd-MM-yyyy'
                          )}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>Hora:</span>
                        <span className='font-medium font-mono text-foreground truncate ml-1'>
                          {item.LMC_HoraDemandaPunta || 'Sin registro'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Demanda Suministrada */}
                  <div className='p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200/30 dark:border-emerald-800/30 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 transition-colors'>
                    <div className='flex items-center gap-2 mb-1.5'>
                      <GaugeIcon className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                      <span className='text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide'>
                        D. Suministrada
                      </span>
                    </div>
                    <div className='mb-2'>
                      <div className='flex items-baseline gap-1'>
                        <span className='text-lg font-bold text-emerald-900 dark:text-emerald-100'>
                          {item.LMC_DemandaSuministrada || 0}
                        </span>
                        <span className='text-xs font-medium text-emerald-700 dark:text-emerald-300'>
                          kW
                        </span>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>Fecha:</span>
                        <span className='font-medium text-foreground truncate ml-1'>
                          {formatSafeDate(
                            item.LMC_FechaDemandaSuminis,
                            'dd-MM-yyyy'
                          )}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-muted-foreground'>Hora:</span>
                        <span className='font-medium font-mono text-foreground truncate ml-1'>
                          {item.LMC_HoraDemandaSuminis || 'Sin registro'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Energía Activa */}
                  <div className='p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200/30 dark:border-amber-800/30 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 transition-colors'>
                    <div className='flex items-center gap-2 mb-1.5'>
                      <ZapIcon className='h-3 w-3 text-amber-600 dark:text-amber-400' />
                      <span className='text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wide'>
                        E. Activa
                      </span>
                    </div>
                    <div className='flex items-baseline gap-1 mt-3'>
                      <span className='text-lg font-bold text-amber-900 dark:text-amber-100'>
                        {item.LMC_EnergiaActiva || 0}
                      </span>
                      <span className='text-xs font-medium text-amber-700 dark:text-amber-300'>
                        kWh
                      </span>
                    </div>
                  </div>

                  {/* Energía Reactiva */}
                  <div className='p-3 bg-rose-50/50 dark:bg-rose-950/30 rounded-lg border border-rose-200/30 dark:border-rose-800/30 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 transition-colors'>
                    <div className='flex items-center gap-2 mb-1.5'>
                      <ActivityIcon className='h-3 w-3 text-rose-600 dark:text-rose-400' />
                      <span className='text-xs font-medium text-rose-700 dark:text-rose-300 uppercase tracking-wide'>
                        E. Reactiva
                      </span>
                    </div>
                    <div className='flex items-baseline gap-1 mt-3'>
                      <span className='text-lg font-bold text-rose-900 dark:text-rose-100'>
                        {item.LMC_EnergiaReactiva || 0}
                      </span>
                      <span className='text-xs font-medium text-rose-700 dark:text-rose-300'>
                        kVArh
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className='my-3' />

                {/* Sección de Consumos y Lecturas */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  {/* Consumo del Mes */}
                  <div className='p-3 bg-sky-50/30 dark:bg-sky-950/20 rounded-lg border border-sky-200/30 dark:border-sky-800/30 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-colors'>
                    <div className='flex items-center gap-2 mb-2'>
                      <ActivityIcon className='h-3 w-3 text-sky-600 dark:text-sky-400' />
                      <span className='text-sm font-medium text-sky-800 dark:text-sky-200'>
                        Consumo del Mes
                      </span>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <div className='p-2 bg-white/60 dark:bg-sky-900/20 rounded border border-sky-200/30 dark:border-sky-700/30'>
                        <span className='text-xs text-muted-foreground font-medium block mb-1'>
                          E. Activa
                        </span>
                        <div className='flex items-baseline gap-1'>
                          <span className='text-sm font-bold text-sky-900 dark:text-sky-100'>
                            {item.LMC_ConsumoEnergiaActiva || 0}
                          </span>
                          <span className='text-xs font-medium text-sky-700 dark:text-sky-300'>
                            kWh
                          </span>
                        </div>
                      </div>
                      <div className='p-2 bg-white/60 dark:bg-sky-900/20 rounded border border-sky-200/30 dark:border-sky-700/30'>
                        <span className='text-xs text-muted-foreground font-medium block mb-1'>
                          E. Reactiva
                        </span>
                        <div className='flex items-baseline gap-1'>
                          <span className='text-sm font-bold text-sky-900 dark:text-sky-100'>
                            {item.LMC_ConsumoEnergiaReactiva || 0}
                          </span>
                          <span className='text-xs font-medium text-sky-700 dark:text-sky-300'>
                            kVArh
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Última Lectura */}
                  <div className='p-3 bg-violet-50/30 dark:bg-violet-950/20 rounded-lg border border-violet-200/30 dark:border-violet-800/30 hover:bg-violet-50/50 dark:hover:bg-violet-950/30 transition-colors'>
                    <div className='flex items-center gap-2 mb-2'>
                      <ZapIcon className='h-3 w-3 text-violet-600 dark:text-violet-400' />
                      <span className='text-sm font-medium text-violet-800 dark:text-violet-200'>
                        Última Lectura
                      </span>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <div className='p-2 bg-white/60 dark:bg-violet-900/20 rounded border border-violet-200/30 dark:border-violet-700/30'>
                        <span className='text-xs text-muted-foreground font-medium block mb-1'>
                          E. Activa
                        </span>
                        <div className='flex items-baseline gap-1'>
                          <span className='text-sm font-bold text-violet-900 dark:text-violet-100'>
                            {item.LMC_ValorUltimaLectEnergiaActiva}
                          </span>
                          <span className='text-xs font-medium text-violet-700 dark:text-violet-300'>
                            kWh
                          </span>
                        </div>
                      </div>
                      <div className='p-2 bg-white/60 dark:bg-violet-900/20 rounded border border-violet-200/30 dark:border-violet-700/30'>
                        <span className='text-xs text-muted-foreground font-medium block mb-1'>
                          E. Reactiva
                        </span>
                        <div className='flex items-baseline gap-1'>
                          <span className='text-sm font-bold text-violet-900 dark:text-violet-100'>
                            {item.LMC_ValorUltimaLectEnergiaReactiva}
                          </span>
                          <span className='text-xs font-medium text-violet-700 dark:text-violet-300'>
                            kVArh
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multa Factor de Potencia */}
                <div className='mt-3 p-3 bg-red-50/30 dark:bg-red-950/20 rounded-lg border border-red-200/30 dark:border-red-800/30 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-colors'>
                  <div className='flex items-center gap-2 mb-2'>
                    <InfoIcon className='h-3 w-3 text-red-600 dark:text-red-400' />
                    <span className='text-sm font-medium text-red-800 dark:text-red-200'>
                      Multa Factor de Potencia
                    </span>
                  </div>
                  <div className='flex items-center justify-between p-2 bg-white/60 dark:bg-red-900/20 rounded border border-red-200/30 dark:border-red-700/30'>
                    <span className='text-sm text-muted-foreground font-medium'>
                      Porcentaje
                    </span>
                    <div className='flex items-baseline gap-1'>
                      <span className='text-lg font-bold text-red-800 dark:text-red-200'>
                        {item.LMC_PorcentajeMultaMalFactorPotencia}
                      </span>
                      <span className='text-sm font-medium text-red-700 dark:text-red-300'>
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function LoadingSkeleton() {
  return (
    <div className='space-y-3'>
      {/* Skeleton para Card Principal */}
      <Card className='border border-border/40 dark:border-border/20 shadow-sm'>
        <CardHeader className='px-3 py-2 border-b border-border/40'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-6 rounded bg-blue-100 dark:bg-blue-900/50' />
            <div className='space-y-1'>
              <Skeleton className='h-3 w-24 bg-muted' />
              <Skeleton className='h-2 w-32 bg-muted/70' />
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-3'>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-2'>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className='p-2 bg-muted/30 rounded-lg border border-border/30 space-y-1'
              >
                <div className='flex items-center gap-1.5'>
                  <Skeleton className='h-3 w-3 rounded bg-muted' />
                  <Skeleton className='h-2 w-16 bg-muted' />
                </div>
                <div className='space-y-1'>
                  <Skeleton className='h-3 w-20 bg-muted' />
                  <Skeleton className='h-2 w-12 bg-muted/70' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skeleton para Card de Métricas */}
      <Card className='border border-border/40 dark:border-border/20 shadow-sm'>
        <CardContent className='p-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2'>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className='p-3 bg-muted/30 rounded-lg border border-border/30'
              >
                <div className='flex items-center justify-between mb-2'>
                  <Skeleton className='h-2 w-16 bg-muted' />
                  <Skeleton className='h-5 w-5 rounded bg-muted' />
                </div>
                <div className='mb-2'>
                  <div className='flex items-baseline gap-1'>
                    <Skeleton className='h-5 w-12 bg-muted' />
                    <Skeleton className='h-3 w-6 bg-muted/70' />
                  </div>
                </div>
                <div className='space-y-1'>
                  <Skeleton className='h-2 w-full bg-muted/70' />
                  <Skeleton className='h-2 w-3/4 bg-muted/70' />
                </div>
              </div>
            ))}
          </div>

          <div className='my-3'>
            <Skeleton className='h-px w-full bg-muted' />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
            {[1, 2].map(i => (
              <div
                key={i}
                className='p-3 bg-muted/30 rounded-lg border border-border/30'
              >
                <div className='flex items-center gap-2 mb-2'>
                  <Skeleton className='h-5 w-5 rounded bg-muted' />
                  <Skeleton className='h-3 w-20 bg-muted' />
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  {[1, 2].map(j => (
                    <div
                      key={j}
                      className='p-2 bg-background/60 rounded border border-border/30'
                    >
                      <Skeleton className='h-2 w-12 bg-muted mb-1' />
                      <div className='flex items-baseline gap-1'>
                        <Skeleton className='h-3 w-8 bg-muted' />
                        <Skeleton className='h-2 w-6 bg-muted/70' />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className='mt-3 p-3 bg-red-50/30 dark:bg-red-950/20 rounded-lg border border-red-200/30 dark:border-red-800/30'>
            <div className='flex items-center gap-2 mb-2'>
              <Skeleton className='h-5 w-5 rounded bg-red-200 dark:bg-red-700' />
              <Skeleton className='h-3 w-32 bg-red-200 dark:bg-red-700' />
            </div>
            <div className='flex items-center justify-between p-2 bg-white/60 dark:bg-red-900/20 rounded border border-red-200/30 dark:border-red-700/30'>
              <Skeleton className='h-3 w-16 bg-muted' />
              <div className='flex items-baseline gap-1'>
                <Skeleton className='h-5 w-8 bg-red-200 dark:bg-red-700' />
                <Skeleton className='h-3 w-3 bg-red-100 dark:bg-red-800' />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
