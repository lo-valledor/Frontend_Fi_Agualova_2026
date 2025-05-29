// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import PrepararLecturasComponent from "~/components/operaciones/preparar-lecturas/preparar-lecturas-component";
import React, { useEffect } from "react";
import type { Route } from "./+types/preparar-lecturas";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Preparar Lecturas" },
    { name: "description", content: "Preparar Lecturas" },
  ];
}

export default function PrepararLecturas() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Preparar Lecturas" },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PrepararLecturasComponent />
    </div>
  );
}
