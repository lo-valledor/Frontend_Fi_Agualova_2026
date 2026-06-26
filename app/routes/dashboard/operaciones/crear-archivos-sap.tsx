import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import CrearArchivosSapComponent from '~/components/operaciones/crear-archivos-sap/crear-archivos-sap-component';
import { operacionesService } from '~/services/operacionesService';
import type { Route } from './+types/crear-archivos-sap';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Crear Archivos SAP' },
    { name: 'description', content: 'Crear Archivos SAP' }
  ];
}

export async function clientLoader() {
  const [empresasResponse, nombresResponse] = await Promise.all([
    operacionesService.getArchivoSAPEmpresas(),
    operacionesService.getNombresSugeridos()
  ]);

  return {
    empresas: empresasResponse.data ?? [],
    nombresSugeridos: nombresResponse.data,
    error: empresasResponse.error ?? nombresResponse.error
  };
}

export default function CrearArchivosSAP({ loaderData }: Route.ComponentProps) {
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Crear Archivos SAP' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CrearArchivosSapComponent {...loaderData} />
    </div>
  );
}
