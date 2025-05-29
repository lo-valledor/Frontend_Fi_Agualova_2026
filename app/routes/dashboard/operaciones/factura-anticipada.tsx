// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import FacturaAnticipadaComponent from "~/components/operaciones/factura-anticipada/factura-anticipada-component";
import React, { useEffect } from "react";
import type { Route } from "./+types/factura-anticipada";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Factura Anticipada" },
    { name: "description", content: "Factura Anticipada" },
  ];
}
export default function FacturaAnticipada() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Factura Anticipada" },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <FacturaAnticipadaComponent />
    </div>
  );
}
