import React from "react";
import type { Route } from "./+types/empalmes";
import EmpalmesComponent from "~/components/mantencion/empalmes/empalmes-component";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import api from "~/lib/api";
import type { Empalme } from "~/types/mantencion";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Empalmes" },
    { name: "description", content: "Empalmes" },
  ];
}

export async function clientLoader() {
  const res = await api.get("/buscarEmpalmes");
  return {
    empalmes: res.data as Empalme[],
  };
}


export default function Empalmes({loaderData}: Route.ComponentProps) {
  const { empalmes } = loaderData;
  const pageBreadcrumbs = [
    { label: "Mantencion" },
    { label: "Empalmes" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <EmpalmesComponent empalmes={empalmes} />
    </div>
  );
}
