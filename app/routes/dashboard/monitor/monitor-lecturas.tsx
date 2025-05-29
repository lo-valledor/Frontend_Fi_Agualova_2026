// eslint-disable no-empty-pattern
import React from "react";
import type { Route } from "./+types/monitor-lecturas";
import MonitorLecturasComponent from "~/components/monitor/monitor-lecturas-component";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Enerlova | Monitor Lecturas" },
    { name: "description", content: "Monitoreo de lecturas de medidores" },
  ];
}

export default function MonitorLecturasPage() {
  return <MonitorLecturasComponent />;
}
