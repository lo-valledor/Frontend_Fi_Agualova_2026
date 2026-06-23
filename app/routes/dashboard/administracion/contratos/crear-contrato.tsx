import CrearContratoComponent from "~/components/administracion/contratos/route/crear-contrato-component";
import { BreadcrumbSetter } from "~/components/breadcrumb-setter";

export function meta() {
  return [
    { title: "Agualova | Crear Contrato" },
    { name: "description", content: "Crear un nuevo contrato" },
  ];
}

export default function CrearContrato() {
  const pageBreadcrumbs = [
    { label: "Administración" },
    { label: "Contratos" },
    { label: "Crear" },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearContratoComponent />
    </div>
  );
}
