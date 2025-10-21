/* eslint-disable no-empty-pattern */
import { lazy, Suspense } from 'react';
import { useRevalidator } from 'react-router';

import { DataTableSkeleton } from '~/components/skeletons';
import { rolesPermisosService } from '~/services/rolesPermisosService';

import type { Route } from './+types/roles-permisos';

// Lazy load del componente pesado (35 KB)
const RolesPermisosComponent = lazy(() =>
  import('~/components/configuracion/roles-permisos/roles-permisos-component')
);

export function meta(_args: Route.MetaArgs) {
  return [
    {
      title: 'Enerlova | Roles y Permisos',
      description: 'Gestión de roles y permisos del sistema.'
    }
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    // Cargar roles y menús en paralelo
    const [rolesResponse, menusResponse] = await Promise.all([
      rolesPermisosService.getRoles(),
      rolesPermisosService.getMenus()
    ]);

    if (rolesResponse.error || menusResponse.error) {
      return {
        roles: [],
        menus: [],
        permisos: [],
        error: new Error(
          rolesResponse.error || menusResponse.error || 'Error al cargar datos'
        )
      };
    }

    const roles = rolesResponse.data || [];
    const menus = menusResponse.data || [];

    // Cargar permisos para todos los roles
    let allPermisos: any[] = [];
    if (roles.length > 0) {
      const permisosPromises = roles.map(rol =>
        rolesPermisosService.getMenusPorRol(rol.idRol)
      );

      const permisosResponses = await Promise.all(permisosPromises);
      allPermisos = permisosResponses.flatMap(response => response.data || []);
    }

    return {
      roles,
      menus,
      permisos: allPermisos,
      error: null
    };
  } catch (error) {
    console.error('Error en clientLoader de roles y permisos:', error);
    return {
      roles: [],
      menus: [],
      permisos: [],
      error: new Error(
        error instanceof Error ? error.message : 'Error desconocido'
      )
    };
  }
}

export default function RolesPermisos({ loaderData }: Route.ComponentProps) {
  const revalidator = useRevalidator();

  const handleDataChange = () => {
    revalidator.revalidate();
  };

  return (
    <Suspense fallback={<DataTableSkeleton columns={4} rows={8} />}>
      <RolesPermisosComponent
        roles={loaderData?.roles || []}
        menus={loaderData?.menus || []}
        permisos={loaderData?.permisos || []}
        error={loaderData?.error || null}
        onDataChange={handleDataChange}
      />
    </Suspense>
  );
}

export function hydrateFallback() {
  return <DataTableSkeleton columns={4} rows={8} />;
}
