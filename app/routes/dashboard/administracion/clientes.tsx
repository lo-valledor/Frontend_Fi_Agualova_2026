// eslint-disable no-empty-pattern
import React from "react";
import ClientesComponent from "~/components/administracion/clientes-component";
import type { Route } from "./+types/clientes";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Clientes" },
    { name: "description", content: "Clientes" },
  ];
}

export default function Clientes() {
  return <ClientesComponent />;
}
