/* eslint-disable no-empty-pattern */
import React from 'react';
import type { Route } from './+types/usuarios';
import UsuariosComponent from '~/components/administracion/usuarios/usuarios-component';
import { BreadcrumbSetter } from '~/components/breadcrumb-setter';
import api from '~/lib/api';
import { useLoaderData } from 'react-router';
import type { Usuarios } from '~/types/administracion';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Enerlova | Usuarios' },
    { name: 'description', content: 'Gestión de usuarios del sistema' },
  ];
}

export async function clientLoader() {
  const usuarios = await api.get('listar');
  return { usuarios: usuarios.data as Usuarios[] };
}

export default function Usuarios() {
  const { usuarios } = useLoaderData<typeof clientLoader>();
  const pageBreadcrumbs = [{ label: 'Administracion' }, { label: 'Usuarios' }];
  return (
    <div>
      <BreadcrumbSetter items={pageBreadcrumbs} />
      <UsuariosComponent usuarios={usuarios} />
    </div>
  );
}
