import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import ContratoDetailComponent from '~/components/reportes/consultar-contrato/contrato-detail-component';
import { reportesService } from '~/services/reportesService';

import type { Route } from './+types/contrato';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Consulta Contrato' },
    { name: 'description', content: 'Consulta de Contrato' }
  ];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const result = await reportesService.getConsultaContratoById(
    Number((params as { contratoId: string }).contratoId)
  );

  if (result.error || !result.data) {
    return {
      contrato: null,
      error: new Error(result.error || 'Error al cargar el contrato')
    };
  }

  return {
    contrato: result.data,
    error: null
  };
}

export default function ContratoDetalle({ loaderData }: Route.ComponentProps) {
  const pageBreadcrumbs = [{ label: 'Reportes' }, { label: 'Contrato' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ContratoDetailComponent {...loaderData} />
    </div>
  );
}
