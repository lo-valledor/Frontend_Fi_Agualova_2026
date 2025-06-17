// eslint-disable no-empty-pattern
import React from 'react';
import AcometidaComponent from '~/components/administracion/acometida/acometida-component';
import api from '~/lib/api';
import type {
  Acometida,
  ComboEmpalmes,
  ComboNichos,
  ComboSectores,
  ContratosDisponibles,
} from '~/types/administracion';
import type { Route } from './+types/acometida';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Acometidas' },
    { name: 'description', content: 'Acometidas' },
  ];
}

export async function clientLoader({}: Route.ClientActionArgs) {
  const resAcometidas = await api.get('buscar-Acometida', { params: {} });
  const resComboEmpalmes = await api.get('combo-empalmes');
  const resComboNichos = await api.get('combo-nichos');
  const resComboSectores = await api.get('combo-sectores');
  const resContratosDisponibles = await api.get('contratos-disponibles');

  return {
    acometidas: resAcometidas.data as Acometida[],
    comboEmpalmes: resComboEmpalmes.data as ComboEmpalmes[],
    comboNichos: resComboNichos.data as ComboNichos[],
    comboSectores: resComboSectores.data as ComboSectores[],
    contratosDisponibles:
      resContratosDisponibles.data as ContratosDisponibles[],
  };
}

export default function Acometida({ loaderData }: Route.ComponentProps) {
  const {
    acometidas,
    comboEmpalmes,
    comboNichos,
    comboSectores,
    contratosDisponibles,
  } = loaderData;
  const pageBreadcrumbs = [
    { label: 'Administracion' },
    { label: 'Acometidas' },
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
