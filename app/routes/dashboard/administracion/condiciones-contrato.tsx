/* eslint-disable no-empty-pattern */
import { AdministracionHydrateFallback } from '~/components/administracion/administracion-hydrate-fallback';
import CondicionesContratoComponent from '~/components/administracion/condiciones-contrato/condiciones-contrato-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/condiciones-contrato';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Condiciones Contrato' },
    { name: 'description', content: 'Condiciones Contrato' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const result = await administracionService.getCondicionesContratoData();

  if (result.error || !result.data) {
    return {
      condicionesContrato: [],
      conceptos: [],
    };
  }

  return result.data;
}

export default function CondicionesContrato({
  loaderData,
}: Route.ComponentProps) {
  const { condicionesContrato, conceptos } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Condiciones Contrato' },
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <CondicionesContratoComponent
        condicionesContrato={condicionesContrato}
        conceptos={conceptos}
      />
    </div>
  );
}

export function hydrateFallback() {
  return <AdministracionHydrateFallback />;
}
