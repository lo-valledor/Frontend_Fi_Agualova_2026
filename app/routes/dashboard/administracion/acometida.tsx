/* eslint-disable no-empty-pattern */
import AcometidaComponent from '~/components/administracion/acometida/acometida-component';
import { AdministracionHydrateFallback } from '~/components/administracion/administracion-hydrate-fallback';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/acometida';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Acometidas' },
    { name: 'description', content: 'Acometidas' }
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const result = await administracionService.getAcometidasData();

  if (result.error || !result.data) {
    return {
      acometidas: [],
      comboEmpalmes: [],
      comboNichos: [],
      comboSectores: [],
      contratosDisponibles: []
    };
  }

  return result.data;
}

export default function Acometida({ loaderData }: Route.ComponentProps) {
  const {
    acometidas,
    comboEmpalmes,
    comboNichos,
    comboSectores,
    contratosDisponibles
  } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Acometidas' }
  ];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <AcometidaComponent
        acometidas={acometidas}
        comboEmpalmes={comboEmpalmes}
        comboNichos={comboNichos}
        comboSectores={comboSectores}
        contratosDisponibles={contratosDisponibles}
      />
    </div>
  );
}

export function hydrateFallback() {
  return <AdministracionHydrateFallback />;
}
