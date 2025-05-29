// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import RevisarPrecioComponent from "~/components/operaciones/revisar-precio/revisar-precio-component";
import React, { useEffect } from "react";
import type { Route } from "./+types/revisar-precio";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Revisar Precio" },
    { name: "description", content: "Revisar Precio" },
  ];
}

export default function RevisarPrecio() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Revisar Precio" },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarPrecioComponent />
    </div>
  );
}
