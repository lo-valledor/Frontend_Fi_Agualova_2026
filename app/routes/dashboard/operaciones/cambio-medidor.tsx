import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import CambioMedidorComponent from '~/components/operaciones/cambio-medidor/cambio-medidor-component';

import type { Route } from './+types/cambio-medidor';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Cambio de Medidor' },
    { name: 'description', content: 'Cambio de Medidor' }
  ];
}

export default function CambioMedidor() {
  const pageBreadcrumbs = [
    { label: 'Operaciones' },
    { label: 'Cambio de Medidor' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CambioMedidorComponent />
    </div>
  );
}
