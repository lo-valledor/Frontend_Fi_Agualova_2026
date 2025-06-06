// eslint-disable no-empty-pattern
import React from "react";
import CargoFacturableComponent from "~/components/administracion/cargo-facturable/cargo-facturable-component";
import type { Route } from "./+types/cargo-facturable";
import api from "~/lib/api";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Cargo Facturable" },
    { name: "description", content: "Cargo Facturable" },
  ];
}

export async function clientLoader() {
  const res = await api.get("buscarCargoFacturable");
  return res.data;
}

export default function CargoFacturable({ loaderData }: Route.ComponentProps) {
  const pageBreadcrumbs = [
    { label: "Administracion" },
    { label: "Cargo Facturable" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CargoFacturableComponent cargos={loaderData} />
    </div>
  );
}
