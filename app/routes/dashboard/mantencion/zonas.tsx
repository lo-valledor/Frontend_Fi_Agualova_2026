import React from "react";
import type { Route } from "./+types/zonas";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import api from "~/lib/api";
import type { Zonas } from "~/types/mantencion";
import ZonasComponent from "~/components/mantencion/zonas/zonas-component";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Zonas" },
    { name: "description", content: "Zonas" },
  ];
}

export async function clientLoader() {
  const res = await api.get("/buscarZona");
  return {
    zonas: res.data as Zonas[],
  };
}


export default function Zonas({loaderData}: Route.ComponentProps) {
  const { zonas } = loaderData;
  const pageBreadcrumbs = [
    { label: "Mantencion" },
    { label: "Empalmes" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ZonasComponent zonas={zonas} />
    </div>
  );
}
