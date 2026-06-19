/* eslint-disable no-empty-pattern */
import { lazy, Suspense } from 'react';

import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { DataTableSkeleton } from '~/components/skeletons';
import { administracionService } from '~/services/administracionService';

import type { Route } from './+types/acometida';

// Lazy load del componente pesado (36 KB)
const AcometidaComponent = lazy(
  () => import('~/components/administracion/acometida/acometida-component')
);

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Agualova | Acometidas' },
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
      <Suspense fallback={<DataTableSkeleton columns={7} />}>
        <AcometidaComponent
          acometidas={acometidas}
          comboEmpalmes={comboEmpalmes}
          comboNichos={comboNichos}
          comboSectores={comboSectores}
          contratosDisponibles={contratosDisponibles}
        />
      </Suspense>
    </div>
  );
}

export function hydrateFallback() {
  return <DataTableSkeleton columns={7} />;
}
