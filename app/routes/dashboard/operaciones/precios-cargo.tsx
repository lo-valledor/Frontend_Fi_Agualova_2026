import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import PreciosCargoComponent from "~/components/operaciones/precios-cargo/precios-cargo-component";
import React, { useEffect } from "react";

export default function PreciosCargo() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Precios de Cargo" },
  ];

  useEffect(() => {
    document.title = "Precios de Cargo";
  }, []);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <PreciosCargoComponent />
    </div>
  );
}
