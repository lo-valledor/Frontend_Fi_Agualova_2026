// eslint-disable no-empty-pattern
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CrearArchivosSapComponent from "~/components/operaciones/crear-archivos-sap/crear-archivos-sap-component";
import React from "react";
import type { Route } from "./+types/crear-archivos-sap";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Crear Archivos SAP" },
    { name: "description", content: "Crear Archivos SAP" },
  ];
}

export default function CrearArchivosSAP() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Crear Archivos SAP" },
  ];

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearArchivosSapComponent />
    </div>
  );
}
