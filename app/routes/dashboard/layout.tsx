import React from 'react';

import { Outlet, useRouteError } from 'react-router';

import { ErrorBoundary as ErrorBoundaryComponent } from '~/components/error-boundary';
import { PermissionsDebug } from '~/components/debug/PermissionsDebug';
import { AppSidebar } from '~/components/sidebar/app-sidebar';
import { SiteHeader } from '~/components/sidebar/site-header';
import { SidebarInset } from '~/components/ui/sidebar';
import { SidebarProvider } from '~/components/ui/sidebar';

const DashboardLayout = () => {
  // Solo mostrar debug en desarrollo
  const isDev = import.meta.env.DEV;

  return (
    <SidebarProvider>
      <AppSidebar variant='inset' />
      <SidebarInset>
        <SiteHeader />
        <div className='flex flex-1 flex-col'>
          <div className='@container/main flex flex-1 flex-col gap-2'>
            <Outlet />
          </div>
        </div>
      </SidebarInset>
      {isDev && <PermissionsDebug />}
    </SidebarProvider>
  );
};

export function ErrorBoundary() {
  const error = useRouteError() as Error;
  return <ErrorBoundaryComponent error={error} />;
}

export default DashboardLayout;
