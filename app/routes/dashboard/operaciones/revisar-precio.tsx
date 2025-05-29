import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import RevisarPrecioComponent from "~/components/operaciones/revisar-precio/revisar-precio-component";
import React, { useEffect } from "react";

export default function RevisarPrecio() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Revisar Precio" },
  ];

  useEffect(() => {
    document.title = "Revisar Precio";
  }, []);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <RevisarPrecioComponent />
    </div>
  );
}
