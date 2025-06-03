// eslint-disable no-empty-pattern
import React from "react";
import ContratosComponent from "~/components/administracion/contratos/contratos-component";
import type { Route } from "./+types/contratos";
import type { ContratosDisponibles } from "~/types/administracion";
import api from "~/lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Contratos" },
    { name: "description", content: "Contratos" },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const res = await api.get("contratos-disponibles");
  return {
    contratos: res.data as ContratosDisponibles[],
  };
}

export default function Contratos({ loaderData }: Route.ComponentProps) {
  const { contratos } = loaderData;
  return <ContratosComponent contratos={contratos} />;
}
