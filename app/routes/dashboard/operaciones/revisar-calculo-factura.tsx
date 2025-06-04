// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import RevisarCalculoFacturaComponent from "~/components/operaciones/revisar-calculo-factura/revisar-calculo-factura-component";
import React from "react";
import type { Route } from "./+types/revisar-calculo-factura";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Revisar Calculo de Factura" },
    { name: "description", content: "Revisar Calculo de Factura" },
  ];
}

export default function RevisarCalculoFactura() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Revisar Calculo de Factura" },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarCalculoFacturaComponent />
    </div>
  );
}
