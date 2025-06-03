// eslint-disable no-empty-pattern
import React from "react";
import AcometidaComponent from "~/components/administracion/acometida/acometida-component";
import api from "~/lib/api";
import type { Acometida } from "~/types/administracion";
import type { Route } from "./+types/acometida";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Acometidas" },
    { name: "description", content: "Acometidas" },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const res = await api.post("buscar-Acometida", {
    params: {},
  });
  return {
    acometidas: res.data as Acometida[],
  };
}

export default function Acometida({ loaderData }: Route.ComponentProps) {
  const { acometidas } = loaderData;
  return (
    <div>
      <AcometidaComponent acometidas={acometidas} />
    </div>
  );
}
