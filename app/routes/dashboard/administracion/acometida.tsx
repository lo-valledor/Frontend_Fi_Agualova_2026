/* eslint-disable no-empty-pattern */
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
  const resComboEmpalmes = await api.get('combo-empalmes-Acometida');
  const resComboNichos = await api.get('combo-nichos');
  const resComboSectores = await api.get('combo-sectores');
  const resContratosDisponibles = await api.get('contratos-disponibles');

  let acometidas: Acometida[] = [];
  let comboEmpalmes: ComboEmpalmes[] = [];
  let comboNichos: ComboNichos[] = [];
  let comboSectores: ComboSectores[] = [];
  let contratosDisponibles: ContratosDisponibles[] = [];

  if (
    resAcometidas.data &&
    typeof resAcometidas.data === 'object' &&
    'data' in resAcometidas.data &&
    Array.isArray((resAcometidas.data as { data: Acometida[] }).data)
  ) {
    acometidas = (resAcometidas.data as { data: Acometida[] }).data;
  } else if (Array.isArray(resAcometidas.data)) {
    acometidas = resAcometidas.data;
  }

  if (
    resComboEmpalmes.data &&
    typeof resComboEmpalmes.data === 'object' &&
    'data' in resComboEmpalmes.data &&
    Array.isArray((resComboEmpalmes.data as { data: ComboEmpalmes[] }).data)
  ) {
    comboEmpalmes = (resComboEmpalmes.data as { data: ComboEmpalmes[] }).data;
  } else if (Array.isArray(resComboEmpalmes.data)) {
    comboEmpalmes = resComboEmpalmes.data;
  }

  if (
    resComboNichos.data &&
    typeof resComboNichos.data === 'object' &&
    'data' in resComboNichos.data &&
    Array.isArray((resComboNichos.data as { data: ComboNichos[] }).data)
  ) {
    comboNichos = (resComboNichos.data as { data: ComboNichos[] }).data;
  } else if (Array.isArray(resComboNichos.data)) {
    comboNichos = resComboNichos.data;
  }

  if (
    resComboSectores.data &&
    typeof resComboSectores.data === 'object' &&
    'data' in resComboSectores.data &&
    Array.isArray((resComboSectores.data as { data: ComboSectores[] }).data)
  ) {
    comboSectores = (resComboSectores.data as { data: ComboSectores[] }).data;
  } else if (Array.isArray(resComboSectores.data)) {
    comboSectores = resComboSectores.data;
  }

  if (
    resContratosDisponibles.data &&
    typeof resContratosDisponibles.data === 'object' &&
    'data' in resContratosDisponibles.data &&
    Array.isArray(
      (resContratosDisponibles.data as { data: ContratosDisponibles[] }).data,
    )
  ) {
    contratosDisponibles = (
      resContratosDisponibles.data as { data: ContratosDisponibles[] }
    ).data;
  } else if (Array.isArray(resContratosDisponibles.data)) {
    contratosDisponibles = resContratosDisponibles.data;
  }

  return {
    acometidas,
    comboEmpalmes,
    comboNichos,
    comboSectores,
    contratosDisponibles,
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
