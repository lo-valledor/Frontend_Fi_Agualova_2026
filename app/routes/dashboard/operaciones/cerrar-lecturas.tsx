// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CerrarLecturasComponent from "~/components/operaciones/cerrar-lecturas/cerrar-lecturas-component";
import React from "react";
import type { Route } from "./+types/cerrar-lecturas";
import api from "~/lib/api";
import type { PeriodoAbierto } from "~/types/operaciones";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Cerrar Lecturas" },
    { name: "description", content: "Cerrar Lecturas" },
  ];
}

export async function clientLoader() {
  const periodoAbierto = await api.get("/ConsultarPeriodoAbierto");
  return { periodoAbierto: periodoAbierto.data as PeriodoAbierto[] };
}

export default function CerrarLecturas({ loaderData }: Route.ComponentProps) {
  const { periodoAbierto } = loaderData;
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Cerrar Lecturas" },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CerrarLecturasComponent periodoAbierto={periodoAbierto ?? []} />
    </div>
  );
}
