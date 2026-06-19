import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import AbrirPeriodoFacturacion from '~/components/operaciones/periodo-facturacion/periodo-facturacion-component';
import { operacionesService } from '~/services/operacionesService';
import type { PeriodosBuscarRequest } from '~/types/operaciones';
import type { Route } from './+types/periodo-facturacion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Periodos de Facturación' },
    { name: 'description', content: 'Periodos de Facturación' }
  ];
}

export async function clientLoader() {
  const result = await operacionesService.getPeriodoAbierto();

  if (result.error || !result.data) {
    return {
      data: result.data as PeriodosBuscarRequest[]
    };
  }

  return result.data;
}

export default function PeriodoFacturacion({
  loaderData
}: Route.ComponentProps) {
  const { years, periodos } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Periodos de Facturación' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <AbrirPeriodoFacturacion years={years} periodos={periodos} error={null} />
    </div>
  );
}
