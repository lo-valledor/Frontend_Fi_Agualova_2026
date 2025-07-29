/* eslint-disable no-empty-pattern */
import { useRouteError } from 'react-router';

import ContractHydrateFallback from '~/components/administracion/contratos/contract-hydrate-fallback';
import ContratosComponent from '~/components/administracion/contratos/contratos-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/contratos';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Contratos' },
    { name: 'description', content: 'Contratos' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const result = await administracionService.getContratosData();

  if (result.error || !result.data) {
    return {
      contratos: [],
      regiones: [],
      contratosClientes: [],
      limiteInvierno: [],
      fechaActual: [],
      tipoContrato: [],
      tarifas: [],
      contratoId: [],
      contratante: [],
      propietario: [],
      local: [],
      madres: [],
      comuna: [],
    };
  }

  return result.data;
}

export default function Contratos({ loaderData }: Route.ComponentProps) {
  const {
    contratos,
    regiones,
    contratosClientes,
    limiteInvierno,
    fechaActual,
    tipoContrato,
    tarifas,
    contratante,
    propietario,
    local,
    madres,
    comuna,
  } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Contratos' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <ContratosComponent
        contratos={contratos}
        regiones={regiones}
        contratosClientes={contratosClientes}
        limiteInvierno={limiteInvierno}
        fechaActual={fechaActual}
        tipoContrato={tipoContrato}
        tarifas={tarifas}
        contratante={contratante}
        propietario={propietario}
        local={local}
        madres={madres}
        comuna={comuna}
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
