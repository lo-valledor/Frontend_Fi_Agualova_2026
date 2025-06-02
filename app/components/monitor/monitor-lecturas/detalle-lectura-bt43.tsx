import React, { useEffect, useState } from "react";
import api from "~/lib/api";
import { format } from "date-fns";
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
  IdCard,
} from "lucide-react";
import type { EtapaUno, LecturaBT43 } from "~/types/monitor";
import { Skeleton } from "~/components/ui/skeleton";

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
        console.error("Error al obtener datos de lectura:", error);
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
    <div className="space-y-8">
      {lectura.map((item) => (
        <div key={item.LM_ID} className="group">
          <Card className="overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-xl dark:shadow-slate-900/30 hover:shadow-2xl dark:hover:shadow-slate-900/50 transition-all duration-500 hover:scale-[1.01]">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 text-white p-4 md:p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardTitle className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 dark:bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <InfoIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white drop-shadow-sm">
                    Información General
                  </p>
                  <p className="text-sm text-white/80 font-medium mt-1">
                    Detalles de Lectura BT 4-3
                  </p>
                </div>
              </CardTitle>
            </CardHeader>{" "}
            <CardContent className="p-6 md:p-8 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30 dark:from-slate-900/80 dark:via-slate-800 dark:to-slate-900/50 backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col space-y-3 group/item items-center justify-center p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                      <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Fecha Lectura
                    </h4>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-blue-700 dark:group-hover/item:text-blue-300 transition-colors">
                      {format(new Date(item.LM_FechaLectura), "dd-MM-yyyy")}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {format(new Date(item.LM_FechaLectura), "HH:mm:ss")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 group/item items-center justify-center p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-700/50">
                      <IdCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Medidor
                    </h4>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-300 transition-colors">
                      {etapa1[0].ME_NSerie}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 group/item items-center justify-center p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg border border-amber-200/50 dark:border-amber-700/50">
                      <PlugIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      Tipo Empalme
                    </h4>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-amber-700 dark:group-hover/item:text-amber-300 transition-colors">
                      {etapa1[0].TM_Descripcion}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-3 group/item items-center justify-center p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                      <Gauge className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                      Constante
                    </h4>
                  </div>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-purple-700 dark:group-hover/item:text-purple-300 transition-colors">
                    {etapa1[0].ME_ConstanteMultiplicar}
                  </p>
                </div>
              </div>
            </CardContent>{" "}
          </Card>

          <Card className="mt-8 overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-xl dark:shadow-slate-900/30">
            <CardContent className="p-6 md:p-8 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 dark:from-slate-900/50 dark:via-slate-800/80 dark:to-slate-900/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Demanda Punta */}
                <div className="group/card p-6 bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-blue-50/80 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/30 shadow-lg dark:shadow-indigo-900/20 hover:shadow-xl dark:hover:shadow-indigo-900/40 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                      Demanda Punta
                    </p>
                    <div className="bg-indigo-100/80 dark:bg-indigo-800/50 rounded-full p-2 group-hover/card:bg-indigo-200 dark:group-hover/card:bg-indigo-700 transition-colors">
                      <GaugeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-3xl font-bold text-indigo-900 dark:text-indigo-100 mb-4">
                    {item.LMC_DemandaPunta || 0}{" "}
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                      Kw
                    </span>
                  </p>
                  <div className="space-y-2">
                    <p className="flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Fecha:
                      </span>
                      <span className="font-medium">
                        {item.LMC_FechaDemandaPunta
                          ? format(
                              new Date(item.LMC_FechaDemandaPunta),
                              "dd-MM-yyyy"
                            )
                          : "Sin registro"}
                      </span>
                    </p>
                    <p className="flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <WatchIcon className="h-4 w-4" />
                        Hora:
                      </span>
                      <span className="font-medium">
                        {item.LMC_HoraDemandaPunta || "Sin registro"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Demanda Suministrada */}
                <div className="group/card p-6 bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-green-50/80 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-green-950/40 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30 shadow-lg dark:shadow-emerald-900/20 hover:shadow-xl dark:hover:shadow-emerald-900/40 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                      D. Suministrada
                    </p>
                    <div className="bg-emerald-100/80 dark:bg-emerald-800/50 rounded-full p-2 group-hover/card:bg-emerald-200 dark:group-hover/card:bg-emerald-700 transition-colors">
                      <GaugeIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-4">
                    {item.LMC_DemandaSuministrada || 0}{" "}
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Kw
                    </span>
                  </p>
                  <div className="space-y-2">
                    <p className="flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Fecha:
                      </span>
                      <span className="font-medium">
                        {item.LMC_FechaDemandaSuminis
                          ? (() => {
                              try {
                                return format(
                                  new Date(item.LMC_FechaDemandaSuminis),
                                  "dd-MM-yyyy"
                                );
                              } catch (error) {
                                console.error(
                                  "Error al formatear la fecha:",
                                  error
                                );
                                return item.LMC_FechaDemandaSuminis;
                              }
                            })()
                          : "Sin registro"}
                      </span>
                    </p>
                    <p className="flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <WatchIcon className="h-4 w-4" />
                        Hora:
                      </span>
                      <span className="font-medium">
                        {item.LMC_HoraDemandaSuminis || "Sin registro"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Energía Activa */}
                <div className="group/card p-6 bg-gradient-to-br from-amber-50/80 via-yellow-50/60 to-orange-50/80 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/40 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 shadow-lg dark:shadow-amber-900/20 hover:shadow-xl dark:hover:shadow-amber-900/40 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      Energía Activa
                    </p>
                    <div className="bg-amber-100/80 dark:bg-amber-800/50 rounded-full p-2 group-hover/card:bg-amber-200 dark:group-hover/card:bg-amber-700 transition-colors">
                      <ZapIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {item.LMC_EnergiaActiva || 0}{" "}
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Kwh
                    </span>
                  </p>
                </div>

                {/* Energía Reactiva */}
                <div className="group/card p-6 bg-gradient-to-br from-rose-50/80 via-pink-50/60 to-red-50/80 dark:from-rose-950/40 dark:via-pink-950/30 dark:to-red-950/40 rounded-2xl border border-rose-200/50 dark:border-rose-700/30 shadow-lg dark:shadow-rose-900/20 hover:shadow-xl dark:hover:shadow-rose-900/40 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                      Energía Reactiva
                    </p>
                    <div className="bg-rose-100/80 dark:bg-rose-800/50 rounded-full p-2 group-hover/card:bg-rose-200 dark:group-hover/card:bg-rose-700 transition-colors">
                      <ActivityIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                  </div>
                  <p className="flex items-center justify-center gap-2 text-3xl font-bold text-rose-900 dark:text-rose-100">
                    {item.LMC_EnergiaReactiva || 0}{" "}
                    <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                      Kvarh
                    </span>
                  </p>
                </div>
              </div>
              <Separator className="my-8 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Consumo del Mes */}
                <div className="group/card p-5 bg-gradient-to-br from-sky-50/80 via-blue-50/60 to-cyan-50/80 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-cyan-950/40 rounded-xl border border-sky-200/50 dark:border-sky-700/30 shadow-lg dark:shadow-sky-900/20 hover:shadow-xl dark:hover:shadow-sky-900/40 transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-sky-100/80 dark:bg-sky-800/50 rounded-full p-2 group-hover/card:bg-sky-200 dark:group-hover/card:bg-sky-700 transition-colors">
                      <ActivityIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <p className="text-sm font-semibold text-sky-800 dark:text-sky-200">
                      Consumo del Mes
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/60 dark:bg-sky-900/30 rounded-lg border border-sky-200/30 dark:border-sky-700/30">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Energía Activa
                      </span>
                      <p className="text-lg font-bold text-sky-900 dark:text-sky-100 mt-1">
                        {item.LMC_ConsumoEnergiaActiva || 0}{" "}
                        <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                          Kwh
                        </span>
                      </p>
                    </div>
                    <div className="p-3 bg-white/60 dark:bg-sky-900/30 rounded-lg border border-sky-200/30 dark:border-sky-700/30">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Energía Reactiva
                      </span>
                      <p className="text-lg font-bold text-sky-900 dark:text-sky-100 mt-1">
                        {item.LMC_ConsumoEnergiaReactiva || 0}{" "}
                        <span className="text-xs font-medium text-sky-700 dark:text-sky-300">
                          Kvarh
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Última Lectura */}
                <div className="group/card p-5 bg-gradient-to-br from-violet-50/80 via-purple-50/60 to-fuchsia-50/80 dark:from-violet-950/40 dark:via-purple-950/30 dark:to-fuchsia-950/40 rounded-xl border border-violet-200/50 dark:border-violet-700/30 shadow-lg dark:shadow-violet-900/20 hover:shadow-xl dark:hover:shadow-violet-900/40 transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-violet-100/80 dark:bg-violet-800/50 rounded-full p-2 group-hover/card:bg-violet-200 dark:group-hover/card:bg-violet-700 transition-colors">
                      <ZapIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <p className="text-sm font-semibold text-violet-800 dark:text-violet-200">
                      Última Lectura
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/60 dark:bg-violet-900/30 rounded-lg border border-violet-200/30 dark:border-violet-700/30">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Energía Activa
                      </span>
                      <p className="text-lg font-bold text-violet-900 dark:text-violet-100 mt-1">
                        {item.LMC_ValorUltimaLectEnergiaActiva}{" "}
                        <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                          Kwh
                        </span>
                      </p>
                    </div>
                    <div className="p-3 bg-white/60 dark:bg-violet-900/30 rounded-lg border border-violet-200/30 dark:border-violet-700/30">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Energía Reactiva
                      </span>
                      <p className="text-lg font-bold text-violet-900 dark:text-violet-100 mt-1">
                        {item.LMC_ValorUltimaLectEnergiaReactiva}{" "}
                        <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                          Kvarh
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Multa Factor de Potencia */}
              <div className="mt-6 group/card p-5 bg-gradient-to-br from-red-50/80 via-rose-50/60 to-pink-50/80 dark:from-red-950/40 dark:via-rose-950/30 dark:to-pink-950/40 rounded-xl border border-red-200/50 dark:border-red-700/30 shadow-lg dark:shadow-red-900/20 hover:shadow-xl dark:hover:shadow-red-900/40 transition-all duration-300 hover:scale-[1.01] backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100/80 dark:bg-red-800/50 rounded-full p-2 group-hover/card:bg-red-200 dark:group-hover/card:bg-red-700 transition-colors">
                    <InfoIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-lg font-semibold text-red-800 dark:text-red-200">
                    Multa Factor de Potencia
                  </p>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/60 dark:bg-red-900/30 rounded-lg border border-red-200/30 dark:border-red-700/30">
                  <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Porcentaje
                  </span>
                  <span className="text-2xl font-bold text-red-800 dark:text-red-200">
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
