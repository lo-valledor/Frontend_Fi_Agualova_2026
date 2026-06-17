/* eslint-disable no-empty-pattern */
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import CiclosFacturacionComponent from '~/components/mantencion/ciclos-facturacion/ciclos-facturacion-component';
import { MantencionHydrateFallback } from '~/components/mantencion/mantencion-hydrate-fallback';
import { mantencionService } from '~/services/mantencionService';

import type { Route } from './+types/ciclos-facturacion';

export function hydrateFallback() {
  return <MantencionHydrateFallback />;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Ciclos de Facturación' },
    {
      name: 'description',
      content: ' ciclos de facturación del sistema'
    }
  ];
}

export async function clientLoader() {
  const result = await mantencionService.getCiclosFacturacion();

  if (result.error || !result.data) {
    return { ciclosFacturacion: [] };
  }

  return { ciclosFacturacion: result.data };
}

export default function CiclosFacturacion({
  loaderData
}: Route.ComponentProps) {
  const { ciclosFacturacion } = loaderData;

  const pageBreadcrumbs = [
    { label: 'Mantención' },
    { label: 'Ciclos de Facturación' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CiclosFacturacionComponent ciclosFacturacion={ciclosFacturacion} />
    </div>
  );
}
