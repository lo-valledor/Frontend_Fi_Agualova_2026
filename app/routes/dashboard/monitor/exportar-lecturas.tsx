// eslint-disable no-empty-pattern
import React from "react";
import type { Route } from "./+types/exportar-lecturas";
import ExportarLecturasComponent from "~/components/monitor/exportar-lecturas-component";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Exportar Lecturas" },
    { name: "description", content: "Exportar lecturas de medidores" },
  ];
}

export default function ExportarLecturas() {
  return <ExportarLecturasComponent />;
}
