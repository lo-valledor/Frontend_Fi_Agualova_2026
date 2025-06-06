import React from "react";
  import type { Route } from "./+types/sector";
import api from "~/lib/api";
import type { Sectores } from "~/types/mantencion";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import SectorComponent from "~/components/mantencion/sector/sector-component";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Sector" },
    { name: "description", content: "Sector" },
  ];
}

export async function clientLoader() {
  const res = await api.get("/buscarSector");
  return {
    sectores: res.data as Sectores[],
  };
}

export default function Sector({loaderData}: Route.ComponentProps) {
  const { sectores } = loaderData;
  const pageBreadcrumbs = [
    { label: "Mantencion" },
    { label: "Sector" },
  ];
  return <div>
    <BreadcrumbSetter items={pageBreadcrumbs} />
    <SectorComponent sectores={sectores} />
  </div>;
}
