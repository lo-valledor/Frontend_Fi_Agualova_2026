// eslint-disable no-empty-pattern
import React from "react";
import CargoFacturableComponent from "~/components/administracion/cargo-facturable-component";
import type { Route } from "./+types/cargo-facturable";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Cargo Facturable" },
    { name: "description", content: "Cargo Facturable" },
  ];
}
export default function CargoFacturable() {
  return <CargoFacturableComponent />;
}
