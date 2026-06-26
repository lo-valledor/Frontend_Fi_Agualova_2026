/* eslint-disable no-empty-pattern */
import { AdministracionHydrateFallback } from '~/components/administracion/administracion-hydrate-fallback';
import CondicionesContratoComponent from '~/components/administracion/condiciones-contrato/condiciones-contrato-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';
import type { CondicionesContratoRow } from '~/types/administracion';
import type { Concepto as ConceptoMantencion } from '~/types/mantencion';

import type { Route } from './+types/condiciones-contrato';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Condiciones Contrato' },
    { name: 'description', content: 'Condiciones Contrato' }
  ];
}

type CondicionesContratoLoaderData = {
  condicionesContrato: CondicionesContratoRow[];
  conceptos: ConceptoMantencion[];
};

export async function clientLoader({}: Route.ClientActionArgs) {
  const result = await administracionService.getCondicionesContratoData();

  if (result.error || !result.data) {
    return {
      condicionesContrato: [],
      conceptos: []
    } satisfies CondicionesContratoLoaderData;
  }

  const data: CondicionesContratoLoaderData = {
    condicionesContrato: result.data.condicionesContrato,
    conceptos: result.data.conceptos as unknown as ConceptoMantencion[]
  };

  return data;
}

export default function CondicionesContrato({
  loaderData
}: Readonly<Route.ComponentProps>) {
  const { condicionesContrato, conceptos } =
    loaderData as unknown as CondicionesContratoLoaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Condiciones Contrato' }
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
