// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import PreciosCargoComponent from "~/components/operaciones/precios-cargo/precios-cargo-component";
import React from "react";
import type { Route } from "./+types/precios-cargo";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Precios de Cargo" },
    { name: "description", content: "Precios de Cargo" },
  ];
}

export default function PreciosCargo() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Precios de Cargo" },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PreciosCargoComponent />
    </div>
  );
}
