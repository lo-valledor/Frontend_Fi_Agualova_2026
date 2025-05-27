import React, { useEffect, useState } from 'react';
import api from '~/lib/api';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  CalendarIcon,
  ZapIcon,
  ActivityIcon,
  GaugeIcon,
  WatchIcon,
  InfoIcon,
  PlugIcon,
  Gauge,
  IdCard
} from 'lucide-react';
import type { EtapaUno, LecturaBT43 } from '~/types/monitor';
import { Skeleton } from '~/components/ui/skeleton';

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
        console.log(response.data);
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
    <div className="space-y-6">
      {lectura.map((item) => (
        <div key={item.LM_ID} className="">
          <Card className="overflow-hidden border-none shadow-lg dark:shadow-slate-900/10 hover:shadow-slate-500/10 transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-500 dark:from-slate-600 dark:to-slate-400 text-white p-3 md:p-4">
              <CardTitle className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg">
                  <InfoIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-sky-700 dark:text-sky-300">
                    Información General
                  </h3>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-5 bg-gradient-to-b from-white to-slate-50/30 dark:from-gray-900 dark:to-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col space-y-1 group items-center justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-slate-100 dark:bg-slate-900/30 p-1 rounded-md">
                      <CalendarIcon className="h-3.5 w-3.5 text-slate-700 dark:text-slate-400" />
                    </div>
                    <h4 className="text-xs font-medium text-sky-700 dark:text-sky-300">
                      Fecha Lectura
                    </h4>
                  </div>
                  <div className="pl-1">
                    <p className="text-base font-bold text-sky-800 dark:text-sky-200 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                      {format(new Date(item.LM_FechaLectura), 'dd-MM-yyyy')}
                    </p>
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                      {format(new Date(item.LM_FechaLectura), 'HH:mm:ss')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 group items-center justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-slate-100 dark:bg-slate-900/30 p-1.5 rounded-md">
                      <IdCard className="h-4 w-4 text-slate-700 dark:text-slate-400" />
                    </div>
                    <h4 className="text-sm font-medium text-sky-700 dark:text-sky-300">
                      Medidor
                    </h4>
                  </div>
                  <div className="pl-1">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                      {etapa1[0].ME_NSerie}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 group items-center justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-slate-100 dark:bg-slate-900/30 p-1.5 rounded-md">
                      <PlugIcon className="h-4 w-4 text-slate-700 dark:text-slate-400" />
                    </div>
                    <h4 className="text-sm font-medium text-sky-700 dark:text-sky-300">
                      Tipo Empalme
                    </h4>
                  </div>
                  <div className="pl-1">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                      {etapa1[0].TM_Descripcion}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 group items-center justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-slate-100 dark:bg-slate-900/30 p-1.5 rounded-md">
                      <Gauge className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h4 className="text-sm font-medium text-sky-700 dark:text-sky-300">
                      Constante
                    </h4>
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    {etapa1[0].ME_ConstanteMultiplicar}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <br />
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-sky-800">
                      Demanda Punta
                    </h3>
                    <div className="bg-indigo-100 rounded-full p-1">
                      <GaugeIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                  <p className="flex  items-center justify-center gap-2 text-2xl font-bold text-indigo-900">
                    {item.LMC_DemandaPunta || 0}{' '}
                    <span className="text-sm font-medium">Kw</span>
                  </p>
                  <p className="flex justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4" />{' '}
                    {item.LMC_FechaDemandaPunta
                      ? format(
                          new Date(item.LMC_FechaDemandaPunta),
                          'dd-MM-yyyy'
                        )
                      : 'dd-MM-yyyy'}
                  </p>
                  <p className="flex justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <WatchIcon className="h-4 w-4" />{' '}
                    {item.LMC_HoraDemandaPunta
                      ? item.LMC_HoraDemandaPunta
                      : '00:00:00'}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-emerald-800">
                      D. Suministrada
                    </h3>
                    <div className="bg-emerald-100 rounded-full p-1">
                      <GaugeIcon className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-2xl font-bold text-emerald-900">
                    {item.LMC_DemandaSuministrada || 0}{' '}
                    <span className="text-sm font-medium">Kw</span>
                  </p>
                  <p className="flex justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="h-4 w-4" />{' '}
                    {item.LMC_FechaDemandaSuminis
                      ? (() => {
                          try {
                            return format(
                              new Date(item.LMC_FechaDemandaSuminis),
                              'dd-MM-yyyy'
                            );
                          } catch (error) {
                            console.error(
                              'Error al formatear la fecha:',
                              error
                            );
                            return item.LMC_FechaDemandaSuminis;
                          }
                        })()
                      : 'Sin Lectura'}
                  </p>
                  <p className="flex justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <WatchIcon className="h-4 w-4" />{' '}
                    {item.LMC_HoraDemandaSuminis
                      ? item.LMC_HoraDemandaSuminis
                      : 'Sin Lectura'}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-amber-800">
                      Energía Activa
                    </h3>
                    <div className="bg-amber-100 rounded-full p-1">
                      <ZapIcon className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-2xl font-bold text-amber-900">
                    {item.LMC_EnergiaActiva || 0}{' '}
                    <span className="text-sm font-medium">Kwh</span>
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-rose-800">
                      Energía Reactiva
                    </h3>
                    <div className="bg-rose-100 rounded-full p-1">
                      <ActivityIcon className="h-4 w-4 text-rose-600" />
                    </div>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-2xl font-bold text-rose-900">
                    {item.LMC_EnergiaReactiva || 0}{' '}
                    <span className="text-sm font-medium">Kvarh</span>
                  </p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-100 shadow-sm">
                  <h3 className="text-xs font-medium text-sky-800 mb-2">
                    Consumo del Mes
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">
                        Energía Activa
                      </span>
                      <p className="text-lg font-bold text-sky-900">
                        {item.LMC_ConsumoEnergiaActiva || 0}{' '}
                        <span className="text-xs font-medium">Kwh</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">
                        Energía Reactiva
                      </span>
                      <p className="text-lg font-bold text-sky-900">
                        {item.LMC_ConsumoEnergiaReactiva || 0}{' '}
                        <span className="text-xs font-medium">Kvarh</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 shadow-sm">
                  <h3 className="text-sm font-medium text-violet-800 mb-2">
                    Última Lectura
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500">
                        Energía Activa
                      </span>
                      <p className="text-xl font-bold text-violet-900">
                        {item.LMC_ValorUltimaLectEnergiaActiva}{' '}
                        <span className="text-xs font-medium">Kwh</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">
                        Energía Reactiva
                      </span>
                      <p className="text-xl font-bold text-violet-900">
                        {item.LMC_ValorUltimaLectEnergiaReactiva}{' '}
                        <span className="text-xs font-medium">Kvarh</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Multa Factor de Potencia
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Porcentaje</span>
                  <span className="font-semibold text-red-800">
                    {item.LMC_PorcentajeMultaMalFactorPotencia}%
                  </span>
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
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="bg-gradient-to-r from-sky-700 to-sky-500 p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg bg-white/20" />
            <div>
              <Skeleton className="h-4 w-20 bg-white/20 mb-2" />
              <Skeleton className="h-6 w-40 bg-white/20" />
            </div>
          </div>
        </div>
        <div className="p-7 bg-gradient-to-b from-white to-sky-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Skeleton className="h-7 w-7 rounded-md bg-sky-100" />
                  <Skeleton className="h-4 w-24 bg-sky-100" />
                </div>
                <div className="pl-1">
                  <Skeleton className="h-7 w-28 bg-sky-100/50 mb-2" />
                  <Skeleton className="h-4 w-20 bg-sky-100/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-7 py-3 bg-sky-50">
          <Skeleton className="h-4 w-36 bg-sky-100/50" />
        </div>
      </Card>
    </div>
  );
}
