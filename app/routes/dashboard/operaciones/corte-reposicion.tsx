/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import CorteReposicionComponent from '~/components/operaciones/corte-reposicion/corte-reposicion-component';
import type { Route } from './+types/corte-reposicion';
import type {
  ConsultarMantenedorRevisionCorte,
  TotalesCorteReposicion,
} from '~/types/operaciones';
import api from '~/lib/api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Corte y Reposición' },
    { name: 'description', content: 'Corte y Reposición' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const res = await api.get('consulta-registros-revision?acometida=0');
  const resCorte = await api.get('consulta-mantenedor-revision-corte');
  return {
    totalesData: res.data as TotalesCorteReposicion[],
    mantenedorCorteData: resCorte.data as ConsultarMantenedorRevisionCorte[],
  };
}

export default function CorteReposicion({ loaderData }: Route.ComponentProps) {
  const { totalesData, mantenedorCorteData } = loaderData;

  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Corte y Reposición' },
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CorteReposicionComponent
        totalesData={totalesData}
        mantenedorCorteData={mantenedorCorteData}
      />
    </div>
  );
}
