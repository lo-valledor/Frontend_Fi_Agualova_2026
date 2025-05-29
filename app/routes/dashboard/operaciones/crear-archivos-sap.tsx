import { BreadcrumbSetter } from "~/components/breadcrumb-setter";
import CrearArchivosSapComponent from "~/components/operaciones/crear-archivos-sap/crear-archivos-sap-component";
import React, { useEffect } from "react";

export default function CrearArchivosSAP() {
  const pageBreadcrumbs = [
    { label: "Operaciones" },
    { label: "Crear Archivos SAP" },
  ];

  useEffect(() => {
    document.title = "Crear Archivos SAP";
  }, []);

  return (
    <div className="container mx-auto p-3 md:p-6 space-y-6">
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearArchivosSapComponent />
    </div>
  );
}
