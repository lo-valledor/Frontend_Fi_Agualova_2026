// eslint-disable no-empty-pattern
import React from "react";
import ContratosComponent from "~/components/administracion/contratos/contratos-component";
import type { Route } from "./+types/contratos";
import type { GetContratos } from "~/types/administracion";
import api from "~/lib/api";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Contratos" },
    { name: "description", content: "Contratos" },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const res = await api.get("contrato/buscar");
  return {
    contratos: res.data as GetContratos[],
  };
}

export default function Contratos({ loaderData }: Route.ComponentProps) {
  const { contratos } = loaderData;
  const pageBreadcrumbs = [
    { label: "Administracion" },
    { label: "Contratos" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ContratosComponent contratos={contratos} />
    </div>
  );
}
