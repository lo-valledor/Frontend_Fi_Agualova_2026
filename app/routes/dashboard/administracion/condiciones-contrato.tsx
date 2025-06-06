// eslint-disable no-empty-pattern
import React from "react";
import CondicionesContratoComponent from "~/components/administracion/condiciones-contrato-component";
import type { Route } from "./+types/condiciones-contrato";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Condiciones Contrato" },
    { name: "description", content: "Condiciones Contrato" },
  ];
}
export default function CondicionesContrato() {
  const pageBreadcrumbs = [
    { label: "Administracion" },
    { label: "Condiciones Contrato" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CondicionesContratoComponent />
    </div>
  );
}
