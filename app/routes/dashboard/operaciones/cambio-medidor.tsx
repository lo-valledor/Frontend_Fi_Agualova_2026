// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CambioMedidorComponent from "~/components/operaciones/cambio-medidor/cambio-medidor-component";
import React from "react";
import type { Route } from "./+types/cambio-medidor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Cambio de Medidor" },
    { name: "description", content: "Cambio de Medidor" },
  ];
}

export default function CambioMedidor() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Cambio de Medidor" },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CambioMedidorComponent />
    </div>
  );
}
