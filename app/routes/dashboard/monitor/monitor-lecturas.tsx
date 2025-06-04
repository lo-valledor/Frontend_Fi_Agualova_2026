// eslint-disable no-empty-pattern
import React from "react";
import type { Route } from "./+types/monitor-lecturas";
import MonitorLecturasComponent from "~/components/monitor/monitor-lecturas-component";
import { loadMonitorData } from "~/hooks/use-monitor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Monitor Lecturas" },
    { name: "description", content: "Monitoreo de lecturas de medidores" },
  ];
}

export async function clientLoader() {
  try {
    const data = await loadMonitorData();
    return {
      ...data,
      error: null,
    };
  } catch (error: any) {
    console.error("Error al cargar datos del monitor:", error);

    // Retornar datos vacíos con error para que el componente pueda manejar el error
    return {
      periodos: [],
      sectores: [],
      claves: [],
      activePeriodoId: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export default function MonitorLecturasPage({
  loaderData,
}: Route.ComponentProps) {
  return <MonitorLecturasComponent {...loaderData} />;
}
