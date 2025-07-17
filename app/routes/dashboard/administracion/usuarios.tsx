 
import React from 'react';
import UsuariosComponent from '~/components/administracion/usuarios/usuarios-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import { administracionService } from '~/services/administracionService';
import type { Usuarios } from '~/types/administracion';

interface LoaderData {
  usuarios: Usuarios[];
}

export function meta() {
  return [
    { title: 'Enerlova | Usuarios' },
    { name: 'description', content: 'Gestión de usuarios del sistema' },
  ];
}

export async function clientLoader(): Promise<LoaderData> {
  const result = await administracionService.getUsuarios();

  if (result.error || !result.data) {
    return { usuarios: [] };
  }

  return { usuarios: result.data };
}

export default function Usuarios({ loaderData }: { loaderData: LoaderData }) {
  const { usuarios } = loaderData;
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Usuarios' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <UsuariosComponent usuarios={usuarios} />
    </div>
  );
}
