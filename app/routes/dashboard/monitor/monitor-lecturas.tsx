import { lazy, Suspense } from "react";

import { MonitorLecturasSkeleton } from "~/components/skeletons";
import { monitorService } from "~/services/monitorService";
import type { MonitorSectores } from "~/types/monitor";

import type { Route } from "./+types/monitor-lecturas";

const MonitorLecturasComponent = lazy(
  () => import("~/components/monitor/monitor-lecturas-component"),
);

export function hydrateFallback() {
  return <MonitorLecturasSkeleton />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Agualova | Monitor Lecturas" },
    { name: "description", content: "Monitoreo de lecturas de medidores" },
  ];
}

export async function clientLoader() {
  const result = await monitorService.getBasicData();

  if (result.error || !result.data) {
    return {
      periodos: [],
      sectores: [] as MonitorSectores[],
      claves: [],
      activePeriodoId: null,
      error: new Error(result.error || "Error al cargar datos"),
    };
  }

  let sectores: MonitorSectores[] = [];
  if (result.data.activePeriodoId !== null) {
    const sectoresResult = await monitorService.getSectoresByPeriodo(
      result.data.activePeriodoId,
    );
    if (sectoresResult.data) {
      sectores = sectoresResult.data;
    }
  }

  return {
    periodos: result.data.periodos,
    sectores,
    claves: result.data.claves,
    activePeriodoId: result.data.activePeriodoId,
    error: null,
  };
}

export default function MonitorLecturasPage({
  loaderData,
}: Route.ComponentProps) {
  return (
    <Suspense fallback={<MonitorLecturasSkeleton />}>
      <MonitorLecturasComponent {...loaderData} />
    </Suspense>
  );
}
