// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CerrarLecturasComponent from "~/components/operaciones/cerrar-lecturas/cerrar-lecturas-component";
import React from "react";
import type { Route } from "./+types/cerrar-lecturas";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Cerrar Lecturas" },
    { name: "description", content: "Cerrar Lecturas" },
  ];
}

export default function CerrarLecturas() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Cerrar Lecturas" },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CerrarLecturasComponent />
    </div>
  );
}
