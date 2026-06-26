import { useRouteError } from 'react-router';
import ContratantesComponent from '~/components/administracion/contratantes/contratantes-component';
import ContractHydrateFallback from '~/components/administracion/contratos/contract-hydrate-fallback';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';
import { administracionService } from '~/services/administracionService';
import type {
  GetContratante,
  NombreComuna,
  NombreGiro
} from '~/types/administracion';
import type { Route } from './+types/contratantes';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Agualova | Contratantes' },
    { name: 'description', content: 'Contratantes' }
  ];
}

export async function clientLoader(_args: Route.ClientActionArgs) {
  const girosResult = await administracionService.getGiros();
  const comunas: NombreComuna[] = [];

  return {
    contratantes: [] as GetContratante[],
    comunas,
    giros: (girosResult.data ?? []) as NombreGiro[]
  };
}

export default function Contratantes({
  loaderData
}: Readonly<Route.ComponentProps>) {
  const { contratantes, comunas, giros } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Contratantes' }
  ];

  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ContratantesComponent
        contratantes={contratantes}
        comunas={comunas}
        giros={giros}
      />
    </div>
  );
}

export function hydrateFallback() {
  return <ContractHydrateFallback />;
}

export function ErrorBoundary() {
  const error = useRouteError() as Error;
  return <ErrorBoundaryComponent error={error} />;
}
