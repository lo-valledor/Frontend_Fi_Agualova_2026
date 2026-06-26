import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import AnularFacturaImpresaComponent from '~/components/operaciones/anular-factura-impresa/anular-factura-impresa-component';

import type { Route } from './+types/anular-factura-impresa';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Anular Factura Impresa' },
    { name: 'description', content: 'Anular Factura Impresa' }
  ];
}

export default function AnularFacturaImpresa() {
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Anular Factura Impresa' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <AnularFacturaImpresaComponent />
    </div>
  );
}
