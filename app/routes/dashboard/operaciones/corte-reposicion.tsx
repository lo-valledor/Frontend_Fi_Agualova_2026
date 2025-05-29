// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CorteReposicionComponent from "~/components/operaciones/corte-reposicion/corte-reposicion-component";
import React, { useEffect } from "react";
import type { Route } from "./+types/corte-reposicion";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Corte y Reposición" },
    { name: "description", content: "Corte y Reposición" },
  ];
}

export default function CorteReposicion() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Corte y Reposición" },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CorteReposicionComponent />
    </div>
  );
}
