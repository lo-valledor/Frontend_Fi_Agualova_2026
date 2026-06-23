import EditarContratoComponent from '~/components/administracion/contratos/route/editar-contrato-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import type { Route } from './+types/editar-contrato';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Contrato - Editar' },
    { name: 'description', content: 'Editar contrato' }
  ];
}

export default function EditarContrato({ params }: Route.ComponentProps) {
  const pageBreadcrumbs = [
    { label: 'Administración' },
    { label: 'Contratos' },
    { label: 'Editar' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <EditarContratoComponent id={params.id} />
    </div>
  );
}
