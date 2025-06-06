// eslint-disable no-empty-pattern
import React from "react";
import CargoTipoContratoComponent from "~/components/administracion/cargo-tipo-contrato-component";
import type { Route } from "./+types/cargo-tipo-contrato";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Cargo Tipo Contrato" },
    { name: "description", content: "Cargo Tipo Contrato" },
  ];
}
export default function CargoTipoContrato() {
  const pageBreadcrumbs = [
    { label: "Administracion" },
    { label: "Cargo Tipo Contrato" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CargoTipoContratoComponent />
    </div>
  );
}
