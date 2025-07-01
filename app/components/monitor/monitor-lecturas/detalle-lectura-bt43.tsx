import React, { useEffect, useState } from 'react';
import api from '~/lib/api';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import {
  CalendarIcon,
  ZapIcon,
  ActivityIcon,
  GaugeIcon,
  InfoIcon,
  PlugIcon,
  Gauge,
  IdCard,
} from 'lucide-react';
import type { EtapaUno, LecturaBT43 } from '~/types/monitor';
import { Skeleton } from '~/components/ui/skeleton';

// Helper para formatear fechas de forma segura
const formatSafeDate = (date: string | null, formatString: string) => {
  if (!date || isNaN(new Date(date).getTime())) {
    return 'Sin registro';
  }
  return format(new Date(date), formatString);
};

export default function DetalleLecturaBT43({
  lecturaId,
  etapa1,
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
      <Card className="mt-4">
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-gray-500">No se encontraron datos de lectura</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="">
      {lectura.map((item) => (
        <div key={item.LM_ID} className="space-y-3">
          {/* Card Principal - Información General */}
          <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100 text-base font-semibold">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                  <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-base font-semibold">Información General</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-normal">
                    Detalles de Lectura BT 4-3
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Fecha Lectura */}
                <div className="group p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Fecha Lectura
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {formatSafeDate(item.LM_FechaLectura, 'dd-MM-yyyy')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">
                      {formatSafeDate(item.LM_FechaLectura, 'HH:mm:ss')}
                    </p>
                  </div>
                </div>

                {/* Medidor */}
                <div className="group p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <IdCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Medidor
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100 font-mono">
                    {etapa1[0].ME_NSerie}
                  </p>
                </div>

                {/* Tipo Empalme */}
                <div className="group p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <PlugIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Tipo Empalme
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {etapa1[0].TM_Descripcion}
                  </p>
                </div>

                {/* Constante */}
                <div className="group p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Gauge className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Constante
                    </span>
                  </div>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100 font-mono">
                    {etapa1[0].ME_ConstanteMultiplicar}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card de Métricas Principales */}
          <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Demanda Punta */}
                <div className="group p-4 bg-blue-50/30 dark:bg-blue-950/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                      Demanda Punta
                    </span>
                    <div className="p-1.5 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg">
                      <GaugeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        {item.LMC_DemandaPunta || 0}
                      </span>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        kW
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        Fecha:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatSafeDate(
                          item.LMC_FechaDemandaPunta,
                          'dd-MM-yyyy',
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        Hora:
                      </span>
                      <span className="font-medium font-mono text-slate-900 dark:text-slate-100">
                        {item.LMC_HoraDemandaPunta || 'Sin registro'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Demanda Suministrada */}
                <div className="group p-4 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/30 dark:border-emerald-800/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                      D. Suministrada
                    </span>
                    <div className="p-1.5 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg">
                      <GaugeIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                        {item.LMC_DemandaSuministrada || 0}
                      </span>
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        kW
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        Fecha:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatSafeDate(
                          item.LMC_FechaDemandaSuminis,
                          'dd-MM-yyyy',
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        Hora:
                      </span>
                      <span className="font-medium font-mono text-slate-900 dark:text-slate-100">
                        {item.LMC_HoraDemandaSuminis || 'Sin registro'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Energía Activa */}
                <div className="group p-4 bg-amber-50/30 dark:bg-amber-950/20 rounded-xl border border-amber-200/30 dark:border-amber-800/30 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                      Energía Activa
                    </span>
                    <div className="p-1.5 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg">
                      <ZapIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mt-10">
                    <span className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {item.LMC_EnergiaActiva || 0}
                    </span>
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      kWh
                    </span>
                  </div>
                </div>

                {/* Energía Reactiva */}
                <div className="group p-4 bg-rose-50/30 dark:bg-rose-950/20 rounded-xl border border-rose-200/30 dark:border-rose-800/30 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                      Energía Reactiva
                    </span>
                    <div className="p-1.5 bg-rose-100/50 dark:bg-rose-900/30 rounded-lg">
                      <ActivityIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mt-10">
                    <span className="text-xl font-bold text-rose-900 dark:text-rose-100">
                      {item.LMC_EnergiaReactiva || 0}
                    </span>
                    <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                      kVArh
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Sección de Consumos y Lecturas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Consumo del Mes */}
                <div className="p-4 bg-sky-50/30 dark:bg-sky-950/20 rounded-xl border border-sky-200/30 dark:border-sky-800/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 bg-sky-100/50 dark:bg-sky-900/30 rounded-lg">
                      <ActivityIcon className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <span className="text-sm font-semibold text-sky-800 dark:text-sky-200">
                      Consumo del Mes
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-white/60 dark:bg-sky-900/20 rounded-lg border border-sky-200/30 dark:border-sky-700/30">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        Energía Activa
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-sky-900 dark:text-sky-100">
                          {item.LMC_ConsumoEnergiaActiva || 0}
                        </span>
                        <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                          kWh
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-white/60 dark:bg-sky-900/20 rounded-lg border border-sky-200/30 dark:border-sky-700/30">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        Energía Reactiva
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-sky-900 dark:text-sky-100">
                          {item.LMC_ConsumoEnergiaReactiva || 0}
                        </span>
                        <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                          kVArh
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Última Lectura */}
                <div className="p-4 bg-violet-50/30 dark:bg-violet-950/20 rounded-xl border border-violet-200/30 dark:border-violet-800/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 bg-violet-100/50 dark:bg-violet-900/30 rounded-lg">
                      <ZapIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm font-semibold text-violet-800 dark:text-violet-200">
                      Última Lectura
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-white/60 dark:bg-violet-900/20 rounded-lg border border-violet-200/30 dark:border-violet-700/30">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        Energía Activa
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-violet-900 dark:text-violet-100">
                          {item.LMC_ValorUltimaLectEnergiaActiva}
                        </span>
                        <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                          kWh
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-white/60 dark:bg-violet-900/20 rounded-lg border border-violet-200/30 dark:border-violet-700/30">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium block mb-1">
                        Energía Reactiva
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-bold text-violet-900 dark:text-violet-100">
                          {item.LMC_ValorUltimaLectEnergiaReactiva}
                        </span>
                        <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                          kVArh
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multa Factor de Potencia */}
              <div className="mt-4 p-4 bg-red-50/30 dark:bg-red-950/20 rounded-xl border border-red-200/30 dark:border-red-800/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-1.5 bg-red-100/50 dark:bg-red-900/30 rounded-lg">
                    <InfoIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-base font-semibold text-red-800 dark:text-red-200">
                    Multa Factor de Potencia
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-red-900/20 rounded-lg border border-red-200/30 dark:border-red-700/30">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Porcentaje
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-red-800 dark:text-red-200">
                      {item.LMC_PorcentajeMultaMalFactorPotencia}
                    </span>
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
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
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Skeleton para Card Principal */}
      <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/50" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-3 w-48 bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-5 w-24 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-4 w-16 bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skeleton para Card de Métricas */}
      <Card className="border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 bg-slate-50/30 dark:bg-slate-900/20 rounded-xl border border-slate-200/30 dark:border-slate-800/30"
              >
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-3 w-20 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <Skeleton className="h-8 w-16 bg-slate-200 dark:bg-slate-700" />
                    <Skeleton className="h-4 w-8 bg-slate-100 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-slate-100 dark:bg-slate-800" />
                  <Skeleton className="h-3 w-3/4 bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>

          <div className="my-6">
            <Skeleton className="h-px w-full bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-5 bg-slate-50/30 dark:bg-slate-900/20 rounded-xl border border-slate-200/30 dark:border-slate-800/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="p-3 bg-white/60 dark:bg-slate-900/20 rounded-lg border border-slate-200/30 dark:border-slate-700/30"
                    >
                      <Skeleton className="h-3 w-16 bg-slate-200 dark:bg-slate-700 mb-1" />
                      <div className="flex items-baseline gap-1">
                        <Skeleton className="h-5 w-12 bg-slate-200 dark:bg-slate-700" />
                        <Skeleton className="h-3 w-8 bg-slate-100 dark:bg-slate-800" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 bg-red-50/30 dark:bg-red-950/20 rounded-xl border border-red-200/30 dark:border-red-800/30">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-6 w-6 rounded-lg bg-red-200 dark:bg-red-700" />
              <Skeleton className="h-4 w-40 bg-red-200 dark:bg-red-700" />
            </div>
            <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-red-900/20 rounded-lg border border-red-200/30 dark:border-red-700/30">
              <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-baseline gap-1">
                <Skeleton className="h-8 w-12 bg-red-200 dark:bg-red-700" />
                <Skeleton className="h-4 w-4 bg-red-100 dark:bg-red-800" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
