import React from "react";
import type { Route } from "./+types/nichos";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import api from "~/lib/api";
import type { Nicho } from "~/types/mantencion";
import NichosComponent from "~/components/mantencion/nichos/nichos-component";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Nichos" },
    { name: "description", content: "Nichos" },
  ];
}

export async function clientLoader() {
  const res = await api.get("/buscarNichoM");
  return {
    nichos: res.data as Nicho[],
  };
}

export default function Nichos({loaderData}: Route.ComponentProps) {
  const { nichos } = loaderData;
  const pageBreadcrumbs = [
    { label: "Mantencion" },
    { label: "Nichos" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <NichosComponent nichos={nichos} />
    </div>
  );
}
